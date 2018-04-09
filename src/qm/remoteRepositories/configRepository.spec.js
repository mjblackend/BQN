"use strict";
var configRepository = require("./configRepository");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('Start testing SQL DB', function () {
    it('Getting Branches', async function () {
        let result = await configRepository.GetAll(undefined,"T_QueueBranch");
        //(true).should.true();
        (result !== undefined && result.length > 0).should.true();

    });
    it('Getting Counters',async function () {
        let result =  await configRepository.GetAll(undefined,"T_Counter");
        //(true).should.true();
        (result !== undefined  && result.length > 0).should.true();
    });
});
