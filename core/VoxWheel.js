







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

    drawText(text, x, y, rotation = 0, shadow = true, scale = 3, hexColor = 0xFFFFFF, opacity = 1) {
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

        if (rotation !== 0) {
            const halfW = this.tempCanvas.width / 2;
            const halfH = this.tempCanvas.height / 2;

            // Posuneme na zaokrouhlený střed
            this.ctx.translate(Math.round(x + halfW), Math.round(y + halfH));
            this.ctx.rotate(rotation);

            // Vykreslíme vygenerovaný text
            this.ctx.drawImage(
                this.tempCanvas,
                -halfW,
                -halfH
            );
        } else {
            this.ctx.drawImage(
                this.tempCanvas,
                Math.round(x),
                Math.round(y)
            );
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







export class GUIClipEnd extends GUIDrawCommand {
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
    constructor(engine, text, x, y, rotation = 0, size = 5, color = 0xFFFFFF, shadow = true, opacity = 1) {
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
            this.opacity
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

        this.rotation = 0

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

    addBitmapText(text, x, y, rotation, size, color, shadow, opacity) {
        return this.add(new GUIBitmapText(this.engine, text, x, y, rotation, size, color, shadow, opacity));
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







export class GUIButtonElement extends GUIElement {
    constructor(screen, text = "Button", x = 0, y = 0, width = 200, height = 20) {
        super(screen);

        this.input = this.engine.input;

        this.normal = [0, 66, 200, 20];
        this.hovered = [0, 86, 200, 20];
        this.disabled = [0, 46, 200, 20];

        this.state = this.normal;

        this.mouseHover = false;
        this.mousePress = false;

        this.text = text;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();

        this.oldMousePress = false

        this.scale = 4

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale/2), -(this.height * this.scale/2), 199, 19, this.state);
        this.title = this.addBitmapText(this.text, 0 + (this.width * this.scale/2), 0, 0, 1.25 * this.scale);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mpress = this.input.getInputState("Mouse_Button_0") || false

        this.sprite.x = -(this.width * this.scale/2);
        this.sprite.y = -(this.height * this.scale/2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = this.mouseHover && mpress;

        if (this.mouseHover) {
            if (this.mousePress) {
                this.state = this.hovered
            } else {
                this.state = this.hovered
                this.title.color = 0xFAFA00;
            }
        } else {
            this.state = this.normal
            this.title.color = 0xFFFFFF;
        }

        if (this.oldMousePress != this.mousePress) {
            this.oldMousePress = this.mousePress;
            if (this.mousePress) {
                this.onClick.runAll()
            }
        }

        this.sprite.cords = this.state
        this.sprite.w = this.width * this.scale
        this.sprite.h = this.height * this.scale

        this.title.x = 0 - this.title.getTextWidth()/2;
        this.title.y = 0 - this.title.getTextHeight()/2;

        super.render(ctx);
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
        return element;
    }

    addButton(text, x, y, width, height) {
        return this.addElement(new GUIButtonElement(this, text, x, y, width, height));
    }

    init() {

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
        rect.add(new GUIBitmapText(this.engine, "Minecraft asset loading", 15, 15, 0, 16));

        this.Pic = new GUITexturePanel(this.engine, "terrain", 100, 400, 900, 500);
        rect.add(this.Pic);

        this.Text = new GUIBitmapText(this.engine, "", 10, 320, 0, 5, 0x777777);
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
        rect.add(new GUIBitmapText(this.engine, "Logo", 15, 15, 0, 16));

        this.Pic = new GUITexturePanel(this.engine, "font", -500, 500, 5000, 500);
        rect.add(this.Pic);

        this.Text = new GUIBitmapText(this.engine, "num", 10, 320, 0, 10, 0x777777);
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

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;

        this.splashTextStr = this._getRandomSplash();
        this.gradientImage = this._createOverlayGradient(canvasW, canvasH);

        const rect = new GUIElement(this);
        const backgroundOverlay = new GUIElement(this);

        backgroundOverlay.add(new GUIImagePanel(
            this.engine,
            this.gradientImage,
            0, 0,
            canvasW, canvasH,
            0, 0.2
        ));
        this.addElement(backgroundOverlay);
        rect.add(new GUITexturePanel(this.engine, "logo", canvasW / 2 - 500, 50, 1000, 170));
        rect.add(new GUIBitmapText(this.engine, "by Fraeric123", 2195, 1395, 0, 5));
        rect.add(new GUIBitmapText(this.engine, "not Minecraft 1.0.0", 10, 1395, 0, 5));

        this.splashText = new GUIBitmapText(
            this.engine,
            this.splashTextStr,
            centerX + 180,
            150,
            -20,
            5,
            0xFFFF00
        );
        rect.add(this.splashText);

        this.addElement(rect);

        this.playBut = this.addButton("Play", centerX, centerY-100);
        this.playBut.onClick.addEvent(() => {
            log("play")
        })

        this.exitBut = this.addButton("Exit", centerX, centerY);
        this.exitBut.onClick.addEvent(() => {
            window.close();
        })

        this.f = 0;
    }

    _createOverlayGradient(width, height) {
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

    _getRandomSplash() {
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

    init() {
        const scene = this.engine.scene;

        const p0 = this.engine.asset_manager.get("pano0");
        const p1 = this.engine.asset_manager.get("pano1");
        const p2 = this.engine.asset_manager.get("pano2");
        const p3 = this.engine.asset_manager.get("pano3");
        const p4 = this.engine.asset_manager.get("pano4");
        const p5 = this.engine.asset_manager.get("pano5");

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
            scene.background = cubeTexture;
        }

        this.engine.camera.position.set(0, 0, 0);
    }

    render(ctx) {
        this.f++;

        const rotX = (Math.sin(this.f / 400) * 25 + 20) * deg2rad;
        const rotY = (-this.f * 0.1) * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        const timeMs = Date.now() % 1000;
        const wave = Math.abs(Math.sin((timeMs / 1000) * Math.PI * 2));
        const scaleFactor = 1.8 - wave * 0.1;

        const textWidth = this.splashText.getTextWidth(this.splashText.text, 1);
        this.splashText.size = (scaleFactor * 100) / (textWidth + 32) * 3;

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
        this.screen.init();
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

const g = new VoxWheel({ assets: assets })

await g.run();