const INT_NULL = -1;
const STRING_NULL = "";
const TIME_NULL = 0;

class transaction {
    constructor() {
        //Attribute
        this.id = INT_NULL;
        this.org_ID = INT_NULL;
        this.branch_ID = INT_NULL;

        this.ticketSequence = INT_NULL;
        this.symbol = STRING_NULL;
        this.service_ID = INT_NULL;
        this.segment_ID = INT_NULL;
        this.priority = INT_NULL;
        this.orderOfServing = INT_NULL;
        this.note = STRING_NULL;
        this.recallNo = INT_NULL;
        this.holdCount = INT_NULL;
        this.holdReason_ID = INT_NULL;
        this.appointment_ID = INT_NULL;
        this.servingSession = STRING_NULL;
        this.origin = INT_NULL;
        this.state = INT_NULL;
        this.servingType = INT_NULL;
        this.visit_ID = INT_NULL;
        this.serveStep = INT_NULL;
        this.lastOfVisit = INT_NULL;
        this.reminderState = INT_NULL;
        this.integration_ID = INT_NULL;
        this.smsTicket = INT_NULL;  //to be delayed
        this.displayTicketNumber = STRING_NULL;
        this.hall_ID = INT_NULL;


        //Times
        this.arrivalTime = TIME_NULL;
        this.appointmentTime = TIME_NULL;
        this.waitingSeconds = TIME_NULL;
        this.serviceSeconds = TIME_NULL;
        this.holdingSeconds = TIME_NULL;
        this.lastCallTime = TIME_NULL;
        this.endServingTime = TIME_NULL;
        this.waitingStartTime = TIME_NULL;
        this.priorityTime = TIME_NULL;
        this.startServingTime = TIME_NULL;
        this.creationTime = TIME_NULL;
        this.closeTime = TIME_NULL;


        //Counter and User IDs
        this.counter_ID = INT_NULL;
        this.user_ID = INT_NULL;
        this.transferredByUser_ID = INT_NULL;
        this.transferredByCounter_ID = INT_NULL;
        this.transferredFromService_ID = INT_NULL;
        this.heldByCounter_ID = INT_NULL;
        this.dispensedByUser_ID = INT_NULL;
        this.dispensedByCounter_ID = INT_NULL;
        this.assignedByCounter_ID = INT_NULL;
    }

    timeProirityValue() {
        //Return the priority of this transaction; using priority time and priority
    }
}
module.exports = transaction;
