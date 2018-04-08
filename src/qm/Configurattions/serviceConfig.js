class serviceConfig {
    constructor() {
        this.id;
        this.org_ID;
        this.department_ID;
        this.name_L1;
        this.name_L2;
        this.name_L3;
        this.name_L4;
        this.serviceConfig_ID;
        this.identificationValue;
        this.calendar_ID;
        this.numberOfTickets;
        this.orderOfServing;
        this.serviceGroup_ID;
        this.addAnotherToThisService;
        this.addThisToAnotherService;
        this.transferAnotherToThisService;
        this.transferThisToAnotherService;
        this.transferToCounter;
        this.displayOnKiosk;
        this.showOnAppointment;
        this.showOnRemoteAppointment;
        this.showOnRemoteTicketing;
        this.maxCustomersPerDay;
        this.useBranchCalendar;
        this.specifyCounter;
        this.specifyCustomerIdentification;
        this.canSkipCustomerIdentification;
        this.customerIdentificationID;
        this.specifyPrerequisiteURL;
        this.prerequisiteURL;
    }
}
module.exports = serviceConfig;