class serviceConfig {
    constructor() {
        this.ID;
        this.OrgID;
        this.Department_ID;
        this.ServiceConfig_ID;
        this.KButtonEntity;
        this.IdentificationValue;
        this.Calendar_ID;
        this.NumberOfTickets;
        this.OrderOfServing;
        this.ServiceSegmentPriorityRange = {}; //service_segmentConfig
        this.ServiceGroup_ID;
        this.AddAnotherToThisService;
        this.AddThisToAnotherService;
        this.TransferAnotherToThisService;
        this.TransferThisToAnotherService;
        this.TransferToCounter;
        this.DisplayOnKiosk;
        this.ShowOnAppointment;
        this.ShowOnRemoteAppointment;
        this.ShowOnRemoteTicketing;
        this.MaxCustomersPerDay;
        this.UseBranchCalendar;
        this.SpecifyCounter;
        this.SpecifyCustomerIdentification;
        this.CanSkipCustomerIdentification;
        this.CustomerIdentificationID;
        this.SpecifyPrerequisiteURL;
        this.PrerequisiteURL;
    }
}
module.exports = serviceConfig;