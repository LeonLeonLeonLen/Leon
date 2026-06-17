// hier wird ein phaser game erstellt und mit socket.io verbunden
// wir erstellen zuerst eine scene mit creat und update, laden racetrack.jpg als tilesprite
// und erstellen ein auto als sprite, das sich mit den pfeiltasten bewegen lässt
// wir verbinden das spiel mit socket.io, damit wir die position des autos an den server senden können
// und die position des autos von anderen spielern empfangen können

const socket = io();

class OmegaIo extends Phaser.Scene {
    preload() {
        this.load.image("racetrack", "assets/racetrack.jpg");
        this.load.image("car", "assets/car1.png");
    }

    create() {
        this.add.tileSprite(0, 0, 1200, 800, "racetrack").setOrigin(0, 0);

        this.car = this.physics.add.sprite(400, 300, 'car').setCollideWorldBounds(true).setScale(0.3);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.setupMultiplayer();
    }

    update(time, delta) {
        if (this.cursors.left.isDown) {
            this.car.setAngularVelocity(-200);
        } else if (this.cursors.right.isDown){
            this.car.setAngularVelocity(200);
        } else {
            this.car.setAngularVelocity (0);
        }

        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.car.rotation - Math.PI / 2, 300, this.car.body.velocity);
        } else if (this.cursors.down.isDown) {
            this.physics.velocityFromRotation(this.car.rotation - Math.PI / 2, -300, this.car.body.velocity);
        } else {
            this.car.body.velocity.scale(0.98);
        }

        socket.emit("update", {
            x: this.car.x,
            y: this.car.y,
            angle: this.car.angle
        });

    }

    setupMultiplayer() {
        socket.emit("ready");

        socket.on("init", (data) => {
            this.playerId = data.id;
            this.players = data.players;
            const playerData = this.players[this.playerId];
            this.car.setPosition(playerData.x, playerData.y);
            this.car.setAngle(playerData.angle);
            this.car.setTint(playerData.color);
        });
    }


}

new Phaser.Game({
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    scene: OmegaIo,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
});