# Listening in Hydra
Hydra handles most listening through a simple `hydra.listen` API.
For continuous checks, add a "ticker" to run every single frame:
```js
// Provides a beta deltaTime to ensure FPS changes
var ticker = lib.listen.addTicker((deltaTime) => {
    // Run checks here
})
```
You can then remove tickers if needed:
```js
lib.listen.removeTicker(ticker)
```

## Mouse position
```js
lib.listen.mouse.x
lib.listen.mouse.y
```

## Mouse presses
Use the simple `isMouseDown` api or use the key press api for `Mouse1`:
```js
lib.listen.isMouseDown() // Only left click

lib.listen.isKey("Mouse1") // Left click
lib.listen.isKey("Mouse2") // Right click
```
## Key presses
For a simple check if a key is down:
```js
lib.listen.isKey("a") // A
lib.listen.isKey("A") // Shift + A

// Check if multiple are down
lib.listen.isManyKeys("a", "b") // A and B
```
## Initial key press
Checking when a key is first pressed is also easy:
```js
lib.listen.onKeyDown("a") // True on the first frame "a" is pressed on
```