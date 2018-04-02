class counterData {
    constructor() {
        this.ID;
        this.Virtual;               //BMS and Kiosk counters
        this.ServingType;           //QueueServing = 0,RandomCall = 1
        this.LockState;             //UnLocked = 0, TimeLock = 1, PermanentLock = 2, GlobalLockSetting = 3, TimeUnlock = 4, NextTimeLock = 5
        this.LockStateTime;


        this.CurrentStateID;        //this is a state and the user used in, can be replaced by current user ID and state
        this.CurrentTransactionID;  //the transaction ID serving
    }
}
module.exports = counterData;
