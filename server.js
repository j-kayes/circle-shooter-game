var express = require('express');  
var app = express();

// Serve files in this directory:
app.use(express.static(__dirname + '/www'));

// Use express to start listening on port 3000 and then get a reference to the server:
const server = app.listen(process.env.PORT || 3000, function () {  
    var port = server.address().port;
    console.log('Server running on port %s', port);
});

// Pass this server to socket.io: 
const io = require('socket.io')(server);

const NUM_PICKUPS = 1000;
const MAP_WIDTH = 5000;
const MAP_HEIGHT = 5000;
const PICKUP_COLOURS = [0xFF0000, 0x00FF00, 0x0000FF];
const PICKUP_RADIUS = 5;

var playersData = []; // To hold the mass and positions of all the players.
var pickupsData = generatePickups(NUM_PICKUPS); // Holds the data for the pickup objects.
io.on('connection', function(socket) {  
    console.log('Player connected');
    socket.on('disconnect', function(){
        console.log('Player disconnected');
        for(let i = 0; i < playersData.length; i++) {
            if(playersData[i].id === socket.id) {
                playersData.splice(i, 1);
            }
        }
        socket.broadcast.emit("removePlayer", socket.id);
    });

    socket.on('updatePickups', function(clientPickupData, callback){

        pickupsData = clientPickupData;
        callback();
    });
    socket.on('getPickupData', function(clientData, callback) {
        callback(pickupsData);
    });
    socket.on('removePickup', function(pId) {
        for(let i = 0; i < pickupsData.length; i++) {
            if(pickupsData[i].pId === pId) {
                pickupsData.splice(i, 1);
            }
        }
        socket.broadcast.emit('removePickup', pId);
    });
    socket.on('newPlayer', function(playerData) {
        playersData.push(playerData);
        socket.broadcast.emit('newPlayer', playerData);
    });
    socket.on('getOtherPlayers', function(data, callback) {
        callback(playersData);
    });
    socket.on('updatePlayer', function(playerData){
        for(let i = 0; i < playersData.length; i++) {
            if(playersData[i].id === playerData.id) {
                playersData[i] = playerData;
            }
        }
    });
});

function generatePickups(number) {
    let pickups = [];
    for(let i = 0; i < number; i++) {
        let random = Math.random();
        let ranX = Math.random() *  MAP_WIDTH;
        let ranY = Math.random() *  MAP_HEIGHT;
        if(random < 0.4) {
            pickups.push({pos: { x: ranX, y: ranY },  radius: PICKUP_RADIUS, colour: PICKUP_COLOURS[0], pId: i});
        }
        else if(random < 0.8) {
            pickups.push({pos: { x: ranX, y: ranY },  radius: PICKUP_RADIUS, colour: PICKUP_COLOURS[1], pId: i});
        }
        else{
            pickups.push({pos: { x: ranX, y: ranY },  radius: PICKUP_RADIUS, colour: PICKUP_COLOURS[2], pId: i});
        }
    }
    return pickups;
}