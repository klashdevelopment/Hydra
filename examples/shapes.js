const lib = new HydraCanvasLib('game', {canvasWidth: 500, canvasHeight: 400});

// sprite: Add blue vertex (point)
const vertex = lib.sprites.createNew(50, 50, SimpleRenderers.vertex('blue', 5));

// sprite: Add red line
const line = lib.sprites.createNew(325, 140, SimpleRenderers.line(50, 100, 'red', 2));

// sprite: Add yellow star
const star = lib.sprites.createNew(400, 50, SimpleRenderers.star(5, 10, 20, 'yellow'));

// sprite: Add green polygon
const polygon = lib.sprites.createNew(200, 300, SimpleRenderers.polygon([
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 50 },
    { x: 0, y: 50 }
], 'green'));

// sprite: Add purple triangle
const triangle = lib.sprites.createNew(50, 200, SimpleRenderers.triangle(50, 50, 50, 'purple'));

// sprite: Add orange rectangle
const rectangle = lib.sprites.createNew(200, 50, SimpleRenderers.rectangle(50, 100, 'orange'));

// sprite: Add cyan circle
const circle = lib.sprites.createNew(400, 200, SimpleRenderers.circle(50, 'cyan'));

// sprite: Add white smiley face
const smiley = lib.sprites.createNew(325, 300, SimpleRenderers.smileyFace(25, 'white'));

// sprite: Add brown rounded rectangle
const roundedRectangle = lib.sprites.createNew(200, 200, SimpleRenderers.roundedRectangle(90, 38, 10, 'brown'));

// start render loop at 60fps
lib.loop(60);

// set background color to a dark grey
lib.world.setBackgroundColor('#111');