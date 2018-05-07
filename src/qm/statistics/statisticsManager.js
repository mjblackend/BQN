var repositoriesManager = require("../localRepositories/repositoriesManager");
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var branchStatisticsData = require("../data/branchStatisticsData");
var statisticsData = require("../data/statisticsData");
var configurationService = require("../configurations/configurationService");
var branches_statisticsData = [];



var generateID = function (transactions) {
    return transactions.branch_ID + "_" + transactions.service_ID + "_" + transactions.segment_ID + "_" + transactions.hall_ID + "_" + transactions.counter_ID + "_" + transactions.user_ID;
};


function UpdateWaitingCustomers(t_Statistics, transactions) {
    //Waiting Customer
    if (transactions.state == enums.StateType.Pending || transactions.state == enums.StateType.PendingRecall || transactions.state == enums.StateType.OnHold) {
        t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers + 1;
    }
}
function UpdateWaitingCustomers(t_Statistics, transactions) {
    //Waiting Customer
    if (transactions.state == enums.StateType.Pending || transactions.state == enums.StateType.PendingRecall || transactions.state == enums.StateType.OnHold) {
        t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers + 1;
    }
}
function UpdateServedCustomersNo(t_Statistics, transactions) {
    //served customers
    if (transactions.serviceSeconds > 0 && (transactions.servingType == enums.CustomerServingType.Served || transactions.servingType == enums.CustomerServingType.SetAsServed || transactions.servingType == enums.CustomerServingType.ServedWithAdded)) {
        t_Statistics.ServedCustomersNo = t_Statistics.ServedCustomersNo + 1;
    }
}

function UpdateNoShowCustomersNo(t_Statistics, transactions) {
    //number of no show
    if (transactions.servingType == enums.CustomerServingType.NoShow) {
        t_Statistics.NoShowCustomersNo = t_Statistics.NoShowCustomersNo + 1;
    }
}

function UpdateNonServedCustomersNo(t_Statistics, transactions) {
    if (transactions.servingType == enums.CustomerServingType.NoCalled || transactions.servingType == enums.CustomerServingType.NoShow) {
        t_Statistics.NonServedCustomersNo = t_Statistics.NonServedCustomersNo + 1;
    }
}

function UpdateServiceStatistics(t_Statistics, transactions, ServiceConfig) {
    if (transactions.serviceSeconds > 0 && (transactions.servingType == enums.CustomerServingType.Served || transactions.servingType == enums.CustomerServingType.ServedWithAdded)) {
        if (transactions.serviceSeconds <= ServiceConfig.MaxServiceTime) {
            t_Statistics.TotalServiceTime = t_Statistics.TotalServiceTime + transactions.serviceSeconds;
            t_Statistics.ASTWeight = t_Statistics.ASTWeight + 1;
            t_Statistics.AvgServiceTime = t_Statistics.TotalServiceTime / t_Statistics.ASTWeight;
        }
    }
}

function UpdateWaitingStatistics(t_Statistics, transactions, ServiceConfig) {
    if (transactions.waitingSeconds > 0 && transactions.origin != enums.OriginType.AddVirtualService && transactions.servingType != enums.CustomerServingType.CancelledDueTransfer) {
        t_Statistics.WaitedCustomersNo = t_Statistics.WaitedCustomersNo + 1;
        if (transactions.waitingSeconds <= ServiceConfig.MaxServiceTime) {
            t_Statistics.TotalWaitingTime = t_Statistics.TotalWaitingTime + transactions.waitingSeconds;
            t_Statistics.AvgWaitingTime = t_Statistics.TotalWaitingTime / t_Statistics.WaitedCustomersNo;
        }
    }
}

var CreateNewstatistics = function (transactions) {
    try {
        let ServiceConfig = configurationService.getServiceConfigFromService(transactions.service_ID);

        let t_Statistics = new statisticsData();
        t_Statistics.StatisticsDate = Date.now();

        //Attributes
        t_Statistics.ID = generateID(transactions);
        t_Statistics.branch_ID = transactions.branch_ID;
        t_Statistics.segment_ID = transactions.segment_ID;
        t_Statistics.hall_ID = transactions.hall_ID;
        t_Statistics.counter_ID = transactions.counter_ID;
        t_Statistics.user_ID = transactions.user_ID;
        t_Statistics.service_ID = transactions.service_ID;



        //Waiting Customer
        UpdateWaitingCustomers(t_Statistics, transactions);

        //served customers
        UpdateServedCustomersNo(t_Statistics, transactions);

        //number of no show
        UpdateNoShowCustomersNo(t_Statistics, transactions);

        //number of non served customers
        UpdateNonServedCustomersNo(t_Statistics, transactions);

        //avrage serving customers
        UpdateServiceStatistics(t_Statistics, transactions, ServiceConfig);

        //waited customer
        UpdateWaitingStatistics(t_Statistics, transactions, ServiceConfig);

        return t_Statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};
var UpdateStatistics = function (Statistics, transactions) {
    try {
        let ServiceConfig = configurationService.getServiceConfigFromService(transactions.service_ID);
        Statistics.StatisticsDate = Date.now();
        Statistics.ID = generateID(transactions);


        //Waiting Customer
        UpdateWaitingCustomers(Statistics, transactions);

        //served customers
        UpdateServedCustomersNo(Statistics, transactions);

        //number of no show
        UpdateNoShowCustomersNo(Statistics, transactions);

        //number of non served customers
        UpdateNonServedCustomersNo(Statistics, transactions);

        //avrage serving customers
        UpdateServiceStatistics(Statistics, transactions, ServiceConfig);

        //waited customer
        UpdateWaitingStatistics(Statistics, transactions, ServiceConfig);

        return Statistics;

    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};
var AddOrUpdateTransaction = function (transaction) {
    try {
        let BranchID = transaction.branch_ID;
        //search from branch
        let t_branches_statisticsData = branches_statisticsData.find(function (value) {
            return value.branch_ID == BranchID;
        });
        //Check if the branch exists
        if (t_branches_statisticsData) {
            //Remove old transactions if exists
            t_branches_statisticsData.transactions = t_branches_statisticsData.transactions.filter(function (value) { return value.id != transaction.id; });
            //Add it to new
            t_branches_statisticsData.transactions.push(transaction);
        }
        else {
            //add branch transactions
            t_branches_statisticsData = new branchStatisticsData();
            t_branches_statisticsData.branch_ID = BranchID;
            t_branches_statisticsData.transactions.push(transaction);
            branches_statisticsData.push(t_branches_statisticsData);
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var RefreshBranchStatistics = function (BranchID) {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        let tomorrow = new Date(Today + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);

        //Add it to statistics collection
        let t_branchStatistics = branches_statisticsData.find(function (value) {
            return value.branch_ID == BranchID;
        });

        //if statistics not exists add it
        if (!t_branchStatistics) {
            //If the branch not exists
            t_branchStatistics = new branchStatisticsData();
            //Create branch statistics
            t_branchStatistics.branch_ID = BranchID;
            branches_statisticsData.push(t_branchStatistics);
        }

        //Clear statistics
        t_branchStatistics.statistics = [];

        //Update statistics
        let transactionsData = t_branchStatistics.transactions;
        if (transactionsData && transactionsData.length > 0) {
            //filter for today only 
            transactionsData = transactionsData.filter(function (value) {
                return value.creationTime > Today && value.creationTime < tomorrow;
            }
            );
        }

        if (transactionsData && transactionsData.length > 0) {
            for (let i = 0; i < transactionsData.length; i++) {
                let transaction = transactionsData[i];
                let Statistics_ID = generateID(transaction);
                //if the branch exists
                let t_Statistics = t_branchStatistics.statistics.find(function (value) {
                    return value.ID == Statistics_ID;
                });
                if (t_Statistics) {
                    UpdateStatistics(t_Statistics, transaction);
                }
                else {
                    t_Statistics = CreateNewstatistics(transaction);
                    t_branchStatistics.statistics.push(t_Statistics);
                }
            }
        }

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Load for all branches statistics
var initialize = async function () {
    try {
        branches_statisticsData = [];
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        let tomorrow = new Date(Today + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
        let t_Statistics;

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
                    let transaction = transactionsData[i];
                    let BranchID = transaction.branch_ID;
                    let Statistics_ID = generateID(transaction);

                    //Add it to branch transaction
                    AddOrUpdateTransaction(transaction);

                    //Add it to statistics collection
                    let branch_statistics = branches_statisticsData.find(function (value) {
                        return value.branch_ID == BranchID;
                    });
                    if (branch_statistics) {
                        //if the branch exists
                        t_Statistics = branch_statistics.statistics.find(function (value) {
                            return value.ID == Statistics_ID;
                        });
                        if (t_Statistics) {
                            UpdateStatistics(t_Statistics, transaction);
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
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



//Get branch statistics
var ReadBranchStatistics = function (apiMessagePayLoad) {
    try {
        let BranchID = apiMessagePayLoad.BranchID;
        //RefreshBranchStatistics(BranchID);
        let Branchstatistics = branches_statisticsData.find(
            function (value) {
                return value.branch_ID == BranchID;
            }
        );
        if (Branchstatistics) {
            apiMessagePayLoad.statistics = Branchstatistics.statistics;
        }
        else {
            apiMessagePayLoad.statistics = [];
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

function SumStatistics(TotalStatistics, ToBeAddedStatistics) {
    try {
        TotalStatistics.WaitingCustomers = ToBeAddedStatistics.WaitingCustomers + TotalStatistics.WaitingCustomers ;
        TotalStatistics.WaitingCustomers = ToBeAddedStatistics.WaitingCustomers + TotalStatistics.WaitingCustomers;
        TotalStatistics.ServedCustomersNo = ToBeAddedStatistics.ServedCustomersNo + TotalStatistics.ServedCustomersNo;
        TotalStatistics.NoShowCustomersNo = ToBeAddedStatistics.NoShowCustomersNo + TotalStatistics.NoShowCustomersNo;
        TotalStatistics.NonServedCustomersNo = ToBeAddedStatistics.NonServedCustomersNo + TotalStatistics.NonServedCustomersNo;
        TotalStatistics.TotalServiceTime = ToBeAddedStatistics.TotalServiceTime + TotalStatistics.TotalServiceTime;
        TotalStatistics.ASTWeight = ToBeAddedStatistics.ASTWeight + TotalStatistics.ASTWeight;
        TotalStatistics.WaitedCustomersNo = ToBeAddedStatistics.WaitedCustomersNo + TotalStatistics.WaitedCustomersNo;
        TotalStatistics.TotalWaitingTime = ToBeAddedStatistics.TotalWaitingTime + TotalStatistics.TotalWaitingTime;
        TotalStatistics.AvgServiceTime = TotalStatistics.TotalServiceTime / TotalStatistics.ASTWeight;
        TotalStatistics.AvgWaitingTime = TotalStatistics.TotalWaitingTime / TotalStatistics.WaitedCustomersNo;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Get single statistics
var GetSpecificStatistics = function (FilterStatistics) {
    try {
        let TotalStatistics = new statisticsData();
        if (FilterStatistics.branch_ID > 0) {
            //search from branch
            let BranchID=FilterStatistics.branch_ID;
            let t_branches_statisticsData = branches_statisticsData.find(function (value) {
                return value.branch_ID == BranchID;
            });
            if (t_branches_statisticsData && t_branches_statisticsData.statistics) {
                let statistics = t_branches_statisticsData.statistics;
                for (let i = 0; i < statistics.length; i++) {
                    let tStatistics = statistics[i];
                    let Addit = true;
                    if (FilterStatistics.segment_ID > 0 && (FilterStatistics.segment_ID != tStatistics.segment_ID)) {
                        Addit = false;
                    }
                    if (FilterStatistics.service_ID > 0 && (FilterStatistics.service_ID != tStatistics.service_ID)) {
                        Addit = false;
                    }
                    if (FilterStatistics.counter_ID > 0 && (FilterStatistics.counter_ID != tStatistics.counter_ID)) {
                        Addit = false;
                    }
                    if (FilterStatistics.hall_ID > 0 && (FilterStatistics.hall_ID != tStatistics.hall_ID)) {
                        Addit = false;
                    }
                    if (FilterStatistics.user_ID > 0 && (FilterStatistics.user_ID != tStatistics.user_ID)) {
                        Addit = false;
                    }
                    if (Addit) {
                        SumStatistics(TotalStatistics,tStatistics);
                    }
                }
                return TotalStatistics;
            }
        }
        return undefined;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};


module.exports.GetSpecificStatistics = GetSpecificStatistics;
module.exports.RefreshBranchStatistics = RefreshBranchStatistics;
module.exports.AddOrUpdateTransaction = AddOrUpdateTransaction;
module.exports.ReadBranchStatistics = ReadBranchStatistics;
module.exports.initialize = initialize;
