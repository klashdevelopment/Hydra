# Hydra Utilities
### Experiments
Hydra's experiments API has beta features that can be helpful in projects.
Currently, it provides one function to import CSS scripts for fonts such as [Klash Legacy](https://legacy.klash.dev/) or [Inter](https://rsms.me/inter).

```js
var css = lib.experiments.importCSS("https://legacy.klash.dev/legacy.css");

// Remove later on
css.remove();
```
> [!CAUTION]
> Be sure you trust the file you're loading onto your page.

### Utilities
Hydra provides a `hydra.utility` for simple ease of use functions.

- `hydra.utility.ease` - `amount, duration, callback`
- `hydra.utility.getPixelColorAt` - `x, y` > "rgb(r, g, b)"
- `hydra.utility.keepSpriteInBounds` - `sprite, boundGap?`
- `hydra.utility.keepAllSpritesInBounds` - `boundGap?`
- `hydra.utility.getScreenCenter` > {x, y}
- `hydra.utility.getScreenSize` > {width, height}
- `hydra.utility.drawColliderGizmos` - `sprite, color?, width?`
- `hydra.utility.createLinearGradient` - `x0, y0, x1, y1, colorStops`
- `hydra.utility.createRadialGradient` - `x0, y0, r0, x1, y1, r1, colorStops`

The last 2 gradient funcs can be used within any "color" property.