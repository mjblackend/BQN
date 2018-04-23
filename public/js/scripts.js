var count = 0;
var callsnumber = 0;
var socket;

var branchID;

function LoadPage() {
    socket = io.connect('');
    socket.on('connect', function (data) {
        // socket.emit('join', 'Hello World from client');
    });
    socket.on('broadcast', function (data) {
        var elem = document.getElementById('ticketnumberAll');
        elem.innerHTML = data;
    });
}

function SendMessage() {
    socket.emit('message', 'hello to Message');
}
function IssueTicketMultiple(number) {
    var index = 0;
    for (index = 0; index < number; index++) {
        IssueTicket();
    }
}

function nextMultiple(number) {
    var index = 0;
    for (index = 0; index < number; index++) {
        Next();
    }
}

function Next() {

    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: new Date(),
        title: 'next',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

        var elem = document.getElementById('servedticketnumber');
        elem.innerHTML = JSON.parse(this.responseText).ServedDisplayTicketNumber;

        elem = document.getElementById('ticketnumberCalled');
        elem.innerHTML = JSON.parse(this.responseText).CurrentDisplayTicketNumber;

        elem = document.getElementById('counterState');
        elem.innerHTML = JSON.parse(this.responseText).CurrentStateType;

        elem = document.getElementById('errorMessage');
        elem.innerHTML = JSON.parse(this.responseText).errorMessage;

    };
    xhr.send(JSON.stringify(Message));



}
function Connect() {
    var e = document.getElementById("branches");
    branchID = e.options[e.selectedIndex].value;
    e.disabled = true;

    var e = document.getElementById("btnconnect");
    e.disabled = true;
    console.log(branchID);

    FillServices(branchID);
    FillCounters(branchID);
    FillSegments(branchID);
}


function FillServices(branchid) {

    var Message = {
        time: new Date(),
        title: 'read',
        payload: {
            EntityName: "service",
            BranchID: branchid
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var services = JSON.parse(this.responseText).services;
        var options = "";
        for (let i = 0; i < services.length; i++) {
            options = options + '<option value="' + services[i].ID + '">' + services[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('services');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};
function FillSegments(branchid) {

    var Message = {
        time: new Date(),
        title: 'read',
        payload: {
            EntityName: "segment",
            BranchID: branchid
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var segments = JSON.parse(this.responseText).segments;
        var options = "";
        for (let i = 0; i < segments.length; i++) {
            options = options + '<option value="' + segments[i].ID + '">' + segments[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('segments');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};
function FillCounters(branchid) {
    //Get serving or no call counters
    var Message = {
        time: new Date(),
        title: 'read',
        payload: {
            EntityName: "counter",
            BranchID: branchid,
            types: ["0", "3"]
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        var counters = JSON.parse(this.responseText).counters;
        var options = "";
        for (let i = 0; i < counters.length; i++) {
            options = options + '<option value="' + counters[i].ID + '">' + counters[i].Name_L1 + '</option>'
        }

        elem = document.getElementById('counters');
        elem.innerHTML = options;
    };
    xhr.send(JSON.stringify(Message));
};


function COpen() {

    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: new Date(),
        title: 'open',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

        var elem = document.getElementById('servedticketnumber');
        elem.innerHTML = JSON.parse(this.responseText).ServedDisplayTicketNumber;

        elem = document.getElementById('ticketnumberCalled');
        elem.innerHTML = JSON.parse(this.responseText).CurrentDisplayTicketNumber;

        elem = document.getElementById('counterState');
        elem.innerHTML = JSON.parse(this.responseText).CurrentStateType;

        elem = document.getElementById('errorMessage');
        elem.innerHTML = JSON.parse(this.responseText).errorMessage;


    };
    xhr.send(JSON.stringify(Message));



}
function CBreak() {

    var e = document.getElementById("counters");
    let counterID = e.options[e.selectedIndex].value;

    var Message = {
        time: new Date(),
        title: 'break',
        payload: {
            orgid: "1",
            counterid: counterID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);

        var elem = document.getElementById('servedticketnumber');
        elem.innerHTML = JSON.parse(this.responseText).ServedDisplayTicketNumber;

        elem = document.getElementById('ticketnumberCalled');
        elem.innerHTML = JSON.parse(this.responseText).CurrentDisplayTicketNumber;

        elem = document.getElementById('counterState');
        elem.innerHTML = JSON.parse(this.responseText).CurrentStateType;

        elem = document.getElementById('errorMessage');
        elem.innerHTML = JSON.parse(this.responseText).errorMessage;

    };
    xhr.send(JSON.stringify(Message));



}

function IssueTicket() {

    var e = document.getElementById("services");
    let serviceID = e.options[e.selectedIndex].value;

    var e = document.getElementById("segments");
    let segmentID = e.options[e.selectedIndex].value;

    var Message = {
        source: 'user1',
        time: 'password1',
        title: 'issueTicket',
        payload: {
            orgid: "1",
            segmentid: segmentID,
            serviceid: serviceID,
            branchid: branchID,
            languageindex: "0",
            origin: "0"
        }
    };


    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')

    xhr.onload = function () {
        // do something to response
        count += 1;
        console.log(this.responseText);
        var elem = document.getElementById('ticketnumber');
        elem.innerHTML = JSON.parse(this.responseText).displayTicketNumber;

        elem = document.getElementById('errorMessage');
        elem.innerHTML = JSON.parse(this.responseText).errorMessage;

        if (count < 1000) {
            // Postdata();
        }
    };

    xhr.send(JSON.stringify(Message));
    callsnumber++;
    var elem = document.getElementById('calls');
    elem.innerHTML = callsnumber;
}