import * as THREE from 'three';

import { Enum, EventList } from "./Util.js";




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

export class AssetManager {
    constructor(engine) {
        this.engine = engine;

        this.loaders = new Map();

        this.audioLoader = new THREE.AudioLoader();
        this.textureLoader = new THREE.TextureLoader();

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
        this.loaders.set(Enum.AssetType.Audio, this._loadAudio.bind(this));
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
}
