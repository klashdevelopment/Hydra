const lib = new HydraCanvasLib('game');

// sprite: Add square sprite thats red
const sprite = lib.sprites.createNew(50, 50, SimpleRenderers.combination(
    SimpleRenderers.roundedRectangle(50, 50, '#3050ff'),
    SimpleRenderers.smileyFace(25, 'white', 'none')
));
sprite.collider = lib.collision.makeSquareCollider(50, 50);
const text = lib.sprites.createNew(50, 50, SimpleRenderers.text(()=>'Dash Cooldown: '+ Math.round(sprite.props.dashCooldownTicks), '16px', 'Arial', 'white'));

// start render loop at 120fps
lib.loop(120);

// set background color to a dark grey
lib.world.setBackgroundColor('#111');

// advanced player movement using deltaTime to ensure consistent speed across different framerates
lib.listen.addTicker((deltaTime) => {
    // decrement dash cooldown ticks
    if(sprite.props.dashCooldownTicks && sprite.props.dashCooldownTicks > 0) {
        sprite.props.dashCooldownTicks -= 1;
    }else {
        sprite.props.dashCooldownTicks = 0;
    }

    // handle movement & direction
    if (lib.listen.isKey('w')) {
        lib.sprites.moveBy(sprite, 0, -1 * deltaTime);
        sprite.props.lastDirection = 'up';
    }
    if (lib.listen.isKey('a')) {
        lib.sprites.moveBy(sprite, -1 * deltaTime, 0);
        sprite.props.lastDirection = 'left';
    }
    if (lib.listen.isKey('s')) {
        lib.sprites.moveBy(sprite, 0, 1 * deltaTime);
        sprite.props.lastDirection = 'down';
    }
    if (lib.listen.isKey('d')) {
        lib.sprites.moveBy(sprite, 1 * deltaTime, 0);
        sprite.props.lastDirection = 'right';
    }

    // space to dash forward
    if (lib.listen.isKey(' ')) {
        // if dash is on cooldown, return
        if (sprite.props.dashCooldownTicks > 0) {
            return;
        }
        // reset dash cooldown
        sprite.props.dashCooldownTicks = 10*deltaTime;
        const dashSpeed = 15;
        // move sprite in the direction it was last moving
        switch (sprite.props.lastDirection) {
            case 'up':
                lib.sprites.moveBy(sprite, 0, -dashSpeed * deltaTime);
                break;
            case 'left':
                lib.sprites.moveBy(sprite, -dashSpeed * deltaTime, 0);
                break;
            case 'down':
                lib.sprites.moveBy(sprite, 0, dashSpeed * deltaTime);
                break;
            case 'right':
                lib.sprites.moveBy(sprite, dashSpeed * deltaTime, 0);
                break;
        }
    }

    lib.utility.keepAllSpritesInBounds(25);
});