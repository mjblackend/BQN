//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var configRepository = require("../remoteRepositories/configRepository");
var ConfigsWrapper = require("./ConfigsWrapper");
var configsCache = new ConfigsWrapper();
var fs = require("fs");

//Populate branch cofigs
var populateEntities = async function () {
    try {

        if (configsCache.branches && configsCache.branches.length > 0) {
            for (let i = 0; i < configsCache.branches.length; i++) {
                let BranchID = configsCache.branches[i].ID;
                let BranchConfigID = configsCache.branches[i].BranchConfig_ID;
                //Assign counters
                if (configsCache.counters && configsCache.counters.length > 0) {
                    configsCache.branches[i].counters = configsCache.counters.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    }
                    );
                }
                else {
                    configsCache.branches[i].counters = [];
                }

                //Branch Users Allocations
                if (configsCache.branch_UsersAllocations && configsCache.branch_UsersAllocations.length > 0) {
                    configsCache.branches[i].usersAllocations = configsCache.branch_UsersAllocations.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    }
                    );
                }
                else {
                    configsCache.branches[i].usersAllocations = [];
                }

                //Halls
                if (configsCache.halls && configsCache.halls.length > 0) {
                    configsCache.branches[i].halls = configsCache.halls.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    }
                    );
                }
                else {
                    configsCache.branches[i].halls = [];
                }

                //Segment Allocations
                if (configsCache.segmentsAllocations && configsCache.segmentsAllocations.length > 0) {
                    configsCache.branches[i].segmentsAllocations = configsCache.segmentsAllocations.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    }
                    );
                }
                else {
                    configsCache.branches[i].segmentsAllocations = [];
                }

                //Serives allocations
                if (configsCache.servicesAllocations && configsCache.servicesAllocations.length > 0) {
                    configsCache.branches[i].servicesAllocations = configsCache.servicesAllocations.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    }
                    );
                }
                else {
                    configsCache.branches[i].servicesAllocations = [];
                }

                //commonConfigs
                if (configsCache.commonConfigs && configsCache.commonConfigs.length > 0) {
                    configsCache.branches[i].settings = configsCache.commonConfigs.filter(function (value) {
                        return (value.BranchConfig_ID == null && value.QueueBranch_ID == null) || value.BranchConfig_ID == BranchConfigID || value.QueueBranch_ID == BranchID;
                    }
                    );
                }
                else {
                    configsCache.branches[i].settings = [];
                }

            }
        }


        //fs.writeFileSync("Configs.json", JSON.stringify(configsCache));

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

/*eslint complexity: ["error", 100]*/
//Cache Server Configs from DB
var cacheServerEnities = async function () {
    try {

        let result = common.success;

        //Counters
        let counter = require("./Counter_Config");
        let counterInst = new counter();
        let attributes = Object.getOwnPropertyNames(counterInst);
        let Results = await configRepository.GetByFilter(attributes, "T_Counter", "Active", "1");
        if (Results && Results.length > 0) {
            configsCache.counters = Results;
        }

        //Halls
        let hall = require("./Hall_Config");
        let hallInst = new hall();
        attributes = Object.getOwnPropertyNames(hallInst);
        Results = await configRepository.GetAll(attributes, "T_Hall", "Active", "1");
        if (Results && Results.length > 0) {
            configsCache.halls = Results;
        }

        //PriorityRanges
        let PriorityRange = require("./PriorityRange_Config");
        let tPriorityRange = new PriorityRange();
        attributes = Object.getOwnPropertyNames(tPriorityRange);
        Results = await configRepository.GetAll(attributes, "T_PriorityRange");
        if (Results && Results.length > 0) {
            configsCache.priorityRanges = Results;
        }


        //Special case since the many to many have same columns names
        attributes = ["OrgID", "ObjectID1 as QueueBranch_ID", "ObjectID2 as Service_ID"];
        Results = await configRepository.GetAll(attributes, "R_QueueBranch_Service");
        if (Results && Results.length > 0) {
            configsCache.branch_serviceAllocations = Results;
        }

        //segments
        let Segment = require("./Segment_Config");
        let tSegment = new Segment();
        attributes = Object.getOwnPropertyNames(tSegment);
        Results = await configRepository.GetAll(attributes, "T_Segment", "Active", "1");
        if (Results && Results.length > 0) {
            configsCache.segments = Results;
        }


        //segments Allocate
        let SegmentAllocation = require("./SegmentAllocation_Config");
        let tSegmentAllocation = new SegmentAllocation();
        attributes = Object.getOwnPropertyNames(tSegmentAllocation);
        Results = await configRepository.GetAll(attributes, "T_SegmentAllocation");
        if (Results && Results.length > 0) {
            configsCache.segmentsAllocations = Results;
        }



        //services
        let Service = require("./Service_Config");
        let tService = new Service();
        attributes = Object.getOwnPropertyNames(tService);
        Results = await configRepository.GetAll(attributes, "T_Service", "Active", "1");
        if (Results && Results.length > 0) {
            configsCache.services = Results;
        }


        //services Allocate
        let ServiceAllocation = require("./ServiceAllocation_Config");
        let tServiceAllocation = new ServiceAllocation();
        attributes = Object.getOwnPropertyNames(tServiceAllocation);
        Results = await configRepository.GetAll(attributes, "T_ServiceAllocation");
        if (Results && Results.length > 0) {
            configsCache.servicesAllocations = Results;
        }



        //services Config
        let ServiceConfig = require("./ServiceConfig_Config");
        let tServiceConfig = new ServiceConfig();
        attributes = Object.getOwnPropertyNames(tServiceConfig);
        Results = await configRepository.GetAll(attributes, "T_ServiceConfig", "Active", "1");
        if (Results && Results.length > 0) {
            configsCache.serviceConfigs = Results;
        }


        //Service Segment Priority Range
        let ServiceSegmentPriorityRange = require("./ServiceSegmentPriorityRange_Config");
        let tServiceSegmentPriorityRange = new ServiceSegmentPriorityRange();
        attributes = Object.getOwnPropertyNames(tServiceSegmentPriorityRange);
        Results = await configRepository.GetAll(attributes, "T_ServiceSegmentPriorityRange");
        if (Results && Results.length > 0) {
            configsCache.serviceSegmentPriorityRanges = Results;
        }

        //Service Workflow Config
        let ServiceWorkflow = require("./ServiceWorkflow_Config");
        let tServiceWorkflow = new ServiceWorkflow();
        attributes = Object.getOwnPropertyNames(tServiceWorkflow);
        Results = await configRepository.GetAll(attributes, "T_ServiceWorkflow");
        if (Results && Results.length > 0) {
            configsCache.serviceWorkFlow = Results;
        }


        //User Config
        let User = require("./User_Config");
        let tUser = new User();
        attributes = Object.getOwnPropertyNames(tUser);
        Results = await configRepository.GetAll(attributes, "T_User");
        if (Results && Results.length > 0) {
            configsCache.users = Results;
        }


        //User Allocation Config
        let UserAllocation = require("./UserAllocation_Config");
        let tUserAllocation = new UserAllocation();
        attributes = Object.getOwnPropertyNames(tUserAllocation);
        Results = await configRepository.GetAll(attributes, "X_USERS_BRANCHES");
        if (Results && Results.length > 0) {
            configsCache.branch_UsersAllocations = Results;
        }


        //Common Config
        let CommonConfig = require("./CommonConfig_Config");
        let tCommonConfig = new CommonConfig();
        attributes = Object.getOwnPropertyNames(tCommonConfig);
        Results = await configRepository.GetAll(attributes, "T_CommonConfig");
        if (Results && Results.length > 0) {
            configsCache.commonConfigs = Results;
        }


        //Branches
        let branch = require("./QueueBranch_config");
        let branchInst = new branch();
        attributes = Object.getOwnPropertyNames(branchInst);
        Results = await configRepository.GetAll(attributes, "T_QueueBranch", "Active", "1");
        if (Results && Results.length > 0) {
            configsCache.branches = Results;
        }

        result = await populateEntities();


        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var Read = function (apiMessagePayLoad) {
    try {
        let servicesAllocations;
        let result = common.error;
        if (apiMessagePayLoad) {
            switch (apiMessagePayLoad.EntityName.toLowerCase()) {
                case "branch":
                    apiMessagePayLoad.branches = this.configsCache.branches;
                    result = common.success;
                    break;
                case "counter":
                    apiMessagePayLoad.counters = this.configsCache.counters.filter(function (value) {
                        return value.QueueBranch_ID == apiMessagePayLoad.BranchID && (!apiMessagePayLoad.types || apiMessagePayLoad.types.indexOf(value.Type_LV.toString()) > -1);
                    });
                    result = common.success;
                    break;

                case "segment":
                    apiMessagePayLoad.segments = this.configsCache.segments;
                    apiMessagePayLoad.serviceSegmentPriorityRanges = this.configsCache.serviceSegmentPriorityRanges;
                    result = common.success;
                    break;

                case "service":
                    servicesAllocations = this.configsCache.branch_serviceAllocations.filter(function (value) {
                        return value.QueueBranch_ID == apiMessagePayLoad.BranchID;
                    });
                    apiMessagePayLoad.services = this.configsCache.services.filter(function (value) {
                        for (let i = 0; i < servicesAllocations.length; i++) {
                            if (servicesAllocations[i].Service_ID == value.ID) {
                                return true;
                            }
                        }
                        return false;
                    });
                    result = common.success;
                    break;
                default:
                    result = common.error;
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



var initialize = async function () {
    try {
        if (common.moch) {
            let configs = await fs.readFileSync("Configs.json");
            this.configsCache = JSON.parse(configs);
            return common.success;
        }
        else {
            var result = await cacheServerEnities();
            return result;
        }

    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

module.exports.Read = Read;
module.exports.initialize = initialize;
module.exports.configsCache = configsCache;
