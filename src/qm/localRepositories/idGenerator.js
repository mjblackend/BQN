"use strict";
var CurrentSeqNumber = 0;

//Get the ID for the first time
var getNewIDFromDB = async function (db) {
    var that = db;
    let sql = "SELECT * FROM seq";
    var sqlRecord = await that.all(sql);
    if (sqlRecord != undefined && sqlRecord[0].seqNumber > 0) {
        return sqlRecord[0].seqNumber;
    }
    return -1;
};

//Update to the new ID
var UpdateSeqOnDB = async function (db) {
    var that = db;
    var sql = "update seq SET seqNumber = \"" + CurrentSeqNumber + "\"";
    var isSuccessfull = await that.run(sql);
    if (isSuccessfull) {
        return isSuccessfull;
    }
};

//Generate New ID
var getNewID = async function (db) {
    //Get the Sequence for the first time
    if (CurrentSeqNumber == 0) {
        CurrentSeqNumber = await getNewIDFromDB(db);
    }
    //Increase the Seq with 1
    CurrentSeqNumber = CurrentSeqNumber + 1;

    //Update the Seq
    var result = await UpdateSeqOnDB(db);
    if (result) {
        return CurrentSeqNumber;
    }
    else {
        return -1;
    }

};



module.exports.getNewID = getNewID;