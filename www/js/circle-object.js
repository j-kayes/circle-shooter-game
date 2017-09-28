class CircleObject {
    constructor(game, position, radius, colour) {
        this.game = game;
        this.radius = radius;
        this.gameObject = game.add.sprite(position.x, position.y, null);

        game.physics.arcade.enable(this.gameObject);
        this.gameObject.body.setCircle(radius);
        this.gameObject.body.bounce = 0.2;
        this.gameObject.body.collideWorldBounds = true;
        this.gameObject.circleSprite = this;

        this.colour = colour;
    }

    draw() {
        this.game.drawObject.beginFill(this.colour, 1);
        this.circleImage = this.game.drawObject.drawCircle(this.gameObject.x, this.gameObject.y, 2*this.radius);
    }
}