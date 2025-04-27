var _exm_lib = new HydraCanvasLib('game', { enableExperimentalDPR: false, canvasHeight: 600, canvasWidth: 800 });
var _exm_games = ['coin-game', 'coins', 'dash', 'basic-3d', 'pixel-character', 'ultrawide', 'simple', 'snake', 'shapes', 'space-dodge', 'space-invaders', 'tilemap', 'geometry-dash', 'brick-breaker', 'shooty-thingy', 'data', 'asteroid-ai'];

var _exm_interImport = _exm_lib.experiments.importCSS("https://rsms.me/inter/inter.css");

function _exm_loadGame(_exm_game) {
    //cleanup
    _exm_lib.shutoff = true;
    _exm_interImport.remove();
    document.querySelector('#example-script').remove();
    // load new game
    var _exm_scr = document.createElement('script');
    _exm_scr.src = `./examples/${_exm_game}.js`;
    document.body.appendChild(_exm_scr);
}

var _exm_totalY = 0;

function _exm_makeGameRenderer(_exm_game, _exm_hover) {
    return SimpleRenderers.combination(
        SimpleRenderers.text(`${_exm_game}.js`, 16, "Inter", "#000", { x: 4, y: 21 }, '600'),
        SimpleRenderers.roundedRectangle(_exm_lib.utility.getScreenSize().width - 8, 30, 6, _exm_hover)
    );
}

var _exm_sprites = _exm_games.map((_exm_game, _exm_i) => {
    return {
        game: _exm_game,
        renderer: _exm_makeGameRenderer(_exm_game, '#00000020'),
        x: 4,
        y: 34 * (_exm_i) + 4,
        collider: { width: _exm_lib.utility.getScreenSize().width - 8, height: 30, ox: 0, oy: 0 },
        click: () => {
            _exm_loadGame(_exm_game);
        }
    }
})

_exm_sprites.forEach(_exm_s => {
    _exm_s.rs = _exm_lib.sprites.createNew(_exm_s.x, _exm_s.y, _exm_s.renderer);
    _exm_s.rs.collider = _exm_lib.collision.makeSquareCollider(_exm_s.collider.width, _exm_s.collider.height, { x: _exm_s.collider.ox, y: _exm_s.collider.oy })
})

var _exm_indicator = _exm_lib.sprites.createNew(0, 0, SimpleRenderers.none());
_exm_indicator.collider = _exm_lib.collision.makeSquareCollider(
    _exm_lib.utility.getScreenSize().width, 34 * _exm_games.length + 4, { x: 0, y: 0 });

_exm_lib.sprites.createNew(2, _exm_lib.utility.getScreenSize().height - 10,
    SimpleRenderers.combination(
        SimpleRenderers.text(() => { return _exm_exst; }, 16, "Inter", '#777', { x: 0, y: 0 }, 'bold')
    ));

var _exm_exst = 'example selector ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

var _exm_arrows = _exm_lib.sprites.createNew(
    _exm_lib.utility.getScreenSize().width - 80, _exm_lib.utility.getScreenSize().height / 2 - 20,
    SimpleRenderers.roundedRectangle(50, 100, 6, '#00000080', { x: -5, y: -45 })
);
_exm_arrows.collider = _exm_lib.collision.makeSquareCollider(50, 100, { x: -5, y: -45 });

var _exm_arrowUp = _exm_lib.sprites.createNew(
    _exm_lib.utility.getScreenSize().width - 80, _exm_lib.utility.getScreenSize().height / 2 - 40,
    SimpleRenderers.text('▲', 40, "Inter", '#ccc', { x: 0, y: 15 }, 'bold')
);
_exm_arrowUp.collider = _exm_lib.collision.makeSquareCollider(50, 50, { x: -5, y: -25 });

var _exm_arrowDown = _exm_lib.sprites.createNew(
    _exm_lib.utility.getScreenSize().width - 80, _exm_lib.utility.getScreenSize().height / 2,
    SimpleRenderers.text('▼', 40, "Inter", '#ccc', { x: 0, y: 20 }, 'bold')
);
_exm_arrowDown.collider = _exm_lib.collision.makeSquareCollider(50, 50, { x: -5, y: -15 });

_exm_lib.world.setBackgroundColor('#ddd');
_exm_lib.loop(30);

function _exm_isPressed(_exm_s) {
    return _exm_lib.collision.isMouseTouching(_exm_s) && _exm_lib.listen.isMouseDown();
}

_exm_lib.listen.addTicker((_exm_dT) => {
    if (_exm_lib.listen.isKey('ArrowUp') || _exm_isPressed(_exm_arrowUp)) {
        _exm_totalY -= 34 / 2;
    } else if (_exm_lib.listen.isKey('ArrowDown') || _exm_isPressed(_exm_arrowDown)) {
        _exm_totalY += 34 / 2;
    }
    _exm_totalY = Math.max(0, Math.min(_exm_totalY, (34 * _exm_games.length - (_exm_lib.utility.getScreenSize().height - 40))));
    _exm_indicator.y = -_exm_totalY;

    _exm_sprites.forEach(_exm_s => {
        if (_exm_s.rs) {
            _exm_s.rs.y = _exm_s.y - _exm_totalY;
            if (!_exm_lib.collision.isMouseTouching(_exm_arrows)) {
                if (_exm_lib.collision.isMouseTouching(_exm_s.rs)) {
                    if (_exm_lib.listen.isMouseDown()) {
                        _exm_s.click();
                    }
                    _exm_s.renderer = _exm_makeGameRenderer(_exm_s.game, '#00000080');
                } else {
                    _exm_s.renderer = _exm_makeGameRenderer(_exm_s.game, '#00000020');
                }
            }
        }
    })
});

var _exm_urlGame = (new URLSearchParams(window.location.search)).get('game');
if (_exm_urlGame) {
    _exm_loadGame(_exm_urlGame);
}
