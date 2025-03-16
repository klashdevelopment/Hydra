if (window.hydraLibVersion) {
    throw new Error('Hydra is already installed - check for dual imports.');
}
var showOnscreenDebugger = false;
class HydraSpriteRenderer {
    constructor(render, params, shouldRender=()=>true) {
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
window.invertColor = function(hex) {
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
    static rectangle(width, height, color, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.fillStyle = params.color;
            ctx.fillRect(sprite.x + params.offset.x, sprite.y + params.offset.y, params.width, params.height);
        }, { width, height, color, offset });
    }
    static roundedRectangle(width, height, radius, color, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.moveTo(sprite.x + params.radius + params.offset.x, sprite.y + params.offset.y);
            ctx.lineTo(sprite.x + params.width - params.radius + params.offset.x, sprite.y + params.offset.y);
            ctx.quadraticCurveTo(sprite.x + params.width + params.offset.x, sprite.y + params.offset.y, sprite.x + params.width + params.offset.x, sprite.y + params.radius + params.offset.y);
            ctx.lineTo(sprite.x + params.width + params.offset.x, sprite.y + params.height - params.radius + params.offset.y);
            ctx.quadraticCurveTo(sprite.x + params.width + params.offset.x, sprite.y + params.height + params.offset.y, sprite.x + params.width - params.radius + params.offset.x, sprite.y + params.height + params.offset.y);
            ctx.lineTo(sprite.x + params.radius + params.offset.x, sprite.y + params.height + params.offset.y);
            ctx.quadraticCurveTo(sprite.x + params.offset.x, sprite.y + params.height + params.offset.y, sprite.x + params.offset.x, sprite.y + params.height - params.radius + params.offset.y);
            ctx.lineTo(sprite.x + params.offset.x, sprite.y + params.radius + params.offset.y);
            ctx.quadraticCurveTo(sprite.x + params.offset.x, sprite.y + params.offset.y, sprite.x + params.radius + params.offset.x, sprite.y + params.offset.y);
            ctx.closePath();
            ctx.fill();
        }, { width, height, radius, color, offset });
    }
    static circle(radius, color, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(sprite.x + params.offset.x, sprite.y + params.offset.y, params.radius, 0, 2 * Math.PI);
            ctx.fill();
        }, { radius, color, offset });
    }
    static blurredCircle(radius, color, blurAmount = 10, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.filter = `blur(${params.blurAmount}px)`;
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(sprite.x + params.offset.x, sprite.y + params.offset.y, params.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }, { radius, color, blurAmount, offset });
    }
    static blurredRectangle(width, height, color, blurAmount = 10, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.save();
            ctx.filter = `blur(${params.blurAmount}px)`;
            ctx.fillStyle = params.color;
            ctx.fillRect(sprite.x + params.offset.x, sprite.y + params.offset.y, params.width, params.height);
            ctx.restore();
        }, { width, height, color, blurAmount, offset });
    }
    static image(image, width, height, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.drawImage(params.image, sprite.x + offset.x, sprite.y + offset.y, params.width, params.height);
        }, { image, width, height, offset });
    }
    static smileyFace(radius, color, pupilColor='#444', offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(sprite.x + params.offset.x + params.radius / 2 + 20, sprite.y + params.offset.y + params.radius / 2 + 5, params.radius / 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(sprite.x + params.offset.x + params.radius / 2 + 5, sprite.y + params.offset.y + params.radius / 2 + 5, params.radius / 5, 0, 2 * Math.PI);
            ctx.fill();

            if (params.pupilColor && params.pupilColor !== 'none') {
                ctx.fillStyle = params.pupilColor;
                ctx.beginPath();
                ctx.arc(sprite.x + params.offset.x + params.radius / 2 + 20, sprite.y + params.offset.y + params.radius / 2 + 5, params.radius / 10, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = params.pupilColor;
                ctx.beginPath();
                ctx.arc(sprite.x + params.offset.x + params.radius / 2 + 5, sprite.y + params.offset.y + params.radius / 2 + 5, params.radius / 10, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.strokeStyle = params.color;
            ctx.beginPath();
            ctx.arc(sprite.x + params.offset.x + params.radius, sprite.y + params.offset.y + params.radius, params.radius / 2, 0, Math.PI);
            ctx.stroke();
        }, { radius, color, pupilColor, offset });
    }
    static combination(...renderers) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            for (const renderer of params.renderers) {
                renderer.call(ctx, sprite);
            }
        }, { renderers });
    }
    static text(text, fontSize, fontName, color, offset = { x: 0, y: 0 }) {
        return new HydraSpriteRenderer((ctx, sprite, params) => {
            ctx.font = `${params.fontSize}px ${params.fontName}`;
            ctx.fillStyle = params.color;
            ctx.fillText(typeof params.text === 'function' ? params.text() : params.text, sprite.x + offset.x, sprite.y + offset.y);
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
const hydraDefaultProps = {canvasWidth: 800, canvasHeight: 600};
class HydraCanvasLib {
    constructor(canvasId, props=hydraDefaultProps) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = props.canvasWidth;
        this.canvas.height = props.canvasHeight;
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
            drawColliderGizmos: (sprite, color='red', width=1) => {
                if(sprite.collider) {
                    sprite.collider.drawGizmos(this.ctx, sprite, color, width);
                }
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
                    remove: ()=>{
                        link.remove();
                    }
                }
            }
        }
        this.sounds = {
            createSFX: (src) => {
                const audio = new Audio(src);
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
                        if(l && l != null && l != undefined && l instanceof Audio) {
                            audio = l;
                        }
                    }
                };
            }
        };
        this.collision = {
            makeSquareCollider(initalWidth, initialHeight, initialOffset = { x: 0, y: 0 }) {
                return { width: initalWidth, height: initialHeight, offset: initialOffset,
                    keepInBounds(boundGap, canvas, sprite) {
                        if (sprite.x + this.width > canvas.width + boundGap) sprite.x = canvas.width - this.width + boundGap;
                        if (sprite.y + this.height > canvas.height + boundGap) sprite.y = canvas.height - this.height + boundGap;
                    },
                    drawGizmos(ctx, sprite, color = "red", width = 1) {
                        ctx.strokeStyle = color;
                        ctx.lineWidth = width;
                        ctx.strokeRect(sprite.x + this.offset.x, sprite.y + this.offset.y, this.width, this.height);
                    }
                };
            },
            checkSquareCollision(sprite1, sprite2) {
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
            }
        }
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
            },
            isMouseDown() {
                return this.keys['Mouse1'];
            }
        };
        this.world = {
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
                    if(this.background.startsWith('url')) {
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
        window.addEventListener('mouseup', (e) => {
            this.listen.keys['Mouse1'] = false;
        });

        SimpleCheats.hydraDebug(this);
    }

    _drawFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.world.render(this.canvas);
        for (const sprite of this.sprites.sprites) {
            if(sprite.renderer.shouldRender()) {
                sprite.renderer.call(this.ctx, sprite);
            }
        }
    }

    loop(fps = 60) {
        const interval = 1000 / fps;
        let lastTime = 0;

        const animate = (time) => {
            if (time - lastTime >= interval) {
                lastTime = time;
                this.listen.keyDowns = {};
                this._drawFrame();
                for (const ticker of this.listen.tickers) {
                    ticker.callback(interval);
                }
            }
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}
window.hydraLibVersion = '0.0.';