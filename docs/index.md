# Hydra 2D Documentation
Test our demo games [here](https://raw.githack.com/klashdevelopment/Hydra/main/index.html) in the interactive demo.

## Import and setup
Add a script to Hydra.js from either CDN or self-host
- Nightly - https://raw.githack.com/klashdevelopment/Hydra/main/hydra.js
- Stable - https://rawcdn.githack.com/klashdevelopment/Hydra/main/hydra.js
```html
<script src="hydra.js"></script>
```

After this, create an instance of hydra, supplying a **HTML id to a canvas**:
```js
// Uses the element <canvas id="game-canvas">
const lib = new HydraCanvasLib('game-canvas');

// If you need a different window size:
const lib = new HydraCanvasLib('game-canvas', { // All are optional
    canvasWidth: 800,
    canvasHeight: 600,
    enableExperimentalDPR: false // Uses Device-Pixel Ratio for crispness
});
```
Setup all sprites and prerequisites, then start the game loop with FPS:
```js
// Uses 60fps
lib.loop(60);
```


### Features:
- [Worlds](./worlds)
- [Utility](./utility)
- [Collision](./collision)
- [Sounds](./sounds)
- [Tilemaps](./tilemap)
- [Sprites](./sprites)
- [Events](./events)
- [Storage](./storage)