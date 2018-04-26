'use strict';

const
    root = '../../../../',

    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai'),

    Tagger = require(root + 'HttpTriggerJS1/ingest_api/tasks/tagger.js');

chai.use(sinonChai);

describe('tagger', function () {

    let sandbox, tagger;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        tagger = new Tagger();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Gets the subscription from an Azure alarm', function () {
        let azure_alarm = {
            status: 'Resolved',
            context: {
                condition: {
                    metricName: 'CPU idle time',
                    metricUnit: 'Percent',
                    metricValue: '99',
                    threshold: '99',
                    windowSize: '5',
                    timeAggregation: 'Average',
                    operator: 'GreaterThan'
                },
                resourceName: 'compasstestvm',
                resourceType: 'microsoft.compute/virtualmachines',
                resourceRegion: 'centralus',
                portalLink: 'https://portal.azure.com/#resource/subscriptions/de02a256-5327-4bda-a301-ad8165a9a7f5/resourceGroups/centralus-ComALMgm/providers/Microsoft.Compute/virtualMachines/compasstestvm',
                timestamp: '2017-01-16T15:08:06.7768750Z',
                id: '/subscriptions/de02a256-5327-4bda-a301-ad8165a9a7f5/resourceGroups/centralus-ComALMgm/providers/microsoft.insights/alertrules/compass_cpu_idle_test',
                name: 'compass_cpu_idle_test',
                description: 'Test cpu idle alarm',
                conditionType: 'Metric',
                subscriptionId: 'de02a256-5327-4bda-a301-ad8165a9a7f5',
                resourceId: '/subscriptions/de02a256-5327-4bda-a301-ad8165a9a7f5/resourceGroups/centralus-ComALMgm/providers/Microsoft.Compute/virtualMachines/compasstestvm',
                resourceGroupName: 'centralus-ComALMgm'
            },
            properties: {'$type': 'Microsoft.WindowsAzure.Management.Common.Storage.CasePreservedDictionary`1[[System.String, mscorlib]], Microsoft.WindowsAzure.Management.Common.Storage'}
        };

        let expected_response = {
            subscription_id: 'de02a256-5327-4bda-a301-ad8165a9a7f5'
        };
        console.log(JSON.stringify(tagger,null,4));

        let response = tagger.getSubId(azure_alarm);

        expect(response).to.deep.equal(expected_response);
    });
});
