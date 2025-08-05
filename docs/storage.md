# Storage (Data)

Storage allows for saving game data like player stats across reloads.

Create a storage object using a key for your game:
```js
var storage = lib.data.createStorage('example-key')
```

Then use it:
```js
storage.set("key", "value")
storage.get("key")
storage.remove("key")
```


As long as the example-key stays the same, data will be saved and loaded when exiting/opening the page.