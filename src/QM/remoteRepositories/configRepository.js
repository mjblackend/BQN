//GetAll(entityname);
//GetByFilter(entityname,FilterName, FilterValue)

//for now when working on DB, we will use Getall to retrieve everything
//later when the repository returns data from server, the server will implement getbyFilter API.
var mssql = require("mssql");
var fs = require("fs");
var filepath="dbconfig.txt";
var config = {
    user: "sa",
    password: "fileworx@123",
    server: "majd",
    database: "new"
};

if (fs.exists(filepath))
{
    config = JSON.parse(fs.readFileSync(filepath));
}



var connection = null;

//Get All entities
var GetAll = async function (entityname) {
    if (connection == null)
    {
        connection = await mssql.connect(config);
    }

    var request= new mssql.Request();
    var command = "select * from T_" + entityname;
    var Results = await request.query(command);
    return Results;
};

//Get By Filter
var GetByFilter = async function (entityname, FilterName, FilterValue) {
    if (connection == null)
    {
        connection = await mssql.connect(config);
    }

    var request= new mssql.Request();
    var command = "select * from T_" + entityname + " where " + FilterName + " = " + FilterValue;
    var Results = await request.query(command);
    return Results;
};

module.exports.GetAll = GetAll;
module.exports.GetByFilter = GetByFilter;

