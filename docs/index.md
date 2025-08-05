# Hydra 2D Documentation
Test our demo games [here](https://raw.githack.com/klashdevelopment/Hydra/main/index.html) in the interactive demo.

## Import and setup
Add a script to Hydra.js from self-hosting or a CDN:

**NPM** - Stable builds
- `npm i @klashdevelopment/hydra`

**CDN** - For browser. Pulls from NPM
- UNPKG (Full) - `https://unpkg.com/@klashdevelopment/hydra`
- jsDelivr (Minimized) - `https://cdn.jsdelivr.net/npm/@klashdevelopment/hydra`
- jsDelivr (Full) - `https://cdn.jsdelivr.net/npm/@klashdevelopment/hydra/src/hydra.js`

**Github CDN** - More automatic builds
- Pushly - `https://raw.githack.com/klashdevelopment/Hydra/main/hydra.js`
- Nightly - `https://rawcdn.githack.com/klashdevelopment/Hydra/main/hydra.js`

```html
<script src="hydra.js"></script>
```

After this, create an instance of hydra, supplying a **HTML id to a canvas**:
```js
// Uses the element <canvas id="game">
const lib = new HydraCanvasLib('game');

// If you need a different window size:
const lib = new HydraCanvasLib('game', { // All are optional, these are the defaults
    canvasWidth: 800,
    canvasHeight: 600,
    enableExperimentalDPR: true // Higher quality rendering
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