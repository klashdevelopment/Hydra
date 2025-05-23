// REQUIRED - create hydra library
const lib = new HydraCanvasLib('game');

// SPRITES -  add "The Box" simple character sprite
const player = lib.sprites.createNew(50, 50, SimpleRenderers.combination(
    SimpleRenderers.rectangle(54, 54, '#ffad00'),
    SimpleRenderers.rectangle(50, 50, 'black', { x: 2, y: 2 }),
    SimpleRenderers.circle(20, 'white', { x: 27, y: 27 }),
    SimpleRenderers.circle(10, 'black', { x: 27, y: 27 })
));
player.collider = lib.collision.makeSquareCollider(34, 34, { x: 10, y: 10 });

// GAME - random coordinates
function getRandomX() {
    return Math.floor(Math.random() * (lib.utility.getScreenSize().width - 50));
}
function getRandomY() {
    return Math.floor(Math.random() * (lib.utility.getScreenSize().height - 50));
}

// GAME - func to create and setup a coin
function createCoin() {
    const coin = lib.sprites.createNew(getRandomX(), getRandomY(), SimpleRenderers.combination(
        SimpleRenderers.circle(25, '#000000', {x: -1, y: 1, filter: 'blur(5px)'}), // drop shadow
        SimpleRenderers.circle(25, '#f1c40f'),
        SimpleRenderers.text('C', 40, 'KlashLegacy', 'black', {x: -14, y: 14})
    ));
    coin.collider = lib.collision.makeSquareCollider(40, 40, {x: -20, y: -20});
    coin.props.isCoin = true;
    return coin;
}

// GAME - current coin varialbe
var coin;

// REQUIRED - start render loop at 120fps
lib.loop(60);

// UTILITY - import klash legacy font
var interImport = lib.experiments.importCSS("https://legacy.klash.dev/legacy.css");

// WORLD - set background color to a dark grey
lib.world.setBackgroundColor('#9af');

// WORLD - enable bloom effect
lib.world.effects.bloom.enabled = true;
lib.world.effects.bloom.threshold = 0.78;

// SOUNDS - create sound effect for later use
const sound = lib.sounds.createSFX('examples/sfx/coin.mp3');

// SPRITES - text sprite with function for live updatable text
var text = lib.sprites.createNew(20,30, SimpleRenderers.text(()=>{
    if(gameStarted) {
        if(gameFinished) {
            return "Finished! Total: " + coinCount + ' coins';
        } else {
            return timer + "s left | " + coinCount + ' coins';
        }
    } else {
        return "press SPACE to begin";
    }
}, 24, "KlashLegacy", 'black'));

// GAME - game variables
var gameStarted = false;
var gameFinished = false;
var timer = 0;
var coinCount = 0;

// GAME - function to wait 1s and loop again
function makeTimeout() {
    setTimeout(()=>{
        if(timer < 1) { // delete coin and finish game
            gameFinished = true;
            lib.sprites.remove(coin);
            coin = null;
        } else {
            timer--; // recreate timeout
            makeTimeout();
        }
    },1000);
}

// GAME - func to reset variables and begin
function startGame() {
    timer = 10;
    gameStarted = true;
    gameFinished = false;
    coinCount = 0;
    coin = createCoin();
    makeTimeout();
}

// EVENTS - add listener for each tick
lib.listen.addTicker((deltaTime) => {
    // EVENTS - WASD player movement
    if (lib.listen.isKey('w')) lib.sprites.moveBy(player, 0, -1 * deltaTime);
    if (lib.listen.isKey('a')) lib.sprites.moveBy(player, -1 * deltaTime, 0);
    if (lib.listen.isKey('s')) lib.sprites.moveBy(player, 0, 1 * deltaTime);
    if (lib.listen.isKey('d')) lib.sprites.moveBy(player, 1 * deltaTime, 0);

    // EVENTS - spacebar to start
    if(lib.listen.isKey(' ')) {
        if(!gameStarted || gameFinished)
            startGame();
    }

    // COLLISION - check coin collision
    if (coin && lib.collision.checkCollision(player, coin)) {
        sound.play();
        lib.sprites.remove(coin);
        if(gameStarted) coinCount++;
        coin = createCoin();
    }

    // UTILITY - make sure player and coins are in bounds
    lib.utility.keepAllSpritesInBounds(25);
});