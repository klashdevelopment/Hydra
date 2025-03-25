/*
    ! CODE MADE BY AI !
    This code was generated by Copilot (GPT-4o) after
    only being given the hydra.js source code to
    learn. It's insane what AI is able to do with such
    little information nowadays.
*/

const lib = new HydraCanvasLib('game');

// Constants for the game
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const TICK_RATE = 500;
const MOVE_TICK_RATE = 100;
const COLORS = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

// Game state variables
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;
let holdPiece = null;
let holdLocked = false;
let gameOver = false;
let score = 0;
let intervalId = null;
let moveIntervalId = null;
let boardSprites = [];
let pieceSprites = [];
let nextPieceSprites = [];
let holdPieceSprites = [];
let scoreText = null;

// Utility functions for the game
function randomPiece() {
    const type = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[type],
        color: COLORS[type],
        x: Math.floor(COLS / 2) - Math.ceil(SHAPES[type][0].length / 2),
        y: 0
    };
}

function initBoardSprites() {
    for (let r = 0; r < ROWS; r++) {
        boardSprites[r] = [];
        for (let c = 0; c < COLS; c++) {
            boardSprites[r][c] = lib.sprites.createNew(c * BLOCK_SIZE, r * BLOCK_SIZE, SimpleRenderers.rectangle(BLOCK_SIZE, BLOCK_SIZE, '#000'));
        }
    }
}

function updateBoardSprites() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const color = board[r][c] ? COLORS[board[r][c] - 1] : '#000';
            boardSprites[r][c].renderer = SimpleRenderers.rectangle(BLOCK_SIZE, BLOCK_SIZE, color);
        }
    }
}

function createPieceSprites(piece) {
    const sprites = [];
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                sprites.push(lib.sprites.createNew((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, SimpleRenderers.rectangle(BLOCK_SIZE, BLOCK_SIZE, piece.color)));
            }
        });
    });
    return sprites;
}

function updatePieceSprites(sprites, piece, offsetX = 0, offsetY = 0) {
    let i = 0;
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                sprites[i].x = (piece.x + x + offsetX) * BLOCK_SIZE;
                sprites[i].y = (piece.y + y + offsetY) * BLOCK_SIZE;
                i++;
            }
        });
    });
}

function collide(board, piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] &&
                (piece.y + y >= ROWS ||
                 piece.x + x < 0 ||
                 piece.x + x >= COLS ||
                 board[piece.y + y][piece.x + x])) {
                return true;
            }
        }
    }
    return false;
}

function merge(board, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[piece.y + y][piece.x + x] = COLORS.indexOf(piece.color) + 1;
            }
        });
    });
}

function rotate(piece) {
    const newPiece = JSON.parse(JSON.stringify(piece));
    for (let y = 0; y < newPiece.shape.length; y++) {
        for (let x = 0; x < y; x++) {
            [newPiece.shape[x][y], newPiece.shape[y][x]] = [newPiece.shape[y][x], newPiece.shape[x][y]];
        }
    }
    newPiece.shape.forEach(row => row.reverse());

    // Check for collisions and boundaries after rotation
    while (newPiece.x < 0) {
        newPiece.x++;
    }
    while (newPiece.x + newPiece.shape[0].length > COLS) {
        newPiece.x--;
    }
    while (newPiece.y + newPiece.shape.length > ROWS) {
        newPiece.y--;
    }

    return newPiece;
}

function clearLines() {
    let lines = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (!board[y][x]) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        lines++;
        y++;
    }
    score += lines * 100;
}

function drop() {
    currentPiece.y++;
    if (collide(board, currentPiece)) {
        currentPiece.y--;
        merge(board, currentPiece);
        clearLines();
        currentPiece = nextPiece;
        nextPiece = randomPiece();
        holdLocked = false;
        if (collide(board, currentPiece)) {
            gameOver = true;
            clearInterval(intervalId);
            clearInterval(moveIntervalId);
            lib.sprites.createNew(lib.utility.getScreenCenter().x - 100, lib.utility.getScreenCenter().y - 50, SimpleRenderers.text('Game Over', 40, 'Arial', 'red'));
        }
        pieceSprites = createPieceSprites(currentPiece);
    }
}

function hold() {
    if (holdLocked) return;
    if (!holdPiece) {
        holdPiece = currentPiece;
        currentPiece = nextPiece;
        nextPiece = randomPiece();
    } else {
        [currentPiece, holdPiece] = [holdPiece, currentPiece];
    }
    currentPiece.x = Math.floor(COLS / 2) - Math.ceil(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;
    holdLocked = true;
    pieceSprites = createPieceSprites(currentPiece);
}

// Initialize the game
function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    holdPiece = null;
    gameOver = false;
    score = 0;
    holdLocked = false;
    initBoardSprites();
    pieceSprites = createPieceSprites(currentPiece);
    nextPieceSprites = createPieceSprites(nextPiece);
    if (holdPiece) {
        holdPieceSprites = createPieceSprites(holdPiece);
    }
    scoreText = lib.sprites.createNew(COLS * BLOCK_SIZE + 10, 0, SimpleRenderers.text(`Score: ${score}`, 20, 'Arial', 'black'));
    intervalId = setInterval(() => {
        drop();
        updateBoardSprites();
        updatePieceSprites(pieceSprites, currentPiece);
        updatePieceSprites(nextPieceSprites, nextPiece, COLS + 1, 0);
        if (holdPiece) {
            updatePieceSprites(holdPieceSprites, holdPiece, -3, 0);
        }
        scoreText.renderer = SimpleRenderers.text(`Score: ${score}`, 20, 'Arial', 'black');
    }, TICK_RATE);
    moveIntervalId = setInterval(() => {
        if (lib.listen.isKey('ArrowLeft')) {
            currentPiece.x--;
            if (collide(board, currentPiece)) {
                currentPiece.x++;
            }
            updatePieceSprites(pieceSprites, currentPiece);
        }
        if (lib.listen.isKey('ArrowRight')) {
            currentPiece.x++;
            if (collide(board, currentPiece)) {
                currentPiece.x--;
            }
            updatePieceSprites(pieceSprites, currentPiece);
        }
        if (lib.listen.isKey('ArrowDown')) {
            currentPiece.y++;
            if (collide(board, currentPiece)) {
                currentPiece.y--;
                merge(board, currentPiece);
                clearLines();
                currentPiece = nextPiece;
                nextPiece = randomPiece();
                holdLocked = false;
                pieceSprites = createPieceSprites(currentPiece);
            }
            updatePieceSprites(pieceSprites, currentPiece);
        }
        if (lib.listen.isKey('ArrowUp')) {
            const rotatedPiece = rotate(currentPiece);
            if (!collide(board, rotatedPiece)) {
                currentPiece = rotatedPiece;
                updatePieceSprites(pieceSprites, currentPiece);
            }
        }
        if (lib.listen.isKey('Shift')) {
            hold();
            pieceSprites = createPieceSprites(currentPiece);
        }
    }, MOVE_TICK_RATE);
}

// Event listeners for controls
lib.listen.addTicker(deltaTime => {
    if (lib.listen.isKey(' ')) {
        while (!collide(board, currentPiece)) {
            currentPiece.y++;
        }
        currentPiece.y--;
        merge(board, currentPiece);
        clearLines();
        currentPiece = nextPiece;
        nextPiece = randomPiece();
        holdLocked = false;
        if (collide(board, currentPiece)) {
            gameOver = true;
            clearInterval(intervalId);
            clearInterval(moveIntervalId);
            lib.sprites.createNew(lib.utility.getScreenCenter().x - 100, lib.utility.getScreenCenter().y - 50, SimpleRenderers.text('Game Over', 40, 'Arial', 'red'));
        }
        pieceSprites = createPieceSprites(currentPiece);
    }
});

// Start the game
init();
lib.loop(60);
lib.world.setBackgroundColor('#111');