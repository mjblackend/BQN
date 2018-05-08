"use strict";
var statisticsManager = require("../../../qm/statistics/statisticsManager");
var statisticsData = require("../../../qm/data/statisticsData");
var queueCommandManager = require("../../../qm/logic/queueCommandManager");
var common = require("../../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
const BranchID = "106";
const SegmentID = "325";
const ServiceID = "364";
const CounterID = "120";
should.toString();


describe('statisticsManager initialize successfully', async function () {
    it('statisticsManager', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        result = await statisticsManager.initialize();
        (result === common.success).should.true();
    });
    it('Read Branch(' + BranchID + ') statistics successfully', async function () {
        let branchID = BranchID;
        let result = await statisticsManager.ReadBranchStatistics(branchID);
        (result === common.success).should.true();
    });

    it('Refresh Branch(' + BranchID + ') statistics successfully', async function () {
        let branchID = BranchID;
        let result = await statisticsManager.RefreshBranchStatistics(branchID);
        (result === common.success).should.true();
    });
    it('Read Branch(106) Statistic for segment ' + SegmentID + ' and service ' + ServiceID + ' successfully', async function () {

        let FilterStatistics = new statisticsData();
        FilterStatistics.branch_ID = BranchID;
        FilterStatistics.segment_ID = SegmentID;
        FilterStatistics.service_ID = ServiceID;
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (result && result.WaitedCustomersNo > 0).should.true();
    });
    it('Read Branch(106) Statistic for segment ' + SegmentID + ' and service ' + ServiceID + '  Counter =  ' + CounterID + ' successfully', async function () {

        let FilterStatistics = new statisticsData();
        FilterStatistics.branch_ID = BranchID;
        FilterStatistics.segment_ID = SegmentID;
        FilterStatistics.service_ID = ServiceID;
        FilterStatistics.counter_ID = CounterID;

        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (result && result.NoShowCustomersNo > 0).should.true();
    });
    it('Read specific statistics for a valid branch but invalid service and segment will succeed with zero values', async function () {
        let FilterStatistics = new statisticsData();
        FilterStatistics.branch_ID = BranchID;
        FilterStatistics.segment_ID = 22222222222222222;
        FilterStatistics.service_ID = 222222222222222222;

        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (result && result.NoShowCustomersNo == 0 && result.WaitedCustomersNo == 0).should.true();
    });
    it('Read specific statistics failed because filter is undefined', async function () {
        let FilterStatistics;
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (!result).should.true();
    });
    it('Read specific statistics failed because the branch filter is 0', async function () {
        let FilterStatistics = new statisticsData();
        let result = await statisticsManager.GetSpecificStatistics(FilterStatistics);
        (!result).should.true();
    });
});

