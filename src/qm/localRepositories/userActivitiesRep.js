//set DB connection
//do counter functions of user table on the DB
var logger = require("../../common/logger");
var userActivity = require("../data/userActivity");
var idGenerator = require("./idGenerator");

//User Activity Attributes
var t_UserActivity = new userActivity();
var attributes = Object.getOwnPropertyNames(t_UserActivity);
var attributesStr = attributes.join(",");

//Prepare Values for insert or update
var GetValuesFromObject = function (userActivity) {
    try{
    //Prepare the values array
    let values = "";
    for (let i = 0; i < attributes.length; i++) {
        values = values + "\"" + userActivity[attributes[i].toString()] + "\"";
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
var GetFilterColumnsFromObject = function (filterKeys) {
    try{
        let filter = " ";
        for (let i = 0; i < filterKeys.length; i++) {
            filter = filter + filterKeys[i] + " = ? ";
            if (i != (filterKeys.length - 1)) {
                filter = filter + " and ";
            }
        }
        return filter;
    }
    catch (error) {
        logger.logError(error);
        return "";
    }
};

var userActivitiesRep = function (db) {
    try {
        this.db = db;

        //Get All User Activities
        this.getAll = async function () {
            try {
                let that = this.db;
                let sql = "SELECT * FROM userActivites";
                let userActivites = await that.all(sql);
                return userActivites;
            }
            catch (error) {
                logger.logError(error);
                return undefined;
            }
        };

        //Get All User Activities with filter
        this.getFilterBy = async function (filterKeys, filterValues) {
            try {
                if (filterKeys != null && filterKeys != undefined && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
                    let filter = GetFilterColumnsFromObject(filterKeys);
                    let that = this.db;
                    let sql = "SELECT * FROM userActivites where " + filter;
                    let userActivites = await that.get(sql, filterValues);
                    return userActivites;
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

        //Delete User Activity from ID
        this.delete = async function (userActivity) {
            try {
                if (userActivity) {
                    //Do the Query
                    let that = this.db;
                    let sql = " delete from userActivites where id = " + userActivity.id;
                    let isSuccess = await that.run(sql);
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


        //Add or update user activity
        this.addOrUpdate = async function (userActivity) {
            try {
                if (userActivity) {
                    let that = this.db;

                    //Generate ID in not exists
                    if (userActivity.id <= 0) {
                        userActivity.id = await idGenerator.getNewID(that);
                    }

                    //Prepare the values array
                    let values = GetValuesFromObject(userActivity);

                    //Do the Query
                    let sql = " insert or replace into userActivites (" + attributesStr + ") values (" + values + ")";
                    let isSuccess = await that.run(sql);
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

module.exports = userActivitiesRep;