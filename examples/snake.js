/*
 * Google Art Style Snake Game
 * Created: 2025-03-25 02:00:05
 * Author: Created for GavinGoGaming using Hydra.js
 */

// Initialize Hydra Canvas Library
const lib = new HydraCanvasLib('game', {
    canvasWidth: 800,
    canvasHeight: 600
});

// Game constants
const GRID_SIZE = 20;
const GAME_SPEED_INITIAL = 150; // ms between moves
const COLORS = {
    background: '#f8f9fa',
    gridLines: '#e8eaed',
    snake: {
        head: '#4285f4', // Google Blue
        body: [
            '#4285f4', // Google Blue
            '#34a853', // Google Green
            '#fbbc05', // Google Yellow
            '#ea4335'  // Google Red
        ]
    },
    food: '#34a853', // Google Green
    text: {
        score: '#5f6368',
        gameOver: '#ea4335',
        title: '#202124'
    }
};

// Game state
let snake = [];
let food = null;
let direction = 'right';
let nextDirection = 'right';
let gameOver = false;
let score = 0;
let gameSpeed = GAME_SPEED_INITIAL;
let lastMoveTime = 0;
let isPaused = false;
let isStarted = false;
let lastKeyPressTime = 0; // Custom variable for key press timing
const KEY_REPEAT_DELAY = 100; // Minimum delay between key presses

// UI elements
let scoreText = null;
let titleText = null;
let instructionsText = null;
let gameOverText = null;
let restartText = null;

// Initialize game
function initGame() {
    // Set background
    lib.world.setBackgroundColor(COLORS.background);
    
    // Enable bloom for light effects
    lib.world.effects.bloom.enabled = true;
    lib.world.effects.bloom.intensity = 0.3;
    lib.world.effects.bloom.threshold = 0.8;
    lib.world.effects.bloom.color = 'rgb(255, 255, 255)';
    lib.world.effects.bloom.radius = 5;
    
    // Create UI elements
    createUI();
    
    // Start the game loop
    lib.loop(60);
    
    // Set up game controls
    setupControls();
}

// Create UI elements
function createUI() {
    // Title
    titleText = lib.sprites.createNew(
        lib.utility.getScreenSize().width / 2 - 140, 
        40, 
        SimpleRenderers.text('Google Snake', 40, 'Arial', COLORS.text.title, {}, 'bold')
    );
    
    // Score
    scoreText = lib.sprites.createNew(
        20, 
        20, 
        SimpleRenderers.text(() => `Score: ${score}`, 24, 'Arial', COLORS.text.score)
    );
    
    // Instructions
    instructionsText = lib.sprites.createNew(
        lib.utility.getScreenSize().width / 2 - 150, 
        lib.utility.getScreenSize().height / 2, 
        SimpleRenderers.text('Press SPACE to start', 24, 'Arial', COLORS.text.score)
    );
    
    // Game Over (initially hidden)
    gameOverText = lib.sprites.createNew(
        lib.utility.getScreenSize().width / 2 - 100, 
        lib.utility.getScreenSize().height / 2 - 50, 
        SimpleRenderers.text('Game Over!', 40, 'Arial', COLORS.text.gameOver, {}, 'bold')
            .withShouldRender(() => gameOver)
    );
    
    // Restart instructions (initially hidden)
    restartText = lib.sprites.createNew(
        lib.utility.getScreenSize().width / 2 - 150, 
        lib.utility.getScreenSize().height / 2 + 10, 
        SimpleRenderers.text('Press SPACE to restart', 24, 'Arial', COLORS.text.score)
            .withShouldRender(() => gameOver)
    );
}

// Set up game controls
function setupControls() {
    lib.listen.addTicker((deltaTime) => {
        const currentTime = Date.now();
        
        // Space to start/restart game
        if (lib.listen.isKey(' ')) {
            // Use custom timing variable to prevent rapid toggling
            if (currentTime - lastKeyPressTime > KEY_REPEAT_DELAY) {
                lastKeyPressTime = currentTime;
                
                if (gameOver) {
                    resetGame();
                } else if (!isStarted) {
                    startGame();
                } else {
                    isPaused = !isPaused;
                }
            }
        }
        
        // Handle direction changes using isKey() instead of onKeyDown()
        // Use custom timing variable to prevent too rapid direction changes
        if (currentTime - lastKeyPressTime > KEY_REPEAT_DELAY) {
            let directionChanged = false;
            
            // Arrow keys
            if (lib.listen.isKey('ArrowUp') && direction !== 'down') {
                nextDirection = 'up';
                directionChanged = true;
            } else if (lib.listen.isKey('ArrowDown') && direction !== 'up') {
                nextDirection = 'down';
                directionChanged = true;
            } else if (lib.listen.isKey('ArrowLeft') && direction !== 'right') {
                nextDirection = 'left';
                directionChanged = true;
            } else if (lib.listen.isKey('ArrowRight') && direction !== 'left') {
                nextDirection = 'right';
                directionChanged = true;
            }
            
            // WASD keys
            else if (lib.listen.isKey('w') && direction !== 'down') {
                nextDirection = 'up';
                directionChanged = true;
            } else if (lib.listen.isKey('s') && direction !== 'up') {
                nextDirection = 'down';
                directionChanged = true;
            } else if (lib.listen.isKey('a') && direction !== 'right') {
                nextDirection = 'left';
                directionChanged = true;
            } else if (lib.listen.isKey('d') && direction !== 'left') {
                nextDirection = 'right';
                directionChanged = true;
            }
            
            if (directionChanged) {
                lastKeyPressTime = currentTime;
            }
        }
        
        // Move snake based on game speed timer
        if (isStarted && !gameOver && !isPaused && currentTime - lastMoveTime > gameSpeed) {
            moveSnake();
            checkCollisions();
            lastMoveTime = currentTime;
        }
    });
}

// Start the game
function startGame() {
    isStarted = true;
    createSnake();
    createFood();
    // Hide instructions
    instructionsText.renderer = SimpleRenderers.text('', 24, 'Arial', COLORS.text.score);
}

// Create initial snake
function createSnake() {
    // Start with 3 segments in the middle of the grid
    const startX = Math.floor(lib.utility.getScreenSize().width / (2 * GRID_SIZE)) * GRID_SIZE;
    const startY = Math.floor(lib.utility.getScreenSize().height / (2 * GRID_SIZE)) * GRID_SIZE;
    
    snake = [
        { x: startX, y: startY },
        { x: startX - GRID_SIZE, y: startY },
        { x: startX - (GRID_SIZE * 2), y: startY }
    ];
    
    // Create snake segments as a single sprite
    updateSnakeSprites();
}

// Create food at random position
function createFood() {
    // Remove previous food if exists
    if (food) {
        lib.sprites.remove(food);
    }
    
    let foodX, foodY;
    let isValidPosition;
    
    // Find position that doesn't overlap with snake
    do {
        foodX = Math.floor(Math.random() * (lib.utility.getScreenSize().width / GRID_SIZE)) * GRID_SIZE;
        foodY = Math.floor(Math.random() * (lib.utility.getScreenSize().height / GRID_SIZE)) * GRID_SIZE;
        
        isValidPosition = true;
        for (const segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                isValidPosition = false;
                break;
            }
        }
    } while (!isValidPosition);
    
    // Create food sprite with pulsing effect
    food = lib.sprites.createNew(
        foodX, 
        foodY, 
        SimpleRenderers.combination(
            SimpleRenderers.blurredCircle(GRID_SIZE / 2, COLORS.food, 5),
            SimpleRenderers.circle(GRID_SIZE / 2 - 2, COLORS.food)
        )
    );
}

// Update snake sprites - reuse sprites instead of creating new ones
function updateSnakeSprites() {
    // If snake sprites already exist, remove them
    if (snake.snakeSprites) {
        snake.snakeSprites.forEach(sprite => {
            if (sprite) lib.sprites.remove(sprite);
        });
    }
    
    // Create a new array for our sprites
    snake.snakeSprites = [];
    
    // Create sprites for each segment
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const color = isHead ? COLORS.snake.head : COLORS.snake.body[index % COLORS.snake.body.length];
        
        // Create segment sprite
        const segmentSprite = lib.sprites.createNew(
            segment.x, 
            segment.y, 
            SimpleRenderers.roundedRectangle(
                GRID_SIZE - 2, 
                GRID_SIZE - 2, 
                isHead ? GRID_SIZE / 2 : GRID_SIZE / 4, 
                color
            )
        );
        
        snake.snakeSprites.push(segmentSprite);
        
        // If it's the head, add eyes as part of the same renderer
        if (isHead) {
            // Add eyes directly to the head using a combination renderer
            const eyeRenderer = SimpleRenderers.combination(
                SimpleRenderers.roundedRectangle(GRID_SIZE - 2, GRID_SIZE - 2, GRID_SIZE / 2, color),
                SimpleRenderers.circle(2, '#ffffff', { x: 5, y: 5 }),
                SimpleRenderers.circle(2, '#ffffff', { x: 15, y: 5 })
            );
            
            segmentSprite.renderer = eyeRenderer;
        }
    });
}

// Move the snake
function moveSnake() {
    // Apply new direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y -= GRID_SIZE;
            break;
        case 'down':
            head.y += GRID_SIZE;
            break;
        case 'left':
            head.x -= GRID_SIZE;
            break;
        case 'right':
            head.x += GRID_SIZE;
            break;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    let foodEaten = false;
    if (food && Math.abs(head.x - food.x) < GRID_SIZE && Math.abs(head.y - food.y) < GRID_SIZE) {
        foodEaten = true;
        score += 10;
        // Increase speed slightly with each food eaten
        gameSpeed = Math.max(50, GAME_SPEED_INITIAL - (score * 0.5));
        createFood();
    }
    
    // Remove tail if no food was eaten
    if (!foodEaten) {
        snake.pop();
    }
    
    // Update the snake's visual representation
    updateSnakeSprites();
}

// Check for collisions
function checkCollisions() {
    const head = snake[0];
    
    // Check for collision with walls
    if (
        head.x < 0 || 
        head.x >= lib.utility.getScreenSize().width || 
        head.y < 0 || 
        head.y >= lib.utility.getScreenSize().height
    ) {
        endGame();
        return;
    }
    
    // Check for collision with self (skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
}

// End the game
function endGame() {
    gameOver = true;
    createExplosionEffect(snake[0].x, snake[0].y);
}

// Create explosion effect when game ends - limited to fewer particles
function createExplosionEffect(x, y) {
    const particleCount = 10; // Reduced from 20
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const speed = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 5;
        const colorIndex = i % COLORS.snake.body.length;
        
        const particle = lib.sprites.createNew(
            x + GRID_SIZE / 2, 
            y + GRID_SIZE / 2, 
            SimpleRenderers.circle(size, COLORS.snake.body[colorIndex])
        );
        
        particle.props.vx = Math.cos(angle) * speed;
        particle.props.vy = Math.sin(angle) * speed;
        particle.props.life = 30; // Reduced from 60
        
        particles.push(particle);
    }
    
    // Animate particles
    const tickerId = lib.listen.addTicker((deltaTime) => {
        let allDead = true;
        
        for (const particle of particles) {
            if (particle.props.life > 0) {
                allDead = false;
                lib.sprites.moveBy(particle, particle.props.vx, particle.props.vy);
                particle.props.life--;
                
                // Fade out
                const alpha = particle.props.life / 30;
                particle.renderer = SimpleRenderers.circle(
                    particle.renderer.renderParams.radius * alpha, 
                    particle.renderer.renderParams.color
                );
            } else {
                lib.sprites.remove(particle);
            }
        }
        
        if (allDead) {
            lib.listen.removeTicker(tickerId);
        }
    });
}

// Reset the game
function resetGame() {
    // Remove all snake sprites
    if (snake.snakeSprites) {
        snake.snakeSprites.forEach(sprite => {
            if (sprite) lib.sprites.remove(sprite);
        });
    }
    
    // Remove food
    if (food) {
        lib.sprites.remove(food);
    }
    
    // Reset game state
    snake = [];
    snake.snakeSprites = [];
    direction = 'right';
    nextDirection = 'right';
    gameOver = false;
    score = 0;
    gameSpeed = GAME_SPEED_INITIAL;
    isPaused = false;
    
    // Start a new game
    startGame();
}

// Initialize the game
initGame();