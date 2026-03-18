const FORCE_GITHACK = false; // used in dev

// Paint Maze
const lib = window.lib = new HydraCanvasLib('game', {
    enableExperimentalDPR: true,
    canvasHeight: 420,
    canvasWidth: 500
});


function generateMaze(w, h) {
    const ri = (n) => Math.floor(Math.random() * n);
    function inBounds(r, c) { return r >= 0 && r < h && c >= 0 && c < w; }
    function get(r, c) { return inBounds(r, c) ? grid[r][c] : 1; }

    const grid = Array.from({ length: h }, () => new Array(w).fill(0));

    // ── Solid border ───────────────────────────────────────────────────────────
    for (let r = 0; r < h; r++)
        for (let c = 0; c < w; c++)
            if (r === 0 || r === h - 1 || c === 0 || c === w - 1)
                grid[r][c] = 1;

    // ── Corner notches for irregular boundary ─────────────────────────────────
    for (const [cr, cc] of [[0, 0], [0, w - 1], [h - 1, 0], [h - 1, w - 1]]) {
        if (Math.random() > 0.6) continue;
        const bh = 1 + ri(Math.min(3, Math.floor(h / 6)));
        const bw = 1 + ri(Math.min(3, Math.floor(w / 6)));
        const dr = cr === 0 ? 1 : -1, dc = cc === 0 ? 1 : -1;
        for (let i = 0; i < bh; i++)
            for (let j = 0; j < bw; j++)
                if (inBounds(cr + dr * i, cc + dc * j)) grid[cr + dr * i][cc + dc * j] = 1;
    }

    // ── slideReach: Set of all cell keys the ball can land on from (sr,sc) ─────
    function slideReach(sr, sc) {
        const reached = new Set();
        const queue = [[sr, sc]];
        reached.add(sr * w + sc);
        while (queue.length) {
            const [r, c] = queue.shift();
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                let nr = r, nc = c;
                while (get(nr + dr, nc + dc) !== 1) { nr += dr; nc += dc; }
                const key = nr * w + nc;
                if (!reached.has(key)) {
                    reached.add(key);
                    queue.push([nr, nc]);
                }
            }
        }
        return reached;
    }

    // ── Wall placement ─────────────────────────────────────────────────────────
    const anchorR = Math.floor(h / 2);
    const anchorC = Math.floor(w / 2);

    const targetFrac = 0.17 + Math.random() * 0.09;
    let budget = Math.floor((w - 2) * (h - 2) * targetFrac);
    let tries = 0;
    let reach = slideReach(anchorR, anchorC);

    while (budget > 0 && tries < 10000) {
        tries++;

        const vertical = Math.random() < 0.5;
        const len = 1 + ri(Math.min(3, vertical ? Math.floor(h / 3) : Math.floor(w / 3)));
        const cells = [];

        if (vertical) {
            const c = 1 + ri(w - 2);
            const sr = 1 + ri(Math.max(1, h - len - 1));
            for (let r = sr; r < sr + len && r < h - 1; r++) cells.push([r, c]);
        } else {
            const r = 1 + ri(h - 2);
            const sc = 1 + ri(Math.max(1, w - len - 1));
            for (let c = sc; c < sc + len && c < w - 1; c++) cells.push([r, c]);
        }

        if (cells.some(([r, c]) => grid[r][c] === 1 || (r === anchorR && c === anchorC))) continue;
        if (cells.some(([r, c]) => r <= 0 || r >= h - 1 || c <= 0 || c >= w - 1)) continue;

        // No touching other interior walls (visual separation)
        let conflict = false;
        for (const [r, c] of cells) {
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const nr = r + dr, nc = c + dc;
                if (cells.some(([er, ec]) => er === nr && ec === nc)) continue;
                if (inBounds(nr, nc) && grid[nr][nc] === 1 && nr > 0 && nr < h - 1 && nc > 0 && nc < w - 1) { conflict = true; break; }
            }
            if (conflict) break;
        }
        if (conflict) continue;

        const cellSet = new Set(cells.map(([r, c]) => r * w + c));
        for (const [r, c] of cells) grid[r][c] = 1;

        const newReach = slideReach(anchorR, anchorC);
        const ok = [...reach].every(key => cellSet.has(key) || newReach.has(key));

        if (ok) {
            budget -= cells.length;
            reach = newReach;
        } else {
            for (const [r, c] of cells) grid[r][c] = 0;
        }
    }

    // ── Pick spawn ─────────────────────────────────────────────────────────────
    // `reach` is slideReach(anchor). Pick any cell in reach as spawn such that
    // slideReach(spawn) ⊇ reach. This guarantees the slide graph is connected.
    // Since slide is symmetric (if A reaches B, B reaches A via reverse path),
    // any cell in reach satisfies this — but verify to be safe.
    const reachList = [...reach].map(k => [Math.floor(k / w), k % w]).filter(([r, c]) => grid[r][c] === 0);

    // Sort candidates by slide coverage (descending) and pick first that covers reach
    const candidates = reachList.slice().sort(() => Math.random() - 0.5).slice(0, 60);

    let bestSpawn = reachList[0] || [anchorR, anchorC];
    let bestCoverage = -1;

    for (const [sr, sc] of candidates) {
        const s = slideReach(sr, sc);
        const missing = [...reach].filter(k => !s.has(k)).length;
        const score = s.size - missing * 1000; // heavily penalize missing coverage
        if (score > bestCoverage) {
            bestCoverage = score;
            bestSpawn = [sr, sc];
        }
    }

    // Final safety: if chosen spawn doesn't fully cover reach, use anchor
    const spawnReach = slideReach(bestSpawn[0], bestSpawn[1]);
    if ([...reach].some(k => !spawnReach.has(k))) {
        // Use anchor as spawn (guaranteed to cover reach since reach = slideReach(anchor))
        bestSpawn = [anchorR, anchorC];
    }

    grid[bestSpawn[0]][bestSpawn[1]] = 2;
    return grid;
}

let maps = [];

fetch((FORCE_GITHACK ? "https://rawcdn.githack.com/klashdevelopment/Hydra/main/" : "") + 'examples/assets/paintmaze_maps.json')
    .then(res => res.json())
    .then(json => {
        maps = json;
        start();
    })
    .catch(err => {
        console.error('Error loading maps:', err);
        start();
    });

function renderer(col, extra=[]) {
    return SimpleRenderers.combination(
        SimpleRenderers.rectangle(20, 20, col),
        ...extra
    );
}

function fixMap(map) {
    var data = map.initialGrid.map(row => row.map(cell => cell === 1 ? 0 : 1));
    data[map.initialY][map.initialX] = 2;

    data = data[0].map((_, colIndex) => data.map(row => row[colIndex]));

    return data;
}

function pickColor() {
    let colors = ['#00c040', '#c00040', '#4040c0', '#c0c000', '#00c0c0', '#c040c0'];
    let color = colors[Math.floor(Math.random() * colors.length)];
    return color;
}
function pickMap() {
    var data = maps.length > 0 ? fixMap(maps[Math.floor(Math.random() * maps.length)]) : generateMaze(Math.floor(Math.random() * 20), Math.floor(Math.random() * 20));

    const coords = [];
    for (let x = 0; x < data.length; x++) {
        for (let y = 0; y < data[x].length; y++) {
            if (data[x][y] === 0) coords.push({ x, y });
        }
    }

    if (coords.length > 0 && Math.random() > 0.3) {
        const randomOne = coords[Math.floor(Math.random() * coords.length)];
        powerupMap[`${randomOne.x}|${randomOne.y}`] = Object.keys(powerups)[Math.floor(Math.random() * Object.keys(powerups).length)];
    }
    
    return data;
}
function setupMap(maze, color) {
    let mazeSprites = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            let sprite;
            if (maze[y][x] === 0) {
                let extra = [];
                if(powerupMap[`${x}|${y}`] !== undefined) {
                    extra = powerups[powerupMap[`${x}|${y}`]].rnd;
                }
                sprite = lib.sprites.createNew(x * 20, y * 20, renderer('#383e47', extra));
                if(extra.length>0) sprite.zIndex = 100;
            }
            if (maze[y][x] === 2) {
                sprite = lib.sprites.createNew(x * 20, y * 20, renderer(color));
            }
            if (!sprite) continue;
            sprite.props.status = maze[y][x] === 0 ? 'unpainted' : 'painted';
            mazeSprites.push(sprite);
        }
    }
    return mazeSprites;
}

function getBallXY(maze) {
    let ballX = maze.findIndex(row => row.includes(2));
    let ballY = maze[ballX].indexOf(2);
    return [ballX, ballY];
}

function makeBall(maze, color) {
    let ballPos = getBallXY(maze);
    let ballX = ballPos[0];
    let ballY = ballPos[1];
    return lib.sprites.createNew(ballY * 20 + 10, ballX * 20 + 10, SimpleRenderers.combination(
        SimpleRenderers.rectangle(20, 20, color, { x: -10, y: -10 }),
        SimpleRenderers.circle(8, '#fff')
    ));
}

let powerups = {
    '200pts': {
        rnd: [
            SimpleRenderers.roundedRectangle(18, 18, 4, "#ffff00", {x: 1, y: 1}),
            SimpleRenderers.text("200", 10, "Arial", "#000", {x: 1, y: 14})
        ],
        pickup: () => {
            
        }
    }
}
let powerupMap = {};

function start() {
    let color, maze, mazeSprites, ball, gridX, gridY;
    function setup() {
        powerupMap = {};
        color = pickColor();
        maze = pickMap();
        mazeSprites = setupMap(maze, color);
        console.log(maze, mazeSprites);

        ball = makeBall(maze, color);

        gridX = (ball.x - 10) / 20;
        gridY = (ball.y - 10) / 20;
    }
    function reset() {
        mazeSprites.forEach(s => lib.sprites.remove(s));
        if (ball) lib.sprites.remove(ball);
    }
    setup();

    lib.world.setBackgroundColor('#21252b');

    const TILE = 20;
    const TOTAL_STEPS = 10;

    let currentDir = null;
    let queuedDir = null;
    let moving = false;

    function hasTile(x, y) {
        return mazeSprites.find(s =>
            s.x === x * TILE &&
            s.y === y * TILE
        );
    }

    function getRunLength(dx, dy) {
        let length = 0;
        while (hasTile(gridX + dx * (length + 1), gridY + dy * (length + 1))) {
            length++;
        }
        return length;
    }

    async function moveLine(dx, dy) {
        const run = getRunLength(dx, dy);
        if (run === 0) return false;

        const totalDistance = run * TILE;
        const stepDistance = totalDistance / TOTAL_STEPS;

        for (let i = 0; i < TOTAL_STEPS; i++) {
            ball.x += dx * stepDistance;
            ball.y += dy * stepDistance;
            await new Promise(r => setTimeout(r, 16));
        }

        // Update grid position
        for (let i = 1; i <= run; i++) {
            const tile = hasTile(gridX + dx * i, gridY + dy * i);
            if (tile) {
                tile.renderer = renderer(color);
                tile.props.status = 'painted';

                // check x/y for powerup
                if (powerupMap[`${gridX + dx * i}|${gridY + dy * i}`] !== undefined) {
                    powerups[(powerupMap[`${gridX + dx * i}|${gridY + dy * i}`])].pickup();
                    powerupMap[`${gridX + dx * i}|${gridY + dy * i}`] = undefined;
                }
            }
        }

        gridX += dx * run;
        gridY += dy * run;

        ball.x = gridX * TILE + 10;
        ball.y = gridY * TILE + 10;

        if (mazeSprites.every(s => s.props.status === 'painted')) {
            // win
            setTimeout(() => {
                reset();
                setTimeout(setup, 100);
            }, 100);
        }

        return true;
    }

    async function movementLoop() {
        if (moving) return;
        moving = true;

        while (true) {

            if (queuedDir) {
                currentDir = queuedDir;
                queuedDir = null;
            }

            if (!currentDir) break;

            const moved = await moveLine(currentDir.dx, currentDir.dy);
            if (!moved) break;
        }

        moving = false;
    }

    function queueDirection(dx, dy) {
        queuedDir = { dx, dy };
        movementLoop();
    }

    lib.experiments.importCSS("https://legacy.klash.dev/legacy.css");

    function textR(opacity) {
        return SimpleRenderers.combination(
            SimpleRenderers.text('Use WASD, mouse, or arrows to move', 14, "KlashLegacy", "#000000", { filter: `opacity(${opacity / 1}) blur(5px)`, x: 0, y: 0 }),
            SimpleRenderers.text('Use WASD, mouse, or arrows to move', 14, "KlashLegacy", "#ffffff", { filter: `opacity(${opacity / 1})`, x: 0, y: 0 }),
            SimpleRenderers.text('Press R to skip level', 14, "KlashLegacy", "#000000", { filter: `opacity(${opacity / 1}) blur(5px)`, x: 0, y: 14 }),
            SimpleRenderers.text('Press R to skip level', 14, "KlashLegacy", "#ffffff", { filter: `opacity(${opacity / 1})`, x: 0, y: 14 }),
        );
    }
    let text = lib.sprites.createNew(10, 20, textR(1));
    text.zIndex = 1000;

    let permaText = lib.sprites.createNew(4, 414, SimpleRenderers.text('paintmaze.js | Hydra clone of AMAZE', 14, "KlashLegacy", "#ffffff", { x: 0, y: 0 }));
    permaText.zIndex = 1000;

    let tick = 0;
    let textOpacity = 1;

    let mouseStuff = {};
    lib.listen.addTicker(() => {
        tick++;
        if (text && tick > 60) {
            text.renderer = textR(textOpacity);
            textOpacity -= 0.04;
            if (textOpacity < 0) {
                textOpacity = 0;
                lib.sprites.remove(text);
            }
        }

        if (!ball) return;
        if (lib.listen.onKeyDown('r')) {
            reset();
            setTimeout(setup, 100);
        }
        if (lib.listen.isKey('w') || lib.listen.isKey('ArrowUp')) queueDirection(0, -1);
        if (lib.listen.isKey('s') || lib.listen.isKey('ArrowDown')) queueDirection(0, 1);
        if (lib.listen.isKey('a') || lib.listen.isKey('ArrowLeft')) queueDirection(-1, 0);
        if (lib.listen.isKey('d') || lib.listen.isKey('ArrowRight')) queueDirection(1, 0);

        let mousePos = lib.listen.mouseScreen();
        if (lib.listen.isMouseDown()) {
            if (!mouseStuff.down) {
                mouseStuff.down = true;
                mouseStuff.start = mousePos;
            } else {
                let dx = mousePos.x - mouseStuff.start.x;
                let dy = mousePos.y - mouseStuff.start.y;
                if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        queueDirection(dx > 0 ? 1 : -1, 0);
                    } else {
                        queueDirection(0, dy > 0 ? 1 : -1);
                    }
                    mouseStuff.start = mousePos;
                }
            }
        } else {
            mouseStuff.down = false;
        }
    });

    lib.loop(30);
}
