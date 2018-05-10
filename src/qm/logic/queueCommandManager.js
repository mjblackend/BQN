/*eslint no-unused-vars: "off"*/
"use strict";
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var transactionManager = require("../logic/transactionManager");
var userActivityManager = require("../logic/userActivityManager");
var transaction = require("../data/transaction");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var statisticsManager = require("./statisticsManager");
var initialized = false;

var FinishingCommand = async function (BranchID) {
    try {
        //Commit DB Actions
        await repositoriesManager.commit();
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//only functions and reference of branch data and configuration service.
//Issue Ticket 
var issueTicket = async function (ticketInfo) {
    try {
        let result;
        let errors = [];
        let BranchID = ticketInfo["branchid"];
        let SegmentID = ticketInfo["segmentid"];
        let ServiceID = ticketInfo["serviceid"];
        let LanguageIndex = ticketInfo["languageindex"];
        let Origin = ticketInfo["origin"];
        let OrgID = ticketInfo["orgid"];

        let transactioninst = new transaction();
        transactioninst.org_ID = OrgID;
        transactioninst.branch_ID = BranchID;
        transactioninst.service_ID = ServiceID;
        transactioninst.segment_ID = SegmentID;

        result = transactionManager.issueSingleTicket(errors, transactioninst);
        ticketInfo.displayTicketNumber = transactioninst.displayTicketNumber;
        ticketInfo.result = result;

        if (ticketInfo.result != common.success) {
            ticketInfo.errorMessage = errors.join(",");
        }
        else {
            ticketInfo.errorMessage = "";
        }
        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Issue Ticket with multiple services
var issueTicketMulti = function (ticketInfo) {
    return true;
};

//break customer from counter
var counterBreak = async function (counterInfo) {
    try {
        let result = common.error;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];
        let LanguageIndex = counterInfo["languageindex"];
        let FinishedTransaction = [];
        let CurrentStateType = [];
        //Check Current State if allow break
        result = userActivityManager.CounterValidationForBreak(errors, OrgID, BranchID, CounterID);
        if (result == common.success) {
            //Finish serving the current customer
            result = transactionManager.finishCurrentCustomer(errors, OrgID, BranchID, CounterID, FinishedTransaction);
            if (result == common.success) {
                //set the state to break
                result = userActivityManager.ChangeCurrentCounterStateForBreak(errors, OrgID, BranchID, CounterID, CurrentStateType);
                if (result == common.success) {
                    if (FinishedTransaction && FinishedTransaction.length > 0) {
                        counterInfo.ServedDisplayTicketNumber = FinishedTransaction[FinishedTransaction.length - 1].displayTicketNumber;
                        counterInfo.CurrentDisplayTicketNumber = "...";
                        counterInfo.CurrentStateType = CurrentStateType[0];
                    }
                    else {
                        counterInfo.ServedDisplayTicketNumber = "...";
                        counterInfo.CurrentDisplayTicketNumber = "...";
                        counterInfo.CurrentStateType = CurrentStateType[0];
                    }
                }
            }
        }
        counterInfo.result = result;
        if (counterInfo.result != common.success) {
            counterInfo.errorMessage = errors.join(",");
        }
        else {
            counterInfo.errorMessage = "";
        }

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Take break on counter
var counterNext = async function (counterInfo) {
    try {
        let result = common.error;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];
        let LanguageIndex = counterInfo["languageindex"];
        let Transactions = [];
        let CurrentStateType = [];
        counterInfo.ServedDisplayTicketNumber = "...";
        //Check Current State if allow next
        result = userActivityManager.CounterValidationForNext(errors, OrgID, BranchID, CounterID);
        if (result == common.success) {
            //Finish serving the current customer
            result = transactionManager.finishCurrentCustomer(errors, OrgID, BranchID, CounterID, Transactions);
            if (result == common.success) {
                if (Transactions && Transactions.length > 0) {
                    counterInfo.ServedDisplayTicketNumber = Transactions[Transactions.length - 1].displayTicketNumber;
                }
                Transactions = [];
                //Get next customer
                result = transactionManager.getNextCustomer(errors, OrgID, BranchID, CounterID, Transactions);
                if (result == common.success) {
                    //set the state to ready or serving
                    result = userActivityManager.ChangeCurrentCounterStateForNext(errors, OrgID, BranchID, CounterID, CurrentStateType);
                    if (result == common.success) {
                        if (Transactions && Transactions.length > 0) {
                            counterInfo.CurrentDisplayTicketNumber = Transactions[Transactions.length - 1].displayTicketNumber;
                            counterInfo.CurrentStateType = CurrentStateType[0];
                        }
                        else {
                            counterInfo.CurrentDisplayTicketNumber = "...";
                            counterInfo.CurrentStateType = CurrentStateType;
                        }
                    }
                }
            }
        }
        counterInfo.result = result;
        if (counterInfo.result != common.success) {
            counterInfo.errorMessage = errors.join(",");
        }
        else {
            counterInfo.errorMessage = "";
        }

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Open counter without calling customer
var counterOpen = async function (counterInfo) {
    try {
        let result = common.error;
        let errors = [];
        let OrgID = counterInfo["orgid"];
        let BranchID = counterInfo["branchid"];
        let CounterID = counterInfo["counterid"];
        let LanguageIndex = counterInfo["languageindex"];
        let FinishedTransaction = [];
        let CurrentStateType = [];
        //Check Current State if allow break
        result = userActivityManager.CounterValidationForOpen(errors, OrgID, BranchID, CounterID);
        if (result == common.success) {
            //set the state to Open
            result = userActivityManager.ChangeCurrentCounterStateForOpen(errors, OrgID, BranchID, CounterID, CurrentStateType);
            if (result == common.success) {
                if (FinishedTransaction && FinishedTransaction.length > 0) {
                    counterInfo.CurrentDisplayTicketNumber = "...";
                    counterInfo.ServedDisplayTicketNumber = "...";
                    counterInfo.CurrentStateType = CurrentStateType[0];
                }
                else {
                    counterInfo.CurrentDisplayTicketNumber = "...";
                    counterInfo.CurrentStateType = CurrentStateType[0];
                }
            }
        }
        counterInfo.result = result;
        if (counterInfo.result != common.success) {
            counterInfo.errorMessage = errors.join(",");
        }
        else {
            counterInfo.errorMessage = "";
        }

        await FinishingCommand(BranchID);
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Transfer ticket to counter
var counterTransferToCounter = function (TransferInfo) {
    return true;
};

//Transfer ticket to another service
var counterTransferToService = function (TransferInfo) {
    return true;
};


//User Login
var userLogin = function (loginInfo) {
    return true;
};

//User logoff
var userLogoff = function (counterInfo) {
    return true;
};

//Issue a Appointment ticket
var issueAppointmentTicket = function (reservationInfo) {
    return true;
};

//Recall Current Customer
var counterRecallCurrentCustomer = function (counterInfo) {
    return true;
};

//Transfer ticket to another service
var counterTransferWaitingCustomer = function (TransferInfo) {
    return true;
};

//Hold Customer Service
var counterHoldCustomer = function (counterInfo) {
    return true;
};

//Serve/Unhold waiting customer
var counterServeCustomer = function (customerInfo) {
    return true;
};

//Update Customer Note
var saveCustomerNote = function (customerInfo) {
    return true;
};

//Counter is not ready
var counterNotReady = function (counterInfo) {
    return true;
};

//transfer customer back to service/counter
var counterTransferBack = function (counterInfo) {
    return true;
};

//Update locking state for ticketing counter
var counterLockstateUpdate = function (counterInfo, lockState) {
    return true;
};


//change to customer state (office time)
var counterCustomState = function (counterInfo) {
    return true;
};
//Finish customer without call other customers
var counterFinsihServing = function (counterInfo) {
    return true;
};

//issue ticket for customer with appointment on walk in
var checkInAppointment = function (appointmentInfo) {
    return true;
};

//Deassign Counter from BMS
var counterDeassignFromBMS = function (appointmentInfo) {
    return true;
};




//Deassign Counter from BMS
var processCommand = async function (apiMessage) {
    try {
        let result = common.error;
        if (apiMessage) {
            switch (apiMessage.title) {
                case enums.commands.IssueTicket:
                    result = await this.issueTicket(apiMessage.payload);
                    break;
                case enums.commands.Next:
                    result = await this.counterNext(apiMessage.payload);
                    break;
                case enums.commands.Break:
                    result = await this.counterBreak(apiMessage.payload);
                    break;
                case enums.commands.Open:
                    result = await this.counterOpen(apiMessage.payload);
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



//Initialize everything
var initialize = async function (ticketInfo) {
    try {
        if (this.initialized) {
            return common.success;
        }
        let result = await configurationService.initialize();
        if (result == common.success) {
            result = await dataService.initialize();
            if (result == common.success) {
                result = await statisticsManager.initialize();
                this.initialized = true;
                console.log("Initialized");
                return result;
            }
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


module.exports.initialize = initialize;
module.exports.initialized = initialized;
module.exports.issueTicket = issueTicket;
module.exports.issueTicketMulti = issueTicketMulti;
module.exports.counterNext = counterNext;
module.exports.counterOpen = counterOpen;
module.exports.counterBreak = counterBreak;
module.exports.counterTransferToCounter = counterTransferToCounter;
module.exports.counterTransferToService = counterTransferToService;
module.exports.userLogin = userLogin;
module.exports.userLogoff = userLogoff;
module.exports.issueAppointmentTicket = issueAppointmentTicket;
module.exports.counterRecallCurrentCustomer = counterRecallCurrentCustomer;
module.exports.counterTransferWaitingCustomer = counterTransferWaitingCustomer;
module.exports.counterHoldCustomer = counterHoldCustomer;
module.exports.counterServeCustomer = counterServeCustomer;
module.exports.saveCustomerNote = saveCustomerNote;
module.exports.counterNotReady = counterNotReady;
module.exports.counterTransferBack = counterTransferBack;
module.exports.counterLockstateUpdate = counterLockstateUpdate;
module.exports.counterCustomState = counterCustomState;
module.exports.counterFinsihServing = counterFinsihServing;
module.exports.checkInAppointment = checkInAppointment;
module.exports.counterDeassignFromBMS = counterDeassignFromBMS;
module.exports.processCommand = processCommand;
