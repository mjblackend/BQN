"use strict";
var configurationService = require("./configurationService");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
var common = require("../../common/common");

should.toString();

describe('Configration Service Test', function () {
    it('Initialize Configration Service successfully', async function () {
        let result = await configurationService.initialize();
        (result === common.success).should.true();
    });
});