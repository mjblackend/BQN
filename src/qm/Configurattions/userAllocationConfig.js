//User branch allocation saved on server
class userAllocationConfig {
    constructor() {
        this.orgID;
        this.userID;
        this.branchID;
        this.supervising;
        this.monitoring;
        this.serving;
        this.alertReceiving;
        this.changeQueuingPermissions;
    }
}
module.exports = userAllocationConfig;