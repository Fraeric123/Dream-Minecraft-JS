// --- START OF FILE LevelRender.js ---
import * as THREE from 'three';
import { CHUNK_HEIGHT, CHUNK_SIZE, BLOCKS, NUM_SUBCHUNKS, SUBCHUNK_HEIGHT } from "./Game.js";
import { getBlockFaceTile, getTileUVs } from "./Util.js";

export class Tesselator {
    static instance = new Tesselator();

    constructor(maxVertices = 5000000) {
        this.positions = new Float32Array(maxVertices * 3);
        this.uvs = new Float32Array(maxVertices * 2);
        this.colors = new Float32Array(maxVertices * 4);

        this.quadBufferPositions = new Float32Array(12);
        this.quadBufferUVs = new Float32Array(8);
        this.quadBufferColors = new Float32Array(16);

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

    setColorRGBA_F(f, f1, f2, f3 = 1.0) {
        if (this.isColorDisabled) return;
        this.hasColor = true;
        this.r = f; this.g = f1; this.b = f2; this.a = f3;
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
        this.quadBufferColors[qIdx4 + 3] = this.a;

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

export class SubChunk {
    constructor(chunkData, sy, level, scene, sharedMaterial) {
        this.chunkData = chunkData;
        this.sy = sy;
        this.level = level;
        this.scene = scene;
        this.material = sharedMaterial;

        this.mesh = new THREE.Mesh(
            new THREE.BufferGeometry(),
            this.material
        );

        this.mesh.position.set(
            chunkData.cx * CHUNK_SIZE,
            sy * SUBCHUNK_HEIGHT,
            chunkData.cz * CHUNK_SIZE
        );
        this.scene.add(this.mesh);

        this.rebuild();
    }

    rebuild() {
        const positions = [];
        const uvs = [];
        const uvTiles = [];
        const normals = [];

        const startY = this.sy * SUBCHUNK_HEIGHT;
        const worldOffsetX = this.chunkData.cx * CHUNK_SIZE;
        const worldOffsetZ = this.chunkData.cz * CHUNK_SIZE;

        const getBlock = (lx, ly, lz) => {
            if (lx >= 0 && lx < CHUNK_SIZE && ly >= 0 && ly < SUBCHUNK_HEIGHT && lz >= 0 && lz < CHUNK_SIZE) {
                return this.chunkData.getTile(lx, startY + ly, lz);
            }
            return this.level.getTile(worldOffsetX + lx, startY + ly, worldOffsetZ + lz);
        };

        const faces = [
            // Top (+Y)
            {
                dir: [0, 1, 0], norm: [0, 1, 0], mainAxis: 1,
                uSize: CHUNK_SIZE, vSize: CHUNK_SIZE, mSize: SUBCHUNK_HEIGHT,
                getVerts: (x, y, z, w, h) => [[x, y + 1, z + h], [x + w, y + 1, z + h], [x + w, y + 1, z], [x, y + 1, z]]
            },
            // Bottom (-Y)
            {
                dir: [0, -1, 0], norm: [0, -1, 0], mainAxis: 1,
                uSize: CHUNK_SIZE, vSize: CHUNK_SIZE, mSize: SUBCHUNK_HEIGHT,
                getVerts: (x, y, z, w, h) => [[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]]
            },
            // North (-Z)
            {
                dir: [0, 0, -1], norm: [0, 0, -1], mainAxis: 2,
                uSize: CHUNK_SIZE, vSize: SUBCHUNK_HEIGHT, mSize: CHUNK_SIZE,
                getVerts: (x, y, z, w, h) => [[x, y + h, z], [x + w, y + h, z], [x + w, y, z], [x, y, z]]
            },
            // South (+Z)
            {
                dir: [0, 0, 1], norm: [0, 0, 1], mainAxis: 2,
                uSize: CHUNK_SIZE, vSize: SUBCHUNK_HEIGHT, mSize: CHUNK_SIZE,
                getVerts: (x, y, z, w, h) => [[x + w, y + h, z + 1], [x, y + h, z + 1], [x, y, z + 1], [x + w, y, z + 1]]
            },
            // West (-X)
            {
                dir: [-1, 0, 0], norm: [-1, 0, 0], mainAxis: 0,
                uSize: CHUNK_SIZE, vSize: SUBCHUNK_HEIGHT, mSize: CHUNK_SIZE,
                getVerts: (x, y, z, w, h) => [[x, y + h, z + w], [x, y + h, z], [x, y, z], [x, y, z + w]]
            },
            // East (+X)
            {
                dir: [1, 0, 0], norm: [1, 0, 0], mainAxis: 0,
                uSize: CHUNK_SIZE, vSize: SUBCHUNK_HEIGHT, mSize: CHUNK_SIZE,
                getVerts: (x, y, z, w, h) => [[x + 1, y + h, z], [x + 1, y + h, z + w], [x + 1, y, z + w], [x + 1, y, z]]
            }
        ];

        for (let fIdx = 0; fIdx < faces.length; fIdx++) {
            const face = faces[fIdx];
            const { dir, norm, uSize, vSize, mSize } = face;
            const mask = new Int32Array(uSize * vSize);

            for (let d = 0; d < mSize; d++) {
                let maskIdx = 0;
                for (let v = 0; v < vSize; v++) {
                    for (let u = 0; u < uSize; u++) {
                        let x = 0, y = 0, z = 0;
                        if (face.mainAxis === 0) { x = d; y = v; z = u; }
                        else if (face.mainAxis === 1) { x = u; y = d; z = v; }
                        else { x = u; y = v; z = d; }

                        const tile = getBlock(x, y, z);
                        if (tile !== BLOCKS.AIR) {
                            const neighbor = getBlock(x + dir[0], y + dir[1], z + dir[2]);
                            if (neighbor === BLOCKS.AIR || (tile !== BLOCKS.LEAVES && neighbor === BLOCKS.LEAVES)) {
                                mask[maskIdx] = tile;
                            } else {
                                mask[maskIdx] = 0;
                            }
                        } else {
                            mask[maskIdx] = 0;
                        }
                        maskIdx++;
                    }
                }

                for (let v = 0; v < vSize; v++) {
                    for (let u = 0; u < uSize; ) {
                        const tile = mask[v * uSize + u];
                        if (tile !== 0) {
                            let w = 1;
                            while (u + w < uSize && mask[v * uSize + (u + w)] === tile) {
                                w++;
                            }

                            let h = 1;
                            let canExtend = true;
                            while (v + h < vSize) {
                                for (let k = 0; k < w; k++) {
                                    if (mask[(v + h) * uSize + (u + k)] !== tile) {
                                        canExtend = false;
                                        break;
                                    }
                                }
                                if (!canExtend) break;
                                h++;
                            }

                            let x = 0, y = 0, z = 0;
                            if (face.mainAxis === 0) { x = d; y = v; z = u; }
                            else if (face.mainAxis === 1) { x = u; y = d; z = v; }
                            else { x = u; y = v; z = d; }

                            const verts = face.getVerts(x, y, z, w, h);
                            const tilePos = getBlockFaceTile(tile, fIdx);
                            const { u0, u1, v0, v1 } = getTileUVs(tilePos.col, tilePos.row);

                            const localUVs = [
                                [0, h],
                                [w, h],
                                [w, 0],
                                [0, 0]
                            ];

                            const uWidth = u1 - u0;
                            const vHeight = v1 - v0;

                            const indices = [0, 1, 2, 0, 2, 3];
                            for (const idx of indices) {
                                const vt = verts[idx];
                                positions.push(vt[0], vt[1], vt[2]);
                                uvs.push(localUVs[idx][0], localUVs[idx][1]);
                                uvTiles.push(u0, v0, uWidth, vHeight);
                                normals.push(...norm);
                            }

                            for (let dh = 0; dh < h; dh++) {
                                for (let dw = 0; dw < w; dw++) {
                                    mask[(v + dh) * uSize + (u + dw)] = 0;
                                }
                            }

                            u += w;
                            continue;
                        }
                        u++;
                    }
                }
            }
        }

        const oldGeo = this.mesh.geometry;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setAttribute('uvTile', new THREE.Float32BufferAttribute(uvTiles, 4));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.mesh.geometry = geo;
        if (oldGeo) oldGeo.dispose();

        this.chunkData.subChunksDirty[this.sy] = false;
    }

    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
    }
}

export class Chunk {
    constructor(chunkData, level, scene, sharedMaterial) {
        this.chunkData = chunkData;
        this.level = level;
        this.scene = scene;
        this.sharedMaterial = sharedMaterial;
        this.subChunks = [];

        for (let sy = 0; sy < NUM_SUBCHUNKS; sy++) {
            this.subChunks.push(new SubChunk(chunkData, sy, level, scene, sharedMaterial));
        }
    }

    rebuildDirty() {
        for (let sy = 0; sy < NUM_SUBCHUNKS; sy++) {
            if (this.chunkData.subChunksDirty[sy]) {
                this.subChunks[sy].rebuild();
            }
        }
    }

    destroy() {
        for (let sc of this.subChunks) {
            sc.destroy();
        }
    }
}

export class LevelRenderer {
    constructor(level, scene, renderDistance = 8, sharedMaterial) {
        this.level = level;
        this.engine = level.engine;
        this.scene = scene;
        this.renderDistance = renderDistance;
        this.sharedMaterial = sharedMaterial;
        this.renderedChunks = new Map();
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
        const cloudY = 128;
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
                t.vertexUV(xa, y0, za, uCenter, vCenter);
                t.vertexUV(xb, y0, za, uCenter, vCenter);
                t.vertexUV(xb, y0, zb, uCenter, vCenter);
                t.vertexUV(xa, y0, zb, uCenter, vCenter);

                t.setColorRGBA_F(1.0, 1.0, 1.0, 0.8);
                t.vertexUV(xa, y1, zb, uCenter, vCenter);
                t.vertexUV(xb, y1, zb, uCenter, vCenter);
                t.vertexUV(xb, y1, za, uCenter, vCenter);
                t.vertexUV(xa, y1, za, uCenter, vCenter);

                if (!isOpaque(xi - 1, zi)) {
                    t.setColorRGBA_F(0.9, 0.9, 0.9, 0.8);
                    t.vertexUV(xa, y0, zb, uCenter, vCenter);
                    t.vertexUV(xa, y1, zb, uCenter, vCenter);
                    t.vertexUV(xa, y1, za, uCenter, vCenter);
                    t.vertexUV(xa, y0, za, uCenter, vCenter);
                }

                if (!isOpaque(xi + 1, zi)) {
                    t.setColorRGBA_F(0.9, 0.9, 0.9, 0.8);
                    t.vertexUV(xb, y0, za, uCenter, vCenter);
                    t.vertexUV(xb, y1, za, uCenter, vCenter);
                    t.vertexUV(xb, y1, zb, uCenter, vCenter);
                    t.vertexUV(xb, y0, zb, uCenter, vCenter);
                }

                if (!isOpaque(xi, zi - 1)) {
                    t.setColorRGBA_F(0.8, 0.8, 0.8, 0.8);
                    t.vertexUV(xa, y1, za, uCenter, vCenter);
                    t.vertexUV(xb, y1, za, uCenter, vCenter);
                    t.vertexUV(xb, y0, za, uCenter, vCenter);
                    t.vertexUV(xa, y0, za, uCenter, vCenter);
                }

                if (!isOpaque(xi, zi + 1)) {
                    t.setColorRGBA_F(0.8, 0.8, 0.8, 0.8);
                    t.vertexUV(xb, y1, zb, uCenter, vCenter);
                    t.vertexUV(xa, y1, zb, uCenter, vCenter);
                    t.vertexUV(xa, y0, zb, uCenter, vCenter);
                    t.vertexUV(xb, y0, zb, uCenter, vCenter);
                }
            }
        }

        const geometry = t.flush();
        if (!geometry) return;

        const colorMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true
        });
        this.cloudColorMaterial = colorMaterial;

        this.cloudsMesh = new THREE.Group();
        for (let ox = -2; ox <= 2; ox++) {
            for (let oz = -2; oz <= 2; oz++) {
                const tile = new THREE.Mesh(geometry, colorMaterial);
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

    renderClouds(playerX = 0, playerZ = 0) {
        if (!this.cloudsMesh) {
            this.compileClouds();
        }
        if (!this.cloudsMesh || !this.cloudWidth) return;

        const tickTime = performance.now() / 1000;
        const speed = 1.0;
        const scrollX = tickTime * speed;

        const camX = playerX;
        const camZ = playerZ;

        const baseX = Math.floor((camX - scrollX) / this.cloudWidth) * this.cloudWidth + scrollX;
        const baseZ = Math.floor(camZ / this.cloudHeight) * this.cloudHeight;

        this.cloudsMesh.position.x = baseX;
        this.cloudsMesh.position.z = baseZ;
        this.cloudsMesh.visible = true;
    }

    calculateCelestialAngle(ticks, partialTicks = 0) {
        const i = Math.floor(ticks) % 24000;
        let f1 = (i + partialTicks) / 24000.0 - 0.25;
        if (f1 < 0.0) f1 += 1.0;
        if (f1 > 1.0) f1 -= 1.0;

        const f2 = f1;
        f1 = 1.0 - (Math.cos(f1 * Math.PI) + 1.0) / 2.0;
        f1 = f2 + (f1 - f2) / 3.0;
        return f1;
    }

    calcSunriseSunsetColors(celestialAngle) {
        const f2 = 0.4;
        const f3 = Math.cos(celestialAngle * Math.PI * 2.0);

        if (f3 >= -f2 && f3 <= f2) {
            const f5 = (f3 / f2) * 0.5 + 0.5;
            let f6 = 1.0 - (1.0 - Math.sin(f5 * Math.PI)) * 0.99;
            f6 *= f6;

            const r = f5 * 0.3 + 0.7;
            const g = f5 * f5 * 0.7 + 0.2;
            const b = f5 * f5 * 0.0 + 0.2;

            return [r, g, b, f6];
        }
        return null;
    }

    getSkyColor(celestialAngle) {
        let brightness = Math.cos(celestialAngle * Math.PI * 2.0) * 2.0 + 0.5;
        brightness = Math.min(Math.max(brightness, 0.0), 1.0);

        let r = 0.47, g = 0.65, b = 1.0;
        r *= brightness * 0.94 + 0.06;
        g *= brightness * 0.94 + 0.06;
        b *= brightness * 0.91 + 0.09;

        if (brightness < 0.2) {
            const nightFactor = 1.0 - (brightness / 0.2);
            r *= (1.0 - nightFactor * 0.8);
            g *= (1.0 - nightFactor * 0.8);
        }

        return new THREE.Color(r, g, b);
    }

    getFogColor(celestialAngle) {
        let brightness = Math.cos(celestialAngle * Math.PI * 2.0) * 2.0 + 0.5;
        brightness = Math.min(Math.max(brightness, 0.0), 1.0);

        let r = 0.752941;
        let g = 0.847058;
        let b = 1.000000;

        r *= brightness * 0.94 + 0.06;
        g *= brightness * 0.94 + 0.06;
        b *= brightness * 0.91 + 0.09;

        const sunset = this.calcSunriseSunsetColors(celestialAngle);
        if (sunset) {
            const blend = sunset[3];
            r = r * (1.0 - blend) + sunset[0] * blend;
            g = g * (1.0 - blend) + sunset[1] * blend;
            b = b * (1.0 - blend) + sunset[2] * blend;
        }

        return new THREE.Color(r, g, b);
    }

    init() {
        this.compileClouds();
    }

    update(playerX, playerZ, playerY) {
        this.renderClouds(playerX, playerZ);

        const centerCx = Math.floor(playerX / CHUNK_SIZE);
        const centerCz = Math.floor(playerZ / CHUNK_SIZE);

        const activeKeys = new Set();
        const genCandidates = [];
        const meshCandidates = [];

        const renderDistance = this.renderDistance + 2;

        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                const cx = centerCx + x;
                const cz = centerCz + z;
                const key = `${cx},${cz}`;
                activeKeys.add(key);

                const chunkData = this.level.chunksData.get(key);
                const chunk = this.renderedChunks.get(key);
                const distSq = x * x + z * z;

                if (!chunkData || !chunkData.generated) {
                    genCandidates.push({ cx, cz, distSq });
                } else if (!chunk || chunkData.subChunksDirty.some(d => d)) {
                    meshCandidates.push({ cx, cz, key, chunkData, chunk, distSq });
                }
            }
        }

        // 1. Odstranění chunků mimo dohledovou vzdálenost
        for (const [key, chunk] of this.renderedChunks.entries()) {
            if (!activeKeys.has(key)) {
                chunk.destroy();
                this.renderedChunks.delete(key);
            } else {
                for (let sy = 0; sy < NUM_SUBCHUNKS; sy++) {
                    const subChunk = chunk.subChunks[sy];
                    const subChunkCenterY = (sy + 0.5) * SUBCHUNK_HEIGHT;
                    const vertDist = Math.abs(playerY - subChunkCenterY);
                    const maxVertDist = (this.renderDistance + 2) * CHUNK_SIZE;
                    subChunk.mesh.visible = vertDist <= maxVertDist;
                }
            }
        }

        // 2. Odeslání požadavků na generování bloků od nejbližších k nejvzdálenějším
        genCandidates.sort((a, b) => a.distSq - b.distSq);
        for (const item of genCandidates) {
            this.level.requestChunk(item.cx, item.cz, playerX, playerZ);
        }

        // 3. Sestavení 3D geometrie chunků směrem od hráče (plynule max 3 chunky za snímek)
        meshCandidates.sort((a, b) => a.distSq - b.distSq);
        let builtCount = 0;
        const maxMeshesPerFrame = 3;

        for (const item of meshCandidates) {
            if (builtCount >= maxMeshesPerFrame) break;

            let chunk = item.chunk;
            if (!chunk) {
                chunk = new Chunk(item.chunkData, this.level, this.scene, this.sharedMaterial);
                this.renderedChunks.set(item.key, chunk);
            } else {
                chunk.rebuildDirty();
            }
            builtCount++;
        }
    }
}