var fs = require("fs");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var dataService = require("../data/dataService");
var branchStatisticsData = require("../data/branchStatisticsData");
var statisticsData = require("../data/statisticsData");
var configurationService = require("../configurations/configurationService");
var branches_statisticsData = [];

var getServiceConfig = function (ServiceID) {
    try {
        //Get min service time
        let service = configurationService.configsCache.services.find(function (value) {
            if (value.ID == ServiceID) {
                return true;
            }
        });

        //Get min service time
        let serviceConfig = configurationService.configsCache.serviceConfigs.find(function (value) {
            if (value.ID == service.ServiceConfig_ID) {
                return true;
            }
        });

        return serviceConfig;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var generateID = function (transactions) {
    return transactions.branch_ID + "_" + transactions.service_ID + "_" + transactions.segment_ID + "_" + transactions.hall_ID + "_" + transactions.counter_ID + "_" + transactions.user_ID
};

var CreateNewstatistics = function (transactions) {
    try {
        let ServiceConfig = getServiceConfig(transactions.service_ID);

        let t_Statistics = new statisticsData();
        t_Statistics.StatisticsDate = Date.now();

        //Attributes
        t_Statistics.ID=generateID(transactions);
        t_Statistics.branch_ID = transactions.branch_ID;
        t_Statistics.segment_ID = transactions.segment_ID;
        t_Statistics.hall_ID = transactions.hall_ID;
        t_Statistics.counter_ID = transactions.counter_ID;
        t_Statistics.user_ID = transactions.user_ID;
        t_Statistics.service_ID = transactions.service_ID;



        //Waiting Customer
        if (transactions.state == enums.StateType.Pending || transactions.state == enums.StateType.PendingRecall || transactions.state == enums.StateType.OnHold) {
            t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers + 1;
        }

        //waited customer
        if (transactions.serviceSeconds > 0 && transactions.origin != enums.OriginType.AddVirtualService && transactions.servingType != enums.CustomerServingType.CancelledDueTransfer) {
            t_Statistics.WaitedCustomersNo = t_Statistics.WaitedCustomersNo + 1;
        }

        //served customers
        if (transactions.serviceSeconds > 0 && (transactions.servingType == enums.CustomerServingType.Served || transactions.servingType == enums.CustomerServingType.SetAsServed || transactions.servingType == enums.CustomerServingType.ServedWithAdded)) {
            t_Statistics.ServedCustomersNo = t_Statistics.ServedCustomersNo + 1;
        }

        //number of no show
        if (transactions.servingType == enums.CustomerServingType.NoShow ) {
            t_Statistics.NoShowCustomersNo = t_Statistics.NoShowCustomersNo + 1;
        }

        //number of non served customers
        if (transactions.servingType == enums.CustomerServingType.NoCalled || transactions.servingType == enums.CustomerServingType.NoShow ) {
            t_Statistics.NonServedCustomersNo = t_Statistics.NonServedCustomersNo + 1;
        }

        //total pending customers
        if (transactions.state == enums.StateType.Pending || transactions.state == enums.StateType.PendingRecall || transactions.state == enums.StateType.OnHold ) {
            t_Statistics.TotalPendingCustomersNo = t_Statistics.NonServedCustomersNo + 1;
        }

        //avrage serving customers
        if (transactions.serviceSeconds > 0 && (transactions.servingType == enums.CustomerServingType.Served || transactions.servingType == enums.CustomerServingType.ServedWithAdded)) {
           if (transactions.serviceSeconds <= ServiceConfig.MaxServiceTime)
           {
                t_Statistics.TotalServiceTime = t_Statistics.TotalServiceTime + transactions.serviceSeconds;
                t_Statistics.ASTWeight = t_Statistics.ASTWeight + 1;
                t_Statistics.AvgServiceTime = t_Statistics.TotalServiceTime  / t_Statistics.ASTWeight;
           }   
        }

        //waited customer
        if (transactions.waitingSeconds > 0 && transactions.origin != enums.OriginType.AddVirtualService && transactions.servingType != enums.CustomerServingType.CancelledDueTransfer) {
            if (transactions.waitingSeconds <= ServiceConfig.MaxServiceTime)
           {
                t_Statistics.TotalWaitingTime = t_Statistics.TotalWaitingTime + transactions.waitingSeconds;
                 t_Statistics.AvgWaitingTime = t_Statistics.TotalWaitingTime  /  t_Statistics.WaitedCustomersNo;
           }   
        }
        return t_Statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};
var UpdateStatistics = function (Statistics, transactions) {
    try {
        let ServiceConfig = getServiceConfig(transactions.service_ID);
        Statistics.StatisticsDate = Date.now();
        Statistics.ID=generateID(transactions);
        //Waiting Customer
        if (transactions.state == enums.StateType.Pending || transactions.state == enums.StateType.PendingRecall || transactions.state == enums.StateType.OnHold) {
            Statistics.WaitingCustomers = Statistics.WaitingCustomers + 1;
        }

        //waited customer
        if (transactions.serviceSeconds > 0 && transactions.origin != enums.OriginType.AddVirtualService && transactions.servingType != enums.CustomerServingType.CancelledDueTransfer) {
            Statistics.WaitedCustomersNo = Statistics.WaitedCustomersNo + 1;
        }

        //served customers
        if (transactions.serviceSeconds > 0 && (transactions.servingType == enums.CustomerServingType.Served || transactions.servingType == enums.CustomerServingType.SetAsServed || transactions.servingType == enums.CustomerServingType.ServedWithAdded)) {
            Statistics.ServedCustomersNo = Statistics.ServedCustomersNo + 1;
        }

        //number of no show
        if (transactions.servingType == enums.CustomerServingType.NoShow ) {
            Statistics.NoShowCustomersNo = Statistics.NoShowCustomersNo + 1;
        }

        //number of non served customers
        if (transactions.servingType == enums.CustomerServingType.NoCalled || transactions.servingType == enums.CustomerServingType.NoShow ) {
            Statistics.NonServedCustomersNo = Statistics.NonServedCustomersNo + 1;
        }

        //total pending customers
        if (transactions.state == enums.StateType.Pending || transactions.state == enums.StateType.PendingRecall || transactions.state == enums.StateType.OnHold ) {
            Statistics.TotalPendingCustomersNo = Statistics.NonServedCustomersNo + 1;
        }

        //avrage serving customers
        if (transactions.serviceSeconds > 0 && (transactions.servingType == enums.CustomerServingType.Served || transactions.servingType == enums.CustomerServingType.ServedWithAdded)) {
           if (transactions.serviceSeconds <= ServiceConfig.MaxServiceTime)
           {
            Statistics.TotalServiceTime = Statistics.TotalServiceTime + transactions.serviceSeconds;
            Statistics.ASTWeight = Statistics.ASTWeight + 1;
            Statistics.AvgServiceTime = Statistics.TotalServiceTime  / Statistics.ASTWeight;
           }   
        }

        //waited customer
        if (transactions.waitingSeconds > 0 && transactions.origin != enums.OriginType.AddVirtualService && transactions.servingType != enums.CustomerServingType.CancelledDueTransfer) {
            if (transactions.waitingSeconds <= ServiceConfig.MaxServiceTime)
           {
            Statistics.TotalWaitingTime = Statistics.TotalWaitingTime + transactions.waitingSeconds;
                Statistics.AvgWaitingTime = Statistics.TotalWaitingTime  /  Statistics.WaitedCustomersNo;
           }   
        }
        return Statistics;

    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Load for all branches statistics
var initialize = async function () {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        let tomorrow = new Date(Today + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
        let t_Statistics;
        logger.logError("load statistics");

        //Get all transactions
        let transactionsData = await repositoriesManager.transactionRep.getAll();
        if (transactionsData && transactionsData.length > 0) {
            //filter for today only 
            transactionsData = transactionsData.filter(function (value) {
                return value.creationTime > Today && value.creationTime < tomorrow;
            }
            );

            if (transactionsData) {
                for (let i = 0; i < transactionsData.length; i++) {
                    let transaction=transactionsData[i];
                    let BranchID = transaction.branch_ID
                    let Statistics_ID = generateID(transaction);
                    let branch_statistics = branches_statisticsData.find(function (value) {
                        return value.branch_ID == BranchID;
                    });
                    if (branch_statistics) {
                        //if the branch exists
                        t_Statistics = branch_statistics.statistics.find(function (value) {
                            return value.ID == Statistics_ID;
                        });
                        if (t_Statistics) {
                            UpdateStatistics(t_Statistics,transaction);
                        }
                        else {
                            t_Statistics = CreateNewstatistics(transaction);
                            branch_statistics.statistics.push(t_Statistics);
                        }
                    }
                    else {
                        //If the branch not exists
                        let t_branchStatistics = new branchStatisticsData();
                        //Create branch statistics
                        t_branchStatistics.branch_ID = BranchID;
                        //Create statistics
                        let t_Statistics = CreateNewstatistics(transaction);
                        //Add to herarichy
                        t_branchStatistics.statistics.push(t_Statistics);
                        branches_statisticsData.push(t_branchStatistics);
                    }
                }
            }
        }

        fs.writeFileSync("statistics.json", JSON.stringify(branches_statisticsData));
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



//Get branch statistics
var getBranchStatistics = function (BranchID) {
    try {
        let Branchstatistics = branches_statisticsData.find(
            function (value) {
                return value.branch_ID == BranchID;
            }
        );
        if (Branchstatistics) {
            return Branchstatistics.statistics;
        }
        else {
            return [];
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};



module.exports.initialize = initialize;
module.exports.getBranchStatistics = getBranchStatistics;