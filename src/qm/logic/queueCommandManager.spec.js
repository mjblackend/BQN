"use strict";
var queueCommandManager = require("./queueCommandManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;

const OrgID = "1";
const SegmentID = "325";
const ServiceID = "364";
const ServiceID2 = "366";
const ServiceID3 = "386";
const BranchID = "106";
const LanguageIndex = "0";
const Origin = "0";
const CounterID = "120";

var ticketInfo = {
    orgid: OrgID,
    segmentid: SegmentID,
    serviceid: ServiceID,
    branchid: BranchID,
    languageindex: LanguageIndex,
    origin: Origin
};

var ticketInfo2 = {
    orgid: OrgID,
    segmentid: SegmentID,
    serviceid: ServiceID2,
    branchid: BranchID,
    languageindex: LanguageIndex,
    origin: Origin
};

var ticketInfoFail = {
    orgid: OrgID,
    segmentid: SegmentID,
    serviceid: ServiceID3,
    branchid: BranchID,
    languageindex: LanguageIndex,
    origin: Origin
};


var CounterInfo = {
    orgid: OrgID,
    counterid: CounterID,
    branchid: BranchID,
    languageindex: Origin
};


console.log("queueCommandManager.spec");
should.toString();

describe('Queuing Command Manager Test', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        this.timeout(15000);
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {
        let result = await queueCommandManager.issueTicket(ticketInfo);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" Second time successfully', async function () {
        let result = await queueCommandManager.issueTicket(ticketInfo);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "366" branchid: "106" successfully', async function () {
        let result = await queueCommandManager.issueTicket(ticketInfo2);
        (result === common.success).should.true();
    });

    it('Issue Ticket segmentid: "325" serviceid: "386" branchid: "106" throws error', async function () {
        let result = await queueCommandManager.issueTicket(ticketInfoFail);
        (result === common.error).should.true();
    });


    it('Next Customer Get for counter ID = 120', async function () {
        let result = await queueCommandManager.counterNext(CounterInfo);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 successfully', async function () {
        let result = await queueCommandManager.counterBreak(CounterInfo);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 will failed because the counter is already in break', async function () {
        let result = await queueCommandManager.counterBreak(CounterInfo);
        (result === common.not_valid).should.true();
    });

    it('Counter open from break for counter ID = 120 successfully', async function () {
        let result = await queueCommandManager.counterOpen(CounterInfo);
        (result === common.success).should.true();
    });

    it('Counter Take Break for counter ID = 120 successfully', async function () {
        let result = await queueCommandManager.counterBreak(CounterInfo);
        (result === common.success).should.true();
    });


    it('Get All Branches', async function () {

        var apiMessagePayLoad = {
            EntityName: "branch"
        };
        let result = await queueCommandManager.Read(apiMessagePayLoad);
        (result === common.success).should.true();
    });

    it('Get All Counters on Branch ID = 106', async function () {

        var apiMessagePayLoad = {
            EntityName: "counter",
            BranchID: BranchID
        };
        let result = await queueCommandManager.Read(apiMessagePayLoad);
        (result === common.success).should.true();
    });

    it('Get All Services on Branch ID = 106', async function () {

        var apiMessagePayLoad = {
            EntityName: "service",
            BranchID: BranchID
        };
        let result = await queueCommandManager.Read(apiMessagePayLoad);
        (result === common.success).should.true();
    });

    it('Get All Segments', async function () {

        var apiMessagePayLoad = {
            EntityName: "segment",
            BranchID: BranchID
        };
        let result = await queueCommandManager.Read(apiMessagePayLoad);
        (result === common.success).should.true();
    });

});
