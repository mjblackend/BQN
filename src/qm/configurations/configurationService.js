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

/*eslint complexity: ["error", 100]*/

async function getCounters() {
    //Counters
    let counter = require("./Counter_Config");
    let counterInst = new counter();
    let attributes = Object.getOwnPropertyNames(counterInst);
    return await configRepository.GetByFilter(attributes, "T_Counter", "Active", "1");
}

async function getHalls() {
    //Halls
    let hall = require("./Hall_Config");
    let hallInst = new hall();
    let attributes = Object.getOwnPropertyNames(hallInst);
    return await configRepository.GetAll(attributes, "T_Hall", "Active", "1");
}


async function getPriorityRanges() {
    //PriorityRanges
    let PriorityRange = require("./PriorityRange_Config");
    let tPriorityRange = new PriorityRange();
    let attributes = Object.getOwnPropertyNames(tPriorityRange);
    return await configRepository.GetAll(attributes, "T_PriorityRange");
}

async function getBranchServiceAllocation() {
    //Special case since the many to many have same columns names
    let attributes = ["OrgID", "ObjectID1 as QueueBranch_ID", "ObjectID2 as Service_ID"];
    return await configRepository.GetAll(attributes, "R_QueueBranch_Service");
}


async function getSegments() {
    //segments
    let Segment = require("./Segment_Config");
    let tSegment = new Segment();
    let attributes = Object.getOwnPropertyNames(tSegment);
    return await configRepository.GetAll(attributes, "T_Segment", "Active", "1");
}

async function getSegmentAllocation() {
    //segments Allocate
    let SegmentAllocation = require("./SegmentAllocation_Config");
    let tSegmentAllocation = new SegmentAllocation();
    let attributes = Object.getOwnPropertyNames(tSegmentAllocation);
    return await configRepository.GetAll(attributes, "T_SegmentAllocation");
}

async function getServices() {
    //Services
    let Service = require("./Service_Config");
    let tService = new Service();
    let attributes = Object.getOwnPropertyNames(tService);
    return await configRepository.GetAll(attributes, "T_Service", "Active", "1");
}

async function getServicesAllocation() {
    //services Allocate
    let ServiceAllocation = require("./ServiceAllocation_Config");
    let tServiceAllocation = new ServiceAllocation();
    let attributes = Object.getOwnPropertyNames(tServiceAllocation);
    return await configRepository.GetAll(attributes, "T_ServiceAllocation");
}

async function getServicesConfigs() {
    //services Config
    let ServiceConfig = require("./ServiceConfig_Config");
    let tServiceConfig = new ServiceConfig();
    let attributes = Object.getOwnPropertyNames(tServiceConfig);
    return await configRepository.GetAll(attributes, "T_ServiceConfig", "Active", "1");
}

async function getServiceSegmentPriorityRange() {
    //Service Segment Priority Range
    let ServiceSegmentPriorityRange = require("./ServiceSegmentPriorityRange_Config");
    let tServiceSegmentPriorityRange = new ServiceSegmentPriorityRange();
    let attributes = Object.getOwnPropertyNames(tServiceSegmentPriorityRange);
    return await configRepository.GetAll(attributes, "T_ServiceSegmentPriorityRange");

}

async function getServiceWorkflow() {
    //Service Workflow Config
    let ServiceWorkflow = require("./ServiceWorkflow_Config");
    let tServiceWorkflow = new ServiceWorkflow();
    let attributes = Object.getOwnPropertyNames(tServiceWorkflow);
    return await configRepository.GetAll(attributes, "T_ServiceWorkflow");
}

async function getUsers() {
    //User Config
    let User = require("./User_Config");
    let tUser = new User();
    let attributes = Object.getOwnPropertyNames(tUser);
    return await configRepository.GetAll(attributes, "T_User");
}

async function getUserAllocations() {
    //User Allocation Config
    let UserAllocation = require("./UserAllocation_Config");
    let tUserAllocation = new UserAllocation();
    let attributes = Object.getOwnPropertyNames(tUserAllocation);
    return await configRepository.GetAll(attributes, "X_USERS_BRANCHES");
}

async function getBranches() {
    //Branches
    let branch = require("./QueueBranch_config");
    let branchInst = new branch();
    let attributes = Object.getOwnPropertyNames(branchInst);
    return await configRepository.GetAll(attributes, "T_QueueBranch", "Active", "1");
}

async function getCommonConfig() {
    //Common Config
    let CommonConfig = require("./CommonConfig_Config");
    let tCommonConfig = new CommonConfig();
    let attributes = Object.getOwnPropertyNames(tCommonConfig);
    return await configRepository.GetAll(attributes, "T_CommonConfig");
}


//Cache Server Configs from DB
var cacheServerEnities = async function () {
    try {

        let result = common.success;
        //Counters
        configsCache.counters = await getCounters();
        //Halls
        configsCache.halls = await getHalls();
        //PriorityRanges
        configsCache.priorityRanges = await getPriorityRanges();
        //Special case since the many to many have same columns names
        configsCache.branch_serviceAllocations = await getBranchServiceAllocation();
        //segments
        configsCache.segments = await getSegments();
        //segments Allocate
        configsCache.segmentsAllocations = await getSegmentAllocation();
        //services
        configsCache.services = await getServices();
        //services Allocate
        configsCache.servicesAllocations = await getServicesAllocation();
        //services Config
        configsCache.serviceConfigs = await getServicesConfigs();
        //Service Segment Priority Range
        configsCache.serviceSegmentPriorityRanges = await getServiceSegmentPriorityRange();
        //Service Workflow Config
        configsCache.serviceWorkFlow = await getServiceWorkflow();
        //User Config
        configsCache.users = await getUsers();
        //User Allocation Config
        configsCache.branch_UsersAllocations = await getUserAllocations();
        //Common Config
        configsCache.commonConfigs = await getCommonConfig();
        //Branches
        configsCache.branches = await getBranches();
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



var getService = function (ServiceID) {
    return this.configsCache.services.find(function (value) { return value.ID == ServiceID });
};

var getServiceConfig = function (ServiceConfigID) {
    return this.configsCache.serviceConfigs.find(function (value) { return value.ID == ServiceConfigID });
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
