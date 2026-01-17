<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Harvesting Click-to-Move Game</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.85.2/dist/phaser.min.js"></script>
    <style>
        body { margin: 0; }
        canvas { display: block; margin: auto; }
    </style>
</head>
<body>

<script>
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, target = null, speed = 100;
let resourceNode, harvestBucket;

function preload() {
    this.load.image('background', 'assets/background1.png');
    this.load.image('resource', 'assets/resource.png');     // placeholder image
    this.load.image('bucket', 'assets/bucket.png');         // placeholder image
    this.load.spritesheet('character', 'assets/character.png', {
        frameWidth: 32,
        frameHeight: 32
    });
}

function create() {
    this.add.image(400, 300, 'background').setOrigin(0.5);

    // Debug UI
    this.debugText = this.add.text(10, 10, '', {
        font: '16px Courier',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
    }).setScrollFactor(0);

    // Player
    player = this.physics.add.sprite(400, 300, 'character', 0);
    player.setCollideWorldBounds(true);
    player.inventory = 0;
    player.maxCarry = 20;

    // Resource Node
    resourceNode = this.physics.add.staticSprite(200, 200, 'resource');
    resourceNode.value = 300;

    // Harvest Bucket
    harvestBucket = this.physics.add.staticSprite(600, 400, 'bucket');
    harvestBucket.stored = 0;

    // Animations
    const directions = ['up','upR','right','downR','down','downL','left','upL'];
    for (let i = 0; i < directions.length; i++) {
        this.anims.create({
            key: directions[i],
            frames: this.anims.generateFrameNumbers('character', {
                start: i * 8,
                end: i * 8 + 7
            }),
            frameRate: 8,
            repeat: -1
        });
    }

    // Collisions
    this.physics.add.overlap(player, resourceNode, harvestResource, null, this);
    this.physics.add.overlap(player, harvestBucket, depositResource, null, this);

    // Click handling
    this.input.on('pointerdown', (pointer, objects) => {
        if (objects.length > 0) {
            target = objects[0]; // resource or bucket
        } else {
            target = { x: pointer.worldX, y: pointer.worldY };
        }
    });
}

function harvestResource(player, resource) {
    if (player.inventory >= player.maxCarry || resource.value <= 0) return;

    const amount = Math.min(20, resource.value);
    player.inventory += amount;
    resource.value -= amount;

    target = harvestBucket;
}

function depositResource(player, bucket) {
    if (player.inventory === 0) return;

    bucket.stored += player.inventory;
    player.inventory = 0;
    target = null;
}

function update() {
    if (!target) {
        player.setVelocity(0);
        return;
    }

    const tx = target.x ?? target.worldX;
    const ty = target.y ?? target.worldY;

    const distance = Phaser.Math.Distance.Between(player.x, player.y, tx, ty);
    if (distance < 4) {
        player.setVelocity(0);
        player.anims.stop();
        return;
    }

    const angle = Phaser.Math.Angle.Between(player.x, player.y, tx, ty);
    const velocity = this.physics.velocityFromRotation(angle, speed);
    player.setVelocity(velocity.x, velocity.y);

    const deg = Phaser.Math.RadToDeg(angle);
    const dirIndex = Phaser.Math.Wrap(Math.round((deg + 90) / 45), 0, 8);
    const anims = ['up','upR','right','downR','down','downL','left','upL'];
    player.anims.play(anims[dirIndex], true);

    this.debugText.setText(
        `Inventory: ${player.inventory}/20\n` +
        `Resource Left: ${resourceNode.value}\n` +
        `Bucket Stored: ${harvestBucket.stored}`
    );
}
</script>

</body>
</html>
