var sqlite3 = require("./aa-sqlite");
var common = require("../../common/common");
var fs = require("fs");
var logger = require("../../common/logger");
var transactionRep = require("./transactionRep");
var userActivitiesRep = require("./userActivitiesRep");
var idGenerator = require("./idGenerator");
var initialized = false;
"use strict";

//Initialize DB connection
//Initialize Repositories with the DB connection
//Exports (Collection of Repositories or the Repositories themselves) to be used by other classes
var initialize = async function () {
    try {

        if (initialized) {
            return common.success;
        }

        let result = false;

        // open the database
        //Run the upgrade script
        result = await sqlite3.open(common.dbConnection);

        //Run the initialize script
        let sql = fs.readFileSync("init_database.sql").toString();
        let scriptArray = sql.replace("\r\n", "").split(";");
        scriptArray = scriptArray.slice(0, scriptArray.length - 1);
        if (scriptArray != undefined) {
            for (let i = 0; i < scriptArray.length; i++) {
                result = await sqlite3.run(scriptArray[i]);
                if (result == false) {
                    return common.error;
                }
            }
        }

        await idGenerator.initialize(sqlite3);

        //Initialize Repos
        this.transactionRep = new transactionRep(sqlite3);
        this.userActivitiesRep = new userActivitiesRep(sqlite3);


        initialized = true;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};
var commit = async function () {
    try {
        await this.transactionRep.commit();
        await this.userActivitiesRep.commit();
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


module.exports.commit = commit;
module.exports.transactionRep = transactionRep;
module.exports.userActivitiesRep = userActivitiesRep;
module.exports.initialize = initialize;
