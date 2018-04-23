//set DB connection
//do counter functions of user table on the DB
var common = require("../../common/common");
var idGenerator = require("./idGenerator");
var logger = require("../../common/logger");
var userActivity = require("../data/userActivity");


//User Activity Attributes
var t_UserActivity = new userActivity();
var attributes = Object.getOwnPropertyNames(t_UserActivity);
var attributesStr = attributes.join(",");

var updateActivity = [];
var addActivity = [];

//Prepare Values for insert or update
var GetValuesFromObject = function (activity) {
    try {
        //Prepare the values array
        let values = "";
        for (let i = 0; i < attributes.length; i++) {
            values = values + "\"" + activity[attributes[i].toString()] + "\"";
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

var userActivitiesRep = function (db) {
    try {
        this.db = db;

        //Get All User Activities
        this.getAll = async function () {
            let that = this.db;
            try {
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
            let that = this.db;
            try {
                if (filterKeys != null && filterKeys != undefined && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
                    let filter = GetFilterColumnsFromObject(filterKeys, filterValues);
                    let sql = "SELECT * FROM userActivites where " + filter;
                    let userActivites = await that.all(sql);
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
            let that = this.db;
            try {
                if (userActivity) {
                    //Do the Query
                    let sql = " delete from userActivites where id = " + userActivity.id;
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


        //Update Activity
        this.Update = async function (userActivity) {
            let that = this.db;
            try {
                if (userActivity) {
                    //Prepare the values array
                    let values = GetValuesFromObject(userActivity);

                    //Do the Query
                    let sql = " insert or replace into userActivites (" + attributesStr + ") values (" + values + ")";
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

        this.Add = async function (userActivity) {
            let that = this.db;
            try {
                if (userActivity) {
                    //Prepare the values array
                    let values = GetValuesFromObject(userActivity);

                    //Do the Query
                    let sql = " insert or replace into userActivites (" + attributesStr + ") values (" + values + ")";
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
        
        this.UpdateSynch = function (userActivity) {
            try {
                updateActivity.push(userActivity);
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.AddSynch = function (userActivity) {
            try {
                addActivity.push(userActivity);
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.commit = async function () {
            try {
                let count = addActivity.length;
                while (count > 0) {
                    let activity = addActivity.shift();
                    await this.Add(activity);
                    count = count - 1;
                }
                count = updateActivity.length;
                while (count > 0) {
                    let activity = updateActivity.shift();
                    await this.Update(activity);
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

module.exports = userActivitiesRep;