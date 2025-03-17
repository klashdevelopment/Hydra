const lib = new HydraCanvasLib('game');

// sprite: Add blue square sprite
const sprite = lib.sprites.createNew(50, 50, SimpleRenderers.pixelMap(130, 190, 13, 19, [
    // mario
    "tttttbbbbbttt",
    "ttttbrrrrrbtt",
    "ttbbrrwwwrbtt",
    "tbrrbbbbbbbbb",
    "blbbllblblbtt",
    "bldlllblblbbt",
    "tbddllllllllb",
    "tblllbbbllllb",
    "ttblllbbbbbbb",
    "tttbbbbbbbbtt",
    "ttbrrzrrrbttt",
    "tbrrrzrrrzbtt",
    "tbrrbyzzzyybt",
    "bwwrbyzzzyybt",
    "bwwwbzzzzzzbt",
    "bwwwbzzzzzzbt",
    "tbbbbbbbbbbtt",
    "ttbddddbdddbt",
    "ttbbbbbbbbbbt"
], {
    "t": "transparent",
    "b": "#000000",
    "r": "#ff0000",
    "w": "#ffffff",
    "y": "#ffff00",
    "l": "#deb887",
    "d": "#8b4513",
    "z": "#0000ff"
}));

sprite.collider = lib.collision.makeSquareCollider(70, 130, { x: 30, y: 30 });

// start render loop at 60fps
lib.loop(60);

// set background color to a dark grey
lib.world.setBackgroundColor('#111');

// advanced player movement using deltaTime to ensure consistent speed across different framerates
lib.listen.addTicker((deltaTime) => {
    if (lib.listen.isKey('w')) lib.sprites.moveBy(sprite, 0, -1 * deltaTime);
    if (lib.listen.isKey('a')) lib.sprites.moveBy(sprite, -1 * deltaTime, 0);
    if (lib.listen.isKey('s')) lib.sprites.moveBy(sprite, 0, 1 * deltaTime);
    if (lib.listen.isKey('d')) lib.sprites.moveBy(sprite, 1 * deltaTime, 0);

    lib.utility.drawColliderGizmos(sprite);
    lib.utility.keepAllSpritesInBounds(25);
});