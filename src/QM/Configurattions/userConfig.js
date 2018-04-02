//User Data saved on server
class userAllocationConfig {
    constructor() {
        this.ID;
        this.OrgID;
        this.Department_ID;
        this.LoginName;
        this.Password;
        //this.PasswordConfirmation;
        this.MobilePhone;
        this.Email;
        this.PinCode;
        this.AuthenticationType_LV; //  System = 0,Windows = 1
        this.UserADGUID;
        this.ShouldChangePassword;
        this.Locked;
        this.LastLoginTime;
        this.LastLogoutTime;
        this.Language_ID;
        this.SetPassword;
        this.FailedLogins;
        this.LastPasswordChangeTime;
        this.UserToken;
        this.ActiveOnBranch_ID;
        this.Type_LV;   // Normal = 0,InternalAPI = 1,ExternalAPI = 2
        this.SegmentAllocationType; //   SelectAll = 1,Customize = 2
    }
}
module.exports = userAllocationConfig;