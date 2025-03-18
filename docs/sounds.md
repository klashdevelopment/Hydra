# Hydra SFX & Sounds
First, create a sound effect with the API:
```js
var sound = lib.sounds.createSFX("./sound.mp3")
```
Edit and control the audio in various ways:
```js
// Control
sound.play()
sound.pause()
sound.stop()

// Modify values
sound.setVolume(volume)
sound.setLoop(loop)
sound.setPlaybackRate(rate)
sound.setMuted(muted)

// Get values
sound.isPlaying()
sound.isPaused()
sound.isEnded()
```

If our APIs arent enough, interface with the `Audio` yourself:
```js
sound.editAudio((audio) => {
    // Do whatever
    return audio;
})
```