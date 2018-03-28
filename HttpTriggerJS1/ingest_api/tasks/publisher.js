'use strict';

const
    library = require('../lib/index'),
    moment  = require('moment'),
    _       = require('lodash');

function SendToCam (cam_message) {
    let options = {
        path: '/monitor/alarms/ingestion/alarm_api/v2/events',
        hostname: '10.54.131.117', //TODO: Replace wth FQDN when Shared Services DCHP issue resolved.
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Host': 'api.compass.int.thomsonreuters.com' //TODO: Remove this line when Shared Services DCHP issue resolved.
        }
    };


    let stringified_alarm = JSON.stringify(cam_message);

    options.headers['Content-Length'] = stringified_alarm.length;

    return library.http_request(options, stringified_alarm);
}

module.exports.SendToCam = SendToCam;