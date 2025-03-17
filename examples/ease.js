const lib = new HydraCanvasLib('game');

var z = "g";

// sprite: Add blue square sprite
const sprite = lib.sprites.createNew(50, 50, SimpleRenderers.text(() => {
    return z;
}), 16, "Arial", "red");

// lib.utility.ease(10, 2, (v => {
//     z = "n: " + v;
// }))

// start render loop at 60fps
lib.loop(60);