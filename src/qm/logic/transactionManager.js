var repositoriesManager = require("../localRepositories/repositoriesManager");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var visitData = require("../data/visitData");
var TicketSeqData = require("../data/ticketSeqData");
var repositoriesMgr = new repositoriesManager();
var logger = require("../../common/logger");
var common = require("../../common/common");
const Separators = ["", " ", "-", "/", "."];
var idGenerator = require("../localRepositories/idGenerator");

//Initialize
var initialize = async function () {
    let result = await repositoriesMgr.initialize();
    return result;
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
            repositoriesMgr.transactionRep.addOrUpdate(transaction);
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

//Issue ticket
var issueSingleTicket = function (transaction) {
    try {
        let result = common.error;
        transaction.creationTime = Date.now();

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
                if (ticketSequence > PriorityRange.MaxSlipNo)
                {
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
                            if (ticketSequence > PriorityRange.MaxSlipNo)
                            {
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



module.exports.initialize = initialize;
module.exports.issueSingleTicket = issueSingleTicket;

