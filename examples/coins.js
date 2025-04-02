const lib = new HydraCanvasLib('game');

// sprite: Add blue square sprite
const player = lib.sprites.createNew(50, 50, SimpleRenderers.combination(
    SimpleRenderers.rectangle(54, 54, '#ffad00'),
    SimpleRenderers.rectangle(50, 50, 'black', { x: 2, y: 2 }),
    SimpleRenderers.circle(20, 'white', { x: 27, y: 27 }),
    SimpleRenderers.circle(10, 'black', { x: 27, y: 27 })
));
player.collider = lib.collision.makeSquareCollider(34, 34, { x: 10, y: 10 });

function getRandomX() {
    return Math.floor(Math.random() * (lib.utility.getScreenSize().width - 50));
}
function getRandomY() {
    return Math.floor(Math.random() * (lib.utility.getScreenSize().height - 50));
}

function createCoin() {
    const coin = lib.sprites.createNew(getRandomX(), getRandomY(), SimpleRenderers.combination(
        SimpleRenderers.circle(25, '#000000', {x: -1, y: 1, filter: 'blur(5px)'}),
        SimpleRenderers.circle(25, '#f1c40f'),
        SimpleRenderers.text('C', 40, 'KlashLegacy', 'black', {x: -14, y: 14})
    ));
    coin.collider = lib.collision.makeSquareCollider(40, 40, {x: -20, y: -20});
    coin.props.isCoin = true;
    return coin;
}
// create a coin
var coin = createCoin();

// start render loop at 60fps
lib.loop(60);

// experimental, import inter font
var interImport = lib.experiments.importCSS("https://legacy.klash.dev/legacy.css");

// set background color to a dark grey
lib.world.setBackgroundColor('#9af');

const sound = lib.sounds.createSFX('examples/sfx/coin.mp3');

// advanced player movement using deltaTime to ensure consistent speed across different framerates
lib.listen.addTicker((deltaTime) => {
    if (lib.listen.isKey('w')) lib.sprites.moveBy(player, 0, -1 * deltaTime);
    if (lib.listen.isKey('a')) lib.sprites.moveBy(player, -1 * deltaTime, 0);
    if (lib.listen.isKey('s')) lib.sprites.moveBy(player, 0, 1 * deltaTime);
    if (lib.listen.isKey('d')) lib.sprites.moveBy(player, 1 * deltaTime, 0);

    if (lib.collision.checkSquareCollision(player, coin)) {
        sound.play();
        lib.sprites.remove(coin);
        coin = createCoin();
    }

    lib.utility.drawColliderGizmos(player, '#0044ff', 2);
    lib.utility.drawColliderGizmos(coin);

    lib.utility.keepAllSpritesInBounds(25);
});