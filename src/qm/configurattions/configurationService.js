//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var configRepository = require("../remoteRepositories/configRepository");
var ConfigsWrapper = require("./ConfigsWrapper");
var ConfigsCache = new ConfigsWrapper();

var cacheServerEnities = async function () {
    try {

        //Counters
        let counter = require("./Counter_Config");
        let counterInst = new counter();
        let attributes = Object.getOwnPropertyNames(counterInst);
        let Results = await configRepository.GetAll(attributes, "T_Counter");
        if (Results && Results.length > 0) {
            ConfigsCache.counters = Results;
        }

        //Halls
        let hall = require("./Hall_Config");
        let hallInst = new hall();
        attributes = Object.getOwnPropertyNames(hallInst);
        Results = await configRepository.GetAll(attributes, "T_Hall");
        if (Results && Results.length > 0) {
            ConfigsCache.halls = Results;
        }

        //PriorityRanges
        let PriorityRange = require("./PriorityRange_Config");
        let tPriorityRange = new PriorityRange();
        attributes = Object.getOwnPropertyNames(tPriorityRange);
        Results = await configRepository.GetAll(attributes, "T_PriorityRange");
        if (Results && Results.length > 0) {
            ConfigsCache.priorityRanges = Results;
        }


        //Special case since the many to many have same columns names
        attributes = ["OrgID", "ObjectID1 as QueueBranch_ID", "ObjectID2 as Service_ID"];
        Results = await configRepository.GetAll(attributes, "R_QueueBranch_Service");
        if (Results && Results.length > 0) {
            ConfigsCache.branch_serviceAllocations = Results;
        }

        //segments
        let Segment = require("./Segment_Config");
        let tSegment = new Segment();
        attributes = Object.getOwnPropertyNames(tSegment);
        Results = await configRepository.GetAll(attributes, "T_Segment");
        if (Results && Results.length > 0) {
            ConfigsCache.segments = Results;
        }


        //segments Allocate
        let SegmentAllocation = require("./SegmentAllocation_Config");
        let tSegmentAllocation = new SegmentAllocation();
        attributes = Object.getOwnPropertyNames(tSegmentAllocation);
        Results = await configRepository.GetAll(attributes, "T_SegmentAllocation");
        if (Results && Results.length > 0) {
            ConfigsCache.segmentsAllocation = Results;
        }



        //services
        let Service = require("./Service_Config");
        let tService = new Service();
        attributes = Object.getOwnPropertyNames(tService);
        Results = await configRepository.GetAll(attributes, "T_Service");
        if (Results && Results.length > 0) {
            ConfigsCache.services = Results;
        }


        //services Allocate
        let ServiceAllocation = require("./ServiceAllocation_Config");
        let tServiceAllocation = new ServiceAllocation();
        attributes = Object.getOwnPropertyNames(tServiceAllocation);
        Results = await configRepository.GetAll(attributes, "T_ServiceAllocation");
        if (Results && Results.length > 0) {
            ConfigsCache.serviceAllocations = Results;
        }



        //services Config
        let ServiceConfig = require("./ServiceConfig_Config");
        let tServiceConfig = new ServiceConfig();
        attributes = Object.getOwnPropertyNames(tServiceConfig);
        Results = await configRepository.GetAll(attributes, "T_ServiceConfig");
        if (Results && Results.length > 0) {
            ConfigsCache.serviceConfigs = Results;
        }


        //Service Segment Priority Range
        let ServiceSegmentPriorityRange = require("./ServiceSegmentPriorityRange_Config");
        let tServiceSegmentPriorityRange = new ServiceSegmentPriorityRange();
        attributes = Object.getOwnPropertyNames(tServiceSegmentPriorityRange);
        Results = await configRepository.GetAll(attributes, "T_ServiceSegmentPriorityRange");
        if (Results && Results.length > 0) {
            ConfigsCache.serviceSegmentPriorityRanges = Results;
        }

        //Service Workflow Config
        let ServiceWorkflow = require("./ServiceWorkflow_Config");
        let tServiceWorkflow = new ServiceWorkflow();
        attributes = Object.getOwnPropertyNames(tServiceWorkflow);
        Results = await configRepository.GetAll(attributes, "T_ServiceWorkflow");
        if (Results && Results.length > 0) {
            ConfigsCache.serviceWorkFlow = Results;
        }


        //User Config
        let User = require("./User_Config");
        let tUser = new User();
        attributes = Object.getOwnPropertyNames(tUser);
        Results = await configRepository.GetAll(attributes, "T_User");
        if (Results && Results.length > 0) {
            ConfigsCache.users = Results;
        }


        //User Allocation Config
        attributes = ["OrgID", "ObjectID1 as QueueBranch_ID", "ObjectID2 as User_ID","Supervising","Monitoring","Serving","AlertReceiving"];
        Results = await configRepository.GetAll(attributes, "R_QueueBranch_User");
        if (Results && Results.length > 0) {
            ConfigsCache.branch_UsersAllocations = Results;
        }



        //Branches
        let branch = require("./QueueBranch_config");
        let branchInst = new branch();
        attributes = Object.getOwnPropertyNames(branchInst);
        Results = await configRepository.GetAll(attributes, "T_QueueBranch");
        if (Results && Results.length > 0) {
            ConfigsCache.branches = Results;
        }

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var initialize = async function () {
    try {
        var result = await cacheServerEnities();
        if (result == common.success) {
            return true;
        }
        else
        {
            return false;
        }
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};


module.exports.initialize = initialize;
module.exports.configsCache = ConfigsCache;
