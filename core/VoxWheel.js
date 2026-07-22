







import * as THREE from "../js/libs/three.module.min.js"
import { GLTFLoader } from "../js/libs/GLTFLoader.js";
import { RGBELoader } from "../js/libs/RGBELoader.js";
import { clone } from "../js/libs/SkeletonUtils.js";
import "../js/libs/jszip.min.js";








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
    log(jszip)
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
        "MenuBackground": 1,
        "InGame": 2
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
        "Button1": "Mouse_Button_0",
        "Button2": "Mouse_Button_2",
        "Button3": "Mouse_Button_1",
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

        //await sleep(50);
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

        if (textWidth <= 0 || textHeight <= 0) return;

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
    constructor(screen, text = "Button", x = 0, y = 0, width = 200, height = 20, affectCursor = false, onClickEvent = null) {
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
        this.unhoverSound = "release";

        if (onClickEvent) this.onClick.addEvent(onClickEvent);

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

        if (this.mouseHover && this.state != this.disabled && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
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
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
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
                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }

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
    constructor(screen, title = "Slider", texts = { 50: "Normal" }, beforemark = "", mark = "", start = 0, stop = 100, step = 1, value = 50, x = 0, y = 0, width = 160, height = 20, affectCursor = false, onSlideEvent = null) {
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

        this.clickSound = "click";
        this.hoverSound = "hover";
        this.unhoverSound = "release";

        if (onSlideEvent) this.onSlide.addEvent(onSlideEvent);

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

        if (this.mouseHover && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
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
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
            } else {
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
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
                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }
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
    constructor(screen, text = "Switch", options = { "ON": true, "OFF": false }, value = "OFF", x = 0, y = 0, width = 160, height = 20, affectCursor = false, onSwitchEvent = null) {
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

        this.clickSound = "click";
        this.hoverSound = "hover";
        this.unhoverSound = "release";

        if (onSwitchEvent) this.onSwitch.addEvent(onSwitchEvent);

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

        this.onSwitch.runAll(associatedValue);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.x = -(this.width * this.scale / 2);
        this.sprite.y = -(this.height * this.scale / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
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

                    this._cycleValue();

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
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
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

                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }

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
    addButton(text, x, y, width, height, affectCursor, onClickEvent) { return this.addElement(new GUIButtonElement(this, text, x, y, width, height, affectCursor, onClickEvent)) };
    addSwitch(text, options, value, x, y, width, height, affectCursor, onSwitchEvent) { return this.addElement(new GUISwitchElement(this, text, options, value, x, y, width, height, affectCursor, onSwitchEvent)) };
    addSlider(title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent) { return this.addElement(new GUISliderElement(this, title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent)) };

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
    addButton(text, x, y, width, height, affectCursor, onClickEvent) { return this.getPage().addElement(new GUIButtonElement(this, text, x, y, width, height, affectCursor, onClickEvent)) };
    addSwitch(text, options, value, x, y, width, height, affectCursor, onSwitchEvent) { return this.getPage().addElement(new GUISwitchElement(this, text, options, value, x, y, width, height, affectCursor, onSwitchEvent)) };
    addSlider(title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent) { return this.getPage().addElement(new GUISliderElement(this, title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent)) };

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

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTexturePanel("logo", canvasW / 2 - 500, 100, 1000, 170);

        this.splashText = this.addBitmapText(this.splashTextStr, centerX + 350, 250, -20, 5, 0xFFFF00, true, 1, true);

        this.addBitmapText("by Fraeric123", left - 225, down - 30, 0, 3);
        this.addBitmapText("not Minecraft 1.0.0", 10, down - 30, 0, 3);

        const playBut = this.addButton("Play", centerX, centerY - 100, un, un, un, () => { engine.setScreen(engine.worldSelectScreen) });
        const optionsBut = this.addButton("Options", centerX, centerY - 30, un, un, un, () => { engine.setScreen(engine.optionsScreen) });
        const exitBut = this.addButton("Exit", centerX, centerY + 40, un, un, un, () => { window.close() });
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
        this.blur.visible = this.engine.config.data.BlurEffects;

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

        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Options", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const musicVolumeSlider = this.addSlider(
            "Music",
            {
                0: "Music: OFF"
            },
            "", "%",
            0, 200, 1,
            this.engine.config.data.Music,
            centerX - 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.Music = val }
        );
        const masterVolumeSlider = this.addSlider(
            "Sound",
            {
                0: "Sound: OFF"
            },
            "", "%",
            0, 200, 1,
            this.engine.config.data.MasterVolume,
            centerX + 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.MasterVolume = val }
        );

        const invertMouseSwitch = this.addSwitch(
            "Invert Mouse",
            {
                "ON": true, "OFF": false
            },
            engine.config.data.InvertMouse ? "ON" : "OFF",
            centerX - 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.InvertMouse = val }
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
            centerX + 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.Sensitivity = val }
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
            centerX - 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.FOV = val }
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
            centerX + 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.Difficulty = val }
        );

        const extrasBut = this.addButton("§6Extras", centerX, centerY + 120, un, un, un, () => { this.turnPage(3) });
        const videoSettingsBut = this.addButton("Video Settings...", centerX, centerY + 200, un, un, un, () => { this.turnPage(1) });
        const constrolsBut = this.addButton("Controls...", centerX, centerY + 280, un, un, un, () => { this.turnPage(2) });

        const doneBut = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { engine.setScreen(engine.menuScreen) });

        this.turnPage(1);

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
            centerX - 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.Graphics = val }
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
            centerX + 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.RenderDistance = val }
        );

        const smoothLightingSwitch = this.addSwitch(
            "Smooth Lighting",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.SmoothLighting ? "ON" : "OFF",
            centerX - 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.SmoothLighting = val }
        );
        const performanceSwitch = this.addSwitch(
            "Performance",
            {
                "Balanced": Enum.Performance.Balanced,
                "MaxFPS": Enum.Performance.MaxFPS,
                "PowerSaver": Enum.Performance.PowerSaver
            },
            engine.config.getPerformance(),
            centerX + 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.Performance = val }
        );

        const threeDAnaglyphSwitch = this.addSwitch(
            "3D Anaglyph",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data["3DAnaglyph"] ? "ON" : "OFF",
            centerX - 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data["3DAnaglyph"] = val }
        );
        const viewBobbingSwitch = this.addSwitch(
            "View Bobbing",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ViewBobbing ? "ON" : "OFF",
            centerX + 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.ViewBobbing = val }
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
            centerX - 260, centerY - 160,
            un, un, un,
            (val) => { engine.config.data.GUIScale = val }
        );
        const advancedWebGL = this.addSwitch(
            "Advanced WebGL",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.AdvancedWebGL ? "ON" : "OFF",
            centerX + 260, centerY - 160,
            un, un, un,
            (val) => { engine.config.data.AdvancedWebGL = val }
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
            centerX - 260, centerY - 80,
            un, un, un,
            (val) => { engine.config.data.Brightness = val }
        );
        const cloudsSwitch = this.addSwitch(
            "Clouds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.Clouds ? "ON" : "OFF",
            centerX + 260, centerY - 80,
            un, un, un,
            (val) => { engine.config.data.Clouds = val }
        );

        const particlesSwitch = this.addSwitch(
            "Particles",
            {
                "Minimal": Enum.Particles.Minimal,
                "Decreased": Enum.Particles.Decreased,
                "All": Enum.Particles.All
            },
            engine.config.getParticles(),
            centerX - 260, centerY,
            un, un, un,
            (val) => { engine.config.data.Particles = val }
        );
        const blurEffectsSwitch = this.addSwitch(
            "Blur Effects",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.BlurEffects ? "ON" : "OFF",
            centerX + 260, centerY,
            un, un, un,
            (val) => { engine.config.data.BlurEffects = val }
        );


        const fullScreenSwitch = this.addSwitch(
            "FullScreen",
            {
                "ON": true,
                "OFF": false
            },
            document.fullscreenElement !== null ? "ON" : "OFF",
            centerX - 260, centerY + 80,
            un, un, un,
            (val) => {
                if (val) {
                    if (!document.fullscreenElement) {
                        this.engine.canvas.requestFullscreen().catch(err => {
                            console.error(`fullscreen error: ${err.message}`);
                        });
                        screen.orientation.lock('landscape');
                    }
                } else {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(err => {
                            console.error(`exit fullscreen error: ${err.message}`);
                        });
                    }
                }
            }
        );

        const doneBut2 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });

        this.turnPage(2);

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

        const doneBut3 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });

        this.turnPage(3);

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
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
            250, un, un,
            (vol) => { engine.config.data.MenuSpinSpeed = vol }
        );

        const extraSoundsSwitch = this.addSwitch(
            "Extra Sounds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ExtraSounds ? "ON" : "OFF",
            centerX, centerY - 300,
            un, un, un,
            (val) => { engine.config.data.ExtraSounds = val; }
        );

        const renderFactorSwitch = this.addSwitch(
            "Render Factor",
            {
                "0.05x": 0.05,
                "0.1x": 0.1,
                "0.2x": 0.2,
                "0.4x": 0.4,
                "0.8x": 0.8,
                "1x": 1,
                "1.5x": 1.5,
                "2x": 2
            },
            engine.config.data.RenderFactor + "x",
            centerX, centerY - 200,
            un, un, un,
            (val) => { engine.config.data.RenderFactor = val }
        );

        const doneBut4 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });
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
        this.blur.visible = this.engine.config.data.BlurEffects;

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
        const down = 1440;

        this.selectedWorldId = null;
        this.worldButtons = [];

        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.55);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, 120, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, 120, 0, 0.75);
        this.addTiledTexturePanel("dirt", 0, down - 190, canvasW, 190, 6.8, 0, 1);
        this.addColorPanel("black", 0, down - 190, canvasW, 190, 0, 0.75);
        this.addBitmapText("Select World", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.playSelectedBut = this.addButton("Play Selected World", centerX - 255, down - 130, 160);
        this.createNewBut = this.addButton("Create New World", centerX + 255, down - 130, 160);
        this.renameBut = this.addButton("Rename", centerX - 255 - 127, down - 55, 75);
        this.deleteBut = this.addButton("Delete", centerX - 255 + 127, down - 55, 75);
        this.cancelBut = this.addButton("Cancel", centerX + 255, down - 55, 160);

        this.createNewBut.onClick.addEvent(() => { engine.setScreen(engine.createWorldScreen); });
        this.cancelBut.onClick.addEvent(() => { engine.setScreen(engine.menuScreen); });

        this.playSelectedBut.onClick.addEvent(() => {
            engine.screen = null;
            engine.startWorld(null);
        });

        this.deleteBut.onClick.addEvent(() => {
            if (!this.selectedWorldId || !engine.worldStorage) return;

            const idToDelete = this.selectedWorldId;

            engine.worldStorage.deleteWorld(
                idToDelete,
                () => {
                    this.selectedWorldId = null;
                    this.refreshWorldList();
                },
                (err) => {
                    console.error("Chyba při mazání světa:", err);
                }
            );
        });

        this.renameBut.onClick.addEvent(() => {
            if (!this.selectedWorldId || !engine.worldStorage) return;

            const currentId = this.selectedWorldId;

            engine.worldStorage.getWorld(
                currentId,
                (worldRecord) => {
                    if (!worldRecord) return;

                    const oldName = worldRecord.metadata?.name || "";
                    const newName = prompt("Enter new world name:", oldName);

                    if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
                        const updatedMetadata = {
                            ...worldRecord.metadata,
                            name: newName.trim()
                        };

                        const zipData = worldRecord.zipData || null;

                        engine.worldStorage.saveWorld(
                            currentId,
                            updatedMetadata,
                            zipData,
                            () => {
                                this.refreshWorldList();
                            },
                            (err) => {
                                console.error("Chyba při přejmenování světa:", err);
                            }
                        );
                    }
                },
                (err) => {
                    console.error("Chyba při načítání světa k přejmenování:", err);
                }
            );
        });

        this.updateButtonStates();
    }

    refreshWorldList() {
        const page = typeof this.getPage === 'function' ? this.getPage() : null;
        const elements = page?.elements || this.elements || [];

        this.worldButtons.forEach(btn => {
            if (typeof btn.destroy === 'function') {
                btn.destroy();
            } else if (typeof btn.remove === 'function') {
                btn.remove();
            } else if (Array.isArray(elements)) {
                const idx = elements.indexOf(btn);
                if (idx !== -1) {
                    elements.splice(idx, 1);
                }
            }
        });
        this.worldButtons = [];

        const storage = this.engine?.worldStorage;
        if (!storage || typeof storage.getWorldsList !== 'function') {
            console.warn("WorldStorage nebo metoda getWorldsList není k dispozici.");
            this.updateButtonStates();
            return;
        }

        storage.getWorldsList((worlds) => {
            const canvasW = 2560;
            const centerX = canvasW / 2;
            let startY = 180;

            (worlds || []).forEach((world) => {
                const isSelected = this.selectedWorldId === world.id;
                const dateStr = new Date(world.lastPlayed || Date.now()).toLocaleDateString();
                const btnText = `${isSelected ? "> " : ""}${world.name || "Unnamed"} (${dateStr})`;

                const btn = this.addButton(btnText, centerX, startY, 400, un, un, () => {
                    this.selectedWorldId = world.id;
                    this.refreshWorldList();
                });

                this.worldButtons.push(btn);
                startY += 85;
            });

            this.updateButtonStates();
        });
    }

    updateButtonStates() {
        const hasSelection = this.selectedWorldId !== null;
        this.playSelectedBut.disabled = !hasSelection;
        this.renameBut.disabled = !hasSelection;
        this.deleteBut.disabled = !hasSelection;
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("pano0"); const p3 = this.engine.asset_manager.get("pano3");
            const p1 = this.engine.asset_manager.get("pano1"); const p4 = this.engine.asset_manager.get("pano4");
            const p2 = this.engine.asset_manager.get("pano2"); const p5 = this.engine.asset_manager.get("pano5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }

        this.selectedWorldId = null;
        this.refreshWorldList();
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;

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

        this.worldName = "New World";
        this.gameMode = "Survival";
        this.seed = Math.floor(Math.random() * 1000000000).toString();

        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Create World", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.nameBtn = this.addButton(`World Name: ${this.worldName}`, centerX, centerY - 200, 300, un, un, () => {
            const input = prompt("Enter World Name:", this.worldName);
            if (input && input.trim() !== "") {
                this.worldName = input.trim();
                this.nameBtn.text = `World Name: ${this.worldName}`;
            }
        });

        this.modeBtn = this.addSwitch(
            "Game Mode",
            { "Survival": "Survival", "Creative": "Creative", "Hardcore": "Hardcore" },
            this.gameMode,
            centerX, centerY - 100, 300, un, un,
            (val) => { this.gameMode = val; }
        );

        this.seedBtn = this.addButton(`Seed: ${this.seed}`, centerX, centerY, 300, un, un, () => {
            this.seed = Math.floor(Math.random() * 1000000000).toString();
            this.seedBtn.text = `Seed: ${this.seed}`;
        });

        this.importBut = this.addButton("Import World (.zip)", centerX, centerY + 120, 300, un, un, () => {
            if (engine.worldStorage) {
                engine.worldStorage.import(() => {
                    engine.setScreen(engine.worldSelectScreen);
                });
            }
        });

        const createBut = this.addButton("Create New World", centerX - 255, down - 55, 160, un, un, () => {
            if (engine.worldStorage) {
                const worldId = 'world_' + Date.now();
                const metadata = {
                    name: this.worldName,
                    mode: this.gameMode,
                    seed: this.seed,
                    created: Date.now(),
                    lastPlayed: Date.now()
                };

                engine.worldStorage.saveWorld(worldId, metadata, null, (savedRecord) => {
                    if (engine.loadWorld) {
                        engine.loadWorld(savedRecord);
                    } else {
                        engine.setScreen(engine.worldSelectScreen);
                    }
                });
            }
        });

        const cancelBut = this.addButton("Cancel", centerX + 255, down - 55, 160, un, un, () => {
            engine.setScreen(engine.worldSelectScreen);
        });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("pano0"); const p3 = this.engine.asset_manager.get("pano3");
            const p1 = this.engine.asset_manager.get("pano1"); const p4 = this.engine.asset_manager.get("pano4");
            const p2 = this.engine.asset_manager.get("pano2"); const p5 = this.engine.asset_manager.get("pano5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }

        this.worldName = "New World";
        this.seed = Math.floor(Math.random() * 1000000000).toString();
        if (this.nameBtn) this.nameBtn.text = `World Name: ${this.worldName}`;
        if (this.seedBtn) this.seedBtn.text = `Seed: ${this.seed}`;
    }

    render(ctx) {
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class ErrorScreen extends Screen {
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

        this.errorText = "Error"

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 0.2);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("§4Error Report", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.title = this.addBitmapText(this, centerX, centerY, 0, 3, 0xFFFFFF, true, 1, true);

        const okBut = this.addButton("OK", centerX, down - 55, 160);

        okBut.onClick.addEvent(() => { engine.extraScreen = null });
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;
        this.title.text = this.errorText;
        super.render(ctx);
    }
}


export class InGameScreen extends Screen {
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

        this.addBitmapText("IN GAME", 100, 30, 0, 3, 0xFFFFFF, true, 1, true);

        const okBut = this.addButton("OK", centerX, centerY, 160, un, un, () => { engine.setExtraScreen(engine.gameMenuScreen) });

        engine.input_manager.exitedPointerlock.addEvent(() => { engine.setExtraScreen(engine.gameMenuScreen) });
    }

    render(ctx) {
        super.render(ctx);
    }
}


export class GameMenuScreen extends Screen {
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

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Game Menu", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.addButton("Back To Game", centerX, centerY - 200, 200, un, un, () => { engine.input_manager.lockMouse() });
        this.addButton("Save and quit to title", centerX, centerY - 120, 200, un, un, () => { engine.closeWorld() });

        engine.input_manager.enteredPointerlock.addEvent(() => { if (engine.extraScreen == this) { engine.extraScreen = null } });
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

        this.engine.renderer = new THREE.WebGLRenderer({ canvas: this.renderCanvas, antialias: false, alpha: false });
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

        this.engine.renderer.render(this.engine.scene, this.engine.camera);

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
            "MasterVolume": 50,
            "Music": 100,
            "Sensitivity": 100,
            "FOV": 70,
            "Brightness": 0,
            "MenuSpinSpeed": 50,
            "RenderFactor": 0.1,

            "InvertMouse": false,
            "SmoothLighting": true,
            "3DAnaglyph": false,
            "ViewBobbing": true,
            "AdvancedWebGL": true,
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








class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    interpolateTo(vec, p) {
        const xt = this.x + (vec.x - this.x) * p;
        const yt = this.y + (vec.y - this.y) * p;
        const zt = this.z + (vec.z - this.z) * p;
        return new Vec3(xt, yt, zt)
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class AABB {
    constructor(x0, y0, z0, x1, y1, z1) {
        this.epsilon = 0.001;
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
    }

    expand(xa, ya, za) {
        let _x0 = this.x0;
        let _y0 = this.y0;
        let _z0 = this.z0;
        let _x1 = this.x1;
        let _y1 = this.y1;
        let _z1 = this.z1;

        if (xa < 0.0) _x0 += xa;
        if (xa > 0.0) _x1 += xa;
        if (ya < 0.0) _y0 += ya;
        if (ya > 0.0) _y1 += ya;
        if (za < 0.0) _z0 += za;
        if (za > 0.0) _z1 += za;

        return new AABB(_x0, _y0, _z0, _x1, _y1, _z1);
    }

    grow(xa, ya, za) {
        return new AABB(
            this.x0 - xa, this.y0 - ya, this.z0 - za,
            this.x1 + xa, this.y1 + ya, this.z1 + za
        );
    }

    clipXCollide(c, xa) {
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return xa;
        if (c.z1 <= this.z0 || c.z0 >= this.z1) return xa;

        if (xa > 0.0 && c.x1 <= this.x0) {
            let max = this.x0 - c.x1 - this.epsilon;
            if (max < xa) xa = max;
        }
        if (xa < 0.0 && c.x0 >= this.x1) {
            let max = this.x1 - c.x0 + this.epsilon;
            if (max > xa) xa = max;
        }
        return xa;
    }

    clipYCollide(c, ya) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return ya;
        if (c.z1 <= this.z0 || c.z0 >= this.z1) return ya;

        if (ya > 0.0 && c.y1 <= this.y0) {
            let max = this.y0 - c.y1 - this.epsilon;
            if (max < ya) ya = max;
        }
        if (ya < 0.0 && c.y0 >= this.y1) {
            let max = this.y1 - c.y0 + this.epsilon;
            if (max > ya) ya = max;
        }
        return ya;
    }

    clipZCollide(c, za) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return za;
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return za;

        if (za > 0.0 && c.z1 <= this.z0) {
            let max = this.z0 - c.z1 - this.epsilon;
            if (max < za) za = max;
        }
        if (za < 0.0 && c.z0 >= this.z1) {
            let max = this.z1 - c.z0 + this.epsilon;
            if (max > za) za = max;
        }
        return za;
    }

    intersects(c) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return false;
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return false;
        return !(c.z1 <= this.z0) && !(c.z0 >= this.z1);
    }

    move(xa, ya, za) {
        this.x0 += xa;
        this.y0 += ya;
        this.z0 += za;
        this.x1 += xa;
        this.y1 += ya;
        this.z1 += za;
    }
}









class Vertex {
    constructor(...args) {
        if (args.length === 5 &&
            typeof args[0] === 'number' &&
            typeof args[1] === 'number' &&
            typeof args[2] === 'number') {
            const [x, y, z, u, v] = args;
            this.pos = new Vec3(x, y, z);
            this.u = u;
            this.v = v;
        }
        else if (args.length === 3 && args[0] instanceof Vertex) {
            const [vertex, u, v] = args;
            this.pos = vertex.pos;
            this.u = u;
            this.v = v;
        }
        else if (args.length === 3 && args[0] instanceof Vec3) {
            const [pos, u, v] = args;
            this.pos = pos;
            this.u = u;
            this.v = v;
        }
        else {
            throw new Error("Invalid arguments for Vertex constructor");
        }
    }

    remap(u, v) {
        return new Vertex(this, u, v);
    }

    get x() { return this.pos.x; }
    get y() { return this.pos.y; }
    get z() { return this.pos.z; }

    toString() {
        return `Vertex(pos=${this.pos}, u=${this.u}, v=${this.v})`;
    }
}

class Polygon {
    constructor(vertices, u0 = null, v0 = null, u1 = null, v1 = null) {
        this.vertices = vertices.slice();
        this.vertexCount = vertices.length;

        if (u0 !== null && v0 !== null && u1 !== null && v1 !== null) {
            this.vertices[0] = this.vertices[0].remap(u1, v0);
            this.vertices[1] = this.vertices[1].remap(u0, v0);
            this.vertices[2] = this.vertices[2].remap(u0, v1);
            this.vertices[3] = this.vertices[3].remap(u1, v1);
        }
    }

    getVerticesAndUVs() {
        const positions = [];
        const uvs = [];

        const indices = [3, 2, 1, 3, 1, 0];

        for (const i of indices) {
            const v = this.vertices[i];
            positions.push(v.x, v.y, v.z);
            uvs.push(v.u / 64.0, v.v / 32.0);
        }

        return { positions, uvs };
    }

    debugPrint() {
        for (let i = 3; i >= 0; i--) {
            const v = this.vertices[i];
            console.log(`  Vertex ${i}: (${v.x}, ${v.y}, ${v.z}), UV: (${v.u}, ${v.v})`);
        }
    }
}

class Cube {
    constructor(xTexOffs = 0, yTexOffs = 0) {
        this.xTexOffs = xTexOffs;
        this.yTexOffs = yTexOffs;

        this.vertices = [];
        this.polygons = [];

        this.x = 0; this.y = 0; this.z = 0;
        this.xRot = 0; this.yRot = 0; this.zRot = 0;

        this.geometry = null;
        this.material = null;

        this.mesh = null;
        this.group = null;
    }

    addBox(x0, y0, z0, w, h, d) {
        this.vertices = [];
        this.polygons = [];

        const x1 = x0 + w;
        const y1 = y0 + h;
        const z1 = z0 + d;

        const u0 = new Vertex(x0, y0, z0, 0.0, 0.0);
        const u1 = new Vertex(x1, y0, z0, 0.0, 8.0);
        const u2 = new Vertex(x1, y1, z0, 8.0, 8.0);
        const u3 = new Vertex(x0, y1, z0, 8.0, 0.0);
        const l0 = new Vertex(x0, y0, z1, 0.0, 0.0);
        const l1 = new Vertex(x1, y0, z1, 0.0, 8.0);
        const l2 = new Vertex(x1, y1, z1, 8.0, 8.0);
        const l3 = new Vertex(x0, y1, z1, 8.0, 0.0);

        this.vertices.push(u0, u1, u2, u3, l0, l1, l2, l3);

        this.polygons.push(
            new Polygon([l1, u1, u2, l2], this.xTexOffs + d + w, this.yTexOffs + d, this.xTexOffs + d + w + d, this.yTexOffs + d + h),
            new Polygon([u0, l0, l3, u3], this.xTexOffs + 0, this.yTexOffs + d, this.xTexOffs + d, this.yTexOffs + d + h),
            new Polygon([l1, l0, u0, u1], this.xTexOffs + d, this.yTexOffs + 0, this.xTexOffs + d + w, this.yTexOffs + d),
            new Polygon([u2, u3, l3, l2], this.xTexOffs + d + w, this.yTexOffs + 0, this.xTexOffs + d + w + w, this.yTexOffs + d),
            new Polygon([u1, u0, u3, u2], this.xTexOffs + d, this.yTexOffs + d, this.xTexOffs + d + w, this.yTexOffs + d + h),
            new Polygon([l0, l1, l2, l3], this.xTexOffs + d + w + d, this.yTexOffs + d, this.xTexOffs + d + w + d + w, this.yTexOffs + d + h)
        );
    }

    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        if (this.group) {
            this.group.position.set(this.x, this.y, this.z);
        }
    }

    createMesh(texture, parentGroup) {
        if (!texture) throw new Error("Cube.createMesh: texture required");
        if (!parentGroup) throw new Error("Cube.createMesh: parentGroup required");

        this.group = new THREE.Group();
        parentGroup.add(this.group);

        const positions = [];
        const uvs = [];
        const indices = [];
        let vertexIndex = 0;

        const faceIndices = [0, 1, 2, 0, 2, 3];

        for (const poly of this.polygons) {
            const polyVertices = poly.vertices;

            for (const offset of faceIndices) {
                indices.push(vertexIndex + offset);
            }

            const uValues = polyVertices.map(v => v.u);
            const vValues = polyVertices.map(v => v.v);
            const minU = Math.min(...uValues);
            const maxU = Math.max(...uValues);
            const minV = Math.min(...vValues);
            const maxV = Math.max(...vValues);

            for (const v of polyVertices) {
                positions.push(v.pos.x, v.pos.y, v.pos.z);

                let u = v.u;
                let vOrig = v.v;

                const pad = 0.005;

                if (u === minU) u += pad;
                if (u === maxU) u -= pad;
                if (vOrig === minV) vOrig += pad;
                if (vOrig === maxV) vOrig -= pad;

                let uFinal = u / 64.0;
                let vFinal = 1.0 - (vOrig / 32.0);

                uvs.push(uFinal, vFinal);
            }

            vertexIndex += 4;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.geometry.setIndex(indices);
        this.geometry.computeVertexNormals();

        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            transparent: true,
            alphaTest: 0.5
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);

        if (this.x !== 0 || this.y !== 0 || this.z !== 0) {
            this.group.position.set(this.x, this.y, this.z);
        }
    }

    render() {
        if (!this.group) return;

        this.group.position.set(this.x, this.y, this.z);

        this.group.rotation.order = 'ZYX';
        this.group.rotation.set(this.xRot, this.yRot, this.zRot);
    }

    destroy() {
        this.geometry.dispose();
        this.material.dispose();
    }
}









class Entity {
    constructor(level) {
        this.level = level;

        this.xo = 0;
        this.yo = 0;
        this.zo = 0;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.xd = 0;
        this.yd = 0;
        this.zd = 0;

        this.yRot = 0;
        this.xRot = 0;

        this.removed = false;

        this.bb = null;
        this.onGround = false;
        this.heightOffset = 0;

        this.resetPos();
    }

    resetPos() {
        const x = Math.random() * this.level.width;
        const y = this.level.depth + 10;
        const z = Math.random() * this.level.height;
        this.setPos(x, y, z);
    }

    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        const w = 0.3;
        const h = 0.9;
        this.bb = new AABB(x - w, y - h, z - w, x + w, y + h, z + w);
    }

    remove() {
        this.removed = true;
    }

    turn(xo, yo) {
        this.yRot += xo * 0.15;
        this.xRot -= yo * 0.15;

        if (this.xRot < -90) this.xRot = -90;
        if (this.xRot > 90) this.xRot = 90;
    }

    tick() {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;
    }

    move(xa, ya, za) {
        let xaOrg = xa;
        let yaOrg = ya;
        let zaOrg = za;

        const aABBs = this.level.getCubes(this.bb.expand(xa, ya, za));

        for (let i = 0; i < aABBs.length; i++) {
            ya = aABBs[i].clipYCollide(this.bb, ya);
        }
        this.bb.move(0, ya, 0);

        for (let i = 0; i < aABBs.length; i++) {
            xa = aABBs[i].clipXCollide(this.bb, xa);
        }
        this.bb.move(xa, 0, 0);

        for (let i = 0; i < aABBs.length; i++) {
            za = aABBs[i].clipZCollide(this.bb, za);
        }
        this.bb.move(0, 0, za);

        this.onGround = (yaOrg !== ya && yaOrg < 0);

        if (xaOrg !== xa) this.xd = 0;
        if (yaOrg !== ya) this.yd = 0;
        if (zaOrg !== za) this.zd = 0;

        this.x = (this.bb.x0 + this.bb.x1) / 2;
        this.y = this.bb.y0 + this.heightOffset;
        this.z = (this.bb.z0 + this.bb.z1) / 2;
    }

    moveRelative(xa, za, speed) {
        let dist = xa * xa + za * za;
        if (dist < 0.01) return;

        dist = speed / Math.sqrt(dist);
        xa *= dist;
        za *= dist;

        const sin = Math.sin(this.yRot * Math.PI / 180);
        const cos = Math.cos(this.yRot * Math.PI / 180);

        this.xd += xa * cos - za * sin;
        this.zd += za * cos + xa * sin;
    }

    destroy() { }
}

class Zombie extends Entity {
    constructor(level, x, y, z, scene) {
        super(level);

        if (!scene) throw new Error("Zombie: scene is required");

        this.texture = this.level.engine.asset_manager.get("steve");

        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.generateMipmaps = false;
        this.texture.flipY = true;

        this.rotA = (Math.random() + 1) * 0.01;
        this.x = x; this.y = y; this.z = z;
        this.timeOffs = Math.random() * 1239813;
        this.rot = Math.random() * Math.PI * 2;
        this.speed = 1.0;

        this.group = new THREE.Group();
        scene.add(this.group);

        this.head = new Cube(0, 0);
        this.head.addBox(-4, -8, -4, 8, 8, 8);

        this.body = new Cube(16, 16);
        this.body.addBox(-4, 0, -2, 8, 12, 4);

        this.arm0 = new Cube(40, 16);
        this.arm0.addBox(-3, -2, -2, 4, 12, 4);
        this.arm0.setPos(-5, 2, 0);

        this.arm1 = new Cube(40, 16);
        this.arm1.addBox(-1, -2, -2, 4, 12, 4);
        this.arm1.setPos(5, 2, 0);

        this.leg0 = new Cube(0, 16);
        this.leg0.addBox(-2, 0, -2, 4, 12, 4);
        this.leg0.setPos(-2, 12, 0);

        this.leg1 = new Cube(0, 16);
        this.leg1.addBox(-2, 0, -2, 4, 12, 4);
        this.leg1.setPos(2, 12, 0);

        this.head.createMesh(this.texture, this.group);
        this.body.createMesh(this.texture, this.group);
        this.arm0.createMesh(this.texture, this.group);
        this.arm1.createMesh(this.texture, this.group);
        this.leg0.createMesh(this.texture, this.group);
        this.leg1.createMesh(this.texture, this.group);
    }

    tick() {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;

        let xa = 0;
        let za = 0;

        this.rot += this.rotA;
        this.rotA *= 0.99;
        this.rotA += (Math.random() - Math.random()) * Math.random() * Math.random() * 0.01;

        xa = Math.sin(this.rot);
        za = Math.cos(this.rot);

        if (this.onGround && Math.random() < 0.01) {
            this.yd = 0.5;
        }

        this.moveRelative(
            xa,
            za,
            this.onGround ? 0.1 : 0.02
        );

        this.yd -= 0.08;

        this.move(this.xd, this.yd, this.zd);

        const groundFriction = this.onGround ? 0.546 : 0.91;

        this.xd *= groundFriction;
        this.zd *= groundFriction;
        this.yd *= 0.98;

        if (this.y > 100) {
            this.resetPos();
        }
    }

    render(a) {
        const time = (performance.now() / 1000) * 10 * this.speed + this.timeOffs;

        const x = this.xo + (this.x - this.xo) * a;
        const y = this.yo + (this.y - this.yo) * a;
        const z = this.zo + (this.z - this.zo) * a;

        this.group.position.set(x, y, z);

        const size = 0.058333334;
        const yy = -Math.abs(Math.sin(time * 0.6662)) * 5.0 - 23.0;

        this.group.scale.set(size, -size, size);

        this.group.position.y += yy * size + 3;

        this.group.rotation.y = this.rot + Math.PI;

        this.head.yRot = Math.sin(time * 0.83) * 1.0;
        this.head.xRot = Math.sin(time) * 0.8;
        this.arm0.xRot = Math.sin(time * 0.6662 + Math.PI) * 2.0;
        this.arm0.zRot = (Math.sin(time * 0.2312) + 1.0) * 1.0;
        this.arm1.xRot = Math.sin(time * 0.6662) * 2.0;
        this.arm1.zRot = (Math.sin(time * 0.2812) - 1.0) * 1.0;
        this.leg0.xRot = Math.sin(time * 0.6662) * 1.4;
        this.leg1.xRot = Math.sin(time * 0.6662 + Math.PI) * 1.4;

        this.head.render();
        this.body.render();
        this.arm0.render();
        this.arm1.render();
        this.leg0.render();
        this.leg1.render();
    }

    destroy() {
        this.head.destroy();
        this.body.destroy();
        this.arm0.destroy();
        this.arm1.destroy();
        this.leg0.destroy();
        this.leg1.destroy();

        if (this.group && this.group.parent) {
            this.group.parent.remove(this.group);
            this.group = null;
        }
    }
}









class Level {
    constructor(engine, w, h, d) {
        this.engine = engine;

        this.width = w;
        this.height = h;
        this.depth = d;

        this.camera = null;
        this.player = null;
        this.entities = [];

        this.texture = this.engine.asset_manager.get("terrain");
        this.texture.flipY = true;
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

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < d; y++) {
                for (let z = 0; z < h; z++) {
                    let i = (y * this.height + z) * this.width + x;
                    this.blocks[i] = (y <= (d * 2) / 3) ? 1 : 0;
                }
            }
        }

        this.calcLightDepths(0, 0, w, h);
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
        }

        this.player = new Player(this);

        for (let i = 0; i < 100; i++) {
            this.entities.push(new Zombie(this, 128, 64, 128, this.engine.scene));
        }
    }

    tick() {
        this.player.tick(this.engine.camera);

        this.entities.forEach(z => z.tick());
    }

    render() {
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

        this.engine.scene.add(this.selectionMesh);

        this.engine.levelRenderer.render(this.player, 0);
        this.engine.levelRenderer.render(this.player, 1);

        this.entities.forEach(z => z.render(this.engine.timer.a));
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

    isSolidTile(x, y, z) {
        return this.isTile(x, y, z);
    }

    isLightBlocker(x, y, z) {
        return this.isSolidTile(x, y, z);
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
        this.material.dispose();
        this.selectionMaterial.dispose();
        this.entities.forEach(e => e.destroy());
    }
}


class LevelRenderer {
    constructor(level, scene) {
        this.CHUNK_SIZE = 16;
        this.level = level;
        this.scene = scene;
        this.t = new Tesselator();

        this.xChunks = Math.ceil(level.width / this.CHUNK_SIZE);
        this.yChunks = Math.ceil(level.depth / this.CHUNK_SIZE);
        this.zChunks = Math.ceil(level.height / this.CHUNK_SIZE);

        this.chunks = new Array(this.xChunks * this.yChunks * this.zChunks);

        for (let x = 0; x < this.xChunks; x++) {
            for (let y = 0; y < this.yChunks; y++) {
                for (let z = 0; z < this.zChunks; z++) {
                    let x0 = x * this.CHUNK_SIZE;
                    let y0 = y * this.CHUNK_SIZE;
                    let z0 = z * this.CHUNK_SIZE;
                    let x1 = Math.min((x + 1) * this.CHUNK_SIZE, level.width);
                    let y1 = Math.min((y + 1) * this.CHUNK_SIZE, level.depth);
                    let z1 = Math.min((z + 1) * this.CHUNK_SIZE, level.height);

                    const chunkIndex = (x + y * this.xChunks) * this.zChunks + z;
                    const newChunk = new Chunk(level, x0, y0, z0, x1, y1, z1);
                    this.chunks[chunkIndex] = newChunk;

                    this.scene.add(newChunk.meshes[0]);
                    this.scene.add(newChunk.meshes[1]);
                }
            }
        }

        level.addListener(this);
    }

    render(player, layer) {
        Chunk.rebuiltThisFrame = 0;

        for (let chunk of this.chunks) {
            chunk.render(layer);
        }
    }

    setDirty(x0, y0, z0, x1, y1, z1) {
        x0 = Math.floor((x0 - 1) / this.CHUNK_SIZE);
        x1 = Math.floor((x1 + 1) / this.CHUNK_SIZE);
        y0 = Math.floor((y0 - 1) / this.CHUNK_SIZE);
        y1 = Math.floor((y1 + 1) / this.CHUNK_SIZE);
        z0 = Math.floor((z0 - 1) / this.CHUNK_SIZE);
        z1 = Math.floor((z1 + 1) / this.CHUNK_SIZE);

        x0 = Math.max(0, x0);
        y0 = Math.max(0, y0);
        z0 = Math.max(0, z0);
        x1 = Math.min(this.xChunks - 1, x1);
        y1 = Math.min(this.yChunks - 1, y1);
        z1 = Math.min(this.zChunks - 1, z1);

        for (let x = x0; x <= x1; x++) {
            for (let y = y0; y <= y1; y++) {
                for (let z = z0; z <= z1; z++) {
                    const index = (x + y * this.xChunks) * this.zChunks + z;
                    this.chunks[index].setDirty();
                }
            }
        }
    }

    tileChanged(x, y, z) {
        this.setDirty(x - 1, y - 1, z - 1, x + 1, y + 1, z + 1);
    }

    lightColumnChanged(x, z, y0, y1) {
        this.setDirty(x - 1, y0 - 1, z - 1, x + 1, y1 + 1, z + 1);
    }

    allChanged() {
        this.setDirty(0, 0, 0, this.level.width, this.level.depth, this.level.height);
    }

    destroy() {
        for (let chunk of this.chunks) {
            if (chunk) chunk.destroy();
        }
        this.chunks = [];
        this.t = null;
    }
}


class Tesselator {
    constructor() {
        this.MAX_VERTICES = 300000;

        this.vertexArray = new Float32Array(this.MAX_VERTICES * 3);
        this.texCoordArray = new Float32Array(this.MAX_VERTICES * 2);
        this.colorArray = new Float32Array(this.MAX_VERTICES * 3);

        this.vertices = 0;

        this.u = 0;
        this.v = 0;
        this.r = 1.0;
        this.g = 1.0;
        this.b = 1.0;

        this.hasColor = false;
        this.hasTexture = false;
    }

    init() {
        this.clear();
        this.hasColor = false;
        this.hasTexture = false;
    }

    clear() {
        this.vertices = 0;
    }

    tex(u, v) {
        this.hasTexture = true;
        this.u = u;
        this.v = v;
    }

    color(r, g, b) {
        this.hasColor = true;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    vertex(x, y, z) {
        if (this.vertices >= this.MAX_VERTICES) {
            console.warn("Tesselator is full!");
            return;
        }

        const v3 = this.vertices * 3;
        const v2 = this.vertices * 2;

        this.vertexArray[v3 + 0] = x;
        this.vertexArray[v3 + 1] = y;
        this.vertexArray[v3 + 2] = z;

        if (this.hasTexture) {
            this.texCoordArray[v2 + 0] = this.u;
            this.texCoordArray[v2 + 1] = this.v;
        }

        if (this.hasColor) {
            this.colorArray[v3 + 0] = this.r;
            this.colorArray[v3 + 1] = this.g;
            this.colorArray[v3 + 2] = this.b;
        }

        this.vertices++;
    }

    createGeometry() {
        if (this.vertices === 0) return null;

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(this.vertexArray.slice(0, this.vertices * 3), 3));

        if (this.hasTexture) {
            geometry.setAttribute('uv', new THREE.BufferAttribute(this.texCoordArray.slice(0, this.vertices * 2), 2));
        }

        if (this.hasColor) {
            geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray.slice(0, this.vertices * 3), 3));
        }

        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        return geometry;
    }
}









class Tile {
    static grass = new Tile(0);
    static rock = new Tile(1);

    constructor(tex) {
        this.tex = tex;
    }

    render(t, level, layer, x, y, z) {
        const eps = 0.0001;

        const u0 = (this.tex % 16) / 16.0 + eps;
        const u1 = u0 + (1 / 16.0) - 2 * eps;
        const row = Math.floor(this.tex / 16);
        const v1 = 1.0 - (row / 16.0) - eps;
        const v0 = 1.0 - ((row + 1) / 16.0) + eps;

        const c1 = 1.0;
        const c2 = 0.8;
        const c3 = 0.6;

        const x0 = x, x1 = x + 1.0;
        const y0 = y, y1 = y + 1.0;
        const z0 = z, z1 = z + 1.0;

        let br;

        if (!level.isSolidTile(x, y - 1, z)) {
            br = level.getBrightness(x, y - 1, z) * c1;
            if ((br === c1) ^ (layer === 1)) {
                t.color(br, br, br);
                this.addQuad(t,
                    x0, y0, z1, u0, v1,
                    x0, y0, z0, u0, v0,
                    x1, y0, z0, u1, v0,
                    x1, y0, z1, u1, v1
                );
            }
        }

        if (!level.isSolidTile(x, y + 1, z)) {
            br = level.getBrightness(x, y, z) * c1;
            if ((br === c1) ^ (layer === 1)) {
                t.color(br, br, br);
                this.addQuad(t,
                    x1, y1, z1, u1, v1,
                    x1, y1, z0, u1, v0,
                    x0, y1, z0, u0, v0,
                    x0, y1, z1, u0, v1
                );
            }
        }

        if (!level.isSolidTile(x, y, z - 1)) {
            br = level.getBrightness(x, y, z - 1) * c2;
            if ((br === c2) ^ (layer === 1)) {
                t.color(br, br, br);
                this.addQuad(t,
                    x0, y1, z0, u1, v0,
                    x1, y1, z0, u0, v0,
                    x1, y0, z0, u0, v1,
                    x0, y0, z0, u1, v1
                );
            }
        }

        if (!level.isSolidTile(x, y, z + 1)) {
            br = level.getBrightness(x, y, z + 1) * c2;
            if ((br === c2) ^ (layer === 1)) {
                t.color(br, br, br);
                this.addQuad(t,
                    x0, y1, z1, u0, v0,
                    x0, y0, z1, u0, v1,
                    x1, y0, z1, u1, v1,
                    x1, y1, z1, u1, v0
                );
            }
        }

        if (!level.isSolidTile(x - 1, y, z)) {
            br = level.getBrightness(x - 1, y, z) * c3;
            if ((br === c3) ^ (layer === 1)) {
                t.color(br, br, br);
                this.addQuad(t,
                    x0, y1, z1, u1, v0,
                    x0, y1, z0, u0, v0,
                    x0, y0, z0, u0, v1,
                    x0, y0, z1, u1, v1
                );
            }
        }

        if (!level.isSolidTile(x + 1, y, z)) {
            br = level.getBrightness(x + 1, y, z) * c3;
            if ((br === c3) ^ (layer === 1)) {
                t.color(br, br, br);
                this.addQuad(t,
                    x1, y0, z1, u0, v1,
                    x1, y0, z0, u1, v1,
                    x1, y1, z0, u1, v0,
                    x1, y1, z1, u0, v0
                );
            }
        }
    }

    addQuad(t, x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3, x4, y4, z4, u4, v4) {
        t.tex(u1, v1); t.vertex(x1, y1, z1);
        t.tex(u2, v2); t.vertex(x2, y2, z2);
        t.tex(u3, v3); t.vertex(x3, y3, z3);

        t.tex(u1, v1); t.vertex(x1, y1, z1);
        t.tex(u3, v3); t.vertex(x3, y3, z3);
        t.tex(u4, v4); t.vertex(x4, y4, z4);
    }
}









class Chunk {
    static rebuiltThisFrame = 0;
    static updates = 0;

    constructor(level, x0, y0, z0, x1, y1, z1) {
        this.level = level;
        this.t = level.engine.t;
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;

        this.aabb = new AABB(x0, y0, z0, x1, y1, z1);
        this.dirty = true;

        this.texture = level.texture;
        this.material = level.material;

        this.meshes = [new THREE.Mesh(), new THREE.Mesh()];
        this.meshes.forEach(m => m.frustumCulled = true);
    }

    rebuild(layer) {
        if (Chunk.rebuiltThisFrame >= 2) return;

        this.dirty = false;
        Chunk.updates++;
        Chunk.rebuiltThisFrame++;

        this.t.init();

        for (let x = this.x0; x < this.x1; x++) {
            for (let y = this.y0; y < this.y1; y++) {
                for (let z = this.z0; z < this.z1; z++) {
                    if (this.level.isTile(x, y, z)) {
                        const grassLevel = this.level.depth * 2 / 3
                        const isGrass = (y < grassLevel && y > grassLevel - 1);
                        if (isGrass) {
                            Tile.grass.render(this.t, this.level, layer, x, y, z);
                        } else {
                            Tile.rock.render(this.t, this.level, layer, x, y, z);
                        }
                    }
                }
            }
        }

        const newGeometry = this.t.createGeometry();

        if (this.meshes[layer].geometry) {
            this.meshes[layer].geometry.dispose();
        }

        if (newGeometry) {
            this.meshes[layer].geometry = newGeometry;
            this.meshes[layer].material = this.material;
            this.meshes[layer].visible = true;
        } else {
            this.meshes[layer].geometry = new THREE.BufferGeometry();
            this.meshes[layer].visible = false;
        }
    }

    render(layer) {
        if (this.dirty) {
            this.rebuild(0);
            this.rebuild(1);
        }

        this.meshes[layer].visible = this.meshes[layer].geometry.attributes.position !== undefined;
    }



    setDirty() {
        this.dirty = true;
    }

    destroy() {
        for (let i = 0; i < 2; i++) {
            if (this.meshes[i]) {
                if (this.meshes[i].geometry) {
                    this.meshes[i].geometry.dispose();
                }
                if (this.meshes[i].parent) {
                    this.meshes[i].parent.remove(this.meshes[i]);
                }
            }
        }
        this.meshes = [];
    }
}









class Player {
    constructor(level) {
        this.level = level;
        this.engine = this.level.engine;
        this.input = this.engine.input;

        this.x = 0; this.y = 0; this.z = 0;
        this.xo = 0; this.yo = 0; this.zo = 0;

        this.xd = 0; this.yd = 0; this.zd = 0;

        this.yRot = 0;
        this.xRot = 0;

        this.bb = null;
        this.onGround = false;

        this.b1state = false;
        this.b2state = false;

        this.resetPos();
    }

    getSelectedPos() {
        return this.level.pick(5.0);
    }

    placeBlock() {
        log("place")
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
        log("destroy")
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

        this.engine.input_manager.mouseMoved.addEvent((pos) => {
            if (document.pointerLockElement) {
                const sensitivity = (this.engine.config.data.Sensitivity || 100) / 100;

                const factor = 0.005 * sensitivity;

                const invertY = this.engine.config.data.InvertMouse ? -1 : 1;

                this.turn(
                    -pos.movementX * factor,
                    pos.movementY * factor * invertY
                );
            }
        });

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
                this.yd = 0.5;
            }

            if (this.input.getInputState("KeyG")) {
                const zomb = new Zombie(this.level, 0, 0, 0, this.level.engine.scene);
                zomb.setPos(this.x, this.y, this.z);
                this.level.entities.push(zomb);
            }
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

                const speed = this.onGround ? 0.1 : 0.02;

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
}









class Timer {
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

        this.asset_manager = new AssetManager(this)

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
        this.camera = new THREE.PerspectiveCamera(70, this.canvas_renderer.POM, 0.01, 1000.0);
        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.FogExp2(this.fogColor, 0.008);

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
        this.gameMenuScreen = new GameMenuScreen(this);
        this.inGameScreen = new InGameScreen(this);
    }

    startWorld(worldzip) {
        this.renderState.state = Enum.RenderState.InGame;
        this.renderer.setClearColor(this.fogColor);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        this.scene.background = this.fogColor;

        this.level = new Level(this, 256, 256, 64);
        this.levelRenderer = new LevelRenderer(this.level, this.scene);

        this.level.init();

        this.config.data.RenderFactor = 1;
        this.input_manager.lockMouse();
        this.setScreen(this.inGameScreen);
    }

    closeWorld() {
        this.cleanScene();
        this.levelRenderer.destroy();
        this.level.destroy();
        this.setRenderState(Enum.RenderState.Clear);
        this.setScreen(this.menuScreen);
        this.extraScreen = null;
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

assets.newAsset("font", "../assets/fonts/default.gif", Enum.AssetType.Texture);
assets.newAsset("terrain", "../assets/textures/terrain.png", Enum.AssetType.Texture);
assets.newAsset("steve", "../assets/textures/char.png", Enum.AssetType.Texture);
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
assets.newAsset("hover_reverse", "../assets/audio/random/hover_reverse.ogg", Enum.AssetType.Audio);
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
