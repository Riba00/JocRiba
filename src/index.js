import Phaser from 'phaser';
import logoImg from './assets/logo.png';

// Escena 1
class Scene1 extends Phaser.Scene {
    constructor() {
        super({key: 'Scene1'});
    }

    preload() {
        this.load.image('background', 'src/assets/images/background.png');
        this.load.image('spike', 'src/assets/images/spike.png');
        // At last image must be loaded with its JSON
        this.load.atlas('player', 'src/assets/images/kenney_player.png', 'src/assets/images/kenney_player_atlas.json');
        this.load.image('tiles', 'src/assets/tilesets/platformPack_tilesheet.png');
        // Load the export Tiled JSON
        this.load.tilemapTiledJSON('map', 'src/assets/tilemaps/level1.json');
    }

    create() {
        const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
        backgroundImage.setScale(2, 0.8);

        const map = this.make.tilemap({key: 'map'});

        const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');

        const platforms = map.createStaticLayer('Platforms', tileset, 0, 200);

        platforms.setCollisionByExclusion(-1, true);

        this.player = this.physics.add.sprite(50, 300, 'player');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platforms);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'robo_player_',
                start: 2,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{key: 'player', frame: 'robo_player_0'}],
            frameRate: 10,
        });

        this.anims.create({
            key: 'jump',
            frames: [{key: 'player', frame: 'robo_player_1'}],
            frameRate: 10,
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else {
            // If no keys are pressed, the player keeps still
            this.player.setVelocityX(0);
            // Only show the idle animation if the player is footed
            // If this is not included, the player would look idle while jumping
            if (this.player.body.onFloor()) {
                this.player.play('idle', true);
            }
        }

// Player can jump while walking any direction by pressing the space bar
// or the 'UP' arrow
        if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
            this.player.setVelocityY(-350);
            this.player.play('jump', true);
        }

        if (this.player.body.velocity.x > 0) {
            this.player.setFlipX(false);
        } else if (this.player.body.velocity.x < 0) {
            // otherwise, make them face the other side
            this.player.setFlipX(true);
        }


    }
}

// Escena 2
class Scene2 extends Phaser.Scene {
    constructor() {
        super({key: 'Scene2'});
    }

    preload() {
        // Carga los recursos necesarios para la escena 2
    }

    create() {
        // Configuración inicial de la escena 2
    }

    update() {
        // Lógica de actualización de la escena 2
    }
}

// Escena 3
class Scene3 extends Phaser.Scene {
    constructor() {
        super({key: 'Scene3'});
    }

    preload() {
        // Carga los recursos necesarios para la escena 3
    }

    create() {
        // Configuración inicial de la escena 3
    }

    update() {
        // Lógica de actualización de la escena 3
    }
}

// Escena 4
class Scene4 extends Phaser.Scene {
    constructor() {
        super({key: 'Scene4'});
    }

    preload() {
        // Carga los recursos necesarios para la escena 4
    }

    create() {
        // Configuración inicial de la escena 4
    }

    update() {
        // Lógica de actualización de la escena 4
    }
}

// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Scene1, Scene2, Scene3, Scene4],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
};

// Creación del juego
const game = new Phaser.Game(config);



