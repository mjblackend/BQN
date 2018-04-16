var count=0;
var callsnumber=0;
function PostdataMultiple(){
    var index=0;
    for (index=0;index<1000; index++)
    {
        Postdata();
    }
}
function Postdata(){
    
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
        elem.innerHTML =this.responseText;
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