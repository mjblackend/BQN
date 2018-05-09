//set DB connection
//do counter functions of user table on the DB
var logger = require("../../common/logger");
var transaction = require("../data/transaction");
var common = require("../../common/common");
var idGenerator = require("./idGenerator");
//Transaction Attributes
var transactioninst = new transaction();
var attributes = Object.getOwnPropertyNames(transactioninst).filter(function(value){ return !value.startsWith("_"); });
var attributesStr = attributes.join(",");
var updateTransactions = [];
var addTransactions = [];

//Prepare Values for insert or update
var GetValuesFromObject = function (transaction) {
    try {
        //Prepare the values array
        let values = "";
        for (let i = 0; i < attributes.length; i++) {
            values = values + "\"" + transaction[attributes[i].toString()] + "\"";
            if (i != (attributes.length - 1)) {
                values = values + ",";
            }
        }
        return values;
    }
    catch (error) {
        logger.logError(error);
        return "";
    }
};


//Create columns for sql lite query
var GetFilterColumnsFromObject = function (filterKeys, filterValues) {
    try {
        let filter = " ";
        for (let i = 0; i < filterKeys.length; i++) {
            if (Array.isArray(filterValues[i])) {
                let values = filterValues[i].join(",");
                filter = filter + filterKeys[i] + " in (" + values + ") ";
                if (i != (filterKeys.length - 1)) {
                    filter = filter + " and ";
                }
            }
            else {
                filter = filter + filterKeys[i] + " = " + filterValues[i];
                if (i != (filterKeys.length - 1)) {
                    filter = filter + " and ";
                }
            }
        }
        return filter;
    }
    catch (error) {
        logger.logError(error);
        return "";
    }
};



var transactionRep = function (db) {
    try {
        this.db = db;


        this.getAll = async function () {
            let that = this.db;
            try {
                let sql = "SELECT * FROM transactions";
                let transactions = await that.all(sql);
                return transactions;
            }
            catch (error) {
                logger.logError(error);
                return undefined;
            }
        };



        this.getFilterBy = async function (filterKeys, filterValues) {
            let that = this.db;
            try {
                if (filterKeys != null && filterKeys != undefined && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
                    let filter = GetFilterColumnsFromObject(filterKeys, filterValues);

                    let sql = "SELECT * FROM transactions where " + filter;
                    let transactions = await that.all(sql);
                    return transactions;
                }
                else {
                    return await this.getAll();
                }
            }
            catch (error) {
                logger.logError(error);
                return undefined;
            }
        };

        this.delete = async function (transaction) {
            try {
                let that = this.db;
                if (transaction) {
                    //Do the Query

                    let sql = " delete from transactions where id = " + transaction.id;
                    let isSuccess = await that.run(sql);
                    if (isSuccess) {
                        return common.success;
                    }
                    else {
                        return common.error;
                    }
                }
                else {
                    return common.error;
                }

            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };


        this.Update = async function (transaction) {
            try {
                let that = this.db;
                if (transaction) {
                    //Prepare the values array
                    let values = GetValuesFromObject(transaction);

                    //Do the Query
                    let sql = " insert or replace into transactions (" + attributesStr + ") values (" + values + ")";
                    let isSuccess = await that.run(sql);
                    if (isSuccess) {
                        //await idGenerator.UpdateSeqOnDB(that);
                        return common.success;
                    }
                    else {
                        return common.error;
                    }
                }
                else {
                    return common.error;
                }

            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };

        this.Add = async function (transaction) {
            try {
                let that = this.db;
                if (transaction) {
                    //Prepare the values array
                    let values = GetValuesFromObject(transaction);

                    //Do the Query
                    let sql = " insert or replace into transactions (" + attributesStr + ") values (" + values + ")";
                    let isSuccess = await that.run(sql);
                    if (isSuccess) {
                        await idGenerator.UpdateSeqOnDB(that);
                        return common.success;
                    }
                    else {
                        return common.error;
                    }
                }
                else {
                    return common.error;
                }

            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };



        this.UpdateSynch = function (transaction) {
            try {
                updateTransactions.push(transaction);
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.AddSynch = function (transaction) {
            try {
                addTransactions.push(transaction);
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.commit = async function () {
            try {
                let count = addTransactions.length;
                while (count > 0) {
                    let transaction = addTransactions.shift();
                    await this.Add(transaction);
                    count = count - 1;
                }
                count = updateTransactions.length;
                while (count > 0) {
                    let transaction = updateTransactions.shift();
                    await this.Update(transaction);
                    count = count - 1;
                }
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };


    }
    catch (error) {
        logger.logError(error);
    }
};

module.exports = transactionRep;