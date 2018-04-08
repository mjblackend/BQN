//Contains and maintain configrations
var logger = require("../../common/logger");
var configRepository = require("../remoteRepositories/configRepository");
var dbConfigs = require("../remoteRepositories/dbConfigs");
var branchClass = require("./branchConfig");
var branches = [];

var cacheServerEnities = async function () {
    try {
        let Results = await configRepository.GetAllEntities();
        if (Results != undefined) {
            if (Results.branches) {
                let tBranch = new branchClass();
                for (let i = 0; i < Results.branches.length; i++) {
                    let tBranch = new branchClass();
                    tBranch = Results.branches[i];
                    branches.push(tBranch);
                }
            }
        }
        return Results;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var initialize = async function () {
    try {
        await cacheServerEnities();
        if (branches && branches.length > 0) {
            return true;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};


module.exports.initialize = initialize;