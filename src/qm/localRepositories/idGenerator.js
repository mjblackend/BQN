var sqlite3 = require("./aa-sqlite");

var getNewID = async function (db) {
    var that = db;
    let sql = "SELECT * FROM seq";
    var sqlRecord = await that.all(sql);
    if (sqlRecord != undefined && sqlRecord[0].seqNumber > 0) {
        var newID = sqlRecord[0].seqNumber + 1;
        sql = "update seq SET seqNumber = \"" + newID + "\"";
        var isSuccessfull = await that.run(sql);
        if (isSuccessfull) {
            return newID;
        }
    }
    return -1;
}

module.exports.getNewID = getNewID;