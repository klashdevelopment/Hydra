const lib = new HydraCanvasLib('game');

// Player sprite: combination renderer with square eyes and rectangle mouth on a square
const player = lib.sprites.createNew(50, lib.canvas.height - 100, SimpleRenderers.combination(
    SimpleRenderers.rectangle(50, 50, '#00ffad'),
    SimpleRenderers.rectangle(10, 10, 'white', { x: 10, y: 10 }),
    SimpleRenderers.rectangle(10, 10, 'white', { x: 30, y: 10 }),
    SimpleRenderers.rectangle(30, 10, 'black', { x: 10, y: 30 })
));
player.collider = lib.collision.makeSquareCollider(50, 50);

// Function to create spikes with a realistic texture
function createSpike(x, y) {
    const spike = lib.sprites.createNew(x, y, SimpleRenderers.combination(
        SimpleRenderers.triangle(30, 30, '#654321', { x: 0, y: 0 }),
        SimpleRenderers.triangle(28, 28, '#ff0000', { x: 1, y: 1 }),
        SimpleRenderers.triangle(26, 26, '#ff6347', { x: 2, y: 2 })
    ));
    spike.collider = lib.collision.makeSquareCollider(30, 30);
    return spike;
}

// Function to create blocks with a realistic texture
function createBlock(x, y) {
    const block = lib.sprites.createNew(x, y, SimpleRenderers.combination(
        SimpleRenderers.rectangle(50, 50, '#8b4513'),
        SimpleRenderers.rectangle(48, 48, '#a0522d', { x: 1, y: 1 }),
        SimpleRenderers.rectangle(46, 46, '#cd853f', { x: 2, y: 2 })
    ));
    block.collider = lib.collision.makeSquareCollider(50, 50);
    return block;
}

// Generate obstacles
let obstacles = [];
for (let i = 0; i < 10; i++) {
    obstacles.push(createSpike(400 + i * 200, lib.canvas.height - 80));
    obstacles.push(createBlock(500 + i * 200, lib.canvas.height - 100));
}

// Background and floor
lib.world.setBackgroundColor('#87ceeb');
const floor = lib.sprites.createNew(0, lib.canvas.height - 50, SimpleRenderers.combination(
    SimpleRenderers.rectangle(lib.canvas.width, 50, '#654321'),
    SimpleRenderers.rectangle(lib.canvas.width, 48, '#8b4513', { x: 0, y: 1 })
));
floor.collider = lib.collision.makeSquareCollider(lib.canvas.width, 50);

// Player movement and gravity
let isJumping = false;
let velocityY = 0;
const gravity = 1.5;
const playerSpeed = 0.1;
const obstacleSpeed = -0.1;

lib.loop(60);

lib.listen.addTicker((deltaTime) => {
    // Apply gravity
    if (!isJumping) {
        velocityY += gravity;
    }

    // Move player
    lib.sprites.moveBy(player, 0, velocityY * deltaTime);

    // Check collision with floor
    if (lib.collision.checkSquareCollision(player, floor)) {
        player.y = lib.canvas.height - 100;
        velocityY = 0;
        isJumping = false;
    }

    // Move obstacles towards the player
    for (const obstacle of obstacles) {
        lib.sprites.moveBy(obstacle, obstacleSpeed * deltaTime, 0);

        // Check if obstacle is out of screen
        if (obstacle.x + obstacle.collider.width < 0) {
            obstacle.x = lib.canvas.width + 100; // Reset obstacle position to the right of the screen
        }

        // Check collision with obstacles
        if (lib.collision.checkSquareCollision(player, obstacle)) {
            alert('Game Over');
            location.reload();
        }
    }

    // Jumping
    if (lib.listen.onKeyDown(' ')) {
        if (!isJumping) {
            velocityY = -10;
            isJumping = true;
        }
    }
});