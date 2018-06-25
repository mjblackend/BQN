const request = require('request');
const http = require('http');
var maxRequests = 1000;
var DoneRequests = 0 ;
var Now=  new Date();
var apiMessage = require("../src/dataMessage/apiMessage");


//Moch Data
var tapiMessage = new apiMessage;
tapiMessage.topicName = "next";
tapiMessage.payload = {
  orgid: "1",
  counterid: "120",
  branchid: "106",
  languageindex: "0",
  origin: "0"
};
tapiMessage.time = new Date();


var options = {
    url: 'http://localhost:3000/processCommand',
	body:JSON.stringify(tapiMessage),
    headers: {
        'Content-Type': 'application/json'
    }
};


for (var i=0;i<maxRequests;i++)
 { 
request.post(options, function(error, response, body){
	if (error)
	{
		console.log(error);
	}
	if (body)
	{
			var payload= JSON.parse(body);
			var nextString= 'Ticket Number=' + payload.displayTicketNumber + " " + ' Counter State =' + payload.CurrentStateType;
			console.log(nextString);
	}
		else{
		console.log("error request error" + DoneRequests);
		
	}

	DoneRequests = DoneRequests + 1;
	if (DoneRequests == maxRequests)
	{
		console.log((( (new Date()) -  Now )/ 1000) + " ms");
		DoneRequests=0;
	}
});
 }
