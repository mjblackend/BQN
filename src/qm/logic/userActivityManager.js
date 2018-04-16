var logger = require("../../common/logger");
var common = require("../../common/common");
//var enums = require("../../common/enums");
//var repositoriesManager = require("../localRepositories/repositoriesManager");
//var configurationService = require("../configurations/configurationService");
//var dataService = require("../data/dataService");



//Get Hall Number
var next = function (OrgID, BranchID, CounterID) {
    try {

        let tmp = OrgID + BranchID + CounterID;
        logger.logError(tmp);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Get Hall Number
var UpdateCounterStatus = function (CounterID, transactionID) {
    try {

        let tmp = transactionID + CounterID;
        logger.logError(tmp);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


module.exports.next = next;
module.exports.UpdateCounterStatus = UpdateCounterStatus;