var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var repositoriesManager = require("../localRepositories/repositoriesManager");
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
            repositoriesManager.userActivitiesRep.UpdateSynch(userActivity);
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
            repositoriesManager.userActivitiesRep.AddSynch(userActivity);
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

//Create New User Activity
var CreateNewActivity = function (OrgID, BranchID, CounterID, type) {
    try {
        let NewActivity = new userActivity();
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
        return NewActivity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var UpdateActionTime = function (Activity) {
    try {
        Activity.lastActionTime = Date.now();
        repositoriesManager.userActivitiesRep.AddSynch(Activity);
        return Activity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

var CloseActivity = function (Activity) {
    try {
        Activity.endTime = Date.now();
        Activity.duration = (Activity.endTime - Activity.startTime) / 1000;
        Activity.calenderDuration = (Activity.endTime - Activity.startTime) / 1000;
        Activity.closed = 1;
        UpdateActivity(Activity);
        return Activity;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

//Get the Branch Data and counter data then the current Activity
function getCurrentData(OrgID, BranchID, CounterID, output) {
    try {

        let BracnhData;
        let CounterData;
        let CurrentActivity;

        //Get Branch Data
        BracnhData = dataService.branchesData.find(function (value) {
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
        output.push(BracnhData);
        output.push(CounterData);
        output.push(CurrentActivity);
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}


//Check Counter Validation For Open
var CounterValidationForOpen = function (errors,OrgID, BranchID, CounterID) {
    try {
        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        // Change the Current activity
        if (CurrentActivity) {
            if (CurrentActivity.type == enums.EmployeeActiontypes.Custom || CurrentActivity.type == enums.EmployeeActiontypes.Break || CurrentActivity.type == enums.EmployeeActiontypes.NotReady) {
                return common.success;
            }
            else {
                errors.push("Not in the correct state to open");
                return common.not_valid;
            }
        }
        else {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState_ID = CurrentActivity.id;
            return common.success;
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

//Change Current Counter State
var ChangeCurrentCounterStateForOpen = function (errors,OrgID, BranchID, CounterID, CurrentStateTypes) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            CloseActivity(CurrentActivity);
        }

        CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
        CounterData.currentState_ID = CurrentActivity.id;
        CurrentStateTypes.push(CurrentActivity.type);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Check Counter Validation ForNext
var CounterValidationForBreak = function (errors,OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        // Change the Current activity
        if (CurrentActivity) {
            if (CurrentActivity.type != enums.EmployeeActiontypes.InsideCalenderLoggedOff && CurrentActivity.type != enums.EmployeeActiontypes.InsideCalenderLoggedOff && CurrentActivity.type != enums.EmployeeActiontypes.NoCallServing
                && CurrentActivity.type != enums.EmployeeActiontypes.TicketDispensing && CurrentActivity.type != enums.EmployeeActiontypes.Custom && CurrentActivity.type != enums.EmployeeActiontypes.Break) {
                return common.success;
            }
            else {
                errors.push("Not in the correct state to Break") ;
                return common.not_valid;
            }
        }
        else {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState_ID = CurrentActivity.id;
            return common.success;
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};







//Check Counter Validation ForNext
var CounterValidationForNext = function (errors,OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

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
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState_ID = CurrentActivity.id;
            return common.success;
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Change Current Counter State
var ChangeCurrentCounterStateForBreak = function (errors,OrgID, BranchID, CounterID, CurrentStateTypes) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            CloseActivity(CurrentActivity);
        }

        CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Break);
        CounterData.currentState_ID = CurrentActivity.id;
        CurrentStateTypes.push(CurrentActivity.type);
        return common.success;
    }
    catch (error) {
        errors.push(error.toString());
        logger.logError(error);
        return common.error;
    }
};



//Change Current Counter State
var ChangeCurrentCounterStateForNext = function (errors,OrgID, BranchID, CounterID, CurrentStateTypes) {
    try {
         let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            if (CounterData.currentTransaction_ID > 0) {
                if (CurrentActivity.type != enums.EmployeeActiontypes.Serving) {
                    CloseActivity(CurrentActivity);
                    CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Serving);
                }
                else {
                    CurrentActivity = UpdateActionTime(CurrentActivity);
                }
            }
            else {
                if (CurrentActivity.type != enums.EmployeeActiontypes.Ready) {
                    CloseActivity(CurrentActivity);
                    CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
                }
                else {
                    CurrentActivity = UpdateActionTime(CurrentActivity);
                }
            }
        }
        else {
            if (CounterData.currentTransaction_ID > 0) {
                CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Serving);
            }
            else {
                CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            }
        }

        CounterData.currentState_ID = CurrentActivity.id;
        CurrentStateTypes.push(CurrentActivity.type);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};




module.exports.CounterValidationForNext = CounterValidationForNext;
module.exports.ChangeCurrentCounterStateForNext = ChangeCurrentCounterStateForNext;
module.exports.CounterValidationForBreak = CounterValidationForBreak;
module.exports.ChangeCurrentCounterStateForBreak = ChangeCurrentCounterStateForBreak;
module.exports.CounterValidationForOpen = CounterValidationForOpen;
module.exports.ChangeCurrentCounterStateForOpen = ChangeCurrentCounterStateForOpen;
