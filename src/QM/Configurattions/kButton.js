class kButton {
    constructor() {
        this.ID;
        this.OrgID;
        this.Name_L1 ;
        this.Name_L2 ;
        this.Name_L3 ;
        this.Name_L4 ;
        this.ObjectID ; //service ID or Segment ID
        this.OrderOnKiosk;
        this.PrePageURL ;
        this.ImageID ;
        
        this.WelcomeMSG_L1 ;
        this.WelcomeMSG_L2 ;
        this.WelcomeMSG_L3 ;
        this.WelcomeMSG_L4 ;
        
        this.TicketInfoMSG_L1 ;
        this.TicketInfoMSG_L2 ;
        this.TicketInfoMSG_L3 ;
        this.TicketInfoMSG_L4 ;   
        
        this.Languages ;
    }
}

module.exports = kButton;