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
function isArrayValid(ArrayOfEntities) {
    return ArrayOfEntities && ArrayOfEntities.length > 0;
}

function filterArray(ArrayOfEntities, BranchID) {
    let tArray = [];
    if (isArrayValid(ArrayOfEntities)) {
        tArray = ArrayOfEntities.filter(function (value) {
            return value.QueueBranch_ID.toString() == BranchID.toString();
        });
    }
    return tArray;
}

function find(ArrayOfEntities, EntityID) {
    let Entity;
    if (isArrayValid(ArrayOfEntities)) {
        Entity = ArrayOfEntities.find(function (value) {
            return value.ID.toString() == EntityID.toString();
        });
    }
    return Entity;
}

function filterCommonConfigs(ArrayOfEntities, BranchID, BranchConfigID) {
    if (isArrayValid(ArrayOfEntities)) {
        return ArrayOfEntities.filter(function (value) {
            return (value.BranchConfig_ID == null && value.QueueBranch_ID == null) || value.BranchConfig_ID == BranchConfigID || value.QueueBranch_ID == BranchID;
        });
    }
    else {
        return [];
    }
}

//Populate branch cofigs
var populateEntities = async function () {
    try {

        if (isArrayValid(configsCache.branches)) {
            for (let i = 0; i < configsCache.branches.length; i++) {
                let BranchID = configsCache.branches[i].ID;
                let BranchConfigID = configsCache.branches[i].BranchConfig_ID;
                //Assign counters
                configsCache.branches[i].counters = filterArray(configsCache.counters, BranchID);
                //Branch Users Allocations
                configsCache.branches[i].usersAllocations = filterArray(configsCache.branch_UsersAllocations, BranchID);
                //Halls
                configsCache.branches[i].halls = filterArray(configsCache.halls, BranchID);
                //Segment Allocations
                configsCache.branches[i].segmentsAllocations = filterArray(configsCache.segmentsAllocations, BranchID);
                //Serives allocations
                configsCache.branches[i].servicesAllocations = filterArray(configsCache.servicesAllocations, BranchID);
                //commonConfigs
                configsCache.branches[i].settings = filterCommonConfigs(configsCache.commonConfigs, BranchID, BranchConfigID);
            }
        }
        fs.writeFileSync("Configs.json", JSON.stringify(configsCache));
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

function getCounterConfig(CounterID) {
    //counter Config
    let counter = this.configsCache.counters.find(function (value) {
        return value.ID == CounterID;
    }
    );
    return counter;
}

function getBranchConfig(BranchID) {
    //Branch Config
    var branch = this.configsCache.branches.find(function (value) {
        return value.ID == BranchID;
    });
    return branch;
}


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
        configsCache.priorityRanges = await getAllEntities("PriorityRange_Config", "T_PriorityRange");
        //Special case since the many to many have same columns names
        configsCache.branch_serviceAllocations = await getBranchServiceAllocation();
        //segments
        configsCache.segments = await getEntitiesFilter("Segment_Config", "T_Segment", "Active", "1");
        //segments Allocate
        configsCache.segmentsAllocations = await getAllEntities("SegmentAllocation_Config", "T_SegmentAllocation");
        //services
        configsCache.services = await getEntitiesFilter("Service_Config", "T_Service", "Active", "1");
        //services Allocate
        configsCache.servicesAllocations = await getAllEntities("ServiceAllocation_Config", "T_ServiceAllocation");
        //services Config
        configsCache.serviceConfigs = await await getAllEntities("ServiceConfig_Config", "T_ServiceConfig");
        //Service Segment Priority Range
        configsCache.serviceSegmentPriorityRanges = await getAllEntities("ServiceSegmentPriorityRange_Config", "T_ServiceSegmentPriorityRange");
        //Service Workflow Config
        configsCache.serviceWorkFlow = await getAllEntities("ServiceWorkflow_Config", "T_ServiceWorkflow");
        //User Config
        configsCache.users = await getAllEntities("User_Config", "T_User");
        //User Allocation Config
        configsCache.branch_UsersAllocations = await getAllEntities("UserAllocation_Config", "X_USERS_BRANCHES");
        //Common Config
        configsCache.commonConfigs = await getAllEntities("CommonConfig_Config", "T_CommonConfig");

        result = await populateEntities();
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

function ReadCounters(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.counters = Cache.counters.filter(function (value) {
        return value.QueueBranch_ID == apiMessagePayLoad.BranchID && (!apiMessagePayLoad.types || apiMessagePayLoad.types.indexOf(value.Type_LV.toString()) > -1);
    });
    return common.success;
}

function ReadServices(apiMessagePayLoad, Cache) {
    let servicesAllocations = Cache.branch_serviceAllocations.filter(function (value) {
        return value.QueueBranch_ID == apiMessagePayLoad.BranchID;
    });
    apiMessagePayLoad.services = Cache.services.filter(function (value) {
        for (let i = 0; i < servicesAllocations.length; i++) {
            if (servicesAllocations[i].Service_ID == value.ID) {
                return true;
            }
        }
        return false;
    });
    return common.success;
}
function ReadBranches(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.branches = Cache.branches;
    return common.success;
}
function ReadSegments(apiMessagePayLoad, Cache) {
    apiMessagePayLoad.segments = Cache.segments;
    apiMessagePayLoad.serviceSegmentPriorityRanges = Cache.serviceSegmentPriorityRanges;
    return common.success;
}


var Read = function (apiMessagePayLoad) {
    try {
        if (apiMessagePayLoad) {
            switch (apiMessagePayLoad.EntityName.toLowerCase()) {
                case ReadCommands.branch:
                    return ReadBranches(apiMessagePayLoad, this.configsCache);
                case ReadCommands.counter:
                    return ReadCounters(apiMessagePayLoad, this.configsCache);
                case ReadCommands.segment:
                    return ReadSegments(apiMessagePayLoad, this.configsCache)
                case ReadCommands.service:
                    return ReadServices(apiMessagePayLoad, this.configsCache);

                default:
                    return common.error;
            }
        }
        return common.error;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



var getService = function (ServiceID) {
    return find(this.configsCache.services, ServiceID);
};

var getServiceConfig = function (ServiceConfigID) {
    return find(this.configsCache.serviceConfigs, ServiceConfigID);
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
        if (common.mock) {
            let str = fs.readFileSync("Configs.json")
            this.configsCache = JSON.parse(str);
            return common.success;
        }
        else {
            var result = await cacheServerEnities();
            return result;
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.getCounterConfig = getCounterConfig;
module.exports.getBranchConfig = getBranchConfig;
module.exports.getService = getService;
module.exports.getServiceConfig = getServiceConfig;
module.exports.getServiceConfigFromService = getServiceConfigFromService;
module.exports.getCommonSettings = getCommonSettings;
module.exports.Read = Read;
module.exports.initialize = initialize;
module.exports.configsCache = configsCache;
