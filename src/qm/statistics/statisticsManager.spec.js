"use strict";
var statisticsManager = require("./statisticsManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const BranchID = "106";

should.toString();

describe('statisticsManager initialize successfully', async function () {
    it('statisticsManager', async function () {
        this.timeout(10000);
        let result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });

    it('Read Branch(106) statistics successfully', async function () {
        let branchID= BranchID;
        let result = await statisticsManager.ReadBranchStatistics(branchID);
        (result === common.success).should.true();
    });
});

