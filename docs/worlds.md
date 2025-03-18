# Worlds in Hydra
When a hydra library is created, a blank world is created along with it. This "world" contains all properties on how the base canvas works. In the future, this will hold renderer effects such as bloom and vingette.

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