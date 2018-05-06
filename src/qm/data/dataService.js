//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var branchData = require("./branchData");
var visitData = require("./visitData");
var counterData = require("./counterData");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var branchesData = [];

function getCounterData(BracnhData, CounterID) {
    try {
        let CounterData;
        if (BracnhData && BracnhData.countersData) {
            for (let i = 0; i < BracnhData.countersData.length; i++) {
                if (BracnhData.countersData[i].id == CounterID) {
                    CounterData = BracnhData.countersData[i];
                    break;
                }
            }
            if (!CounterData) {
                let tcounterData = new counterData();
                tcounterData.id = CounterID;
                BracnhData.countersData.push(tcounterData);
                CounterData = BracnhData.countersData[BracnhData.countersData.length - 1];
            }
        }
        return CounterData;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}


function getCurrentActivity(BracnhData, CounterData) {
    try {
        let CurrentActivity;
        if (CounterData && CounterData.currentState_ID) {
            CurrentActivity = BracnhData.userActivitiesData.find(function (value) {
                return CounterData.currentState_ID == value.id;
            });
        }
        return CurrentActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function getCurrentTransaction(BracnhData, CounterData) {
    try {
        let CurrentTransaction;
        if (CounterData && CounterData.currentTransaction_ID) {
            CurrentTransaction = BracnhData.transactionsData.find(function (value) {
                return CounterData.currentTransaction_ID == value.id;
            });
        }
        return CurrentTransaction;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}


async function getTodaysUserActivitiesFromDB(branchID) {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        let userActivities = await repositoriesManager.userActivitiesRep.getFilterBy(["branch_ID", "closed"], [branchID, "0"]);
        userActivities = userActivities.filter(function (value) {
            return value.startTime > Today && value.closed == 0;
        });
        return userActivities;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

async function cacheBranchUserActivities(branch) {
    try {
        //Get user activities
        let userActivities = await getTodaysUserActivitiesFromDB(branch.id);

        if (userActivities) {
            branch.userActivitiesData = userActivities;
            //Set the user activities on the counter data
            for (let i = 0; i < branch.userActivitiesData.length; i++) {
                let UserActivity = branch.userActivitiesData[i];
                let CurrentCounterData = getCounterData(branch, UserActivity.counter_ID)
                if (CurrentCounterData) {
                    CurrentCounterData.currentState_ID = UserActivity.id;
                }
                else {
                    CurrentCounterData = new counterData();
                    CurrentCounterData.id = UserActivity.counter_ID;
                    CurrentCounterData.currentState_ID = UserActivity.id;
                    branch.countersData.push(CurrentCounterData);
                }
            }
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

async function getTodaysTransactionFromDB(branchID) {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);

        //Get only the transactions for the day
        let States = [enums.StateType.Pending, enums.StateType.PendingRecall, enums.StateType.Serving];
        let transactionsData = await repositoriesManager.transactionRep.getFilterBy(["branch_ID", "state"], [branchID, States]);
        transactionsData = transactionsData.filter(function (value) {
            return value.creationTime > Today;
        });
        return transactionsData;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

function AddorUpdateVisitData(branchData, transaction) {
    try {
        let VisitData;
        if (branchData.visitData) {
            VisitData = branchData.visitData.find(function (value) {
                return transaction.visit_ID == value.visit_ID;
            });
        }
        if (!VisitData) {
            VisitData = new visitData();
            VisitData.visit_ID = transaction.visit_ID;
            VisitData.customer_ID = transaction.customer_ID;
            VisitData.transactions_IDs.push(transaction.id);
            branchData.visitData.push(VisitData);

        } else {
            VisitData.transactions_IDs.push(transaction.id);
        }
    }
    catch (error) {
        logger.logError(error);
    }
}

async function cacheBranchTransactions(branch) {
    try {
        branch.transactionsData = await getTodaysTransactionFromDB(branch.id);
        if (branch.transactionsData) {
            for (let i = 0; i < branch.transactionsData.length; i++) {
                let transaction = branch.transactionsData[i];

                //Set the counter data
                if (transaction.counter_ID > 0) {
                    let CurrentCounterData = getCounterData(branch, transaction.counter_ID)
                    if (CurrentCounterData) {
                        CurrentCounterData.currentTransaction_ID = transaction.id;
                    }
                    else {
                        CurrentCounterData = new counterData();
                        CurrentCounterData.id = transaction.counter_ID;
                        CurrentCounterData.currentTransaction_ID = transaction.id;
                        branch.countersData.push(CurrentCounterData);
                    }
                }

                //To Visit Data
                AddorUpdateVisitData(branch, transaction);
            }
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Cache Server Configs from DB
var cacheData = async function () {
    try {
        let result = common.success;
        let BranchesConfig = configurationService.configsCache.branches;
        if (BranchesConfig != null && BranchesConfig.length > 0) {
            for (let i = 0; i < BranchesConfig.length; i++) {
                let branch = new branchData();
                branch.id = BranchesConfig[i].ID;
                await cacheBranchUserActivities(branch);
                await cacheBranchTransactions(branch);
                branchesData.push(branch);
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Get the Branch Data and counter data then the current Activity
function getCurrentData(OrgID, BranchID, CounterID, output) {
    try {

        let BracnhData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;

        //Get Branch Data
        BracnhData = branchesData.find(function (value) {
            return value.id == BranchID;
        }
        );
        //Get current State
        CounterData = getCounterData(BracnhData, CounterID);

        //Get Counter Status
        CurrentActivity = getCurrentActivity(BracnhData, CounterData);
        CurrentTransaction = getCurrentTransaction(BracnhData, CounterData);

        output.push(BracnhData);
        output.push(CounterData);
        output.push(CurrentActivity);
        output.push(CurrentTransaction);
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

var initialize = async function () {
    try {
        let result = await repositoriesManager.initialize();
        if (result == common.success) {
            result = await cacheData();
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};
module.exports.getCounterData = getCounterData;
module.exports.AddorUpdateVisitData = AddorUpdateVisitData;
module.exports.getCurrentData = getCurrentData;
module.exports.initialize = initialize;
module.exports.branchesData = branchesData;