// Generated with ChatGPT after only being given 'examples/coins.js' to train.
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
        SimpleRenderers.circle(25, '#f1c40f'),
        SimpleRenderers.text('C', 40, 'Inter', 'black', { x: -14, y: 14 })
    ));
    coin.collider = lib.collision.makeSquareCollider(50, 50);
    coin.props.isCoin = true;
    return coin;
}

// create a coin
var coin = createCoin();

// create a button (small red circle)
const button = lib.sprites.createNew(getRandomX(), getRandomY(), SimpleRenderers.circle(20, 'red'));
button.collider = lib.collision.makeSquareCollider(30, 30, {x: -15, y: -15});  // Set collider size for the button

// function to check if player is near the button
function isPlayerNearButton() {
    return lib.collision.checkSquareCollision(player, button);
}

// start render loop at 60fps
lib.loop(60);

// set background color to a dark grey
lib.world.setBackgroundColor('#111');

const sound = lib.sounds.createSFX('examples/sfx/coin.mp3');

// advanced player movement using deltaTime to ensure consistent speed across different framerates
lib.listen.addTicker((deltaTime) => {
    if (lib.listen.isKey('w')) lib.sprites.moveBy(player, 0, -1 * deltaTime);
    if (lib.listen.isKey('a')) lib.sprites.moveBy(player, -1 * deltaTime, 0);
    if (lib.listen.isKey('s')) lib.sprites.moveBy(player, 0, 1 * deltaTime);
    if (lib.listen.isKey('d')) lib.sprites.moveBy(player, 1 * deltaTime, 0);

    // Check for proximity to the button and a mouse click
    if (isPlayerNearButton() && lib.listen.isMouseDown()) {
        sound.play();
        lib.sprites.remove(coin);  // remove current coin
        coin = createCoin();  // create a new coin
    }

    // Show collider gizmos for debugging
    lib.utility.drawColliderGizmos(button);

    // Keep player within screen bounds
    lib.utility.keepAllSpritesInBounds(25);
});
