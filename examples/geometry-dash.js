const lib = new HydraCanvasLib('game', {canvasHeight: 400});

const gd = {
    player: {
        primary: '#00ff00',
        secondary: '#00c8ff'
    },
    renderers: {
        cube: SimpleRenderers.combination(
            SimpleRenderers.rectangle(50,50,'white'),
            SimpleRenderers.rectangle(46,46,'black', {x:2,y:2}),
        )
    }
}

lib.world.setBackgroundImage("examples/assets/gd-red.png");

const cvscreen = lib.utility.getScreenSize();
const player = lib.sprites.createNew(50,cvscreen.height-110,SimpleRenderers.combination(
    SimpleRenderers.rectangle(50,50,'black'),
    SimpleRenderers.rectangle(44,44,gd.player.primary, {x:3,y:3}),
    SimpleRenderers.rectangle(10,10,'black', {x:10,y:13}),
    SimpleRenderers.rectangle(10,10,'black', {x:30,y:13}),
    SimpleRenderers.rectangle(6,6,gd.player.secondary, {x:12,y:15}),
    SimpleRenderers.rectangle(6,6,gd.player.secondary, {x:32,y:15}),
    SimpleRenderers.rectangle(30,10,'black', {x:10,y:26}),
    SimpleRenderers.rectangle(26,6,gd.player.secondary, {x:12,y:28})
));

var gradient = lib.utility.createLinearGradient(0,-15,0,30,[
    {offset:0,color:'#000000'},
    {offset:1,color:'#aa0000dd'}
]);

const ground = lib.sprites.createNew(0,cvscreen.height-60,SimpleRenderers.combination(
    SimpleRenderers.rectangle(800,60,gradient),
    SimpleRenderers.rectangle(800,2,'#ff808060')
));

const movingObjects=[];
const movingObjectsSpeed = 0.1;

function block(x,y) {
    const obj = lib.sprites.createNew(cvscreen.width-(x*50),cvscreen.height-110-(y*50),gd.renderers.cube);
    movingObjects.push(obj);
}
block(1,0);

lib.listen.addTicker((delta) => {
    movingObjects.forEach(obj => {
        obj.x -= movingObjectsSpeed*delta;
        if(obj.x < -50) {
            lib.sprites.remove(obj);
            movingObjects.splice(movingObjects.indexOf(obj),1);
        }
    });
})

lib.loop(60);