// Initialize the canvas library
const lib = new HydraCanvasLib('game');

// Create the player spaceship
const player = lib.sprites.createNew(50, 50, SimpleRenderers.combination(
    SimpleRenderers.rectangle(54, 54, '#00ffad'),
    SimpleRenderers.rectangle(50, 50, 'black', { x: 2, y: 2 }),
    SimpleRenderers.circle(20, 'white', { x: 27, y: 27 }),
    SimpleRenderers.circle(10, 'black', { x: 27, y: 27 })
));
player.collider = lib.collision.makeSquareCollider(34, 34, { x: 10, y: 10 });

// Function to get a random X position within screen bounds
function getRandomX() {
    return Math.floor(Math.random() * (lib.utility.getScreenSize().width - 50));
}

// Function to get a random Y position within screen bounds
function getRandomY() {
    return Math.floor(Math.random() * (lib.utility.getScreenSize().height - 50));
}

// Function to create an asteroid
function createAsteroid() {
    const asteroid = lib.sprites.createNew(getRandomX(), -50, SimpleRenderers.combination(
        SimpleRenderers.blurredCircle(50, '#555555', 10, {x: -1, y: 1}),
        SimpleRenderers.circle(50, '#888888')
    ));
    asteroid.collider = lib.collision.makeSquareCollider(40, 40, {x: -20, y: -20});
    asteroid.props.isAsteroid = true;
    return asteroid;
}

// Function to create a power-up
function createPowerUp() {
    const powerUp = lib.sprites.createNew(getRandomX(), -50, SimpleRenderers.combination(
        SimpleRenderers.circle(20, '#FFD700'),
        SimpleRenderers.text('P', 30, 'Arial', 'black', {x: -10, y: 10})
    ));
    powerUp.collider = lib.collision.makeSquareCollider(20, 20, {x: -10, y: -10});
    powerUp.props.isPowerUp = true;
    return powerUp;
}

// Initialize asteroids and power-ups
let asteroids = [createAsteroid()];
let powerUps = [createPowerUp()];

// Game loop function
lib.loop(60);

// Set the background color
lib.world.setBackgroundColor('#000');

// Create sound effect for power-up collection
const powerUpSound = lib.sounds.createSFX('examples/sfx/powerup.mp3');

// Add ticker for game logic
lib.listen.addTicker((deltaTime) => {
    // Move the player based on key inputs
    if (lib.listen.isKey('ArrowUp')) lib.sprites.moveBy(player, 0, -1 * deltaTime);
    if (lib.listen.isKey('ArrowLeft')) lib.sprites.moveBy(player, -1 * deltaTime, 0);
    if (lib.listen.isKey('ArrowDown')) lib.sprites.moveBy(player, 0, 1 * deltaTime);
    if (lib.listen.isKey('ArrowRight')) lib.sprites.moveBy(player, 1 * deltaTime, 0);

    // Move asteroids and check for collisions
    asteroids.forEach((asteroid, index) => {
        lib.sprites.moveBy(asteroid, 0, 2 * deltaTime);
        if (lib.collision.checkSquareCollision(player, asteroid)) {
            alert("Game Over!");
            location.reload();
        }
        // Remove asteroids that go off-screen and create new ones
        if (asteroid.y > lib.utility.getScreenSize().height) {
            lib.sprites.remove(asteroid);
            asteroids[index] = createAsteroid();
        }
    });

    // Move power-ups and check for collisions
    powerUps.forEach((powerUp, index) => {
        lib.sprites.moveBy(powerUp, 0, 1 * deltaTime);
        if (lib.collision.checkSquareCollision(player, powerUp)) {
            powerUpSound.play();
            lib.sprites.remove(powerUp);
            powerUps[index] = createPowerUp();
        }
        // Remove power-ups that go off-screen and create new ones
        if (powerUp.y > lib.utility.getScreenSize().height) {
            lib.sprites.remove(powerUp);
            powerUps[index] = createPowerUp();
        }
    });

    // Keep player and all sprites in bounds
    lib.utility.keepAllSpritesInBounds(25);
});