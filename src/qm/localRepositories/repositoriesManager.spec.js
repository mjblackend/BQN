var should = require("should");
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
var repositoriesManager = require("./repositoriesManager");
var repositoriesMgr = new repositoriesManager();
var transaction = require("../data/transaction");
var userActivity = require("../data/userActivity");

should.toString();

describe('Database testing', function () {
    it('DB initialize Successfully', async function () {
        var result = await repositoriesMgr.initialize();
        result.should.equal(0);
    });
});



describe('Test Transaction Repo', function () {
    it('Get All Transactions', async function () {
        var result = await repositoriesMgr.transactionRep.getAll();
        (result !== undefined).should.true();
    });

    it('Create New transaction', async function () {
        var transactioninst = new transaction();
        transactioninst.org_ID = 1;
        var result = await repositoriesMgr.transactionRep.addOrUpdate(transactioninst);
        result.should.true();
    });

    it('ADD OR UPDATE Trancaction With ID = 5', async function () {
        var transactioninst = new transaction();
        transactioninst.id = 5;
        transactioninst.org_ID = 1;
        var result = await repositoriesMgr.transactionRep.addOrUpdate(transactioninst);
        result.should.true();
    });
    it('Get Transaction by ID, ID = 5 ', async function () {
        var result = await repositoriesMgr.transactionRep.getFilterBy(["id"], ["5"]);
        (result !== undefined).should.true();
    });
    it('Delete Transaction, ID = 6 ', async function () {
        var transactioninst = new transaction();
        transactioninst.id = 6;
        transactioninst.org_ID = 1;
        var result = await repositoriesMgr.transactionRep.addOrUpdate(transactioninst);
        if (result == true) {
            result = await repositoriesMgr.transactionRep.delete(transactioninst);
            (result !== undefined).should.true();
        }
        else {
            (result).should.true();
        }
    });
});


describe('Test User Activity Repo', function () {
    it('Get All user Activities', async function () {
        var result = await repositoriesMgr.userActivitiesRep.getAll();
        (result !== undefined).should.true();
    });

    it('Create New Activity', async function () {
        var userActivityinst = new userActivity();
        userActivityinst.org_ID = 1;
        var result = await repositoriesMgr.userActivitiesRep.addOrUpdate(userActivityinst);
        result.should.true();
    });

    it('ADD OR UPDATE Activity With ID = 5', async function () {
        var userActivityinst = new userActivity();
        userActivityinst.id = 5;
        userActivityinst.org_ID = 1;
        var result = await repositoriesMgr.userActivitiesRep.addOrUpdate(userActivityinst);
        result.should.true();
    });
    it('Get Activity by ID, ID = 5 ', async function () {
        var result = await repositoriesMgr.userActivitiesRep.getFilterBy(["id"], ["5"]);
        (result !== undefined).should.true();
    });
    it('Delete Activity, ID = 6 ', async function () {
        var userActivityinst = new userActivity();
        userActivityinst.id = 6;
        userActivityinst.org_ID = 1;
        var result = await repositoriesMgr.userActivitiesRep.addOrUpdate(userActivityinst);
        if (result == true) {
            result = await repositoriesMgr.userActivitiesRep.delete(userActivityinst);
            (result !== undefined).should.true();
        }
        else {
            (result).should.true();
        }
    });
});