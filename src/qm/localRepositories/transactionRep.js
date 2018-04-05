//set DB connection
//do counter functions of user table on the DB
var logger = require("../../common/logger");
var transaction = require("../data/transaction");
var idGenerator = require("./idGenerator");

//Transaction Attributes
var transactioninst = new transaction();
var attributes = Object.getOwnPropertyNames(transactioninst);
var attributesStr = attributes.join(",");

var transactionRep = function (db) {
    try {
        this.db = db;


        this.getAll = async function () {
            try {
                var that = this.db;
                let sql = "SELECT * FROM transactions";
                var transactions = await that.all(sql);
                return transactions;
            }
            catch (error) {
                logger.logError(error);
                return undefined;
            }
        };

        this.getFilterBy = async function (filterKeys, filterValues) {
            try {
                if (filterKeys != null && filterKeys != undefined && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
                    var filter = " ";
                    for (var i = 0; i < filterKeys.length; i++) {
                        filter = filter + filterKeys[i] + " = ? "
                        if (i != (filterKeys.length - 1)) {
                            filter = filter + " and ";
                        }
                    }

                    var that = this.db;
                    let sql = "SELECT * FROM transactions where " + filter;
                    var transactions = await that.get(sql, filterValues);
                    return transactions;
                }
                else {
                    return await getAll();
                }
            }
            catch (error) {
                logger.logError(error);
                return undefined;
            }
        };

        this.delete = async function (transaction) {
            try {
                if (transaction) {
                    //Do the Query
                    var that = this.db;
                    let sql = " delete from transactions where id = " + transaction.id;
                    var isSuccess = await that.run(sql);
                    return isSuccess;
                }
                else {
                    return false;
                }

            }
            catch (error) {
                logger.logError(error);
                return false;
            }
        };



        this.addOrUpdate = async function (transaction) {
            try {
                if (transaction) {
                    var that = this.db;
                    //Generate ID in not exists
                    if (transaction.id <= 0) {
                        transaction.id = await idGenerator.getNewID(that);
                    }
                    //Prepare the values array
                    var values = "";
                    for (var i = 0; i < attributes.length; i++) {
                        values = values + "\"" + transaction[attributes[i].toString()] + "\""
                        if (i != (attributes.length - 1)) {
                            values = values + ",";
                        }
                    }

                    //Do the Query
                    let sql = " insert or replace into transactions (" + attributesStr + ") values (" + values + ")";
                    var isSuccess = await that.run(sql);
                    return isSuccess;
                }
                else {
                    return false;
                }

            }
            catch (error) {
                logger.logError(error);
                return false;
            }
        };




    }
    catch (error) {
        logger.logError(error);
    }
};

module.exports = transactionRep;