// Preload assets
function preload() {
  this.load.image('bug1', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bug_1.png');
  this.load.image('bug2', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bug_2.png');
  this.load.image('bug3', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bug_3.png');
  this.load.image('platform', 'https://content.codecademy.com/courses/learn-phaser/physics/platform.png');
  this.load.image('codey', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/codey.png');
  this.load.image('bugPellet', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugPellet.png');
  this.load.image('bugRepellent', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugRepellent.png');
}

// Helper functions
function sortedEnemies() {
  return gameState.enemies.getChildren().sort((a, b) => a.x - b.x);
}

function numOfTotalEnemies() {
  return gameState.enemies.getChildren().length;
}

const gameState = { enemyVelocity: 1 };

function create() {
  gameState.active = true;
  this.input.on('pointerup', () => { if (!gameState.active) this.scene.restart(); });

  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();

  gameState.scoreText = this.add.text(175, 482, 'Bugs Left: 24', { fontSize: '15px', fill: '#000000' });
  gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);
  gameState.player.setCollideWorldBounds(true);
  this.physics.add.collider(gameState.player, platforms);

  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Creating enemy bugs
  gameState.enemies = this.physics.add.group();
  for (let yVal = 1; yVal < 4; yVal++) {
    for (let xVal = 1; xVal < 9; xVal++) {
      gameState.enemies.create(50 * xVal, 50 * yVal, 'bug1').setScale(.6).setGravityY(-200);
    }
  }

  // Creating enemy pellets
  const pellets = this.physics.add.group();
  function genPellet() {
    const randomBug = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren());
    pellets.create(randomBug.x, randomBug.y, 'bugPellet');
  }
  gameState.pelletsLoop = this.time.addEvent({ delay: 300, callback: genPellet, callbackScope: this, loop: true });

  this.physics.add.collider(pellets, platforms, (pellet) => pellet.destroy());

  this.physics.add.collider(pellets, gameState.player, () => {
    gameState.active = false;
    gameState.pelletsLoop.destroy();
    gameState.enemyVelocity = 1;
    this.physics.pause();
    this.add.text(180, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
  });

  gameState.bugRepellent = this.physics.add.group();

  this.physics.add.collider(gameState.enemies, gameState.bugRepellent, (bug, repellent) => {
    bug.destroy();
    repellent.destroy();
    gameState.scoreText.setText(`Bugs Left: ${numOfTotalEnemies()}`);
  });
}

function update() {
  if (gameState.active) {
    if (gameState.cursors.left.isDown) {
      gameState.player.setVelocityX(-160);
    } else if (gameState.cursors.right.isDown) {
      gameState.player.setVelocityX(160);
    } else {
      gameState.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
      gameState.bugRepellent.create(gameState.player.x, gameState.player.y, 'bugRepellent').setGravityY(-400);
    }

    if (numOfTotalEnemies() === 0) {
      gameState.active = false;
      gameState.enemyVelocity = 1;
      this.physics.pause();
      this.add.text(160, 250, 'You Win!', { fontSize: '15px', fill: '#000000' });
    } else {
      gameState.enemies.getChildren().forEach(enemy => enemy.x += gameState.enemyVelocity);
      gameState.leftMostBug = sortedEnemies()[0];
      gameState.rightMostBug = sortedEnemies()[sortedEnemies().length - 1];
      if (gameState.leftMostBug.x < 10 || gameState.rightMostBug.x > 440) {
        gameState.enemyVelocity *= -1;
        gameState.enemies.getChildren().forEach(enemy => enemy.y += 10);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
