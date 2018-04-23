var repositoriesManager = require("../localRepositories/repositoriesManager");
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var dataService = require("../data/dataService");
var branches_statisticsData = [];

//Load for all branches
var load = function () {
    try {

        logger.logError("load");


    }
    catch (error) {
        logger.logError(error);
    }

};

module.exports.load = load;