class serviceAllocationConfig {
    constructor() {
        this.id;
        this.orgID;
        this.branch_ID;
        this.service_ID;
        this.counter_ID;
        this.user_ID;
        this.priorityLevel; //Primary or Secondary
        this.workflow; // this is a different entity on current server (it should be mixed in api level)
    }
}
module.exports = serviceAllocationConfig;

