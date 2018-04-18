var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var transaction = require("../data/transaction");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var visitData = require("../data/visitData");
var TicketSeqData = require("../data/ticketSeqData");
var idGenerator = require("../localRepositories/idGenerator");
var counterData = require("../data/counterData");
const Separators = ["", " ", "-", "/", "."];



//Update Transaction
var UpdateTransaction = function (transaction) {
    try {
        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == transaction.branch_ID;
        }
        );
        if (BracnhData != null && BracnhData.transactionsData != null) {
            for (let i = 0; i < BracnhData.transactionsData.length; i++) {
                if (BracnhData.transactionsData[i].id == transaction.id) {
                    BracnhData.transactionsData[i] = transaction;
                    break;
                }
            }

            //Update To data base
            repositoriesManager.transactionRep.Update(transaction);
            return common.success;
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

//Add or Update Transaction
var AddTransaction = function (transaction) {
    try {
        //Generate ID in not exists
        if (transaction.id <= 0) {
            transaction.id = idGenerator.getNewID();
        }

        //If visit ID was not set then take the same as ID
        if (transaction.visit_ID <= 0) {
            transaction.visit_ID = transaction.id;
        }
        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == transaction.branch_ID;
        }
        );
        if (BracnhData != null && BracnhData.transactionsData != null) {
            //To Branch Transactions
            BracnhData.transactionsData.push(transaction);

            //To Visit Data
            let VisitData;
            if (BracnhData.visitData) {
                VisitData = BracnhData.visitData.find(function (value) {
                    return transaction.visit_ID == value.visit_ID;
                });
            }
            if (!VisitData) {
                VisitData = new visitData();
                VisitData.visit_ID = transaction.visit_ID;
                VisitData.customer_ID = transaction.customer_ID;
                VisitData.transactions_IDs.push(transaction.id);
                BracnhData.visitData.push(VisitData);

            } else {
                VisitData.transactions_IDs.push(transaction.id);
            }

            //Update To data base
            repositoriesManager.transactionRep.Add(transaction);
            return common.success;
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

//Get Hall Number
var getHallNumber = function (transaction) {
    try {
        let Halls = configurationService.configsCache.halls.filter(function (value) {
            return value.QueueBranch_ID == transaction.branch_ID;
        }
        );
        return Halls[0].ID;
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
    return ((new Date() - transaction.priorityTime) * transaction.priority * 1000);
};

var finishCurrentCustomer = function (OrgID, BranchID, CounterID, FinishedTransaction) {
    try {

        let CurrentCustomerTransaction = new transaction();

        //Get Max Seq
        let Now = new Date();
        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == BranchID;
        }
        );

        let result = common.error;
        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {

            //Finish Serving the previous Ticket if exists
            let Current_Counter_Data;
            for (let i = 0; i < BracnhData.countersData.length; i++) {
                if (BracnhData.countersData[i].id == CounterID) {
                    Current_Counter_Data = BracnhData.countersData[i];
                    break;
                }
            }
            if (Current_Counter_Data && Current_Counter_Data.currentTransaction_ID) {
                CurrentCustomerTransaction = BracnhData.transactionsData.find(function (transaction_Data) {
                    return transaction_Data.id == Current_Counter_Data.currentTransaction_ID;
                }
                );
                Current_Counter_Data.currentTransaction_ID = undefined;
                if (CurrentCustomerTransaction) {
                    CurrentCustomerTransaction.state = enums.StateType.closed;
                    CurrentCustomerTransaction.endServingTime = Now;
                    CurrentCustomerTransaction.closeTime = Now;
                    CurrentCustomerTransaction.serviceSeconds =  CurrentCustomerTransaction.serviceSeconds + ( CurrentCustomerTransaction.arrivalTime -  CurrentCustomerTransaction.startServingTime);
                    
                    //Remove the transaction from memory
                    let CurrentCustomerTransactionID= CurrentCustomerTransaction.id;
                    BracnhData.transactionsData = BracnhData.transactionsData.filter(function (transaction_Data) {
                        return transaction_Data.id !=  CurrentCustomerTransactionID;
                    }
                    );
                    BracnhData.visitData= BracnhData.visitData.filter(function (visitData) {
                        return visitData.visit_ID !=  CurrentCustomerTransactionID;
                    }
                    );
                }
            }
            //Update the old
            if (CurrentCustomerTransaction) {
                UpdateTransaction(CurrentCustomerTransaction);
                FinishedTransaction.push(CurrentCustomerTransaction);
            }
        }

        result = common.success;
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



//Get Next Customer
var getNextCustomer = function (OrgID, BranchID, CounterID, resultArgs) {
    try {

        let NextCustomerTransaction = new transaction();
        //Get Max Seq
        let Now = new Date();

        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == BranchID;
        }
        );

        //Branch Config
        var branch = configurationService.configsCache.branches.find(function (value) {
            return value.ID = BranchID;
        });

        //Branch Counters to get the specific counter
        var counter = branch.counters.find(function (value) {
            return value.ID = CounterID;
        });

        var allocated_segments = [];
        var isAllSegments_Allocated = (counter.SegmentAllocationType == enums.SegmentAllocationType.SelectAll);

        //Get Allocated Segments
        if (!isAllSegments_Allocated && branch.segmentsAllocations && branch.segmentsAllocations.length > 0) {
            allocated_segments = branch.segmentsAllocations.filter(function (value) {
                return value.Counter_ID == CounterID;
            }
            );
        }

        //Get Allocated Service
        var allocated_services = branch.servicesAllocations.filter(function (value) {
            return value.Counter_ID == CounterID;
        }
        );

        //Get the transactions that can be served
        if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
            //Get Servable Tickets
            let transactions = BracnhData.transactionsData.filter(function (transaction_Data) {
                var servable = false;
                if (!isAllSegments_Allocated && allocated_segments && allocated_segments.length > 0) {
                    let tSegment = allocated_segments.find(function (segment) {
                        return segment.Segment_ID == transaction_Data.segment_ID;
                    }
                    );
                    if (!tSegment) {
                        return servable;
                    }
                }
                if (allocated_services && allocated_services.length > 0) {
                    let tService = allocated_services.find(function (service) {
                        return service.Service_ID == transaction_Data.service_ID;
                    }
                    );
                    if (tService) {
                        servable = true;
                    }
                }
                return servable;
            }
            );

            //Get Ticket With max Priority
            if (transactions && transactions.length > 0) {
                NextCustomerTransaction = transactions[0];
                for (let i = 0; i < transactions.length; i++) {
                    if (timeProirityValue( NextCustomerTransaction) < timeProirityValue(transactions[i])) {
                        NextCustomerTransaction = transactions[i];
                    }
                }


                //Start Serving the ticket
                NextCustomerTransaction.startServingTime = Now;
                NextCustomerTransaction.state = enums.StateType.Serving;
                NextCustomerTransaction.counter_ID = CounterID;
                NextCustomerTransaction.serveStep = 1;
                NextCustomerTransaction.lastOfVisit = 1;
                NextCustomerTransaction.waitingSeconds =  NextCustomerTransaction.waitingSeconds + ( NextCustomerTransaction.startServingTime -  NextCustomerTransaction.arrivalTime);

                let found = false;
                for (let i = 0; i < BracnhData.countersData.length; i++) {
                    if (BracnhData.countersData[i].id == CounterID) {
                        found = true;
                        BracnhData.countersData[i].currentTransaction_ID =  NextCustomerTransaction.id;
                        break;
                    }
                }
                if (!found) {
                    let tcounterData = new counterData();
                    tcounterData.id =  NextCustomerTransaction.counter_ID;
                    tcounterData.currentTransaction_ID =  NextCustomerTransaction.id;
                    BracnhData.countersData.push(tcounterData);
                }
            }
        }


        //update the new
        if ( NextCustomerTransaction) {
            UpdateTransaction( NextCustomerTransaction);
            resultArgs.push(NextCustomerTransaction);
        }
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};



//Issue ticket
var issueSingleTicket = function (transaction) {
    try {
        let result = common.error;
        transaction.creationTime = Date.now();
        transaction.priorityTime = transaction.creationTime;
        transaction.arrivalTime = transaction.creationTime;
        transaction.state = enums.StateType.Pending;
        //Get Range ID
        let ticketSequence = 0;
        let serviceSegmentPriorityRange = configurationService.configsCache.serviceSegmentPriorityRanges.find(function (value) {
            return value.Segment_ID == transaction.segment_ID && value.Service_ID == transaction.service_ID;
        }
        );

        if (!serviceSegmentPriorityRange) {
            logger.logError("error: the Service is not allocated on Segment");
            return common.error;
        }

        //Get Range properities
        let PriorityRange = configurationService.configsCache.priorityRanges.find(function (value) {
            return value.ID == serviceSegmentPriorityRange.PriorityRange_ID;
        }
        );

        //Get Max Seq
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == transaction.branch_ID;
        }
        );

        if (BracnhData != null) {
            //Get the sequence if exists in the memory
            let ticketSeqData = BracnhData.ticketSeqData.find(function (value) {
                return value.segment_ID == transaction.segment_ID && value.service_ID == transaction.service_ID;
            }
            );

            if (ticketSeqData != null && ticketSeqData.time == Today) {
                //Update the existing Seq
                ticketSequence = ticketSeqData.sequence + 1;
                if (ticketSequence > PriorityRange.MaxSlipNo) {
                    ticketSequence = PriorityRange.MinSlipNo;
                }
                ticketSeqData.sequence = ticketSequence;
            }
            else {
                if (BracnhData != null && BracnhData.transactionsData != null && BracnhData.transactionsData.length > 0) {
                    let transactions = BracnhData.transactionsData.filter(function (value) {
                        return value.branch_ID == transaction.branch_ID && value.segment_ID == transaction.segment_ID && value.service_ID == transaction.service_ID && value.creationTime > Today;
                    }
                    );
                    if (transactions && transactions.length > 0) {
                        let maxTransaction = transactions[0];
                        for (let i = 0; i < transactions.length; i++) {
                            //Check for maximum transaction number today
                            if (transactions[i].ticketSequence > maxTransaction.ticketSequence) {
                                maxTransaction = transactions[i];
                            }
                        }
                        if (maxTransaction) {
                            ticketSequence = maxTransaction.ticketSequence + 1;
                            if (ticketSequence > PriorityRange.MaxSlipNo) {
                                ticketSequence = PriorityRange.MinSlipNo;
                            }
                        }
                        else {
                            ticketSequence = PriorityRange.MinSlipNo;
                        }
                    }
                    else {
                        ticketSequence = PriorityRange.MinSlipNo;
                    }
                }
                else {
                    ticketSequence = PriorityRange.MinSlipNo;
                }

                if (ticketSeqData == null) {
                    ticketSeqData = new TicketSeqData();
                    ticketSeqData.hall_ID = transaction.hall_ID;
                    ticketSeqData.service_ID = transaction.service_ID;
                    ticketSeqData.segment_ID = transaction.segment_ID;
                    ticketSeqData.sequence = ticketSequence;
                    ticketSeqData.time = Today;
                    BracnhData.ticketSeqData.push(ticketSeqData);
                } else {
                    ticketSeqData.sequence = ticketSequence;
                }
            }
        }




        transaction.symbol = PriorityRange.Symbol;
        transaction.priority = PriorityRange.Priority;
        transaction.ticketSequence = ticketSequence;
        transaction.displayTicketNumber = prepareDisplayTicketNumber(transaction, PriorityRange.MaxSlipNo, Separators[PriorityRange.Separator_LV]);
        transaction.hall_ID = getHallNumber(transaction);
        //Create on Database
        result = AddTransaction(transaction);


        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

module.exports.finishCurrentCustomer = finishCurrentCustomer;
module.exports.getNextCustomer = getNextCustomer;
module.exports.issueSingleTicket = issueSingleTicket;

