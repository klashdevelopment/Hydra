var _exm_lib = new HydraCanvasLib('game');
var games = ['coin-game', 'coins', 'dash', 'pixel-character', 'simple', 'space-dodge']

var interImport = _exm_lib.experiments.importCSS("https://rsms.me/inter/inter.css");

var gamesHovering = {};
games.forEach(g => gamesHovering[g]=false);

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

var sprites = games.map((game, i) => {
    return {
        game,
        renderer: SimpleRenderers.combination(
            SimpleRenderers.roundedRectangle(_exm_lib.utility.getScreenSize().width - 8, 30, 8, '#00000020'),
            SimpleRenderers.text(`${game}.js`, 20, "Inter", "black", {x: 4, y: 21}, 'regular')
        ),
        x: 4,
        y: 34 * (i) + 4,
        collider: {width: _exm_lib.utility.getScreenSize().width-8, height: 30, ox: 0, oy: 0},
        click: ()=>{
            loadGame(game);
        }
    }
})

sprites.forEach(s => {
    s.rs = _exm_lib.sprites.createNew(s.x, s.y, s.renderer);
    s.rs.collider = _exm_lib.collision.makeSquareCollider(s.collider.width,s.collider.height,{x:s.collider.ox,y:s.collider.oy})
})

_exm_lib.sprites.createNew(2, _exm_lib.utility.getScreenSize().height - 10, SimpleRenderers.text('example selector ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 16, "Inter", '#777', {x: 0, y: 0}, 'bold'));

_exm_lib.world.setBackgroundColor('#ddd');
_exm_lib.loop(30);

_exm_lib.listen.addTicker((dT) => {
    sprites.forEach(s => {
        if(s.rs) {
            gamesHovering[s.game] = _exm_lib.collision.isMouseTouching(s.rs);
            if(_exm_lib.collision.isMouseTouching(s.rs)) {
                if(_exm_lib.listen.isMouseDown()) {
                    s.click();
                }
            }
            // _exm_lib.utility.drawColliderGizmos(s.rs, '#ff0000', 1);
        }
    })
});


var urlGame = (new URLSearchParams(window.location.search)).get('game');
if(urlGame) {
    loadGame(urlGame);
}