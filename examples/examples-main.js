var _exm_lib = new HydraCanvasLib('game', { enableExperimentalDPR: false, canvasHeight: 600, canvasWidth: 800 });
var games = ['coin-game', 'coins', 'dash', 'pixel-character', 'simple', 'shapes', 'space-dodge', 'space-invaders', 'tilemap', 'geometry-dash', 'brick-breaker', 'shooty-thingy', 'data', 'asteroid-ai']

var interImport = _exm_lib.experiments.importCSS("https://rsms.me/inter/inter.css");

function loadGame(game) {
    //cleanup
    _exm_lib.shutoff = true;
    interImport.remove();
    document.querySelector('#example-script').remove();
    // load new game
    var scr = document.createElement('script');
    scr.src = `./examples/${game}.js`;
    document.body.appendChild(scr);
}

var totalY = 0;

function makeGameRenderer(game, hover) {
    return SimpleRenderers.combination(
        SimpleRenderers.text(`${game}.js`, 16, "Inter", "#000", { x: 4, y: 21 }, '600'),
        SimpleRenderers.roundedRectangle(_exm_lib.utility.getScreenSize().width - 8, 30, 6, hover)
    );
}

var sprites = games.map((game, i) => {
    return {
        game,
        renderer: makeGameRenderer(game, '#00000020'),
        x: 4,
        y: 34 * (i) + 4,
        collider: { width: _exm_lib.utility.getScreenSize().width - 8, height: 30, ox: 0, oy: 0 },
        click: () => {
            loadGame(game);
        }
    }
})

sprites.forEach(s => {
    s.rs = _exm_lib.sprites.createNew(s.x, s.y, s.renderer);
    s.rs.collider = _exm_lib.collision.makeSquareCollider(s.collider.width, s.collider.height, { x: s.collider.ox, y: s.collider.oy })
})

var indicator = _exm_lib.sprites.createNew(0, 0, SimpleRenderers.none());
indicator.collider = _exm_lib.collision.makeSquareCollider(
    _exm_lib.utility.getScreenSize().width, 34 * games.length + 4, { x: 0, y: 0 });

_exm_lib.sprites.createNew(2, _exm_lib.utility.getScreenSize().height - 10,
    SimpleRenderers.combination(
        SimpleRenderers.text(() => { return exst; }, 16, "Inter", '#777', { x: 0, y: 0 }, 'bold')
    ));

var exst = 'example selector ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

var arrows = _exm_lib.sprites.createNew(
    _exm_lib.utility.getScreenSize().width - 80, _exm_lib.utility.getScreenSize().height / 2 - 20,
    SimpleRenderers.roundedRectangle(50, 100, 6, '#00000080', { x: -5, y: -45 })
);
arrows.collider = _exm_lib.collision.makeSquareCollider(50, 100, { x: -5, y: -45 });

var arrowUp = _exm_lib.sprites.createNew(
    _exm_lib.utility.getScreenSize().width - 80, _exm_lib.utility.getScreenSize().height / 2 - 40,
    SimpleRenderers.text('▲', 40, "Inter", '#ccc', { x: 0, y: 15 }, 'bold')
);
arrowUp.collider = _exm_lib.collision.makeSquareCollider(50, 50, { x: -5, y: -25 });

var arrowDown = _exm_lib.sprites.createNew(
    _exm_lib.utility.getScreenSize().width - 80, _exm_lib.utility.getScreenSize().height / 2,
    SimpleRenderers.text('▼', 40, "Inter", '#ccc', { x: 0, y: 20 }, 'bold')
);
arrowDown.collider = _exm_lib.collision.makeSquareCollider(50, 50, { x: -5, y: -15 });

_exm_lib.world.setBackgroundColor('#ddd');
_exm_lib.loop(30);

function isPressed(s) {
    return _exm_lib.collision.isMouseTouching(s) && _exm_lib.listen.isMouseDown();
}

_exm_lib.listen.addTicker((dT) => {
    if (_exm_lib.listen.isKey('ArrowUp') || isPressed(arrowUp)) {
        totalY -= 34 / 2;
    } else if (_exm_lib.listen.isKey('ArrowDown') || isPressed(arrowDown)) {
        totalY += 34 / 2;
    }
    totalY = Math.max(0, Math.min(totalY, (34 * games.length - (_exm_lib.utility.getScreenSize().height - 40))));
    indicator.y = -totalY;

    sprites.forEach(s => {
        if (s.rs) {
            s.rs.y = s.y - totalY;
            if (!_exm_lib.collision.isMouseTouching(arrows)) {
                if (_exm_lib.collision.isMouseTouching(s.rs)) {
                    if (_exm_lib.listen.isMouseDown()) {
                        s.click();
                    }
                    s.renderer = makeGameRenderer(s.game, '#00000080');
                } else {
                    s.renderer = makeGameRenderer(s.game, '#00000020');
                }
            }
        }
    })
});


var urlGame = (new URLSearchParams(window.location.search)).get('game');
if (urlGame) {
    loadGame(urlGame);
}
