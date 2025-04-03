const lib = new HydraCanvasLib('game');

// create a data storage object with a default value of 0 for the key 'demo'
const storage = lib.data.createStorage('data-example', {
    'demo': 20
});

// Create display
const text = lib.sprites.createNew(10, 20, SimpleRenderers.text(()=>{
    return `Demo: ${storage.get('demo')}`;
}, 20, 'Arial', '#000'));

// make buttons and colliders
const buttonAdd = lib.sprites.createNew(20, 50, SimpleRenderers.combination(
    SimpleRenderers.circle(12, '#0f0', {x: 6, y: -6}),
    SimpleRenderers.text('+', 20, 'Arial', '#000')
));
buttonAdd.collider = lib.collision.makeSquareCollider(17, 17, {x: -2, y: -14});

const buttonRem = lib.sprites.createNew(50, 50, SimpleRenderers.combination(
    SimpleRenderers.circle(12, '#f00', {x: 6, y: -6}),
    SimpleRenderers.text('-', 20, 'Arial', '#000', {x: 3, y: -1})
));
buttonRem.collider = lib.collision.makeSquareCollider(17, 17, {x: -2, y: -14});

// get screen center
const center = lib.utility.getScreenCenter();
const helloWorld = `Change the value 👀`;
let helloWorldSize = lib.utility.getStringWidth(helloWorld, storage.get('demo'), 'Arial');

// display example
const renderer = SimpleRenderers.text(helloWorld, storage.get('demo'), 'Arial', '#000');
const text2 = lib.sprites.createNew(center.x - helloWorldSize/2, center.y, renderer);

// start render loop at 60fps
lib.loop(60);

// set background color to white
lib.world.setBackgroundColor('#fff');

// Cooldown between clicks
let cooldown = 0;

// check for mouse click
lib.listen.addTicker((dT)=>{
    if(cooldown > 0) {
        cooldown--;
    }

    if(lib.listen.isMouseDown() && cooldown == 0) {
        if(lib.collision.isMouseTouching(buttonAdd)){
            storage.set('demo', storage.get('demo')+1);
        }
        if(lib.collision.isMouseTouching(buttonRem)){
            storage.set('demo', storage.get('demo')-1);
        }
        renderer.renderParams.fontSize = storage.get('demo');
        helloWorldSize = lib.utility.getStringWidth(helloWorld, storage.get('demo'), 'Arial');
        text2.x = center.x - helloWorldSize/2;
        cooldown = 5;
    }
});