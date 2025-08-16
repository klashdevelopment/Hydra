// Tetris in HydraCanvasLib — drop-in for simple.js

const lib = new HydraCanvasLib('game', { canvasWidth: 420, canvasHeight: 500 });
lib.world.setBackgroundColor('#0e0f12');
lib.experiments.importCSS('https://legacy.klash.dev/legacy.css');
lib.loop(60);

/* --- Config --- */
const COLS = 10;
const ROWS = 20;
const CELL = 22;
const PAD = 8;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;
const SIDE_W = 160;

lib.resize(BOARD_W + SIDE_W + PAD * 3, BOARD_H + PAD * 2);

const COLORS = {
    I: '#53e3fb',
    J: '#4d75ff',
    L: '#ff994d',
    O: '#ffe34d',
    S: '#59f279',
    T: '#c86bff',
    Z: '#ff5d6c',
    G: '#2a2f3a',  // grid empty
    B: '#1b1f28',  // board bg
    W: '#00000020' // wire/grid line
};

// Tetromino definitions (each rotation as matrix of 1/0)
const SHAPES = {
    I: [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    ],
    J: [
        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
        [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    ],
    L: [
        [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
        [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    ],
    O: [
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
    ],
    S: [
        [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
        [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
    ],
    T: [
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
        [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
    ],
    Z: [
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
        [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
        [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
    ],
};

const BAG = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

/* --- Game State --- */
let board = makeBoard();
let bag = [];
let nextQueue = [];
let hold = null;
let canHold = true;
let piece = null;

let score = 0;
let lines = 0;
let level = 1;
let gameOver = false;
let paused = false;

const DROP_BASE_MS = 800; // base drop interval
let dropTimer = 0;
let dropInterval = speedForLevel(level);
let softDrop = false;

/* --- Helpers --- */
function makeBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getFromBag() {
    if (bag.length === 0) bag = shuffle([...BAG]);
    return bag.pop();
}

function fillNextQueue() {
    while (nextQueue.length < 5) nextQueue.push(getFromBag());
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function spawn() {
    const type = nextQueue.shift();
    fillNextQueue();
    const rot = 0;
    const shape = SHAPES[type][rot];
    const w = shape[0].length;
    const x = ((COLS - w) / 2) | 0;
    const y = -spawnOffset(shape); // start slightly above
    piece = { type, rot, x, y };
    canHold = true;
    if (collides(piece, 0, 0, 0)) {
        gameOver = true;
    }
}

function spawnOffset(shape) {
    // how many empty rows at top
    let empty = 0;
    for (let r = 0; r < shape.length; r++) {
        if (shape[r].every(v => v === 0)) empty++; else break;
    }
    return empty;
}

function shapeOf(p) { return SHAPES[p.type][p.rot]; }

function eachCell(p, cb) {
    const s = shapeOf(p);
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s[r].length; c++) {
            if (s[r][c]) cb(p.x + c, p.y + r);
        }
    }
}

function collides(p, dx, dy, drot) {
    const test = { ...p, rot: (p.rot + drot + 4) % 4, x: p.x + dx, y: p.y + dy };
    let hit = false;
    eachCell(test, (x, y) => {
        if (x < 0 || x >= COLS || y >= ROWS) { hit = true; return; }
        if (y >= 0 && board[y][x]) hit = true;
    });
    return hit;
}

function lockPiece() {
    eachCell(piece, (x, y) => {
        if (y >= 0) board[y][x] = piece.type;
    });
    const cleared = clearLines();
    addScore(cleared);
    dropInterval = speedForLevel(level);
    spawn();
}

function clearLines() {
    let removed = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(Boolean)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(null));
            removed++;
            r++;
        }
    }
    lines += removed;
    if (removed > 0 && lines >= level * 10) {
        level++;
    }
    return removed;
}

function addScore(cleared) {
    const table = { 0: 0, 1: 100, 2: 300, 3: 500, 4: 800 };
    score += (table[cleared] || 0) * Math.max(1, level);
}

function speedForLevel(lv) {
    // simple curve: faster with level
    const minMs = 80;
    return Math.max(minMs, DROP_BASE_MS - (lv - 1) * 60);
}

/* --- Input --- */
function tryMove(dx, dy) {
    if (!collides(piece, dx, dy, 0)) {
        piece.x += dx; piece.y += dy; return true;
    }
    return false;
}
function tryRotate(dir) {
    if (!collides(piece, 0, 0, dir)) { piece.rot = (piece.rot + dir + 4) % 4; return; }
    // simple wall kicks
    const kicks = [[-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];
    for (const [kx, ky] of kicks) {
        if (!collides(piece, kx, ky, dir)) {
            piece.x += kx; piece.y += ky; piece.rot = (piece.rot + dir + 4) % 4; return;
        }
    }
}

function hardDrop() {
    let dist = 0;
    while (!collides(piece, 0, dist + 1, 0)) dist++;
    piece.y += dist;
    lockPiece();
}

/* --- Hold --- */
function doHold() {
    if (!canHold) return;
    canHold = false;
    if (hold === null) {
        hold = piece.type;
        spawn();
    } else {
        const tmp = hold;
        hold = piece.type;
        piece = { type: tmp, rot: 0, x: 3, y: -2 };
        if (collides(piece, 0, 0, 0)) gameOver = true;
    }
}

/* --- Rendering --- */
const boardRenderer = new HydraSpriteRenderer((ctx, sprite, params) => {
    // Board background
    ctx.save();
    const ox = PAD, oy = PAD;
    // board panel
    ctx.fillStyle = COLORS.B;
    ctx.fillRect(ox - 4, oy - 4, BOARD_W + 8, BOARD_H + 8);

    // grid
    ctx.strokeStyle = COLORS.W;
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
        const x = ox + c * CELL + 0.5;
        ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + BOARD_H); ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
        const y = oy + r * CELL + 0.5;
        ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + BOARD_W, y); ctx.stroke();
    }

    // Draw placed blocks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const t = board[r][c];
            if (t) drawCell(ctx, ox, oy, c, r, COLORS[t]);
        }
    }

    // Ghost piece
    if (!gameOver && piece) {
        let ghostY = piece.y;
        while (!collides(piece, 0, ghostY - piece.y + 1, 0)) ghostY++;
        eachCell({ ...piece, y: ghostY }, (x, y) => {
            if (y >= 0) drawCell(ctx, ox, oy, x, y, COLORS[piece.type] + '44', true);
        });
    }

    // Active piece
    if (!gameOver && piece) {
        eachCell(piece, (x, y) => {
            if (y >= 0) drawCell(ctx, ox, oy, x, y, COLORS[piece.type]);
        });
    }

    // Sidebar
    const sx = ox + BOARD_W + PAD;
    ctx.fillStyle = '#141824';
    ctx.fillRect(sx - 4, oy - 4, SIDE_W + 8, BOARD_H + 8);

    ctx.fillStyle = '#e7ecf3';
    ctx.font = 'bold 20px KlashLegacy';
    ctx.fillText('TETRIS', sx, oy + 22);

    ctx.font = '14px KlashLegacy';
    ctx.fillText(`Score: ${score}`, sx, oy + 50);
    ctx.fillText(`Level: ${level}`, sx, oy + 70);
    ctx.fillText(`Lines: ${lines}`, sx, oy + 90);

    // Next
    ctx.fillText('Next:', sx, oy + 120);
    drawPreview(ctx, sx, oy + 130, nextQueue.slice(0, 3));

    // Hold
    ctx.fillText('Hold:', sx, oy + 260);
    if (hold) drawPreview(ctx, sx, oy + 270, [hold]);

    // Help
    ctx.fillStyle = '#9aa3b2';
    ctx.fillText('←/→ move   ↑ rotate', sx, oy + 380);
    ctx.fillText('↓ soft drop  Space hard drop', sx, oy + 400);
    ctx.fillText('Shift hold   P pause   R reset', sx, oy + 420);

    // Game Over / Paused
    if (paused) overlay(ctx, 'PAUSED');
    if (gameOver) overlay(ctx, 'GAME OVER');

    ctx.restore();
}, {});

function drawCell(ctx, ox, oy, cx, cy, color, ghost = false) {
    const x = ox + cx * CELL;
    const y = oy + cy * CELL;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    if (!ghost) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 2, y + 2, CELL - 4, (CELL - 4) / 3);
        ctx.globalAlpha = 1;
    }
}

function drawMini(ctx, x, y, type) {
    const mat = SHAPES[type][0];
    const size = 16;
    const w = mat[0].length;
    const h = mat.length;
    const px = x + 8 + (64 - w * size) / 2;
    const py = y + 8 + (64 - h * size) / 2;
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        if (mat[r][c]) {
            ctx.fillStyle = COLORS[type];
            ctx.fillRect(px + c * size, py + r * size, size - 2, size - 2);
        }
    }
    ctx.strokeStyle = '#3a4154';
    ctx.strokeRect(x, y, 80, 80);
}

function drawPreview(ctx, sx, sy, list) {
    for (let i = 0; i < list.length; i++) {
        drawMini(ctx, sx, sy + i * 90, list[i]);
    }
}

function overlay(ctx, text) {
    ctx.save();
    ctx.fillStyle = '#00000080';
    ctx.fillRect(PAD - 4, PAD - 4, BOARD_W + 8, BOARD_H + 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px KlashLegacy';
    const tw = ctx.measureText(text).width;
    ctx.fillText(text, PAD + (BOARD_W - tw) / 2, PAD + BOARD_H / 2);
    ctx.restore();
}

/* --- Sprite to render everything --- */
const boardSprite = lib.sprites.createNew(0, 0, boardRenderer);

/* --- Game Loop --- */
function reset() {
    board = makeBoard();
    bag = [];
    nextQueue = [];
    hold = null;
    canHold = true;
    score = 0; lines = 0; level = 1;
    gameOver = false; paused = false;
    dropTimer = 0; dropInterval = speedForLevel(level);
    fillNextQueue();
    spawn();
}

reset();

var tick = 0;

lib.listen.addTicker((dt) => {
    if (gameOver || paused) return;
    tick++;
    if (tick > 360) tick = 0;

    const step = (softDrop ? 40 : dropInterval);
    dropTimer += dt;
    while (dropTimer >= step) {
        dropTimer -= step;
        if (!tryMove(0, 1)) {
            lockPiece();
            break;
        }
    }
});

/* --- Key handling (discrete presses) --- */
lib.listen.addTicker(() => {
    if (lib.listen.onKeyDown('ArrowLeft')) tryMove(-1, 0);
    if (lib.listen.onKeyDown('ArrowRight')) tryMove(1, 0);
    if (lib.listen.onKeyDown('ArrowUp')) tryRotate(1);
    if (lib.listen.onKeyDown('z')) tryRotate(-1);
    if (lib.listen.onKeyDown(' ')) hardDrop();
    if (lib.listen.onKeyDown('Shift')) doHold();
    if (lib.listen.onKeyDown('p') || lib.listen.onKeyDown('P')) paused = !paused;
    if (lib.listen.onKeyDown('r') || lib.listen.onKeyDown('R')) reset();
    softDrop = lib.listen.isKey('ArrowDown')&&tick % 4 === 0;
});
