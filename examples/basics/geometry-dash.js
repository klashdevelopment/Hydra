const lib = new HydraCanvasLib('game', {canvasHeight: 400});

const gd = {
    player: {
        primary: '#00ff00',
        secondary: '#00c8ff'
    },
    physics: {
        gravity: 0.002,
        jumpForce: 0.7,
        groundY: 0
    },
    renderers: {
        cube: SimpleRenderers.combination(
            SimpleRenderers.rectangle(50,50,'white'),
            SimpleRenderers.rectangle(46,46,'black', {x:2,y:2}),
        )
    }
}

lib.world.setBackgroundImage("examples/assets/gd-red.png");

const cvscreen = lib.utility.getScreenSize();
gd.physics.groundY = cvscreen.height - 110; // Set ground Y position
const FLOOR_Y = cvscreen.height - 110; // Constant for the actual floor level

const player = lib.sprites.createNew(50, FLOOR_Y, SimpleRenderers.combination(
    SimpleRenderers.rectangle(50,50,'#0004',{x:-5,y:5,filter:'blur(4px)'}),
    SimpleRenderers.rectangle(50,50,'black'),
    SimpleRenderers.rectangle(44,44,gd.player.primary, {x:3,y:3}),
    SimpleRenderers.rectangle(10,10,'black', {x:10,y:13}),
    SimpleRenderers.rectangle(10,10,'black', {x:30,y:13}),
    SimpleRenderers.rectangle(6,6,gd.player.secondary, {x:12,y:15}),
    SimpleRenderers.rectangle(6,6,gd.player.secondary, {x:32,y:15}),
    SimpleRenderers.rectangle(30,10,'black', {x:10,y:26}),
    SimpleRenderers.rectangle(26,6,gd.player.secondary, {x:12,y:28})
));

// Player physics properties
player.velocity = 0;
player.isJumping = false;
player.rotation = 0;
player.rotationSpeed = 0.005;
player.size = 50; // Player size for collision detection
player.onPlatform = false; // Track if player is on a platform

var gradient = lib.utility.createLinearGradient(0,-15,0,30,[
    {offset:0,color:'#000000'},
    {offset:1,color:'#aa0000dd'}
]);

const ground = lib.sprites.createNew(0,cvscreen.height-60,SimpleRenderers.combination(
    SimpleRenderers.rectangle(800,60,gradient),
    SimpleRenderers.rectangle(800,2,'#ff808060')
));

const movingObjects = [];
const movingObjectsSpeed = 0.12;
let obstacleTimer = 0;
const obstacleSpawnRate = 1500; // Spawn a new obstacle every 1.5 seconds
let gameOver = false;

function block(x, y) {
    const obj = lib.sprites.createNew(cvscreen.width-(x*50), cvscreen.height-110-(y*50), gd.renderers.cube);
    obj.size = 50; // Size for collision detection
    obj.isOnGround = (y === 0); // Mark if this is a ground-level block
    movingObjects.push(obj);
    return obj;
}

// Initial block
block(1, 0);

// Game over text visibility flag
let gameOverTextVisible = false;

// Game over text with conditional rendering
const gameOverText = lib.sprites.createNew(
    cvscreen.width/2 - 100, 
    cvscreen.height/2 - 30, 
    SimpleRenderers.text("GAME OVER", "24px Arial", "white")
    .withShouldRender(() => gameOverTextVisible)
);

lib.listen.addTicker((delta) => {
    // Handle inputs
    if ((lib.listen.isKey(" ") || lib.listen.isMouseDown()) && !gameOver) {
        player.velocity = -gd.physics.jumpForce;
        player.isJumping = true;
        player.onPlatform = false;
        console.log("Jump triggered!");
    }
    
    // Handle restart
    if (gameOver && lib.listen.isMouseDown()) {
        player.y = FLOOR_Y;
        player.velocity = 0;
        player.isJumping = false;
        player.rotation = 0;
        player.onPlatform = false;
        player.props = player.props || {};
        player.props.rotation = 0;
        
        movingObjects.forEach(obj => {
            lib.sprites.remove(obj);
        });
        movingObjects.length = 0;
        
        block(1, 0);
        
        obstacleTimer = 0;
        gameOver = false;
        gameOverTextVisible = false;
    }
    
    if (gameOver) {
        gameOverTextVisible = true;
        return;
    }
    
    // Physics update for player
    if (player.isJumping) {
        player.velocity += gd.physics.gravity * delta;
        player.y += player.velocity * delta;
        
        // Rotate while jumping
        player.rotation += player.rotationSpeed * delta;
        player.props = player.props || {};
        player.props.rotation = player.rotation;
    }
    
    // Track if player is standing on any platform this frame
    let standingOnPlatform = false;
    let platformY = FLOOR_Y;
    
    // Update moving objects and check collisions
    for (let i = movingObjects.length - 1; i >= 0; i--) {
        const obj = movingObjects[i];
        const prevX = obj.x;
        obj.x -= movingObjectsSpeed * delta;
        
        // Check for collisions with the player
        const playerLeft = player.x;
        const playerRight = player.x + player.size;
        const playerTop = player.y;
        const playerBottom = player.y + player.size;
        
        const objLeft = obj.x;
        const objRight = obj.x + obj.size;
        const objTop = obj.y;
        const objBottom = obj.y + obj.size;
        
        // Check if player is above and falling onto this platform
        const fallingOntoBlock = player.velocity > 0 && 
                               playerBottom <= objTop + 5 && 
                               playerBottom + player.velocity * delta > objTop &&
                               playerRight > objLeft && 
                               playerLeft < objRight;
        
        // Check if player is standing on this block
        const standingOnBlock = !player.isJumping && 
                              Math.abs(playerBottom - objTop) < 5 &&
                              playerRight > objLeft && 
                              playerLeft < objRight;
        
        // Landing on a block from above
        if (fallingOntoBlock) {
            player.y = objTop - player.size;
            player.isJumping = false;
            player.velocity = 0;
            
            // Snap rotation
            player.rotation = Math.round(player.rotation / (Math.PI/2)) * (Math.PI/2);
            player.props.rotation = player.rotation;
            
            standingOnPlatform = true;
            platformY = objTop;
            player.onPlatform = true;
        }
        // Standing on a block
        else if (standingOnBlock) {
            standingOnPlatform = true;
            platformY = objTop;
            player.onPlatform = true;
        }
        // Side collision - game over
        else if (playerRight > objLeft && 
                 playerLeft < objRight && 
                 playerBottom > objTop &&
                 playerTop < objBottom) {
            // Don't count as collision if we're on top and there's just a slight overlap
            const onTop = Math.abs(playerBottom - objTop) < 10;
            if (!onTop) {
                gameOver = true;
            }
        }
        
        // Remove objects that have left the screen
        if (obj.x < -50) {
            lib.sprites.remove(obj);
            movingObjects.splice(i, 1);
        }
    }
    
    // If player was on a platform but isn't anymore, start falling
    if (player.onPlatform && !standingOnPlatform) {
        player.isJumping = true;
        player.velocity = 0.01; // Start with a small downward velocity
        player.onPlatform = false;
    }
    
    // Check for landing on the ground
    if (player.isJumping && player.y + player.size >= FLOOR_Y) {
        player.y = FLOOR_Y;
        player.isJumping = false;
        player.velocity = 0;
        
        // Snap rotation
        player.rotation = Math.round(player.rotation / (Math.PI/2)) * (Math.PI/2);
        player.props = player.props || {};
        player.props.rotation = player.rotation;
    }
    
    // Spawn new obstacles periodically
    obstacleTimer += delta;
    if (obstacleTimer >= obstacleSpawnRate) {
        obstacleTimer = 0;
        
        // Random obstacle pattern
        const pattern = Math.floor(Math.random() * 4);
        
        switch (pattern) {
            case 0:
                // Single block
                block(0, 0);
                break;
            case 1:
                // Double blocks side by side
                block(0, 0);
                block(1, 0);
                break;
            case 2:
                // Small step
                block(0, 0);
                block(1, 1);
                break;
            case 3:
                // Platform with gap
                block(0, 0);
                block(2, 0);
                break;
        }
    }
});
window.debugJump = function() {
    console.log("Is Jumping:", player.isJumping);
    console.log("Y Position:", player.y);
    console.log("Floor Y:", FLOOR_Y);
    console.log("On Platform:", player.onPlatform);
}
lib.loop(60);