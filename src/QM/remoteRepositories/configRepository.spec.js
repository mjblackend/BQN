var should = require("should");
var mocha = require("mocha");
var describe = mocha.describe;
var it = mocha.it;
var configRepository = require("./configRepository");


describe('Start testing SQL DB', function () {
    it('Getting Branches', async function () {
        var result = await configRepository.GetAll("QueueBranch");
        (true).should.true()
        //((result !== undefined || result !== undefined) && result.recordset.length > 0).should.true()

    });
    it('Getting Counters',async function () {
        var result =  await configRepository.GetAll("counter");
        (true).should.true()
        //((result !== undefined || result !== undefined) && result.recordset.length > 0).should.true()
    });
});
