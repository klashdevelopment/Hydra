// Initialize HydraCanvasLib
const game = new HydraCanvasLib('game', {
    canvasWidth: 800,
    canvasHeight: 600,
});

// Constants
const TILE_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const FPS = 10;

// Game State
let snake = [];
let direction = { x: 1, y: 0 }; // Starting direction: moving right
let food = null;
let gameOver = false;

// Utility Functions
function createApple() {
    // Create an apple sprite with a red circular body
    return SimpleRenderers.circle(TILE_SIZE / 2, 'red', { x: 0, y: 0 });
}

function spawnFood() {
    // Remove existing food if it exists
    if (food) {
        game.sprites.remove(food);
    }

    const screenSize = game.utility.getScreenSize();
    const foodX = Math.floor(Math.random() * (screenSize.width / TILE_SIZE)) * TILE_SIZE + TILE_SIZE / 2;
    const foodY = Math.floor(Math.random() * (screenSize.height / TILE_SIZE)) * TILE_SIZE + TILE_SIZE / 2;

    food = game.sprites.createNew(
        foodX,
        foodY,
        createApple()
    );

    // Add a square collider to the food
    food.collider = game.collision.makeSquareCollider(TILE_SIZE-10, TILE_SIZE-10, {x:-5, y:-5});
}

function resetGame() {
    snake.forEach(segment => game.sprites.remove(segment));
    snake = [];

    // Initialize the snake segments
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        const segment = game.sprites.createNew(
            TILE_SIZE * (INITIAL_SNAKE_LENGTH - i - 1),
            TILE_SIZE * 5,
            SimpleRenderers.rectangle(TILE_SIZE, TILE_SIZE, 'green')
        );

        // Add a square collider to each segment
        segment.collider = game.collision.makeSquareCollider(TILE_SIZE, TILE_SIZE);
        snake.push(segment);
    }

    direction = { x: 1, y: 0 }; // Reset direction
    spawnFood();
    gameOver = false;
}

// Game Over Handler
function handleGameOver() {
    gameOver = true;
    alert('Game Over! Press OK to restart.');
    resetGame();
}

// Game Loop
function gameLoop() {
    if (gameOver) return;

    // Move Snake
    const head = snake[0];
    const newHeadX = head.x + direction.x * TILE_SIZE;
    const newHeadY = head.y + direction.y * TILE_SIZE;

    // Check for collisions with walls
    const screenSize = game.utility.getScreenSize();
    if (
        newHeadX < -20 ||
        newHeadY < -20 ||
        newHeadX >= screenSize.width+20 ||
        newHeadY >= screenSize.height+20
    ) {
        handleGameOver();
        return;
    }

    // Check for collisions with itself
    for (let i = 1; i < snake.length; i++) {
        if (game.collision.checkCollision(snake[i], { x: newHeadX, y: newHeadY, collider: head.collider })) {
            handleGameOver();
            return;
        }
    }

    // Create new head
    const newHead = game.sprites.createNew(
        newHeadX,
        newHeadY,
        SimpleRenderers.rectangle(TILE_SIZE, TILE_SIZE, 'green')
    );

    // Add a collider to the new head
    newHead.collider = game.collision.makeSquareCollider(TILE_SIZE, TILE_SIZE);

    // Check for food collision
    if (food && game.collision.checkCollision(newHead, food)) {
        // Increase snake size
        game.sprites.remove(food);
        spawnFood();
    } else {
        // Remove tail
        const tail = snake.pop();
        if (tail) game.sprites.remove(tail);
    }

    // Add new head to snake
    snake.unshift(newHead);
}

// Input Handling
game.listen.addTicker(() => {
    if (game.listen.isKey('ArrowUp') && direction.y === 0) {
        direction = { x: 0, y: -1 };
    }
    if (game.listen.isKey('ArrowDown') && direction.y === 0) {
        direction = { x: 0, y: 1 };
    }
    if (game.listen.isKey('ArrowLeft') && direction.x === 0) {
        direction = { x: -1, y: 0 };
    }
    if (game.listen.isKey('ArrowRight') && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
});

// Add gameLoop to a ticker
game.listen.addTicker(() => {
    gameLoop();
});

// Set a solid background color
game.world.setBackgroundColor('lightgreen');

// Start Game
resetGame();
game.loop(FPS);