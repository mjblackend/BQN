class serviceAllocationConfig {
    constructor() {
        this.ID;
        this.OrgID;
        this.QueueBranch_ID;
        this.Service_ID;
        this.Counter_ID;
        this.User_ID;
        this.PriorityLevel; //Primary or Secondary
        this.workflow; // this is a different entity on current server (it should be mixed in api level)
    }
}
module.exports = serviceAllocationConfig;

