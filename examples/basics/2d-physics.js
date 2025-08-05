const lib = new HydraCanvasLib('game');
const info = {
    size: lib.utility.getScreenSize(),
    center: lib.utility.getScreenCenter()
};

let physics = [];
let newPhysics = (sprite, collisions = [], extras) => ({
    sprite: sprite,
    velocity: { x: 0, y: 0 },
    grounded: false,
    friction: 0.85,
    airResistance: 0.98,
    gravity: 0.4,
    jumpPower: 12,
    moveSpeed: 0.8,
    maxSpeed: { x: 8, y: 15 },
    collisions: collisions || [],
    bounciness: 0.1,
    onCollidedWith: extras['onCollidedWith'] || ((collider, group, direction) => {})
});

let collisions = {
    walls: [],
    platforms: [],
    hazards: []
};

// All the stuff here is just for the example, you can ignore it
const GAME_CONFIG = {
    backgroundColor: '#edd',
    playerColor: '#2C3E50',
    wallColor: '#34495E',
    platformColor: '#E67E22',
    debugMode: true // draws collision gizmos
};
let latestCollision = null;
lib.world.setBackgroundColor(GAME_CONFIG.backgroundColor);
const playerSprite = lib.sprites.createNew(info.center.x, info.center.y - 100, SimpleRenderers.combination(
    SimpleRenderers.roundedRectangle(16, 16, 6, GAME_CONFIG.playerColor),
    SimpleRenderers.roundedRectangle(18, 30, 4, GAME_CONFIG.playerColor, { x: -1, y: 18 }),
    SimpleRenderers.roundedRectangle(6, 18, 3, GAME_CONFIG.playerColor, { x: 1, y: 45 }),
    SimpleRenderers.roundedRectangle(6, 18, 3, GAME_CONFIG.playerColor, { x: 9, y: 45 }),
    SimpleRenderers.roundedRectangle(8, 25, 3, GAME_CONFIG.playerColor, { x: -6, y: 20 }),
    SimpleRenderers.roundedRectangle(8, 25, 3, GAME_CONFIG.playerColor, { x: 16, y: 20 })
));
playerSprite.collider = lib.collision.makeSquareCollider(18, 60, { x: -1, y: 0 });
const player = newPhysics(playerSprite, ['walls', 'platforms'], {
    onCollidedWith: (collider, group, direction) => {
        latestCollision = `${direction.toUpperCase()} side of a ${collider.collider.type} collider in groups: ${group.join(', ')}`;
    }
});
physics.push(player);
lib.sprites.createNew(20, 40, SimpleRenderers.text(()=>(latestCollision || 'No collision'), 20, 'Arial', 'black'));
function createLevel() {
    const ground = lib.sprites.createNew(0, info.size.height - 15, 
        SimpleRenderers.roundedRectangle(info.size.width, 30, 8, GAME_CONFIG.wallColor));
    ground.collider = lib.collision.makeSquareCollider(info.size.width, 30, { x: 0, y: 0 });
    collisions.walls.push(ground);
    
    const leftWall = lib.sprites.createNew(-15, 0, 
        SimpleRenderers.roundedRectangle(30, info.size.height, 8, GAME_CONFIG.wallColor));
    leftWall.collider = lib.collision.makeSquareCollider(30, info.size.height, { x: 0, y: 0 });
    collisions.walls.push(leftWall);

    const rightWall = lib.sprites.createNew(info.size.width - 15, 0, 
        SimpleRenderers.roundedRectangle(30, info.size.height, 8, GAME_CONFIG.wallColor));
    rightWall.collider = lib.collision.makeSquareCollider(30, info.size.height, { x: 0, y: 0 });
    collisions.walls.push(rightWall);
    
    const roof = lib.sprites.createNew(0, -15, 
        SimpleRenderers.roundedRectangle(info.size.width, 30, 8, GAME_CONFIG.wallColor));
    roof.collider = lib.collision.makeSquareCollider(info.size.width, 30, { x: 0, y: 0 });
    collisions.walls.push(roof);
    
    const platforms = [
        { x: 200, y: info.size.height - 100, w: 120, h: 20 },
        { x: 400, y: info.size.height - 220, w: 100, h: 20 },
        { x: 600, y: info.size.height - 180, w: 80, h: 20 },
        { x: 100, y: info.size.height - 300, w: 150, h: 20 },
        { x: 500, y: info.size.height - 60, w: 100, h: 20, color: 'red', group: 'hazards' } // Example hazard
    ];
    
    platforms.forEach(p => {
        const platform = lib.sprites.createNew(p.x, p.y, 
            SimpleRenderers.roundedRectangle(p.w, p.h, 6, p.color || GAME_CONFIG.platformColor));
        platform.collider = lib.collision.makeSquareCollider(p.w, p.h, { x: 0, y: 0 });
        collisions.platforms.push(platform);
        if(p.group) {
            collisions[p.group].push(platform);
        }
    });
}

// Now we start the physics engine

function checkCollisionDirection(object, collider) {
    const objBounds = {
        left: object.x + object.collider.offset.x,
        right: object.x + object.collider.offset.x + object.collider.width,
        top: object.y + object.collider.offset.y,
        bottom: object.y + object.collider.offset.y + object.collider.height
    };
    
    const colBounds = {
        left: collider.x + collider.collider.offset.x,
        right: collider.x + collider.collider.offset.x + collider.collider.width,
        top: collider.y + collider.collider.offset.y,
        bottom: collider.y + collider.collider.offset.y + collider.collider.height
    };
    
    const overlapX = Math.min(objBounds.right, colBounds.right) - Math.max(objBounds.left, colBounds.left);
    const overlapY = Math.min(objBounds.bottom, colBounds.bottom) - Math.max(objBounds.top, colBounds.top);
    
    return { overlapX, overlapY };
}

function getAllGroups(sprite) {
    return Object.keys(collisions).filter(group => collisions[group].includes(sprite));
}

function applyPhysics(object) {
    if (!object.sprite.collider) return;
    
    object.velocity.y += object.gravity;
    object.velocity.x *= object.grounded ? object.friction : object.airResistance;
    object.velocity.y *= object.airResistance;
    object.velocity.x = Math.max(-object.maxSpeed.x, Math.min(object.maxSpeed.x, object.velocity.x));
    object.velocity.y = Math.max(-object.maxSpeed.y, Math.min(object.maxSpeed.y, object.velocity.y));
    const originalPos = { x: object.sprite.x, y: object.sprite.y };
    
    // horiz. movement
    object.sprite.x += object.velocity.x;
    let horizontalCollision = false;
    
    object.collisions.forEach((group) => {
        collisions[group].forEach((collider) => {
            if (lib.collision.checkCollision(object.sprite, collider)) {
                horizontalCollision = { group: getAllGroups(collider), collider };
                object.sprite.x = originalPos.x;
                object.velocity.x *= -object.bounciness;
            }
        });
    });
    
    // vert. movement
    object.sprite.y += object.velocity.y;
    let verticalCollision = false;
    object.grounded = false;
    
    object.collisions.forEach((group) => {
        collisions[group].forEach((collider) => {
            if (lib.collision.checkCollision(object.sprite, collider)) {
                verticalCollision = {group: getAllGroups(collider), collider};
                
                if (object.velocity.y > 0 && originalPos.y < collider.y) {
                    object.grounded = true;
                    object.sprite.y = collider.y + collider.collider.offset.y - object.sprite.collider.height - object.sprite.collider.offset.y;
                } else {
                    object.sprite.y = originalPos.y;
                }
                
                object.velocity.y *= -object.bounciness;
            }
        });
    });

    // onCollidedWith callback
    var directionToReadable = (dir) => `${dir.overlapX > dir.overlapY ? (dir.overlapX < 0 ? 'left' : 'right') : (dir.overlapY < 0 ? 'up' : 'down')}`;
    if (horizontalCollision) {
        const { group, collider } = horizontalCollision;
        const direction = checkCollisionDirection(object.sprite, collider);
        object.onCollidedWith(collider, group, directionToReadable(direction));
    }
    if (verticalCollision) {
        const { group, collider } = verticalCollision;
        const direction = checkCollisionDirection(object.sprite, collider);
        object.onCollidedWith(collider, group, directionToReadable(direction));
    }
}

// This is a simple input handler that uses the physics engine
function handleInput() {
    const inputForce = player.moveSpeed;
    
    if (lib.listen.isKey('d') || lib.listen.isKey('ArrowRight')) {
        player.velocity.x += inputForce;
    }
    if (lib.listen.isKey('a') || lib.listen.isKey('ArrowLeft')) {
        player.velocity.x -= inputForce;
    }
    // jump only when grounded
    if ((lib.listen.isKey('w') || lib.listen.isKey('ArrowUp') || lib.listen.isKey(' ')) && player.grounded) {
        player.velocity.y = -player.jumpPower;
        player.grounded = false;
    }
}
// Example level
createLevel();

lib.listen.addTicker(() => {
    handleInput();
    
    // draw collision gizmos for testing
    if (GAME_CONFIG.debugMode) {
        lib.sprites.sprites.forEach(sprite => {
            if (sprite.collider) {
                lib.utility.drawColliderGizmos(sprite);
            }
        });
    }
    
    // Stuff below is needed for physics
    physics.forEach((physicsObject) => {
        applyPhysics(physicsObject);
    });
});

// Set to 60 by default but 120 is smoother, and 30 is slower for older devices
lib.loop(120);