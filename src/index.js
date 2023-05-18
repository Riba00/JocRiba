import Phaser from 'phaser';

let score = 0;
let scoreText;
let scoreImage
let lives = 3;
let livesText;
let coin_sound
let die_sound
let fondo
let fondo2


// Escena 1
class Scene1 extends Phaser.Scene {

    constructor() {
        super({key: 'Scene1'});
    }

    preload() {
        this.load.image('background', 'src/assets/images/background.png');
        this.load.image('spike', 'src/assets/images/spike.png');
        this.load.image('seta', 'src/assets/images/seta.png');
        this.load.image('enemy', 'src/assets/images/enemy.png');

        // At last image must be loaded with its JSON
        this.load.atlas('player', 'src/assets/images/kenney_player.png', 'src/assets/images/kenney_player_atlas.json');
        this.load.image('tiles', 'src/assets/tilesets/platformPack_tilesheet.png');
        // Load the export Tiled JSON
        this.load.tilemapTiledJSON('map', 'src/assets/tilemaps/level1.json');

        this.load.spritesheet('star', 'src/assets/images/star.png', {frameWidth: 48, frameHeight: 48})

        this.load.audio('fondo', 'src/assets/audio/fondo.mp3');
        this.load.audio('coin_sound', 'src/assets/audio/coin.mp3');
        this.load.audio('die_sound', 'src/assets/audio/die.mp3');
    }

    create() {
        // Create a tile map, which is used to bring our level in Tiled
        // to our game world in Phaser
        const map = this.make.tilemap({key: 'map'});
        // Add the tileset to the map so the images would load correctly in Phaser
        const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
        // Place the background image in our game world
        const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
        // Scale the image to better match our game's resolution
        backgroundImage.setScale(4, 1);
        // Add the platform layer as a static group, the player would be able
        // to jump on platforms like world collisions but they shouldn't move
        const platforms = map.createLayer('Platforms', tileset, 0, 200);


        fondo = this.sound.add('fondo',);
        fondo.play();
        coin_sound = this.sound.add('coin_sound',);
        die_sound = this.sound.add('die_sound');




        // There are many ways to set collision between tiles and players
        // As we want players to collide with all of the platforms, we tell Phaser to
        // set collisions for every tile in our platform layer whose index isn't -1.
        // Tiled indices can only be >= 0, therefore we are colliding with all of
        // the platform layer
        platforms.setCollisionByExclusion(-1, true);

        this.star1 = this.physics.add.sprite(400, 550, 'star')
        this.physics.add.collider(this.star1, platforms)


        this.star2 = this.physics.add.sprite(550, 300, 'star')
        this.physics.add.collider(this.star2, platforms)

        this.star3 = this.physics.add.sprite(1175, 300, 'star')
        this.physics.add.collider(this.star3, platforms)

        this.seta = this.physics.add.sprite(1560, 300, 'seta')
        this.physics.add.collider(this.seta, platforms)

        this.enemy = this.physics.add.sprite(750, 200, 'enemy')
        this.physics.add.collider(this.enemy, platforms)



        // Add the player to the game world
        this.player = this.physics.add.sprite(50, 525, 'player');
        this.player.setBounce(0.1); // our player will bounce from items
        this.player.setCollideWorldBounds(true); // don't go out of the map
        this.physics.add.collider(this.player, platforms);

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);
        this.physics.world.bounds.width = platforms.width;
        this.physics.world.bounds.height = 640;

        // Create the walking animation using the last 2 frames of
        // the atlas' first row
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

        // Create an idle animation i.e the first frame
        this.anims.create({
            key: 'idle',
            frames: [{key: 'player', frame: 'robo_player_0'}],
            frameRate: 10,
        });

        // Use the second frame of the atlas for jumping
        this.anims.create({
            key: 'jump',
            frames: [{key: 'player', frame: 'robo_player_1'}],
            frameRate: 10,
        });

        // Enable user input via cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create a sprite group for all spikes, set common properties to ensure that
        // sprites in the group don't move via gravity or by player collisions
        this.spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Get the spikes from the object layer of our Tiled map. Phaser has a
        // createFromObjects function to do so, but it creates sprites automatically
        // for us. We want to manipulate the sprites a bit before we use them
        map.getObjectLayer('Spikes').objects.forEach((spike) => {
            // Add new spikes to our sprite group
            const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
            // By default the sprite has loads of whitespace from the base image, we
            // resize the sprite to reduce the amount of whitespace used by the sprite
            // so collisions can be more precise
            spikeSprite.body.setSize(spike.width, spike.height - 20).setOffset(0, 20);
        });

        // Add collision between the player and the spikes
        this.physics.add.collider(this.player, this.spikes, playerHit, null, this);
        this.physics.add.overlap(this.player, this.enemy, playerHit, null, this);



        let scoreImage = this.add.image(10, 10, 'star');
        scoreImage.setOrigin(0, 0);
        scoreImage.setScale(0.5);
        scoreText = this.add.text(70, 10, score.toString()+'/3', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000'
        });
        scoreText.setOrigin(1, 0);
        scoreText.setScrollFactor(0);
        scoreImage.setScrollFactor(0);

        livesText = this.add.text(100, 10, 'Lifes: ' + lives, {fontSize: '24px', fill: '#000000'});
        livesText.setScrollFactor(0);


        this.physics.add.overlap(this.player, this.star1, function (player, star1) {
            incrementScore(star1);
        }, null, this);

        this.physics.add.overlap(this.player, this.star2, function (player, star2) {
            incrementScore(star2);
        }, null, this);

        this.physics.add.overlap(this.player, this.star3, function (player, star3) {
            incrementScore(star3);
        }, null, this);
        this.physics.add.overlap(this.player, this.seta, level1ToLevel2, null, this);

        function incrementScore(sprite) {
            score++;
            scoreText.setText(score.toString()+ '/3');
            scoreImage.setTexture('star');
            scoreImage.setScale(0.5);
            coin_sound.play();

            sprite.destroy();
        }


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
        this.load.image('background2', 'src/assets/images/background.png');
        this.load.image('spike2', 'src/assets/images/spike.png');
        this.load.image('seta2', 'src/assets/images/seta.png');
        this.load.image('enemy2', 'src/assets/images/enemy.png');

        // At last image must be loaded with its JSON
        this.load.atlas('player', 'src/assets/images/kenney_player.png', 'src/assets/images/kenney_player_atlas.json');
        this.load.image('tiles', 'src/assets/tilesets/platformPack_tilesheet.png');
        // Load the export Tiled JSON
        this.load.tilemapTiledJSON('map2', 'src/assets/tilemaps/level2.json');

        this.load.spritesheet('star2', 'src/assets/images/star.png', {frameWidth: 48, frameHeight: 48})

        this.load.audio('fondo2', 'src/assets/audio/fondo2.mp3');
        this.load.audio('coin_sound', 'src/assets/audio/coin.mp3');
        this.load.audio('die_sound', 'src/assets/audio/die.mp3');
    }

    create() {
        // Create a tile map, which is used to bring our level in Tiled
        // to our game world in Phaser
        const map = this.make.tilemap({key: 'map2'});
        // Add the tileset to the map so the images would load correctly in Phaser
        const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
        // Place the background image in our game world
        const backgroundImage = this.add.image(0, 0, 'background2').setOrigin(0, 0);
        // Scale the image to better match our game's resolution
        backgroundImage.setScale(5, 1);
        // Add the platform layer as a static group, the player would be able
        // to jump on platforms like world collisions but they shouldn't move
        const platforms = map.createLayer('Platforms', tileset, 0, 200);
        // There are many ways to set collision between tiles and players
        // As we want players to collide with all of the platforms, we tell Phaser to
        // set collisions for every tile in our platform layer whose index isn't -1.
        // Tiled indices can only be >= 0, therefore we are colliding with all of
        // the platform layer
        platforms.setCollisionByExclusion(-1, true);

        this.star1 = this.physics.add.sprite(400, 300, 'star')
        this.physics.add.collider(this.star1, platforms)


        this.star2 = this.physics.add.sprite(550, 400, 'star')
        this.physics.add.collider(this.star2, platforms)

        this.star3 = this.physics.add.sprite(1175, 300, 'star')
        this.physics.add.collider(this.star3, platforms)

        this.star4 = this.physics.add.sprite(1000, 200, 'star')
        this.physics.add.collider(this.star4, platforms)

        this.seta = this.physics.add.sprite(1560, 300, 'seta')
        this.physics.add.collider(this.seta, platforms)

        this.enemy = this.physics.add.sprite(850, 200, 'enemy')
        this.physics.add.collider(this.enemy, platforms)

        coin_sound = this.sound.add('coin_sound');
        fondo2 = this.sound.add('fondo2',{loop:true});
        fondo2.play();



        // Add the player to the game world
        this.player = this.physics.add.sprite(50, 525, 'player');
        this.player.setBounce(0.1); // our player will bounce from items
        this.player.setCollideWorldBounds(true); // don't go out of the map
        this.physics.add.collider(this.player, platforms);

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);
        this.physics.world.bounds.width = platforms.width;
        this.physics.world.bounds.height = 640;

        // Create the walking animation using the last 2 frames of
        // the atlas' first row
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

        // Create an idle animation i.e the first frame
        this.anims.create({
            key: 'idle',
            frames: [{key: 'player', frame: 'robo_player_0'}],
            frameRate: 10,
        });

        // Use the second frame of the atlas for jumping
        this.anims.create({
            key: 'jump',
            frames: [{key: 'player', frame: 'robo_player_1'}],
            frameRate: 10,
        });

        // Enable user input via cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create a sprite group for all spikes, set common properties to ensure that
        // sprites in the group don't move via gravity or by player collisions
        this.spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Get the spikes from the object layer of our Tiled map. Phaser has a
        // createFromObjects function to do so, but it creates sprites automatically
        // for us. We want to manipulate the sprites a bit before we use them
        map.getObjectLayer('Spikes').objects.forEach((spike) => {
            // Add new spikes to our sprite group
            const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
            // By default the sprite has loads of whitespace from the base image, we
            // resize the sprite to reduce the amount of whitespace used by the sprite
            // so collisions can be more precise
            spikeSprite.body.setSize(spike.width, spike.height - 20).setOffset(0, 20);
        });

        // Add collision between the player and the spikes
        this.physics.add.collider(this.player, this.spikes, playerHit, null, this);
        this.physics.add.overlap(this.player, this.enemy, playerHit, null, this);



        let scoreImage = this.add.image(10, 10, 'star');
        scoreImage.setOrigin(0, 0);
        scoreImage.setScale(0.5);
        scoreText = this.add.text(70, 10, score.toString()+'/7', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000'
        });
        scoreText.setOrigin(1, 0);
        scoreText.setScrollFactor(0);
        scoreImage.setScrollFactor(0);

        livesText = this.add.text(100, 10, 'Lifes: ' + lives, {fontSize: '24px', fill: '#000000'});
        livesText.setScrollFactor(0);


        this.physics.add.overlap(this.player, this.star1, function (player, star1) {
            incrementScore(star1);
        }, null, this);

        this.physics.add.overlap(this.player, this.star2, function (player, star2) {
            incrementScore(star2);
        }, null, this);

        this.physics.add.overlap(this.player, this.star3, function (player, star3) {
            incrementScore(star3);
        }, null, this);

        this.physics.add.overlap(this.player, this.star4, function (player, star4) {
            incrementScore(star4);
        }, null, this);

        this.physics.add.overlap(this.player, this.seta, level2ToVictory, null, this);

        function incrementScore(sprite) {
            score++;
            scoreText.setText(score.toString()+'/7');
            scoreImage.setTexture('star');
            scoreImage.setScale(0.5);
            coin_sound.play();

            sprite.destroy();
        }
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

// Escena 3
class Scene3 extends Phaser.Scene {
    constructor() {
        super({key: 'Scene3'});
    }

    preload() {
        this.load.image('background3', 'src/assets/images/cover.png');
        this.load.image('startButton', 'src/assets/images/startButton.png');
        this.load.image('aboutButton', 'src/assets/images/aboutButton.png');
    }

    create() {
        const backgroundImage = this.add.image(0, 0, 'background3').setOrigin(0, 0);
        const startButton = this.add.sprite(400, 400, 'startButton').setInteractive();
        const aboutButton = this.add.sprite(400, 500, 'aboutButton').setInteractive();

        startButton.on('pointerover', () => {
            startButton.setTexture('startButton');
            this.input.setDefaultCursor('pointer');
        });

        startButton.on('pointerout', () => {
            startButton.setTexture('startButton');
            this.input.setDefaultCursor('auto');
        });

        startButton.on('pointerup', () => {
            this.scene.start('Scene1');
            lives = 3;
            score = 0;
            this.input.setDefaultCursor('auto');
        });

        aboutButton.on('pointerover', () => {
            startButton.setTexture('startButton');
            this.input.setDefaultCursor('pointer');
        });

        aboutButton.on('pointerout', () => {
            startButton.setTexture('startButton');
            this.input.setDefaultCursor('auto');
        });

        aboutButton.on('pointerup', () => {
            const url = 'https://github.com/Riba00/JocRiba'; // Reemplaza con la URL que desees abrir
            window.open(url, '_blank');
        });

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
        this.load.image('background4', 'src/assets/images/gameOver.png');
        this.load.image('homeButton', 'src/assets/images/homeButton.png');

    }

    create() {
        const backgroundImage = this.add.image(0, 0, 'background4').setOrigin(0, 0);
        const homeButton = this.add.sprite(450, 400, 'homeButton').setInteractive();

        homeButton.on('pointerover', () => {
            homeButton.setTexture('homeButton');
            this.input.setDefaultCursor('pointer');
        });

        homeButton.on('pointerout', () => {
            homeButton.setTexture('homeButton');
            this.input.setDefaultCursor('auto');
        });

        homeButton.on('pointerup', () => {
            this.scene.start('Scene3');
            this.input.setDefaultCursor('auto');
        });
    }

    update() {
        // Lógica de actualización de la escena 4
    }
}

// Escena 4
class Scene5 extends Phaser.Scene {
    constructor() {
        super({key: 'Scene5'});
    }

    preload() {
        this.load.image('background5', 'src/assets/images/victory.png');
        this.load.image('homeButton2', 'src/assets/images/homeButton.png');
    }

    create() {
        const backgroundImage = this.add.image(0, 0, 'background5').setOrigin(0, 0);
        const homeButton2 = this.add.sprite(450, 400, 'homeButton2').setInteractive();

        homeButton2.on('pointerover', () => {
            homeButton2.setTexture('homeButton2');
            this.input.setDefaultCursor('pointer');
        });

        homeButton2.on('pointerout', () => {
            homeButton2.setTexture('homeButton2');
            this.input.setDefaultCursor('auto');
        });

        homeButton2.on('pointerup', () => {
            this.scene.start('Scene3');
            this.input.setDefaultCursor('auto');
        });





    }

    update() {
        // Lógica de actualización de la escena 4
    }
}

// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 645,
    scene: [Scene3, Scene2, Scene1, Scene4, Scene5],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 400},
            debug: false
        }
    },
};

function playerHit(player) {

    if (lives === 1) {
        this.scene.start('Scene4');
        try {
            fondo.pause()
        }catch (e){

        }
        try {
            fondo2.pause()
        }catch (e){

        }

    } else if (player.y+50 < this.enemy.y){
        this.enemy.destroy()
    } else{
        die_sound.play();
        this.physics.pause();
        player.setY(this.player.y - 500);
        lives--
        livesText.setText('Lifes: ' + lives);
        // Set velocity back to 0
        player.setVelocity(0, 0);
        // Put the player back in its original position
        player.setX(50);
        player.setY(525);
        // Use the default `idle` animation
        player.play('idle', true);
        // Set the visibility to 0 i.e. hide the player
        player.setAlpha(0);
        // Add a tween that 'blinks' until the player is gradually visible
        let tw = this.tweens.add({
            targets: player,
            alpha: 1,
            duration: 100,
            ease: 'Linear',
            repeat: 5,
        });
        setTimeout(() => {
            this.physics.resume();
        }, 600);
    }
}

function level1ToLevel2() {
    if (score >= 3){
        this.scene.start('Scene2');
        fondo.stop();
    }
}

function level2ToVictory() {
    if (score >= 7){
        this.scene.start('Scene5');
        fondo2.stop();
    }
}





// Creación del juego
const game = new Phaser.Game(config);



