//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var configRepository = require("../remoteRepositories/configRepository");
var ConfigsWrapper = require("./ConfigsWrapper");
var configsCache = new ConfigsWrapper();
var fs = require("fs");

var ReadCommands = {
    branch: "branch",
    counter: "counter",
    segment: "segment",
    service: "service"
};


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
                    });
                }
                else {
                    configsCache.branches[i].counters = [];
                }

                //Branch Users Allocations
                if (configsCache.branch_UsersAllocations && configsCache.branch_UsersAllocations.length > 0) {
                    configsCache.branches[i].usersAllocations = configsCache.branch_UsersAllocations.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    });
                }
                else {
                    configsCache.branches[i].usersAllocations = [];
                }

                //Halls
                if (configsCache.halls && configsCache.halls.length > 0) {
                    configsCache.branches[i].halls = configsCache.halls.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    });
                }
                else {
                    configsCache.branches[i].halls = [];
                }

                //Segment Allocations
                if (configsCache.segmentsAllocations && configsCache.segmentsAllocations.length > 0) {
                    configsCache.branches[i].segmentsAllocations = configsCache.segmentsAllocations.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    });
                }
                else {
                    configsCache.branches[i].segmentsAllocations = [];
                }

                //Serives allocations
                if (configsCache.servicesAllocations && configsCache.servicesAllocations.length > 0) {
                    configsCache.branches[i].servicesAllocations = configsCache.servicesAllocations.filter(function (value) {
                        return value.QueueBranch_ID == BranchID;
                    });
                }
                else {
                    configsCache.branches[i].servicesAllocations = [];
                }

                //commonConfigs
                if (configsCache.commonConfigs && configsCache.commonConfigs.length > 0) {
                    configsCache.branches[i].settings = configsCache.commonConfigs.filter(function (value) {
                        return (value.BranchConfig_ID == null && value.QueueBranch_ID == null) || value.BranchConfig_ID == BranchConfigID || value.QueueBranch_ID == BranchID;
                    });
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

var getCommonSettings = function (BranchID, Key) {
    try {
        //Get Branch Data
        let BracnhConfig = this.configsCache.branches.find(function (value) {
            return value.ID == BranchID;
        }
        );

        if (BracnhConfig) {
            let commonConfig = BracnhConfig.settings.find(function (value) {
                return value.Key == Key;
            });

            if (commonConfig) {
                return commonConfig.Value;
            }
        }
    }
    catch (error) {
        logger.logError(error);
    }
};

/*eslint complexity: ["error", 100]*/
async function getBranchServiceAllocation() {
    //Special case since the many to many have same columns names
    let attributes = ["OrgID", "ObjectID1 as QueueBranch_ID", "ObjectID2 as Service_ID"];
    return await configRepository.GetAll(attributes, "R_QueueBranch_Service");
}
async function getEntitiesFilter(EntityClass, EntityTable, Filter, FilterValue) {
    let DBEntity = require("./" + EntityClass);
    let tDBEntity = new DBEntity();
    let attributes = Object.getOwnPropertyNames(tDBEntity);
    return await configRepository.GetByFilter(attributes, EntityTable, Filter, FilterValue);
}
async function getAllEntities(EntityClass, EntityTable) {
    let DBEntity = require("./" + EntityClass);
    let tDBEntity = new DBEntity();
    let attributes = Object.getOwnPropertyNames(tDBEntity);
    return await configRepository.GetAll(attributes, EntityTable);
}
//Cache Server Configs from DB
var cacheServerEnities = async function () {
    try {
        
        let result = common.success;
        //Branches
        configsCache.branches = await getEntitiesFilter("QueueBranch_config", "T_QueueBranch", "Active", "1");
        //Counters
        configsCache.counters = await getEntitiesFilter("Counter_Config", "T_Counter", "Active", "1");
        //Halls
        configsCache.halls = await getEntitiesFilter("Hall_Config", "T_Hall", "Active", "1");
        //PriorityRanges
        configsCache.priorityRanges = await getAllEntities("PriorityRange_Config", "T_PriorityRange" );
        //Special case since the many to many have same columns names
        configsCache.branch_serviceAllocations = await getBranchServiceAllocation();
        //segments
        configsCache.segments = await getEntitiesFilter("Segment_Config", "T_Segment", "Active", "1");
        //segments Allocate
        configsCache.segmentsAllocations = await getAllEntities("SegmentAllocation_Config", "T_SegmentAllocation" );
        //services
        configsCache.services = await getEntitiesFilter("Service_Config", "T_Service", "Active", "1");
        //services Allocate
        configsCache.servicesAllocations = await getAllEntities("ServiceAllocation_Config", "T_ServiceAllocation" );
        //services Config
        configsCache.serviceConfigs = await await getEntitiesFilter("ServiceConfig_Config", "T_ServiceConfig", "Active", "1");
        //Service Segment Priority Range
        configsCache.serviceSegmentPriorityRanges = await getAllEntities("ServiceSegmentPriorityRange_Config", "T_ServiceSegmentPriorityRange" );
        //Service Workflow Config
        configsCache.serviceWorkFlow = await getAllEntities("ServiceWorkflow_Config", "T_ServiceWorkflow" );
        //User Config
        configsCache.users = await getAllEntities("User_Config", "T_User" );
        //User Allocation Config
        configsCache.branch_UsersAllocations = await getAllEntities("UserAllocation_Config", "X_USERS_BRANCHES" );
        //Common Config
        configsCache.commonConfigs = await getAllEntities("CommonConfig_Config", "T_CommonConfig" );

        result = await populateEntities();
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

function ReadCounters(apiMessagePayLoad,Cache) {
    return Cache.counters.filter(function (value) {
        return value.QueueBranch_ID == apiMessagePayLoad.BranchID && (!apiMessagePayLoad.types || apiMessagePayLoad.types.indexOf(value.Type_LV.toString()) > -1);
    });
}

function ReadServices(BranchID,Cache) {
    let servicesAllocations = Cache.branch_serviceAllocations.filter(function (value) {
        return value.QueueBranch_ID == BranchID;
    });
    return Cache.services.filter(function (value) {
        for (let i = 0; i < servicesAllocations.length; i++) {
            if (servicesAllocations[i].Service_ID == value.ID) {
                return true;
            }
        }
        return false;
    });
}

var Read = function (apiMessagePayLoad) {
    try {
        let result = common.error;
        if (apiMessagePayLoad) {
            switch (apiMessagePayLoad.EntityName.toLowerCase()) {
                case ReadCommands.branch:
                    apiMessagePayLoad.branches = this.configsCache.branches;
                    result = common.success;
                    break;
                case ReadCommands.counter:
                    apiMessagePayLoad.counters = ReadCounters(apiMessagePayLoad,this.configsCache);
                    result = common.success;
                    break;
                case ReadCommands.segment:
                    apiMessagePayLoad.segments = this.configsCache.segments;
                    apiMessagePayLoad.serviceSegmentPriorityRanges = this.configsCache.serviceSegmentPriorityRanges;
                    result = common.success;
                    break;

                case ReadCommands.service:
                    apiMessagePayLoad.services = ReadServices(apiMessagePayLoad.BranchID,this.configsCache);
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



var getService = function (ServiceID) {
    return this.configsCache.services.find(function (value) { return value.ID == ServiceID; });
};

var getServiceConfig = function (ServiceConfigID) {
    return this.configsCache.serviceConfigs.find(function (value) { return value.ID == ServiceConfigID; });
};

var getServiceConfigFromService = function (ServiceID) {
    try {
        //Get min service time
        let service = this.getService(ServiceID);

        //Get min service time
        let serviceConfig = this.getServiceConfig(service.ServiceConfig_ID);

        return serviceConfig;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
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

module.exports.getService = getService;
module.exports.getServiceConfig = getServiceConfig;
module.exports.getServiceConfigFromService = getServiceConfigFromService;
module.exports.getCommonSettings = getCommonSettings;
module.exports.Read = Read;
module.exports.initialize = initialize;
module.exports.configsCache = configsCache;
