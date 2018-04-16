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


//Cache Server Configs from DB
var cacheData = async function () {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);

        let result = common.success;
        let BranchesConfig = configurationService.configsCache.branches;
        if (BranchesConfig != null && BranchesConfig.length > 0) {
            for (let i = 0; i < BranchesConfig.length; i++) {
                let branch = new branchData();
                branch.id = BranchesConfig[i].ID;

                //Get only the transactions for the day
                let States = [enums.StateType.Pending, enums.StateType.PendingRecall, enums.StateType.Serving];
                let transactionsData = await repositoriesManager.transactionRep.getFilterBy(["branch_ID", "state"], [branch.id, States]);
                if (transactionsData) {
                    //Get only the transactions for the day
                    branch.transactionsData = transactionsData.filter(function (value) {
                        //Set the counter data
                        if (value.creationTime > Today && value.counter_ID > 0) {
                            let tcounterData = new counterData();
                            tcounterData.id = value.counter_ID;
                            tcounterData.currentTransaction_ID = value.id;

                            let found = false;
                            for (let i = 0; i < branch.countersData.length; i++) {
                                if (branch.countersData[i].id == value.counter_ID) {
                                    found = true;
                                    branch.countersData[i].currentTransaction_ID = value.id;
                                    break;
                                }
                            }
                            if (!found) {
                                let tcounterData = new counterData();
                                tcounterData.id = value.counter_ID;
                                tcounterData.currentTransaction_ID = value.id;
                                branch.countersData.push(tcounterData);
                            }

                        }
                        return value.creationTime > Today;
                    }
                    );
                }

                if (branch.transactionsData) {
                    for (let i = 0; i < branch.transactionsData.length; i++) {
                        let transaction = branch.transactionsData[i];
                        //To Visit Data
                        let VisitData;
                        if (branch.visitData) {
                            VisitData = branch.visitData.find(function (value) {
                                return transaction.visit_ID == value.visit_ID;
                            });
                        }
                        if (!VisitData) {
                            VisitData = new visitData();
                            VisitData.visit_ID = transaction.visit_ID;
                            VisitData.customer_ID = transaction.customer_ID;
                            VisitData.transactions_IDs.push(transaction.id);
                            branch.visitData.push(VisitData);

                        } else {
                            branch.transactions_IDs.push(transaction.id);
                        }
                    }

                }
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


module.exports.initialize = initialize;
module.exports.branchesData = branchesData;