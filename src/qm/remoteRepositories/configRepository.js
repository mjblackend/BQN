"use strict";
//for now when working on DB, we will use Getall to retrieve everything
//later when the repository returns data from server, the server will implement getbyFilter API.
var mssql = require("mssql");
var fs = require("fs");
var logger = require("../../common/logger");


var filepath = "dbconfig.txt";
var config = {
    user: "sa",
    password: "sedco@123",
    server: "majd",
    database: "new"
};

if (fs.exists(filepath)) {
    let content = fs.readFileSync(filepath);
    config = JSON.parse(content);
}
var connection = null;


//Add 
var FilterTheReservedColumnNames = async function (columns) {
    let Filtered = [];
    if (columns) {
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].toLowerCase() == "identity" || columns[i].toLowerCase() == "key" || columns[i].toLowerCase() == "value") {
                Filtered.push("[" + columns[i] + "]");
            }
            else
            {
                Filtered.push(columns[i]);
            }
        }
    }
    return Filtered;
};

async function RecoverConnection()
{
    let tries=3;
    while(tries > 0 )
    {
        try{
            if (connection == null) {
                connection = await mssql.connect(config);
                return ;
            }

        }
        catch (error) {
            logger.logError("repclose");
            mssql.close();
            connection=undefined;
            logger.logError(error);
        }
        finally{
            tries -= 1;
        }
    }
}


//Get entities
var GetAll = async function (columns, table_name) {
    try {

        let columnsstr = "*";
        if (columns && columns.length > 0) {
            columns = await FilterTheReservedColumnNames(columns);
            columnsstr = columns.join(",");
        }

        if (connection == null) {
            await RecoverConnection();
        }

        let request = new mssql.Request();
        let command = "select " + columnsstr + " from " + table_name;
        let Results = await request.query(command);
        if (Results && Results.recordset && Results.recordset.length > 0) {
            return Results.recordset;
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Get By Filter
var GetByFilter = async function (columns, table_name, FilterName, FilterValue) {

    try {

        let columnsstr = "*";
        if (columns && columns.length > 0) {
            columns = await FilterTheReservedColumnNames(columns);
            columnsstr = columns.join(",");
        }

        if (connection == null) {
           await RecoverConnection();
        }

        let request = new mssql.Request();
        let command = "select " + columnsstr + " from " + table_name + " where " + FilterName + " = " + FilterValue;
        let Results = await request.query(command);
        if (Results && Results.recordset && Results.recordset.length > 0) {
            return Results.recordset;
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

module.exports.GetAll = GetAll;
module.exports.GetByFilter = GetByFilter;
