// unfinished gun demo :/


const lib = new HydraCanvasLib('game');

const circleSize = 50;

const size = lib.utility.getScreenSize();

const keys=[
    ['w', 0, -2],
    ['a', -2, 0, ()=>{
        gunOffset = ({x: 10, y: 0});
    }],
    ['s', 0, 2],
    ['d', 2, 0, ()=>{
        gunOffset = ({x: -10, y: 0});
    }]
];

const player = lib.sprites.createNew(size.width/2, size.height-circleSize-30, SimpleRenderers.combination(
    SimpleRenderers.circle(circleSize, '#3050ff'),
    SimpleRenderers.circle(circleSize - 15, '#00000030'),
    SimpleRenderers.rectangle(35, 10, 'white'),
    SimpleRenderers.rectangle(10, 20, 'white')
));

lib.loop(60);

lib.world.setBackgroundColor('#0a0a1a');

lib.listen.addTicker((deltaTime) => {
    keys.forEach(key => {
        if(lib.listen.isKey(key[0])) {
            lib.sprites.moveBy(player, key[1], key[2]);
            if(key[3]) key[3]();
        }
    })
});