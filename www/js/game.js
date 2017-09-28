var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
var socket = io.connect('localhost:3000'); // Pass in the server address. 
game.socket = socket;
game.pickups = [];

const playerColour = 0xFFFFFF;
const pickupColours = [0xFF0000, 0x00FF00, 0x0000FF];
const pickupRadius = 5;

function preload() {
    game.load.image('background', 'assets/background.png');
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.drawObject = game.add.graphics(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
}
function create() {
    game.world.resize(5000, 5000);
    //game.add.tileSprite(0, 0, 256, 256, 'background'); // Only in top left
    game.pickups = generatePickups(1000);

    var ranX = Math.random() * game.world.width;
    var ranY = Math.random() * game.world.height;
    game.player = new CircleObject(game, { x: ranX, y: ranY }, 25, playerColour);

    //socket.emit("newPlayer", { id: socket.id, position: player.getPosition() });
}
function update() {
    game.physics.arcade.moveToPointer(game.player.gameObject, 60, game.input.activePointer, 500);

    // TODO: Consider writing my own collision detection logic, as this doesn't work as the size of the image is 0.
    //game.physics.arcade.collide(game.player.gameObject, game.collectablesGroup, collectableCollision, null, this);
    
    game.camera.x = game.player.gameObject.position.x - game.width/2;
    game.camera.y = game.player.gameObject.position.y - game.height/2;

    for(var i = 0; i < game.pickups.length; i++) {
        if(game.pickups[i].gameObject.x < (game.camera.x + game.width) && game.pickups[i].gameObject.x > game.camera.x) {
            if(game.pickups[i].gameObject.y < (game.camera.y + game.height) && game.pickups[i].gameObject.y > game.camera.y) {
                if(detectCollisionCircle(game.player.gameObject.position, game.player.radius, game.pickups[i].gameObject.position, game.pickups[i].radius)) {
                    game.pickups[i].gameObject.destroy();
                    game.pickups.splice(i, 1);
                }
                else {
                    game.pickups[i].draw();
                }
            }
        }
    }

    game.player.draw()
}
function render() {
    game.drawObject.clear();
}
function generatePickups(number) {
    let pickups = [];
    for(let i = 0; i < number; i++) {
        let random = Math.random();
        let ranX = Math.random() * game.world.width;
        let ranY = Math.random() * game.world.height;
        if(random < 0.4) {
            pickups.push(new CircleObject(game, { x: ranX, y: ranY },  pickupRadius, pickupColours[0]));
        }
        else if(random < 0.8) {
            pickups.push(new CircleObject(game, { x: ranX, y: ranY },  pickupRadius, pickupColours[1]));
        }
        else{
            pickups.push(new CircleObject(game, { x: ranX, y: ranY },  pickupRadius, pickupColours[2]));
        }
        
    }
    return pickups;
}
function createCircleObject(position, radius, colour) {
    let circle = new CircleObject(game, position, radius, colour);
    return circle.gameObject;
}
function collectableCollision(object1, object2) {
    console.log("collision");
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