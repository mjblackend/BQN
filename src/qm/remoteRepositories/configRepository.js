"use strict";
//for now when working on DB, we will use Getall to retrieve everything
//later when the repository returns data from server, the server will implement getbyFilter API.
var mssql = require("mssql");
var fs = require("fs");
var logger = require("../../common/logger");
var DBConfigs = require("./dbConfigs");


var filepath = "dbconfig.txt";
var config = {
    user: "sa",
    password: "fileworx@123",
    server: "majd",
    database: "new"
};

if (fs.exists(filepath)) {
    var content = fs.readFileSync(filepath);
    config = JSON.parse(content);
}


var connection = null;

//Get All Entities
var GetAllEntities = async function () {
    try {
        if (connection == null) {
            connection = await mssql.connect(config);
        }

        var dbConfigs = new DBConfigs();

        //Branches
        var request = new mssql.Request();
        var command = "select id,OrgID as org_ID,[identity],name_L1,name_L2,name_L3,name_L4 from T_QueueBranch";
        var Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.branches = Results.recordset;
        }

        //Service Config
        request = new mssql.Request();
        command = `select id,OrgID as org_ID,serviceType_LV, minServiceTime,minServiceTimeAfterOnHold,maxServiceTime
        ,maxWaitingTime,kPI_AST_TargetValue,kPI_AST_MaxAcceptedValue,kPI_AST_StartValue,kPI_AST_EndValue,kPI_AWT_TargetValue
        ,kPI_AWT_MaxAcceptedValue,kPI_AWT_StartValue,kPI_AWT_EndValue,kPI_TRE_TargetValue,kPI_TRE_MinAcceptedValue,kPI_TRE_StartValue
        ,kPI_TRE_EndValue,kPI_PSC_TargetValue,kPI_PSC_MaxAcceptedValue,kPI_PSC_StartValue,kPI_PSC_EndValue,kPI_WCN_TargetValue,kPI_WCN_MaxAcceptedValue
        ,kPI_WCN_StartValue,kPI_WCN_EndValue from T_ServiceConfig`;
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.serviceConfig = Results.recordset;
        }

        //Counter
        request = new mssql.Request();
        command = `select id,OrgID as org_ID,QueueBranch_ID as branch_ID,name_L1,name_L2,name_L3,name_L4,type_LV,Number as counterNumber,hall_ID,
        screenTitle,announcementKeys,segmentAllocationType  from T_Counter`;
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.counters = Results.recordset;
        }

        //Priority Ranges
        request = new mssql.Request();
        command = "select id,OrgID as org_ID,symbol,priority,minSlipNo,maxSlipNo,separator_LV from T_PriorityRange";
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.priorityRanges = Results.recordset;
        }


        //Segment Allocation
        request = new mssql.Request();
        command = "select OrgID as org_ID,QueueBranch_ID as branch_ID,segment_ID,counter_ID,user_ID from T_SegmentAllocation";
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.segmentsAllocation = Results.recordset;
        }

        //Segments
        request = new mssql.Request();
        command = "select id,OrgID as org_ID,identificationValue,name_L1,name_L2,name_L3,name_L4,SlipOption_LV as ticketOption_LV,ShowOnKiosk as showOnTicketingSoftware,useForIdentification,importantSegment from T_Segment";
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.segments = Results.recordset;
        }

        //Service Segments
        request = new mssql.Request();
        command = "select OrgID as org_ID,segment_ID,service_ID,priorityRange_ID from T_ServiceSegmentPriorityRange";
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.serviceSegmentPriorityRanges = Results.recordset;
        }


        //Service Allocation
        request = new mssql.Request();
        command = `  select T_ServiceAllocation.id as id,T_ServiceAllocation.OrgID as org_ID,T_ServiceAllocation.QueueBranch_ID as branch_ID
        ,T_ServiceAllocation.service_ID as service_ID,T_ServiceAllocation.counter_ID as counter_ID,T_ServiceAllocation.user_ID,T_ServiceAllocation.priorityLevel
        ,workflow from T_ServiceAllocation join T_ServiceWorkflow on (T_ServiceAllocation.Service_ID =T_ServiceWorkflow.Service_ID 
        and  T_ServiceAllocation.QueueBranch_ID =T_ServiceWorkflow.QueueBranch_ID)`;
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.serviceAllocations = Results.recordset;
        }

        //Users
        request = new mssql.Request();
        command = `select id,OrgID as org_ID,department_ID,name_L1,name_L2,name_L3,name_L4,loginName,password,mobilePhone,email,pinCode,authenticationType_LV
        userADGUID,shouldChangePassword,locked,lastLoginTime,lastLogoutTime,language_ID,failedLogins,lastPasswordChangeTime
        userToken,activeOnBranch_ID,type_LV,segmentAllocationType  from T_User`;

        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.users = Results.recordset;
        }

        //Branch Users
        request = new mssql.Request();
        command = `  select OrgID as org_ID,ObjectID2 as userID,ObjectID1 as branchID,supervising,monitoring,serving,alertReceiving 
        from R_QueueBranch_User`;
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.branchesUsers = Results.recordset;
        }

        //Branch Service
        request = new mssql.Request();
        command = "select OrgID as org_ID,ObjectID1 as branch_ID,ObjectID2 as service_ID from R_QueueBranch_Service";
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.branch_serviceAllocations = Results.recordset;
        }

        //Services
        request = new mssql.Request();
        command = `SELECT id,OrgID as org_ID,department_ID,serviceConfig_ID,identificationValue,calendar_ID,numberOfTickets,orderOfServing,
        serviceGroup_ID,addAnotherToThisService,addThisToAnotherService,transferAnotherToThisService, transferThisToAnotherService,
        transferToCounter,displayOnKiosk,showOnAppointment,showOnRemoteAppointment,showOnRemoteTicketing,maxCustomersPerDay,useBranchCalendar,
        specifyCounter,specifyCustomerIdentification,canSkipCustomerIdentification,customerIdentificationID,specifyPrerequisiteURL,prerequisiteURL FROM T_Service`;
        Results = await request.query(command);
        if (Results != undefined && Results.recordset != undefined && Results.recordset.length > 0) {
            dbConfigs.services = Results.recordset;
        }


        return dbConfigs;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Get entities
var GetAll = async function (entityname) {
    try {
        if (connection == null) {
            connection = await mssql.connect(config);
        }

        var request = new mssql.Request();
        var command = "select * from T_" + entityname;
        var Results = await request.query(command);
        return Results;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Get By Filter
var GetByFilter = async function (entityname, FilterName, FilterValue) {

    try {


        if (connection == null) {
            connection = await mssql.connect(config);
        }

        var request = new mssql.Request();
        var command = "select * from T_" + entityname + " where " + FilterName + " = " + FilterValue;
        var Results = await request.query(command);
        return Results;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};

module.exports.GetAll = GetAll;
module.exports.GetByFilter = GetByFilter;
module.exports.GetAllEntities = GetAllEntities;
