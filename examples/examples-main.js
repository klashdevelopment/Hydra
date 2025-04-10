var _exm_lib = new HydraCanvasLib('game', {enableExperimentalDPR: false, canvasHeight: 600, canvasWidth: 800});
var games = ['coin-game', 'coins', 'dash', 'pixel-character', 'simple', 'shapes', 'space-dodge', 'space-invaders', 'tilemap', 'geometry-dash', 'brick-breaker', 'shooty-thingy', 'data']

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
            SimpleRenderers.text(`${game}.js`, 16, "Inter", "#000", {x: 4, y: 21}),
            SimpleRenderers.roundedRectangle(_exm_lib.utility.getScreenSize().width - 8, 30, 8, '#00000020')
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

_exm_lib.sprites.createNew(2, _exm_lib.utility.getScreenSize().height - 10, 
SimpleRenderers.combination(
    SimpleRenderers.text('example selector ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 16, "Inter", '#777', {x: 0, y: 0}, 'bold')
));

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
        }
    })
});


var urlGame = (new URLSearchParams(window.location.search)).get('game');
if(urlGame) {
    loadGame(urlGame);
}