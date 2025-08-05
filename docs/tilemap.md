# Tilemaps

Tilemaps are in extreme beta. You can find a demo in examples/tilemap.js, or on the examples site [here](https://raw.githack.com/klashdevelopment/Hydra/main/index.html).

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

Creating a Tilemap comes with both a renderer to put on a sprite, as well as a collider for the sprite for collision checks. These tilemap type colliders simply make each tile have a square collider, as dynamic collision isn't avaliable at the moment.

Once you have your tileset ready, create a tilemap:
```js
// The visibleSize is the width/height each tile will be when drawn
const tilemap = lib.tileset.createTilemap(tileset, map, visibleSize);
```

The `map` needed is an array of rows, each row being an array of dual-numbers, like below:
```js
map = [
    [[0,0], [0,1]],
    [[0,0], [0,1]]
]
```
Each outer array represents a row of the tilemap, while each inner array has two numbers - x and y - representing their location in the tileset.

Once this is made, put it on a sprite:
```js
const tileSprite = lib.sprites.createNew(0, 0, tilemap.renderer);
tileSprite.collider = tilemap.collider; // Tilemaps come with a unique collider of 'tilemap' type.
```

### Tilemap collision
You can check collision with a tilemap like anything else:
```js
// use the tileSprite, not the tilemap/tileset
lib.collision.checkCollision(tileSprite, exampleOtherSprite)
```