"use strict";
var configurationService = require("./configurationService");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('Start testing SQL DB', function () {
    it('Initialize Configration successfully', async function () {
        var result = await configurationService.initialize();
        (result).should.true();
    });
});