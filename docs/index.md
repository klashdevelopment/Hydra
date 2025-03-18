# Hydra 2D Documentation

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
- [Sprites](./sprites)
- [Events](./events)