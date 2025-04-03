// create library
const lib = new HydraCanvasLib('game');

// Create world tileset of tiles
const tileset = lib.tileset.createTileset(
    'examples/assets/kenney-pixel-plat-industry.png',
    18,
    18
);
// Create character tileset of tiles
const tilesetChars = lib.tileset.createTileset(
    'examples/assets/kenney-pixel-plat-characters.png',
    24,
    24
);

// Define tile locations for easy use
const pieces = {
    single: [0,0],
    left: [1,0],
    middle: [2,0],
    right: [3,0],
    left_no_bottom: [1,1],
    middle_no_bottom: [2,1],
    right_no_bottom: [3,1],
    dirt_left: [1,2],
    dirt_none: [2,2],
    dirt_right: [3,2],
    dirt_left_bottom: [1,3],
    dirt_bottom: [2,3],
    dirt_right_bottom: [3,3]
}

// Use a TileMap to render a grid of tiles
const tilemap = lib.tileset.createTilemap(tileset, [
    [null],
    [null],
    [null],
    [null],
    [null],
    [null],
    [null],
    [null],
    [null],
    [null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, pieces.left, pieces.middle, pieces.right, null, null, null, null, null, null, null, null, null, pieces.single, null, pieces.single, null, pieces.single],
    [pieces.left_no_bottom, pieces.middle_no_bottom, pieces.right_no_bottom, null, null, null, null, null, null, null, null, null, pieces.left_no_bottom, pieces.right_no_bottom],
    [pieces.dirt_left, pieces.dirt_none, pieces.dirt_right, null, null, null, null, null, null, pieces.single, null, null, pieces.dirt_left_bottom, pieces.dirt_right_bottom],
    [pieces.dirt_left_bottom, pieces.dirt_bottom, pieces.dirt_right_bottom]
], 40);

// Create the world using the tilemap's renderer and collider
const sprite = lib.sprites.createNew(0, 0, tilemap.renderer);
sprite.collider = tilemap.collider;

// Create a player sprite using a single tile from the character tileset
const characterRenderer = tilesetChars.getTileRenderer(0, 0, 30, 30);
const player = lib.sprites.createNew(0, 0, characterRenderer);
player.collider = lib.collision.makeSquareCollider(30, 30);
player.props.velocity = { x: 0, y: 0 };

// Make grounded variable to prevent flicker
var grounded = false;

function gravity(deltaTime) {
    // Apply gravity first
    if (!grounded) {
        player.props.velocity.y += 0.015 * deltaTime;
    }

    // Then check for ground collision
    if (lib.collision.checkCollision(sprite, player)) {
        // Move player up until we're not colliding anymore
        while (lib.collision.checkCollision(sprite, player)) {
            player.y -= 1;
        }
        player.y += 1;
        if (player.props.velocity.y > 0) {
            grounded = true;
            player.props.velocity.y = 0;
        }
    } else {
        grounded = false;
    }
}

function jump() {
    if (grounded) {
        player.props.velocity.y = -8;
        grounded = false;
    }
}

function applyVelocity() {
    // Apply the velocity to the sprite
    player.x += player.props.velocity.x;
    player.y += player.props.velocity.y;
    
    if (player.y > lib.utility.getScreenSize().height + 100) {
        player.props.velocity.y = 0;
        player.x = 0;
        player.y = 0;
    }
}

// start render loop at 60fps
lib.loop(60);

// set background color to Terraria hallow biome
lib.world.setBackgroundImage("https://github.com/GavinGoGaming/cubingclub/blob/main/assets/hl_charging.png?raw=true");

lib.listen.addTicker((dT) => {
    // Uncomment to show Gizmos
    // lib.utility.drawColliderGizmos(sprite);
    // lib.utility.drawColliderGizmos(player);

    // Jumping & Gravity
    if(lib.listen.isKey('ArrowUp')) {
        jump();
    }
    gravity(dT);
    applyVelocity();

    // Check for left and right movement
    if(lib.listen.isKey('ArrowLeft')) {
        player.props.velocity.x = -2;
    } else if(lib.listen.isKey('ArrowRight')) {
        player.props.velocity.x = 2;
    } else {
        player.props.velocity.x = 0;
    }
});
