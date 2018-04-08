class counterConfig {
    constructor() {
        this.id;
        this.org_ID;
        this.branch_ID;
        this.name_L1;
        this.name_L2;
        this.name_L3;
        this.name_L4;
        this.type_LV;       //CustomerServing = 0,TicketDispenser = 1,TicketDispenserWithUser = 2,NoCallServing = 3
        this.counterNumber;
        this.hall_ID;
        this.screenTitle;
        this.announcementKeys;
        this.segmentAllocationType;  //   SelectAll = 1,Customize = 2
    }
}

module.exports = counterConfig;