"use strict";
var queueCommandManager = require("./queueCommandManager");
var common = require("../../common/common");
var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;


should.toString();

describe('Start Queuing Command Manager Test', function () {
    it('Initialize successfully', async function () {
        let result = await queueCommandManager.initialize();
        (result === common.success).should.true();
    });
    it('Issue Ticket', async function () {

        var ticketInfo = {
            segmentid: "325",
            serviceid: "364",
            branchid: "106",
            languageindex: "0",
            origin: "0"
        };
        let result = await queueCommandManager.issueTicket(ticketInfo);


        //(true).should.true();
        (result === common.success).should.true();

    });
});
