class transaction {
    constructor() {
        //Attribute
        this.ID;
        this.TicketSequence;
        this.Symbol;
        this.ServiceID;
        this.SegmentID;
        this.Priority;
        this.OrderOfServing;
        this.Note;
        this.RecallNo;
        this.HoldCount;
        this.HoldReasonID;
        this.Appointment_ID;
        this.ServingSession;
        this.Origin;
        this.State;
        this.ServingType;
        this.VisitID;
        this.ServeStep;
        this.LastOfVisit;
        this.ReminderState;
        this.IntegrationID;
        this.SMSTicket;  //to be delayed
        this.DisplayTicketNumber;
        this.Hall_ID;
        this.Branch_ID;


        //Times
        this.ArrivalTime;
        this.AppointmentTime;
        this.WaitingSeconds;
        this.ServiceSeconds;
        this.HoldingSeconds;
        this.LastCallTime;
        this.EndServingTime;
        this.WaitingStartTime;
        this.PriorityTime;
        this.StartServingTime;
        this.CreationTime;
        this.CloseTime;
        

        //Counter and User IDs
        this.CounterID;
        this.UserID;
        this.TransferredByEmpID;
        this.TransferredByWinID;
        this.TransferredFromServiceID;
        this.HeldByWinID;
        this.DispensedByEmp;
        this.DispensedByWin;
        this.AssignedByWinID;



        this.TimeProirityValue = function () {
            //Return the priority of this transaction; using priority time and priority
        };

    }
}
module.exports = transaction;
