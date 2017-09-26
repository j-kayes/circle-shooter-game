class CircleObject {
    constructor(game, graphicsObject, radius, velocity, socket, position) {
        this.socket = socket;
        this.position = position;
        this.velocity = velocity;


        // game.physics.arcade.enable(this.gameObject);
        // this.gameObject.body.bounce.y = 0.2;
        // this.gameObject.body.gravity.y = 300;
        // this.gameObject.body.collideWorldBounds = true;
    }

    update(deltaTime) {
        // Update position:
        position.x += deltaTime*velocity.x;
        position.y += deltaTime*celocity.y;

        graphicsObject.graphics.beginFill(0xFF0000, 1);
        graphics.drawCircle(position.x-radius, position.y-radius, 2*radius);


    }
}