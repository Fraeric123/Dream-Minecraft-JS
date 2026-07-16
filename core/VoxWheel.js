







import * as THREE from "../js/libs/three.module.min.js"
import { GLTFLoader } from "../js/libs/GLTFLoader.js";
import { RGBELoader } from "../js/libs/RGBELoader.js";
import { clone } from "../js/libs/SkeletonUtils.js";






export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));






export const Enum = {
    "AssetType": {
        "None": 0,
        "Texture": 1,
        "Audio": 2,
        "Model": 3,
        "HDR": 4
    },
    "TextStyle": {
        "Left": 0,
        "Right": 1,
        "Centered": 2,
    }
}








export class EventList {
    constructor() {
        this.events = new Map();
        this.nextID = 0;
    }

    addEvent(event, eventID = this.nextID++) {
        this.events.set(eventID, event);
        return eventID
    }

    runEvent(eventID, arg = null) {
        const event = this.events.get(eventID);

        if (event) {
            event(arg);
        }
    }

    runAll(arg = null) {
        for (const event of this.events.values()) {
            event(arg);
        }
    }

    removeEvent(eventID) {
        this.events.delete(eventID);
    }

    clear() {
        this.events.clear();
    }
}















export class Asset {
    constructor(id, path, type = Enum.AssetType.None) {
        this.id = id;

        this.path = path;

        this.type = type;

        this.data = null;

        this.isLoaded = false;

        this.onLoad = new EventList();
    }
}










export class AssetList {
    constructor() {
        this.assets = new Map();
    }

    addAsset(asset) {
        this.assets.set(asset.id, asset);
    }

    newAsset(id, path, type) {
        const asset = new Asset(id, path, type);
        this.addAsset(asset);
        return asset;
    }

    getAssetById(id) {
        return this.assets.get(id);
    }

    getAssetDataById(id) {
        return this.assets.get(id)?.data;
    }

    values() {
        return this.assets.values();
    }

    clear() {
        this.assets.clear();
    }

    get size() {
        return this.assets.size;
    }
}










export class AssetManager {
    constructor(engine) {
        this.engine = engine;

        this.loaders = new Map();

        this.audioLoader = new THREE.AudioLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.modelLoader = new GLTFLoader();
        this.RGBELoader = new RGBELoader();

        this.loadedAssets = 0;
        this.totalAssets = 0;

        this.onProgress = new EventList();
        this.onFinished = new EventList();
        this.onError = new EventList();

        this.currentAsset = null;

        this._registerLoaders();
    }

    _registerLoaders() {
        this.loaders.set(Enum.AssetType.Texture, this._loadTexture.bind(this));
        this.loaders.set(Enum.AssetType.Model, this._loadModel.bind(this));
        this.loaders.set(Enum.AssetType.Audio, this._loadAudio.bind(this));
        this.loaders.set(Enum.AssetType.HDR, this._loadHDR.bind(this));
    }

    async load(asset) {
        const loader = this.loaders.get(asset.type);

        if (!loader) {
            const error = new Error(`Unknown asset type: ${asset.type}`);
            this.onError.runAll(error);
            throw error;
        }

        try {
            this.currentAsset = asset;
            await loader(asset);
            asset.isLoaded = true;
            asset.onLoad.runAll(asset);
            this.loadedAssets++;
            this.onProgress.runAll(this.getProgress());
        } catch (error) {
            this.onError.runAll({ asset, error });
            throw error;
        }

        await sleep(50);
    }

    async loadAll() {
        this.loadedAssets = 0;

        const assetsIterable = this.engine.assets.values();
        this.totalAssets = this.engine.assets.size;

        if (this.totalAssets === 0) {
            this.onFinished.runAll();
            return;
        }

        // Načítáme sekvenčně jeden po druhém
        for (const asset of assetsIterable) {
            try {
                await this.load(asset);
            } catch (err) {
                console.error(`Failed to load asset: ${asset.id}`, err);
            }
        }

        this.onFinished.runAll();
    }

    get(id) {
        return this.engine.assets.getAssetDataById(id);
    }

    getAsset(id) {
        return this.engine.assets.getAssetById(id);
    }

    getProgress() {
        if (this.totalAssets === 0) return 1;
        return { "value": this.loadedAssets / this.totalAssets, "asset": this.currentAsset };
    }

    clear() {
        this.loadedAssets = 0;
        this.totalAssets = 0;
    }

    _loadTexture(asset) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                asset.path,
                texture => {
                    asset.data = texture;
                    resolve(texture.image);
                },
                undefined,
                reject
            );
        });
    }

    _loadModel(asset) {
        return new Promise((resolve, reject) => {
            this.modelLoader.load(
                asset.path,
                (gltf) => {
                    asset.data = gltf;
                    resolve(gltf);
                },
                undefined,
                reject
            );
        });
    }

    _loadAudio(asset) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                asset.path,
                (audioBuffer) => {
                    asset.data = audioBuffer;
                    resolve(audioBuffer);
                },
                undefined,
                reject
            );
        });
    }

    _loadHDR(asset) {
        return new Promise((resolve, reject) => {
            this.RGBELoader.load(
                asset.path,
                (texture) => {
                    asset.data = texture;
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }
}







export class BitmapFont {
    constructor(engine, textureID) {
        this.engine = engine;
        this.asset_manager = engine.asset_manager;

        this.textureID = textureID;

        this.charWidths = new Int32Array(256);
        this.fontImage = null;
        this.isReady = false;
        this.ctx = engine.ctx;

        this.colorCache = new Map();

        this.asset_manager.getAsset(this.textureID).onLoad.addEvent((asset) => {
            this.fontImage = asset.data.image;
            this._analyzeCharWidths();
        });
    }

    _analyzeCharWidths() {
        const w = this.fontImage.width;
        const h = this.fontImage.height;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = w;
        offscreenCanvas.height = h;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.drawImage(this.fontImage, 0, 0);

        const imgData = offscreenCtx.getImageData(0, 0, w, h);
        const rawPixels = imgData.data;

        for (let i = 0; i < 128; i++) {
            let xt = i % 16;
            let yt = Math.floor(i / 16);

            let x = 0;
            let emptyColumn = false;

            for (; x < 8 && !emptyColumn; x++) {
                let xPixel = xt * 8 + x;
                emptyColumn = true;

                for (let y = 0; y < 8 && emptyColumn; y++) {
                    let yPixel = (yt * 8 + y) * w;
                    let idx = (xPixel + yPixel) * 4;

                    let alpha = rawPixels[idx + 3];
                    let r = rawPixels[idx];
                    if (alpha > 128 || r > 128) {
                        emptyColumn = false;
                    }
                }
            }

            if (i === 32) x = 4;
            this.charWidths[i] = x;
        }

        this.colorCache.set('#ffffff', this.fontImage);
        this.isReady = true;
    }

    _getColoredFontTexture(hexColorStr) {
        const cleanColor = hexColorStr.toLowerCase();

        if (this.colorCache.has(cleanColor)) {
            return this.colorCache.get(cleanColor);
        }

        const cacheCanvas = document.createElement('canvas');
        cacheCanvas.width = this.fontImage.width;
        cacheCanvas.height = this.fontImage.height;
        const cacheCtx = cacheCanvas.getContext('2d');

        cacheCtx.drawImage(this.fontImage, 0, 0);

        cacheCtx.globalCompositeOperation = 'source-in';
        cacheCtx.fillStyle = cleanColor;
        cacheCtx.fillRect(0, 0, cacheCanvas.width, cacheCanvas.height);

        this.colorCache.set(cleanColor, cacheCanvas);
        return cacheCanvas;
    }

    _hexToString(hex) {
        return `#${hex.toString(16).padStart(6, '0')}`;
    }

    _parseHexColorString(str) {
        if (typeof str !== 'string') return null;
        const m = str.match(/^#?([0-9a-f]{6})$/i);
        if (m) return parseInt(m[1], 16);
        return null;
    }

    _computeColorCode(c) {
        const k = (c & 0x8) << 3;          // 0 or 64
        const r = ((c >> 2) & 1) * 191 + k;
        const g = ((c >> 1) & 1) * 191 + k;
        const b = (c & 1) * 191 + k;
        return (r << 16) | (g << 8) | b;
    }

    _shadowColor(color) {
        return (color & 0xFCFCFC) >> 2;
    }

    drawText(text, x, y, shadow = true, scale = 3, hexColor = 0xFFFFFF) {
        if (!this.isReady) return;

        x = Math.floor(x);
        y = Math.floor(y);

        const originalSmoothing = this.ctx.imageSmoothingEnabled;
        this.ctx.imageSmoothingEnabled = false;

        let defaultColor;
        if (typeof hexColor === 'number') {
            defaultColor = hexColor & 0xFFFFFF;
        } else {
            const parsed = this._parseHexColorString(hexColor);
            defaultColor = parsed !== null ? parsed : 0xFFFFFF;
        }

        if (shadow) {
            this._renderTextString(text, x + scale, y + scale, scale, defaultColor, true);
        }
        this._renderTextString(text, x, y, scale, defaultColor, false);

        this.ctx.imageSmoothingEnabled = originalSmoothing;
    }

    getTextWidth(text, scale = 1) {
        if (!this.isReady) return 0;
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            if ((text.charAt(i) === '§' || text.charAt(i) === '&') && i + 1 < text.length) {
                i++;
                continue;
            }
            const charCode = text.charCodeAt(i);
            totalWidth += (this.charWidths[charCode] || 0) * scale;
        }
        return totalWidth;
    }

    _renderTextString(text, x, y, scale, defaultColor, isShadow) {
        let xo = 0;
        const ctx = this.ctx;

        let currentColor = isShadow ? this._shadowColor(defaultColor) : defaultColor;
        let currentTexture = this._getColoredFontTexture(this._hexToString(currentColor));

        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);

            if ((ch === '§' || ch === '&') && i + 1 < text.length) {
                const codeChar = text.charAt(i + 1).toLowerCase();
                const colorIndex = "0123456789abcdef".indexOf(codeChar);
                const effectiveIndex = colorIndex >= 0 ? colorIndex : 15;
                const baseColor = this._computeColorCode(effectiveIndex);
                currentColor = isShadow ? this._shadowColor(baseColor) : baseColor;
                currentTexture = this._getColoredFontTexture(this._hexToString(currentColor));
                i++;
                continue;
            }

            const charCode = text.charCodeAt(i);
            const srcX = (charCode % 16) * 8;
            const srcY = Math.floor(charCode / 16) * 8;
            const charWidth = this.charWidths[charCode] || 0;

            if (charWidth > 0) {
                ctx.drawImage(
                    currentTexture,
                    srcX, srcY, 8, 8,
                    x + xo, y, 8 * scale, 8 * scale
                );
            }
            xo += charWidth * scale;
        }
    }
}







export class GUIDrawCommand {
    constructor() {
        this.visible = true;
    }

    render(ctx, element) { }
}






export class GUIColorPanel extends GUIDrawCommand {
    constructor(color, x, y, w, h) {
        super();

        this.color = color;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    render(ctx, element) {
        if (!this.visible) return;

        ctx.fillStyle = this.color;
        ctx.fillRect(
            element.globalX + this.x,
            element.globalY + this.y,
            this.w,
            this.h
        );
    }
}






export class GUITexturePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    render(ctx, element) {
        const asset = this.asset_manager.getAsset(this.textureID);

        if (!asset || !asset.isLoaded)
            return;

        ctx.drawImage(
            asset.data.image,
            element.globalX + this.x,
            element.globalY + this.y,
            this.w,
            this.h
        );
    }
}





export class GUIClipBegin extends GUIDrawCommand {
    constructor(x, y, w, h) {
        super();

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    render(ctx, element) {
        ctx.save();

        ctx.beginPath();

        ctx.rect(
            element.x + this.x,
            element.y + this.y,
            this.w,
            this.h
        );

        ctx.clip();
    }
}







export class GUIClipEnd extends GUIDrawCommand {
    render(ctx) {
        ctx.restore();
    }
}





export class GUIText extends GUIDrawCommand {
    constructor(font, text, x, y, size, color) {
        super();

        this.font = font;
        this.text = text;

        this.x = x;
        this.y = y;

        this.size = size;
        this.color = color;
    }


    render(ctx, element) {
        this.font.drawText(
            this.text,
            element.globalX + this.x,
            element.globalY + this.y,
            true,
            this.size,
            this.color
        );
    }
}







export class GUIBitmapText extends GUIDrawCommand {
    constructor(engine, text, x, y, size, color = 0xFFFFFF, shadow = true) {
        super();

        this.bitmap_font = engine.bitmap_font;

        this.text = text;

        this.shadow = shadow;

        this.x = x;
        this.y = y;

        this.size = size;
        this.color = color;
    }


    render(ctx, element) {
        this.bitmap_font.drawText(this.text, element.globalX + this.x, element.globalY + this.y, this.shadow, this.size, this.color);
    }
}





export class GUIElement {
    constructor(screen) {
        this.screen = screen;
        this.engine = this.screen.engine;

        this.x = 0;
        this.y = 0;

        this.width = 0;
        this.height = 0;

        this.offsetX = 0;
        this.offsetY = 0;

        this.rotation = 0;

        this.layer = 0;

        this.visible = true;

        this.drawCommands = [];
    }

    get globalX() {
        return this.parent ? this.parent.globalX + this.x : this.x;
    }

    get globalY() {
        return this.parent ? this.parent.globalY + this.y : this.y;
    }

    add(command) {
        this.drawCommands.push(command);
    }

    clear() {
        this.drawCommands = [];
    }

    addColorPanel(color, x, y, w, h) {
        this.add(new GUIColorPanel(color, x, y, w, h));
    }

    addTexturePanel(textureID, x, y, w, h) {
        this.add(new GUITexturePanel(this.engine, textureID, x, y, w, h));
    }

    addText(font, text, x, y, size, color) {
        this.add(new GUIText(font, text, x, y, size, color));
    }

    render(ctx) {
        if (!this.visible) return;

        this.drawCommands.forEach((command) => {
            command.render(ctx, this);
        })
    }
}







export class Screen {
    constructor(engine) {
        this.engine = engine;

        this.guiElements = [];
    }

    addElement(element) {
        this.guiElements.push(element);
        this.guiElements.sort(
            (a, b) => a.layer - b.layer
        );
    }

    render(ctx) {
        this.guiElements.forEach((element) => {
            element.render(ctx)
        })
    }
}







export class AssetLoadingScreen extends Screen {
    constructor(engine) {
        super(engine);

        this.engine.asset_manager.onProgress.addEvent((progress) => {
            this.render(this.engine.ctx);
            this.assetLoaded(progress);
            this.render(this.engine.ctx);
        });

        const rect = new GUIElement(this);
        rect.add(new GUIColorPanel("red", 0, 0, 2560, 1440));
        rect.add(new GUIBitmapText(this.engine, "Minecraft asset loading", 15, 15, 16));

        this.Pic = new GUITexturePanel(this.engine, "terrain", 100, 400, 900, 500);
        rect.add(this.Pic);

        this.Text = new GUIBitmapText(this.engine, "", 10, 320, 5, 0x777777);
        rect.add(this.Text);

        this.addElement(rect);
    }

    assetLoaded(progress) {
        this.Text.text = `Loaded: ${progress.asset.path} (${Math.round(progress.value * 100)}%)`;

        if (progress.asset.type == Enum.AssetType.Texture) {
            this.Pic.textureID = progress.asset.id;
        } else {
            this.Pic.textureID = "pack";
        }
    }
}





export class LogoScreen extends Screen {
    constructor(engine) {
        super(engine);

        const rect = new GUIElement(this);
        rect.add(new GUIColorPanel("black", 0, 0, 2560, 1440));
        rect.add(new GUIBitmapText(this.engine, "Logo", 15, 15, 16));

        this.Pic = new GUITexturePanel(this.engine, "font", -500, 500, 5000, 500);
        rect.add(this.Pic);

        this.Text = new GUIBitmapText(this.engine, "num", 10, 320, 10, 0x777777);
        rect.add(this.Text);

        this.addElement(rect);

        this.renderTime = 0;
    }

    render(ctx) {
        this.renderTime++;
        this.Text.text = this.renderTime.toString();

        if (this.renderTime > 250) {
            this.engine.setScreen(new MenuScreen(this.engine));
        }

        super.render(ctx);
    }
}





export class MenuScreen extends Screen {
    constructor(engine) {
        super(engine);

        const rect = new GUIElement(this);
        rect.add(new GUIColorPanel("red", 0, 0, 2560, 1440));
        rect.add(new GUITexturePanel(this.engine, "pano0", 0, 0, 2560, 1440));
        rect.add(new GUITexturePanel(this.engine, "logo", 2560 / 2 - 500, 50, 1000, 170));
        rect.add(new GUIBitmapText(this.engine, "by Fraeric123", 2195, 1395, 5));
        rect.add(new GUIBitmapText(this.engine, "not Minecraft 1.0.0", 10, 1395, 5));

        this.Text = new GUIBitmapText(this.engine, "lol is good food", 1000, 520, 5, 0xFAFA00);
        rect.add(this.Text);

        this.addElement(rect);
    }
}









export class CanvasRenderer {
    constructor(engine) {
        this.engine = engine;
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.renderCanvas = document.createElement('canvas');

        this.BASE_WIDTH = 2560;
        this.BASE_HEIGHT = 1440;

        this.SCALE_FACTOR = 1;

        this.VIRTUAL_WIDTH = this.BASE_WIDTH * this.SCALE_FACTOR;
        this.VIRTUAL_HEIGHT = this.BASE_HEIGHT * this.SCALE_FACTOR;

        this.POM = this.VIRTUAL_WIDTH / this.VIRTUAL_HEIGHT;

        this.canvas.width = this.VIRTUAL_WIDTH;
        this.canvas.height = this.VIRTUAL_HEIGHT;
        this.renderCanvas.width = this.VIRTUAL_WIDTH;
        this.renderCanvas.height = this.VIRTUAL_HEIGHT;

        this.engine.renderer = new THREE.WebGLRenderer({ canvas: this.renderCanvas, antialias: false, alpha: false });
        this.engine.renderer.setPixelRatio(1);
        this.engine.renderer.setSize(this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT, false);
        this.engine.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        this.engine.canvas = this.canvas;
        this.engine.ctx = this.ctx;

        this.resize = this.resize.bind(this);
        this.resize();
        window.addEventListener('resize', this.resize);
    }

    resize() {
        const targetAspect = this.VIRTUAL_WIDTH / this.VIRTUAL_HEIGHT;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowAspect = windowWidth / windowHeight;

        let displayWidth, displayHeight;

        if (windowAspect > targetAspect) {
            displayHeight = windowHeight;
            displayWidth = windowHeight * targetAspect;
        } else {
            displayWidth = windowWidth;
            displayHeight = windowWidth / targetAspect;
        }

        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        this.ctx.imageSmoothingEnabled = false;
    }

    render() {
        this.engine.renderer.render(this.engine.scene, this.engine.camera);
        this.ctx.clearRect(0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);
        this.ctx.drawImage(this.renderCanvas, 0, 0);
        this.engine.renderGUI();
    }
}









export class Manager {
    constructor(engine) {
        this.engine = engine;
    }
}









export class InputList {
    constructor() {
        this.inputs = new Map();
    }

    setInputState(input, state) {
        this.inputs.set(input, state);
    }

    getInputState(input) {
        return this.inputs.get(input);
    }

    consumeClick(button) {
        const key = `Mouse_Click_${button}`;
        const v = this.inputs.get(key);
        if (v) {
            this.inputs.set(key, false);
            return true;
        }
        return false;
    }
}









export class InputManager extends Manager {
    constructor(engine) {
        super(engine);

        this.keyDown = new EventList();
        this.keyUp = new EventList();
        this.keyPressed = new EventList();
        this.keyReleased = new EventList();

        this.mouseMoved = new EventList();
        this.mouseButtonPressed = new EventList();
        this.mouseButtonReleased = new EventList();

        this.previousInputs = new Map();
    }

    init() {
        const input = this.engine.input;
        const inputCanvas = this.engine.canvas;

        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            if (!input.getInputState(e.code)) {
                input.setInputState(e.code, true);
                this.keyDown.runAll(e.code);
            }
        });

        window.addEventListener('keyup', (e) => {
            input.setInputState(e.code, false);
            this.keyUp.runAll(e.code);
        });

        if (inputCanvas) {
            inputCanvas.addEventListener('mousemove', (e) => {
                const rect = inputCanvas.getBoundingClientRect();
                const pos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                input.setInputState('Mouse_Position', pos);
                this.mouseMoved.runAll(pos);
            });

            inputCanvas.addEventListener('mousedown', (e) => {
                const buttonKey = `Mouse_Button_${e.button}`;
                const clickKey = `Mouse_Click_${e.button}`;

                input.setInputState(buttonKey, true);
                input.setInputState(clickKey, true);

                this.mouseButtonPressed.runAll(e.button);
            });

            inputCanvas.addEventListener('mouseup', (e) => {
                input.setInputState(`Mouse_Button_${e.button}`, false);
                this.mouseButtonReleased.runAll(e.button);
            });

            inputCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }

    update(dt) {
        const input = this.engine.input;

        for (const [key, currentValue] of input.inputs.entries()) {
            if (key === 'Mouse_Position' || key.startsWith('Mouse_Click_')) continue;

            const previousValue = this.previousInputs.get(key) || false;

            if (currentValue === true && previousValue === false) {
                this.keyPressed.runAll(key);
            } else if (currentValue === false && previousValue === true) {
                this.keyReleased.runAll(key);
            }

            this.previousInputs.set(key, currentValue);
        }

        for (let [key, value] of input.inputs.entries()) {
            if (key.startsWith('Mouse_Click_') && value === true) {
                input.setInputState(key, false);
            }
        }
    }
}








export class VoxWheel {
    constructor({ assets = new AssetList() }) {

        this.assets = assets;

        this.asset_manager = new AssetManager(this)

        this.fogColor = new THREE.Color(0.5, 0.8, 1.0);

        this.skyFogColor = new THREE.Color(0.5, 0.8, 1.0);
        this.skyFogDensity = 0.008;

        this.waterFogColor = new THREE.Color(0.2, 0.2, 0.8);
        this.waterFogDensity = 0.1;

        this.lavaFogColor = new THREE.Color(0.8, 0.2, 0.2);
        this.lavaFogDensity = 0.4;

        this.renderer = null;
        this.canvas = null;
        this.ctx = null;

        this.canvas_renderer = new CanvasRenderer(this);

        this.input = new InputList();
        this.input_manager = new InputManager(this);

        this.camera = new THREE.PerspectiveCamera(70, this.canvas_renderer.POM, 0.01, 1000.0);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.008);

        this.screen = null;

        this.bitmap_font = new BitmapFont(this, "font");
    }

    setScreen(screen) {
        this.screen = screen;
    }

    async run() {
        await this.init();
        this.loop();
    }

    async init() {
        console.log("initializing..")

        this.setScreen(new AssetLoadingScreen(this));

        await this.asset_manager.loadAll();

        this.setScreen(new LogoScreen(this));

        this.input_manager.init();
    }

    renderGUI() {
        if (this.screen) {
            this.screen.render(this.ctx);
        }
    }

    render() {
        this.canvas_renderer.render();
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        try {
            const dt = 1 / 60; 
            
            this.input_manager.update(dt);

            this.render();
        } catch (e) {
            console.error(e);
        }
    }
}






const assets = new AssetList();

assets.newAsset("font", "../assets/fonts/default.gif", Enum.AssetType.Texture);
assets.newAsset("terrain", "../assets/textures/terrain.png", Enum.AssetType.Texture);
assets.newAsset("pano0", "../assets/textures/panorama0.png", Enum.AssetType.Texture);
assets.newAsset("pano1", "../assets/textures/panorama1.png", Enum.AssetType.Texture);
assets.newAsset("pano2", "../assets/textures/panorama2.png", Enum.AssetType.Texture);
assets.newAsset("pano3", "../assets/textures/panorama3.png", Enum.AssetType.Texture);
assets.newAsset("pano4", "../assets/textures/panorama4.png", Enum.AssetType.Texture);
assets.newAsset("pano5", "../assets/textures/panorama5.png", Enum.AssetType.Texture);
assets.newAsset("logo", "../assets/textures/mclogo.png", Enum.AssetType.Texture);
assets.newAsset("pack", "../assets/textures/pack.png", Enum.AssetType.Texture);

const g = new VoxWheel({ assets: assets })

await g.run();