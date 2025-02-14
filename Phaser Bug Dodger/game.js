function preload() {
  // Load images for game assets
  this.load.image('bug1', 'https://content.codecademy.com/courses/learn-phaser/physics/bug_1.png');
  this.load.image('bug2', 'https://content.codecademy.com/courses/learn-phaser/physics/bug_2.png');
  this.load.image('bug3', 'https://content.codecademy.com/courses/learn-phaser/physics/bug_3.png');
  this.load.image('platform', 'https://content.codecademy.com/courses/learn-phaser/physics/platform.png');
  this.load.image('codey', 'https://content.codecademy.com/courses/learn-phaser/physics/codey.png');
}

// Initialize game state object
const gameState = {
  score: 0 // Score counter
};

function create() {
  // Create player sprite and set scale
  gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);
  
  // Create a static platform
  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();

  // Display score text
  gameState.scoreText = this.add.text(195, 485, 'Score: 0', { fontSize: '15px', fill: '#000000' });

  // Prevent player from leaving game bounds
  gameState.player.setCollideWorldBounds(true);

  // Enable collision detection between player and platform
  this.physics.add.collider(gameState.player, platforms);
  
  // Capture keyboard inputs
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Group for bug enemies
  const bugs = this.physics.add.group();

  // Function to generate bugs randomly across the x-axis
  function bugGen() {
    const xCoord = Math.random() * 450;
    bugs.create(xCoord, 10, 'bug1');
  }

  // Looping event to spawn bugs every 100 milliseconds
  const bugGenLoop = this.time.addEvent({
    delay: 100,
    callback: bugGen,
    callbackScope: this,
    loop: true,
  });

  // Collision detection: bugs hitting the platform get destroyed and score is updated
  this.physics.add.collider(bugs, platforms, function (bug) {
    bug.destroy();
    gameState.score += 10;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  });
  
  // Collision detection: game ends if player collides with a bug
  this.physics.add.collider(gameState.player, bugs, () => {
    bugGenLoop.destroy(); // Stop spawning bugs
    this.physics.pause(); // Pause physics engine
    this.add.text(180, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
    this.add.text(152, 270, 'Click to Restart', { fontSize: '15px', fill: '#000000' });
    
    // Restart the game when the player clicks
    this.input.on('pointerup', () => {
      gameState.score = 0; // Reset score
      this.scene.restart();
    });
  });
}

// Update function to handle player movement
function update() {
  if (gameState.cursors.left.isDown) {
    gameState.player.setVelocityX(-160); // Move left
  } else if (gameState.cursors.right.isDown) {
    gameState.player.setVelocityX(160); // Move right
  } else {
    gameState.player.setVelocityX(0); // Stop moving
  }
}

// Phaser game configuration
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
  scene: {
    preload,
    create,
    update
  }
};

// Create a new Phaser game instance
const game = new Phaser.Game(config);
