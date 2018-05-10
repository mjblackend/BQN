var repositoriesManager = require("../localRepositories/repositoriesManager");
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var transaction = require("../data/transaction");
var branchStatisticsData = require("../data/branchStatisticsData");
var transactionStatisticsData = require("../data/transactionStatisticsData");
var statisticsData = require("../data/statisticsData");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var branches_statisticsData = [];
const UpdateTypes = {
    Add: 0,
    Subtract: 1
};


var generateID = function (transaction) {
    return transaction.branch_ID + "_" + transaction.service_ID + "_" + transaction.segment_ID + "_" + transaction.hall_ID + "_" + transaction.counter_ID + "_" + transaction.user_ID;
};


function UpdateWaitingCustomers(UpdateType, t_Statistics, transaction) {
    //Waiting Customer
    if (transaction.state == enums.StateType.Pending || transaction.state == enums.StateType.PendingRecall || transaction.state == enums.StateType.OnHold) {
        if (UpdateType = UpdateTypes.Add) {
            t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers + 1;
        }
        else {
            t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers - 1;
        }
    }
}
function UpdateWaitingCustomers(UpdateType, t_Statistics, transaction) {
    //Waiting Customer
    if (transaction.state == enums.StateType.Pending || transaction.state == enums.StateType.PendingRecall || transaction.state == enums.StateType.OnHold) {
        if (UpdateType == UpdateTypes.Add) {
            t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers + 1;
        }
        else {
            t_Statistics.WaitingCustomers = t_Statistics.WaitingCustomers - 1;
        }


    }
}
function UpdateServedCustomersNo(UpdateType, t_Statistics, transaction) {
    //served customers
    if (transaction.serviceSeconds > 0 && (transaction.servingType == enums.CustomerServingType.Served || transaction.servingType == enums.CustomerServingType.SetAsServed || transaction.servingType == enums.CustomerServingType.ServedWithAdded)) {

        if (UpdateType == UpdateTypes.Add) {
            t_Statistics.ServedCustomersNo = t_Statistics.ServedCustomersNo + 1;
        }
        else {
            t_Statistics.ServedCustomersNo = t_Statistics.ServedCustomersNo - 1;
        }


    }
}

function UpdateNoShowCustomersNo(UpdateType, t_Statistics, transaction) {
    //number of no show
    if (transaction.servingType == enums.CustomerServingType.NoShow) {
        if (UpdateType == UpdateTypes.Add) {
            t_Statistics.NoShowCustomersNo = t_Statistics.NoShowCustomersNo + 1;
        }
        else {
            t_Statistics.NoShowCustomersNo = t_Statistics.NoShowCustomersNo - 1;
        }

    }
}

function UpdateNonServedCustomersNo(UpdateType, t_Statistics, transaction) {
    if (transaction.servingType == enums.CustomerServingType.NoCalled || transaction.servingType == enums.CustomerServingType.NoShow) {

        if (UpdateType == UpdateTypes.Add) {
            t_Statistics.NonServedCustomersNo = t_Statistics.NonServedCustomersNo + 1;
        }
        else {
            t_Statistics.NonServedCustomersNo = t_Statistics.NonServedCustomersNo - 1;
        }

    }
}

function UpdateServiceStatistics(UpdateType, t_Statistics, transaction, ServiceConfig) {
    if (transaction.serviceSeconds > 0 && (transaction.servingType == enums.CustomerServingType.Served || transaction.servingType == enums.CustomerServingType.ServedWithAdded)) {
        if (transaction.serviceSeconds <= ServiceConfig.MaxServiceTime) {
            if (UpdateType == UpdateTypes.Add) {
                t_Statistics.TotalServiceTime = t_Statistics.TotalServiceTime + transaction.serviceSeconds;
                t_Statistics.ASTWeight = t_Statistics.ASTWeight + 1;
            }
            else {
                t_Statistics.TotalServiceTime = t_Statistics.TotalServiceTime - transaction.serviceSeconds;
                t_Statistics.ASTWeight = t_Statistics.ASTWeight - 1;
            }
            t_Statistics.AvgServiceTime = t_Statistics.TotalServiceTime / t_Statistics.ASTWeight;
        }
    }
}

function UpdateWaitingStatistics(UpdateType, t_Statistics, transaction, ServiceConfig) {
    if (transaction.waitingSeconds > 0 && transaction.origin != enums.OriginType.AddVirtualService && transaction.servingType != enums.CustomerServingType.CancelledDueTransfer) {
        if (UpdateType = UpdateTypes.Add) {
            t_Statistics.WaitedCustomersNo = t_Statistics.WaitedCustomersNo + 1;
            if (transaction.waitingSeconds <= ServiceConfig.MaxServiceTime) {
                t_Statistics.TotalWaitingTime = t_Statistics.TotalWaitingTime + transaction.waitingSeconds;
            }
        }
        else {
            t_Statistics.WaitedCustomersNo = t_Statistics.WaitedCustomersNo - 1;
            if (transaction.waitingSeconds <= ServiceConfig.MaxServiceTime) {
                t_Statistics.TotalWaitingTime = t_Statistics.TotalWaitingTime - transaction.waitingSeconds;
            }
        }
        t_Statistics.AvgWaitingTime = t_Statistics.TotalWaitingTime / t_Statistics.WaitedCustomersNo;
    }
}

var CreateNewstatistics = function (transaction) {
    try {
        let ServiceConfig = configurationService.getServiceConfigFromService(transaction.service_ID);

        let Statistics = new statisticsData();
        Statistics.StatisticsDate = Date.now();

        //Attributes
        Statistics.ID = generateID(transaction);
        Statistics.branch_ID = transaction.branch_ID;
        Statistics.segment_ID = transaction.segment_ID;
        Statistics.hall_ID = transaction.hall_ID;
        Statistics.counter_ID = transaction.counter_ID;
        Statistics.user_ID = transaction.user_ID;
        Statistics.service_ID = transaction.service_ID;



        //Waiting Customer
        UpdateWaitingCustomers(UpdateTypes.Add, Statistics, transaction);

        //served customers
        UpdateServedCustomersNo(UpdateTypes.Add, Statistics, transaction);

        //number of no show
        UpdateNoShowCustomersNo(UpdateTypes.Add, Statistics, transaction);

        //number of non served customers
        UpdateNonServedCustomersNo(UpdateTypes.Add, Statistics, transaction);

        //avrage serving customers
        UpdateServiceStatistics(UpdateTypes.Add, Statistics, transaction, ServiceConfig);

        //waited customer
        UpdateWaitingStatistics(UpdateTypes.Add, Statistics, transaction, ServiceConfig);

        repositoriesManager.entitiesRepo.AddSynch(Statistics);

        return Statistics;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }

};

var UpdateStatistics = function (UpdateType, Statistics, transaction) {
    try {
        let ServiceConfig = configurationService.getServiceConfigFromService(transaction.service_ID);
        Statistics.StatisticsDate = Date.now();
        Statistics.ID = generateID(transaction);


        //Waiting Customer
        UpdateWaitingCustomers(UpdateType, Statistics, transaction);

        //served customers
        UpdateServedCustomersNo(UpdateType, Statistics, transaction);

        //number of no show
        UpdateNoShowCustomersNo(UpdateType, Statistics, transaction);

        //number of non served customers
        UpdateNonServedCustomersNo(UpdateType, Statistics, transaction);

        //avrage serving customers
        UpdateServiceStatistics(UpdateType, Statistics, transaction, ServiceConfig);

        //waited customer
        UpdateWaitingStatistics(UpdateType, Statistics, transaction, ServiceConfig);

        repositoriesManager.entitiesRepo.UpdateSynch(Statistics);

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
            //New transaction so add it and set the _StatisticsData
            let Statistics_ID = generateID(transaction);
            let t_Statistics = t_branches_statisticsData.statistics.find(function (value) {
                return value.ID == Statistics_ID;
            });

            if (transaction._StatisticsData) {
                //Remove old statistics from the same transaction
                let oldStatistics_ID = generateID(transaction._StatisticsData);
                let oldStatistics = t_branches_statisticsData.statistics.find(function (value) {
                    return value.ID == oldStatistics_ID;
                });
                UpdateStatistics(UpdateTypes.Subtract, oldStatistics, transaction._StatisticsData);
            }

            //Add Current Statistics
            if (t_Statistics) {
                UpdateStatistics(UpdateTypes.Add, t_Statistics, transaction);
            }
            else {
                t_Statistics = CreateNewstatistics(transaction);
                t_branches_statisticsData.statistics.push(t_Statistics);
            }
            transaction._StatisticsData = new transactionStatisticsData(transaction);
        }
        else {
            //add branch transactions
            t_branches_statisticsData = new branchStatisticsData();
            t_branches_statisticsData.branch_ID = BranchID;
            let t_Statistics = CreateNewstatistics(transaction);
            t_branches_statisticsData.statistics.push(t_Statistics);
            branches_statisticsData.push(t_branches_statisticsData);
        }
    }
    catch (error) {
        logger.logError(error);
        return undefined;
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
        await repositoriesManager.entitiesRepo.clear(new statisticsData());
        //Get all transactions
        let transactionsData = await repositoriesManager.entitiesRepo.getAll(new transaction());
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
                            UpdateStatistics(UpdateTypes.Add, t_Statistics, transaction);
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
        await repositoriesManager.entitiesRepo.clearEntities();
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
            let BranchID = FilterStatistics.branch_ID;
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
                        SumStatistics(TotalStatistics, tStatistics);
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
module.exports.AddOrUpdateTransaction = AddOrUpdateTransaction;
module.exports.ReadBranchStatistics = ReadBranchStatistics;
module.exports.initialize = initialize;
