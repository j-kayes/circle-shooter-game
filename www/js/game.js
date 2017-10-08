var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
var socket = io.connect(); // Pass in the server address. 
game.socket = socket;
game.pickups = [];
game.pickupsData = [];
game.otherPlayersMap = new Map();
//game.otherPlayersData = [];

const playerColour = 0xFFFFFF;
const pickupColours = [0xFF0000, 0x00FF00, 0x0000FF];
const radiusAtZero = 10; // Radius of the player when the mass is 0.
const initialPlayerMass = 25;

const MAP_WIDTH = 5000;
const MAP_HEIGHT = 5000;

socket.on('newPlayer', function(playerData) {

    let newPlayer = new CircleObject(game, { x: playerData.position.x, y: playerData.position.x }, Math.sqrt(initialPlayerMass) + radiusAtZero, playerColour);
    newPlayer.mass = initialPlayerMass;
    game.otherPlayersMap.set(playerData.id, newPlayer);

});
socket.on('removePlayer', function(id) {
    game.otherPlayersMap.get(id).gameObject.destroy();
    game.otherPlayersMap.delete(id);
});
socket.on('removePickup', function(pId) {
    for(let i = 0; i < game.pickups.length; i++) {
        if(game.pickups[i].pId === pId) {
            game.pickups[i].gameObject.destroy();
            game.pickups.splice(i, 1);
        }
        if(game.pickupsData[i].pId === pId) {
            game.pickupsData.splice(i, 1);
        }
    }
});

function preload() {
    game.load.image('background', 'assets/background.png');
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.drawObject = game.add.graphics(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

    socket.emit('getPickupData', null, function(pickups) {
        for(let i = 0; i < pickups.length; i++) {
            let pickup = pickups[i];
            game.pickups.push(new CircleObject(game, pickup.pos, pickup.radius, pickup.colour));
            game.pickups[i].pId = pickup.pId;
        }
        game.pickupsData = pickups;
    });
}
function create() {
    game.world.resize(MAP_WIDTH, MAP_HEIGHT);

    var ranX = Math.random() * game.world.width;
    var ranY = Math.random() * game.world.height;
    // TODO: Consider creating a player classs that extends from circle object
    game.player = new CircleObject(game, { x: ranX, y: ranY }, Math.sqrt(initialPlayerMass) + radiusAtZero, playerColour);
    game.player.mass = initialPlayerMass; // Mass is used to calculate players radius acording to food pickups consumed

    let pos = { x: game.player.gameObject.position.x, y: game.player.gameObject.position.y};
    // This fills the playersData array:
    socket.emit('newPlayer', { id: socket.id, position: pos, mass: initialPlayerMass });
    // Creates new game objects from server data:
    socket.emit('getOtherPlayers', null, function (serverData) {
        for(let i = 0; i < serverData.length; i++) {
            if(serverData[i].id !== socket.id) {
                let player = new CircleObject(game, { x: serverData[i].position.x, y: serverData[i].position.x }, Math.sqrt(serverData[i].mass) + radiusAtZero, playerColour);
                player.mass = serverData.mass;
                game.otherPlayersMap.set(serverData[i].id, player);
            }
        }
    });
}
function update() {
    game.physics.arcade.moveToPointer(game.player.gameObject, 60, game.input.activePointer, 500);
    
    game.camera.x = game.player.gameObject.position.x - game.width/2;
    game.camera.y = game.player.gameObject.position.y - game.height/2;

    for(let i = 0; i < game.pickups.length; i++) {
        if(onScreen(game.pickups[i].gameObject)) {
            if(detectCollisionCircle(game.player.gameObject.position, game.player.radius, game.pickups[i].gameObject.position, game.pickups[i].radius)) {
                socket.emit('removePickup', game.pickupsData[i].pId);
                game.pickups[i].gameObject.destroy();
                game.pickups.splice(i, 1);
                game.pickupsData.splice(i, 1);
                game.player.mass += 8;
            }
            else {
                game.pickups[i].draw();
            }
        }
    }
    game.otherPlayersMap.forEach(function(value) {
        if(onScreen(value.gameObject)) {
            value.draw();
        }
    });
    let playerPos = { x: game.player.gameObject.position.x, y: game.player.gameObject.position.y };
    let playerData = { id: socket.id, position: playerPos, mass: game.player.mass};
    socket.emit('updatePlayer', playerData); // Send player data to server.
    // Get player data from server:
    socket.emit('getOtherPlayers', null, function (serverData) {
        // Updates the position and mass of the other players acording to server data:
        for(let i = 0; i < serverData.length; i++) {
            if(serverData[i].id !== socket.id) {
                let otherPlayer = game.otherPlayersMap.get(serverData[i].id);
                if(otherPlayer) {
                    try{
                        otherPlayer.gameObject.x = serverData[i].position.x;
                        otherPlayer.gameObject.y = serverData[i].position.y;
                        otherPlayer.mass = serverData[i].mass;
                        otherPlayer.radius = Math.sqrt(otherPlayer.mass) + radiusAtZero;
                        //otherPlayer.draw();
                    }
                    catch(e) {
                        console.log(e);
                    }
                }
            }
        } 
    });

    game.player.draw()
    game.player.radius = Math.sqrt(game.player.mass) + radiusAtZero;

    
}
function render() {
    game.drawObject.clear();
}
function createCircleObject(position, radius, colour) {
    let circle = new CircleObject(game, position, radius, colour);
    return circle.gameObject;
}
function detectCollisionCircle(position1, radius1, position2, radius2) {
    let distanceSqr = Math.pow((position2.x - position1.x), 2) + Math.pow((position2.y - position1.y), 2);

    if(distanceSqr < Math.pow((radius1 + radius2), 2)) {
        return true;
    }
    else {
        return false;
    }
}
function onScreen(object) {
    if(object.x < (game.camera.x + game.width) && object.x > game.camera.x) {
        if(object.y < (game.camera.y + game.height) && object.y > game.camera.y) {
            return true;
        }
    }
    return false;
}