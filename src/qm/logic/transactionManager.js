var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var transaction = require("../data/transaction");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var TicketSeqData = require("../data/ticketSeqData");
var idGenerator = require("../localRepositories/idGenerator");
var counterData = require("../data/counterData");
var statisticsManager = require("./statisticsManager");
const Separators = ["", " ", "-", "/", "."];


function UpdateTransactionInBranchData(BracnhData, transaction) {
    if (BracnhData) {
        for (let i = 0; i < BracnhData.transactionsData.length; i++) {
            if (BracnhData.transactionsData[i].id == transaction.id) {
                BracnhData.transactionsData[i] = transaction;
                break;
            }
        }
    }
}

//Update Transaction
var UpdateTransaction = function (transaction) {
    try {
        let result = common.error;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(transaction.branch_ID);

        if (BracnhData != null && BracnhData.transactionsData != null) {

            //Update branch data
            UpdateTransactionInBranchData(BracnhData, transaction);

            //Update the Statistics
            statisticsManager.AddOrUpdateTransaction(transaction);

            //Update To data base
            repositoriesManager.entitiesRepo.UpdateSynch(transaction);
            result = common.success;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

//Add or Update Transaction
var AddTransaction = function (transaction) {
    try {
        let result = common.error;
        //Generate ID in not exists
        if (transaction.id <= 0) {
            transaction.id = idGenerator.getNewID();
        }
        //If visit ID was not set then take the same as ID
        if (transaction.visit_ID <= 0) {
            transaction.visit_ID = transaction.id;
        }
        //Get Branch Data
        let BracnhData = dataService.getBranchData(transaction.branch_ID);
        if (BracnhData != null && BracnhData.transactionsData != null) {
            //To Branch Transactions
            BracnhData.transactionsData.push(transaction);
            //To Visit Data
            dataService.AddorUpdateVisitData(BracnhData, transaction);
            //Update the Statistics
            statisticsManager.AddOrUpdateTransaction(transaction);
            //Update To data base
            repositoriesManager.entitiesRepo.AddSynch(transaction);
            result = common.success;
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

function getBestHallFromStatistics(branch_ID, HallsToVerfify) {
    try {
        let Hall_ID;
        //If multiple halls get the best one
        let HallStatistics = statisticsManager.GetHallsStatistics(branch_ID, HallsToVerfify.map(hall => hall.Hall_ID));
        let ratio = 100000000000;
        for (let i = 0; i < HallsToVerfify.length; i++) {
            let tmp_ratio = 0;
            if (HallsToVerfify[i].WorkingNumber > 0) {
                tmp_ratio = HallStatistics[i].WaitingCustomers / HallsToVerfify[i].WorkingNumber;
            }
            else {
                tmp_ratio = HallStatistics[i].WaitingCustomers / HallsToVerfify[i].TotalNumber;
            }
            if (tmp_ratio < ratio) {
                ratio = tmp_ratio;
                Hall_ID = HallsToVerfify[i].Hall_ID;
            }
        }
        return Hall_ID;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}



//Get Hall Number
var getHallID = function (transaction, pAllHalls, pAllocatedHalls) {
    try {
        let Hall_ID;
        //Branch Config
        var branch = configurationService.getBranchConfig(transaction.branch_ID);
        var branchesData = dataService.getBranchData(transaction.branch_ID);
        //Copy IDs
        branch.halls.forEach(function (hall) { pAllHalls.push(hall.ID); });
        //If there was only one Hall Return in
        if (branch.halls.length == 1) {
            Hall_ID = branch.halls[0].ID;
            pAllocatedHalls.push(branch.halls[0]);
            return Hall_ID;
        }
        //Get Allocated Halls and thier allocated Resources
        let allocatedHalls = getHallsAllocatedonServiceSegment(branch, branchesData, transaction.service_ID, transaction.segment_ID);

        if (allocatedHalls && allocatedHalls.length > 0) {
            //Copy ID
            allocatedHalls.forEach(function (hall) { pAllocatedHalls.push(hall.Hall_ID); });
            //Filter the working halls
            let HallsToVerfify = allocatedHalls.filter(function (HallData) { return HallData.WorkingNumber > 0 })
            if (!HallsToVerfify || HallsToVerfify.length == 0) {
                //If there is no hall with working state then get them all
                HallsToVerfify = allocatedHalls;
            }
            //If only one the return it
            if (HallsToVerfify.length == 1) {
                Hall_ID = HallsToVerfify[0].Hall_ID;
            }
            else {
                Hall_ID = getBestHallFromStatistics(transaction.branch_ID, HallsToVerfify);
            }
        }
        return Hall_ID;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Formate the ticket number with range properities
var prepareDisplayTicketNumber = function (transaction, PriorityRangeMaxNo, Separator) {
    try {
        let FormattedTicketNumber = "";
        let displayTicketNumber = "";
        let pad = "";

        if (PriorityRangeMaxNo > 999) {
            pad = "0000";
        }
        else {
            pad = "000";
        }

        FormattedTicketNumber = pad.substring(0, pad.length - transaction.ticketSequence.toString().length) + transaction.ticketSequence.toString();

        if (Separator != null && Separator != "") {
            displayTicketNumber = transaction.symbol + Separator + FormattedTicketNumber;
        }
        else {
            displayTicketNumber = transaction.symbol + FormattedTicketNumber;
        }
        return displayTicketNumber;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

var timeProirityValue = function (transaction) {
    //Return the priority of this transaction; using priority time and priority
    return ((Date.now() - transaction.priorityTime) * transaction.priority * 1000);
};

var holdCurrentCustomer = function (errors, OrgID, BranchID, CounterID, HoldReason_ID, HeldTransactions) {
    try {
        let CurrentCustomerTransaction = new transaction();

        //Get Max Seq
        let Now = Date.now();
        //Get Branch Data
        let BracnhData = dataService.getBranchData(BranchID);
        let result = common.error;
        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {

            //Finish Serving the previous Ticket if exists
            let Current_Counter_Data;
            Current_Counter_Data = dataService.getCounterData(BracnhData, CounterID)

            if (Current_Counter_Data && Current_Counter_Data.currentTransaction_ID) {
                CurrentCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                    return transaction_Data.id == Current_Counter_Data.currentTransaction_ID;
                }
                );
                Current_Counter_Data.currentTransaction_ID = undefined;

                //Update the tranasaction to hold
                if (CurrentCustomerTransaction) {
                    CurrentCustomerTransaction.state = enums.StateType.OnHold;
                    CurrentCustomerTransaction.holdCount += 1;
                    CurrentCustomerTransaction.serviceSeconds = CurrentCustomerTransaction.serviceSeconds + ((Now - CurrentCustomerTransaction.startServingTime) / 1000);
                    CurrentCustomerTransaction.waitingStartTime = Now;
                    CurrentCustomerTransaction.heldByCounter_ID = CounterID;
                    CurrentCustomerTransaction.holdReason_ID = HoldReason_ID;
                }
            }

            //Update the old
            if (CurrentCustomerTransaction) {
                UpdateTransaction(CurrentCustomerTransaction);
                HeldTransactions.push(CurrentCustomerTransaction);
            }
        }

        result = common.success;
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }

}
function closeTransaction(BracnhData, CurrentCustomerTransaction) {
    try {
        let Now = Date.now();
        CurrentCustomerTransaction.state = enums.StateType.closed;
        CurrentCustomerTransaction.endServingTime = Now;
        CurrentCustomerTransaction.closeTime = Now;
        CurrentCustomerTransaction.serviceSeconds = CurrentCustomerTransaction.serviceSeconds + ((Now - CurrentCustomerTransaction.startServingTime) / 1000);

        //Get min service time to determine the serving type
        let serviceConfig = configurationService.getServiceConfigFromService(CurrentCustomerTransaction.service_ID);
        if (CurrentCustomerTransaction.serviceSeconds < serviceConfig.MinServiceTime) {
            CurrentCustomerTransaction.servingType = enums.CustomerServingType.NoShow;
        }
        else {
            CurrentCustomerTransaction.servingType = enums.CustomerServingType.Served;
        }

        //Remove the transaction from memory
        let CurrentCustomerTransactionID = CurrentCustomerTransaction.id;
        BracnhData.transactionsData = BracnhData.transactionsData.filter(function (transaction_Data) {
            return transaction_Data.id != CurrentCustomerTransactionID;
        }
        );
        BracnhData.visitData = BracnhData.visitData.filter(function (visitData) {
            return visitData.visit_ID != CurrentCustomerTransactionID;
        }
        );
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
}
var finishCurrentCustomer = function (errors, OrgID, BranchID, CounterID, FinishedTransaction) {
    try {
        let CurrentCustomerTransaction;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(BranchID);
        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            //Finish Serving the previous Ticket if exists
            let Current_Counter_Data;
            Current_Counter_Data = dataService.getCounterData(BracnhData, CounterID)

            if (Current_Counter_Data && Current_Counter_Data.currentTransaction_ID) {
                CurrentCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                    return transaction_Data.id == Current_Counter_Data.currentTransaction_ID;
                }
                );
                Current_Counter_Data.currentTransaction_ID = undefined;
                if (CurrentCustomerTransaction) {
                    closeTransaction(BracnhData, CurrentCustomerTransaction)
                }
            }
        }
        //Update the old
        if (CurrentCustomerTransaction) {
            UpdateTransaction(CurrentCustomerTransaction);
            FinishedTransaction.push(CurrentCustomerTransaction);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

function PrepareTransctionFromOriginal(OriginalTransaction, NewTransaction) {
    try {
        let Now = Date.now();
        NewTransaction.visit_ID = OriginalTransaction.visit_ID;
        NewTransaction.org_ID = OriginalTransaction.org_ID;
        NewTransaction.branch_ID = OriginalTransaction.branch_ID;
        NewTransaction.ticketSequence = OriginalTransaction.ticketSequence;
        NewTransaction.symbol = OriginalTransaction.symbol;
        NewTransaction.hall_ID = OriginalTransaction.hall_ID;
        NewTransaction.servingSession = OriginalTransaction.servingSession;
        NewTransaction.orderOfServing = OriginalTransaction.orderOfServing;
        NewTransaction.serveStep = OriginalTransaction.serveStep + 1;
        NewTransaction.displayTicketNumber = OriginalTransaction.displayTicketNumber;
        NewTransaction.state = enums.StateType.Pending;
        NewTransaction.segment_ID = OriginalTransaction.segment_ID;
        //Times
        NewTransaction.creationTime = Now;
        NewTransaction.waitingStartTime = Now;
        NewTransaction.arrivalTime = OriginalTransaction.arrivalTime;
        NewTransaction.appointmentTime = OriginalTransaction.appointmentTime;
        NewTransaction.priorityTime = OriginalTransaction.priorityTime;
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

}


function GetProiorityRange(segment_ID, service_ID) {
    try {
        let PriorityRange;
        let serviceSegmentPriorityRange = configurationService.configsCache.serviceSegmentPriorityRanges.find(function (value) {
            return value.Segment_ID == segment_ID && value.Service_ID == service_ID;
        }
        );

        if (serviceSegmentPriorityRange) {
            //Get Range properities
            PriorityRange = configurationService.configsCache.priorityRanges.find(function (value) {
                return value.ID == serviceSegmentPriorityRange.PriorityRange_ID;
            }
            );
        }
        return PriorityRange;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}
function CreateAddServiceTransaction(ServiceID, OriginalTransaction, AddedServiceTransaction) {
    try {
        PrepareTransctionFromOriginal(OriginalTransaction, AddedServiceTransaction);
        AddedServiceTransaction.origin = enums.OriginType.AddService;
        AddedServiceTransaction.service_ID = ServiceID;
        //Set the Order of serving
        let Service = configurationService.configsCache.services.find(function (service) { return service.ID == ServiceID });
        AddedServiceTransaction.orderOfServing = Service.OrderOfServing;

        let PriorityRange = GetProiorityRange(AddedServiceTransaction.segment_ID, AddedServiceTransaction.service_ID);

        //if the service is on the same segment
        if (PriorityRange) {
            AddedServiceTransaction.priority = PriorityRange.Priority;
        }
        else {
            //if not in the same segment then get the average priority
            let AllServiceRanges = configurationService.configsCache.serviceSegmentPriorityRanges.filter(function (value) {
                return value.Service_ID == AddedServiceTransaction.service_ID;
            }
            );
            if (AllServiceRanges) {
                let TotalPriority = 0;
                AllServiceRanges.forEach(function (serviceSegmentPriorityRange) {
                    let PriorityRange = configurationService.configsCache.priorityRanges.find(function (value) {
                        return value.ID == serviceSegmentPriorityRange.PriorityRange_ID;
                    }
                    );
                    TotalPriority += PriorityRange.Priority;
                });
                AddedServiceTransaction.segment_ID = AllServiceRanges[0].Segment_ID;
                AddedServiceTransaction.priority = TotalPriority / AllServiceRanges.length;
            }
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}


var addService = function (errors, OrgID, BranchID, CounterID, ServiceID, resultArgs) {
    try {
        let result = common.error;
        let FinishedTransaction = [];
        result = finishCurrentCustomer(errors, OrgID, BranchID, CounterID, FinishedTransaction)
        if (result == common.success) {
            resultArgs.push(FinishedTransaction[0]);
            //Create the new transaction
            let OriginalTransaction = FinishedTransaction[0];
            let AddedServiceTransaction = new transaction();
            result = CreateAddServiceTransaction(ServiceID, OriginalTransaction, AddedServiceTransaction);
            if (result == common.success) {
                //Create on Database
                result = AddTransaction(AddedServiceTransaction);
                if (result == common.success) {
                    //Start serving the new transaction
                    result = serveCustomer(errors, OrgID, BranchID, CounterID, AddedServiceTransaction.id, resultArgs)
                }
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

var serveCustomer = function (errors, OrgID, BranchID, CounterID, TransactionID, resultArgs) {
    try {

        let NextCustomerTransaction = new transaction();
        //Get Max Seq
        let Now = Date.now();

        //Get Branch Data
        let BracnhData = dataService.getBranchData(BranchID);

        //Branch Config
        let branch = configurationService.getBranchConfig(BranchID);

        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            NextCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                return transaction_Data.id.toString() == TransactionID.toString();
            });
            if (NextCustomerTransaction) {
                //Change the state depending on the previous
                if (NextCustomerTransaction.state == enums.StateType.Pending) {
                    NextCustomerTransaction.state = enums.StateType.Serving;
                }
                if (NextCustomerTransaction.state == enums.StateType.PendingRecall) {
                    NextCustomerTransaction.state = enums.StateType.PendingRecall;
                }
                if (NextCustomerTransaction.state == enums.StateType.OnHold) {
                    NextCustomerTransaction.state = enums.StateType.Serving;
                    NextCustomerTransaction.holdingSeconds = NextCustomerTransaction.holdingSeconds + ((Now - NextCustomerTransaction.waitingStartTime) / 1000);
                }
                NextCustomerTransaction.waitingSeconds = NextCustomerTransaction.waitingSeconds + ((Now - NextCustomerTransaction.waitingStartTime) / 1000);
                NextCustomerTransaction.counter_ID = CounterID;
                NextCustomerTransaction.startServingTime = Now;
                NextCustomerTransaction.lastCallTime = Now;

                //Set the transaction on the current counter
                setCounterCurrentTransaction(errors, BracnhData, CounterID, NextCustomerTransaction)

                //update the new
                UpdateTransaction(NextCustomerTransaction);
                resultArgs.push(NextCustomerTransaction);
            }
        }

        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


function getAllocatedSegments(branch, counter) {
    try {
        var allocated_segments = [];
        var isAllSegments_Allocated = (counter.SegmentAllocationType == enums.SegmentAllocationType.SelectAll);

        //Get Allocated Segments
        if (!isAllSegments_Allocated && branch.segmentsAllocations && branch.segmentsAllocations.length > 0) {
            allocated_segments = branch.segmentsAllocations.filter(function (value) {
                return value.Counter_ID == counter.ID;
            }
            );
        }
        return allocated_segments;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getAllocatedServices(branch, counter) {
    try {
        //Get Allocated Service
        let allocated_services = branch.servicesAllocations.filter(function (value) {
            return value.Counter_ID == counter.ID;
        }
        );
        return allocated_services;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function isTransactionAllocated(segment_ID, service_ID, isAllSegments_Allocated, allocated_segments, allocated_services) {
    try {
        let tSegment;
        let tService;
        let servable = false;
        if (!isAllSegments_Allocated && allocated_segments && allocated_segments.length > 0) {
            tSegment = allocated_segments.find(function (segment) {
                return segment.Segment_ID == segment_ID;
            }
            );
        }
        if (allocated_services && allocated_services.length > 0) {
            tService = allocated_services.find(function (service) {
                return service.Service_ID == service_ID;
            }
            );
        }
        if (tSegment && tService) {
            servable = true;
        }
        return servable;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
function isTransactionServable(transaction_Data, counter, allocated_segments, allocated_services) {
    try {
        let servable = false;
        let isAllSegments_Allocated = (counter.SegmentAllocationType == enums.SegmentAllocationType.SelectAll);
        if (transaction_Data.state == enums.StateType.Pending || transaction_Data.state == enums.StateType.PendingRecall) {
            if (transaction_Data.hall_ID && counter.Hall_ID.toString() != transaction_Data.hall_ID.toString()) {
                return false;
            }
            servable = isTransactionAllocated(transaction_Data.segment_ID, transaction_Data.service_ID, isAllSegments_Allocated, allocated_segments, allocated_services)
        }
        return servable;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}

function getServableTransaction(branch, BracnhData, counter) {
    try {

        //Get Allocated Segments
        let allocated_segments = getAllocatedSegments(branch, counter);

        //Get Allocated Service
        var allocated_services = getAllocatedServices(branch, counter);

        let transactions = BracnhData.transactionsData.filter(function (transaction_Data) {
            return isTransactionServable(transaction_Data, counter, allocated_segments, allocated_services);
        }
        );
        return transactions;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return [];
    }
}

//Set the current counter transaction ID
function setCounterCurrentTransaction(errors, BracnhData, CounterID, NextCustomerTransaction) {
    try {
        let found = false;
        for (let i = 0; i < BracnhData.countersData.length; i++) {
            if (BracnhData.countersData[i].id == CounterID) {
                found = true;
                BracnhData.countersData[i].currentTransaction_ID = NextCustomerTransaction.id;
                break;
            }
        }
        if (!found) {
            let tcounterData = new counterData();
            tcounterData.id = NextCustomerTransaction.counter_ID;
            tcounterData.currentTransaction_ID = NextCustomerTransaction.id;
            BracnhData.countersData.push(tcounterData);
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
    }
}

//Check all servable transactions
function GetHighestPriorityTransaction(errors, transactions) {
    try {
        if (!transactions || transactions.length == 0) {
            return undefined;
        }
        let NextCustomerTransaction = transactions[0];
        for (let i = 0; i < transactions.length; i++) {
            if (timeProirityValue(NextCustomerTransaction) < timeProirityValue(transactions[i])) {
                NextCustomerTransaction = transactions[i];
            }
        }
        return NextCustomerTransaction;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return undefined;
    }
}

//Get Next Customer
var getNextCustomer = function (errors, OrgID, BranchID, CounterID, resultArgs) {
    try {

        let NextCustomerTransaction = new transaction();
        //Get Branch Data
        let BracnhData = dataService.getBranchData(BranchID);

        //Branch Config
        var branch = configurationService.getBranchConfig(BranchID);

        //Branch Counters to get the specific counter
        var counter = branch.counters.find(function (value) {
            return value.ID == CounterID;
        });

        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            //Get Servable Tickets
            let transactions = getServableTransaction(branch, BracnhData, counter);

            //Get Ticket With max Priority
            NextCustomerTransaction = GetHighestPriorityTransaction(errors, transactions);
            if (NextCustomerTransaction) {
                //Start Serving the ticket
                let Now = Date.now();
                NextCustomerTransaction.startServingTime = Now;
                NextCustomerTransaction.state = enums.StateType.Serving;
                NextCustomerTransaction.counter_ID = CounterID;
                NextCustomerTransaction.serveStep = 1;
                NextCustomerTransaction.lastOfVisit = 1;
                NextCustomerTransaction.waitingSeconds = NextCustomerTransaction.waitingSeconds + ((NextCustomerTransaction.startServingTime - NextCustomerTransaction.waitingStartTime) / 1000);

                setCounterCurrentTransaction(errors, BracnhData, CounterID, NextCustomerTransaction);
            }
        }

        //update the new
        if (NextCustomerTransaction) {
            UpdateTransaction(NextCustomerTransaction);
            resultArgs.push(NextCustomerTransaction);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

function isCounterWorking(counter) {
    try {

        if (counter.currentState && (counter.currentState.type == enums.EmployeeActiontypes.Ready || counter.currentState.type == enums.EmployeeActiontypes.Serving || counter.currentState.type == enums.EmployeeActiontypes.Processing || counter.currentState.type == enums.EmployeeActiontypes.NoCallServing)) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
}
function MergeAllocationsArrays(allocated_all_segment, allocated_segment) {
    try {
        let MergedArray;
        //If the two arrays are filled
        if (allocated_all_segment && allocated_segment) {
            MergedArray = allocated_all_segment.concat(allocated_segment.filter(function (item) {
                return allocated_all_segment.indexOf(item) < 0;
            }));
            return MergedArray
        }
        if (allocated_all_segment) {
            MergedArray = allocated_all_segment;
        }
        else {
            MergedArray = allocated_segment;
        }
        return MergedArray
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedUsersOnSegment(branch, Segment_ID) {
    try {
        let ServingUserIDs = branch.usersAllocations.filter(function (user) {
            return user.Serving == "1";
        }).map(user => user.User_ID);

        //Users with all segments set
        let allocated_all_segment_users = configurationService.configsCache.users.filter(function (user) {
            return user.SegmentAllocationType == enums.SegmentAllocationType.SelectAll && ServingUserIDs.indexOf(user.ID) > -1;
        }).map(user => user.ID);

        //Get Segment Allocation from allocation table
        let allocated_segment_users = branch.segmentsAllocations.filter(function (allocation) {
            return allocation.Segment_ID == Segment_ID && allocation.User_ID && ServingUserIDs.indexOf(user.ID) > -1;
        }).map(allocation => allocation.User_ID);

        //Merge the 2 arrays to get one users array with this segment allocated
        let allocated_usersOnSegments = MergeAllocationsArrays(allocated_all_segment_users, allocated_segment_users);
        return allocated_usersOnSegments;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedUserssOnService(branch, Service_ID) {
    try {
        //Get users with this service allocated
        let allocated_usersOnServices = branch.servicesAllocations.filter(function (allocation) {
            return allocation.Service_ID == Service_ID && allocation.User_ID;
        }).map(allocation => allocation.User_ID);
        return allocated_usersOnServices;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getWorkingCounters(branchesData, counteronHallIDs) {
    try {
        let OpenedCounters;
        if (branchesData.countersData) {
            OpenedCounters = branchesData.countersData.filter(function (counter) {
                return counteronHallIDs.indexOf(counter.id.toString()) > -1 && isCounterWorking(counter);
            }
            );
        }
        return OpenedCounters;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function addHallData(hallsData, hallID, counteronHall, OpenedCounters) {
    let hallData = {
        Hall_ID: hallID,
        TotalNumber: counteronHall ? counteronHall.length : 0,
        WorkingNumber: OpenedCounters ? OpenedCounters.length : 0,
    }
    hallsData.push(hallData);
}
function getHallsforUsers(branch, branchesData, Service_ID, Segment_ID) {
    try {
        let hallsData = [];

        //Get users with this segment allocated
        let allocated_usersOnSegments = getAllocatedUsersOnSegment(branch, Segment_ID);

        //Get users with this service allocated
        let allocated_usersOnServices = getAllocatedUserssOnService(branch, Service_ID);

        //Get the halls that can serve ticket
        if (allocated_usersOnServices && allocated_usersOnServices.length > 0 && allocated_usersOnSegments && allocated_usersOnSegments.length > 0) {
            //Get intersection between segment allocation and service allocation
            let UserThatCanServe = allocated_usersOnServices.filter(function (UserID) {
                return allocated_usersOnSegments.indexOf(UserID) !== -1;
            });

            if (UserThatCanServe && UserThatCanServe.length > 0) {
                branch.halls.forEach(function (hall) {
                    //counter halls with users logged in these users
                    let counteronHall = branch.counters.filter(function (counter) {
                        return counter.Hall_ID == hall.ID
                            && (counter.Type_LV == enums.counterTypes.CustomerServing || counter.Type_LV == enums.counterTypes.NoCallServing)
                            && (counter.currentState && UserThatCanServe.indexOf(counter.currentState.user_ID) > -1);
                    }
                    );

                    if (counteronHall && counteronHall.length > 0) {
                        let counteronHallIDs = counteronHall.map(counter => counter.ID);
                        let OpenedCounters = getWorkingCounters(branchesData, counteronHallIDs);
                        addHallData(hallData, hall.ID, counteronHall, OpenedCounters)
                    }
                });
            }
        }
        return hallsData;

    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedCountersOnSegment(branch, Segment_ID) {
    try {
        //counters with all segments set
        let allocated_all_segment_counters = branch.counters.filter(function (value) {
            return value.SegmentAllocationType == enums.SegmentAllocationType.SelectAll;
        }).map(counter => counter.ID);

        //Get Segment Allocation from allocation table
        let allocated_segment_counters = branch.segmentsAllocations.filter(function (allocation) {
            return allocation.Segment_ID == Segment_ID && allocation.Counter_ID;
        }).map(allocation => allocation.Counter_ID);

        //Merge the 2 arrays to get one counters array with this segment allocated
        let allocated_countersOnSegments = MergeAllocationsArrays(allocated_all_segment_counters, allocated_segment_counters);
        return allocated_countersOnSegments;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getAllocatedCountersOnService(branch, Service_ID) {
    try {
        //Get Counters with this service allocated
        let allocated_countersOnServices = branch.servicesAllocations.filter(function (allocation) {
            return allocation.Service_ID == Service_ID && allocation.Counter_ID;
        }).map(allocation => allocation.Counter_ID);
        return allocated_countersOnServices;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}
function getHallsforCounters(branch, branchesData, Service_ID, Segment_ID) {
    try {
        let hallsData = [];

        //Get Counters can serve this segment
        let allocated_countersOnSegments = getAllocatedCountersOnSegment(branch, Segment_ID);

        //Get Counters with this service allocated
        let allocated_countersOnServices = getAllocatedCountersOnService(branch, Service_ID);

        //Get the halls that can serve ticket
        if (allocated_countersOnServices && allocated_countersOnServices.length > 0 && allocated_countersOnSegments && allocated_countersOnSegments.length > 0) {
            //Get intersection between segment allocation and service allocation
            let CounterThatCanServe = allocated_countersOnServices.filter(function (CounterID) {
                return allocated_countersOnSegments.indexOf(CounterID) !== -1;
            });

            if (CounterThatCanServe && CounterThatCanServe.length > 0) {
                branch.halls.forEach(function (hall) {
                    //Get hall counters
                    let counteronHall = branch.counters.filter(function (counter) {
                        return counter.Hall_ID == hall.ID && (counter.Type_LV == enums.counterTypes.CustomerServing || counter.Type_LV == enums.counterTypes.NoCallServing) && CounterThatCanServe.indexOf(counter.ID) > -1;
                    }
                    );

                    if (counteronHall && counteronHall.length > 0) {
                        let counteronHallIDs = counteronHall.map(counter => counter.ID);
                        //Get the working counter counts
                        let OpenedCounters = getWorkingCounters(branchesData, counteronHallIDs);
                        addHallData(hallsData, hall.ID, counteronHall, OpenedCounters)
                    }
                });
            }
        }
        return hallsData;

    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

function getHallsAllocatedonServiceSegment(Branch, BranchesData, Service_ID, Segment_ID) {
    try {
        let hallsData = [];
        let AllocationType = configurationService.getCommonSettings(Branch.ID, common.ServiceAllocationTypeKey);
        if (AllocationType == enums.AllocationTypes.Counter) {
            hallsData = getHallsforCounters(Branch, BranchesData, Service_ID, Segment_ID);
        }
        else {
            hallsData = getHallsforUsers(Branch, BranchesData, Service_ID, Segment_ID);
        }

        return hallsData;
    }
    catch (error) {
        logger.logError(error);
        return [];
    }
}

//Get the sequence from transactions
function GetMaxTransactionSequence(transactions, Max_TicketNumber, Min_TicketNumber) {
    try {
        let ticketSequence = Min_TicketNumber;
        if (transactions && transactions.length > 0) {
            let maxTransaction = transactions[0];
            for (let i = 0; i < transactions.length; i++) {
                //Check for maximum transaction number today
                if (transactions[i].ticketSequence > maxTransaction.ticketSequence) {
                    maxTransaction = transactions[i];
                }
            }
            ticketSequence = maxTransaction.ticketSequence + 1;
        }
        if (ticketSequence > Max_TicketNumber) {
            ticketSequence = Min_TicketNumber;
        }
        return ticketSequence;
    } catch (error) {
        logger.logError(error);
        return 0;
    }
}

//Get SequenceRange and get sequence
function GetSequenceForFirstTime(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange) {
    try {
        let Now = new Date;
        let Today = Now.setHours(0, 0, 0, 0);
        let ticketSequence = 0;
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            let transactions = BracnhData.transactionsData.filter(function (value) {
                return value.branch_ID == transaction.branch_ID && (value.hall_ID == transaction.hall_ID || EnableHallSlipRange == "0") && value.symbol == transaction.symbol && value.creationTime > Today;
            }
            );
            ticketSequence = GetMaxTransactionSequence(transactions, Max_TicketNumber, Min_TicketNumber);
        }
        else {
            ticketSequence = Min_TicketNumber;
        }

        //Add sequence to the branch data
        let ticketSeqData = new TicketSeqData();
        ticketSeqData.hall_ID = transaction.hall_ID;
        ticketSeqData.symbol = transaction.symbol;
        ticketSeqData.sequence = ticketSequence;
        ticketSeqData.time = Today;
        BracnhData.ticketSeqData.push(ticketSeqData);

        return ticketSequence;
    }
    catch (error) {
        logger.logError(error);
        return -1;
    }
}

//Get the next number in the sequence
function getNextSequenceNumber(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange) {
    try {

        let Now = new Date;
        let Today = Now.setHours(0, 0, 0, 0);

        let ticketSequence = 0;
        //Get the sequence if exists in the memory
        let ticketSeqData = BracnhData.ticketSeqData.find(function (value) {
            return value.symbol == transaction.symbol && (value.hall_ID == transaction.hall_ID || EnableHallSlipRange == "0");
        }
        );

        if (ticketSeqData != null && ticketSeqData.time == Today) {
            //Update the existing Seq
            ticketSequence = ticketSeqData.sequence + 1;
            if (ticketSequence > Max_TicketNumber) {
                ticketSequence = Min_TicketNumber;
            }
            ticketSeqData.sequence = ticketSequence;
        }
        else {
            ticketSequence = GetSequenceForFirstTime(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange);
        }
        return ticketSequence;

    }
    catch (error) {
        logger.logError(error);
        return -1;
    }
}

//Split the range over halls if it was enabled
function SpiltSequenceRangeOverHall(BracnhData, Allocated_Halls, All_Halls, Min_TicketNumber, Max_TicketNumber) {
    try {
        let RangeLength = 0;
        let HallIndex = 0;
        let t_Min_TicketNumber = Min_TicketNumber;
        let EnableSplitRangeOverAllocatedHalls = configurationService.getCommonSettings(BracnhData.id, common.EnableSplitRangeOverAllocatedHalls);
        if (EnableSplitRangeOverAllocatedHalls == "1") {
            //Split them accross allocated halls 
            RangeLength = (Max_TicketNumber - t_Min_TicketNumber) / Allocated_Halls.length;
            HallIndex = Allocated_Halls.indexOf(transaction.hall_ID);
        }
        else {
            //Split the range across all halls
            RangeLength = (Max_TicketNumber - t_Min_TicketNumber) / All_Halls.length;
            HallIndex = All_Halls.indexOf(transaction.hall_ID);
        }
        Min_TicketNumber = Math.floor((RangeLength * HallIndex) + t_Min_TicketNumber);
        Max_TicketNumber = Math.floor((RangeLength * (HallIndex + 1)) + t_Min_TicketNumber - 1);
    }
    catch (error) {
        logger.logError(error);
    }
}

function getTransactionSequence(PriorityRange, transaction) {
    try {
        let ticketSequence = 0;
        //Get Branch Data
        let BracnhData = dataService.getBranchData(transaction.branch_ID);
        if (BracnhData != null) {
            let Max_TicketNumber = PriorityRange.MaxSlipNo;
            let Min_TicketNumber = PriorityRange.MinSlipNo;

            let All_Halls = [];
            let Allocated_Halls = [];
            //Finally Hall ID
            transaction.hall_ID = getHallID(transaction, All_Halls, Allocated_Halls);
            if (!transaction.hall_ID) {
                let error = "Error in getting hall id for the customer";
                logger.logError(error);
                errors.push(error.toString());
                return common.error;
            }

            //Check the split to get the min max depending on hall ID
            let EnableHallSlipRange = configurationService.getCommonSettings(BracnhData.id, common.EnableHallSlipRange);
            if (EnableHallSlipRange == "1") {
                SpiltSequenceRangeOverHall(BracnhData, Allocated_Halls, All_Halls, Min_TicketNumber, Max_TicketNumber);
            }
            ticketSequence = getNextSequenceNumber(BracnhData, transaction, Max_TicketNumber, Min_TicketNumber, EnableHallSlipRange);
        }
        return ticketSequence;
    }
    catch (error) {
        logger.logError(error);
        return -1;
    }
}


//Issue ticket
var issueSingleTicket = function (errors, transaction) {
    try {
        let result = common.error;
        let now = Date.now();
        transaction.creationTime = now;
        transaction.waitingStartTime = now;
        transaction.priorityTime = transaction.creationTime;
        transaction.arrivalTime = transaction.creationTime;
        transaction.state = enums.StateType.Pending;

        //Get Range properities
        let PriorityRange = GetProiorityRange(transaction.segment_ID, transaction.service_ID);
        if (!PriorityRange) {
            errors.push("error: the Service is not allocated on Segment");
            return common.error;
        }

        transaction.symbol = PriorityRange.Symbol;
        transaction.priority = PriorityRange.Priority;
        //Get Max Seq
        transaction.ticketSequence = getTransactionSequence(PriorityRange, transaction);
        transaction.displayTicketNumber = prepareDisplayTicketNumber(transaction, PriorityRange.MaxSlipNo, Separators[PriorityRange.Separator_LV]);
        //Create on Database
        result = AddTransaction(transaction);
        return result;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


module.exports.addService = addService;
module.exports.holdCurrentCustomer = holdCurrentCustomer;
module.exports.finishCurrentCustomer = finishCurrentCustomer;
module.exports.serveCustomer = serveCustomer;
module.exports.getNextCustomer = getNextCustomer;
module.exports.issueSingleTicket = issueSingleTicket;

