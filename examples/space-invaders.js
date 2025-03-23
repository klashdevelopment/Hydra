const canvasId = 'game';
const hydra = new HydraCanvasLib(canvasId);

const playerMap = [
    "01110",
    "11111",
    "11111"
];

const enemyMap = [
    "10101",
    "01110",
    "11111",
    "01110",
    "10101"
];

const bulletMap = [
    "1",
    "1",
    "1"
];

const colors = {
    "0": "transparent",
    "1": "white"
};

const player = hydra.sprites.createNew(400, 550, SimpleRenderers.pixelMap(50, 20, 5, 3, playerMap, colors));
player.collider = hydra.collision.makeSquareCollider(50, 20);

const bullets = [];
const enemies = [];
let canShoot = true;
let gameOver = false;

// Create enemies
for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 11; j++) {
        const enemy = hydra.sprites.createNew(50 + j * 60, 50 + i * 40, SimpleRenderers.pixelMap(40, 20, 5, 5, enemyMap, { "0": "transparent", "1": "red" }));
        enemy.collider = hydra.collision.makeSquareCollider(40, 20);
        enemies.push(enemy);
    }
}

// Player movement and shooting
hydra.listen.addTicker((deltaTime) => {
    if (hydra.listen.isKey('ArrowLeft') && player.x > 0) {
        hydra.sprites.moveBy(player, -5, 0);
    }
    if (hydra.listen.isKey('ArrowRight') && player.x < hydra.canvas.width - 50) {
        hydra.sprites.moveBy(player, 5, 0);
    }
    
    // Player shooting
    if (hydra.listen.isKey(' ') && canShoot) {
        const bullet = hydra.sprites.createNew(player.x + 22.5, player.y - 10, SimpleRenderers.pixelMap(5, 10, 1, 3, bulletMap, colors));
        bullet.collider = hydra.collision.makeSquareCollider(5, 10);
        bullets.push(bullet);
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, 500);  // Adjust the delay as needed
    }
});

// Bullet movement and collision detection
hydra.listen.addTicker((deltaTime) => {
    if (gameOver) return;
    
    for (const bullet of bullets) {
        hydra.sprites.moveBy(bullet, 0, -10);
        
        // Check for collisions with enemies
        for (const enemy of enemies) {
            if (hydra.collision.checkSquareCollision(bullet, enemy)) {
                hydra.sprites.remove(bullet);
                hydra.sprites.remove(enemy);
                bullets.splice(bullets.indexOf(bullet), 1);
                enemies.splice(enemies.indexOf(enemy), 1);
                break;
            }
        }
        
        // Remove off-screen bullets
        if (bullet.y < 0) {
            hydra.sprites.remove(bullet);
            bullets.splice(bullets.indexOf(bullet), 1);
        }
    }
});

// Enemy movement
let enemyDirection = 1;
hydra.listen.addTicker((deltaTime) => {
    if (gameOver) return;
    
    for (const enemy of enemies) {
        hydra.sprites.moveBy(enemy, enemyDirection * 2, 0);
    }
    
    // Change direction if an enemy hits the edge
    const leftMostEnemy = Math.min(...enemies.map(e => e.x));
    const rightMostEnemy = Math.max(...enemies.map(e => e.x));
    if (leftMostEnemy <= 0 || rightMostEnemy >= hydra.canvas.width - 40) {
        enemyDirection *= -1;
        for (const enemy of enemies) {
            hydra.sprites.moveBy(enemy, 0, 20);
            // Game over if enemies reach the bottom
            if (enemy.y + enemy.collider.height >= hydra.canvas.height) {
                gameOver = true;
                alert('Game Over!');
                break;
            }
        }
    }
});

// Game loop
hydra.loop();