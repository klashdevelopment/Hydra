# Sprite Colliders
Collision is a huge part of any game - they allow functionality in any game that requires checking if two objects are near eachother (almost any game).

***Tip:*** *Check the 2d-physics.js example for a physics engine!*

First, you can make a simple square collider and put it on a sprite:
```js
  var collider = lib.collision.makeSquareCollider(width, height, offset)
//var collider = lib.collision.makeCircleCollider(radius, offset)
// If you need to edit the collider later on:
collider.width = newWidth;
collider.offset.x = newXOffset;
// Now, put it on a sprite.
sprite.collider = collider;
```

Colliders are used throughout all of Hydra, so making sure your sprite has one is crucial for non-static elements.

Checking collision is then avaliable between two objects with colliders:
```js
var touching = lib.collision.checkCollision(sprite1, sprite2)
```

Or, check a position before moving a sprite:
```js
var newPosition = {
    x: sprite1.x + 10, // Simulate moving the X by 10
    y: sprite1.y + 10, // Simulate moving the y by 10
    collider: sprite1.collider
};
var touching = lib.collision.checkCollision(newPosition, sprite2)
```

If you need to check if mouse is touching - that's simple:
```js
var touching = lib.collision.isMouseTouching(sprite);
```

> [!TIP]
> If needed, check the utility page on how to show debug gizmos on colliders.