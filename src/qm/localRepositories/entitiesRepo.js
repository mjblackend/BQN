//set DB connection
//do counter functions of user table on the DB
var logger = require("../../common/logger");
var common = require("../../common/common");
var idGenerator = require("./idGenerator");
const table_Prefex = "t_";
//collections for update
var updateEntities = [];
var addEntities = [];

//Prepare Values for insert or update
var GetValuesFromObject = function (entity, attributes) {
    try {
        //Prepare the values array
        let values = "";
        for (let i = 0; i < attributes.length; i++) {
            values = values + "\"" + entity[attributes[i].toString()] + "\"";
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



var entitiesRepo = function (db) {
    try {
        this.db = db;


        this.getAll = async function (entity) {
            let that = this.db;
            try {
                let tableName = table_Prefex + entity.constructor.name;
                let sql = "SELECT * FROM " + tableName;
                let entities = await that.all(sql);
                return entities;
            }
            catch (error) {
                logger.logError(error);
                return undefined;
            }
        };



        this.getFilterBy = async function (entity, filterKeys, filterValues) {
            let that = this.db;
            try {
                if (filterKeys != null && filterKeys != undefined && filterKeys.length > 0 && filterKeys.length == filterValues.length) {
                    let filter = GetFilterColumnsFromObject(filterKeys, filterValues);
                    let tableName = table_Prefex + entity.constructor.name;
                    let sql = "SELECT * FROM " + tableName + " where " + filter;
                    let entities = await that.all(sql);
                    return entities;
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

        this.delete = async function (entity) {
            try {
                let that = this.db;
                if (entity) {
                    //Do the Query

                    let tableName = table_Prefex + entity.constructor.name;
                    let sql = " delete from " + tableName + " where id = " + entity.id;
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

        this.clear = async function (entity) {
            try {
                let that = this.db;
                if (entity) {
                    //Do the Query

                    let tableName = table_Prefex + entity.constructor.name;
                    let sql = " delete from " + tableName;
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

        this.Update = async function (entity) {
            try {
                let that = this.db;
                if (entity) {
                    let attributes = Object.getOwnPropertyNames(entity).filter(function (value) { return !value.startsWith("_"); });
                    let attributesStr = attributes.join(",");
                    let tableName = table_Prefex + entity.constructor.name;

                    //Prepare the values array
                    let values = GetValuesFromObject(entity, attributes);

                    //Do the Query
                    let sql = " insert or replace into " + tableName + " (" + attributesStr + ") values (" + values + ")";
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

        this.Add = async function (entity) {
            try {
                let that = this.db;
                if (entity) {
                    let attributes = Object.getOwnPropertyNames(entity).filter(function (value) { return !value.startsWith("_"); });
                    let attributesStr = attributes.join(",");
                    let tableName = table_Prefex + entity.constructor.name;
                    //Prepare the values array
                    let values = GetValuesFromObject(entity, attributes);

                    //Do the Query
                    let sql = " insert or replace into " + tableName + " (" + attributesStr + ") values (" + values + ")";
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



        this.UpdateSynch = function (Entity) {
            try {
                updateEntities.push(Entity);
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.AddSynch = function (Entity) {
            try {
                addEntities.push(Entity);
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.clearEntities = async function () {
            try {
                addEntities = [];
                updateEntities = [];
                return common.success;
            }
            catch (error) {
                logger.logError(error);
                return common.error;
            }
        };
        this.commit = async function () {
            try {
                let count = addEntities.length;
                while (count > 0) {
                    let Entity = addEntities.shift();
                    await this.Add(Entity);
                    count = count - 1;
                }
                count = updateEntities.length;
                while (count > 0) {
                    let Entity = updateEntities.shift();
                    await this.Update(Entity);
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

module.exports = entitiesRepo;