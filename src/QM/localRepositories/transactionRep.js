//set DB connection
//do counter functions of user table on the DB
var logger = require("../../common/logger");

var transactionRep = function (db) {
    try {
        this.db = db;


        this.getAll = async function () {
            try {
                var that = this.db;
                let sql = "SELECT * FROM entities where typeId = 'counter'";
                var result =  await that.all(sql);
                return result;
            }
            catch (error) {
                logger.logError(error);
            }
        };

        this.getById = async function (id) {
            try {
                var that = this.db;
                let sql = "SELECT * FROM entities where typeId = 'counter' and id= ? ";
                var result = await that.get(sql,[id]);
                return result;
            }
            catch (error) {
                logger.logError(error);
            }
        };
    }
    catch (error) {
        logger.logError(error);
    }
};

module.exports = transactionRep;