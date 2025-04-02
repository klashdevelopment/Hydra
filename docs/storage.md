# Storage (Data)

Create a storage object:
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