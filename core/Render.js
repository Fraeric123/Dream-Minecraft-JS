import { THREE } from "./VoxWheel.js";
import { AABB } from "./Util.js";
import { Tile } from "./Tile.js";







export class Frustum {
    static _instance = new Frustum();

    constructor() {
        this.m_Frustum = Array.from({ length: 6 }, () => new Float32Array(4));

        this.proj = new Float32Array(16);
        this.modl = new Float32Array(16);
        this.clip = new Float32Array(16);
    }

    static RIGHT = 0;
    static LEFT = 1;
    static BOTTOM = 2;
    static TOP = 3;
    static BACK = 4;
    static FRONT = 5;

    static getFrustum(projectionMatrix, modelViewMatrix) {
        if (projectionMatrix && modelViewMatrix) {
            Frustum._instance.calculateFrustum(projectionMatrix, modelViewMatrix);
        }
        return Frustum._instance;
    }

    normalizePlane(side) {
        const f = this.m_Frustum[side];
        const magnitude = Math.sqrt(f[0] * f[0] + f[1] * f[1] + f[2] * f[2]);

        f[0] /= magnitude;
        f[1] /= magnitude;
        f[2] /= magnitude;
        f[3] /= magnitude;
    }

    calculateFrustum(projectionMatrix, modelViewMatrix) {
        this.proj.set(projectionMatrix);
        this.modl.set(modelViewMatrix);

        const modl = this.modl;
        const proj = this.proj;
        const clip = this.clip;

        clip[0] = modl[0] * proj[0] + modl[1] * proj[4] + modl[2] * proj[8] + modl[3] * proj[12];
        clip[1] = modl[0] * proj[1] + modl[1] * proj[5] + modl[2] * proj[9] + modl[3] * proj[13];
        clip[2] = modl[0] * proj[2] + modl[1] * proj[6] + modl[2] * proj[10] + modl[3] * proj[14];
        clip[3] = modl[0] * proj[3] + modl[1] * proj[7] + modl[2] * proj[11] + modl[3] * proj[15];

        clip[4] = modl[4] * proj[0] + modl[5] * proj[4] + modl[6] * proj[8] + modl[7] * proj[12];
        clip[5] = modl[4] * proj[1] + modl[5] * proj[5] + modl[6] * proj[9] + modl[7] * proj[13];
        clip[6] = modl[4] * proj[2] + modl[5] * proj[6] + modl[6] * proj[10] + modl[7] * proj[14];
        clip[7] = modl[4] * proj[3] + modl[5] * proj[7] + modl[6] * proj[11] + modl[7] * proj[15];

        clip[8] = modl[8] * proj[0] + modl[9] * proj[4] + modl[10] * proj[8] + modl[11] * proj[12];
        clip[9] = modl[8] * proj[1] + modl[9] * proj[5] + modl[10] * proj[9] + modl[11] * proj[13];
        clip[10] = modl[8] * proj[2] + modl[9] * proj[6] + modl[10] * proj[10] + modl[11] * proj[14];
        clip[11] = modl[8] * proj[3] + modl[9] * proj[7] + modl[10] * proj[11] + modl[11] * proj[15];

        clip[12] = modl[12] * proj[0] + modl[13] * proj[4] + modl[14] * proj[8] + modl[15] * proj[12];
        clip[13] = modl[12] * proj[1] + modl[13] * proj[5] + modl[14] * proj[9] + modl[15] * proj[13];
        clip[14] = modl[12] * proj[2] + modl[13] * proj[6] + modl[14] * proj[10] + modl[15] * proj[14];
        clip[15] = modl[12] * proj[3] + modl[13] * proj[7] + modl[14] * proj[11] + modl[15] * proj[15];

        this.m_Frustum[0][0] = clip[3] - clip[0];
        this.m_Frustum[0][1] = clip[7] - clip[4];
        this.m_Frustum[0][2] = clip[11] - clip[8];
        this.m_Frustum[0][3] = clip[15] - clip[12];
        this.normalizePlane(0);

        this.m_Frustum[1][0] = clip[3] + clip[0];
        this.m_Frustum[1][1] = clip[7] + clip[4];
        this.m_Frustum[1][2] = clip[11] + clip[8];
        this.m_Frustum[1][3] = clip[15] + clip[12];
        this.normalizePlane(1);

        this.m_Frustum[2][0] = clip[3] + clip[1];
        this.m_Frustum[2][1] = clip[7] + clip[5];
        this.m_Frustum[2][2] = clip[11] + clip[9];
        this.m_Frustum[2][3] = clip[15] + clip[13];
        this.normalizePlane(2);

        this.m_Frustum[3][0] = clip[3] - clip[1];
        this.m_Frustum[3][1] = clip[7] - clip[5];
        this.m_Frustum[3][2] = clip[11] - clip[9];
        this.m_Frustum[3][3] = clip[15] - clip[13];
        this.normalizePlane(3);

        this.m_Frustum[4][0] = clip[3] - clip[2];
        this.m_Frustum[4][1] = clip[7] - clip[6];
        this.m_Frustum[4][2] = clip[11] - clip[10];
        this.m_Frustum[4][3] = clip[15] - clip[14];
        this.normalizePlane(4);

        this.m_Frustum[5][0] = clip[3] + clip[2];
        this.m_Frustum[5][1] = clip[7] + clip[6];
        this.m_Frustum[5][2] = clip[11] + clip[10];
        this.m_Frustum[5][3] = clip[15] + clip[14];
        this.normalizePlane(5);
    }

    cubeInFrustum(x1, y1, z1, x2, y2, z2) {
        for (let i = 0; i < 6; i++) {
            const f = this.m_Frustum[i];
            if (
                f[0] * x1 + f[1] * y1 + f[2] * z1 + f[3] > 0 ||
                f[0] * x2 + f[1] * y1 + f[2] * z1 + f[3] > 0 ||
                f[0] * x1 + f[1] * y2 + f[2] * z1 + f[3] > 0 ||
                f[0] * x2 + f[1] * y2 + f[2] * z1 + f[3] > 0 ||
                f[0] * x1 + f[1] * y1 + f[2] * z2 + f[3] > 0 ||
                f[0] * x2 + f[1] * y1 + f[2] * z2 + f[3] > 0 ||
                f[0] * x1 + f[1] * y2 + f[2] * z2 + f[3] > 0 ||
                f[0] * x2 + f[1] * y2 + f[2] * z2 + f[3] > 0
            ) {
                continue;
            }
            return false;
        }
        return true;
    }

    isVisible(aabb) {
        return this.cubeInFrustum(aabb.x0, aabb.y0, aabb.z0, aabb.x1, aabb.y1, aabb.z1);
    }
}


export class Chunk {
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

        this.x = (this.x0 + this.x1) / 2;
        this.y = (this.y0 + this.y1) / 2;
        this.z = (this.z0 + this.z1) / 2;

        this.aabb = new AABB(x0, y0, z0, x1, y1, z1);
        this.dirty = true;

        this.texture = level.texture;
        this.material = level.material;

        this.meshes = [new THREE.Mesh(), new THREE.Mesh()];
        this.meshes.forEach(m => {
            m.frustumCulled = true;
            //m.matrixAutoUpdate = false;
            //m.updateMatrix();
        });

        this.visible = true;
    }

    rebuild(layer) {
        this.dirty = false;
        this.dirtiedTime = Date.now();
        Chunk.updates++;
        Chunk.rebuiltThisFrame++;

        this.t.init();

        for (let x = this.x0; x < this.x1; x++) {
            for (let y = this.y0; y < this.y1; y++) {
                for (let z = this.z0; z < this.z1; z++) {

                    const tileId = this.level.getTile(x, y, z);

                    if (tileId > 0) {
                        const tile = Tile.tiles[tileId];
                        tile.render(this.t, this.level, layer, x, y, z);
                    }
                }
            }
        }

        if (this.meshes[layer].geometry) {
            this.meshes[layer].geometry.dispose();
        }

        if (this.t.vertexCount > 0) {
            const newGeometry = this.t.flush();
            if (newGeometry) {
                this.meshes[layer].geometry = newGeometry;
                this.meshes[layer].material = layer === 1 ? this.transparentMaterial : this.material;
                this.meshes[layer].visible = true;
            } else {
                this.meshes[layer].geometry = new THREE.BufferGeometry();
                this.meshes[layer].visible = false;
            }
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

        const hasPositions = !!this.meshes[layer]?.geometry?.attributes?.position;
        this.meshes[layer].visible = hasPositions;
    }

    distanceToSqr(player) {
        const xd = player.x - this.x;
        const yd = player.y - this.y;
        const zd = player.z - this.z;
        return xd * xd + yd * yd + zd * zd;
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


export class LevelRenderer {
    constructor(level, scene, camera = null) {
        this.CHUNK_SIZE = 16;
        this.level = level;
        this.engine = this.level.engine;
        this.scene = scene;
        this.camera = camera;
        this.fog = scene.fog;
        this.t = level.engine.t;

        this.renderDistance = 8;
        this.unloadDistanceOffset = 1;

        this.frustum = new Frustum();

        this.cloudsTick = 0;

        this.chunkMap = new Map();
        this.loadedChunks = [];

        this.xChunks = Math.ceil(level.width / this.CHUNK_SIZE);
        this.yChunks = Math.ceil(level.depth / this.CHUNK_SIZE);
        this.zChunks = Math.ceil(level.height / this.CHUNK_SIZE);

        level.addListener(this);
    }

    init() {
        this.compileClouds();
    }

    compileClouds() {
        if (this.cloudsMesh) {
            this.cloudsMesh.visible = true;
            return;
        }

        const cloudTexture = this.engine.asset_manager.get("clouds");
        if (!cloudTexture || !cloudTexture.image || !cloudTexture.image.width) return;

        const img = cloudTexture.image;
        const w = img.width;
        const h = img.height;

        const scale = 12.0;
        const cloudThickness = 4.0;
        const cloudY = this.level.depth + 50;
        const zFightEpsilon = 0.0009765625;

        this.cloudWidth = w * scale;
        this.cloudHeight = h * scale;

        const uScale = 1.0 / w;
        const vScale = 1.0 / h;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const pixelData = ctx.getImageData(0, 0, w, h).data;

        const opacity = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) {
            opacity[i] = pixelData[i * 4 + 3] > 127 ? 1 : 0;
        }

        const isOpaque = (x, z) => {
            const wx = ((x % w) + w) % w;
            const wz = ((z % h) + h) % h;
            return opacity[wz * w + wx] === 1;
        };

        const t = Tesselator.instance;
        t.init();

        const y0 = cloudY;
        const y1 = cloudY + cloudThickness - zFightEpsilon;

        for (let zi = 0; zi < h; zi++) {
            const za = zi * scale;
            const zb = (zi + 1) * scale - zFightEpsilon;
            const vCenter = (zi + 0.5) * vScale;

            for (let xi = 0; xi < w; xi++) {
                if (!isOpaque(xi, zi)) continue;

                const uCenter = (xi + 0.5) * uScale;
                const xa = xi * scale;
                const xb = (xi + 1) * scale - zFightEpsilon;

                t.setColorRGBA_F(0.7, 0.7, 0.7, 0.8);
                if (t.setNormal) t.setNormal(0.0, -1.0, 0.0);
                t.vertexUV(xa, y0, za, uCenter, vCenter);
                t.vertexUV(xb, y0, za, uCenter, vCenter);
                t.vertexUV(xb, y0, zb, uCenter, vCenter);
                t.vertexUV(xa, y0, zb, uCenter, vCenter);

                t.setColorRGBA_F(1.0, 1.0, 1.0, 0.8);
                if (t.setNormal) t.setNormal(0.0, 1.0, 0.0);
                t.vertexUV(xa, y1, zb, uCenter, vCenter);
                t.vertexUV(xb, y1, zb, uCenter, vCenter);
                t.vertexUV(xb, y1, za, uCenter, vCenter);
                t.vertexUV(xa, y1, za, uCenter, vCenter);

                if (!isOpaque(xi - 1, zi)) {
                    t.setColorRGBA_F(0.9, 0.9, 0.9, 0.8);
                    if (t.setNormal) t.setNormal(-1.0, 0.0, 0.0);
                    t.vertexUV(xa, y0, zb, uCenter, vCenter);
                    t.vertexUV(xa, y1, zb, uCenter, vCenter);
                    t.vertexUV(xa, y1, za, uCenter, vCenter);
                    t.vertexUV(xa, y0, za, uCenter, vCenter);
                }

                if (!isOpaque(xi + 1, zi)) {
                    t.setColorRGBA_F(0.9, 0.9, 0.9, 0.8);
                    if (t.setNormal) t.setNormal(1.0, 0.0, 0.0);
                    t.vertexUV(xb, y0, za, uCenter, vCenter);
                    t.vertexUV(xb, y1, za, uCenter, vCenter);
                    t.vertexUV(xb, y1, zb, uCenter, vCenter);
                    t.vertexUV(xb, y0, zb, uCenter, vCenter);
                }

                if (!isOpaque(xi, zi - 1)) {
                    t.setColorRGBA_F(0.8, 0.8, 0.8, 0.8);
                    if (t.setNormal) t.setNormal(0.0, 0.0, -1.0);
                    t.vertexUV(xa, y1, za, uCenter, vCenter);
                    t.vertexUV(xb, y1, za, uCenter, vCenter);
                    t.vertexUV(xb, y0, za, uCenter, vCenter);
                    t.vertexUV(xa, y0, za, uCenter, vCenter);
                }

                if (!isOpaque(xi, zi + 1)) {
                    t.setColorRGBA_F(0.8, 0.8, 0.8, 0.8);
                    if (t.setNormal) t.setNormal(0.0, 0.0, 1.0);
                    t.vertexUV(xb, y1, zb, uCenter, vCenter);
                    t.vertexUV(xa, y1, zb, uCenter, vCenter);
                    t.vertexUV(xa, y0, zb, uCenter, vCenter);
                    t.vertexUV(xb, y0, zb, uCenter, vCenter);
                }
            }
        }

        const geometry = t.flush();
        if (!geometry) return;

        cloudTexture.flipY = false;
        cloudTexture.magFilter = THREE.NearestFilter;
        cloudTexture.minFilter = THREE.NearestFilter;
        cloudTexture.wrapS = THREE.RepeatWrapping;
        cloudTexture.wrapT = THREE.RepeatWrapping;
        cloudTexture.needsUpdate = true;

        const depthMaterial = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: true,
            side: THREE.FrontSide
        });

        const colorMaterial = new THREE.MeshBasicMaterial({
            map: cloudTexture,
            transparent: true,
            alphaTest: 0.1,
            vertexColors: true,
            side: THREE.FrontSide,
            depthWrite: false,
            depthTest: true
        });

        const depthMesh = new THREE.Mesh(geometry, depthMaterial);
        const colorMesh = new THREE.Mesh(geometry, colorMaterial);

        depthMesh.renderOrder = 999998;
        colorMesh.renderOrder = 999999;

        depthMesh.frustumCulled = false;
        colorMesh.frustumCulled = false;

        const baseCloud = new THREE.Group();
        baseCloud.add(depthMesh);
        baseCloud.add(colorMesh);

        this.cloudsMesh = new THREE.Group();
        for (let ox = 0; ox < 2; ox++) {
            for (let oz = 0; oz < 2; oz++) {
                const tile = baseCloud.clone();
                tile.position.set(ox * this.cloudWidth, 0, oz * this.cloudHeight);
                this.cloudsMesh.add(tile);
            }
        }

        this.cloudsGroup = new THREE.Group();
        this.cloudsGroup.add(this.cloudsMesh);

        if (this.scene) {
            this.scene.add(this.cloudsGroup);
        }
    }

    renderClouds(partialTick = 0) {
        if (!this.cloudsMesh) {
            this.compileClouds();
        }
        if (!this.cloudsMesh || !this.cloudWidth) return;

        const tickTime = performance.now() / 1000;
        const speed = 5.0;
        const scrollX = (tickTime * speed) % this.cloudWidth;

        const camX = this.engine?.camera?.position?.x || 0;
        const camZ = this.engine?.camera?.position?.z || 0;

        const baseX = Math.floor(camX / this.cloudWidth) * this.cloudWidth - this.cloudWidth;
        const baseZ = Math.floor(camZ / this.cloudHeight) * this.cloudHeight - this.cloudHeight;

        this.cloudsMesh.position.x = baseX + scrollX;
        this.cloudsMesh.position.z = baseZ;
        this.cloudsMesh.visible = true;
    }

    setRenderDistance(chunks) {
        this.renderDistance = Math.max(1, chunks);
        const maxBlocks = (this.renderDistance * this.CHUNK_SIZE) - 16;

        const minFar = (this.level.depth + 2) + 128;
        const finalFar = Math.max(maxBlocks, minFar);

        if (this.camera) {
            this.camera.far = finalFar;
            if (this.camera.updateProjectionMatrix) {
                this.camera.updateProjectionMatrix();
            }
        }

        if (this.fog && this.fog.isFogExp2) {
            this.fog.density = 2.0 / finalFar;
        }
    }

    updateFrustum(camera) {
        if (!camera) return;

        if (this.camera !== camera) {
            this.camera = camera;
            this.setRenderDistance(this.renderDistance);
        } else {
            if (camera.updateMatrixWorld) camera.updateMatrixWorld();
        }

        this.frustum = Frustum.getFrustum(
            camera.projectionMatrix.elements,
            camera.matrixWorldInverse.elements
        );
    }

    getChunkKey(cx, cy, cz) {
        return `${cx},${cy},${cz}`;
    }

    createChunk(cx, cy, cz) {
        let x0 = cx * this.CHUNK_SIZE;
        let y0 = cy * this.CHUNK_SIZE;
        let z0 = cz * this.CHUNK_SIZE;
        let x1 = Math.min((cx + 1) * this.CHUNK_SIZE, this.level.width);
        let y1 = Math.min((cy + 1) * this.CHUNK_SIZE, this.level.depth);
        let z1 = Math.min((cz + 1) * this.CHUNK_SIZE, this.level.height);

        const chunk = new Chunk(this.level, x0, y0, z0, x1, y1, z1);
        const key = this.getChunkKey(cx, cy, cz);

        this.chunkMap.set(key, chunk);
        this.loadedChunks.push(chunk);

        if (chunk.meshes[0]) this.scene.add(chunk.meshes[0]);
        if (chunk.meshes[1]) this.scene.add(chunk.meshes[1]);

        chunk.setDirty();

        return chunk;
    }

    destroyChunk(key, chunk) {
        if (chunk.meshes[0]) this.scene.remove(chunk.meshes[0]);
        if (chunk.meshes[1]) this.scene.remove(chunk.meshes[1]);

        if (typeof chunk.destroy === 'function') {
            chunk.destroy();
        }

        this.chunkMap.delete(key);
        const index = this.loadedChunks.indexOf(chunk);
        if (index !== -1) {
            this.loadedChunks.splice(index, 1);
        }
    }

    updateChunks(player) {
        const pCx = Math.floor(player.x / this.CHUNK_SIZE);
        const pCz = Math.floor(player.z / this.CHUNK_SIZE);

        const loadDist = this.renderDistance;
        const unloadDistSqr = Math.pow(loadDist + this.unloadDistanceOffset, 2);

        for (const [key, chunk] of this.chunkMap.entries()) {
            const cx = Math.floor(chunk.x0 / this.CHUNK_SIZE);
            const cz = Math.floor(chunk.z0 / this.CHUNK_SIZE);

            const dx = cx - pCx;
            const dz = cz - pCz;

            if ((dx * dx + dz * dz) > unloadDistSqr) {
                this.destroyChunk(key, chunk);
            }
        }

        const targets = [];
        for (let dx = -loadDist; dx <= loadDist; dx++) {
            for (let dz = -loadDist; dz <= loadDist; dz++) {
                const distSqr = dx * dx + dz * dz;
                if (distSqr <= loadDist * loadDist) {
                    const cx = pCx + dx;
                    const cz = pCz + dz;

                    if (cx >= 0 && cx < this.xChunks && cz >= 0 && cz < this.zChunks) {
                        targets.push({ cx, cz, distSqr });
                    }
                }
            }
        }

        targets.sort((a, b) => a.distSqr - b.distSqr);

        let createdThisFrame = 0;
        const maxCreatesPerFrame = 10;

        for (const target of targets) {
            for (let cy = 0; cy < this.yChunks; cy++) {
                const key = this.getChunkKey(target.cx, cy, target.cz);
                if (!this.chunkMap.has(key)) {
                    this.createChunk(target.cx, cy, target.cz);
                    createdThisFrame++;
                    if (createdThisFrame >= maxCreatesPerFrame) {
                        return;
                    }
                }
            }
        }
    }

    render(player, layer) {
        if (layer == 0) {
            this.renderClouds();
        }
        const newRenderDistance = this.level.engine.config.data.RenderDistance;
        if (newRenderDistance !== this.renderDistance) {
            this.setRenderDistance(newRenderDistance);
        }

        Chunk.rebuiltThisFrame = 0;

        if (layer === 0) {
            this.updateChunks(player);

            this.loadedChunks.sort((chunkA, chunkB) => {
                return chunkA.distanceToSqr(player) - chunkB.distanceToSqr(player);
            });
        }

        const frustum = this.frustum;
        const hasFrustum = !!frustum;

        for (let i = 0; i < this.loadedChunks.length; i++) {
            const chunk = this.loadedChunks[i];

            if (hasFrustum && !frustum.isVisible(chunk.aabb)) {
                chunk.visible = false;
                if (chunk.meshes[layer]) chunk.meshes[layer].visible = false;
                continue;
            }

            chunk.visible = true;
            if (chunk.meshes[layer]) chunk.meshes[layer].visible = true;

            chunk.render(layer);
        }
    }

    setDirty(x0, y0, z0, x1, y1, z1) {
        let cx0 = Math.floor(x0 / this.CHUNK_SIZE);
        let cx1 = Math.floor(x1 / this.CHUNK_SIZE);
        let cy0 = Math.floor(y0 / this.CHUNK_SIZE);
        let cy1 = Math.floor(y1 / this.CHUNK_SIZE);
        let cz0 = Math.floor(z0 / this.CHUNK_SIZE);
        let cz1 = Math.floor(z1 / this.CHUNK_SIZE);

        for (let x = cx0; x <= cx1; x++) {
            for (let y = cy0; y <= cy1; y++) {
                for (let z = cz0; z <= cz1; z++) {
                    const key = this.getChunkKey(x, y, z);
                    const chunk = this.chunkMap.get(key);
                    if (chunk) {
                        chunk.setDirty();
                    }
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
        for (const chunk of this.chunkMap.values()) {
            chunk.setDirty();
        }
    }

    destroy() {
        for (const [key, chunk] of this.chunkMap.entries()) {
            this.destroyChunk(key, chunk);
        }
        this.chunkMap.clear();
        this.loadedChunks = [];
        this.t = null;
        this.camera = null;
    }
}


export class Tesselator {
    static instance = new Tesselator();

    constructor(maxVertices = 5000000) {
        this.positions = new Float32Array(maxVertices * 3);
        this.uvs = new Float32Array(maxVertices * 2);
        this.colors = new Float32Array(maxVertices * 4); // Oprava: Přidána podpora pro alfa kanál (RGBA)

        this.quadBufferPositions = new Float32Array(12);
        this.quadBufferUVs = new Float32Array(8);
        this.quadBufferColors = new Float32Array(16); // Oprava: 4 vertexy * 4 komponenty (RGBA)

        this.quadVertexCount = 0;
        this.vertexCount = 0;

        this.u = 0; this.v = 0;
        this.r = 1; this.g = 1; this.b = 1; this.a = 1;
        this.hasColor = false;
        this.hasTexture = false;
        this.isLines = false;
        this.isColorDisabled = false;
    }

    init(isLines = false) {
        this.vertexCount = 0;
        this.quadVertexCount = 0;
        this.hasColor = false;
        this.hasTexture = false;
        this.isLines = isLines;
        this.isColorDisabled = false;
    }

    // Opravené a deduplikované metody pro barvy
    color(r, g, b, a = 1.0) {
        if (this.isColorDisabled) return;
        this.hasColor = true;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    colorRGBA(c) {
        const r = ((c >> 16) & 0xFF) / 255.0;
        const g = ((c >> 8) & 0xFF) / 255.0;
        const b = (c & 0xFF) / 255.0;
        const a = (((c >> 24) & 0xFF) || 255) / 255.0;
        this.color(r, g, b, a);
    }

    setColorRGBA_F(f, f1, f2, f3 = 1.0) {
        this.setColorRGBA(
            Math.floor(f * 255),
            Math.floor(f1 * 255),
            Math.floor(f2 * 255),
            Math.floor(f3 * 255)
        );
    }

    setColorOpaque_F(f, f1, f2) {
        this.setColorRGBA_F(f, f1, f2, 1.0);
    }

    setColorOpaque(i, j, k) {
        this.setColorRGBA(i, j, k, 255);
    }

    setColorRGBA(i, j, k, l = 255) {
        if (this.isColorDisabled) return;

        i = Math.max(0, Math.min(255, i));
        j = Math.max(0, Math.min(255, j));
        k = Math.max(0, Math.min(255, k));
        l = Math.max(0, Math.min(255, l));

        this.hasColor = true;
        this.r = i / 255.0;
        this.g = j / 255.0;
        this.b = k / 255.0;
        this.a = l / 255.0;
    }

    noColor() {
        this.isColorDisabled = true;
        this.hasColor = false;
    }

    tex(u, v) {
        this.hasTexture = true;
        this.u = u;
        this.v = v;
    }

    vertexUV(x, y, z, u, v) {
        this.tex(u, v);
        this.vertex(x, y, z);
    }

    vertex(x, y, z) {
        if (this.isLines) {
            this.addSingleVertex(x, y, z, this.u, this.v, this.r, this.g, this.b, this.a);
            return;
        }

        const qIdx3 = this.quadVertexCount * 3;
        const qIdx2 = this.quadVertexCount * 2;
        const qIdx4 = this.quadVertexCount * 4;

        this.quadBufferPositions[qIdx3] = x;
        this.quadBufferPositions[qIdx3 + 1] = y;
        this.quadBufferPositions[qIdx3 + 2] = z;

        this.quadBufferUVs[qIdx2] = this.u;
        this.quadBufferUVs[qIdx2 + 1] = this.v;

        this.quadBufferColors[qIdx4] = this.r;
        this.quadBufferColors[qIdx4 + 1] = this.g;
        this.quadBufferColors[qIdx4 + 2] = this.b;
        this.quadBufferColors[qIdx4 + 3] = this.a; // Uložení alfa kanálu

        this.quadVertexCount++;

        if (this.quadVertexCount === 4) {
            const indices = [0, 1, 2, 0, 2, 3];
            for (let i = 0; i < 6; i++) {
                const idx = indices[i];
                this.addSingleVertex(
                    this.quadBufferPositions[idx * 3],
                    this.quadBufferPositions[idx * 3 + 1],
                    this.quadBufferPositions[idx * 3 + 2],
                    this.quadBufferUVs[idx * 2],
                    this.quadBufferUVs[idx * 2 + 1],
                    this.quadBufferColors[idx * 4],
                    this.quadBufferColors[idx * 4 + 1],
                    this.quadBufferColors[idx * 4 + 2],
                    this.quadBufferColors[idx * 4 + 3]
                );
            }
            this.quadVertexCount = 0;
        }
    }

    addSingleVertex(x, y, z, u, v, r, g, b, a) {
        const vIdx3 = this.vertexCount * 3;
        const vIdx2 = this.vertexCount * 2;
        const vIdx4 = this.vertexCount * 4;

        this.positions[vIdx3] = x;
        this.positions[vIdx3 + 1] = y;
        this.positions[vIdx3 + 2] = z;

        if (this.hasTexture) {
            this.uvs[vIdx2] = u;
            this.uvs[vIdx2 + 1] = v;
        }

        if (this.hasColor) {
            this.colors[vIdx4] = r;
            this.colors[vIdx4 + 1] = g;
            this.colors[vIdx4 + 2] = b;
            this.colors[vIdx4 + 3] = a;
        }

        this.vertexCount++;
    }

    flush() {
        if (this.vertexCount === 0) return null;

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, this.vertexCount * 3), 3));

        if (this.hasTexture && !this.isLines) {
            geometry.setAttribute('uv', new THREE.BufferAttribute(this.uvs.slice(0, this.vertexCount * 2), 2));
        }

        if (this.hasColor) {
            geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, this.vertexCount * 4), 4));
        }

        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        return geometry;
    }
}

