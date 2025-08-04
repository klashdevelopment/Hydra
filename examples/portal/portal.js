import * as ART from "./art.js";
// Simple portal game

const lib = new HydraCanvasLib('game', {
    enableExperimentalDPR: true,
    canvasWidth: 800,
    canvasHeight: 600,
});
const bounds = lib.utility.getScreenSize();
const center = lib.utility.getScreenCenter();
lib.world.setBackgroundColor('#a8b0b9');
lib.experiments.importCSS('https://legacy.klash.dev/legacy.css');

let keys = {
    jump: ['w', ' ', 'ArrowUp'],
    left: ['a', 'ArrowLeft'],
    right: ['d', 'ArrowRight'],
    down: ['s', 'ArrowDown']
}

var tick = 0;
var walkspeed = 4;
var gravityAmount = 0.2;
var friction = 0.5;
var airResistance = 0.2;

lib.loop(120);

var logo = lib.sprites.createNew(center.x + 50, center.y, ART.PORTAL_2D);
logo.zIndex = 1002;

await new Promise(resolve => {
    setTimeout(resolve, 2000);
});

lib.sprites.remove(logo);

await new Promise(resolve => {
    setTimeout(resolve, 500);
});

// Bendy from Portal 2
const player = lib.sprites.createNew(bounds.width / 2, bounds.height / 2, ART.BENDY(false, 0));
player.collider = lib.collision.makeSquareCollider(30, 80, { x: -15, y: -10 });
player.props.isPlayer = true;

var audios = {
    'danger_9': lib.sounds.createSFX('examples/portal/audio/test_danger_9.wav'),
    'danger_10': lib.sounds.createSFX('examples/portal/audio/test_danger_10.wav'),
    'animal_king': lib.sounds.createSFX('examples/portal/audio/animal_king.wav'),
}
Object.keys(audios).forEach(key => {
    audios[key].setVolume(0);
});

var collisions = [];
var pickups = [];
var physics = [{
    sprite: player,
    velocity: { x: 0, y: 0 },
    grounded: false
}];

var currentPickup = null;

var subtitles = null;
function subtitle(inText) {
    if (subtitles !== null && subtitles !== undefined) {
        lib.sprites.remove(subtitles);
        subtitles = null;
    }
    if (!inText) {
        lib.sprites.remove(subtitles);
        subtitles = null;
        return;
    };
    var text = [];
    var currentLine = '';
    inText.split(' ').forEach(word => {
        if (((currentLine + ' ' + word).length * 6.2) > 380) {
            text.push(currentLine);
            currentLine = word;
        } else {
            currentLine += (currentLine ? ' ' : '') + word;
        }
    });
    if (currentLine) text.push(currentLine);
    subtitles = lib.sprites.createNew(bounds.width / 2 - 200, 50, SimpleRenderers.combination(
        SimpleRenderers.roundedRectangle(400, 20 + (text.length * 8.5), 6, '#00000040', { x: 0, y: -25 }),
        ...text.map((line, i) => SimpleRenderers.text(line, 10, 'KlashLegacy', '#ffffff', { x: 4, y: -12 + (i * 10) }))
    ));
    subtitles.zIndex = 1000;
}
var phys = (spr, defaultVelocity = { x: 0, y: 0 }) => ({
    sprite: spr,
    velocity: defaultVelocity,
    grounded: false
})
function simpleCollison(x, y, width, height, color = 'black', offset = { x: 0, y: 0 }) {
    var s;
    if (typeof width === 'object') {
        s = lib.sprites.createNew(x, y, width);
    } else {
        s = lib.sprites.createNew(x, y, SimpleRenderers.rectangle(width, height, color, offset));
    }
    if (typeof height === 'object') {
        s.collider = height;
    } else {
        if (height !== undefined && width !== undefined) {
            s.collider = lib.collision.makeSquareCollider(width, height, offset);
        }
    }
    return s;
}
function box(x, y) {
    var s = lib.sprites.createNew(x, y, ART.CUBE);
    s.collider = lib.collision.makeSquareCollider(44, 44, { x: -2, y: -2 });
    return s;
}

function boxDispenser(x, y) {
    var amountOpen = 0;
    var s = lib.sprites.createNew(x, y, ART.DISPENSER(amountOpen));
    var ogCollider = lib.collision.makeSquareCollider(120, 20, { x: 0, y: 115 });
    s.collider = ogCollider;
    s.zIndex = 2;
    return {
        sprite: s,
        spawnBox: () => {
            var boxx = box(x + 40, y - 50);
            boxx.collider = lib.collision.makeSquareCollider(44, 44, { x: -2, y: -2 });
            physics.push(phys(boxx, { x: rnd(-2, 2), y: 0 }));
            pickups.push(boxx);
        },
        dispense: (cb) => {
            var ticker = lib.listen.addTicker(() => {
                s.renderer = ART.DISPENSER(amountOpen);
                amountOpen += 2;
                if (amountOpen == 18) {
                    s.collider = null;
                }
                if (amountOpen >= 30) {
                    s.renderer = ART.DISPENSER(amountOpen);
                    lib.listen.removeTicker(ticker);
                    // closing
                    setTimeout(() => {
                        ticker = lib.listen.addTicker(() => {
                            s.renderer = ART.DISPENSER(amountOpen);
                            amountOpen -= 2;
                            if (amountOpen <= 0) {
                                amountOpen = 0;
                                s.renderer = ART.DISPENSER(amountOpen);
                                s.collider = ogCollider;
                                lib.listen.removeTicker(ticker);

                                cb && cb();
                            }
                        });
                    }, 500);
                }
            });
        }
    }
}

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

collisions.push(simpleCollison(0, bounds.height - 20, bounds.width, 20, '#000'));

var disp = boxDispenser(100, 0);
collisions.push(disp.sprite);
disp.spawnBox();
setTimeout(() => {
    disp.dispense(disp.spawnBox);
}, 1000);

function jump() {
    if (physics[0].grounded && physics[0].velocity.y === 0) {
        physics[0].velocity.y = -5;
        physics[0].grounded = false;
    }
}
function applyYvelocity() {
    physics.forEach(obj => {
        if (!obj.grounded && obj.velocity.y < 14 && !(obj === currentPickup)) {
            obj.velocity.y += gravityAmount;
        }
        let canMove = true;
        let extras = [];
        if (obj.sprite.props.isPlayer) {
            extras.push(...pickups);
        }
        [...collisions, ...extras].forEach(c => {
            if (c === obj.sprite) return;
            let preYvel = obj.velocity.y;
            obj.sprite.collider.height += preYvel;
            if (lib.collision.checkCollision(obj.sprite, c)) {
                obj.grounded = true;
                canMove = false;
                obj.velocity.y = 0;

                var o = physics.find(o => o.sprite === c);
                if (o && o.velocity.y > 0 && obj.sprite.props.isPlayer) {
                    o.velocity.y = -2;
                    o.grounded = true;
                }
            }
            obj.sprite.collider.height -= preYvel;
        });

        if (obj.grounded) {
            obj.sprite.collider.height += 2;
            let stillGroundedObjects = [...collisions, ...extras];
            if(obj.sprite.props.isPlayer) {
                stillGroundedObjects = stillGroundedObjects.filter(z => z!==currentPickup);
            }
            let stillGrounded = stillGroundedObjects.some(c => lib.collision.checkCollision(obj.sprite, c));
            obj.sprite.collider.height -= 2;
            if (!stillGrounded) {
                obj.grounded = false;
            }
        }

        if (canMove) {
            lib.sprites.moveBy(obj.sprite, 0, obj.velocity.y);
        }
    });
}

function applyXvelocity() {
    physics.forEach(obj => {
        let canMove = true;
        let extras = [];
        if (obj.sprite.props.isPlayer) {
            extras.push(...pickups);
        }
        [...collisions, ...extras].forEach(c => {
            var preXvel = obj.velocity.x;
            obj.sprite.collider.offset.x += preXvel;
            if (lib.collision.checkCollision(obj.sprite, c)) {
                canMove = false;
                obj.velocity.x = -1;
            }
            obj.sprite.collider.offset.x -= preXvel;
        });

        if (canMove) {
            lib.sprites.moveBy(obj.sprite, obj.velocity.x, 0);
        }

        if (obj.grounded) {
            if (Math.abs(obj.velocity.x) < friction) {
                obj.velocity.x = 0;
            } else {
                obj.velocity.x -= Math.sign(obj.velocity.x) * friction;
            }
        } else {
            if (Math.abs(obj.velocity.x) < airResistance) {
                obj.velocity.x = 0;
            } else {
                obj.velocity.x -= Math.sign(obj.velocity.x) * airResistance;
            }
        }
    });
}
function areKeys(keys) {
    return keys.some(key => lib.listen.isKey(key));
}

function checkAndRenderPickups() {
    if (onMouseDown === 1) {
        if (currentPickup) {
            physics.find(p => p.sprite.props.isCurrentPickup).velocity = { x: 0, y: 0 };
            currentPickup.props.isCurrentPickup = false;
            currentPickup = null;
        } else {
            pickups.forEach(p => {
                if (lib.collision.isMouseTouching(p)) {
                    if (currentPickup !== p) {
                        currentPickup = p;
                        p.props.isCurrentPickup = true;
                        physics.find(z => z.sprite.props.isCurrentPickup).velocity = { x: 0, y: 0 };
                    }
                }
            });
        }
    }

    if (currentPickup) {
        var mouse = lib.listen.mouseScreen();
        // Make sure the pickup stays within 80 pixels of the player.
        // teleport it to the mouse position, maxing out at 80 pixels away from the player.
        // however, make sure it doesnt collide with any walls or anything before teleporting.
        var dx = mouse.x - player.x-20;
        var dy = mouse.y - player.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 80) {
            var angle = Math.atan2(dy, dx);
            var newX = player.x-20 + Math.cos(angle) * 80;
            var newY = player.y + Math.sin(angle) * 80;

            currentPickup.x = newX;
            currentPickup.y = newY;

            let canMove = true;
            [...collisions, ...pickups, player].forEach(c => {
                if (c === currentPickup) return;
                if (lib.collision.checkCollision(currentPickup, c)) {
                    canMove = false;
                }
            });

            if (canMove) {
                currentPickup.x = newX;
                currentPickup.y = newY;
            }
        }
    }
}

var onMouseDown = 0;

lib.listen.addTicker(() => {
    tick++;
    tick %= 360;

    if (lib.listen.isMouseDown()) {
        if (onMouseDown === 0) {
            onMouseDown = 1;
        }
        else {
            onMouseDown = 2;
        }
    } else {
        onMouseDown = 0;
    }


    var moving = false;
    if (areKeys(keys.jump)) {
        jump();
    }
    if (areKeys(keys.left)) {
        physics[0].velocity.x = -walkspeed;
        moving = -2;
    }
    if (areKeys(keys.right)) {
        physics[0].velocity.x = walkspeed;
        moving = 2;
    }
    applyYvelocity();
    applyXvelocity();
    player.renderer = ART.BENDY(moving, tick);

    checkAndRenderPickups();

    // lib.sprites.sprites.forEach(s => {
    //     if (!s.collider) return;
    //     lib.utility.drawColliderGizmos(s, '#ff5050', 1);
    // });
});

setTimeout(() => {
    subtitle("At the time of this recording, Federal disclosure policies require us to inform you that this next test is probably lethal and to redirect you to a safer test environment.")
    audios['danger_9'].play().then(() => {
        subtitle("We will attempt to comply with these now non-existent agencies by playing some more smooth jazz.");
        audios['danger_10'].play().then(() => {
            subtitle();
        });
    })
}, 100);