const lib = new HydraCanvasLib('game');

// sprite: Add blue square sprite
const sprite = lib.sprites.createNew(50, 50, SimpleRenderers.roundedRectangle(50, 50, 5, '#3050ff'));

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
});