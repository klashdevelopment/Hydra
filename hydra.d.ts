interface HydraSprite {
    x: number;
    y: number;
    renderer: HydraSpriteRenderer;
    props: any;
    zIndex: number;
    collider: any;
}

interface Offset {
    x: number;
    y: number;
    rotation: number;
    filter: string;
}

declare class HydraSpriteRenderer {
    renderFunc: (ctx: CanvasRenderingContext2D, sprite: HydraSprite, params: any) => void;
    renderParams: any;
    shouldRender: () => boolean;
    constructor(render: (ctx: CanvasRenderingContext2D, sprite: HydraSprite, params: any) => void, params: any, shouldRender?: () => boolean);
    call(ctx: CanvasRenderingContext2D, sprite: HydraSprite): void;
    withShouldRender(shouldRender: () => boolean): this;
}

declare class SimpleRenderers {
    static rectangle(width: number, height: number, color: string, offset?: Offset): HydraSpriteRenderer;
    static none(): HydraSpriteRenderer;
    static roundedRectangle(width: number, height: number, radius: number, color: string, offset?: Offset): HydraSpriteRenderer;
    static circle(radius: number, color: string, offset?: Offset): HydraSpriteRenderer;
    static image(image: HTMLImageElement, width: number, height: number, offset?: Offset): HydraSpriteRenderer;
    static triangle(width: number, height: number, spikePoint: number, color: string, offset?: Offset): HydraSpriteRenderer;
    static pixelMap(width: number, height: number, gridWidth: number, gridHeight: number, map: string[], colors: any[], offset?: Offset): HydraSpriteRenderer;
    static smileyFace(radius: number, color: string, pupilColor?: string, offset?: Offset): HydraSpriteRenderer;
    static combination(...renderers: HydraSpriteRenderer[]): HydraSpriteRenderer;
    static vertex(color?: string, size?: number, offset?: Offset): HydraSpriteRenderer;
    static line(x2: number, y2: number, color?: string, width?: number, offset?: Offset): HydraSpriteRenderer;
    static polygon(vertices: { x: number; y: number }[], color?: string, offset?: Offset): HydraSpriteRenderer;
    static star(spikes: number, outerRadius: number, innerRadius: number, color?: string, offset?: Offset): HydraSpriteRenderer;
    static text(text: string | (() => string), fontSize: number, fontName: string, color: string, offset?: Offset, weight?: string): HydraSpriteRenderer;
}

declare class SimpleCheats {
    static hydraDebug(lib: HydraCanvasLib): void;
}

interface HydraDefaultProps {
    enableExperimentalDPR: boolean;
    canvasWidth: number;
    canvasHeight: number;
}

interface Utility {
    ease: (amount: number, duration: number, callback: (delta: number) => void) => void;
    getPixelColorAt: (x: number, y: number) => string;
    keepSpriteInBounds: (sprite: HydraSprite, boundGap?: number) => void;
    keepAllSpritesInBounds: (boundGap?: number) => void;
    getScreenCenter: () => { x: number; y: number };
    getScreenSize: () => { width: number; height: number };
    drawColliderGizmos: (sprite: HydraSprite, color?: string, width?: number) => void;
    createLinearGradient: (x0: number, y0: number, x1: number, y1: number, colorStops: { offset: number; color: string }[]) => CanvasGradient;
    createRadialGradient: (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, colorStops: { offset: number; color: string }[]) => CanvasGradient;
    getStringWidth: (text: string, fontSize: number, fontName: string) => number;
}

interface DataStorage {
    key: string;
    data: any;
    set: (k: string, v: any) => void;
    get: (k: string) => any;
    remove: (k: string) => void;
    saveData: () => void;
    refreshData: () => void;
}

interface Data {
    createStorage: (key: string, defaultValue?: any) => DataStorage;
}

interface Experiments {
    importCSS: (src: string, addParameters?: boolean) => { remove: () => void };
}

interface Tileset {
    imageUrl: string;
    tileWidth: number;
    tileHeight: number;
    getTileRenderer: (tileX: number, tileY: number, width?: number, height?: number, offset?: Offset) => HydraSpriteRenderer;
}

interface Tilemap {
    tileset: Tileset;
    map: number[][];
    offset: Offset;
    tileSize: number,
    renderer: HydraSpriteRenderer;
    collider: TilemapCollider;
}

interface TilesetManager {
    createTileset: (imageUrl: string, tileWidth: number, tileHeight: number) => Tileset;
    createTilemap: (tileset: Tileset, map: number[][], offset?: Offset) => Tilemap;
}

interface SFX {
    play: () => void;
    pause: () => void;
    stop: () => void;
    setVolume: (volume: number) => void;
    setLoop: (loop: boolean) => void;
    setPlaybackRate: (rate: number) => void;
    setMuted: (muted: boolean) => void;
    isPlaying: () => boolean;
    isPaused: () => boolean;
    isEnded: () => boolean;
    editAudio: (callback: (audio: HTMLAudioElement) => HTMLAudioElement | void) => void;
}

interface Sounds {
    createSFX: (src: string) => SFX;
}

interface SquareCollider {
    width: number;
    height: number;
    type: 'square';
    offset: Offset;
    keepInBounds: (boundGap: number, canvas: HTMLCanvasElement, sprite: HydraSprite) => void;
    drawGizmos: (ctx: CanvasRenderingContext2D, sprite: HydraSprite, color?: string, width?: number) => void;
    isMouseTouching: (sprite: HydraSprite, canvas: HTMLCanvasElement, mouseX: number, mouseY: number) => boolean;
}

interface TilemapCollider {
    type: 'tilemap';
    drawGizmos: (ctx: CanvasRenderingContext2D, sprite: HydraSprite, color?: string, width?: number) => void;
    isMouseTouching: (sprite: HydraSprite, canvas: HTMLCanvasElement, mouseX: number, mouseY: number) => boolean;
    keepInBounds: (boundGap: number, canvas: HTMLCanvasElement, sprite: HydraSprite) => void;
}

interface Collision {
    makeSquareCollider: (initalWidth: number, initialHeight: number, initialOffset?: Offset) => SquareCollider;
    checkCollision: (sprite1: HydraSprite, sprite2: HydraSprite) => boolean;
    isMouseTouching: (sprite: HydraSprite) => boolean;
}

interface SpriteManager {
    sprites: HydraSprite[];
    createNew: (x: number, y: number, renderer: HydraSpriteRenderer) => HydraSprite;
    remove: (sprite: HydraSprite) => void;
    moveBy: (sprite: HydraSprite, dx?: number, dy?: number) => void;
    glideTo: (sprite: HydraSprite, x: number, y: number, duration: number) => void;
}

interface Listen {
    keys: { [key: string]: boolean };
    keyDowns: { [key: string]: boolean };
    tickers: { uuid: string; callback: (deltaTime: number) => void }[];
    mouse: { x: number; y: number };
    isKey: (key: string) => boolean;
    isManyKeys: (...keys: string[]) => boolean;
    onKeyDown: (key: string) => boolean;
    addTicker: (callback: (deltaTime: number) => void) => string;
    removeTicker: (uuid: string) => boolean;
    isMouseDown: () => boolean;
}

interface VingetteEffect {
    enabled: boolean;
    color: string;
    opacity: number;
}

interface BloomEffect {
    enabled: boolean;
    intensity: number;
    color: string;
    threshold: number;
    radius: number;
}

interface WorldEffects {
    vingette: VingetteEffect;
    bloom: BloomEffect;
}

interface World {
    effects: WorldEffects;
    background: string;
    backgroundImages: { [key: string]: HTMLImageElement };
    showBackground: boolean;
    setShowBackground: (show: boolean) => void;
    setBackgroundColor: (color: string) => void;
    setBackgroundImage: (image: string) => void;
    render: (canvas: HTMLCanvasElement) => void;
}

interface HydraCanvasLibProps {
    enableExperimentalDPR?: boolean;
    canvasWidth?: number;
    canvasHeight?: number;
}

declare class HydraCanvasLib {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    shutoff: boolean;
    utility: Utility;
    data: Data;
    experiments: Experiments;
    tileset: TilesetManager;
    sounds: Sounds;
    collision: Collision;
    sprites: SpriteManager;
    listen: Listen;
    world: World;

    constructor(canvasId: string, props?: HydraCanvasLibProps);
    _drawFrame(): void;
    loop(fps?: number): void;
}

interface Window {
    hydraLibVersion: string | undefined;
    invertColor: (hex: string) => string;
}