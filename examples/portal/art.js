const legAmplitude = 10;
const legSpeed = 4;
const apertureLogo = document.createElement('img');
apertureLogo.src = 'examples/portal/assets/aperture.svg';

const portal_2_logo = document.createElement('img');
portal_2_logo.src = 'examples/portal/assets/2P.svg';

export const CUBE = SimpleRenderers.combination(
    // Aperture Science Weighted Storage Cube
    SimpleRenderers.roundedRectangle(12.5, 12.5, 2, '#D3D3D3', { x: -2.5, y: -2.5 }),
    SimpleRenderers.roundedRectangle(12.5, 12.5, 2, '#D3D3D3', { x: 30, y: -2.5 }),
    SimpleRenderers.roundedRectangle(12.5, 12.5, 2, '#D3D3D3', { x: -2.5, y: 30 }),
    SimpleRenderers.roundedRectangle(12.5, 12.5, 2, '#D3D3D3', { x: 30, y: 30 }),
    SimpleRenderers.rectangle(40, 40, '#D3D3D3', { x: 0, y: 0 }),
    SimpleRenderers.rectangle(4, 10, '#959595', { x: 10, y: 0 }),
    SimpleRenderers.rectangle(4, 10, '#959595', { x: 26, y: 0 }),
    SimpleRenderers.rectangle(10, 4, '#959595', { x: 0, y: 10 }),
    SimpleRenderers.rectangle(10, 4, '#959595', { x: 0, y: 26 }),
    SimpleRenderers.rectangle(4, 10, '#959595', { x: 10, y: 30 }),
    SimpleRenderers.rectangle(4, 10, '#959595', { x: 26, y: 30 }),
    SimpleRenderers.rectangle(10, 4, '#959595', { x: 30, y: 10 }),
    SimpleRenderers.rectangle(10, 4, '#959595', { x: 30, y: 26 }),
    SimpleRenderers.circle(17, '#959595', { x: 20, y: 20 }),
    SimpleRenderers.circle(13, '#555555', { x: 20, y: 20 }),
    SimpleRenderers.circle(11, '#689fc5', { x: 20, y: 20 }),
    SimpleRenderers.circle(7, '#dddddd', { x: 20, y: 20 }),
    SimpleRenderers.image(apertureLogo, 11, 11, { x: 14.5, y: 14.5 }),
);

export const PORTAL_2D = SimpleRenderers.combination(
    SimpleRenderers.text('PORTAL', 45, 'Inter', 'black', { x: -200, y: 0 }, '700', '2px'),
    SimpleRenderers.image(portal_2_logo, 60, 70, { x: 0, y: -52.5 }),
)

export const BENDY = (moving = false, tick = 0) => {
    var leftLegOffset = (-10) + Math.abs(Math.sin(tick / legSpeed) * legAmplitude);
    var rightLegOffset = -Math.abs(Math.sin((tick / legSpeed) + Math.PI) * legAmplitude);

    if (!moving) {
        rightLegOffset = 0;
        leftLegOffset = 0;
    }
    return SimpleRenderers.combination(
        SimpleRenderers.circle(15, '#000', { x: (moving || 0), y: 0 }),
        SimpleRenderers.circle(15, '#000', { x: 0, y: 30 }),
        SimpleRenderers.rectangle(30, 20, '#000', { x: -15, y: 30 }),
        SimpleRenderers.rectangle(10, 22, '#000', { x: -12.5, y: 49 + leftLegOffset }),
        SimpleRenderers.rectangle(10, 22, '#000', { x: 2.5, y: 49 + rightLegOffset }),
    )
};

export const DISPENSER = (amountOpen = 0) => SimpleRenderers.combination(
    SimpleRenderers.roundedRectangle(120, 30, 15, '#ddd', { x: 0, y: 20 }),
    SimpleRenderers.rectangle(120, 5, '#888'),
    SimpleRenderers.rectangle(120, 30, '#ccc', { x: 0, y: 5 }),
    SimpleRenderers.rectangle(120, 5, '#888', { x: 0, y: 30 }),
    SimpleRenderers.rectangle(100, 5, '#777', { x: 10, y: 50 }),
    SimpleRenderers.rectangle(100, 60, '#ffffff50', { x: 10, y: 55 }),

    SimpleRenderers.roundedRectangle(60, 20, 5, '#eeeeff', { x: -amountOpen, y: 115 }),
    SimpleRenderers.rectangle(30, 20, '#eeeeff', { x: 30 - amountOpen, y: 115 }),
    SimpleRenderers.rectangle(3, 20, '#555', { x: 10 - amountOpen, y: 115 }),

    SimpleRenderers.roundedRectangle(60, 20, 5, '#eeeeff', { x: 60 + amountOpen, y: 115 }),
    SimpleRenderers.rectangle(30, 20, '#eeeeff', { x: 60 + amountOpen, y: 115 }),
    SimpleRenderers.rectangle(3, 20, '#555', { x: 107 + amountOpen, y: 115 }),

    SimpleRenderers.rectangle(1.5, 20, '#555', { x: 58.5 - amountOpen, y: 115 }),
    SimpleRenderers.rectangle(1.5, 20, '#555', { x: 60 + amountOpen, y: 115 }),
);

export const BUTTON = (pressed = false) => SimpleRenderers.combination(
);
