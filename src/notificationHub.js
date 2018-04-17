var io=require('socket.io')();
var connectedClients=[];

function initialize(server){
    io.attach(server);
    
    io.on('connection', function(client) {  
        connectedClients.push(client);
        console.log('Client connected...');
      
        client.on('join', function(data) {
            
            console.log(data);
            //io.emit("broadcast", 'A new client joined!');
            //client.emit('messages', 'Hello from server');
        });
      
        client.on('disconnect', function(data) {
          console.log('A Client disconnected!');
         });
        client.on('message', function(data) {
            console.log(data);
        });
      });
}

function broadcastMessage(message){
    io.emit('broadcast' ,message );
    
}


module.exports.initialize = initialize;
module.exports.broadcastMessage = broadcastMessage;