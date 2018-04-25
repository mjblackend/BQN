"use strict";
var statisticsManager = require("./statisticsManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('statisticsManager initialize successfully', function () {
    it('statisticsManager', async function () {
        this.timeout(10000);
        let result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
});

it('Read Branch(106) statistics successfully', async function () {

    let BranchID= "106";
    let result = await statisticsManager.ReadBranchStatistics(BranchID);
    (result === common.success).should.true();
});