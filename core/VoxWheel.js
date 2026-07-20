







import * as THREE from "../js/libs/three.module.min.js"
import { GLTFLoader } from "../js/libs/GLTFLoader.js";
import { RGBELoader } from "../js/libs/RGBELoader.js";
import { clone } from "../js/libs/SkeletonUtils.js";








export const deg2rad = Math.PI / 180;
export const rad2deg = 180 / Math.PI;

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const DEG2RAD = (deg) => { return deg * Math.PI / 180 };
export const RAD2DEG = (rad) => { return rad * 180 / Math.PI };

export const log = (data) => { console.log(data) };

export const isPointInBox = (px, py, bx, by, bw, bh) => {
    return px >= bx && px <= bx + bw && py >= by && py <= by + bh;
}








const splashes = [
    "As seen on TV!", "Awesome!", "100% pure!", "May contain nuts!", "Better than Prey!",
    "More polygons!", "Sexy!", "Limited edition!", "Flashing letters!", "Made by Notch!",
    "It's here!", "Best in class!", "It's finished!", "Kind of dragon free!", "Excitement!",
    "More than 500 sold!", "One of a kind!", "Heaps of hits on YouTube!", "Indev!",
    "Spiders everywhere!", "Check it out!", "Holy cow, man!", "It's a game!", "Made in Sweden!",
    "Uses LWJGL!", "Reticulating splines!", "Minecraft!", "Yaaay!", "Singleplayer!",
    "Keyboard compatible!", "Undocumented!", "Ingots!", "Exploding creepers!", "That's no moon!",
    "l33t!", "Create!", "Survive!", "Dungeon!", "Exclusive!", "The bee's knees!", "Down with O.P.P.!",
    "Closed source!", "Classy!", "Wow!", "Not on steam!", "Oh man!", "Awesome community!",
    "Pixels!", "Teetsuuuuoooo!", "Kaaneeeedaaaa!", "Now with difficulty!", "Enhanced!",
    "90% bug free!", "Pretty!", "12 herbs and spices!", "Fat free!", "Absolutely no memes!",
    "Free dental!", "Ask your doctor!", "Minors welcome!", "Cloud computing!", "Legal in Finland!",
    "Hard to label!", "Technically good!", "Bringing home the bacon!", "Indie!", "GOTY!",
    "Ceci n'est pas une title screen!", "Euclidian!", "Now in 3D!", "Inspirational!", "Herregud!",
    "Complex cellular automata!", "Yes, sir!", "Played by cowboys!", "OpenGL 1.2!", "Thousands of colors!",
    "Try it!", "Age of Wonders is better!", "Try the mushroom stew!", "Sensational!", "Hot tamale, hot hot tamale!",
    "Play him off, keyboard cat!", "Guaranteed!", "Macroscopic!", "Bring it on!", "Random splash!",
    "Call your mother!", "Monster infighting!", "Loved by millions!", "Ultimate edition!",
    "Freaky!", "You've got a brand new key!", "Water proof!", "Uninflammable!", "Whoa, dude!",
    "All inclusive!", "Tell your friends!", "NP is not in P!", "Notch <3 ez!", "Music by C418!",
    "Livestreamed!", "Haunted!", "Polynomial!", "Terrestrial!", "All is full of love!", "Full of stars!",
    "Scientific!", "Cooler than Spock!", "Collaborate and listen!", "Never dig down!",
    "Take frequent breaks!", "Not linear!", "Han shot first!", "Nice to meet you!", "Buckets of lava!",
    "Ride the pig!", "Larger than Earth!", "sqrt(-1) love you!", "Phobos anomaly!", "Punching wood!",
    "Falling off cliffs!", "0% sugar!", "150% hyperbole!", "Synecdoche!", "Let's danec!",
    "Seecret Friday update!", "Reference implementation!", "Lewd with two dudes with food!",
    "Kiss the sky!", "20 GOTO 10!", "Verlet intregration!", "Peter Griffin!", "Do not distribute!",
    "Cogito ergo sum!", "4815162342 lines of code!", "A skeleton popped out!", "The Work of Notch!",
    "The sum of its parts!", "BTAF used to be good!", "I miss ADOM!", "umop-apisdn!", "OICU812!",
    "Bring me Ray Cokes!", "Finger-licking!", "Thematic!", "Pneumatic!", "Sublime!",
    "Octagonal!", "Une baguette!", "Gargamel plays it!", "Rita is the new top dog!",
    "SWM forever!", "Representing Edsbyn!", "Matt Damon!", "Supercalifragilisticexpialidocious!",
    "Consummate V's!", "Cow Tools!", "Double buffered!", "Fan fiction!", "Flaxkikare!",
    "Jason! Jason! Jason!", "Hotter than the sun!", "Internet enabled!", "Autonomous!",
    "Engage!", "Fantasy!", "DRR! DRR! DRR!", "Kick it root down!", "Regional resources!",
    "Woo, facepunch!", "Woo, somethingawful!", "Woo, /v/!", "Woo, tigsource!", "Woo, minecraftforum!",
    "Woo, worldofminecraft!", "Woo, reddit!", "Woo, 2pp!", "Google anlyticsed!", "Now supports åäö!",
    "Give us Gordon!", "Tip your waiter!", "Very fun!", "12345 is a bad password!",
    "Vote for net neutrality!", "Lives in a pineapple under the sea!", "MAP11 has two names!",
    "Omnipotent!", "Gasp!", "...!", "Bees, bees, bees, bees!", "Jag känner en bot!",
    "This text is hard to read if you play the game at the default resolution, but at 1080p it's fine!",
    "Haha, LOL!", "Hampsterdance!", "Switches and ores!", "Menger sponge!", "idspispopd!",
    "Eple (original edit)!", "So fresh, so clean!", "Slow acting portals!", "Try the Nether!",
    "Don't look directly at the bugs!", "Oh, ok, Pigmen!", "Finally with ladders!",
    "Scary!", "Play Minecraft, Watch Topgear, Get Pig!", "Twittered about!", "Jump up, jump up, and get down!",
    "Joel is neat!", "A riddle, wrapped in a mystery!", "Huge tracts of land!", "Welcome to your Doom!",
    "Stay a while, stay forever!", "Stay a while and listen!", "Treatment for your rash!",
    "\"Autological\" is!", "Information wants to be free!", "\"Almost never\" is an interesting concept!",
    "Lots of truthiness!", "The creeper is a spy!", "Turing complete!", "It's groundbreaking!",
    "Let our battle's begin!", "The sky is the limit!", "Jeb has amazing hair!", "Casual gaming!",
    "Undefeated!", "Kinda like Lemmings!", "Follow the train, CJ!", "Leveraging synergy!",
    "This message will never appear on the splash screen, isn't that weird?", "DungeonQuest is unfair!",
    "110813!", "90210!", "Check out the far lands!", "Tyrion would love it!", "Also try VVVVVV!",
    "Also try Super Meat Boy!", "Also try Terraria!", "Also try Mount And Blade!", "Also try Project Zomboid!",
    "Also try World of Goo!", "Also try Limbo!", "Also try Pixeljunk Shooter!", "Also try Braid!",
    "That's super!", "Bread is pain!", "Read more books!", "Khaaaaaaaaan!", "Less addictive than TV Tropes!",
    "More addictive than lemonade!", "Bigger than a bread box!", "Millions of peaches!", "Fnord!",
    "This is my true form!", "Totally forgot about Dre!", "Don't bother with the clones!", "Pumpkinhead!",
    "Hobo humping slobo babe!", "Made by Jeb!", "Has an ending!", "Finally complete!", "Feature packed!",
    "Boots with the fur!", "Stop, hammertime!", "Testificates!", "Conventional!", "Homeomorphic to a 3-sphere!",
    "Doesn't avoid double negatives!", "Place ALL the blocks!", "Does barrel rolls!", "Meeting expectations!",
    "PC gaming since 1873!", "Ghoughpteighbteau tchoghs!", "Déjà vu!", "Déjà vu!", "Got your nose!",
    "Haley loves Elan!", "Afraid of the big, black bat!", "Doesn't use the U-word!", "Child's play!",
    "See you next Friday or so!", "From the streets of Södermalm!", "150 bpm for 400000 minutes!",
    "Technologic!", "Funk soul brother!", "Pumpa kungen!"
];








export const getRandomSplash = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    if (month === 11 && day === 9) {
        return "Happy birthday, ez!";
    }
    if (month === 6 && day === 1) {
        return "Happy birthday, Notch!";
    }
    if (month === 12 && day === 24) {
        return "Merry X-mas!";
    }
    if (month === 1 && day === 1) {
        return "Happy new year!";
    }

    return splashes[Math.floor(Math.random() * splashes.length)];
}








export const createOverlayGradient = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const whiteGrad = ctx.createLinearGradient(0, 0, 0, height);
    whiteGrad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    whiteGrad.addColorStop(1, "rgba(255, 255, 255, 1.0)");
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    const darkGrad = ctx.createLinearGradient(0, 0, 0, height);
    darkGrad.addColorStop(0, "rgba(0, 0, 0, 0.0)");
    darkGrad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, width, height);

    return canvas;
}








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
    },
    "RenderState": {
        "Clear": 0,
        "MenuBackground": 1
    },
    "CursorType": {
        "Pointer": "pointer",
        "Default": "default",
        "Crosshair": "crosshair",
        "Grab": "grab",
        "None": "none"
    },
    "Color": {
        "SelectButtonColor": 0xF7FF88,
        "NormalButtonColor": 0xFFFFFF,
        "SelectTextColor": 0xFAFA00,
    },
    "Difficulty": {
        "Peaceful": 0,
        "Easy": 1,
        "Normal": 2,
        "Hard": 3
    },
    "Graphics": {
        "Fast": 0,
        "Fancy": 1
    },
    "RenderDistance": {
        "Short": 0,
        "Tiny": 1,
        "Normal": 2,
        "Far": 3
    },
    "Performance": {
        "PowerSaver": 0,
        "Balanced": 1,
        "MaxFPS": 2,
    },
    "GUIScale": {
        "Auto": 0,
        "Small": 1,
        "Normal": 2,
        "Large": 3
    },
    "Particles": {
        "Minimal": 0,
        "Decreased": 1,
        "All": 2,
    },
    "Controls": {
        "Q": "KeyQ",
        "W": "KeyW",
        "E": "KeyE",
        "R": "KeyR",
        "T": "KeyT",
        "Y": "KeyY",
        "U": "KeyU",
        "I": "KeyI",
        "O": "KeyO",
        "P": "KeyP",
        "A": "KeyA",
        "S": "KeyS",
        "D": "KeyD",
        "F": "KeyF",
        "G": "KeyG",
        "H": "KeyH",
        "J": "KeyJ",
        "K": "KeyK",
        "L": "KeyL",
        "Z": "KeyZ",
        "X": "KeyX",
        "C": "KeyC",
        "V": "KeyV",
        "B": "KeyB",
        "N": "KeyN",
        "M": "KeyM",
        "SPACE": "Space",
        "BACKSPACE": "Backspace",
        "ENTER": "Enter",
        "LSHIFT": "LeftShift",
        "RSHIFT": "RightShift",
        "LCONTROL": "LeftControl",
        "RCONTROL": "RightControl",
        "ESCAPE": "Esc",
        "TAB": "Tab",
        "Button 1": "button1",
        "Button 2": "button2",
        "Button 3": "button3",
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

        for (const asset of assetsIterable) {
            try {
                await this.load(asset);
            } catch (err) {
                console.error(`Failed to load asset: ${asset.id}`, err);
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

        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');

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
        const k = (c & 0x8) << 3;
        const r = ((c >> 2) & 1) * 191 + k;
        const g = ((c >> 1) & 1) * 191 + k;
        const b = (c & 1) * 191 + k;
        return (r << 16) | (g << 8) | b;
    }

    _shadowColor(color) {
        return (color & 0xFCFCFC) >> 2;
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

    drawText(text, x, y, rotation = 0, shadow = true, scale = 3, hexColor = 0xFFFFFF, opacity = 1, center = false) {
        if (!this.isReady) return;

        const textWidth = this.getTextWidth(text, scale);
        const textHeight = 8 * scale;

        if (textWidth <= 0) return;

        const originalSmoothing = this.ctx.imageSmoothingEnabled;
        this.ctx.imageSmoothingEnabled = false;

        let defaultColor;
        if (typeof hexColor === 'number') {
            defaultColor = hexColor & 0xFFFFFF;
        } else {
            const parsed = this._parseHexColorString(hexColor);
            defaultColor = parsed !== null ? parsed : 0xFFFFFF;
        }

        const shadowOffset = shadow ? Math.ceil(scale) : 0;
        this.tempCanvas.width = Math.ceil(textWidth) + shadowOffset;
        this.tempCanvas.height = Math.ceil(textHeight) + shadowOffset;

        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.imageSmoothingEnabled = false;

        if (shadow) {
            this._renderToContext(this.tempCtx, text, shadowOffset, shadowOffset, scale, defaultColor, true, opacity);
        }
        this._renderToContext(this.tempCtx, text, 0, 0, scale, defaultColor, false, opacity);

        this.ctx.save();

        const halfW = this.tempCanvas.width / 2;
        const halfH = this.tempCanvas.height / 2;

        if (center) {
            this.ctx.translate(Math.round(x), Math.round(y));
            if (rotation !== 0) this.ctx.rotate(rotation);
            this.ctx.drawImage(this.tempCanvas, -Math.round(halfW), -Math.round(halfH));
        } else {
            if (rotation !== 0) {
                this.ctx.translate(Math.round(x + halfW), Math.round(y + halfH));
                this.ctx.rotate(rotation);
                this.ctx.drawImage(this.tempCanvas, -halfW, -halfH);
            } else {
                this.ctx.drawImage(this.tempCanvas, Math.round(x), Math.round(y));
            }
        }

        this.ctx.restore();
        this.ctx.imageSmoothingEnabled = originalSmoothing;
    }

    _renderToContext(ctx, text, x, y, scale, defaultColor, isShadow, opacity) {
        let xo = 0;

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
                const targetX = Math.round(x + xo);
                const targetY = Math.round(y);
                const targetW = Math.round(8 * scale);
                const targetH = Math.round(8 * scale);

                ctx.save();
                ctx.globalAlpha = opacity;

                ctx.drawImage(
                    currentTexture,
                    srcX, srcY, 8, 8,
                    targetX, targetY, targetW, targetH
                );

                ctx.restore();
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

export class GUIBlurPanel extends GUIDrawCommand {
    constructor(intensity = 10, x = 0, y = 0, w = 200, h = 200, rotation = 0, opacity = 1) {
        super();

        this.intensity = intensity;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.translate(-this.w / 2, -this.h / 2);
        } else {
            ctx.translate(targetX, targetY);
        }

        ctx.beginPath();
        ctx.rect(0, 0, this.w, this.h);
        ctx.clip();

        ctx.save();
        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(this.w / 2, this.h / 2);
            ctx.rotate(-totalRotation);
            ctx.translate(-centerX, -centerY);
        } else {
            ctx.translate(-targetX, -targetY);
        }

        ctx.filter = `blur(${this.intensity}px)`;
        ctx.drawImage(ctx.canvas, 0, 0);

        ctx.restore();
        ctx.restore();
    }
}


export class GUIColorPanel extends GUIDrawCommand {
    constructor(color, x, y, w, h, rotation = 0, opacity = 1) {
        super();

        this.color = color;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(targetX, targetY, this.w, this.h);
        }
        ctx.restore();
    }
}


export class GUITexturePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h, rotation = 0, opacity = 1) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const asset = this.asset_manager.getAsset(this.textureID);

        if (!asset || !asset.isLoaded)
            return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.drawImage(
                asset.data.image,
                -this.w / 2,
                -this.h / 2,
                this.w,
                this.h
            );
        } else {
            ctx.drawImage(
                asset.data.image,
                targetX,
                targetY,
                this.w,
                this.h
            );
        }
        ctx.restore();
    }
}


export class GUIImagePanel extends GUIDrawCommand {
    constructor(engine, image, x, y, w, h, rotation = 0, opacity = 1) {
        super();

        this.asset_manager = engine.asset_manager;
        this.image = image;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();

        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.drawImage(
                this.image,
                -this.w / 2,
                -this.h / 2,
                this.w,
                this.h
            );
        } else {
            ctx.drawImage(
                this.image,
                targetX,
                targetY,
                this.w,
                this.h
            );
        }
        ctx.restore();
    }
}


export class GUITiledImagePanel extends GUIDrawCommand {
    constructor(engine, image, x, y, w, h, patternScale = 1, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super();

        this.asset_manager = engine.asset_manager;
        this.image = image;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.patternScale = patternScale;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const image = this.image;
        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalPanelRotation = (element.globalRot + this.rotation) * deg2rad;

        const srcW = image.width;
        const srcH = image.height;

        const tileW = srcW * this.patternScale;
        const tileH = srcH * this.patternScale;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalPanelRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalPanelRotation);

            ctx.beginPath();
            ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
            ctx.clip();
            ctx.translate(-this.w / 2, -this.h / 2);
        } else {
            ctx.beginPath();
            ctx.rect(targetX, targetY, this.w, this.h);
            ctx.clip();
            ctx.translate(targetX, targetY);
        }

        if (this.patternRotation !== 0) {
            ctx.rotate(this.patternRotation * deg2rad);
        }

        const startX = Math.floor(this.patternOffsetX * this.patternScale) % tileW;
        const startY = Math.floor(this.patternOffsetY * this.patternScale) % tileH;

        const boundSize = Math.max(this.w, this.h) * (this.patternRotation !== 0 ? 2.0 : 1.0);
        const margin = (boundSize - this.w) / 2;

        const drawMinX = -margin - tileW;
        const drawMaxX = this.w + margin + tileW;
        const drawMinY = -margin - tileH;
        const drawMaxY = this.h + margin + tileH;

        for (let offsetX = drawMinX + startX; offsetX < drawMaxX; offsetX += tileW) {
            for (let offsetY = drawMinY + startY; offsetY < drawMaxY; offsetY += tileH) {
                ctx.drawImage(
                    image,
                    0, 0, srcW, srcH,
                    offsetX, offsetY, tileW, tileH
                );
            }
        }

        ctx.restore();
    }
}


export class GUITiledTexturePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h, patternScale = 1, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.patternScale = patternScale;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const asset = this.asset_manager.getAsset(this.textureID);
        if (!asset || !asset.isLoaded) return;

        const image = asset.data.image;
        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalPanelRotation = (element.globalRot + this.rotation) * deg2rad;

        const srcW = image.width;
        const srcH = image.height;

        const tileW = srcW * this.patternScale;
        const tileH = srcH * this.patternScale;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalPanelRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalPanelRotation);

            ctx.beginPath();
            ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
            ctx.clip();
            ctx.translate(-this.w / 2, -this.h / 2);
        } else {
            ctx.beginPath();
            ctx.rect(targetX, targetY, this.w, this.h);
            ctx.clip();
            ctx.translate(targetX, targetY);
        }

        if (this.patternRotation !== 0) {
            ctx.rotate(this.patternRotation * deg2rad);
        }

        const startX = Math.floor(this.patternOffsetX * this.patternScale) % tileW;
        const startY = Math.floor(this.patternOffsetY * this.patternScale) % tileH;

        const boundSize = Math.max(this.w, this.h) * (this.patternRotation !== 0 ? 2.0 : 1.0);
        const margin = (boundSize - this.w) / 2;

        const drawMinX = -margin - tileW;
        const drawMaxX = this.w + margin + tileW;
        const drawMinY = -margin - tileH;
        const drawMaxY = this.h + margin + tileH;

        for (let offsetX = drawMinX + startX; offsetX < drawMaxX; offsetX += tileW) {
            for (let offsetY = drawMinY + startY; offsetY < drawMaxY; offsetY += tileH) {
                ctx.drawImage(
                    image,
                    0, 0, srcW, srcH,
                    offsetX, offsetY, tileW, tileH
                );
            }
        }

        ctx.restore();
    }
}


export class GUITextureSpritePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h, cords = [0, 0, 0, 0], rotation = 0, opacity = 1) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.cords = cords

        this.sx = this.cords[0];
        this.sy = this.cords[1];
        this.sw = this.cords[2];
        this.sh = this.cords[3];

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        this.sx = this.cords[0];
        this.sy = this.cords[1];
        this.sw = this.cords[2];
        this.sh = this.cords[3];

        if (this.visible === false) return;

        const asset = this.asset_manager.getAsset(this.textureID);

        if (!asset || !asset.isLoaded)
            return;

        const image = asset.data.image;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = element.globalRot + this.rotation;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);

            ctx.drawImage(
                image,
                this.sx, this.sy, this.sw, this.sh,
                -this.w / 2, -this.h / 2, this.w, this.h
            );
        } else {
            ctx.drawImage(
                image,
                this.sx, this.sy, this.sw, this.sh,
                targetX, targetY, this.w, this.h
            );
        }

        ctx.restore();
    }
}


export class GUIClipBegin extends GUIDrawCommand {
    constructor(x, y, w, h, rotation = 0) {
        super();

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
    }

    render(ctx, element) {
        if (!this.visible) return;

        ctx.save();

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = element.globalRot + this.rotation;

        ctx.beginPath();
        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
        } else {
            ctx.rect(targetX, targetY, this.w, this.h);
        }

        ctx.clip();
    }
}


export class GUIEnd extends GUIDrawCommand {
    render(ctx) {
        ctx.restore();
    }
}


export class GUIText extends GUIDrawCommand {
    constructor(font, text, x, y, rotation = 0, size = 15, color = "white", opacity = 1) {
        super();

        this.font = font;
        this.text = text;

        this.x = x;
        this.y = y;

        this.rotation = rotation;

        this.size = size;
        this.color = color;
        this.opacity = opacity;
    }


    render(ctx, element) {
        if (!this.visible) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        this.font.drawText(
            this.text,
            element.globalX + this.x,
            element.globalY + this.y,
            true,
            this.size,
            this.color
        );

        ctx.restore();
    }
}


export class GUIBitmapText extends GUIDrawCommand {
    constructor(engine, text, x, y, rotation = 0, size = 5, color = 0xFFFFFF, shadow = true, opacity = 1, center = false) {
        super();
        this.bitmap_font = engine.bitmap_font;
        this.text = text;
        this.shadow = shadow;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.size = size;
        this.color = color;
        this.opacity = opacity;
        this.center = center;
    }

    getTextWidth(text = this.text, scale = this.size) {
        return this.bitmap_font.getTextWidth(text, scale);
    }

    getTextHeight(scale = this.size) {
        return scale * 8;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const totalRotRad = (element.globalRot + this.rotation) * deg2rad;
        this.bitmap_font.drawText(
            this.text,
            element.globalX + this.x,
            element.globalY + this.y,
            totalRotRad,
            this.shadow,
            this.size,
            this.color,
            this.opacity,
            this.center
        );
    }
}








export class GUIElement {
    constructor(screen) {
        this.screen = screen;
        this.engine = this.screen.engine;

        this.x = 0;
        this.y = 0;

        this.width = 1;
        this.height = 1;

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

    get globalRot() {
        return this.parent ? this.parent.globalRot + this.rotation : this.rotation;
    }

    add(command) {
        this.drawCommands.push(command);

        return command
    }

    clear() {
        this.drawCommands = [];
    }

    addColorPanel(color, x, y, w, h, rotation, opacity) {
        return this.add(new GUIColorPanel(color, x, y, w, h, rotation, opacity));
    }

    addTexturePanel(textureID, x, y, w, h, rotation, opacity) {
        return this.add(new GUITexturePanel(this.engine, textureID, x, y, w, h, rotation, opacity));
    }

    addText(font, text, x, y, rotation, size, color, opacity) {
        return this.add(new GUIText(font, text, x, y, rotation, size, color, opacity));
    }

    addBitmapText(text, x, y, rotation, size, color, shadow, opacity, center) {
        return this.add(new GUIBitmapText(this.engine, text, x, y, rotation, size, color, shadow, opacity, center));
    }

    addImagePanel(image, x, y, w, h, rotation, opacity) {
        return this.add(new GUIImagePanel(this.engine, image, x, y, w, h, rotation, opacity));
    }

    addTextureSpritePanel(textureID, x, y, w, h, cords, rotation, opacity) {
        return this.add(new GUITextureSpritePanel(this.engine, textureID, x, y, w, h, cords, rotation, opacity))
    }

    render(ctx) {
        if (!this.visible) return;

        this.drawCommands.forEach((command) => {
            command.render(ctx, this);
        })
    }
}


export class GUITexturePanelElement extends GUIElement {
    constructor(screen, textureID, x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.textureID = textureID;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.texturePanel = this.add(new GUITexturePanel(
            this.engine,
            textureID,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.texturePanel.w = this.width * this.scale;
        this.texturePanel.h = this.height * this.scale;
        this.texturePanel.textureID = this.textureID;
        this.texturePanel.rotation = this.rotation;
        this.texturePanel.opacity = this.opacity;
        this.texturePanel.x = 0;
        this.texturePanel.y = 0;

        super.render(ctx);
    }
}


export class GUIImagePanelElement extends GUIElement {
    constructor(screen, image, x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.imagePanel = this.add(new GUIImagePanel(
            this.engine,
            image,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.imagePanel.w = this.width * this.scale;
        this.imagePanel.h = this.height * this.scale;
        this.imagePanel.image = this.image;
        this.imagePanel.rotation = this.rotation;
        this.imagePanel.opacity = this.opacity;

        this.imagePanel.x = 0;
        this.imagePanel.y = 0;

        super.render(ctx);
    }
}


export class GUITiledImagePanelElement extends GUIElement {
    constructor(screen, image, x = 0, y = 0, width = 100, height = 100, tileSize = 64, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.tileSize = tileSize;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;

        this.scale = 1;

        this.tiledPanel = this.add(new GUITiledImagePanel(
            this.engine,
            image,
            0,
            0,
            width,
            height,
            tileSize,
            rotation,
            opacity,
            patternOffsetX,
            patternOffsetY,
            patternRotation
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.tiledPanel.w = this.width * this.scale;
        this.tiledPanel.h = this.height * this.scale;
        this.tiledPanel.image = this.image;
        this.tiledPanel.tileSize = this.tileSize;
        this.tiledPanel.rotation = this.rotation;
        this.tiledPanel.opacity = this.opacity;

        this.tiledPanel.patternOffsetX = this.patternOffsetX;
        this.tiledPanel.patternOffsetY = this.patternOffsetY;
        this.tiledPanel.patternRotation = this.patternRotation;

        this.tiledPanel.x = 0;
        this.tiledPanel.y = 0;

        super.render(ctx);
    }
}


export class GUITiledTexturePanelElement extends GUIElement {
    constructor(screen, textureID, x = 0, y = 0, width = 100, height = 100, tileSize = 64, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.textureID = textureID;
        this.tileSize = tileSize;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;

        this.scale = 1;

        this.tiledPanel = this.add(new GUITiledTexturePanel(
            this.engine,
            textureID,
            0,
            0,
            width,
            height,
            tileSize,
            rotation,
            opacity,
            patternOffsetX,
            patternOffsetY,
            patternRotation
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.tiledPanel.w = this.width * this.scale;
        this.tiledPanel.h = this.height * this.scale;
        this.tiledPanel.textureID = this.textureID;
        this.tiledPanel.tileSize = this.tileSize;
        this.tiledPanel.rotation = this.rotation;
        this.tiledPanel.opacity = this.opacity;

        this.tiledPanel.patternOffsetX = this.patternOffsetX;
        this.tiledPanel.patternOffsetY = this.patternOffsetY;
        this.tiledPanel.patternRotation = this.patternRotation;

        this.tiledPanel.x = 0;
        this.tiledPanel.y = 0;

        super.render(ctx);
    }
}


export class GUITextureSpritePanelElement extends GUIElement {
    constructor(screen, textureID, x = 0, y = 0, width = 100, height = 100, cords = [0, 0, 0, 0], rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.textureID = textureID;
        this.cords = cords;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.spritePanel = this.add(new GUITextureSpritePanel(
            this.engine,
            textureID,
            0,
            0,
            width,
            height,
            cords,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.spritePanel.w = this.width * this.scale;
        this.spritePanel.h = this.height * this.scale;
        this.spritePanel.textureID = this.textureID;
        this.spritePanel.cords = this.cords;
        this.spritePanel.rotation = this.rotation;
        this.spritePanel.opacity = this.opacity;

        this.spritePanel.x = 0;
        this.spritePanel.y = 0;

        super.render(ctx);
    }
}


export class GUIBlurPanelElement extends GUIElement {
    constructor(screen, intensity = 10, x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.intensity = intensity;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.blurPanel = this.add(new GUIBlurPanel(
            intensity,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.blurPanel.w = this.width * this.scale;
        this.blurPanel.h = this.height * this.scale;
        this.blurPanel.rotation = this.rotation;
        this.blurPanel.opacity = this.opacity;

        this.blurPanel.x = 0;
        this.blurPanel.y = 0;

        super.render(ctx);
    }
}


export class GUIColorPanelElement extends GUIElement {
    constructor(screen, color = "#000000", x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.colorPanel = this.add(new GUIColorPanel(
            color,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.colorPanel.w = this.width * this.scale;
        this.colorPanel.h = this.height * this.scale;
        this.colorPanel.color = this.color;
        this.colorPanel.rotation = this.rotation;
        this.colorPanel.opacity = this.opacity;

        this.colorPanel.x = 0;
        this.colorPanel.y = 0;

        super.render(ctx);
    }
}


export class GUIBitmapTextElement extends GUIElement {
    constructor(screen, text, x = 0, y = 0, rotation = 0, size = 3, color = 0xFFFFFF, shadow = true, opacity = 1, center = false) {
        super(screen);
        this.bitmap_font = this.engine.bitmap_font;
        this.text = text;
        this.shadow = shadow;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.size = size;
        this.color = color;
        this.opacity = opacity;
        this.center = center;

        this.bitmapText = this.add(new GUIBitmapText(this.engine, text, 0, 0, 0, size, color, shadow, opacity, center));
    }

    getTextWidth(text = this.text, scale = this.size) {
        return this.bitmapText.getTextWidth(text, scale);
    }

    getTextHeight(scale = this.size) {
        return scale * 8;
    }

    render(ctx) {
        if (!this.visible) return;

        this.bitmapText.text = this.text;
        this.bitmapText.shadow = this.shadow;
        this.bitmapText.size = this.size;
        this.bitmapText.color = this.color;
        this.bitmapText.opacity = this.opacity;
        this.bitmapText.center = this.center;

        this.bitmapText.rotation = 0;

        super.render(ctx);
    }
}


export class GUIButtonElement extends GUIElement {
    constructor(screen, text = "Button", x = 0, y = 0, width = 200, height = 20, affectCursor = false) {
        super(screen);

        this.input = this.engine.input;

        this.normal = [0, 66, 200, 20];
        this.hovered = [0, 86, 200, 20];
        this.disabled = [0, 46, 200, 20];

        this.state = this.normal;

        this.interactState = "none";
        this.pushState = false;
        this.pushHoverState = false;

        this.mouseHover = false;
        this.mousePress = false;

        this.affectCursor = affectCursor;

        this.text = text;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();

        this.clickSound = "click";
        this.hoverSound = "hover";

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.state);
        this.title = this.addBitmapText(this.text, 0 + (this.width * this.scale / 2), 0, 0, this.scale);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.x = -(this.width * this.scale / 2);
        this.sprite.y = -(this.height * this.scale / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover && this.state != this.disabled) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();

                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;                    
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }

                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }

                if (this.interactState == "push" && this.pushState == false) {
                    this.pushState = true;

                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                    this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);
                    this.onClick.runAll();

                    switch (this.clickSound) {
                        case "click": this.engine.playClick(); break;                    
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    
                    if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
            } else {
                if (this.interactState == "none" || this.interactState == "push") {
                    this.interactState = "hover";

                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();

                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
                if (this.interactState == "hover" && this.pushState == true) {
                    this.pushState = false;

                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "hover" || this.interactState == "push") {
                this.interactState = "none";

                this.state = this.normal;
                this.title.color = Enum.Color.NormalButtonColor;

                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();

                if (this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                }
            }
            if (this.pushState == true) {
                this.pushState = false;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        this.sprite.cords = this.state;
        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}


export class GUISliderElement extends GUIElement {
    constructor(screen, title = "Slider", texts = { 50: "Normal" }, beforemark = "", mark = "", start = 0, stop = 100, step = 1, value = 50, x = 0, y = 0, width = 160, height = 20, affectCursor = false) {
        super(screen);

        this.input = this.engine.input;

        this.bg = [0, 46, 200, 20];
        this.knob = [201, 45, 8, 22];

        this.interactState = "none";
        this.pushState = false;
        this.pushHoverState = false;

        this.mouseHover = false;
        this.mousePress = false;

        this.affectCursor = affectCursor;

        this.texts = texts;
        this.titletext = title;
        this.beforemark = beforemark;
        this.mark = mark;

        this.start = start;
        this.stop = stop;
        this.step = step;
        this.value = value;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();
        this.onSlide = new EventList();

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.bg);
        this.knobsprite = this.addTextureSpritePanel("gui", -(this.width / 200 * 8 * this.scale / 2), -(this.height / 20 * 22 * this.scale / 2), 8, 21, this.knob);
        this.title = this.addBitmapText(this.titletext + " : " + this.beforemark + this.value + this.mark, 0 + (this.width * this.scale / 2), 0, 0, this.scale);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.knobsprite.w = 8 * this.scale;
        this.knobsprite.h = 22 * this.scale;

        this.sprite.x = -(this.sprite.w / 2);
        this.sprite.y = -(this.sprite.h / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.title.color = Enum.Color.SelectButtonColor;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Grab);
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
            } else {
                if (this.interactState == "none" || this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
                if (this.pushState) {
                    this.pushState = false;
                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "push" && !this.mousePress) {
                this.interactState = "none";
                this.title.color = Enum.Color.NormalButtonColor;
                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();
                if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
            } else if (this.interactState == "hover") {
                this.interactState = "none";
                this.title.color = Enum.Color.NormalButtonColor;
                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();
                if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
            }

            if (!this.mousePress && this.pushState) {
                this.pushState = false;
                this.interactState = "none";
                this.title.color = Enum.Color.NormalButtonColor;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        const halfSlider = this.sprite.w / 2;
        const minKnobX = -halfSlider;
        const maxKnobX = halfSlider - this.knobsprite.w;
        const totalTravelDistance = maxKnobX - minKnobX;

        if (this.interactState == "push") {
            if (this.pushState == false) {
                this.pushState = true;
                this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);
                this.onClick.runAll();
                this.engine.playClick();
                if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
            }

            const clickXInsideSlider = mpos.x - (this.x + minKnobX) - this.knobsprite.w / 2;

            let percentage = clickXInsideSlider / totalTravelDistance;
            percentage = Math.max(0, Math.min(1, percentage));

            const rawValue = this.start + percentage * (this.stop - this.start);

            let steppedValue = Math.round(rawValue / this.step) * this.step;

            this.value = Math.max(this.start, Math.min(this.stop, steppedValue));

            this.onSlide.runAll(this.value);
        }

        const currentPercentage = (this.value - this.start) / (this.stop - this.start);
        this.knobsprite.x = minKnobX + (currentPercentage * totalTravelDistance);

        const specialText = this.texts[this.value.toString()];

        if (specialText) {
            this.title.text = specialText
        } else {
            this.title.text = this.titletext + ": " + this.beforemark + this.value + this.mark;
        }

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}


export class GUISwitchElement extends GUIElement {
    constructor(screen, text = "Switch", options = { "ON": true, "OFF": false }, value = "OFF", x = 0, y = 0, width = 160, height = 20, affectCursor = false) {
        super(screen);

        this.input = this.engine.input;

        this.normal = [0, 66, 200, 20];
        this.hovered = [0, 86, 200, 20];
        this.disabled = [0, 46, 200, 20];

        this.state = this.normal;

        this.interactState = "none";
        this.pushState = false;
        this.pushHoverState = false;

        this.mouseHover = false;
        this.mousePress = false;

        this.affectCursor = affectCursor;

        this.text = text;
        this.options = options;
        this.value = value;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();
        this.onSwitch = new EventList();

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.state);

        const initialText = `${this.text}: ${this.value}`;
        this.title = this.addBitmapText(initialText, 0, 0, 0, this.scale);

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;
    }

    _cycleValue() {
        const keys = Object.keys(this.options);
        let currentIndex = keys.indexOf(this.value);

        if (currentIndex === -1) currentIndex = 0;
        const nextIndex = (currentIndex + 1) % keys.length;

        this.value = keys[nextIndex];
        const associatedValue = this.options[this.value];

        this.title.text = `${this.text}: ${this.value}`;

        this.onSwitch.runAll(this.value, associatedValue);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.x = -(this.width * this.scale / 2);
        this.sprite.y = -(this.height * this.scale / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }

                if (this.interactState == "push" && this.pushState == false) {
                    this.pushState = true;

                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                    this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);

                    this._cycleValue();

                    this.onClick.runAll();
                    this.engine.playClick();
                    if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
            } else {
                if (this.interactState == "none" || this.interactState == "push") {
                    this.interactState = "hover";

                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();

                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
                if (this.interactState == "hover" && this.pushState == true) {
                    this.pushState = false;

                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "hover" || this.interactState == "push") {
                this.interactState = "none";

                this.state = this.normal;
                this.title.color = Enum.Color.NormalButtonColor;

                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();

                if (this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                }
            }
            if (this.pushState == true) {
                this.pushState = false;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        this.sprite.cords = this.state;
        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}








export class Page {
    constructor(screen) {
        this.screen = screen;
        this.engine = screen.engine;

        this.guiElements = [];
    }

    addElement(element) {
        this.guiElements.push(element);
        this.guiElements.sort((a, b) => (a.layer || 0) - (b.layer || 0));
        return element;
    }

    addBlurPanel(intensity, x, y, width, height, rotation, opacity) { return this.addElement(new GUIBlurPanelElement(this, intensity, x, y, width, height, rotation, opacity)) };
    addColorPanel(color, x, y, width, height, rotation, opacity) { return this.addElement(new GUIColorPanelElement(this, color, x, y, width, height, rotation, opacity)) };
    addTexturePanel(textureID, x, y, width, height, rotation, opacity) { return this.addElement(new GUITexturePanelElement(this, textureID, x, y, width, height, rotation, opacity)) };
    addImagePanel(image, x, y, width, height, rotation, opacity) { return this.addElement(new GUIImagePanelElement(this, image, x, y, width, height, rotation, opacity)) };
    addTiledImagePanel(image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.addElement(new GUITiledImagePanelElement(this, image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTiledTexturePanel(textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.addElement(new GUITiledTexturePanelElement(this, textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTextureSpritePanel(textureID, x, y, width, height, cords, rotation, opacity) { return this.addElement(new GUITextureSpritePanelElement(this, textureID, x, y, width, height, cords, rotation, opacity)) };
    addBitmapText(text, x, y, rotation, size, color, shadow, opacity, center) { return this.addElement(new GUIBitmapTextElement(this, text, x, y, rotation, size, color, shadow, opacity, center)) };
    addButton(text, x, y, width, height, affectCursor) { return this.addElement(new GUIButtonElement(this, text, x, y, width, height, affectCursor)) };
    addSwitch(text, options, value, x, y, width, height, affectCursor) { return this.addElement(new GUISwitchElement(this, text, options, value, x, y, width, height, affectCursor)) };
    addSlider(title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor) { return this.addElement(new GUISliderElement(this, title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor)) };

    render(ctx) {
        this.guiElements.forEach((element) => {
            element.render(ctx);
        });
    }
}








export class Screen {
    constructor(engine) {
        this.engine = engine;

        this.pages = [];
        this.page = 0;
    }

    getPage(num = this.page) {
        if (!this.pages[num]) {
            this.pages[num] = new Page(this);
        }
        return this.pages[num];
    }

    nextPage() {
        const nextIndex = this.page >= this.pages.length - 1 ? 0 : this.page + 1;
        this.turnPage(nextIndex);
    }

    prevPage() {
        if (this.page <= 0) {
            if (this.pages.length > 0) {
                this.turnPage(this.pages.length - 1);
            }
            return;
        }
        this.turnPage(this.page - 1);
    }

    turnPage(num) {
        if (!this.pages[num]) {
            this.pages[num] = new Page(this);
        }
        this.page = num;
    }

    setPage(pageInstance) {
        const index = this.pages.indexOf(pageInstance);
        if (index !== -1) {
            this.page = index;
        }
    }

    /*
    addBlurPanel(...args) { return this.getPage().addBlurPanel(...args); }
    addColorPanel(...args) { return this.getPage().addColorPanel(...args); }
    addTexturePanel(...args) { return this.getPage().addTexturePanel(...args); }
    addImagePanel(...args) { return this.getPage().addImagePanel(...args); }
    addTiledImagePanel(...args) { return this.getPage().addTiledImagePanel(...args); }
    addTiledTexturePanel(...args) { return this.getPage().addTiledTexturePanel(...args); }
    addTextureSpritePanel(...args) { return this.getPage().addTextureSpritePanel(...args); }
    addBitmapText(...args) { return this.getPage().addBitmapText(...args); }
    addButton(...args) { return this.getPage().addButton(...args); }
    addSwitch(...args) { return this.getPage().addSwitch(...args); }
    addSlider(...args) { return this.getPage().addSlider(...args); }
    */

    addBlurPanel(intensity, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUIBlurPanelElement(this, intensity, x, y, width, height, rotation, opacity)) };
    addColorPanel(color, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUIColorPanelElement(this, color, x, y, width, height, rotation, opacity)) };
    addTexturePanel(textureID, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUITexturePanelElement(this, textureID, x, y, width, height, rotation, opacity)) };
    addImagePanel(image, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUIImagePanelElement(this, image, x, y, width, height, rotation, opacity)) };
    addTiledImagePanel(image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.getPage().addElement(new GUITiledImagePanelElement(this, image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTiledTexturePanel(textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.getPage().addElement(new GUITiledTexturePanelElement(this, textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTextureSpritePanel(textureID, x, y, width, height, cords, rotation, opacity) { return this.getPage().addElement(new GUITextureSpritePanelElement(this, textureID, x, y, width, height, cords, rotation, opacity)) };
    addBitmapText(text, x, y, rotation, size, color, shadow, opacity, center) { return this.getPage().addElement(new GUIBitmapTextElement(this, text, x, y, rotation, size, color, shadow, opacity, center)) };
    addButton(text, x, y, width, height, affectCursor) { return this.getPage().addElement(new GUIButtonElement(this, text, x, y, width, height, affectCursor)) };
    addSwitch(text, options, value, x, y, width, height, affectCursor) { return this.getPage().addElement(new GUISwitchElement(this, text, options, value, x, y, width, height, affectCursor)) };
    addSlider(title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor) { return this.getPage().addElement(new GUISliderElement(this, title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor)) };

    init() { };

    render(ctx) {
        this.getPage().render(ctx);
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

        this.addColorPanel("black", 0, 0, 2560, 1440);
        //this.addBitmapText("Minecraft asset loading", 15, 15, 0, 16);
        //this.Pic = this.addTexturePanel("terrain", 100, 400, 900, 500);
        //this.Text = this.addBitmapText("", 10, 320, 0, 5, 0x777777);
    }

    assetLoaded(progress) {
        //this.Text.text = `Loaded: ${progress.asset.path} (${Math.round(progress.value * 100)}%)`;

        if (progress.asset.type == Enum.AssetType.Texture) {
            //this.Pic.textureID = progress.asset.id;
        } else {
            //this.Pic.textureID = "pack";
        }
    }
}


export class LogoScreen extends Screen {
    constructor(engine) {
        super(engine);

        this.addColorPanel("black", 0, 0, 2560, 1440);
        //this.addBitmapText("Logo", 15, 15, 0, 16);
        //this.Pic = this.addTexturePanel("font", -500, 500, 5000, 500);
        //this.Text = this.addBitmapText("num", 10, 320, 0, 10, 0x777777);

        this.renderTime = 0;
    }

    render(ctx) {
        this.renderTime++;
        //this.Text.text = this.renderTime.toString();

        if (this.renderTime > 50) {
            this.engine.setScreen(this.engine.menuScreen);
        }

        super.render(ctx);
    }
}


export class MenuScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.splashTextStr = engine.splash;
        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTexturePanel("logo", canvasW / 2 - 500, 100, 1000, 170);

        this.splashText = this.addBitmapText(this.splashTextStr, centerX + 350, 250, -20, 5, 0xFFFF00, true, 1, true);

        this.addBitmapText("by Fraeric123", left - 225, down - 30, 0, 3);
        this.addBitmapText("not Minecraft 1.0.0", 10, down - 30, 0, 3);

        const playBut = this.addButton("Play", centerX, centerY - 100);
        const optionsBut = this.addButton("Options", centerX, centerY - 30);
        const exitBut = this.addButton("Exit", centerX, centerY + 40);

        playBut.onClick.addEvent(() => { engine.setScreen(engine.worldSelectScreen) });

        optionsBut.onClick.addEvent(() => { engine.setScreen(engine.optionsScreen) });

        exitBut.onClick.addEvent(() => { window.close() });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("pano0"); const p3 = this.engine.asset_manager.get("pano3");
            const p1 = this.engine.asset_manager.get("pano1"); const p4 = this.engine.asset_manager.get("pano4");
            const p2 = this.engine.asset_manager.get("pano2"); const p5 = this.engine.asset_manager.get("pano5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        const timeMs = this.engine.ms() % 1000;
        const wave = Math.abs(Math.sin((timeMs / 1000) * Math.PI * 2));
        const scaleFactor = 1.8 - wave * 0.1;

        const textWidth = this.splashText.getTextWidth(this.splashText.text, 1);

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');
        this.splashText.size = (scaleFactor * 100) / (textWidth + 32) * 3;

        super.render(ctx);
    }
}


export class OptionsScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const lefty = 2560;
        const righty = 0;

        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Options", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const musicVolumeSlider = this.addSlider(
            "Music",
            {
                0: "Music: OFF"
            },
            "", "%",
            0, 100, 1,
            this.engine.config.data.Music,
            centerX - 260, centerY - 400
        );
        const masterVolumeSlider = this.addSlider(
            "Sound",
            {
                0: "Sound: OFF"
            },
            "", "%",
            0, 100, 1,
            this.engine.config.data.MasterVolume,
            centerX + 260, centerY - 400
        );

        const invertMouseSwitch = this.addSwitch(
            "Invert Mouse",
            {
                "ON": true, "OFF": false
            },
            engine.config.data.InvertMouse ? "ON" : "OFF",
            centerX - 260, centerY - 320
        );
        const sensitivitySlider = this.addSlider(
            "Sensitivity",
            {
                0: "Sensitivity: *yawn*",
                200: "Sensitivity: HYPERSPEED!!!"
            },
            "", "%",
            0, 200, 1,
            this.engine.config.data.Sensitivity,
            centerX + 260, centerY - 320
        );

        const fovSlider = this.addSlider(
            "FOV",
            {
                70: "FOV: Normal",
                110: "FOV: Quake Pro"
            },
            "", "",
            70, 110, 1,
            this.engine.config.data.FOV,
            centerX - 260, centerY - 240
        );
        const difficultySwitch = this.addSwitch(
            "Difficulty",
            {
                "Peaceful": 0,
                "Easy": 1,
                "Normal": 2,
                "Hard": 3
            },
            engine.config.getDifficulty(),
            centerX + 260, centerY - 240
        );

        const extrasBut = this.addButton("§6Extras", centerX, centerY + 120);
        const videoSettingsBut = this.addButton("Video Settings...", centerX, centerY + 200);
        const constrolsBut = this.addButton("Controls...", centerX, centerY + 280);

        const doneBut = this.addButton("Done", centerX, centerY + 400);

        masterVolumeSlider.onSlide.addEvent((vol) => { engine.config.data.MasterVolume = vol });
        musicVolumeSlider.onSlide.addEvent((vol) => { engine.config.data.Music = vol });

        invertMouseSwitch.onSwitch.addEvent((vol) => { engine.config.data.InvertMouse = vol });
        sensitivitySlider.onSlide.addEvent((vol) => { engine.config.data.Sensitivity = vol });

        fovSlider.onSlide.addEvent((vol) => { engine.config.data.FOV = vol });
        difficultySwitch.onSwitch.addEvent((vol) => { engine.config.data.Difficulty = vol });

        extrasBut.onClick.addEvent(() => { this.turnPage(3) });
        videoSettingsBut.onClick.addEvent(() => { this.turnPage(1) });
        constrolsBut.onClick.addEvent(() => { this.turnPage(2) });

        doneBut.onClick.addEvent(() => { engine.setScreen(engine.menuScreen) });

        this.turnPage(1);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Video Settings", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const graphicsSwitch = this.addSwitch(
            "Graphics",
            {
                "Fancy": Enum.Graphics.Fancy,
                "Fast": Enum.Graphics.Fast
            },
            engine.config.getGraphics(),
            centerX - 260, centerY - 400
        );
        const renderDistanceSwitch = this.addSwitch(
            "Render Distance",
            {
                "Far": Enum.RenderDistance.Far,
                "Normal": Enum.RenderDistance.Normal,
                "Short": Enum.RenderDistance.Short,
                "Tiny": Enum.RenderDistance.Tiny
            },
            engine.config.getRenderDistance(),
            centerX + 260, centerY - 400
        );

        const smoothLightingSwitch = this.addSwitch(
            "Smooth Lighting",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.SmoothLighting ? "ON" : "OFF",
            centerX - 260, centerY - 320
        );
        const performanceSwitch = this.addSwitch(
            "Performance",
            {
                "Balanced": Enum.Performance.Balanced,
                "MaxFPS": Enum.Performance.MaxFPS,
                "PowerSaver": Enum.Performance.PowerSaver
            },
            engine.config.getPerformance(),
            centerX + 260, centerY - 320
        );

        const threeDAnaglyphSwitch = this.addSwitch(
            "3D Anaglyph",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data["3DAnaglyph"] ? "ON" : "OFF",
            centerX - 260, centerY - 240
        );
        const viewBobbingSwitch = this.addSwitch(
            "View Bobbing",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ViewBobbing ? "ON" : "OFF",
            centerX + 260, centerY - 240
        );

        const guiScaleSwitch = this.addSwitch(
            "GUI Scale",
            {
                "Auto": Enum.GUIScale.Auto,
                "Large": Enum.GUIScale.Large,
                "Normal": Enum.GUIScale.Normal,
                "Small": Enum.GUIScale.Small
            },
            engine.config.getGUIScale(),
            centerX - 260, centerY - 160
        );
        const advancedWebGL = this.addSwitch(
            "Advanced WebGL",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.AdvancedWebGL ? "ON" : "OFF",
            centerX + 260, centerY - 160
        );

        const brightnessSlider = this.addSlider(
            "Brightness",
            {
                0: "Brightness: Moody",
                100: "Brightness: Bright"
            },
            "+", "%",
            0, 100, 1,
            this.engine.config.data.Brightness,
            centerX - 260, centerY - 80
        );
        const cloudsSwitch = this.addSwitch(
            "Clouds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.Clouds ? "ON" : "OFF",
            centerX + 260, centerY - 80
        );

        const particlesSwitch = this.addSwitch(
            "Particles",
            {
                "Minimal": Enum.Particles.Minimal,
                "Decreased": Enum.Particles.Decreased,
                "All": Enum.Particles.All
            },
            engine.config.getParticles(),
            centerX - 260, centerY
        );

        const doneBut2 = this.addButton("Done", centerX, centerY + 400);

        graphicsSwitch.onSwitch.addEvent((vol) => { engine.config.data.Graphics = vol });
        renderDistanceSwitch.onSwitch.addEvent((vol) => { engine.config.data.RenderDistance = vol });

        smoothLightingSwitch.onSwitch.addEvent((vol) => { engine.config.data.SmoothLighting = vol });
        performanceSwitch.onSwitch.addEvent((vol) => { engine.config.data.Performance = vol });

        threeDAnaglyphSwitch.onSwitch.addEvent((vol) => { engine.config.data["3DAnaglyph"] = vol });
        viewBobbingSwitch.onSwitch.addEvent((vol) => { engine.config.data.ViewBobbing = vol });

        guiScaleSwitch.onSwitch.addEvent((vol) => { engine.config.data.GUIScale = vol });

        doneBut2.onClick.addEvent(() => { this.turnPage(0) });

        this.turnPage(2);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Controls", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const attack = null
        const useItem = null

        const forward = null
        const left = null

        const back = null
        const right = null

        const jump = null
        const sneak = null

        const drop = null
        const inventory = null

        const chat = null
        const listPlayers = null

        const pickBlock = null

        const doneBut3 = this.addButton("Done", centerX, centerY + 400);

        doneBut3.onClick.addEvent(() => {
            this.turnPage(0);
        })

        this.turnPage(3);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 0.7);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Extras", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const menuSpinSpeedSlider = this.addSlider(
            "Menu Spin Speed",
            {
                "-10000": "Menu Spin Speed: LIGHTSPEED Backwards",
                "-5000": "Menu Spin Speed: FAST AND FURIOUS Backwards",
                "-2500": "Menu Spin Speed: Dizzy Backwards",
                "-50": "Menu Spin Speed: Normal Backwards",
                "0": "Menu Spin Speed: Motionless",
                "50": "Menu Spin Speed: Normal",
                "2500": "Menu Spin Speed: Dizzy",
                "5000": "Menu Spin Speed: FAST AND FURIOUS",
                "10000": "Menu Spin Speed: LIGHTSPEED"
            },
            "", "",
            -10000, 10000, 50,
            engine.config.data.MenuSpinSpeed,
            centerX, centerY - 400,
            250
        );

        const doneBut4 = this.addButton("Done", centerX, centerY + 400);

        menuSpinSpeedSlider.onSlide.addEvent((vol) => { engine.config.data.MenuSpinSpeed = vol });

        doneBut4.onClick.addEvent(() => {
            this.turnPage(0);
        })
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("pano0"); const p3 = this.engine.asset_manager.get("pano3");
            const p1 = this.engine.asset_manager.get("pano1"); const p4 = this.engine.asset_manager.get("pano4");
            const p2 = this.engine.asset_manager.get("pano2"); const p5 = this.engine.asset_manager.get("pano5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class WorldSelectScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 0);        
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.55);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, 120, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, 120, 0, 0.75);
        this.addTiledTexturePanel("dirt", 0, down-190, canvasW, 190, 6.8, 0, 1);
        this.addColorPanel("black", 0, down-190, canvasW, 190, 0, 0.75);
        this.addBitmapText("Select World", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);
        

        const cancelBut = this.addButton("Cancel", centerX + 255, down - 55, 160);
        const createNewBut = this.addButton("Create New World", centerX + 255, down - 130, 160);
        const playSelectedBut = this.addButton("Play Selected World", centerX - 255, down - 130, 160);
        const renameBut = this.addButton("Rename", centerX - 255 -127, down - 55, 75);
        const deleteBut = this.addButton("Delete", centerX - 255 +127, down - 55, 75);

        playSelectedBut.state = playSelectedBut.disabled;
        renameBut.state = renameBut.disabled
        deleteBut.state = deleteBut.disabled

        createNewBut.onClick.addEvent(() => { engine.setScreen(engine.createWorldScreen) });
        cancelBut.onClick.addEvent(() => { engine.setScreen(engine.menuScreen) });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("pano0"); const p3 = this.engine.asset_manager.get("pano3");
            const p1 = this.engine.asset_manager.get("pano1"); const p4 = this.engine.asset_manager.get("pano4");
            const p2 = this.engine.asset_manager.get("pano2"); const p5 = this.engine.asset_manager.get("pano5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
         
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.bg.patternOffsetY = 500 * (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        this.bg.patternOffsetX = 500 * (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad; 

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class CreateWorldScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Create World", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const cancelBut = this.addButton("Cancel", centerX + 255, down - 55, 160);
        const createBut = this.addButton("Create New World", centerX - 255, down - 55, 160);

        cancelBut.onClick.addEvent(() => { engine.setScreen(engine.worldSelectScreen) });
        this.p = 0;
        createBut.onClick.addEvent(() => { this.p = 1 });
        createBut.onRelease.addEvent(() => { this.p = 0 });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("pano0"); const p3 = this.engine.asset_manager.get("pano3");
            const p1 = this.engine.asset_manager.get("pano1"); const p4 = this.engine.asset_manager.get("pano4");
            const p2 = this.engine.asset_manager.get("pano2"); const p5 = this.engine.asset_manager.get("pano5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        this.bg.patternOffsetX += this.p;
        this.bg.patternOffsetY += this.p;
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
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

        this.mouseGUIButtonElementClick = new EventList();
        this.mouseGUIButtonElementRelease = new EventList();
        this.mouseGUIButtonElementHover = new EventList();
        this.mouseGUIButtonElementUnHover = new EventList();

        this.mouseGUIButtonElementInteract = null;

        this.previousInputs = new Map();
    }

    init() {
        const input = this.engine.input;
        const inputCanvas = this.engine.canvas;

        window.addEventListener('click', () => {
            if (THREE.AudioContext.getContext().state === 'suspended') {
                THREE.AudioContext.getContext().resume();
            }
        });

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

                const cssX = e.clientX - rect.left;
                const cssY = e.clientY - rect.top;

                const pos = {
                    x: cssX * (inputCanvas.width / rect.width),
                    y: cssY * (inputCanvas.height / rect.height)
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

        const currentMouse0 = input.getInputState('Mouse_Button_0') || false;
        const previousMouse0 = this.previousInputs.get('Mouse_Button_0') || false;

        if (currentMouse0 && !previousMouse0) {
            input.setInputState('Mouse_Trigger_0', true);
        } else {
            input.setInputState('Mouse_Trigger_0', false);
        }

        for (const [key, currentValue] of input.inputs.entries()) {
            const previousValue = this.previousInputs.get(key) || false;

            if (key.startsWith('Mouse_Click_0')) {
                if (currentValue === true && previousValue === false) {
                    input.setInputState('Clicked0', true);
                }
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

        for (let [key, value] of input.inputs.entries()) {
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

            "InvertMouse": false,
            "SmoothLighting": true,
            "3DAnaglyph": false,
            "ViewBobbing": true,
            "AdvancedWebGL": true,
            "Clouds": true,

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








export class VoxWheel {
    constructor({ assets = new AssetList() }) {

        this.assets = assets;

        this.asset_manager = new AssetManager(this)

        this.fogColor = new THREE.Color(0.5, 0.8, 1.0);
        this.skyFogColor = new THREE.Color(0.5, 0.8, 1.0);
        this.waterFogColor = new THREE.Color(0.2, 0.2, 0.8);
        this.lavaFogColor = new THREE.Color(0.8, 0.2, 0.2);

        this.skyFogDensity = 0.008;
        this.waterFogDensity = 0.1;
        this.lavaFogDensity = 0.4;

        this.renderer = null;
        this.canvas = null;
        this.ctx = null;

        this.canvas_renderer = new CanvasRenderer(this);

        this.input = new InputList();
        this.config = new ConfigList();
        this.input_manager = new InputManager(this);

        this.listener = new THREE.AudioListener();
        this.camera = new THREE.PerspectiveCamera(70, this.canvas_renderer.POM, 0.01, 1000.0);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.008);

        this.camera.add(this.listener);
        this.scene.add(this.camera);

        this.renderState = new RenderState(this);

        this.splash = getRandomSplash();

        this.screen = null;

        this.bitmap_font = new BitmapFont(this, "font");

        this.date = new Date();

        this.assetLoadingScreen = new AssetLoadingScreen(this);
        this.logoScreen = new LogoScreen(this);
        this.menuScreen = new MenuScreen(this);
        this.optionsScreen = new OptionsScreen(this);
        this.worldSelectScreen = new WorldSelectScreen(this);
        this.createWorldScreen = new CreateWorldScreen(this);
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
        this.playSound("hover");
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

    setRenderState(state) {
        this.renderState = state;
    }

    async run() {
        await this.init();
        this.loop();
    }

    async init() {
        console.log("initializing..")

        this.setScreen(this.assetLoadingScreen);

        await this.asset_manager.loadAll();

        this.setScreen(this.logoScreen);

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
assets.newAsset("pano0", "../assets/textures/pano/panorama0.png", Enum.AssetType.Texture);
assets.newAsset("pano1", "../assets/textures/pano/panorama1.png", Enum.AssetType.Texture);
assets.newAsset("pano2", "../assets/textures/pano/panorama2.png", Enum.AssetType.Texture);
assets.newAsset("pano3", "../assets/textures/pano/panorama3.png", Enum.AssetType.Texture);
assets.newAsset("pano4", "../assets/textures/pano/panorama4.png", Enum.AssetType.Texture);
assets.newAsset("pano5", "../assets/textures/pano/panorama5.png", Enum.AssetType.Texture);
assets.newAsset("logo", "../assets/textures/mclogo.png", Enum.AssetType.Texture);
assets.newAsset("pack", "../assets/textures/pack.png", Enum.AssetType.Texture);
assets.newAsset("gui", "../assets/textures/gui/gui.png", Enum.AssetType.Texture);
assets.newAsset("icons", "../assets/textures/gui/icons.png", Enum.AssetType.Texture);
assets.newAsset("dirt", "../assets/textures/dirt.png", Enum.AssetType.Texture);

assets.newAsset("electronic", "../assets/audio/electronic.wav", Enum.AssetType.Audio);
assets.newAsset("funk", "../assets/audio/funk.wav", Enum.AssetType.Audio);
assets.newAsset("jazz", "../assets/audio/jazz.wav", Enum.AssetType.Audio);
assets.newAsset("rock", "../assets/audio/rock.wav", Enum.AssetType.Audio);
assets.newAsset("click", "../assets/audio/random/click.ogg", Enum.AssetType.Audio);
assets.newAsset("hover", "../assets/audio/random/hover.ogg", Enum.AssetType.Audio);
assets.newAsset("bow", "../assets/audio/random/bow.ogg", Enum.AssetType.Audio);
assets.newAsset("break", "../assets/audio/random/break.ogg", Enum.AssetType.Audio);
assets.newAsset("classic_hurt", "../assets/audio/random/classic_hurt.ogg", Enum.AssetType.Audio);
assets.newAsset("drink", "../assets/audio/random/drink.ogg", Enum.AssetType.Audio);
assets.newAsset("explode", "../assets/audio/random/explode1.ogg", Enum.AssetType.Audio);
assets.newAsset("fizz", "../assets/audio/random/fizz.ogg", Enum.AssetType.Audio);
assets.newAsset("fuse", "../assets/audio/random/fuse.ogg", Enum.AssetType.Audio);
assets.newAsset("levelup", "../assets/audio/random/levelup.ogg", Enum.AssetType.Audio);
assets.newAsset("orb", "../assets/audio/random/orb.ogg", Enum.AssetType.Audio);
assets.newAsset("pop", "../assets/audio/random/pop.ogg", Enum.AssetType.Audio);
assets.newAsset("splash", "../assets/audio/random/splash.ogg", Enum.AssetType.Audio);
assets.newAsset("wood_click", "../assets/audio/random/wood_click.ogg", Enum.AssetType.Audio);

const g = new VoxWheel({ assets: assets })

await g.run();