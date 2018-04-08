//Contains and maintain configrations
var configRepository = require("./remoteRepositories/configRepository");
var logger = require("../../common/logger");
var configRepository = require("../remoteRepositories/configRepository");
var dbConfigs = require("../remoteRepositories/dbConfigs");

var repository = new configRepository();

async function cacheServerEnities() {
    try {
        var Results = await configRepository.GetAllEntities();



        return Results;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

cacheServerEnities();
