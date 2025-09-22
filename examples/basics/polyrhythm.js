const rect = document.body.getBoundingClientRect();
const lib = new HydraCanvasLib('game', {
    canvasWidth: rect.width - 40,
    canvasHeight: rect.height - 40
});


function updateBackgroundImage() {
    background.renderer = SimpleRenderers.image(backgroundImage, lib.utility.getScreenSize().width, lib.utility.getScreenSize().height, { x: 0, y: 0, filter: 'blur(10px)' });
}
window.addEventListener('resize', () => {
    const rect = document.body.getBoundingClientRect();
    lib.resize(rect.width - 40, rect.height - 40);
    updateBackgroundImage();
});

if(!location.hostname.includes('githack')) {
    lib.world.effects.bloom.enabled = true;
    lib.world.effects.bloom.intensity = 0.5;
}

const backgroundImage = new Image();
backgroundImage.src = 'examples/assets/nature.jpg';
const background = lib.sprites.createNew(0, 0, SimpleRenderers.none());
backgroundImage.onload = updateBackgroundImage;

var dots = [400, 350, 300, 250, 200, 150, 100, 50];
var hits = Array(dots.length).fill(-Infinity);

var time = 0;

// instrument = '', 'vibraphone-', 'wave-'. note is an index from 0-21 max
function soundURL(instrument, note) {
    return `https://assets.codepen.io/1468070/${instrument}key-${note}.wav`;
}

const soundsLeft = dots.map((x, i) => {
    const instrument = ''; // can be changed in UI
    const note = i;
    const url = soundURL(instrument, note);
    const sound = new Audio(url);
    sound.volume = 0.1;
    sound.load();
    return sound;
});
const soundsRight = dots.map((x, i) => {
    const instrument = 'vibraphone-'; // can be changed in UI
    const note = i + 7;
    const url = soundURL(instrument, note);
    const sound = new Audio(url);
    sound.volume = 0.1;
    sound.load();
    return sound;
});

function playSound(i, leftOrRight) {
    const sounds = leftOrRight === 'left' ? soundsLeft : soundsRight;
    if (i < sounds.length) {
        const sound = sounds[i];
        sound.play();
    }
}

const triggered = Array(dots.length).fill(false);

const config = {
    fadeDuration: 500,
    colors: {
        default: '#ffffff',
        hit: '#A6C48A'
    }
}

function hexToArray(hex) {
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    if (hex[0] !== '#') hex = '#' + hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
function percentOnGradient(c1, c2, decimal) {
    const r = c1[0] + (c2[0] - c1[0]) * decimal;
    const g = c1[1] + (c2[1] - c1[1]) * decimal;
    const b = c1[2] + (c2[2] - c1[2]) * decimal;
    return `rgb(${r.toFixed(3)},${g.toFixed(3)},${b.toFixed(3)})`;
}

const btnInstrument = lib

// polyrhythm arcs and lines
const lines = lib.sprites.createNew(0, 0, SimpleRenderers.combination(
    SimpleRenderers.custom((ctx, sprite, params) => {
        ctx.strokeStyle = config.colors.default;
        ctx.fillStyle = config.colors.default;
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.moveTo(sprite.x - 410, sprite.y + 200);
        ctx.lineTo(sprite.x + 410, sprite.y + 200);
        ctx.stroke();

        // arcs
        dots.forEach((x, i) => {
            const elapsed = performance.now() - hits[i];
            const t = Math.min(1, elapsed / config.fadeDuration);
            const eased = 1 - Math.pow(t, 3);
            ctx.strokeStyle = percentOnGradient(
                hexToArray(config.colors.default),
                hexToArray(config.colors.hit),
                eased
            );
            ctx.beginPath();
            ctx.arc(sprite.x, sprite.y + 200, Math.abs(x), Math.PI, 2 * Math.PI);
            ctx.stroke();
        });

        // dots
        dots.forEach((x, i) => {
            const elapsed = performance.now() - hits[i];
            const t = Math.min(1, elapsed / config.fadeDuration);
            const eased = 1 - Math.pow(t, 3);
            ctx.fillStyle = percentOnGradient(
                hexToArray(config.colors.default),
                hexToArray(config.colors.hit),
                eased
            );
            ctx.beginPath();
            var speed = 0.5 + (i * 0.1);
            var cycle = (time * speed) % 2;
            var angle = cycle;
            if (angle > 1) angle = 2 - angle;
            if (cycle > 1) {
                if (!triggered[i]) {
                    playSound(i, 'right');
                    hits[i] = performance.now();
                    triggered[i] = true;
                }
            } else {
                if (triggered[i]) {
                    playSound(i, 'left');
                    hits[i] = performance.now();
                    triggered[i] = false;
                }
            }
            angle *= Math.PI;
            var arcRad = Math.abs(x);
            ctx.arc(sprite.x + (arcRad * Math.cos(angle)), sprite.y + 200 - (arcRad * Math.sin(angle)), 10, 0, 2 * Math.PI);
            ctx.fill();
        });
    })
));

lib.listen.addTicker((dT) => {
    lines.x = lib.props.canvasWidth / 4;
    lines.y = lib.props.canvasHeight / 4;

    time += 0.01;
    hits.forEach((x, i) => {
        if (x > 0)
            hits[i] = Math.max(0, x - (dT / 16) * 0.5);
    });
});

lib.loop(60);