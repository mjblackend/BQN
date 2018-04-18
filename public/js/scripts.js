var count=0;
var callsnumber=0;
var socket;

function LoadPage(){
    socket = io.connect('');
    socket.on('connect', function(data) {
       // socket.emit('join', 'Hello World from client');
    });
    socket.on('broadcast', function(data) {
        var elem = document.getElementById('ticketnumberAll');
        elem.innerHTML =data;
    });
}

function SendMessage(){
socket.emit('message', 'hello to Message');
}
function IssueTicketMultiple(number){
    var index=0;
    for (index=0;index<number; index++)
    {
        IssueTicket();
    }
}

function Next(){
    
    var Message ={
        time: new Date(),
        title: 'next',
        payload : {
            orgid: "1",
            counterid: "120",
            branchid: "106",
            languageindex: "0",
            origin: "0"
        }
        };

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/processCommand', true);
        xhr.setRequestHeader('Content-type', 'application/json')
         
        xhr.onload = function () {
            // do something to response
            count+=1;
            console.log(this.responseText);
            
            var elem = document.getElementById('ticketnumberCalled');
            elem.innerHTML =JSON.parse(this.responseText).displayTicketNumber;
            
         };
      xhr.send(JSON.stringify(Message));
         


}


function IssueTicket(){
    
   var Message ={
    source : 'user1' ,
    time: 'password1',
    title: 'issueTicket',
    payload : {
        orgid: "1",
        segmentid: "325",
        serviceid: "364",
        branchid: "106",
        languageindex: "0",
        origin: "0"
    }
    };
  

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/processCommand', true);
    xhr.setRequestHeader('Content-type', 'application/json')
     
    xhr.onload = function () {
        // do something to response
        count+=1;
        console.log(this.responseText);
        var elem = document.getElementById('ticketnumber');
        elem.innerHTML =JSON.parse(this.responseText).displayTicketNumber;
        if (count<1000)
        {
           // Postdata();
        }
     };
    
    xhr.send(JSON.stringify(Message));
    callsnumber++;
    var elem = document.getElementById('calls');
    elem.innerHTML =callsnumber;
}