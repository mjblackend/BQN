class transaction {
    constructor() {
        //Attribute
        this.id;
        this.org_ID;
        this.branch_ID;

        this.ticketSequence;
        this.symbol;
        this.service_ID;
        this.segment_ID;
        this.priority;
        this.orderOfServing;
        this.note;
        this.recallNo;
        this.holdCount;
        this.holdReason_ID;
        this.appointment_ID;
        this.servingSession;
        this.origin;
        this.state;
        this.servingType;
        this.visit_ID;
        this.serveStep;
        this.lastOfVisit;
        this.reminderState;
        this.integration_ID;
        this.smsTicket;  //to be delayed
        this.displayTicketNumber;
        this.hall_ID;


        //Times
        this.arrivalTime;
        this.appointmentTime;
        this.waitingSeconds;
        this.serviceSeconds;
        this.holdingSeconds;
        this.lastCallTime;
        this.endServingTime;
        this.waitingStartTime;
        this.priorityTime;
        this.startServingTime;
        this.creationTime;
        this.closeTime;
        

        //Counter and User IDs
        this.counter_ID;
        this.user_ID;
        this.transferredByUser_ID;
        this.transferredByCounter_ID;
        this.transferredFromService_ID;
        this.heldByCounter_ID;
        this.dispensedByUser_ID;
        this.dispensedByCounter_ID;
        this.assignedByCounter_ID;



        this.TimeProirityValue = function () {
            //Return the priority of this transaction; using priority time and priority
        };

    }
}
module.exports = transaction;
