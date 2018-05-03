"use strict";
var configurationService = require("./configurationService");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
var common = require("../../common/common");
const ServiceID = "364";
const ServiceConfig_ID= "363";
const BranchID = "106";
const AutoNext = "EnableAutoNext";
should.toString();

describe('Configration Service', function () {
    it('Initialize Configration Service successfully', async function () {
        let result = await configurationService.initialize();
        (result === common.success).should.true();
    });
    it('Get Service successfully', async function () {
        let Service = await configurationService.getService(ServiceID);
        (Service != undefined).should.true();
    });
    it('Get Service Config successfully', async function () {
        let ServiceConfig = await configurationService.getServiceConfig(ServiceConfig_ID);
        (ServiceConfig != undefined).should.true();
    });

    it('Get Service Config from ServiceID successfully', async function () {
        let ServiceConfig = await configurationService.getServiceConfigFromService(ServiceID);
        (ServiceConfig != undefined).should.true();
    });
    it('Get common Config successfully', async function () {
        let commonConfig = await configurationService.getCommonSettings(BranchID,AutoNext);
        (commonConfig != undefined).should.true();
    });    
});