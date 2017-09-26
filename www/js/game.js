var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var socket = io.connect('localhost:3000'); // Pass in the server address. 
var graphicsObject = game.add.graphics(0, 0);

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    cursors = game.input.keyboard.createCursorKeys();
}
function create() {
    game.world.resize(1000, 1000);

    var ranX = Math.random() * game.world.width;
    var ranY = Math.random() * game.world.height;
    player = new CircleObject(game, graphicsObject, 10, {x: 0, y:0}, socket, { x: ranX, y: ranY });
    spawnOtherPlayers();
    socket.emit("newPlayer", { id: socket.id, position: player.getPosition() });
}
function update() {
    game.camera.x = player.position.x - game.width/2;
    game.camera.y = player.position.y - game.height/2;

    player.update(game.time.elapsed);

 }