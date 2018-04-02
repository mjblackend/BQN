class transaction {
    constructor() {
        //Attributes
        this.ID;
        this.TicketSequence;
        this.Symbol;
        this.QueueID;
        this.SegmentID;
        this.Priority;
        this.OrderOfServing;
        this.Language;
        this.Note;
        this.RecallNo;
        this.IdentServiceIDs;
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
        this.SMSTicket;
        this.Customer_ID;
        this.DisplayTicketNumber;
        this.Hall_ID;


        //Times
        this.ArrivalTime;
        this.AppointmentTime;
        this.WaitingSeconds;
        this.ServiceSeconds;
        this.HoldingSeconds;
        this.LastCallTime;
        this.EndTime;
        this.WaitingStartTime;
        this.PriorityTime;
        this.StartServingTime;
        this.CreationTime;
        this.CloseTime;
        this.LastQueueUpdateSent;

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

        //,[CustomerName] in customer atrributes
        //,[HallNumber] //replaced in hall ID
        //,[CustomerInformation] customer attributes
        //this.CustomerID;
        //,[CI_1]
        //,[CI_2]
        //,[CFQuestion1ID]
        //,[CFAnswer1ID]
        //,[CFQuestion2ID]
        //,[CFAnswer2ID]
        //,[CFQuestion3ID]
        //,[CFAnswer3ID]
        //,[SelfServiceStartTime]
        //,[SelfServiceParameters]
        //,[CustomerPhotoURL]
        //,[CustomerMobile]
    }
}
module.exports = transaction;
