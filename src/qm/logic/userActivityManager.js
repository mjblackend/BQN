var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var configurationService = require("../configurations/configurationService");
var dataService = require("../data/dataService");
var userActivity = require("../data/userActivity");
var idGenerator = require("../localRepositories/idGenerator");
var counterData = require("../data/counterData");



//Update Activity
var UpdateActivity = function (userActivity) {
    try {
        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == userActivity.branch_ID;
        }
        );
        if (BracnhData != null && BracnhData.userActivitiesData != null) {
            for (let i = 0; i < BracnhData.userActivitiesData.length; i++) {
                if (BracnhData.userActivitiesData[i].id == userActivity.id) {
                    BracnhData.userActivitiesData[i] = userActivity;
                    break;
                }
            }

            //Update To data base
            repositoriesManager.userActivitiesRep.Update(userActivity);
            return common.success;
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

//Add or Update Activity
var AddActivity = function (userActivity) {
    try {
        //Generate ID in not exists
        if (userActivity.id <= 0) {
            userActivity.id = idGenerator.getNewID();
        }

        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == userActivity.branch_ID;
        }
        );
        if (BracnhData != null && BracnhData.userActivitiesData != null) {
            //To Branch Transactions
            BracnhData.userActivitiesData.push(userActivity);

            //Update To data base
            repositoriesManager.userActivitiesRep.Add(userActivity);
            return common.success;
        }
        else {
            return common.error;
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }

};

var CreateNewState = function (OrgID, BranchID, CounterID, type) {
    try {
        let NewActivity = new userActivity()
        NewActivity.org_ID = OrgID;
        NewActivity.branch_ID = BranchID;
        NewActivity.id = idGenerator.getNewID();
        NewActivity.type = type;
        NewActivity.counter_ID = CounterID;
        NewActivity.startTime = Date.now();
        NewActivity.duration = 0;
        NewActivity.calenderDuration = 0;
        NewActivity.closed = 0;
        AddActivity(NewActivity);
        return NewActivity
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var UpdateState = function (Activity) {
    try {
        Activity.lastActionTime = Date.now();
        //UpdateActivity(Activity);
        return Activity
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var CloseState = function (Activity) {
    try {
        Activity.endTime = Date.now();
        Activity.duration = (Activity.endTime - Activity.startTime) / 1000;
        Activity.calenderDuration = (Activity.endTime - Activity.startTime) / 1000;
        Activity.closed = 1;
        UpdateActivity(Activity);
        return Activity
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Check Counter Validation ForNext
var CheckCounterValidationForNext = function (OrgID, BranchID, CounterID) {
    try {

        let CurrentActivity;
        let CounterData;

        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == BranchID;
        }
        );

        //Get current State
        if (BracnhData && BracnhData.countersData) {
            for (let i = 0; i < BracnhData.countersData.length; i++) {
                if (BracnhData.countersData[i].id == CounterID) {
                    CounterData = BracnhData.countersData[i];
                    break;
                }
            }
            if (!CounterData) {
                let tcounterData = new counterData();
                tcounterData.id = CounterID;
                BracnhData.countersData.push(tcounterData);
                CounterData = BracnhData.countersData[BracnhData.countersData.length - 1];
            }
        }

        //Get Counter Status
        if (CounterData) {
            if (CounterData.currentState_ID) {
                CurrentActivity = BracnhData.userActivitiesData.find(function (value) {
                    return CounterData.currentState_ID == value.id;
                });
            }
        }

        // Change the Current activity
        if (CurrentActivity) {
            if (CurrentActivity.type != enums.EmployeeActiontypes.InsideCalenderLoggedOff && CurrentActivity.type != enums.EmployeeActiontypes.InsideCalenderLoggedOff && CurrentActivity.type != enums.EmployeeActiontypes.NoCallServing && CurrentActivity.type != enums.EmployeeActiontypes.TicketDispensing) {
                return common.success;
            }
            else {
                return common.not_valid;
            }
        }
        else {
            CurrentActivity = CreateNewState(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState_ID = CurrentActivity.id;
            return common.success;
        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};


//Change Current Counter State
var ChangeCurrentCounterState = function (OrgID, BranchID, CounterID,CurrentStateTypes) {
    try {
        let oldActivity;
        let CurrentActivity;
        let CounterData;

        //Get Branch Data
        let BracnhData = dataService.branchesData.find(function (value) {
            return value.id == BranchID;
        }
        );

        //Get current State
        if (BracnhData && BracnhData.countersData) {
            for (let i = 0; i < BracnhData.countersData.length; i++) {
                if (BracnhData.countersData[i].id == CounterID) {
                    CounterData = BracnhData.countersData[i];
                    break;
                }
            }
            if (!CounterData) {
                let tcounterData = new counterData();
                tcounterData.id = CounterID;
                BracnhData.countersData.push(tcounterData);
                CounterData = BracnhData.countersData[BracnhData.countersData.length - 1];
            }
        }

        //Get Counter Status
        if (CounterData) {
            if (CounterData.currentState_ID) {
                CurrentActivity = BracnhData.userActivitiesData.find(function (value) {
                    return CounterData.currentState_ID == value.id;
                });
            }
        }

        if (CurrentActivity) {
            if (CounterData.currentTransaction_ID > 0) {
                if (CurrentActivity.type != enums.EmployeeActiontypes.Serving) {
                    oldActivity = CloseState(CurrentActivity);
                    CurrentActivity = CreateNewState(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Serving);
                }
                else{
                    CurrentActivity= UpdateState(CurrentActivity);
                }
            }
            else {
                if (CurrentActivity.type != enums.EmployeeActiontypes.Ready) {
                    oldActivity = CloseState(CurrentActivity);
                    CurrentActivity = CreateNewState(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
                }
                else{
                    CurrentActivity= UpdateState(CurrentActivity);
                }
            }
            CounterData.currentState_ID = CurrentActivity.id;
        }
        else {
            if (CounterData.currentTransaction_ID > 0) {
                CurrentActivity = CreateNewState(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Serving);
            }
            else {
                CurrentActivity = CreateNewState(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            }
        }

        CurrentStateTypes.push( CurrentActivity.type);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};




module.exports.CheckCounterValidationForNext = CheckCounterValidationForNext;
module.exports.ChangeCurrentCounterState = ChangeCurrentCounterState;