class counterConfig {
    constructor() {
        this.ID;
        this.OrgID;
        this.Type_LV;       //CustomerServing = 0,TicketDispenser = 1,TicketDispenserWithUser = 2,NoCallServing = 3
        this.QueueBranch_ID;
        this.CounterNumber;
        this.Hall_ID;
        this.ScreenTitle;
        this.AnnouncementKeys;
        this.SegmentAllocationType;  //   SelectAll = 1,Customize = 2
    }
}

module.exports = counterConfig;