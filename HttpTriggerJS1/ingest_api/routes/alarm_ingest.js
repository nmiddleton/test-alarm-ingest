'use strict';

const
    publisher = require('../tasks/publisher'),
    validator = require('../tasks/validator'),
    Converter = require('../tasks/converter');

exports.ingest = function (req, res) {

    let validation = validator(req.body);

    let converter = new Converter();

    if (!validation.valid) {
        console.log('Validation Error:' + JSON.stringify(validation));
        res.status(400).json({
            ingested: false,
            message: "Alarm validation error",
            message_details: validation.errors,
            alarm_schema: validation.alarm_schema,
            alarm_schema_version: validation.alarm_schema_version
        });
    } else {
        converter.convertToCam(req.body,validation.alarm_schema,validation.alarm_schema_version)
            .then(function (converted) {
                return publisher.SendToCam(converted)
                    .then(function () {
                        res.status(200).json({
                            ingested: true,
                            message: "Alarm ingested and sent to CAM",
                            alarm_schema: validation.alarm_schema,
                            alarm_schema_version: validation.alarm_schema_version
                        });
                    })
            })
            .catch(function (error) {
                console.log('Error:' + error);
                res.status(400).json({
                    ingested: false,
                    message: "Alarm ingest error",
                    message_details: error
                });
            });

    }
};
