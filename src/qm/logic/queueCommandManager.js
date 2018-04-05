/*eslint no-unused-vars: "off"*/
"use strict";
//only functions and reference of branch data and configuration service.
//Issue Ticket 
var issueTicket = function (ticketInfo)
{
    return true;
};

//Issue Ticket with multiple services
var issueTicketMulti = function (ticketInfo)
{
    return true;
};

//next customer from counter
var counterNext = function (counterInfo)
{
    return true;
};

//Open counter without calling customer
var counterOpen = function (counterInfo)
{
    return true;
};

//Take break on counter
var counterBreak = function (counterInfo)
{
    return true;
};

//Transfer ticket to counter
var counterTransferToCounter = function (TransferInfo)
{
    return true;
};

//Transfer ticket to another service
var counterTransferToService = function (TransferInfo)
{
    return true;
};


//User Login
var userLogin = function (loginInfo)
{
    return true;
};

//User logoff
var userLogoff = function (counterInfo)
{
    return true;
};

//Issue a Appointment ticket
var issueAppointmentTicket = function (reservationInfo)
{
    return true;
};

//Recall Current Customer
var counterRecallCurrentCustomer = function (counterInfo)
{
    return true;
};

//Transfer ticket to another service
var counterTransferWaitingCustomer = function (TransferInfo)
{
    return true;
};

//Hold Customer Service
var counterHoldCustomer = function (counterInfo)
{
    return true;
};

//Serve/Unhold waiting customer
var counterServeCustomer = function (customerInfo)
{
    return true;
};

//Update Customer Note
var saveCustomerNote = function (customerInfo)
{
    return true;
};

//Counter is not ready
var counterNotReady = function (counterInfo)
{
    return true;
};

//transfer customer back to service/counter
var counterTransferBack = function (counterInfo)
{
    return true;
};

//Update locking state for ticketing counter
var counterLockstateUpdate = function (counterInfo,lockState)
{
    return true;
};


//change to customer state (office time)
var counterCustomState = function (counterInfo)
{
    return true;
};
//Finish customer without call other customers
var counterFinsihServing = function (counterInfo)
{
    return true;
};

//issue ticket for customer with appointment on walk in
var checkInAppointment = function (appointmentInfo)
{
    return true;
};

//Deassign Counter from BMS
var counterDeassignFromBMS = function (appointmentInfo)
{
    return true;
};


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


