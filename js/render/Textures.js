import * as THREE from '../libs/three.module.min.js';
import { TextureManager } from './TextureManager.js';
import { LavaTexture } from './dynamic/LavaTexture.js';
import { WaterTexture } from './dynamic/WaterTexture.js';

export class Textures {
    static textureManager = null;
    static _terrainAnimationSetup = false;

    // Cache of already-loaded textures, keyed by path. Several places
    // (compileSurroundingGround/Water/compileClouds) call loadTexture() with
    // the same path every time the world regenerates. Without this cache,
    // every regen created a brand new THREE.TextureLoader + Image + GPU
    // texture upload for rock/water/clouds, which never got reused - only
    // the previous one got disposed. Returning the same Texture instance
    // means there is nothing new to upload or dispose on repeat calls.
    static _cache = new Map();

    static loadTexture(path) {
        const cached = Textures._cache.get(path);
        if (cached) return cached;

        const loader = new THREE.TextureLoader();
        const texture = loader.load(path);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.flipY = true;

        Textures._cache.set(path, texture);
        return texture;
    }

    /**
     * Set up the terrain atlas animation (lava + water).
     *
     * The terrain texture (terrain_atlas_texture) is a SHARED SINGLETON - the
     * same THREE.Texture object is reused across every Level / regen. So the
     * animation only needs to be set up ONCE. Calling this again on every
     * regen would:
     *   - start a new ImageLoader each time (multiple async loads in flight),
     *   - create a new canvas + TextureManager each time,
     *   - briefly have multiple managers ticking before the old ones are GC'd.
     * The guard below ensures it only runs once for the lifetime of the page.
     */
    static setupTerrainAnimation(texture, path) {
        if (Textures._terrainAnimationSetup) return;
        Textures._terrainAnimationSetup = true;

        const loader = new THREE.ImageLoader();
        loader.load(path, (image) => {
            // Guard: if the page is being torn down, texture may be null.
            if (!texture) return;

            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            texture.image = canvas;
            texture.needsUpdate = true;

            const manager = new TextureManager(texture, canvas, ctx);

            manager.addAnimation(new LavaTexture());
            manager.addAnimation(new WaterTexture());
            Textures.textureManager = manager;
        });
    }

    static tickAnimations() {
        if (Textures.textureManager) {
            Textures.textureManager.tick();
        }
    }
}