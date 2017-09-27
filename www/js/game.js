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
    game.world.resize(10000, 10000);
    //game.add.tileSprite(0, 0, 256, 256, 'background'); // Only in top left.
    game.collectablesGroup = game.add.physicsGroup();
    generatePickups(200);

    var ranX = Math.random() * game.world.width;
    var ranY = Math.random() * game.world.height;
    game.player = new CircleObject(game, { x: ranX, y: ranY }, 25, playerColour);

    //socket.emit("newPlayer", { id: socket.id, position: player.getPosition() });
}
function update() {
    game.physics.arcade.moveToPointer(game.player.gameObject, 60, game.input.activePointer, 500);

    // TODO: Consider writing my own collision detection logic, as this doesn't work as the size of the image is 0.
    game.physics.arcade.collide(game.player.gameObject, game.collectablesGroup, collectableCollision, null, this);
    
    game.camera.x = game.player.gameObject.position.x - game.width/2;
    game.camera.y = game.player.gameObject.position.y - game.height/2;

    // TODO: user normal for loop for this.
    game.collectablesGroup.forEach(function(pickup){
        pickup.circleSprite.draw();
    }, this);

    game.player.draw();
}
function render() {
    game.drawObject.clear();
}
function generatePickups(number) {
    for(let i = 0; i < number; i++) {
        let random = Math.random();
        let ranX = Math.random() * game.world.width;
        let ranY = Math.random() * game.world.height;
        if(random < 0.4) {
            game.collectablesGroup.add(createCircleObject({ x: ranX, y: ranY }, pickupRadius,  pickupColours[0]));
            //game.pickups.push(new CircleObject(game, { x: ranX, y: ranY },  pickupRadius, pickupColours[0]));
        }
        else if(random < 0.8) {
            game.collectablesGroup.add(createCircleObject({ x: ranX, y: ranY }, pickupRadius,  pickupColours[1]));
            //game.pickups.push(new CircleObject(game, { x: ranX, y: ranY },  pickupRadius, pickupColours[1]));
        }
        else{
            game.collectablesGroup.add(createCircleObject({ x: ranX, y: ranY }, pickupRadius,  pickupColours[2]));
            //game.pickups.push(new CircleObject(game, { x: ranX, y: ranY },  5, pickupColours[2]));
        }
        
    }
}
function createCircleObject(position, radius, colour) {
    let circle = new CircleObject(game, position, radius, colour);
    return circle.gameObject;
}
function collectableCollision(object1, object2) {
    console.log("collision");
}