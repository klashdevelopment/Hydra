# Sprites in Hydra
You can add a sprite from the `hydra.sprites` interface - all sprites should be initialized before the game loop. The function takes in a starting x and y, as well as a renderer (instructions on how to render the sprite.)
```js
var sprite = lib.sprites.createNew(x, y, renderer);
```
They can then be removed and uninitialized easily via the API:
```js
lib.sprites.remove(sprite);

// If using the sprite every tick, this is required as
// the remove function only removes it from the render process.
sprite = null;
```

## Moving sprites
The positions can be updated later on via three ways:
1. Move using a utility function:
```js
lib.sprites.moveBy(sprite, dX, dY);
```
2. Directly update position:
```js
sprite.x = newX;
sprite.y = newY;
```
3. Smoothly update over time:
```js
lib.sprites.glideTo(sprite, newX, newY, duration);
```

## Renderers
There's two main ways to create a renderer for your sprite. Either you can create a custom one, or use the `SimpleRenderers` object to add them in much faster. Each renderer is created with properties that can be passed through to the render cycle, and a callback that is given a `ctx` (canvas context) and sprite.

### Custom Renderer
You can create your own custom renderer by passing one of these into either `SimpleRenderers.combination` or the `sprites.createNew` function:
```js
new HydraSpriteRenderer((ctx, sprite, params) => {
    // Use props.myProperty in here
    // Draw anything on the canvas using sprite.x/sprite.y
}, { myProperty })
```

### Simple Renderers
The `SimpleRenderers` object defines static functions to allow easy creation of renderer objects, the most useful being `combination`.

**Numbers**: width, height, radius, gridWidth, gridHeight, fontSize <br/>
**Strings**: text*, color*, pupilColor, fontName, url <br/>
**{x,y} map**: offset <br/>
**string[]**: map <br/>
**{char, color} map**: colors <br/>
**Gradients**: color* <br/>

\* text can also be a function if live updates are needed

| Name | Parameters | Description |
| --- | --- | --- |
| `rectangle` | width, height, color, offset? | Rectangle |
| `roundedRectangle` | width, height, radius, color, offset? | Rounded rect |
| `circle` | radius, color, offset? | Circle |
| `blurredCircle` | radius, color, blurAmount?, offset? | Shadow circle |
| `blurredRectangle` | width, height, color, blurAmount?, offset? | Shadow rectangle |
| `image` | url, width, height, offset? | Image |
| `pixelMap` | width, height, gridWidth, gridHeight, map, colors, offset? | Pixel art using grid of strings and color map |
| `smileyFace` | radius, color, pupilColor?, offset? | Arc & Circles |
| `combination` | ...renderers | Combination |
| `text` | text, fontSize, fontName, color, weight?, offset? | Text (can have a function) |


### Additional properties
Renderers can be live toggled easily using the shouldRender callbacks:
```js
function callback() {
    // Implement checks to toggle rendering
    return true;
}

// Create renderer with .withShouldRender
var renderer = SimpleRenderers.text(...)
    .withShouldRender(callback);
```
