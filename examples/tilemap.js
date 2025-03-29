// create library
const lib = new HydraCanvasLib('game');

const tileset = lib.tileset.createTileset(
    'examples/assets/kenney-pixel-plat-industry.png',
    16,
    16
)

// sprite: Add sprite from tilemap
const sprite = lib.sprites.createNew(50, 50, SimpleRenderers.combination(
    tileset.getTileRenderer(1,0,64,64),
    tileset.getTileRenderer(2,0,64,64,{x:65,y:0}),
    tileset.getTileRenderer(3,0,64,64,{x:130,y:0})
));

// start render loop at 60fps
lib.loop(60);

// set background color to a dark grey
lib.world.setBackgroundColor('#222');

// advanced player movement using deltaTime to ensure consistent speed across different framerates
lib.listen.addTicker((deltaTime) => {
    if (lib.listen.isKey('w')) lib.sprites.moveBy(sprite, 0, -1 * deltaTime);
    if (lib.listen.isKey('a')) lib.sprites.moveBy(sprite, -1 * deltaTime, 0);
    if (lib.listen.isKey('s')) lib.sprites.moveBy(sprite, 0, 1 * deltaTime);
    if (lib.listen.isKey('d')) lib.sprites.moveBy(sprite, 1 * deltaTime, 0);
});