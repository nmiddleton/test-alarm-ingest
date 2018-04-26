'use strict';

const   rp = require('request-promise'),
        _ = require('lodash');

function Tagger() {
    var subs_apiver = '2018-02-01';

    var getToken = function (resource, apiver, context) {
            context.log('Getting Token...');
            var options = {
                uri: process.env["MSI_ENDPOINT"] + '/?resource=' + resource + '&api-version=' + apiver,
                headers: {
                    'Secret': process.env["MSI_SECRET"]
                }
            };
            return rp(options);
        },
        readResourceGroups = function (resource_group_metadata, apiver, token) {
            context.log('Getting Tags for subscription:', resource_group_metadata.resource_group_name, resource_group_metadata.subscription_id);
            var options = {
                uri: 'https://management.azure.com/subscriptions/' + resource_group_metadata.subscription_id + '/resourcegroups?api-version=' + apiver,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
            return rp(options);
        },
        getAzureRG = function (event) {
            return {
                resource_group_name: event.context.resourceGroupName,
                subscription_id: event.context.subscriptionId
            };
        },
        getTags = function (event, context) {
            var tags = {},
                resource_group_metadata = getAzureRG(event);
            return getToken('https://management.azure.com/', '2017-09-01', context)
                .then(function (result) {
                    var token = JSON.parse(result).access_token;
                    context.log('Got token:', token);
                    return readResourceGroups(resource_group_metadata, subs_apiver, token)
                        .then(function (tag_response) {
                            var rgs = JSON.parse(tag_response).value;
                            context.log('Got rgs:', rgs);
                            var specific_rg = _.find(rgs, function (rg) {
                                return rg.name.toLowerCase() === resource_group_metadata.resource_group_name.toLowerCase();
                            });
                            if (! _.isUndefined(specific_rg)) {
                                context.log('Setting tags from event rg:', tags);
                                tags = _.get(specific_rg, 'tags');
                            }
                            if (_.isUndefined(specific_rg) || _.isEqual( tags, {})) {
                            // RG or tags not found. Try to get the tags from any available rg returned
                                var tags_not_found = true;
                                _.forEach(rgs, function (rg) {
                                    if (_.has(rg, 'tags') && tags_not_found) {
                                        tags = _.get(rg, 'tags');
                                        context.log('Setting any tags found:', tags);
                                        tags_not_found = false;
                                    }
                                });
                            }
                            return tags;
                        })
                        .catch(function (err) {
                            context.log('Error', err);
                            return tags;
                        });
                });
        };
       // context.log('JavaScript timer trigger function ran!:', timeStamp);

    // context.done();
    return {
        getTags: getTags,
        getSubId: getAzureRG
    }


}
module.exports = Tagger;