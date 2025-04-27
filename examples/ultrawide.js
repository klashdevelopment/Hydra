const lib = new HydraCanvasLib('game', { canvasWidth: 1280, canvasHeight: 720 });

lib.world.setBackgroundColor('#0b0b0f');
lib.experiments.importCSS("https://rsms.me/inter/inter.css");

const text = lib.sprites.createNew(0, 0, SimpleRenderers.none());
const arrowLeft = lib.sprites.createNew(0, 0, SimpleRenderers.triangle(80, 80, 50, '#aaaaff', { rotation: -90, x: 0, y: 0 }));
const arrowRight = lib.sprites.createNew(0, 0, SimpleRenderers.triangle(80, 80, 50, '#aaaaff', { rotation: 90, x: 0, y: 0 }));
const arrowUp = lib.sprites.createNew(0, 0, SimpleRenderers.triangle(80, 80, 50, '#aaaaff', { rotation: 0, x: 0, y: 0 }));
const arrowDown = lib.sprites.createNew(0, 0, SimpleRenderers.triangle(80, 80, 50, '#aaaaff', { rotation: 180, x: 0, y: 0 }));

// colliders
arrowLeft.collider = lib.collision.makeSquareCollider(80, 80);
arrowRight.collider = lib.collision.makeSquareCollider(80, 80);
arrowUp.collider = lib.collision.makeSquareCollider(80, 80);
arrowDown.collider = lib.collision.makeSquareCollider(80, 80);

function updateText() {
    var content = `${lib.utility.getScreenSize().width}x${lib.utility.getScreenSize().height}`;
    text.x = (lib.utility.getScreenSize().width / 2) - (lib.utility.getStringWidth(content, 80, "Inter", 'bold') / 2);
    text.y = (lib.utility.getScreenSize().height / 2) + 20;
    text.renderer = SimpleRenderers.text(
        content,
        80, "Inter", '#fff', { x: 0, y: 0 }, 'bold'
    );

    arrowLeft.x = 20;
    arrowLeft.y = lib.utility.getScreenSize().height / 2 - 40;
    arrowRight.x = lib.utility.getScreenSize().width - 100;
    arrowRight.y = lib.utility.getScreenSize().height / 2 - 40;
    arrowUp.x = lib.utility.getScreenSize().width / 2 - 40;
    arrowUp.y = 20;
    arrowDown.x = lib.utility.getScreenSize().width / 2 - 40;
    arrowDown.y = lib.utility.getScreenSize().height - 100;
}
updateText();

function resizeBy(dx, dy) {
    var size = lib.utility.getScreenSize();
    lib.resize(size.width + dx, size.height + dy);
    updateText();
}

lib.loop(60);

lib.listen.addTicker(dT => {
    lib.utility.drawColliderGizmos(arrowLeft);
    lib.utility.drawColliderGizmos(arrowRight);
    lib.utility.drawColliderGizmos(arrowUp);
    lib.utility.drawColliderGizmos(arrowDown);

    [arrowLeft, arrowRight, arrowUp, arrowDown].forEach((arrow, i) => {
        if(lib.collision.isMouseTouching(arrow) && lib.listen.isMouseDown()) {
            switch (i) {
                case 0:
                    resizeBy(-10, 0);
                    break;
                case 1:
                    resizeBy(10, 0);
                    break;
                case 2:
                    resizeBy(0, 10);
                    break;
                case 3:
                    resizeBy(0, -10);
                    break;
            }
        }
    });
})