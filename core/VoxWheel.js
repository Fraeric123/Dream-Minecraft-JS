



export const build = 39;



import * as threeWebGPU from "../js/libs/three.webgpu.min.js"
import * as threeWebGL from "../js/libs/three.module.min.js"
import { GLTFLoader } from "../js/libs/GLTFLoader.js";
import { RGBELoader } from "../js/libs/RGBELoader.js";
import { clone } from "../js/libs/SkeletonUtils.js";
import "../js/libs/jszip.min.js";

import { Enum, EventList, getRandomSplash, createOverlayGradient, JavaRandom, AABB } from "./Util.js";
import { BitmapFont, AssetLoadingScreen, LogoScreen, MenuScreen, OptionsScreen, WorldSelectScreen, CreateWorldScreen, GenerateWorldScreen, SaveWorldScreen, GameMenuScreen, InGameScreen, InGameOptionsScreen  } from "./GUI.js";
import { Tesselator, LevelRenderer } from "./Render.js";
import { Entity, Zombie } from "./Entity.js";
import { Tile } from "./Tile.js";







export const deg2rad = Math.PI / 180;
export const rad2deg = 180 / Math.PI;

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const DEG2RAD = (deg) => { return deg * Math.PI / 180 };
export const RAD2DEG = (rad) => { return rad * 180 / Math.PI };

export const log = (data) => { console.log(data) };

export const un = undefined;

export const isPointInBox = (px, py, bx, by, bw, bh) => {
    return px >= bx && px <= bx + bw && py >= by && py <= by + bh;
}

export const zip = (worldFiles) => {
    const jszip = new window.JSZip();
}

export const THREE = threeWebGL;









export class Asset {
    constructor(id, path, type = Enum.AssetType.None) {
        /*  
                Audio   s_
                HDR     h_
                Model   m_
                Texture t_        
        */

        this.id = id;
        this.path = path;
        this.type = type;
        this.data = null;
        this.isLoaded = false;
        this.onLoad = new EventList();
    }

    getID() {
        return this.id;
    }

    getCleanID() {
        if (typeof this.id === 'string' && this.id[1] === '_') {
            return this.id.slice(2);
        }
        return this.id;
    }
}








export class AssetList {
    constructor() {
        this.assets = new Map();

        this.sounds = new Map();
    }

    addAsset(asset) {
        this.assets.set(asset.id, asset);
    }

    registerSound(listener, asset, maxVoices = 10) {
        this.sounds.set(asset.id, {
            listener: listener,
            asset: asset,
            maxVoices: maxVoices,

            Ambient: [this._createAmbientInstance(listener, asset)],
            Positional: [this._createPositionalInstance(listener, asset)],

            ambientIndex: 0,
            positionalIndex: 0
        });
    }

    _createAmbientInstance(listener, asset) {
        const ambient = new THREE.Audio(listener);
        ambient.setBuffer(asset.data);
        return ambient;
    }

    _createPositionalInstance(listener, asset) {
        const positional = new THREE.PositionalAudio(listener);
        positional.setBuffer(asset.data);
        return positional;
    }

    getAmbientSound(id) {
        const soundData = this.sounds.get("s_" + id);
        if (!soundData) return null;

        const pool = soundData.Ambient;

        for (let i = 0; i < pool.length; i++) {
            if (!pool[i].isPlaying) return pool[i];
        }

        if (pool.length < soundData.maxVoices) {
            const newVoice = this._createAmbientInstance(soundData.listener, soundData.asset);
            pool.push(newVoice);
            return newVoice;
        }

        const fallbackSound = pool[soundData.ambientIndex];
        if (fallbackSound.isPlaying) fallbackSound.stop();
        soundData.ambientIndex = (soundData.ambientIndex + 1) % pool.length;
        return fallbackSound;
    }

    getPositionalSound(id) {
        const soundData = this.sounds.get("s_" + id);
        if (!soundData) return null;

        const pool = soundData.Positional;

        for (let i = 0; i < pool.length; i++) {
            if (!pool[i].isPlaying) return pool[i];
        }

        if (pool.length < soundData.maxVoices) {
            const newVoice = this._createPositionalInstance(soundData.listener, soundData.asset);
            pool.push(newVoice);
            return newVoice;
        }

        const fallbackSound = pool[soundData.positionalIndex];
        if (fallbackSound.isPlaying) fallbackSound.stop();
        soundData.positionalIndex = (soundData.positionalIndex + 1) % pool.length;
        return fallbackSound;
    }

    newAsset(id, path, type) {
        let newid = id;
        switch (type) {
            case Enum.AssetType.Audio: newid = "s_" + id; break;
            case Enum.AssetType.HDR: newid = "h_" + id; break;
            case Enum.AssetType.Model: newid = "m_" + id; break;
            case Enum.AssetType.Texture: newid = "t_" + id; break;
        }
        const asset = new Asset(newid, path, type);
        this.addAsset(asset);
        return asset;
    }

    get(id, type = 1) {
        let prefix = "";
        switch (type) {
            case Enum.AssetType.Audio: prefix = "s_"; break;
            case Enum.AssetType.HDR: prefix = "h_"; break;
            case Enum.AssetType.Model: prefix = "m_"; break;
            case Enum.AssetType.Texture: prefix = "t_"; break;
        }

        return this.assets.get(prefix + id) || null;
    }

    getData(id, type) {
        const asset = this.get(id, type);
        return asset ? asset.data : null;
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








export class WorldStorage {
    constructor(dbName = 'MinecraftZipWorldsDB', dbVersion = 1) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.db = null;
    }

    _init(onSuccess, onError) {
        if (this.db) {
            if (onSuccess) onSuccess(this.db);
            return;
        }

        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('worlds')) {
                db.createObjectStore('worlds', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            if (onSuccess) onSuccess(this.db);
        };

        request.onerror = (event) => {
            if (onError) onError(event.target.error);
        };
    }

    import(onSuccess, onError = null) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip';

        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.name.endsWith('.zip')) {
                const err = new Error('Vybraný soubor není .zip');
                console.warn(err.message);
                if (onError) onError(err);
                return;
            }

            const worldName = file.name.replace(/\.zip$/i, '');
            const worldId = 'world_' + Date.now();

            this.saveWorld(
                worldId,
                { name: worldName },
                file,
                () => {
                    console.log(`Svět "${worldName}" byl úspěšně uložen do databáze.`);
                    if (typeof onSuccess === 'function') {
                        onSuccess(worldId, worldName);
                    }
                },
                onError
            );
        };

        fileInput.click();
    }

    export(id, onError = null) {
        this.getWorld(id, (worldRecord) => {
            if (!worldRecord || !worldRecord.zipData) {
                const err = new Error(`Svět s ID "${id}" nebyl v databázi nalezen.`);
                console.warn(err.message);
                if (onError) onError(err);
                return;
            }

            const blob = worldRecord.zipData;
            const url = URL.createObjectURL(blob);

            const fileName = worldRecord.metadata?.name || 'world';

            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `${fileName}.zip`;

            downloadLink.click();

            setTimeout(() => URL.revokeObjectURL(url), 1000);

            console.log(`Svět "${fileName}" byl úspěšně exportován.`);
        }, onError);
    }

    saveWorld(id, metadata = {}, zipBlob, onComplete = null, onError = null) {
        this._init(() => {
            const transaction = this.db.transaction(['worlds'], 'readwrite');
            const store = transaction.objectStore('worlds');

            const record = {
                id,
                metadata: {
                    name: metadata.name || 'Nový Svět',
                    lastPlayed: Date.now(),
                    ...metadata
                },
                zipData: zipBlob
            };

            const request = store.put(record);

            request.onsuccess = () => {
                if (onComplete) onComplete(record);
            };
            request.onerror = (event) => {
                if (onError) onError(event.target.error);
            };
        }, onError);
    }

    getWorldsList(onSuccess, onError = null) {
        this._init(() => {
            const transaction = this.db.transaction(['worlds'], 'readonly');
            const store = transaction.objectStore('worlds');
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result || [];
                const list = records.map(({ id, metadata }) => ({ id, ...metadata }));
                if (onSuccess) onSuccess(list);
            };
            request.onerror = (event) => {
                if (onError) onError(event.target.error);
            };
        }, onError);
    }

    getWorld(id, onSuccess, onError = null) {
        this._init(() => {
            const transaction = this.db.transaction(['worlds'], 'readonly');
            const store = transaction.objectStore('worlds');
            const request = store.get(id);

            request.onsuccess = () => {
                if (onSuccess) onSuccess(request.result);
            };
            request.onerror = (event) => {
                if (onError) onError(event.target.error);
            };
        }, onError);
    }

    deleteWorld(id, onComplete = null, onError = null) {
        this._init(() => {
            const transaction = this.db.transaction(['worlds'], 'readwrite');
            const store = transaction.objectStore('worlds');
            const request = store.delete(id);

            request.onsuccess = () => {
                if (onComplete) onComplete();
            };
            request.onerror = (event) => {
                if (onError) onError(event.target.error);
            };
        }, onError);
    }
}








export class LevelList {
    constructor() {

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

        //await sleep(500);
    }

    async loadAll() {
        this.loadedAssets = 0;

        const assetsIterable = this.engine.assets.values();
        this.totalAssets = this.engine.assets.size;

        if (this.totalAssets === 0) {
            this.onFinished.runAll();
            return;
        }

        for (const asset of assetsIterable) {
            try {
                await this.load(asset);
            } catch (err) {
                console.error(`Failed to load asset: ${asset.id} path: ${asset.path}`, err);
            }
        }

        this.onFinished.runAll();
    }

    get(id, type = 1) {
        return this.engine.assets.getData(id, type);
    }

    getAsset(id, type = 1) {
        return this.engine.assets.get(id, type);
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
                    this.engine.assets.registerSound(this.engine.listener, asset);
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
        this.RENDER_SCALE_FACTOR = 0.05;

        this.VIRTUAL_WIDTH = this.BASE_WIDTH * this.SCALE_FACTOR;
        this.VIRTUAL_HEIGHT = this.BASE_HEIGHT * this.SCALE_FACTOR;

        this.POM = this.VIRTUAL_WIDTH / this.VIRTUAL_HEIGHT;

        this.canvas.width = this.VIRTUAL_WIDTH;
        this.canvas.height = this.VIRTUAL_HEIGHT;
        this.renderCanvas.width = this.VIRTUAL_WIDTH;
        this.renderCanvas.height = this.VIRTUAL_HEIGHT;

        if (THREE == threeWebGL) {
            this.engine.renderer = new THREE.WebGLRenderer({
                canvas: this.renderCanvas,
                antialias: false,
                alpha: false,
                powerPreference: "high-performance",
                precision: 'highp', //precision: "mediump",
                stencil: false,
                depth: true
            });
        } else {
            this.engine.renderer = new THREE.WebGPURenderer({ canvas: this.renderCanvas, antialias: false, alpha: false });
        }

        this.engine.renderer.shadowMap.enabled = false;

        this.engine.renderer.setPixelRatio(1);
        this.engine.renderer.setSize(this.VIRTUAL_WIDTH * this.RENDER_SCALE_FACTOR, this.VIRTUAL_HEIGHT * this.RENDER_SCALE_FACTOR, false);
        this.engine.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        this.engine.canvas = this.canvas;
        this.engine.ctx = this.ctx;

        this.resize = this.resize.bind(this);
        this.resize();
        window.addEventListener('resize', this.resize);
    }

    setCanvasCursor(cursorType) {
        this.canvas.style.cursor = cursorType;
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
        const rawFactor = this.engine.config?.data?.RenderFactor;
        this.RENDER_SCALE_FACTOR = (typeof rawFactor === 'number' && rawFactor > 0) ? rawFactor : 1;
        const renderWidth = Math.max(1, Math.floor(this.VIRTUAL_WIDTH * this.RENDER_SCALE_FACTOR));
        const renderHeight = Math.max(1, Math.floor(this.VIRTUAL_HEIGHT * this.RENDER_SCALE_FACTOR));

        this.engine.renderer.setSize(renderWidth, renderHeight, false);

        this.ctx.imageSmoothingEnabled = false;

        if (this.engine.config.data.FOV != this.engine.camera.fov) {
            this.engine.camera.fov = this.engine.config.data.FOV;
            this.engine.camera.updateProjectionMatrix();
        }

        this.engine.renderer.render(this.engine.scene, this.engine.camera);

        this.engine.renderer.sortObjects = false;

        this.ctx.clearRect(0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);
        this.ctx.drawImage(this.renderCanvas, 0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);

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

        this.mouseGUIButtonElementClick = new EventList();
        this.mouseGUIButtonElementRelease = new EventList();
        this.mouseGUIButtonElementHover = new EventList();
        this.mouseGUIButtonElementUnHover = new EventList();

        this.exitedPointerlock = new EventList();
        this.enteredPointerlock = new EventList();

        this.mouseGUIButtonElementInteract = null;

        this.previousInputs = new Map();

        this.lastTouchPos = null;
        this.pointerLockState = false;
    }

    lockMouse() {
        this.engine.canvas.requestPointerLock();
    }

    unlockMouse() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    init() {
        const input = this.engine.input;
        const inputCanvas = this.engine.canvas;

        const unlockAudio = () => {
            if (typeof THREE !== 'undefined' && THREE.AudioContext) {
                const ctx = THREE.AudioContext.getContext();
                if (ctx && ctx.state === 'suspended') {
                    ctx.resume();
                }
            }
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);

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
            const getCanvasPos = (clientX, clientY, movementX = 0, movementY = 0) => {
                const rect = inputCanvas.getBoundingClientRect();
                const cssX = clientX - rect.left;
                const cssY = clientY - rect.top;

                return {
                    x: cssX * (inputCanvas.width / rect.width),
                    y: cssY * (inputCanvas.height / rect.height),
                    movementX: movementX,
                    movementY: movementY
                };
            };

            inputCanvas.addEventListener('mousemove', (e) => {
                const pos = getCanvasPos(e.clientX, e.clientY, e.movementX, e.movementY);
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

            inputCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();

                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    this.lastTouchPos = { x: touch.clientX, y: touch.clientY };

                    const pos = getCanvasPos(touch.clientX, touch.clientY, 0, 0);

                    input.setInputState('Mouse_Position', pos);
                    this.mouseMoved.runAll(pos);

                    input.setInputState('Mouse_Button_0', true);
                    input.setInputState('Mouse_Click_0', true);
                    this.mouseButtonPressed.runAll(0);
                }
            }, { passive: false });

            inputCanvas.addEventListener('touchmove', (e) => {
                e.preventDefault();

                if (e.touches.length > 0) {
                    const touch = e.touches[0];

                    let movementX = 0;
                    let movementY = 0;
                    if (this.lastTouchPos) {
                        movementX = touch.clientX - this.lastTouchPos.x;
                        movementY = touch.clientY - this.lastTouchPos.y;
                    }
                    this.lastTouchPos = { x: touch.clientX, y: touch.clientY };

                    const pos = getCanvasPos(touch.clientX, touch.clientY, movementX, movementY);

                    input.setInputState('Mouse_Position', pos);
                    this.mouseMoved.runAll(pos);
                }
            }, { passive: false });

            const handleTouchEnd = (e) => {
                e.preventDefault();
                this.lastTouchPos = null;

                if (e.touches.length === 0) {
                    input.setInputState('Mouse_Button_0', false);
                    this.mouseButtonReleased.runAll(0);
                }
            };

            inputCanvas.addEventListener('touchend', handleTouchEnd, { passive: false });
            inputCanvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        }
    }

    update(dt) {
        const input = this.engine.input;

        const currentMouse0 = input.getInputState('Mouse_Button_0') || false;
        const previousMouse0 = this.previousInputs.get('Mouse_Button_0') || false;

        input.setInputState('Mouse_Trigger_0', currentMouse0 && !previousMouse0);

        if (!document.pointerLockElement && this.pointerLockState) {
            this.pointerLockState = false;
            this.exitedPointerlock.runAll();
        } else if (document.pointerLockElement && !this.pointerLockState) {
            this.pointerLockState = true;
            this.enteredPointerlock.runAll();
        }

        const entries = input.inputs instanceof Map ? input.inputs.entries() : Object.entries(input.inputs);

        for (const [key, currentValue] of entries) {
            const previousValue = this.previousInputs.get(key) || false;

            if (key.startsWith('Mouse_Click_0') && currentValue === true && previousValue === false) {
                input.setInputState('Clicked0', true);
            }

            if (key === 'Mouse_Position' || key.startsWith('Mouse_Click_')) continue;

            if (currentValue === true && previousValue === false) {
                this.keyPressed.runAll(key);
            } else if (currentValue === false && previousValue === true) {
                this.keyReleased.runAll(key);
            }

            this.previousInputs.set(key, currentValue);
        }

        this.previousInputs.set('Mouse_Button_0', currentMouse0);

        for (const [key, value] of entries) {
            if (key.startsWith('Mouse_Click_') && value === true) {
                input.setInputState(key, false);
            }
        }
    }
}








export class RenderState {
    constructor(engine) {
        this.engine = engine;

        this.state = Enum.RenderState.Clear
    }
}







export class ConfigList {
    constructor() {
        this.data = {
            "MasterVolume": 100,
            "Music": 100,
            "Sensitivity": 100,
            "FOV": 70,
            "Brightness": 0,
            "MenuSpinSpeed": 50,
            "RenderFactor": 1,
            "BlurIntensity": 5,

            "InvertMouse": false,
            "SmoothLighting": true,
            "3DAnaglyph": false,
            "ViewBobbing": true,
            "Clouds": true,
            "BlurEffects": false,
            "ExtraSounds": false,

            "Difficulty": Enum.Difficulty.Normal,
            "Graphics": Enum.Graphics.Fancy,
            "RenderDistance": Enum.RenderDistance.Normal,
            "Performance": Enum.Performance.Balanced,
            "GUIScale": Enum.GUIScale.Normal,
            "Particles": Enum.Particles.All,

            "Attack": Enum.Controls["Button 1"],
            "Use Item": Enum.Controls["Button 2"],
            "Forward": Enum.Controls.W,
            "Left": Enum.Controls.A,
            "Back": Enum.Controls.S,
            "Right": Enum.Controls.D,
            "Jump": Enum.Controls.SPACE,
            "Sneak": Enum.Controls.LCONTROL,
            "Drop": Enum.Controls.Q,
            "Inventory": Enum.Controls.E,
            "Chat": Enum.Controls.T,
            "List Players": Enum.Controls.TAB,
            "Pick Block": Enum.Controls["Button 3"]
        }
    }

    getDifficulty() {
        switch (this.data.Difficulty) {
            case Enum.Difficulty.Easy: return "Easy"; break;
            case Enum.Difficulty.Hard: return "Hard"; break;
            case Enum.Difficulty.Normal: return "Normal"; break;
            case Enum.Difficulty.Peaceful: return "Peaceful"; break;
            default: return "None"; break;
        }
    }

    getGraphics() {
        switch (this.data.Graphics) {
            case Enum.Graphics.Fancy: return "Fancy"; break;
            case Enum.Graphics.Fast: return "Fast"; break;
            default: return "None"; break;
        }
    }

    getRenderDistance() {
        switch (this.data.RenderDistance) {
            case Enum.RenderDistance.Far: return "Far"; break;
            case Enum.RenderDistance.Normal: return "Normal"; break;
            case Enum.RenderDistance.Short: return "Short"; break;
            case Enum.RenderDistance.Tiny: return "Tiny"; break;
            default: return "None"; break;
        }
    }

    getPerformance() {
        switch (this.data.Performance) {
            case Enum.Performance.Balanced: return "Balanced"; break;
            case Enum.Performance.MaxFPS: return "MaxFPS"; break;
            case Enum.Performance.PowerSaver: return "PowerSaver"; break;
            default: return "None"; break;
        }
    }

    getGUIScale() {
        switch (this.data.GUIScale) {
            case Enum.GUIScale.Auto: return "Auto"; break;
            case Enum.GUIScale.Large: return "Large"; break;
            case Enum.GUIScale.Normal: return "Normal"; break;
            case Enum.GUIScale.Small: return "Small"; break;
            default: return "None"; break;
        }
    }

    getParticles() {
        switch (this.data.Particles) {
            case Enum.Particles.All: return "All"; break;
            case Enum.Particles.Decreased: return "Decreased"; break;
            case Enum.Particles.Minimal: return "Minimal"; break;
            default: return "None"; break;
        }
    }
}















export class Level {
    constructor(engine, w, h, d) {
        this.engine = engine;

        this.uuid = crypto.randomUUID();

        this.width = w;
        this.height = h;
        this.depth = d;

        this.xSpawn = 0;
        this.ySpawn = 0;
        this.zSpawn = 0;
        this.rotSpawn = 0;

        this.random = new JavaRandom(this.seed);
        this.randValue = this.random.nextInt();

        this.camera = null;
        this.player = null;
        this.inventory = null;
        this.entities = [];

        this.pause = false;

        this.onGenerate = new EventList();
        this.onSave = new EventList();

        this.texture = this.engine.asset_manager.get("terrain");
        this.texture.flipY = false;
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            vertexColors: true,
            transparent: true,
            alphaTest: 0.5
        });

        this.blocks = new Uint8Array(w * h * d);
        this.lightDepths = new Int32Array(w * h);
        this.levelListeners = [];
    }

    save() {
        this.onSave.runAll({ "progress": 100 })
    }

    load(data) {
        this.calcLightDepths(0, 0, this.width, this.height);
        this.onGenerate.runAll();
    }

    generate() {
        const w = this.width;
        const d = this.depth;
        const h = this.height;

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < d; y++) {
                for (let z = 0; z < h; z++) {
                    let i = (y * this.height + z) * this.width + x;
                    this.blocks[i] = (y <= (d * 2) / 3) ? 1 : 0;
                }
            }
        }

        this.calcLightDepths(0, 0, w, h);

        this.onGenerate.runAll({ "progress": 100 });
    }

    init() {
        this.camera = this.engine.camera;

        if (!this.selectionMaterial && !this.selectionMesh) {
            this.selectionMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: true,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
            });
            this.selectionMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.selectionMaterial);
            this.selectionMesh.visible = false;
            this.selectionMesh.renderOrder = 999;
            this.engine.scene.add(this.selectionMesh);
        }

        this.player = new Player(this);
        this.inventory = new Inventory(this);

        for (let i = 0; i < 30; i++) {
            const zomb = new Zombie(this, 128, 64, 128, this.engine.scene);
            zomb.resetPos();
            this.entities.push(zomb);
        }
    }

    tick() {
        if (this.pause) return;

        this.player.tick(this.engine.camera);

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.tick();
            if (e.removed) {
                if (typeof e.destroy === 'function') {
                    e.destroy();
                } else if (e.group) {
                    this.scene.remove(e.group);
                }
                this.entities.splice(i, 1);
            }
        }
    }

    render() {
        if (this.pause) return;

        this.moveCameraToPlayer();
        const hit = this.pick(5.0);
        if (hit) {
            this.selectionMesh.visible = true;

            this.selectionMesh.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
            this.selectionMesh.rotation.set(0, 0, 0);

            const offset = 0.5;
            if (hit.f === 0) { this.selectionMesh.position.y -= offset; this.selectionMesh.rotation.x = Math.PI / 2; }
            if (hit.f === 1) { this.selectionMesh.position.y += offset; this.selectionMesh.rotation.x = Math.PI / 2; }
            if (hit.f === 2) { this.selectionMesh.position.z -= offset; }
            if (hit.f === 3) { this.selectionMesh.position.z += offset; }
            if (hit.f === 4) { this.selectionMesh.position.x -= offset; this.selectionMesh.rotation.y = Math.PI / 2; }
            if (hit.f === 5) { this.selectionMesh.position.x += offset; this.selectionMesh.rotation.y = Math.PI / 2; }

            this.selectionMaterial.opacity = 0.2 + Math.sin(performance.now() * 0.01) * 0.1;
        } else {
            this.selectionMesh.visible = false;
        }

        this.engine.levelRenderer.updateFrustum(this.camera);

        this.engine.levelRenderer.render(this.player, 0);
        this.engine.levelRenderer.render(this.player, 1);

        this.entities.forEach(entity => {
            entity.render(this.engine.timer.a);
        });
    }

    moveCameraToPlayer() {
        this.camera.rotation.set(
            THREE.MathUtils.degToRad(this.player.xRot),
            THREE.MathUtils.degToRad(this.player.yRot),
            0,
            'YXZ'
        );

        const a = this.engine.timer.a;
        const x = this.player.xo + (this.player.x - this.player.xo) * a;
        const y = this.player.yo + (this.player.y - this.player.yo) * a;
        const z = this.player.zo + (this.player.z - this.player.zo) * a;

        this.camera.position.set(x, y, z);
        this.camera.translateZ(0.3);
    }

    pick(distance = 5.0) {
        const start = new THREE.Vector3().copy(this.engine.camera.position);
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.engine.camera.quaternion).normalize();

        let x = Math.floor(start.x);
        let y = Math.floor(start.y);
        let z = Math.floor(start.z);

        const stepX = dir.x > 0 ? 1 : -1;
        const stepY = dir.y > 0 ? 1 : -1;
        const stepZ = dir.z > 0 ? 1 : -1;

        const tDeltaX = Math.abs(1 / dir.x);
        const tDeltaY = Math.abs(1 / dir.y);
        const tDeltaZ = Math.abs(1 / dir.z);

        let tMaxX = (dir.x > 0 ? (x + 1 - start.x) : (start.x - x)) * tDeltaX;
        let tMaxY = (dir.y > 0 ? (y + 1 - start.y) : (start.y - y)) * tDeltaY;
        let tMaxZ = (dir.z > 0 ? (z + 1 - start.z) : (start.z - z)) * tDeltaZ;

        let f = -1;
        let dist = 0;

        while (dist < distance) {
            if (this.isSolidTile(x, y, z)) {
                return { x: x, y: y, z: z, f: f };
            }

            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    dist = tMaxX;
                    tMaxX += tDeltaX;
                    x += stepX;
                    f = stepX > 0 ? 4 : 5;
                } else {
                    dist = tMaxZ;
                    tMaxZ += tDeltaZ;
                    z += stepZ;
                    f = stepZ > 0 ? 2 : 3;
                }
            } else {
                if (tMaxY < tMaxZ) {
                    dist = tMaxY;
                    tMaxY += tDeltaY;
                    y += stepY;
                    f = stepY > 0 ? 0 : 1;
                } else {
                    dist = tMaxZ;
                    tMaxZ += tDeltaZ;
                    z += stepZ;
                    f = stepZ > 0 ? 2 : 3;
                }
            }
        }
        return null;
    }

    calcLightDepths(x0, z0, w, h) {
        for (let x = x0; x < x0 + w; x++) {
            for (let z = z0; z < z0 + h; z++) {
                let oldDepth = this.lightDepths[x + z * this.width];
                let y = this.depth - 1;

                while (y > 0 && !this.isLightBlocker(x, y, z)) {
                    y--;
                }

                this.lightDepths[x + z * this.width] = y;

                if (oldDepth !== y) {
                    let yl0 = oldDepth < y ? oldDepth : y;
                    let yl1 = oldDepth > y ? oldDepth : y;

                    for (let listener of this.levelListeners) {
                        listener.lightColumnChanged(x, z, yl0, yl1);
                    }
                }
            }
        }
    }

    addListener(levelListener) {
        this.levelListeners.push(levelListener);
    }

    isTile(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return false;
        }
        return this.blocks[(y * this.height + z) * this.width + x] === 1;
    }

    getTile(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return 0;
        }
        return this.blocks[(y * this.height + z) * this.width + x] & 0xFF;
    }

    isSolidTile(x, y, z) {
        return this.isTile(x, y, z);
    }

    isLightBlocker(x, y, z) {
        return this.isSolidTile(x, y, z);
    }

    isLit(x, y, z) {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.depth && z < this.height)
            return (y >= this.lightDepths[x + z * this.width]);
        return true;
    }

    getCubes(aabb) {
        const aabbs = [];
        let x0 = Math.floor(aabb.x0);
        let x1 = Math.floor(aabb.x1 + 1.0);
        let y0 = Math.floor(aabb.y0);
        let y1 = Math.floor(aabb.y1 + 1.0);
        let z0 = Math.floor(aabb.z0);
        let z1 = Math.floor(aabb.z1 + 1.0);

        x0 = Math.max(0, x0);
        y0 = Math.max(0, y0);
        z0 = Math.max(0, z0);
        x1 = Math.min(this.width, x1);
        y1 = Math.min(this.depth, y1);
        z1 = Math.min(this.height, z1);

        for (let x = x0; x < x1; x++) {
            for (let y = y0; y < y1; y++) {
                for (let z = z0; z < z1; z++) {
                    if (this.isSolidTile(x, y, z)) {
                        aabbs.push(new AABB(x, y, z, x + 1, y + 1, z + 1));
                    }
                }
            }
        }
        return aabbs;
    }

    getBrightness(x, y, z) {
        const dark = 0.5;
        const light = 1.0;
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return light;
        }
        if (y < this.lightDepths[x + z * this.width]) {
            return dark;
        }
        return light;
    }

    setTile(x, y, z, type) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return;
        }
        this.blocks[(y * this.height + z) * this.width + x] = type;
        this.calcLightDepths(x, z, 1, 1);

        for (let listener of this.levelListeners) {
            listener.tileChanged(x, y, z);
        }
    }

    destroy() {
        this.onGenerate.clear();
        this.material.dispose();
        this.selectionMaterial.dispose();
        this.player.destroy();
        this.entities.forEach(e => e.destroy());
    }
}



















export class Player extends Entity {
    constructor(level) {
        super(level);

        this.level = level;
        this.engine = this.level.engine;
        this.input = this.engine.input;

        this.heightOffset = 1.62;

        this.x = 0; this.y = 0; this.z = 0;

        this.xo = 0; this.yo = 0; this.zo = 0;

        this.xd = 0; this.yd = 0; this.zd = 0;

        this.yRot = 0;
        this.xRot = 0;

        this.bb = null;
        this.onGround = false;

        this.b1state = false;
        this.b2state = false;

        this.speedBoost = 10;
        this.jumpBoost = 5;

        this.walkSpeed = 0.1;

        this.jumpPower = 0.5;

        this.event = this.engine.input_manager.mouseMoved.addEvent((pos) => {
            if (document.pointerLockElement) {

                const sensitivity = (this.engine.config.data.Sensitivity || 100) / 100;
                const factor = 1 * sensitivity;
                const invertY = this.engine.config.data.InvertMouse ? -1 : 1;

                this.turn(
                    -pos.movementX * factor,
                    pos.movementY * factor * invertY
                );
            }
        });
        this.event2 = this.engine.input_manager.keyDown.addEvent((key) => {
            if (document.pointerLockElement && key == "KeyF") {
                switch (this.engine.config.data.RenderDistance) {
                    case Enum.RenderDistance.Tiny: this.engine.config.data.RenderDistance = Enum.RenderDistance.Short; break;
                    case Enum.RenderDistance.Short: this.engine.config.data.RenderDistance = Enum.RenderDistance.Normal; break;
                    case Enum.RenderDistance.Normal: this.engine.config.data.RenderDistance = Enum.RenderDistance.Far; break;
                    case Enum.RenderDistance.Far: this.engine.config.data.RenderDistance = Enum.RenderDistance.Tiny; break;
                }
            }
        });

        this.resetPos();
    }

    getSelectedPos() {
        return this.level.pick(5.0);
    }

    placeBlock() {
        const hit = this.getSelectedPos();
        if (!hit) return;

        let x = hit.x;
        let y = hit.y;
        let z = hit.z;

        if (hit.f === 0) y--;
        if (hit.f === 1) y++;
        if (hit.f === 2) z--;
        if (hit.f === 3) z++;
        if (hit.f === 4) x--;
        if (hit.f === 5) x++;

        const playerAABB = this.bb;
        const tileAABB = new AABB(x, y, z, x + 1, y + 1, z + 1);

        if (!tileAABB.intersects(playerAABB)) {
            this.level.setTile(x, y, z, 1);
        }
    }

    destroyBlock() {
        const hit = this.getSelectedPos();
        if (!hit) return;
        this.level.setTile(hit.x, hit.y, hit.z, 0);
    }

    resetPos() {
        let x = Math.random() * this.level.width;
        let y = this.level.depth + 10;
        let z = Math.random() * this.level.height;
        this.setPos(x, y, z);
    }

    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        let w = 0.3;
        let h = 0.9;
        this.bb = new AABB(x - w, y - h, z - w, x + w, y + h, z + w);
    }

    turn(xo, yo) {
        this.yRot += xo * 0.15;
        this.xRot -= yo * 0.15;
        this.xRot = Math.max(-90, Math.min(90, this.xRot));
    }

    tick(camera) {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;

        let xa = 0;
        let za = 0;

        if (document.pointerLockElement) {
            const b1 = this.input.getInputState(Enum.Controls.Button1);
            const b2 = this.input.getInputState(Enum.Controls.Button2);

            if (b1 && !this.b1state) {
                this.b1state = b1;
                this.destroyBlock();
            } else {
                this.b1state = b1;
            }

            if (b2 && !this.b2state) {
                this.b2state = b2;
                this.placeBlock();
            } else {
                this.b2state = b2;
            }

            if (this.input.getInputState("KeyR")) this.resetPos();

            if (this.input.getInputState("ArrowUp") || this.input.getInputState("KeyW")) za -= 1.0;
            if (this.input.getInputState("ArrowDown") || this.input.getInputState("KeyS")) za += 1.0;
            if (this.input.getInputState("ArrowLeft") || this.input.getInputState("KeyA")) xa -= 1.0;
            if (this.input.getInputState("ArrowRight") || this.input.getInputState("KeyD")) xa += 1.0;

            if (this.input.getInputState("Space") && this.onGround) {
                this.yd = this.jumpPower * this.jumpBoost;
            }

            if (this.input.getInputState("KeyG")) {
                const zomb = new Zombie(this.level, 0, 0, 0, this.level.engine.scene);
                zomb.setPos(this.x, this.y, this.z);
                this.level.entities.push(zomb);
            }

            if (this.input.getInputState("KeyH")) {
                this.level.entities[0].destroy();
                this.level.entities.splice(0, 1);
            }

            if (this.y < -100.0) this.resetPos();
        }

        if (xa !== 0 || za !== 0) {
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            right.y = 0;
            right.normalize();

            const moveDir = new THREE.Vector3()
                .addScaledVector(forward, -za)
                .addScaledVector(right, xa);

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();

                const speed = this.onGround ? this.walkSpeed * this.speedBoost : this.walkSpeed * this.speedBoost / 5;

                this.xd += moveDir.x * speed;
                this.zd += moveDir.z * speed;
            }
        }

        this.yd -= 0.08;

        this.move(this.xd, this.yd, this.zd);

        const groundFriction = this.onGround ? 0.546 : 0.91;

        this.xd *= groundFriction;
        this.zd *= groundFriction;
        this.yd *= 0.98;
    }

    move(xa, ya, za) {
        let xaOrg = xa;
        let yaOrg = ya;
        let zaOrg = za;

        let aABBs = this.level.getCubes(this.bb.expand(xa, ya, za));

        for (let box of aABBs) {
            ya = box.clipYCollide(this.bb, ya);
        }
        this.bb.move(0, ya, 0);

        for (let box of aABBs) {
            xa = box.clipXCollide(this.bb, xa);
        }
        this.bb.move(xa, 0, 0);

        for (let box of aABBs) {
            za = box.clipZCollide(this.bb, za);
        }
        this.bb.move(0, 0, za);

        this.onGround = yaOrg != ya && yaOrg < 0;

        if (xaOrg != xa) this.xd = 0;
        if (yaOrg != ya) this.yd = 0;
        if (zaOrg != za) this.zd = 0;

        this.x = (this.bb.x0 + this.bb.x1) / 2.0;
        this.y = this.bb.y0 + 1.62;
        this.z = (this.bb.z0 + this.bb.z1) / 2.0;
    }

    moveRelative(xa, za, speed) {
        let dist = xa * xa + za * za;
        if (dist < 0.01) return;

        dist = speed / Math.sqrt(dist);
        let sin = Math.sin(this.yRot * Math.PI / 180.0);
        let cos = Math.cos(this.yRot * Math.PI / 180.0);

        this.xd += (xa * dist) * cos - (za * dist) * sin;
        this.zd += (za * dist) * cos + (xa * dist) * sin;
    }

    destroy() {
        this.engine.input_manager.mouseMoved.removeEvent(this.event);
    }
}








export class Inventory {
    constructor(level) {
        this.level = level;

        this.slots = new Array(9);
        this.selected = 0;

        this.slots[0] = 1;
        this.slots[1] = 2;
        this.slots[2] = 3;
        this.slots[3] = 4;
        this.slots[4] = 5;
        this.slots[5] = 6;
        this.slots[6] = 7;
        this.slots[7] = 8;
        this.slots[8] = 9;
    }

    getSelectedSlotId() {
        return this.slots[this.selected];
    }

    scroll(direction) {
        if (direction > 0) direction = 1;
        if (direction < 0) direction = -1;
        this.selected -= direction;
        while (this.selected < 0) this.selected += this.slots.length;
        while (this.selected >= this.slots.length) this.selected -= this.slots.length;
    }

    selectSlot(index) {
        if (index >= 0 && index < this.slots.length) {
            this.selected = index;
        }
    }

    pickBlock(blockId) {
        if (blockId <= 0) return;
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === blockId) {
                this.selected = i;
                return;
            }
        }

        if (Inventory.ALLOWED_TILES.includes(blockId)) {
            this.slots[this.selected] = blockId;
        }
    }
}









export class Timer {
    constructor(ticksPerSecond) {
        this.ticksPerSecond = ticksPerSecond;
        this.lastTime = performance.now();

        this.ticks = 0;
        this.a = 0.0;
        this.timeScale = 1.0;
        this.fps = 0.0;
        this.passedTime = 0.0;

        this.MS_PER_SECOND = 1000.0;
        this.MAX_MS_PER_UPDATE = 1000.0;
        this.MAX_TICKS_PER_UPDATE = 100;
    }

    advanceTime() {
        const now = performance.now();
        let passedMs = now - this.lastTime;
        this.lastTime = now;

        if (passedMs < 0) passedMs = 0;
        if (passedMs > this.MAX_MS_PER_UPDATE) {
            passedMs = this.MAX_MS_PER_UPDATE;
        }

        this.fps = this.MS_PER_SECOND / passedMs;

        this.passedTime += (passedMs * this.timeScale * this.ticksPerSecond) / this.MS_PER_SECOND;
        this.ticks = Math.floor(this.passedTime);

        if (this.ticks > this.MAX_TICKS_PER_UPDATE) {
            this.ticks = this.MAX_TICKS_PER_UPDATE;
        }

        this.passedTime -= this.ticks;
        this.a = this.passedTime;
    }
}








export class VoxWheel {
    constructor({ assets = new AssetList() }) {

        this.assets = assets;

        this.asset_manager = new AssetManager(this);

        this.fogColor = new THREE.Color(0.5, 0.8, 1.0);
        this.skyFogColor = new THREE.Color(0.5, 0.8, 1.0);
        this.waterFogColor = new THREE.Color(0.2, 0.2, 0.8);
        this.lavaFogColor = new THREE.Color(0.8, 0.2, 0.2);

        this.skyFogDensity = 0.008;
        this.waterFogDensity = 0.1;
        this.lavaFogDensity = 0.4;

        this.timer = new Timer(20.0);

        this.t = new Tesselator();
        this.renderer = null;
        this.canvas = null;
        this.ctx = null;

        this.canvas_renderer = new CanvasRenderer(this);

        this.input = new InputList();
        this.config = new ConfigList();
        this.input_manager = new InputManager(this);

        this.listener = new THREE.AudioListener();

        this.camera = new THREE.PerspectiveCamera(this.config.data.FOV, this.canvas_renderer.POM, 0.025, 1000.0);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.025);

        this.camera.add(this.listener);
        this.scene.add(this.camera);

        this.renderState = new RenderState(this);

        this.splash = getRandomSplash();

        this.screen = null;
        this.extraScreen = null;

        this.level = null;
        this.levelRenderer = null;

        this.bitmap_font = new BitmapFont(this, "font");

        this.date = new Date();

        this.worldStorage = new WorldStorage();

        this.assetLoadingScreen = new AssetLoadingScreen(this);
        this.logoScreen = new LogoScreen(this);
        this.menuScreen = new MenuScreen(this);
        this.optionsScreen = new OptionsScreen(this);
        this.worldSelectScreen = new WorldSelectScreen(this);
        this.createWorldScreen = new CreateWorldScreen(this);
        this.generateWorldScreen = new GenerateWorldScreen(this);
        this.saveWorldScreen = new SaveWorldScreen(this);
        this.gameMenuScreen = new GameMenuScreen(this);
        this.inGameScreen = new InGameScreen(this);
        this.inGameOptionsScreen = new InGameOptionsScreen(this);
    }

    loadWorld(worldzip) {
        this.setScreen(this.generateWorldScreen);
        this.extraScreen = null;

        this.renderer.setClearColor(this.fogColor);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        this.scene.background = this.fogColor;

        this.level = new Level(this, 256, 256, 64);
        this.levelRenderer = new LevelRenderer(this.level, this.scene);

        this.levelRenderer.init();

        this.level.onGenerate.addEvent((progress) => {
            this.generateWorldScreen.onGenerate(progress);
        });

        this.level.generate();
    }

    saveWorld() {
        this.level.save();
    }

    saveAndQuitWorld() {
        this.setScreen(this.saveWorldScreen);
        this.extraScreen = null;

        this.level.onSave.addEvent((progress) => {
            this.saveWorldScreen.onSave(progress);
        });

        this.level.save();

        this.cleanScene();
        this.levelRenderer.destroy();
        this.level.destroy();
    }

    leaveWorld() {
        this.setRenderState(Enum.RenderState.Clear);
        this.setScreen(this.menuScreen);
        this.extraScreen = null;
    }

    enterWorld() {
        this.renderState.state = Enum.RenderState.InGame;
        this.level.onGenerate.clear();
        this.level.init();
        this.config.data.RenderFactor = 1;
        this.input_manager.lockMouse();
        this.setScreen(this.inGameScreen);
    }

    cleanScene() {
        const disposeMaterial = (material) => {
            if (!material) return;

            Object.keys(material).forEach((prop) => {
                const value = material[prop];
                if (value && typeof value === 'object' && value.isTexture) {
                    value.dispose();
                }
            });

            material.dispose();
        };

        this.scene.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => disposeMaterial(mat));
                } else {
                    disposeMaterial(child.material);
                }
            }
        });

        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    }

    ms() {
        return performance.now();
    }

    _getLogarithmicVolume(relativeVolume) {
        const linearMaster = this.config.data.MasterVolume / 100;
        const combinedLinear = relativeVolume * linearMaster;
        return Math.pow(combinedLinear, 3);
    }

    playSound(soundID, volume = 1, speed = 1, time = 0) {
        const asset = this.asset_manager.getAsset(soundID, 2);
        if (!asset || !asset.isLoaded) return;

        const finalVolume = this._getLogarithmicVolume(volume);
        if (finalVolume <= 0) return;

        const sound = this.assets.getAmbientSound(soundID);
        if (sound) {
            if (sound.isPlaying) sound.stop();

            sound.setVolume(finalVolume);
            sound.setPlaybackRate(speed);
            sound.play(time);
        }
    }

    playRandom() {
        const randomSound = ["bow", "break", "classic_hurt", "drink", "explode", "fizz", "fuse", "pop", "splash", "wood_click"];
        const randomIndex = Math.floor(Math.random() * randomSound.length);
        const soundID = randomSound[randomIndex];

        this.playSound(soundID);
    }

    playClick() {
        //this.playRandom()
        this.playSound("click");
    }

    playHover() {
        if (this.config.data.ExtraSounds) this.playSound("hover");
    }

    playRelease() {
        if (this.config.data.ExtraSounds) this.playSound("hover_reverse");
    }

    playPositionalSound(soundID, positionOrObject, volume = 1, refDistance = 1, maxDistance = 100, speed = 1, time = 0) {
        const asset = this.asset_manager.getAsset(soundID);
        if (!asset || !asset.isLoaded) return;

        const finalVolume = this._getLogarithmicVolume(volume);
        if (finalVolume <= 0) return;

        const sound = this.assets.getPositionalSound(soundID);
        if (!sound) return;

        if (sound.isPlaying) sound.stop();

        sound.setRefDistance(refDistance);
        sound.setMaxDistance(maxDistance);
        sound.setVolume(finalVolume);
        sound.setPlaybackRate(speed);

        if (positionOrObject instanceof THREE.Object3D) {
            positionOrObject.add(sound);
            sound.play(time);
        } else if (positionOrObject && typeof positionOrObject.x === 'number') {
            const dummyTarget = new THREE.Object3D();
            dummyTarget.position.copy(positionOrObject);
            this.scene.add(dummyTarget);

            dummyTarget.add(sound);
            sound.play(time);

            const duration = (sound.buffer.duration / speed) * 1000;
            setTimeout(() => {
                dummyTarget.remove(sound);
                this.scene.remove(dummyTarget);
            }, duration + 200);
        }
    }

    setPanorama(p0, p1, p2, p3, p4, p5) {
        if (p0 && p1 && p2 && p3 && p4 && p5) {
            const cubeTexture = new THREE.CubeTexture([
                p1.image, // +X (Vpravo)
                p3.image, // -X (Vlevo)
                p4.image, // +Y (Nahoře)
                p5.image, // -Y (Dole)
                p0.image, // +Z (Vepředu)
                p2.image  // -Z (Vzadu)
            ]);

            cubeTexture.needsUpdate = true;
            cubeTexture.colorSpace = THREE.LinearSRGBColorSpace;
            this.scene.background = cubeTexture;
        }
    }

    setScreen(screen) {
        screen.turnPage(0);
        this.screen = screen;
        this.screen.init();
    }

    setExtraScreen(screen) {
        screen.turnPage(0);
        this.extraScreen = screen;
        this.extraScreen.init();
    }

    setRenderState(state) {
        this.renderState.state = state;
    }

    async run() {
        await this.init();
        this.loop();
    }

    async init() {
        console.log("initializing..");

        if (typeof this.renderer.init === 'function') {
            await this.renderer.init();
        }

        this.setScreen(this.assetLoadingScreen);

        await this.asset_manager.loadAll();

        this.setScreen(this.logoScreen);

        this.input_manager.init();
    }

    renderGUI() {
        if (this.screen) {
            this.screen.render(this.ctx);
        }
        if (this.extraScreen) {
            this.extraScreen.render(this.ctx);
        }
    }

    tick() {
        this.level.tick();
    }

    render() {
        if (this.renderState.state == Enum.RenderState.InGame) {
            this.timer.advanceTime();
            for (let i = 0; i < this.timer.ticks; i++) {
                this.tick();
            }

            this.level.render();
        }
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

const texturePath = "../assets/textures/";
const audioPath = "../assets/audio/";

const newTexture = (id, subfolder = "", type = "png", filename) => assets.newAsset(id, texturePath + subfolder + (filename == undefined ? id : filename) + "." + type, Enum.AssetType.Texture);
const newAudio = (id, subfolder = "", type = "ogg", filename) => assets.newAsset(id, audioPath + subfolder + (filename == undefined ? id : filename) + "." + type, Enum.AssetType.Audio);

newTexture("pack");
newTexture("font", "font/", "gif");
newTexture("terrain");
newTexture("clouds");
newTexture("steve", un, un, "char");
newTexture("panorama0", "pano/");
newTexture("panorama1", "pano/");
newTexture("panorama2", "pano/");
newTexture("panorama3", "pano/");
newTexture("panorama4", "pano/");
newTexture("panorama5", "pano/");
newTexture("gamelogo");
newTexture("gui", "gui/");
newTexture("icons", "gui/");
newTexture("dirt");

newAudio("electronic", un, "wav");
newAudio("funk", un, "wav");
newAudio("jazz", un, "wav");
newAudio("rock", un, "wav");
newAudio("click", "random/");
newAudio("hover", "random/");
newAudio("hover_reverse", "random/");
newAudio("bow", "random/");
newAudio("break", "random/");
newAudio("hover_reverse", "random/");
newAudio("classic_hurt", "random/");
newAudio("drink", "random/");
newAudio("explode1", "random/");
newAudio("fizz", "random/");
newAudio("fuse", "random/");
newAudio("levelup", "random/");
newAudio("orb", "random/");
newAudio("pop", "random/");
newAudio("splash", "random/");
newAudio("wood_click", "random/");

const g = new VoxWheel({ assets: assets })

await g.run();
