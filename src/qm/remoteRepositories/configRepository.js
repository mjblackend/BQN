//GetAll(entityname);
//GetByFilter(entityname,FilterName, FilterValue)
"use strict";
//for now when working on DB, we will use Getall to retrieve everything
//later when the repository returns data from server, the server will implement getbyFilter API.
var mssql = require("mssql");
var fs = require("fs");
var logger = require("../../common/logger");



var filepath="dbconfig.txt";
var config = {
    user: "sa",
    password: "fileworx@123",
    server: "majd",
    database: "new"
};

if (fs.exists(filepath))
{
    var content = fs.readFileSync(filepath);
    config = JSON.parse(content);
}


var connection = null;


//Get All entities
var GetAll = async function (entityname) {
    try{
        if (connection == null)
        {
            connection = await mssql.connect(config);
        }
    
        var request= new mssql.Request();
        var command = "select * from T_" + entityname;
        var Results = await request.query(command);
        return Results;
    }
    catch(error)
    {
        logger.logError(error);
        return undefined;
    }
};

//Get By Filter
var GetByFilter = async function (entityname, FilterName, FilterValue) {

    try{


        if (connection == null)
        {
            connection = await mssql.connect(config);
        }
    
        var request= new mssql.Request();
        var command = "select * from T_" + entityname + " where " + FilterName + " = " + FilterValue;
        var Results = await request.query(command);
        return Results;
    }
    catch(error)
    {
        logger.logError(error);
        return undefined;
    }

};

module.exports.GetAll = GetAll;
module.exports.GetByFilter = GetByFilter;

