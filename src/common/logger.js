var fs= require("fs");
const dateformat = require("dateformat");

var logError = function(error)
{
    var str = dateformat(new Date().getTime(), "HH:MM:ss dd/mm/yyyy")  + "\n\r";
    str = str + error;
    str = str + "\n\r";

    fs.appendFile("sedco.log", str, function(err) {
        if(err) {
            console.log("there was an error: ", err);
            return;
        }
    });
};




module.exports.logError = logError;