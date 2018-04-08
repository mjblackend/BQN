"use strict";
var configRepository = require("./configRepository");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('Start testing SQL DB', function () {
    it('Getting Branches', async function () {
        let result = await configRepository.GetAll("QueueBranch");
        //(true).should.true();
        ((result !== undefined || result !== undefined) && result.recordset.length > 0).should.true();

    });
    it('Getting Counters',async function () {
        let result =  await configRepository.GetAll("counter");
        //(true).should.true();
        ((result !== undefined || result !== undefined) && result.recordset.length > 0).should.true();
    });

    it('Getting All Entities',async function () {
        let result =  await configRepository.GetAllEntities();
        //(true).should.true();
        (result !== undefined || result !== undefined).should.true();
    });
});
