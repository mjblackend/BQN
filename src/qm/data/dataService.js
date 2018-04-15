//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var branchData = require("./branchData");
var visitData = require("./visitData");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var repositoriesMgr = new repositoriesManager();
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
                let transactionsData= await repositoriesMgr.transactionRep.getFilterBy(["branch_ID"], [branch.id]);
                if (transactionsData)
                {
                    //Get only the transactions for the day
                    branch.transactionsData =transactionsData.filter(function (value) {
                        return value.creationTime > Today;
                    }
                    );
                }
            
                if (branch.transactionsData) {
                    for (let i = 0; i < branch.transactionsData.length; i++) {
                        let transaction = branch.transactionsData[i];
                        //To Visit Data
                        let VisitData ;
                        if (branch.visitData)
                        {
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
        let result = await repositoriesMgr.initialize();
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