"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var statisticsManager = require("./statisticsManager");


//Get counter status (current ticket and state)
function getCounterStatus(counterInfo) {
    try {
        let result = common.success;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];
        CurrentTransaction = output[3];
        if (CurrentTransaction) {
            counterInfo.CurrentDisplayTicketNumber = CurrentTransaction.displayTicketNumber;
        }
        else {
            counterInfo.CurrentDisplayTicketNumber = "...";
        }
        if (CurrentActivity) {
            counterInfo.CurrentStateType = CurrentActivity.type;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

 function Read  (apiMessagePayload) {
    return  configurationService.Read(apiMessagePayload);
};
 function ReadBranchStatistics(apiMessagePayload) {
    return  statisticsManager.ReadBranchStatistics(apiMessagePayload);
};

var getData = async function (apiMessage) {
    try {
        let result = common.error;
        if (apiMessage) {
            switch (apiMessage.title) {
                case enums.commands.Read:
                    result = await Read(apiMessage.payload);
                    break;
                case enums.commands.ReadBranchStatistics:
                    result = await ReadBranchStatistics(apiMessage.payload);
                    break;
                case enums.commands.GetCounterStatus:
                    result = await getCounterStatus(apiMessage.payload);
                    break;
                default:
                    result = common.error;
            }
            return result;
        }
        else {
            return result;
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


module.exports.getData = getData;