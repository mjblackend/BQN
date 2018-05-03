"use strict";
var configRepository = require("./configRepository");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('Remote SQL DB Repos Test', function () {
    it('Getting Branches', async function () {
        let result = await configRepository.GetAll(undefined,"T_QueueBranch");
        if (common.moch)
        {
            (true).should.true();
        }
        else
        {
            (result !== undefined && result.length > 0).should.true();
        }    
    });
    it('Getting Counters',async function () {
        let result =  await configRepository.GetAll(undefined,"T_Counter");
        if (common.moch)
        {
            (true).should.true();
        }
        else
        {
            (result !== undefined  && result.length > 0).should.true();
        }    
    });
});
