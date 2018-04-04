var sqlite3 = require("./aa-sqlite");
var common = require("../../common/common");
var fs = require("fs");
var logger = require("../../common/logger");
var transactionRep = require("./transactionRep");
var userActivitiesRep = require("./userActivitiesRep");

//Initialize DB connection
//Initialize Repositories with the DB connection
//Exports (Collection of Repositories or the Repositories themselves) to be used by other classes
var repositoriesManager = function () {
    try {
        //this.db = null;
        this.initialize = initialize;
    }
    catch (error) {
        logger.logError(error);
    }
};


var initialize = async function () {
    try {

        var result = false;

        // open the database
        //Run the upgrade script
        result = await sqlite3.open("./db/queuing.db");

        //Run the initialize script
        var sql = fs.readFileSync("init_database.sql").toString();
        var scriptArray = sql.replace("\r\n", "").split(";");
        scriptArray = scriptArray.slice(0, scriptArray.length - 1);
        if (scriptArray != undefined) {
            for (var i = 0; i < scriptArray.length; i++) {
                result = await sqlite3.run(scriptArray[i]);
                if (result == false) {
                    return common.error;
                }
            }
        }

        //Initialize Repos
        this.transactionRep = new transactionRep(sqlite3);
        this.userActivitiesRep = new userActivitiesRep(sqlite3);

        // close the database connection
        //db.close();
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



module.exports = repositoriesManager;
module.exports.initialize = initialize;
