//User Data saved on server
class userAllocationConfig {
    constructor() {
        this.id;
        this.org_ID;
        this.department_ID;
        this.loginName;
        this.password;
        this.mobilePhone;
        this.email;
        this.pinCode;
        this.authenticationType_LV; //  System = 0,Windows = 1
        this.userADGUID;
        this.shouldChangePassword;
        this.locked;
        this.lastLoginTime;
        this.lastLogoutTime;
        this.language_ID;
        this.failedLogins;
        this.lastPasswordChangeTime;
        this.userToken;
        this.activeOnBranch_ID;
        this.type_LV;   // Normal = 0,InternalAPI = 1,ExternalAPI = 2
        this.segmentAllocationType; //   SelectAll = 1,Customize = 2
    }
}
module.exports = userAllocationConfig;