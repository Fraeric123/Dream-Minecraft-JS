import * as THREE from '../libs/three.module.min.js';
import { Chunk } from '../level/Chunk.js';
import { Frustum } from './Frustum.js';
import { Tesselator } from '../render/Tesselator.js';
import { Textures } from '../render/Textures.js';
import { Tile } from '../level/tile/Tile.js';
import { DirtyChunkSorter } from './DirtyChunkSorter.js';

export class LevelRenderer {
    constructor(level, scene) {
        this.CHUNK_SIZE = 16;
        this.level = level;
        this.scene = scene;

        this.xChunks = Math.floor(level.width / this.CHUNK_SIZE);
        this.yChunks = Math.floor(level.depth / this.CHUNK_SIZE);
        this.zChunks = Math.floor(level.height / this.CHUNK_SIZE);

        this.chunks = new Array(this.xChunks * this.yChunks * this.zChunks);

        this.chunkGrid = new Array(this.xChunks * this.yChunks * this.zChunks);

        this.drawDistance = 0;

        for (let x = 0; x < this.xChunks; x++) {
            for (let y = 0; y < this.yChunks; y++) {
                for (let z = 0; z < this.zChunks; z++) {
                    let x0 = x * this.CHUNK_SIZE;
                    let y0 = y * this.CHUNK_SIZE;
                    let z0 = z * this.CHUNK_SIZE;
                    let x1 = (x + 1) * this.CHUNK_SIZE;
                    let y1 = (y + 1) * this.CHUNK_SIZE;
                    let z1 = (z + 1) * this.CHUNK_SIZE;

                    if (x1 > level.width) x1 = level.width;
                    if (y1 > level.depth) y1 = level.depth;
                    if (z1 > level.height) z1 = level.height;

                    const chunkIndex = (x + y * this.xChunks) * this.zChunks + z;
                    const newChunk = new Chunk(level, x0, y0, z0, x1, y1, z1);
                    this.chunks[chunkIndex] = newChunk;
                    this.chunkGrid[chunkIndex] = newChunk;

                    this.scene.add(newChunk.meshes[0]);
                    this.scene.add(newChunk.meshes[1]);
                }
            }
        }

        this.frustum = new Frustum();

        this.cloudsTick = 0;

        this.lX = -9999.0;
        this.lY = -9999.0;
        this.lZ = -9999.0;

        level.addListener(this);
    }

    pick(distance = 5.0, camera) {
        const start = new THREE.Vector3().copy(camera.position);
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();

        let x = Math.floor(start.x);
        let y = Math.floor(start.y);
        let z = Math.floor(start.z);

        const stepX = dir.x > 0 ? 1 : -1;
        const stepY = dir.y > 0 ? 1 : -1;
        const stepZ = dir.z > 0 ? 1 : -1;

        const tDeltaX = dir.x !== 0 ? Math.abs(1 / dir.x) : Infinity;
        const tDeltaY = dir.y !== 0 ? Math.abs(1 / dir.y) : Infinity;
        const tDeltaZ = dir.z !== 0 ? Math.abs(1 / dir.z) : Infinity;

        let tMaxX = dir.x !== 0 ? (dir.x > 0 ? (x + 1 - start.x) : (start.x - x)) * tDeltaX : Infinity;
        let tMaxY = dir.y !== 0 ? (dir.y > 0 ? (y + 1 - start.y) : (start.y - y)) * tDeltaY : Infinity;
        let tMaxZ = dir.z !== 0 ? (dir.z > 0 ? (z + 1 - start.z) : (start.z - z)) * tDeltaZ : Infinity;

        let f = -1;
        let dist = 0;

        const isPickable = (bx, by, bz) => {
            const id = this.level.getTile(bx, by, bz);
            if (id <= 0) return false;
            const tile = Tile.tiles[id];
            return tile != null && tile.mayPick();
        };

        if (isPickable(x, y, z)) {
            return { x: x, y: y, z: z, f: f };
        }

        while (dist < distance) {
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

            if (isPickable(x, y, z)) {
                return { x: x, y: y, z: z, f: f };
            }
        }
        return null;
    }

    renderSurroundingGround() {
        if (this.groundMesh) {
            this.groundMesh.visible = true;
        }
    }

    compileSurroundingGround() {
        if (this.groundMesh) {
            // Geometry only depends on level.width/height/getGroundLevel(),
            // which never change for a given LevelRenderer (the world size
            // is fixed), so there is nothing to rebuild on a regenerate.
            this.groundMesh.visible = true;
            return;
        }

        const t = Tesselator.instance;
        const groundLevel = this.level.getGroundLevel();
        const y = groundLevel - 2.0;

        let s = 128;
        if (s > this.level.width) s = this.level.width;
        if (s > this.level.height) s = this.level.height;
        const d = 5;

        t.init();

        for (let xx = -s * d; xx < this.level.width + s * d; xx += s) {
            for (let i = -s * d; i < this.level.height + s * d; i += s) {
                let yy = y;
                if (xx >= 0 && i >= 0 && xx < this.level.width && i < this.level.height) {
                    yy = 0.0;
                }

                t.color(1.0, 1.0, 1.0);
                t.vertexUV(xx + 0, yy, i + s, 0.0, s);
                t.vertexUV(xx + s, yy, i + s, s, s);
                t.vertexUV(xx + s, yy, i + 0, s, 0.0);
                t.vertexUV(xx + 0, yy, i + 0, 0.0, 0.0);
            }
        }

        for (let xx = 0; xx < this.level.width; xx += s) {
            t.color(0.8, 0.8, 0.8);
            t.vertexUV(xx + 0, 0.0, 0.0, 0.0, 0.0);
            t.vertexUV(xx + s, 0.0, 0.0, s, 0.0);
            t.vertexUV(xx + s, y, 0.0, s, y);
            t.vertexUV(xx + 0, y, 0.0, 0.0, y);

            t.color(0.8, 0.8, 0.8);
            t.vertexUV(xx + 0, y, this.level.height, 0.0, y);
            t.vertexUV(xx + s, y, this.level.height, s, y);
            t.vertexUV(xx + s, 0.0, this.level.height, s, 0.0);
            t.vertexUV(xx + 0, 0.0, this.level.height, 0.0, 0.0);
        }

        for (let zz = 0; zz < this.level.height; zz += s) {
            t.color(0.6, 0.6, 0.6);
            t.vertexUV(0.0, y, zz + 0, 0.0, 0.0);
            t.vertexUV(0.0, y, zz + s, s, 0.0);
            t.vertexUV(0.0, 0.0, zz + s, s, y);
            t.vertexUV(0.0, 0.0, zz + 0, 0.0, y);

            t.color(0.6, 0.6, 0.6);
            t.vertexUV(this.level.width, 0.0, zz + 0, 0.0, y);
            t.vertexUV(this.level.width, 0.0, zz + s, s, y);
            t.vertexUV(this.level.width, y, zz + s, s, 0.0);
            t.vertexUV(this.level.width, y, zz + 0, 0.0, 0.0);
        }

        const geometry = t.flush();
        if (!geometry) return;

        const rockTexture = Textures.loadTexture('./assets/textures/rock.png');

        rockTexture.flipY = false;
        rockTexture.magFilter = THREE.NearestFilter;
        rockTexture.minFilter = THREE.NearestFilter;
        rockTexture.wrapS = THREE.RepeatWrapping;
        rockTexture.wrapT = THREE.RepeatWrapping;

        const material = new THREE.MeshBasicMaterial({
            map: rockTexture,
            vertexColors: true
        });

        this.groundMesh = new THREE.Mesh(geometry, material);
        if (this.scene) {
            this.scene.add(this.groundMesh);
        }
    }

    renderSurroundingWater() {
        if (this.waterMesh) {
            this.waterMesh.visible = true;
        }
    }

    compileSurroundingWater() {
        if (this.waterMesh) {
            // Same reasoning as compileSurroundingGround(): geometry only
            // depends on the fixed world size, so nothing to rebuild.
            this.waterMesh.visible = true;
            return;
        }

        const t = Tesselator.instance;

        const y = this.level.getWaterLevel();

        let s = 128;
        if (s > this.level.width) s = this.level.width;
        if (s > this.level.height) s = this.level.height;
        const d = 5;

        t.init();

        for (let xx = -s * d; xx < this.level.width + s * d; xx += s) {
            for (let zz = -s * d; zz < this.level.height + s * d; zz += s) {
                const yy = y - 0.1;
                if (xx < 0 || zz < 0 || xx >= this.level.width || zz >= this.level.height) {
                    t.color(1.0, 1.0, 1.0);

                    t.vertexUV(xx + 0, yy, zz + s, 0.0, s);
                    t.vertexUV(xx + s, yy, zz + s, s, s);
                    t.vertexUV(xx + s, yy, zz + 0, s, 0.0);
                    t.vertexUV(xx + 0, yy, zz + 0, 0.0, 0.0);

                    t.vertexUV(xx + 0, yy, zz + 0, 0.0, 0.0);
                    t.vertexUV(xx + s, yy, zz + 0, s, 0.0);
                    t.vertexUV(xx + s, yy, zz + s, s, s);
                    t.vertexUV(xx + 0, yy, zz + s, 0.0, s);
                }
            }
        }

        const geometry = t.flush();
        if (!geometry) return;

        const waterTexture = Textures.loadTexture('./assets/textures/water.png');

        waterTexture.flipY = false;
        waterTexture.magFilter = THREE.NearestFilter;
        waterTexture.minFilter = THREE.NearestFilter;
        waterTexture.wrapS = THREE.RepeatWrapping;
        waterTexture.wrapT = THREE.RepeatWrapping;

        const material = new THREE.MeshBasicMaterial({
            map: waterTexture,
            transparent: true,
            vertexColors: true,
            side: THREE.FrontSide
        });

        this.waterMesh = new THREE.Mesh(geometry, material);
        if (this.scene) {
            this.scene.add(this.waterMesh);
        }
    }

    compileClouds() {
        if (this.cloudsMesh) {
            // Same reasoning as compileSurroundingGround(): geometry only
            // depends on the fixed world size, so nothing to rebuild.
            this.cloudsMesh.visible = true;
            return;
        }

        const t = Tesselator.instance;
        const cloudY = this.level.depth + 2;

        t.init();

        for (let s2 = -2048; s2 < this.level.width + 2048; s2 += 512) {
            for (let s = -2048; s < this.level.height + 2048; s += 512) {

                t.vertexUV(s2, cloudY, s + 512, s2 * 4.8828125E-4, (s + 512) * 4.8828125E-4);
                t.vertexUV(s2 + 512, cloudY, s + 512, (s2 + 512) * 4.8828125E-4, (s + 512) * 4.8828125E-4);
                t.vertexUV(s2 + 512, cloudY, s, (s2 + 512) * 4.8828125E-4, s * 4.8828125E-4);
                t.vertexUV(s2, cloudY, s, s2 * 4.8828125E-4, s * 4.8828125E-4);

                t.vertexUV(s2, cloudY, s, s2 * 4.8828125E-4, s * 4.8828125E-4);
                t.vertexUV(s2 + 512, cloudY, s, (s2 + 512) * 4.8828125E-4, s * 4.8828125E-4);
                t.vertexUV(s2 + 512, cloudY, s + 512, (s2 + 512) * 4.8828125E-4, (s + 512) * 4.8828125E-4);
                t.vertexUV(s2, cloudY, s + 512, s2 * 4.8828125E-4, (s + 512) * 4.8828125E-4);
            }
        }

        const geometry = t.flush();
        if (!geometry) return;

        const cloudTexture = Textures.loadTexture('./assets/textures/clouds.png');

        cloudTexture.flipY = false;
        cloudTexture.magFilter = THREE.NearestFilter;
        cloudTexture.minFilter = THREE.NearestFilter;
        cloudTexture.wrapS = THREE.RepeatWrapping;
        cloudTexture.wrapT = THREE.RepeatWrapping;

        const material = new THREE.MeshBasicMaterial({
            map: cloudTexture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.FrontSide,
            depthWrite: false
        });

        this.cloudsMesh = new THREE.Mesh(geometry, material);
        this.cloudsMesh.renderOrder = -1;  // Render before the world geometry
        if (this.scene) {
            this.scene.add(this.cloudsMesh);
        }
    }

    renderClouds(partialTick = 0) {
        if (!this.cloudsMesh) {
            this.compileClouds();
        }
        if (!this.cloudsMesh || !this.cloudsMesh.material || !this.cloudsMesh.material.map) return;

        const f2 = 4.8828125E-4;
        // Convert wall-clock ms to ticks (20 TPS = 50ms/tick).
        const tickTime = performance.now() / 50.0;
        const scrollU = (tickTime + partialTick) * f2 * 0.03;

        // offset.x is a uniform - no need to re-upload texture data.
        // Setting needsUpdate=true here triggers "Texture marked for update but
        // no image data found" while the cloud texture is still loading.
        this.cloudsMesh.material.map.offset.x = scrollU;
        this.cloudsMesh.visible = true;
    }

    mergeGeometries(geometries) {
        if (geometries[0] instanceof THREE.BufferGeometry) {
            return geometries[0];
        }
        return geometries[0];
    }

    renderHit(h, mode, color = 0x000000, opacity = 0.2) {
        if (!this.selectionMesh) {
            const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity,
                depthWrite: false
            });
            this.selectionMesh = new THREE.Mesh(boxGeo, material);
            this.selectionMesh.renderOrder = 999;
            this.scene.add(this.selectionMesh);
        }

        this.selectionMesh.visible = true;

        let x = h.x;
        let y = h.y;
        let z = h.z;

        if (mode === 1) {
            if (h.f === 0) y--;
            if (h.f === 1) y++;
            if (h.f === 2) z--;
            if (h.f === 3) z++;
            if (h.f === 4) x--;
            if (h.f === 5) x++;
        }
        if (this.selectionMesh.material.color.getHex() !== color) {
            this.selectionMesh.material.color.setHex(color);
        }
        if (this.selectionMesh.material.opacity !== opacity) {
            this.selectionMesh.material.opacity = opacity;
        }

        this.selectionMesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    }

    updateFrustum(camera) {
        if (!camera) return;
        if (camera.updateMatrixWorld) camera.updateMatrixWorld();
        this.frustum = Frustum.getFrustum(
            camera.projectionMatrix.elements,
            camera.matrixWorldInverse.elements
        );
    }

    render(player, layer) {
        const xd = player.x - this.lX;
        const yd = player.y - this.lY;
        const zd = player.z - this.lZ;

        if ((xd * xd + yd * yd + zd * zd) > 64.0) {
            this.lX = player.x;
            this.lY = player.y;
            this.lZ = player.z;

            this.chunks.sort((chunkA, chunkB) => {
                return chunkA.distanceToSqr(player) - chunkB.distanceToSqr(player);
            });
        }

        const dd = 256 >> this.drawDistance;
        const maxDistanceSqr = dd * dd;

        const frustum = this.frustum;
        const hasFrustum = !!frustum;

        this.chunks.forEach(chunk => {
            if (hasFrustum && !frustum.isVisible(chunk.aabb)) {
                chunk.visible = false;
                chunk.meshes[layer].visible = false;
                return;
            }

            if (this.drawDistance !== 0 && chunk.distanceToSqr(player) >= maxDistanceSqr) {
                chunk.visible = false;
                chunk.meshes[layer].visible = false;
                return;
            }

            chunk.visible = true;
            chunk.render(layer);
        });
    }

    toggleDrawDistance() {
        this.drawDistance = (this.drawDistance + 1) % 4;
    }

    updateDirtyChunks(player, camera) {
        Chunk.rebuiltThisFrame = 0;

        let dirty = this.getAllDirtyChunks();
        if (!dirty || dirty.length === 0) return;

        const sorter = new DirtyChunkSorter(player, this.frustum);
        dirty.sort((a, b) => sorter.compare(a, b));

        const limit = Math.min(8, dirty.length);
        for (let i = 0; i < limit; i++) {
            dirty[i].rebuild(0);
            dirty[i].rebuild(1);
        }
    }

    getAllDirtyChunks() {
        let dirty = [];
        this.chunks.forEach(chunk => {
            if (chunk.isDirty()) {
                dirty.push(chunk);
            }
        });
        return dirty;
    }

    getChunkAt(cx, cy, cz) {
        if (cx < 0 || cx >= this.xChunks ||
            cy < 0 || cy >= this.yChunks ||
            cz < 0 || cz >= this.zChunks) return null;
        const index = (cx + cy * this.xChunks) * this.zChunks + cz;
        return this.chunkGrid[index];
    }

    setDirty(x0, y0, z0, x1, y1, z1) {
        x0 = Math.floor(x0 / this.CHUNK_SIZE);
        x1 = Math.floor(x1 / this.CHUNK_SIZE);
        y0 = Math.floor(y0 / this.CHUNK_SIZE);
        y1 = Math.floor(y1 / this.CHUNK_SIZE);
        z0 = Math.floor(z0 / this.CHUNK_SIZE);
        z1 = Math.floor(z1 / this.CHUNK_SIZE);

        if (x0 < 0) x0 = 0;
        if (y0 < 0) y0 = 0;
        if (z0 < 0) z0 = 0;
        if (x1 >= this.xChunks) x1 = this.xChunks - 1;
        if (y1 >= this.yChunks) y1 = this.yChunks - 1;
        if (z1 >= this.zChunks) z1 = this.zChunks - 1;

        for (let x = x0; x <= x1; x++) {
            for (let y = y0; y <= y1; y++) {
                for (let z = z0; z <= z1; z++) {
                    const chunk = this.getChunkAt(x, y, z);
                    if (chunk) chunk.setDirty();
                }
            }
        }
    }

    tileChanged(x1, y1, z1, x2, y2, z2) {
        this.setDirty(x1, y1, z1, x2, y2, z2);
    }

    lightColumnChanged(x, z, y0, y1) {
        this.setDirty(x - 1, y0 - 1, z - 1, x + 1, y1 + 1, z + 1);
    }

    allChanged() {
        this.setDirty(0, 0, 0, this.level.width, this.level.depth, this.level.height);
    }

    /**
     * Rebuild every dirty chunk synchronously, ignoring the per-frame limit
     * used by updateDirtyChunks. Used after loading a save so the whole world
     * is visible immediately instead of popping in 8 chunks at a time.
     */
    rebuildAllChunksNow() {
        if (!this.chunks) return;
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            if (!chunk) continue;
            if (chunk.isDirty()) {
                chunk.rebuild(0);
                chunk.rebuild(1);
            }
        }
    }

    /**
     * Immediately dispose all chunk geometries and replace them with empty
     * buffer geometries. Used after loading a save so that stale geometry
     * from the previous world is not visible while dirty chunks wait to be
     * rebuilt (updateDirtyChunks only rebuilds 8 per frame).
     */
    clearChunkGeometries() {
        if (!this.chunks) return;
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            if (!chunk) continue;
            for (let layer = 0; layer < 2; layer++) {
                const mesh = chunk.meshes[layer];
                if (!mesh) continue;
                if (mesh.geometry) mesh.geometry.dispose();
                mesh.geometry = new THREE.BufferGeometry();
                mesh.visible = false;
            }
            chunk.setDirty();
        }
    }

    /**
     * Fully tear down this LevelRenderer: remove every mesh it added to the
     * scene (chunks, clouds, ground, water, selection) and dispose their GPU
     * resources. Also unregisters itself as a level listener so the old level
     * cannot leak callbacks into the new renderer.
     *
     * This MUST be called before constructing a new LevelRenderer for the
     * same scene, otherwise the old clouds / ground / water / selection
     * meshes stay in the scene and get duplicated on every regenerate.
     */
    destroy() {
        if (!this.scene) return;

        // Chunks
        if (this.chunks) {
            for (let i = 0; i < this.chunks.length; i++) {
                const chunk = this.chunks[i];
                if (!chunk) continue;
                for (let layer = 0; layer < 2; layer++) {
                    const mesh = chunk.meshes[layer];
                    if (mesh) {
                        this.scene.remove(mesh);
                        if (mesh.geometry) mesh.geometry.dispose();
                    }
                }
            }
            this.chunks = null;
            this.chunkGrid = null;
        }

        // Clouds
        if (this.cloudsMesh) {
            this.scene.remove(this.cloudsMesh);
            this.cloudsMesh.geometry.dispose();
            if (this.cloudsMesh.material) {
                if (this.cloudsMesh.material.map) this.cloudsMesh.material.map.dispose();
                this.cloudsMesh.material.dispose();
            }
            this.cloudsMesh = null;
        }

        // Surrounding ground
        if (this.groundMesh) {
            this.scene.remove(this.groundMesh);
            this.groundMesh.geometry.dispose();
            if (this.groundMesh.material) {
                if (this.groundMesh.material.map) this.groundMesh.material.map.dispose();
                this.groundMesh.material.dispose();
            }
            this.groundMesh = null;
        }

        // Surrounding water
        if (this.waterMesh) {
            this.scene.remove(this.waterMesh);
            this.waterMesh.geometry.dispose();
            if (this.waterMesh.material) {
                if (this.waterMesh.material.map) this.waterMesh.material.map.dispose();
                this.waterMesh.material.dispose();
            }
            this.waterMesh = null;
        }

        // Block selection highlight
        if (this.selectionMesh) {
            this.scene.remove(this.selectionMesh);
            this.selectionMesh.geometry.dispose();
            this.selectionMesh.material.dispose();
            this.selectionMesh = null;
        }

        // Stop listening to the old level
        if (this.level && typeof this.level.removeListener === 'function') {
            this.level.removeListener(this);
        }
        this.level = null;
        this.scene = null;
    }
}