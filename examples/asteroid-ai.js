// Created 100% by Claude AI
// With only the .d.ts (types) file!

// Initialize the Hydra Canvas Library
const hydra = new HydraCanvasLib('game', {
  canvasWidth: 800,
  canvasHeight: 600
});

// Game state
const gameState = {
  score: 0,
  gameOver: false,
  asteroidSpeed: 3,
  asteroidSpawnRate: 1500, // milliseconds
  lastSpawnTime: 0,
  difficulty: 1
};

// Create player spaceship with better design using polygon
const playerShip = hydra.sprites.createNew(
  hydra.utility.getScreenCenter().x,
  hydra.utility.getScreenCenter().y + 150,
  SimpleRenderers.combination(
    // Main ship body using polygon for better shape
    SimpleRenderers.polygon([
      { x: 0, y: -20 },    // Nose
      { x: 15, y: 10 },    // Right wing
      { x: 8, y: 15 },     // Right back corner
      { x: 0, y: 10 },     // Center back
      { x: -8, y: 15 },    // Left back corner
      { x: -15, y: 10 },   // Left wing
    ], '#3498db'),
    // Engine glow
    SimpleRenderers.circle(5, '#e74c3c', { x: 0, y: 10, rotation: 0, filter: '' })
  )
);

// Add collision to player
playerShip.collider = hydra.collision.makeSquareCollider(25, 25);

// Create score display
const scoreDisplay = hydra.sprites.createNew(
  20, 
  30, 
  SimpleRenderers.text(() => `Score: ${gameState.score}`, 24, 'Arial', '#ffffff')
);

// Create game over display (initially hidden)
const gameOverDisplay = hydra.sprites.createNew(
  hydra.utility.getScreenCenter().x,
  hydra.utility.getScreenCenter().y,
  SimpleRenderers.text('GAME OVER\nClick to restart', 36, 'Arial', '#ff0000')
);
gameOverDisplay.renderer = gameOverDisplay.renderer.withShouldRender(() => gameState.gameOver);

// Set up the world
hydra.world.setBackgroundColor('#000000');
hydra.world.effects.vingette.enabled = true;
hydra.world.effects.vingette.color = '#000033';
hydra.world.effects.vingette.opacity = 0.7;

// Create a data storage for high score
const scoreStorage = hydra.data.createStorage('asteroidHighScore', 0);

// Create high score display
const highScoreDisplay = hydra.sprites.createNew(
  hydra.utility.getScreenSize().width - 20,
  30,
  SimpleRenderers.text(() => `High Score: ${scoreStorage.get('highScore') || 0}`, 24, 'Arial', '#ffffff', { x: 0, y: 0, rotation: 0, filter: '' })
);

// Function to spawn a new asteroid
function spawnAsteroid() {
  const size = Math.random() * 15 + 15; // Random size between 15 and 30
  const x = Math.random() * hydra.utility.getScreenSize().width;
  
  const asteroid = hydra.sprites.createNew(
    x,
    -50, // Start above the screen
    SimpleRenderers.circle(size, getRandomAsteroidColor())
  );
  
  // Add collision
  asteroid.collider = hydra.collision.makeSquareCollider(size * 1.8, size * 1.8);
  
  // Store velocity in props
  asteroid.props = {
    velocityY: gameState.asteroidSpeed * (0.8 + Math.random() * 0.5), // Random speed variation
    velocityX: (Math.random() - 0.5) * 2, // Small horizontal drift
    rotationSpeed: (Math.random() - 0.5) * 0.1 // Random rotation
  };
  
  return asteroid;
}

// Function to get random asteroid color
function getRandomAsteroidColor() {
  const colors = ['#7f8c8d', '#95a5a6', '#bdc3c7', '#a38c71', '#7d6b55'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Function to reset the game
function resetGame() {
  // Remove all asteroids
  hydra.sprites.sprites.forEach(sprite => {
    if (sprite !== playerShip && 
        sprite !== scoreDisplay && 
        sprite !== gameOverDisplay &&
        sprite !== highScoreDisplay) {
      hydra.sprites.remove(sprite);
    }
  });
  
  // Reset player position
  playerShip.x = hydra.utility.getScreenCenter().x;
  playerShip.y = hydra.utility.getScreenCenter().y + 150;
  
  // Reset game state
  gameState.score = 0;
  gameState.gameOver = false;
  gameState.asteroidSpeed = 3;
  gameState.asteroidSpawnRate = 1500;
  gameState.difficulty = 1;
}

// Main game loop ticker
const gameTickerId = hydra.listen.addTicker((deltaTime) => {
  if (gameState.gameOver) {
    // Check for restart click
    if (hydra.listen.isMouseDown()) {
      resetGame();
    }
    return;
  }
  
  // Handle player movement with keyboard
  const moveSpeed = 5;
  if (hydra.listen.isKey('ArrowLeft') || hydra.listen.isKey('a')) {
    hydra.sprites.moveBy(playerShip, -moveSpeed, 0);
  }
  if (hydra.listen.isKey('ArrowRight') || hydra.listen.isKey('d')) {
    hydra.sprites.moveBy(playerShip, moveSpeed, 0);
  }
  if (hydra.listen.isKey('ArrowUp') || hydra.listen.isKey('w')) {
    hydra.sprites.moveBy(playerShip, 0, -moveSpeed);
  }
  if (hydra.listen.isKey('ArrowDown') || hydra.listen.isKey('s')) {
    hydra.sprites.moveBy(playerShip, 0, moveSpeed);
  }
  
  // Keep player in bounds
  hydra.utility.keepSpriteInBounds(playerShip, 20);
  
  // Spawn asteroids based on time
  const currentTime = Date.now();
  if (currentTime - gameState.lastSpawnTime > gameState.asteroidSpawnRate / gameState.difficulty) {
    spawnAsteroid();
    gameState.lastSpawnTime = currentTime;
  }
  
  // Update all asteroids
  hydra.sprites.sprites.forEach(sprite => {
    // Skip non-asteroid sprites
    if (sprite === playerShip || 
        sprite === scoreDisplay || 
        sprite === gameOverDisplay ||
        sprite === highScoreDisplay) {
      return;
    }
    
    // Move asteroid
    if (sprite.props) {
      hydra.sprites.moveBy(sprite, sprite.props.velocityX, sprite.props.velocityY);
      
      // Apply rotation if we had that property
      if (sprite.props.rotationSpeed && sprite.renderer && sprite.renderer.renderParams) {
        if (!sprite.renderer.renderParams.offset) {
          sprite.renderer.renderParams.offset = { x: 0, y: 0, rotation: 0, filter: '' };
        }
        sprite.renderer.renderParams.offset.rotation += sprite.props.rotationSpeed;
      }
      
      // Remove if off-screen
      if (sprite.y > hydra.utility.getScreenSize().height + 50) {
        hydra.sprites.remove(sprite);
        
        // Increment score when successfully dodging an asteroid
        if (!gameState.gameOver) {
          gameState.score++;
          
          // Increase difficulty every 10 points
          if (gameState.score % 10 === 0) {
            gameState.difficulty += 0.2;
          }
        }
      }
      
      // Check collision with player - with null checking
      if (!gameState.gameOver && sprite.collider && playerShip.collider && hydra.collision.checkCollision(sprite, playerShip)) {
        gameOver();
      }
    }
  });
});

// Function to handle game over
function gameOver() {
  gameState.gameOver = true;
  
  // Update high score if needed
  const currentHighScore = scoreStorage.get('highScore') || 0;
  if (gameState.score > currentHighScore) {
    scoreStorage.set('highScore', gameState.score);
    scoreStorage.saveData();
  }
  
  // Position game over text
  gameOverDisplay.x = hydra.utility.getScreenCenter().x;
  gameOverDisplay.y = hydra.utility.getScreenCenter().y;
}

// Start the game loop
hydra.loop(60);

// Add some stars to the background
for (let i = 0; i < 50; i++) {
  const size = Math.random() * 2 + 1;
  const brightness = Math.floor(Math.random() * 55) + 200;
  const color = `rgb(${brightness}, ${brightness}, ${brightness})`;
  
  const star = hydra.sprites.createNew(
    Math.random() * hydra.utility.getScreenSize().width,
    Math.random() * hydra.utility.getScreenSize().height,
    SimpleRenderers.circle(size, color)
  );
  
  // Make stars twinkle slightly
  star.props = {
    originalSize: size,
    twinkleSpeed: Math.random() * 0.05 + 0.01,
    twinkleOffset: Math.random() * Math.PI * 2,
  };
  
  // Add twinkle animation ticker
  hydra.listen.addTicker((deltaTime) => {
    const timeVal = Date.now() * star.props.twinkleSpeed + star.props.twinkleOffset;
    const sizeFactor = 0.7 + 0.3 * Math.sin(timeVal);
    
    // Update the renderer to change size
    star.renderer = SimpleRenderers.circle(star.props.originalSize * sizeFactor, color);
  });
}