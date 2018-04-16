"use strict";
var queueCommandManager = require("./queueCommandManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('Queuing Command Manager Test', function () {
    it('Initialize Queuing Command Manager successfully', async function () {
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });
    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" successfully', async function () {

        var ticketInfo = {
            orgid: "1",
            segmentid: "325",
            serviceid: "364",
            branchid: "106",
            languageindex: "0",
            origin: "0"
        };
        let result = await queueCommandManager.issueTicket(ticketInfo);
        (result === common.success).should.true();

    });

    it('Issue Ticket segmentid: "325" serviceid: "364" branchid: "106" Second time successfully', async function () {

        var ticketInfo = {
            orgid: "1",
            segmentid: "325",
            serviceid: "364",
            branchid: "106",
            languageindex: "0",
            origin: "0"
        };
        let result = await queueCommandManager.issueTicket(ticketInfo);
        (result === common.success).should.true();

    });

    it('Issue Ticket segmentid: "325" serviceid: "366" branchid: "106" successfully', async function () {

        var ticketInfo = {
            orgid: "1",
            segmentid: "325",
            serviceid: "366",
            branchid: "106",
            languageindex: "0",
            origin: "0"
        };
        let result = await queueCommandManager.issueTicket(ticketInfo);
        (result === common.success).should.true();

    });

    it('Issue Ticket segmentid: "325" serviceid: "386" branchid: "106" throws error', async function () {

        var ticketInfo = {
            orgid: "1",
            segmentid: "325",
            serviceid: "386",
            branchid: "106",
            languageindex: "0",
            origin: "0"
        };
        let result = await queueCommandManager.issueTicket(ticketInfo);
        (result === common.error).should.true();
    });


    it('Next Customer Get for counter ID = 120', async function () {

        var ticketInfo = {
            orgid: "1",
            counterid: "120",
            branchid: "106",
            languageindex: "0"
        };
        let result = await queueCommandManager.counterNext(ticketInfo);
        (result === common.success).should.true();
    });



    
});
