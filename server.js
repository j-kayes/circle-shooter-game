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

const MAP_WIDTH = 5000;
const MAP_HEIGHT = 5000;
const NUM_PICKUPS = 1000;

var playersData = []; // To hold the mass and positions of all the players.
var pickupsData = []; // Holds the data for the pickup objects.
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

    socket.on('getServerConsts', function(data, callback) {
        data.gameWidth = MAP_WIDTH;
        data.gameHeight = MAP_HEIGHT;
        callback(data);
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
