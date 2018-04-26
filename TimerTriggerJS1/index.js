const rp = require('request-promise');
module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString(),
        subscription = '32c4b0ff-af38-4b6f-8efc-d70cd1276b00',
        subs_apiver='2018-02-01';

    if(myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    const getToken = function (resource, apiver) {
            context.log('Getting Token...');
            var options = {
                uri: process.env["MSI_ENDPOINT"] + '/?resource=' + resource + '&api-version=' + apiver,
                headers: {
                    'Secret': process.env["MSI_SECRET"]
                }
            };
            return rp(options);
        },
        readResourceGroups = function (subscription, apiver, token) {
            context.log('Getting Tags fod subscription:', subscription);
            var options = {
                uri: 'https://management.azure.com/subscriptions/' + subscription + '/resourcegroups?api-version=' + apiver,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
            return rp(options);
        };
    var tags  = getToken('https://management.azure.com/', '2017-09-01', context)
        .then(function (result) {
            var token = JSON.parse(result).access_token;
            context.log('Got token:', token);
            return readResourceGroups(subscription, subs_apiver, token)
                .then(function (tag_response) {
                    var rgs = JSON.parse(tag_response).value;
                    context.log('Got rgs:', rgs);
                    var tags;
                    for (var i = 0; i < rgs.length; i++) {
                        var rg = rgs[i];
                        if (rg.hasOwnProperty('tags')) {
                            context.log('Has tags:', rgs[i]['tags']);
                            tags = rg['tags'];
                        }
                    }
                    if(!!tags){
                        context.log('resolved:', tags);
                        return tags;
                    } else {
                        context.log('rejected:');
                        throw new Error ('Tags could not be found in resource group', tag_response);
                    }
                })
                .catch(function (err) {
                    context.log('Error', err);
                });
        });
    context.log('JavaScript timer trigger function ran!:', timeStamp);

    context.done();
};