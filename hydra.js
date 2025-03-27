if (window.hydraLibVersion) {
    throw new Error('Hydra is already installed - check for dual imports.');
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
    static rectangle(width, height, color, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
            ctx.fillStyle = params.color;
            ctx.fillRect(-params.width / 2, -params.height / 2, params.width, params.height);
            ctx.restore();
        }, { width, height, color, offset });
    }

    static roundedRectangle(width, height, radius, color, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
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

    static circle(radius, color, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(0, 0, params.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }, { radius, color, offset });
    }

    static image(image, width, height, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
            ctx.drawImage(params.image, -params.width / 2, -params.height / 2, params.width, params.height);
            ctx.restore();
        }, { image, width, height, offset });
    }

    static triangle(width, height, spikePoint = 50, color, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
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

    static pixelMap(width, height, gridWidth, gridHeight, map, colors, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.width / 2, sprite.y + params.offset.y + params.height / 2);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
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

    static smileyFace(radius, color, pupilColor = '#444', offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x + params.radius, sprite.y + params.offset.y + params.radius);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
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
                renderer.call(ctx, sprite);
            }
        }, { renderers });
    }

    static text(text, fontSize, fontName, color, offset = { x: 0, y: 0, rotation: 0, blurAmount: 0 }, weight = 'none') {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.translate(sprite.x + params.offset.x, sprite.y + params.offset.y);
            if(params.offset.rotation){ctx.rotate(params.offset.rotation * Math.PI / 180);}
            ctx.filter = (params.offset&&params.offset.blurAmount)?(params.offset.blurAmount > 0 ? `blur(${params.offset.blurAmount}px)` : 'none'):'none';
            ctx.font = `${weight === 'none' ? '' : weight + ' '}${params.fontSize}px ${params.fontName}`;
            ctx.fillStyle = params.color;
            ctx.fillText(typeof params.text === 'function' ? params.text() : params.text, 0, 0);
            ctx.restore();
        }, { text, fontSize, fontName, color, offset });
    }
}
class SimpleCheats {
    static hydraDebug(lib) {
        lib.sprites.createNew(20, 20, SimpleRenderers.text(`Running on Hydra v${window.hydraLibVersion}`, '20px', 'Arial', 'white')
            .withShouldRender(() => showOnscreenDebugger));
        lib.listen.addTicker((deltaTime) => {
            showOnscreenDebugger = (lib.listen.isKey('`'));
        });
    }
}
const hydraDefaultProps = { enableExperimentalDPR: false, canvasWidth: 800, canvasHeight: 600 };
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
        this.shutoff = false;
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
                return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
            },
            getScreenSize: () => {
                return { width: this.canvas.width, height: this.canvas.height };
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
            }
        };
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
            }
        }
        this.sounds = {
            createSFX: (src) => {
                let audio = new Audio(src);
                return {
                    play: () => {
                        audio.currentTime = 0;
                        audio.play();
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
                    }
                };
            }
        };
        this.collision = (function (thiz) {
            return {
                makeSquareCollider(initalWidth, initialHeight, initialOffset = { x: 0, y: 0 }) {
                    return {
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
                            const canvasX = mouseX - rect.left;
                            const canvasY = mouseY - rect.top;
                            const spriteLeft = sprite.x + this.offset.x;
                            const spriteRight = spriteLeft + this.width;
                            const spriteTop = sprite.y + this.offset.y;
                            const spriteBottom = spriteTop + this.height;
                            return (
                                canvasX >= spriteLeft &&
                                canvasX <= spriteRight &&
                                canvasY >= spriteTop &&
                                canvasY <= spriteBottom
                            );
                        }
                    };
                },
                checkSquareCollision(sprite1, sprite2) {
                    const s1x = sprite1.x + sprite1.collider.offset.x;
                    const s1y = sprite1.y + sprite1.collider.offset.y;
                    const s1w = sprite1.collider.width;
                    const s1h = sprite1.collider.height;
                    const s2x = sprite2.x + sprite2.collider.offset.x;
                    const s2y = sprite2.y + sprite2.collider.offset.y;
                    const s2w = sprite2.collider.width;
                    const s2h = sprite2.collider.height;
                    return s1x < s2x + s2w &&
                        s1x + s1w > s2x &&
                        s1y < s2y + s2h &&
                        s1y + s1h > s2y;
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
                const sprite = { x, y, renderer, props: {}, collider: null };
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
        this.listen = {
            keys: {},
            keyDowns: {},
            tickers: [],
            mouse: { x: 0, y: 0 },
            isKey(key) {
                return !!this.keys[key];
            },
            isManyKeys(...keys) {
                return keys.every(key => this.isKey(key));
            },
            onKeyDown(key) {
                return !!this.keyDowns[key];
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
                    // make fake canvas
                    const offscreenCanvas = document.createElement('canvas');
                    offscreenCanvas.width = canvas.width;
                    offscreenCanvas.height = canvas.height;
                    const offscreenCtx = offscreenCanvas.getContext('2d');
                    offscreenCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

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
                    offscreenCtx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);

                    // draw the blurred canvas back to main canvas with a lighter composite operation
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                }
            },
            background: '#111',
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
                        const img = new Image();
                        img.src = this.background.substring(4);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    } else {
                        ctx.fillStyle = this.background;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }
        }

        window.addEventListener('keydown', (e) => {
            this.listen.keys[e.key] = true;
            if (!this.listen.keyDowns[e.key]) {
                this.listen.keyDowns[e.key] = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            this.listen.keys[e.key] = false;
        });
        window.addEventListener('mousedown', (e) => {
            this.listen.keys['Mouse1'] = true;
        });
        window.addEventListener('mousemove', (e) => {
            this.listen.mouse.x = e.clientX;
            this.listen.mouse.y = e.clientY;
        });
        window.addEventListener('mouseup', (e) => {
            this.listen.keys['Mouse1'] = false;
        });

        SimpleCheats.hydraDebug(this);
    }

    _drawFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.world.render(this.canvas);
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
                this.listen.keyDowns = {};
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