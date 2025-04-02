# Tilemaps

Tilemaps are in extreme beta.

### Tilesets
Tilesets let you split up a sprite sheet into sprite renderers.

Create a tileset where each tile is 16x16
```js
const tileset = lib.tileset.createTileset("image-url.png", 16, 16)
```

Get a renderer for each sprite like this:
```js
//                      x  y  width height offset
tileset.getTileRenderer(0, 0, 50,   50,    ...);
```
Note that the width and height in this function are how the sprite should render, not what it originally is in the tilemap.


### Tilemaps
Tilemap renderers are renderers that use a tileset to draw a world based on a grid of tiles.
Currently, there's no way to draw the tilemaps nor create a grid. 