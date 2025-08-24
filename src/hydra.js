if (window.hydraLibVersion) {
    throw new Error('Hydra is already installed - check for dual imports.');
}

function getAxes(vertices) {
    let axes = [];
    for (let i = 0; i < vertices.length; i++) {
        let current = vertices[i];
        let next = vertices[(i + 1) % vertices.length];
        let edge = { x: next.x - current.x, y: next.y - current.y };
        axes.push({ x: -edge.y, y: edge.x }); // perpendicular
    }
    return axes;
}

function projectVertices(vertices, axis) {
    let min = Infinity, max = -Infinity;
    for (let vertex of vertices) {
        let projection = vertex.x * axis.x + vertex.y * axis.y;
        min = Math.min(min, projection);
        max = Math.max(max, projection);
    }
    return { min, max };
}

var showOnscreenDebugger = false;
class HydraSpriteRenderer {
    constructor(render, params, shouldRender = () => true) {
        this.renderFunc = render;
        this.renderParams = params;
        this.shouldRender = shouldRender;
    }

    call(ctx, sprite) {
        this.renderFunc(ctx, sprite, this.renderParams);
    }

    withShouldRender(shouldRender) {
        this.shouldRender = shouldRender;
        return this;
    }
}
window.invertColor = function (hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF';
};
class SimpleRenderers {
    static rectangle(width, height, color, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.fillRect(-params.width / 2, -params.height / 2, params.width, params.height);
            ctx.restore();
        }, { width, height, color, offset });
    }

    static none() {
        return new HydraSpriteRenderer(() => { }, {}, () => false);
    }

    static roundedRectangle(width, height, radius, color, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.moveTo(-params.width / 2 + params.radius, -params.height / 2);
            ctx.lineTo(params.width / 2 - params.radius, -params.height / 2);
            ctx.quadraticCurveTo(params.width / 2, -params.height / 2, params.width / 2, -params.height / 2 + params.radius);
            ctx.lineTo(params.width / 2, params.height / 2 - params.radius);
            ctx.quadraticCurveTo(params.width / 2, params.height / 2, params.width / 2 - params.radius, params.height / 2);
            ctx.lineTo(-params.width / 2 + params.radius, params.height / 2);
            ctx.quadraticCurveTo(-params.width / 2, params.height / 2, -params.width / 2, params.height / 2 - params.radius);
            ctx.lineTo(-params.width / 2, -params.height / 2 + params.radius);
            ctx.quadraticCurveTo(-params.width / 2, -params.height / 2, -params.width / 2 + params.radius, -params.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }, { width, height, radius, color, offset });
    }

    static circle(radius, color, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(0, 0, params.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }, { radius, color, offset });
    }

    static image(image, width, height, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.drawImage(params.image, -params.width / 2, -params.height / 2, params.width, params.height);
            ctx.restore();
        }, { image, width, height, offset });
    }

    static triangle(width, height, spikePoint = 50, color, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.moveTo(-params.width / 2, params.height / 2);
            ctx.lineTo(params.width / 2, params.height / 2);
            ctx.lineTo((spikePoint / 100 * params.width) - params.width / 2, -params.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }, { width, height, spikePoint, color, offset });
    }

    static pixelMap(width, height, gridWidth, gridHeight, map, colors, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            for (let i = 0; i < params.gridHeight; i++) {
                for (let j = 0; j < params.gridWidth; j++) {
                    const colorKey = params.map[i][j];
                    ctx.fillStyle = params.colors[colorKey];
                    ctx.fillRect(-params.width / 2 + j * (params.width / params.gridWidth) - j, -params.height / 2 + i * (params.height / params.gridHeight) - i, params.width / params.gridWidth, params.height / params.gridHeight);
                }
            }
            ctx.restore();
        }, { width, height, gridWidth, gridHeight, map, colors, offset });
    }

    static smileyFace(radius, color, pupilColor = '#444', offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.radius, sprite.y + params.offset.y + params.radius);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(params.radius / 2 + 20, params.radius / 2 + 5, params.radius / 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(params.radius / 2 + 5, params.radius / 2 + 5, params.radius / 5, 0, 2 * Math.PI);
            ctx.fill();

            if (params.pupilColor && params.pupilColor !== 'none') {
                ctx.fillStyle = params.pupilColor;
                ctx.beginPath();
                ctx.arc(params.radius / 2 + 20, params.radius / 2 + 5, params.radius / 10, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(params.radius / 2 + 5, params.radius / 2 + 5, params.radius / 10, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.strokeStyle = params.color;
            ctx.beginPath();
            ctx.arc(params.radius, params.radius, params.radius / 2, 0, Math.PI);
            ctx.stroke();
            ctx.restore();
        }, { radius, color, pupilColor, offset });
    }

    static combination(...renderers) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            for (const renderer of params.renderers) {
                if (renderer.shouldRender()) {
                    renderer.call(ctx, sprite);
                }
            }
        }, { renderers });
    }
    static combinationWithOffset(offset, ...renderers) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            for (const renderer of params.renderers) {
                if (renderer.shouldRender()) {
                    renderer.call(ctx, { x: 0, y: 0 });
                }
            }
            ctx.restore();
        }, { offset, renderers });
    }

    static vertex(color = '#000', size = 5, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(0, 0, params.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }, { color, size, offset });
    }

    static line(x2, y2, color = '#000', width = 1, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.strokeStyle = params.color;
            ctx.lineWidth = params.width;
            ctx.beginPath();
            ctx.moveTo(sprite.x, sprite.y);
            ctx.lineTo(params.x2, params.y2);
            ctx.stroke();
            ctx.restore();
        }, { x2, y2, color, width, offset });
    }

    static polygon(vertices, color = '#000', offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.moveTo(params.vertices[0].x, params.vertices[0].y);
            for (let i = 1; i < params.vertices.length; i++) {
                ctx.lineTo(params.vertices[i].x, params.vertices[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }, { vertices, color, offset });
    }

    static star(spikes, outerRadius, innerRadius, color = '#000', offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            let rotation = Math.PI / 2 * 3;
            let step = Math.PI / params.spikes;
            ctx.moveTo(0, -params.outerRadius);
            for (let i = 0; i < params.spikes; i++) {
                ctx.lineTo(Math.cos(rotation) * params.outerRadius, Math.sin(rotation) * params.outerRadius);
                rotation += step;
                ctx.lineTo(Math.cos(rotation) * params.innerRadius, Math.sin(rotation) * params.innerRadius);
                rotation += step;
            }
            ctx.lineTo(0, -params.outerRadius);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }, { spikes, outerRadius, innerRadius, color, offset });
    }

    static text(text, fontSize, fontName, color, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }, weight = 'none', letterSpacing = '0px') {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
            ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
            ctx.font = `${params.weight === 'none' ? '' : params.weight + ' '}${params.fontSize}px ${params.fontName}`;
            ctx.letterSpacing = params.letterSpacing;
            ctx.fillStyle = params.color;
            ctx.fillText(typeof params.text === 'function' ? params.text() : params.text, 0, 0);
            ctx.restore();
        }, { text, fontSize, fontName, color, offset, letterSpacing, weight });
    }
}

class SimpleCheats {
    static hydraDebug(lib) {
        lib.sprites.createNew(20, 40, SimpleRenderers.text(`Running on Hydra v${window.hydraLibVersion}`, 20, 'Arial', '#ddd')
            .withShouldRender(() => showOnscreenDebugger));
        lib.listen.addTicker((deltaTime) => {
            showOnscreenDebugger = (lib.listen.isKey('`'));
        });
    }
}
const hydraDefaultProps = { enableExperimentalDPR: true, canvasWidth: 800, canvasHeight: 600 };
class HydraCanvasLib {
    constructor(canvasId, props = hydraDefaultProps) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = props.canvasWidth || 800;
        this.canvas.height = props.canvasHeight || 600;
        if (props.enableExperimentalDPR) {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = props.canvasWidth * dpr;
            this.canvas.height = props.canvasHeight * dpr;
            this.ctx.scale(dpr, dpr);
        }
        this.props = props;
        this.shutoff = false;
        this.resize = (w, h) => {
            props.canvasWidth = w;
            props.canvasHeight = h;
            this.canvas.width = w;
            this.canvas.height = h;
            if (props.enableExperimentalDPR) {
                const dpr = window.devicePixelRatio || 1;
                this.canvas.width = w * dpr;
                this.canvas.height = h * dpr;
                this.ctx.scale(dpr, dpr);
            }
        }
        this.utility = {
            ease: (amount, duration, callback) => {
                let start = null;
                const step = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const delta = Math.min(progress / duration, 1);
                    callback(amount * delta);
                    if (progress < duration) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            },
            getPixelColorAt: (x, y) => {
                const imageData = this.ctx.getImageData(x, y, 1, 1).data;
                return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
            },
            keepSpriteInBounds: (sprite, boundGap = 0) => {
                if (sprite.x < -boundGap) sprite.x = -boundGap;
                if (sprite.y < -boundGap) sprite.y = -boundGap;
                if (!sprite.collider) {
                    if (sprite.x > this.canvas.width - boundGap) sprite.x = this.canvas.width - boundGap;
                    if (sprite.y > this.canvas.height - boundGap) sprite.y = this.canvas.height - boundGap;
                } else {
                    sprite.collider.keepInBounds(boundGap, this.canvas, sprite);
                }
            },
            keepAllSpritesInBounds: (boundGap = 0) => {
                for (const sprite of this.sprites.sprites) {
                    this.utility.keepSpriteInBounds(sprite, boundGap);
                }
            },
            getScreenCenter: () => {
                const dpr = (this.props.enableExperimentalDPR ? window.devicePixelRatio : 0.5) || 1;
                return { x: this.canvas.width / (2 * dpr), y: this.canvas.height / (2 * dpr) };
            },
            getScreenSize: () => {
                const dpr = (this.props.enableExperimentalDPR ? window.devicePixelRatio : 1) || 1;
                return { width: this.canvas.width / dpr, height: this.canvas.height / dpr };
            },
            drawColliderGizmos: (sprite, color = 'red', width = 1) => {
                if (sprite.collider) {
                    sprite.collider.drawGizmos(this.ctx, sprite, color, width);
                }
            },
            createLinearGradient: (x0, y0, x1, y1, colorStops) => {
                const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
                for (const stop of colorStops) {
                    gradient.addColorStop(stop.offset, stop.color);
                }
                return gradient;
            },
            createRadialGradient: (x0, y0, r0, x1, y1, r1, colorStops) => {
                const gradient = this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
                for (const stop of colorStops) {
                    gradient.addColorStop(stop.offset, stop.color);
                }
                return gradient;
            },
            getStringWidth(text, fontSize, fontName) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = props.canvasWidth || 800;
                tempCanvas.height = props.canvasHeight || 600;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.font = `${fontSize}px ${fontName}`;
                return tempCtx.measureText(text).width;
            }
        };
        this.data = {
            createStorage(key, defaultValue = {}) {
                const storage = {
                    key, data: defaultValue, set(k, v) {
                        this.data[k] = v;
                        this.saveData();
                    }, get(k) {
                        return this.data[k];
                    }, remove(k) {
                        delete this.data[k];
                        this.saveData();
                    }, saveData() {
                        window.localStorage.setItem(key, JSON.stringify(this.data));
                    }, refreshData() {
                        if (!window.localStorage.getItem(key)) {
                            this.data = defaultValue;
                            this.saveData();
                        } else {
                            this.data = JSON.parse(window.localStorage.getItem(key));
                        }
                    }
                };
                storage.refreshData();
                return storage;
            }
        }
        this.experiments = {
            importCSS: (src, addParameters = true) => {
                var link = document.createElement('link');
                link.href = `${src}` + (addParameters && `${src.includes('?') ? '&hydra-import' : '?hydra-import'}`);
                link.rel = "stylesheet";
                link.classList.add('hydra-css');
                document.head.appendChild(link);
                return {
                    remove: () => {
                        link.remove();
                    }
                }
            },
            createNoiseRenderer: (width, height, colors = [{
                r: 0, g: 0, b: 0, a: 1
            }, {
                r: 255, g: 255, b: 255, a: 1
            }], offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) => {
                return new HydraSpriteRenderer((ctx, sprite, params) => {
                    // for each pixel pick a color somewhere between the two colors
                    ctx.save();
                    ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
                    if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
                    ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
                    for (let i = 0; i < params.height; i++) {
                        for (let j = 0; j < params.width; j++) {
                            const colorIndex = Math.floor(Math.random() * params.colors.length);
                            const color = params.colors[colorIndex];
                            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                            ctx.fillRect(j, i, 1, 1);
                        }
                    }
                    ctx.restore();
                }, { width, height, colors, offset });
            }
        }
        this.tileset = {
            createTileset(imageUrl, tileWidth, tileHeight) {
                const tileset = {
                    imageUrl: imageUrl,
                    tileWidth: tileWidth,
                    tileHeight: tileHeight,
                    tileImageCache: {},
                    getTileRenderer(tileX, tileY, width = tileWidth, height = tileHeight, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
                        const actualTileX = tileX * tileWidth;
                        const actualTileY = tileY * tileHeight;

                        var image;
                        if (this.tileImageCache[imageUrl]) {
                            image = this.tileImageCache[imageUrl];
                        } else {
                            image = new Image();
                            image.src = imageUrl;
                            image.width = width;
                            image.height = height;
                            this.tileImageCache[imageUrl] = image;
                        }

                        return new HydraSpriteRenderer((ctx, sprite, params) => {
                            ctx.save();
                            ctx.imageSmoothingEnabled = false;
                            ctx.imageSmoothingQuality = 'low';
                            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
                            if (params.offset.rotation) {
                                ctx.rotate(params.offset.rotation * Math.PI / 180);
                            }
                            ctx.filter = (params.offset && params.offset.filter) ?
                                (params.offset.filter) : 'none';
                            ctx.drawImage(
                                params.image,
                                params.actualTileX, params.actualTileY, params.tileWidth, params.tileHeight,
                                -params.width / 2, -params.height / 2, params.width, params.height
                            );
                            ctx.restore();
                        }, { image, actualTileX, actualTileY, tileWidth, tileHeight, width, height, offset });
                    }
                };
                return tileset;
            },
            createTilemap(tileset, map, tileSize, offset = { x: 0, y: 0, rotation: 0, filter: 'none' }) {
                return {
                    tileset, map, tileSize, offset,
                    renderer: new HydraSpriteRenderer((ctx, sprite, params) => {
                        ctx.save();
                        ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
                        if (params.offset.rotation) { ctx.rotate(params.offset.rotation * Math.PI / 180); }
                        ctx.filter = (params.offset && params.offset.filter) ? params.offset.filter : 'none';
                        for (let i = 0; i < params.map.length; i++) {
                            for (let j = 0; j < params.map[i].length; j++) {
                                const tile = params.map[i][j];
                                if (tile == null) continue;
                                const tileRenderer = tileset.getTileRenderer(tile[0], tile[1], params.tileSize, params.tileSize);
                                tileRenderer.call(ctx, { x: j * params.tileSize, y: i * params.tileSize });
                            }
                        }
                        ctx.restore();
                    }, { tileset, map, tileSize, offset }),
                    collider: {
                        type: 'tilemap',
                        drawGizmos(ctx, sprite, color = 'red', width = 1) {
                            // ctx.strokeStyle = color;
                            // ctx.lineWidth = width;
                            // for (let i = 0; i < map.length; i++) {
                            //     for (let j = 0; j < map[i].length; j++) {
                            //         const tile = map[i][j];
                            //         if(tile == null) continue;
                            //         ctx.strokeRect(sprite.x + offset.x + j * tileSize, sprite.y + offset.y + i * tileSize, tileSize, tileSize);
                            //     }
                            // }
                            ctx.strokeStyle = color;
                            ctx.lineWidth = width;
                            for (let i = 0; i < map.length; i++) {
                                for (let j = 0; j < map[i].length; j++) {
                                    const tile = map[i][j];
                                    if (tile == null) continue;
                                    const tileX = sprite.x + offset.x + j * tileSize;
                                    const tileY = sprite.y + offset.y + i * tileSize;
                                    ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                                }
                            }
                        },
                        checkCollision(sprite) {
                            let collision = false;
                            for (let i = 0; i < map.length; i++) {
                                for (let j = 0; j < map[i].length; j++) {
                                    const tile = map[i][j];
                                    if (tile == null) continue;
                                    const tileX = offset.x + j * tileSize;
                                    const tileY = offset.y + i * tileSize;
                                    if (lib.collision.checkCollision(sprite, { x: tileX, y: tileY, collider: { type: 'square', width: tileSize, height: tileSize, offset: { x: 0, y: 0 } } })) {
                                        collision = true;
                                        break;
                                    }
                                }
                                if (collision) break;
                            }
                            return collision;
                        }
                    }
                }
            }
        };
        this.sounds = {
            createSFX: (src) => {
                let audio = new Audio(src);
                return {
                    play: () => {
                        audio.currentTime = 0;
                        audio.play();
                        return {
                            then: (callback) => {
                                audio.onended = callback;
                            }
                        };
                    },
                    pause: () => {
                        audio.pause();
                    },
                    stop: () => {
                        audio.pause();
                        audio.currentTime = 0;
                    },
                    setVolume: (volume) => {
                        audio.volume = volume;
                    },
                    setLoop: (loop) => {
                        audio.loop = loop;
                    },
                    setPlaybackRate: (rate) => {
                        audio.playbackRate = rate;
                    },
                    setMuted: (muted) => {
                        audio.muted = muted;
                    },
                    isPlaying: () => {
                        return !audio.paused;
                    },
                    isPaused: () => {
                        return audio.paused;
                    },
                    isEnded: () => {
                        return audio.ended;
                    },
                    editAudio: (callback) => {
                        var l = callback(audio);
                        if (l && l instanceof Audio) {
                            audio = l;
                        }
                    },
                    onEnd: (callback) => {
                        audio.onended = () => {
                            callback();
                        }
                    },
                    src
                };
            }
        };
        this.collision = (function (thiz) {
            return {
                makeSquareCollider(initalWidth, initialHeight, initialOffset = { x: 0, y: 0 }) {
                    return {
                        type: 'square',
                        width: initalWidth, height: initialHeight, offset: initialOffset,
                        keepInBounds(boundGap, canvas, sprite) {
                            if (sprite.x + this.width > canvas.width + boundGap) sprite.x = canvas.width - this.width + boundGap;
                            if (sprite.y + this.height > canvas.height + boundGap) sprite.y = canvas.height - this.height + boundGap;
                        },
                        drawGizmos(ctx, sprite, color = "red", width = 1) {
                            ctx.strokeStyle = color;
                            ctx.lineWidth = width;
                            ctx.strokeRect(sprite.x + this.offset.x, sprite.y + this.offset.y, this.width, this.height);
                        },
                        isMouseTouching(sprite, canvas, mouseX, mouseY) {
                            const rect = canvas.getBoundingClientRect();
                            var canvasX = mouseX - rect.left;
                            var canvasY = mouseY - rect.top;

                            if (thiz.props.enableExperimentalDPR) {
                                const dpr = window.devicePixelRatio || 1;
                                canvasX = canvasX / dpr;
                                canvasY = canvasY / dpr;
                            }

                            const spriteLeft = sprite.x + this.offset.x;
                            const spriteRight = spriteLeft + this.width;
                            const spriteTop = sprite.y + this.offset.y;
                            const spriteBottom = spriteTop + this.height;

                            const touching = (
                                canvasX >= spriteLeft &&
                                canvasX <= spriteRight &&
                                canvasY >= spriteTop &&
                                canvasY <= spriteBottom
                            );

                            return touching;
                        }
                    };
                },
                makeCircleCollider(radius, offset = { x: 0, y: 0 }) {
                    return {
                        type: 'circle',
                        radius: radius, offset: offset,
                        keepInBounds(boundGap, canvas, sprite) {
                            if (sprite.x + this.radius > canvas.width + boundGap) sprite.x = canvas.width - this.radius + boundGap;
                            if (sprite.y + this.radius > canvas.height + boundGap) sprite.y = canvas.height - this.radius + boundGap;
                            if (sprite.x - this.radius < -boundGap) sprite.x = -this.radius - boundGap;
                            if (sprite.y - this.radius < -boundGap) sprite.y = -this.radius - boundGap;
                        },
                        drawGizmos(ctx, sprite, color = "red", width = 1) {
                            ctx.strokeStyle = color;
                            ctx.lineWidth = width;
                            ctx.beginPath();
                            ctx.arc(sprite.x + this.offset.x, sprite.y + this.offset.y, this.radius, 0, 2 * Math.PI);
                            ctx.stroke();
                        },
                        isMouseTouching(sprite, canvas, mouseX, mouseY) {
                            const rect = canvas.getBoundingClientRect();
                            let canvasX = mouseX - rect.left;
                            let canvasY = mouseY - rect.top;

                            if (window.devicePixelRatio && thiz.props.enableExperimentalDPR) {
                                const dpr = window.devicePixelRatio;
                                canvasX /= dpr;
                                canvasY /= dpr;
                            }

                            const spriteCenterX = sprite.x + this.offset.x;
                            const spriteCenterY = sprite.y + this.offset.y;
                            const distance = Math.sqrt(
                                Math.pow(canvasX - spriteCenterX, 2) +
                                Math.pow(canvasY - spriteCenterY, 2)
                            );
                            return distance <= this.radius;
                        }
                    };
                },
                checkCollision(sprite1, sprite2) {
                    if (sprite1.collider == null || sprite2.collider == null) {
                        return false;
                    }
                    switch (`${sprite1.collider.type || 'none'}-${sprite2.collider.type || 'none'}`) {
                        case 'square-square':
                            var s1x = sprite1.x + sprite1.collider.offset.x;
                            var s1y = sprite1.y + sprite1.collider.offset.y;
                            var s1w = sprite1.collider.width;
                            var s1h = sprite1.collider.height;
                            var s2x = sprite2.x + sprite2.collider.offset.x;
                            var s2y = sprite2.y + sprite2.collider.offset.y;
                            var s2w = sprite2.collider.width;
                            var s2h = sprite2.collider.height;
                            return s1x < s2x + s2w &&
                                s1x + s1w > s2x &&
                                s1y < s2y + s2h &&
                                s1y + s1h > s2y;
                            break;
                        case 'square-tilemap':
                        case 'tilemap-square':
                            var tilemap = sprite1.collider.type === 'tilemap' ? sprite1 : sprite2;
                            var sprite = sprite1.collider.type === 'tilemap' ? sprite2 : sprite1
                            if (tilemap.collider.type !== 'tilemap') {
                                throw new Error("Cannot check tilemap to square collision");
                            }
                            var tileSize = tilemap.tileSize;
                            var spriteX = sprite.x + sprite.collider.offset.x;
                            var spriteY = sprite.y + sprite.collider.offset.y;
                            var spriteWidth = sprite.collider.width;
                            var spriteHeight = sprite.collider.height;
                            for (let i = 0; i < tilemap.map.length; i++) {
                                for (let j = 0; j < tilemap.map[i].length; j++) {
                                    const tile = tilemap.map[i][j];
                                    if (tile == null) continue;
                                    const tileX = j * tileSize;
                                    const tileY = i * tileSize;
                                    const tileWidth = tileSize;
                                    const tileHeight = tileSize;
                                    if (spriteX < tileX + tileWidth &&
                                        spriteX + spriteWidth > tileX &&
                                        spriteY < tileY + tileHeight &&
                                        spriteY + spriteHeight > tileY) {
                                        return true; // Collision detected
                                    }
                                }
                            }
                            return false; // No collision detected
                            break;
                        case 'circle-circle':
                            var dx = (sprite1.x + sprite1.collider.offset.x) - (sprite2.x + sprite2.collider.offset.x);
                            var dy = (sprite1.y + sprite1.collider.offset.y) - (sprite2.y + sprite2.collider.offset.y);
                            var distance = Math.sqrt(dx * dx + dy * dy);
                            return distance < (sprite1.collider.radius + sprite2.collider.radius);
                            break;
                        case 'circle-square':
                        case 'square-circle':
                            var circle = sprite1.collider.type === 'circle' ? sprite1 : sprite2;
                            var square = sprite1.collider.type === 'circle' ? sprite2 : sprite1;
                            var circleX = circle.x + circle.collider.offset.x;
                            var circleY = circle.y + circle.collider.offset.y;
                            var squareX = square.x + square.collider.offset.x;
                            var squareY = square.y + square.collider.offset.y;
                            var squareWidth = square.collider.width;
                            var squareHeight = square.collider.height;
                            var closestX = Math.max(squareX, Math.min(circleX, squareX + squareWidth));
                            var closestY = Math.max(squareY, Math.min(circleY, squareY + squareHeight));
                            var dx = circleX - closestX;
                            var dy = circleY - closestY;
                            return (dx * dx + dy * dy) < (circle.collider.radius * circle.collider.radius);
                            break;
                        case 'circle-tilemap':
                        case 'tilemap-circle':
                            var tilemap = sprite1.collider.type === 'tilemap' ? sprite1 : sprite2;
                            var circle = sprite1.collider.type === 'tilemap' ? sprite2 : sprite1;
                            if (tilemap.collider.type !== 'tilemap') {
                                throw new Error("Cannot check tilemap to circle collision");
                            }
                            var tileSize = tilemap.tileSize;
                            var tilemapOffsetX = tilemap.offset.x;
                            var tilemapOffsetY = tilemap.offset.y;
                            var circleX = circle.x + circle.collider.offset.x;
                            var circleY = circle.y + circle.collider.offset.y;
                            var circleRadius = circle.collider.radius;
                            for (let i = 0; i < tilemap.map.length; i++) {
                                for (let j = 0; j < tilemap.map[i].length; j++) {
                                    const tile = tilemap.map[i][j];
                                    if (tile == null) continue;
                                    const tileX = tilemapOffsetX + j * tileSize;
                                    const tileY = tilemapOffsetY + i * tileSize;
                                    const tileWidth = tileSize;
                                    const tileHeight = tileSize;
                                    const closestX = Math.max(tileX, Math.min(circleX, tileX + tileWidth));
                                    const closestY = Math.max(tileY, Math.min(circleY, tileY + tileHeight));
                                    const dx = circleX - closestX;
                                    const dy = circleY - closestY;
                                    if ((dx * dx + dy * dy) < (circleRadius * circleRadius)) {
                                        return true; // Collision detected
                                    }
                                }
                            }
                            return false; // No collision detected
                        case 'tilemap-tilemap':
                            throw new Error("Cannot check tilemap to tilemap collision");
                            break;
                        default:
                            throw new Error("Unknown collider type " + sprite1.collider.type + " or " + sprite2.collider.type);
                    }
                },
                isMouseTouching(sprite) {
                    if (sprite.collider) {
                        return sprite.collider.isMouseTouching(sprite, thiz.canvas, thiz.listen.mouse.x, thiz.listen.mouse.y);
                    }
                }
            }
        })(this);
        this.sprites = {
            sprites: [],
            createNew(x, y, renderer) {
                const sprite = { x, y, renderer, props: {}, zIndex: 1, collider: null };
                this.sprites.push(sprite);
                return sprite;
            },
            remove(sprite) {
                const index = this.sprites.indexOf(sprite);
                if (index > -1) {
                    this.sprites.splice(index, 1);
                }
            },
            moveBy(sprite, dx = 0, dy = 0) {
                sprite.x += dx;
                sprite.y += dy;
            },
            glideTo(sprite, x, y, duration) {
                this.utility.ease(duration, duration, (delta) => {
                    sprite.x = x * delta;
                    sprite.y = y * delta;
                });
            }
        };
        this.listen = (function (thiz) {
            return {
                keys: {},
                keyDowns: {},
                tickers: [],
                mouse: { x: 0, y: 0 },
                mouseScreen() {
                    const rect = thiz.canvas.getBoundingClientRect();
                    let mouseX = this.mouse.x - rect.left;
                    let mouseY = this.mouse.y - rect.top;

                    if (thiz.props.enableExperimentalDPR) {
                        const dpr = window.devicePixelRatio || 1;
                        mouseX /= dpr;
                        mouseY /= dpr;
                    }

                    return { x: mouseX, y: mouseY };
                },
                isKey(key) {
                    return !!this.keys[key];
                },
                isManyKeys(...keys) {
                    return keys.every(key => this.isKey(key));
                },
                onKeyDown(key) {
                    if (this.keyDowns[key]) {
                        this.keyDowns[key] = false;
                        return true;
                    }
                    return false;
                },
                addTicker(callback) {
                    var uuid = Math.random().toString(36).substring(7);
                    this.tickers.push({ uuid, callback });
                    return uuid;
                },
                removeTicker(uuid) {
                    const index = this.tickers.findIndex(t => t.uuid === uuid);
                    if (index !== -1) {
                        this.tickers.splice(index, 1);
                        return true;
                    }
                    return false;
                },
                isMouseDown() {
                    return this.keys['Mouse1'];
                }
            };
        })(this);
        this.world = {
            effects: {
                vingette: {
                    enabled: false,
                    color: 'rgb(0, 0, 0)',
                    opacity: 0.5
                },
                bloom: {
                    enabled: false,
                    intensity: 0.5,
                    color: 'rgb(255, 255, 255)',
                    threshold: 0.8,
                    radius: 10
                }
            },
            _drawEffects(canvas) {
                const ctx = canvas.getContext('2d');

                if (this.effects.vingette.enabled) {
                    const gradient = ctx.createRadialGradient(
                        canvas.width / 2, canvas.height / 2, 0,
                        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
                    );
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    gradient.addColorStop(1, this.effects.vingette.color);

                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = this.effects.vingette.opacity;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = 1.0;
                }

                if (this.effects.bloom.enabled) {
                    if (this.background.startsWith('url')) {
                        throw new Error("Hydra (world > effects) Bloom can't be rendered with crossorigin images (can't get image data)");
                    }
                    // make fake canvas
                    const offscreenCanvas = document.createElement('canvas');
                    const dpr = props.enableExperimentalDPR ? (window.devicePixelRatio || 1) : 1;
                    offscreenCanvas.width = canvas.width;
                    offscreenCanvas.height = canvas.height;
                    const offscreenCtx = offscreenCanvas.getContext('2d');
                    if (props.enableExperimentalDPR) {
                        offscreenCtx.scale(dpr, dpr);
                    }
                    offscreenCtx.drawImage(canvas, 0, 0, canvas.width / dpr, canvas.height / dpr);

                    // make sure light areas are isolated (using threshold)
                    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        if (brightness < this.effects.bloom.threshold * 255) {
                            data[i + 3] = 0; // bye bye dark pixels
                        } else {
                            // intensify bloom. color must be in "rgb(r,g,b)" format!
                            const color = this.effects.bloom.color.match(/\d+/g).map(Number);
                            data[i] = color[0] * this.effects.bloom.intensity;
                            data[i + 1] = color[1] * this.effects.bloom.intensity;
                            data[i + 2] = color[2] * this.effects.bloom.intensity;
                            data[i + 3] = 255;
                        }
                    }

                    offscreenCtx.putImageData(imageData, 0, 0);

                    // apply a blur filter for that bloom effect.
                    offscreenCtx.filter = `blur(${this.effects.bloom.radius}px)`;
                    offscreenCtx.drawImage(offscreenCanvas, 0, 0, canvas.width / dpr, canvas.height / dpr);

                    // draw the blurred canvas back to main canvas with a lighter composite operation
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width / dpr, canvas.height / dpr);
                    ctx.restore();
                }
            },
            background: '#111',
            backgroundImages: [],
            showBackground: true,
            setShowBackground(show) {
                this.showBackground = show;
            },
            setBackgroundColor(color) {
                this.background = color;
            },
            setBackgroundImage(image) {
                this.background = `url;${image}`;
            },
            render(canvas) {
                let ctx = canvas.getContext('2d');
                if (this.showBackground) {
                    if (this.background.startsWith('url')) {
                        var img;
                        if (this.backgroundImages[this.background]) {
                            img = this.backgroundImages[this.background];
                        } else {
                            img = new Image();
                            img.src = this.background.substring(4);
                            this.backgroundImages[this.background] = img;
                        }
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    } else {
                        ctx.fillStyle = this.background;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }
        }

        window.addEventListener('keydown', (e) => {
            if(this.shutoff) return;
            if (!this.listen.keys[e.key]) {
                this.listen.keyDowns[e.key] = true;
            }
            this.listen.keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            if(this.shutoff) return;
            this.listen.keys[e.key] = false;
            this.listen.keyDowns[e.key] = false;
        });
        window.addEventListener('mousedown', (e) => {
            if(this.shutoff) return;
            this.listen.keys['Mouse1'] = true;
        });
        window.addEventListener('mousemove', (e) => {
            if(this.shutoff) return;
            this.listen.mouse.x = e.clientX;
            this.listen.mouse.y = e.clientY;
        });
        window.addEventListener('mouseup', (e) => {
            if(this.shutoff) return;
            this.listen.keys['Mouse1'] = false;
        });

        SimpleCheats.hydraDebug(this);
    }

    _drawFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.world.render(this.canvas);
        this.sprites.sprites.sort((a, b) => a.zIndex - b.zIndex);
        for (const sprite of this.sprites.sprites) {
            if (sprite.renderer.shouldRender()) {
                sprite.renderer.call(this.ctx, sprite);
            }
        }
        this.world._drawEffects(this.canvas);
    }

    loop(fps = 60) {
        const interval = 1000 / fps;
        let lastTime = 0;

        const animate = (time) => {
            const deltaTime = time - lastTime;
            if (deltaTime >= interval) {
                lastTime = time;
                this._drawFrame();
                for (const ticker of this.listen.tickers) {
                    ticker.callback(deltaTime);
                }
            }
            if (!this.shutoff) {
                requestAnimationFrame(animate);
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };

        requestAnimationFrame(animate);
    }
}
window.hydraLibVersion = '0.1.1';