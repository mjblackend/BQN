var should = require("should");
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
var repositoriesManager = require("./repositoriesManager");

should.toString();

describe('Start database testing', function () {
    it('DB initialize Successfully', async function () {
        var repositoriesMgr=new repositoriesManager();
        var result = await repositoriesMgr.initialize();
        result.should.equal(0);
    });
});