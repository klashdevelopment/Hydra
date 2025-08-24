const lib = new HydraCanvasLib('game');
const center = lib.utility.getScreenCenter();
const size = lib.utility.getScreenSize();

const volumeIcon = document.createElement('img');
volumeIcon.src = 'examples/assets/volume.svg';

const sounds = {
    'HD Song': 'song.webm',
    'UI SFX': 'sfx.mp3',
    'Coin SFX': 'coin.mp3',
    'Stop All': 'stop',
    'Dialogue': '../../portal/audio/animal_king.wav'
}

lib.world.setBackgroundColor('#aaa');

const start = `examples/assets/sounds/`;
const soundObjects = Object.keys(sounds).map((name) => {
    var soundURL = sounds[name].includes('.') ? `${start}${sounds[name]}` : `${start}sfx.mp3?stop`;
    return lib.sounds.createSFX(soundURL);
})

function createSoundSprite(x, soundObject, subtext = '') {
    var name = Object.keys(sounds).find(key => soundObject.src.endsWith(sounds[key]));
    var nameWidth = lib.utility.getStringWidth(name, 22, 'Inter');
    var subtextWidths = subtext.split('\n').map(line => lib.utility.getStringWidth(line, 14, 'Inter'));
    var s = lib.sprites.createNew(x, center.y-25, SimpleRenderers.combination(
        SimpleRenderers.circle(40, '#000', { x: 0, y: 0 }),
        SimpleRenderers.circle(38, '#eee', { x: 0, y: 0 }),
        SimpleRenderers.image(volumeIcon, 40, 40, { x: -20, y: -20 }),
        SimpleRenderers.text(name, 22, "Inter", '#000', { x: -(nameWidth/2), y: 65 }, 'bold'),
        ...(subtext ? subtext.split('\n').map((line, i) =>
            SimpleRenderers.text(line, 14, "Inter", '#000', { x: -(subtextWidths[i]/2), y: 85 + (i * 20) }, 'normal')
        ) : [])
    ));
    s.collider = lib.collision.makeCircleCollider(40, { x: 0, y: 0 });
    s.props.sound = soundObject;
    return s;
}

var sprites = [
    createSoundSprite(100, soundObjects[0], 'i\'d rather start a fire\nby again&again'),
    createSoundSprite(250, soundObjects[1]),
    createSoundSprite(center.x, soundObjects[4], 'Portal 2\nAnimal King'),
    createSoundSprite(size.width - 100, soundObjects[3]),
    createSoundSprite(size.width - 250, soundObjects[2])
]

lib.listen.addTicker(() => {
    sprites.forEach((s) => {
        if(lib.listen.isMouseDown() && lib.collision.isMouseTouching(s)) {
            console.log(`Clicked on sound: ${s.props.sound.src}`);
            if(s.props.sound.src === 'examples/assets/sounds/sfx.mp3?stop') {
                soundObjects.forEach((so) => so.stop());
            } else {
                s.props.sound.play().then(() => {
                    console.log(`${s.props.sound.src} finished playing`);
                })
            }
        }
    });

    sprites.forEach(s => lib.utility.drawColliderGizmos(s));
})

lib.loop(30);