class transaction {
    constructor() {
        //Attribute
        this.id;
        this.orgID;
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
        this.holdReasonID;
        this.appointment_ID;
        this.servingSession;
        this.origin;
        this.state;
        this.servingType;
        this.visitID;
        this.serveStep;
        this.lastOfVisit;
        this.reminderState;
        this.integrationID;
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
        this.transferredByEmpID;
        this.transferredByWinID;
        this.transferredFromServiceID;
        this.heldByWinID;
        this.dispensedByEmp;
        this.dispensedByWin;
        this.assignedByWinID;



        this.TimeProirityValue = function () {
            //Return the priority of this transaction; using priority time and priority
        };

    }
}
module.exports = transaction;
