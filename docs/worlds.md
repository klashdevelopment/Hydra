# Worlds in Hydra
When a hydra library is created, a blank world is created along with it. This "world" contains all properties on how the base canvas works - including backdrops and effects.

### Effects
The Hydra world comes with two effects: vingette and bloom. By default, both are disabled. You can enable them like so:
```js
// Vingette
lib.world.effects.vingette.enabled = true;

// Bloom
lib.world.effects.bloom.enabled = true;
```
You can also further customize the properties if needed. All are optional:
```js
// Vingette
lib.world.effects.vingette.color = 'rgb(0, 0, 0)'; // Must be in this format
lib.world.effects.vingette.opacity = 0.5;

// Bloom
lib.world.effects.bloom.intensity = 0.5;
lib.world.effects.bloom.color = 'rgb(255, 255, 255)';
lib.world.effects.bloom.threshold = 0.8;
lib.world.effects.bloom.radius = 10;
```

### Backgrounds
The default background in Hydra is #111, but changing the background is easy with worlds:
```js
lib.world.setBackgroundColor("#fff") // White

lib.world.setBackgroundImage("https://...") // Images
```
If no background is needed, you can disable it easily:
```js
lib.world.setShowBackground(false)
```