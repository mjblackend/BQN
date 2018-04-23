const EmployeeActiontypes = {
    LoggedIn: 1,
    NotReady: 2,
    Ready: 3,
    Break: 4,
    Serving: 5,
    InsideCalenderLoggedOff: 6,
    OutsideCalenderLoggedOff: 7,
    TicketDispensing: 8,
    Processing: 9,
    Custom: 10,
    Supervising: 11,
    NoCallServing: 12
};


const StateType = {
    Pending: 0,
    PendingRecall: 1,
    Serving: 2,
    closed: 3,
    Recall: 4,
    servingRecall: 5,
    OnHold: 6,
    Dependant: 7
};

const SegmentAllocationType = {
    SelectAll: 1,
    Customize: 2
};

const commands = {
    IssueTicket: "issueTicket",
    Next: "next",
    Break: "break",
    Open: "open",
    Read: "read"
};



module.exports.SegmentAllocationType = SegmentAllocationType;
module.exports.EmployeeActiontypes = EmployeeActiontypes;
module.exports.StateType = StateType;
module.exports.commands = commands;


