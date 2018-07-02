var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var dataService = require("../data/dataService");
var userActivity = require("../data/userActivity");
var idGenerator = require("../localRepositories/idGenerator");
var counterData = require("../data/counterData");
var configurationService = require("../configurations/configurationService");


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
                    if (BracnhData.userActivitiesData[i].closed == 1) {
                        BracnhData.userActivitiesData.splice(i, 1);
                    }
                    break;
                }
            }


            //Update To data base
            repositoriesManager.entitiesRepo.UpdateSynch(userActivity);
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
            repositoriesManager.entitiesRepo.AddSynch(userActivity);
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
        repositoriesManager.entitiesRepo.UpdateSynch(Activity);
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

//Check Counter Validation For Open
var isCounterValidForAutoNext = function (CurrentActivity) {
    try {
        // Change the Current activity
        if (CurrentActivity) {
            if (CurrentActivity.type == enums.EmployeeActiontypes.Ready) {
                return true;
            }
        }
        return false;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

//Check Counter Validation For Open
var CounterValidationForOpen = function (errors, OrgID, BranchID, CounterID) {
    try {
        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
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
            CounterData.currentState = CurrentActivity;
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
var ChangeCurrentCounterStateForOpen = function (errors, OrgID, BranchID, CounterID, CountersInfo) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            CloseActivity(CurrentActivity);
        }

        let counter = configurationService.getCounterConfig(CounterID);

        //Check for correct type
        if (counter && counter.Type_LV == enums.counterTypes.CustomerServing) {

            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
        }
        else
        {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.NoCallServing);
        }

        CounterData.currentState = CurrentActivity;
        CountersInfo.push(CurrentActivity);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};



//Check Counter Validation ForNext
var CounterValidationForBreak = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        // Change the Current activity
        if (CurrentActivity) {
            if (CurrentActivity.type != enums.EmployeeActiontypes.InsideCalenderLoggedOff && CurrentActivity.type != enums.EmployeeActiontypes.InsideCalenderLoggedOff 
                && CurrentActivity.type != enums.EmployeeActiontypes.TicketDispensing && CurrentActivity.type != enums.EmployeeActiontypes.Custom && CurrentActivity.type != enums.EmployeeActiontypes.Break) {
                return common.success;
            }
            else {
                errors.push("Not in the correct state to Break");
                return common.not_valid;
            }
        }
        else {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState = CurrentActivity;
            return common.success;
        }
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


//Check Counter Validation For Hold
var CounterValidationForHold = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        let counter = configurationService.getCounterConfig(CounterData.id);

        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {

            return common.not_valid;
        }

        // ths status should be serving
        if (CurrentActivity) {
            if (CurrentActivity.type == enums.EmployeeActiontypes.Serving) {
                return common.success;
            }
            else {
                return common.not_valid;
            }
        }
        else
        {
            return common.not_valid;
        }

    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};

//Check Counter Validation ForNext
var CounterValidationForServe = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        let counter = configurationService.getCounterConfig(CounterData.id);

        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing &&  counter.Type_LV != enums.counterTypes.NoCallServing) {

            return common.not_valid;
        }

        // Change the Current activity
        if (CurrentActivity) {
            if (CurrentActivity.type == enums.EmployeeActiontypes.Serving || CurrentActivity.type == enums.EmployeeActiontypes.NoCallServing ||
                 CurrentActivity.type == enums.EmployeeActiontypes.Ready || CurrentActivity.type == enums.EmployeeActiontypes.Serving || CurrentActivity.type == enums.EmployeeActiontypes.Processing) {
                return common.success;
            }
            else {
                return common.not_valid;
            }
        }
        else {
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState = CurrentActivity;
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
var CounterValidationForNext = function (errors, OrgID, BranchID, CounterID) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        let counter = configurationService.getCounterConfig(CounterData.id);

        //Check for correct type
        if (counter && counter.Type_LV != enums.counterTypes.CustomerServing) {

            return common.not_valid;
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
            CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Ready);
            CounterData.currentState = CurrentActivity;
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
var ChangeCurrentCounterStateForBreak = function (errors, OrgID, BranchID, CounterID, CountersInfo) {
    try {

        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
        BracnhData = output[0];
        CounterData = output[1];
        CurrentActivity = output[2];

        if (CurrentActivity) {
            CloseActivity(CurrentActivity);
        }

        CurrentActivity = CreateNewActivity(OrgID, BranchID, CounterID, enums.EmployeeActiontypes.Break);
        CounterData.currentState = CurrentActivity;
        CountersInfo.push(CurrentActivity);
        return common.success;
    }
    catch (error) {
        errors.push(error.toString());
        logger.logError(error);
        return common.error;
    }
};



//Change Current Counter State
var ChangeCurrentCounterStateForNext = function (errors, OrgID, BranchID, CounterID, CountersInfo) {
    try {
        let output = [];
        let BracnhData;
        let CounterData;
        let CurrentActivity;
        dataService.getCurrentData(OrgID, BranchID, CounterID, output);
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

        CounterData.currentState = CurrentActivity;
        CountersInfo.push(CurrentActivity);
        return common.success;
    }
    catch (error) {
        logger.logError(error);
        errors.push(error.toString());
        return common.error;
    }
};


module.exports.CounterValidationForHold = CounterValidationForHold;
module.exports.isCounterValidForAutoNext = isCounterValidForAutoNext;
module.exports.CounterValidationForNext = CounterValidationForNext;
module.exports.CounterValidationForServe = CounterValidationForServe;
module.exports.ChangeCurrentCounterStateForNext = ChangeCurrentCounterStateForNext;
module.exports.CounterValidationForBreak = CounterValidationForBreak;
module.exports.ChangeCurrentCounterStateForBreak = ChangeCurrentCounterStateForBreak;
module.exports.CounterValidationForOpen = CounterValidationForOpen;
module.exports.ChangeCurrentCounterStateForOpen = ChangeCurrentCounterStateForOpen;
