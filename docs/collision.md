# Sprite Colliders
Collision is a huge part of any game - they allow functionality in any game that requires checking if two objects are near eachother (almost any game).

First, make a collider and put it on a sprite:
```js
var collider = lib.collision.makeSquareCollider(width, height, offset)
// If you need to edit the collider later on:
collider.width = newWidth;
collider.offset.x = newXOffset;
// Now, put it on a sprite.
sprite.collider = collider;
```

Colliders are used throughout all of Hydra, so making sure your sprite has one is crucial for non-static elements.

Checking collision is then avaliable between two objects with colliders:
```js
var touching = lib.collision.checkSquareCollision(sprite1, sprite2)
```

If you need to check if mouse is touching - that's simple:
```js
var touching = lib.collision.isMouseTouching(sprite);
```

> [!TIP]
> If needed, check the utility page on how to show gizmos on colliders.