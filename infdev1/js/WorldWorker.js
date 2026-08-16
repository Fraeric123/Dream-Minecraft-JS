



class JavaRandom {
    static p2_16 = 0x10000;
    static p2_24 = 0x1000000;
    static p2_27 = 0x8000000;
    static p2_31 = 0x80000000;
    static p2_32 = 0x100000000;
    static p2_48 = 0x1000000000000;
    static p2_53 = Math.pow(2, 53);
    static m2_16 = 0xffff;
    static c2 = 0x0005;
    static c1 = 0xdeec;
    static c0 = 0xe66d;

    constructor(seedval) {
        this.s2 = 0; this.s1 = 0; this.s0 = 0;
        this.nextNextGaussian = 0;
        this.haveNextNextGaussian = false;

        if (seedval === undefined) {
            seedval = Math.floor(Math.random() * JavaRandom.p2_48);
        }
        this.setSeed(seedval);
    }

    _next() {
        let carry = 0xb;
        let r0 = (this.s0 * JavaRandom.c0) + carry;
        carry = r0 >>> 16;
        r0 &= JavaRandom.m2_16;
        let r1 = (this.s1 * JavaRandom.c0 + this.s0 * JavaRandom.c1) + carry;
        carry = r1 >>> 16;
        r1 &= JavaRandom.m2_16;
        let r2 = (this.s2 * JavaRandom.c0 + this.s1 * JavaRandom.c1 + this.s0 * JavaRandom.c2) + carry;
        r2 &= JavaRandom.m2_16;

        this.s2 = r2; this.s1 = r1; this.s0 = r0;
        return (r2 << 16) | r1;
    }

    next(bits) { return this._next() >>> (32 - bits); }
    next_signed(bits) { return this._next() >> (32 - bits); }

    setSeed(n) {
        let bSeed = (BigInt(n) ^ 0x5DEECE66Dn) & ((1n << 48n) - 1n);

        this.s0 = Number(bSeed & 0xFFFFn);
        this.s1 = Number((bSeed >> 16n) & 0xFFFFn);
        this.s2 = Number((bSeed >> 32n) & 0xFFFFn);

        this.haveNextNextGaussian = false;
    }

    nextInt(bound) {
        if (bound === undefined) return this.next_signed(32);
        if (bound <= 0) throw new RangeError("bound must be positive");

        if ((bound & -bound) === bound) {
            return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
        }

        let bits, val;
        do {
            bits = this.next(31);
            val = bits % bound;
        } while (bits - val + (bound - 1) < 0);
        return val;
    }

    nextBoolean() { return this.next(1) !== 0; }
    nextFloat() { return this.next(24) / JavaRandom.p2_24; }
    nextDouble() { return (JavaRandom.p2_27 * this.next(26) + this.next(27)) / JavaRandom.p2_53; }
}

class ImprovedNoise {
    constructor(rand) {
        this.p = new Int32Array(512);
        const permutation = new Int32Array(256);
        for (let i = 0; i < 256; i++) permutation[i] = i;
        for (let i = 0; i < 256; i++) {
            const j = rand.nextInt(256 - i) + i;
            const tmp = permutation[i];
            permutation[i] = permutation[j];
            permutation[j] = tmp;
            this.p[i] = permutation[i];
            this.p[i + 256] = permutation[i];
        }
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    eval(x, y, z = 0) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
                this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
            ),
            this.lerp(v,
                this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
            )
        );
    }
}

class OctaveNoise {
    constructor(octaves, seed) {
        this.octaves = octaves;
        this.generators = [];
        const rand = new JavaRandom(seed);
        for (let i = 0; i < octaves; i++) {
            this.generators.push(new ImprovedNoise(rand));
        }
    }

    eval(x, z, scale = 1.0, persistence = 0.5) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1.0;
        let maxVal = 0;

        for (let i = 0; i < this.octaves; i++) {
            total += this.generators[i].eval(x * frequency, z * frequency) * amplitude;
            maxVal += amplitude;
            amplitude *= persistence;
            frequency *= 2.0;
        }

        return total / maxVal;
    }
}

const BLOCKS = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, LOG: 4, LEAVES: 5 };
const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 128;

class WorkerChunkData {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    }

    getIndex(x, y, z) {
        return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT;
    }

    getTile(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return BLOCKS.AIR;
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    setTile(x, y, z, type) {
        if (x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_HEIGHT && z >= 0 && z < CHUNK_SIZE) {
            this.blocks[this.getIndex(x, y, z)] = type;
        }
    }
}

class TerrainLayer {
    constructor(level) {
        this.level = level;
        this.mainNoise = new OctaveNoise(4, level.seed);
        this.selectorNoise = new OctaveNoise(2, level.seed + 100);
        this.rockNoise = new OctaveNoise(3, level.seed + 200);
    }

    getHeight(worldX, worldZ) {
        const base = this.mainNoise.eval(worldX, worldZ, 0.008, 0.5);
        const selector = this.selectorNoise.eval(worldX, worldZ, 0.003, 0.5);

        let heightFactor = base;
        if (selector > 0.1) {
            heightFactor += (selector - 0.1) * 1.5;
        }

        const minHeight = 64;
        const maxHeight = 100;
        const normalized = (heightFactor + 1) / 2;

        return Math.floor(minHeight + Math.max(0, Math.min(1, normalized)) * (maxHeight - minHeight));
    }

    getRockHeight(worldX, worldZ, surfaceHeight) {
        const noiseVal = this.rockNoise.eval(worldX, worldZ, 0.02, 0.5);
        const dirtDepth = 2 + Math.floor((noiseVal + 1) * 1.5);
        return surfaceHeight - dirtDepth;
    }

    generate(cx, cz, chunkData) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldZ = cz * CHUNK_SIZE + z;

                const height = this.getHeight(worldX, worldZ);
                const rockHeight = this.getRockHeight(worldX, worldZ, height);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    if (y <= rockHeight) {
                        chunkData.setTile(x, y, z, BLOCKS.STONE);
                    } else if (y < height) {
                        chunkData.setTile(x, y, z, BLOCKS.DIRT);
                    } else if (y === height) {
                        if (height > 42 && rockHeight >= height - 1) {
                            chunkData.setTile(x, y, z, BLOCKS.STONE);
                        } else {
                            chunkData.setTile(x, y, z, BLOCKS.GRASS);
                        }
                    }
                }
            }
        }
    }
}

class CaveLayer {
    constructor(level) {
        this.level = level;
        this.range = 4;
    }

    generate(cx, cz, chunkData) {
        const rand = new JavaRandom(this.level.seed);
        const r1 = rand.nextInt();
        const r2 = rand.nextInt();

        for (let targetCX = cx - this.range; targetCX <= cx + this.range; targetCX++) {
            for (let targetCZ = cz - this.range; targetCZ <= cz + this.range; targetCZ++) {
                const chunkSeed = (targetCX * r1) ^ (targetCZ * r2) ^ this.level.seed;
                rand.setSeed(chunkSeed);
                this.generateChunkCaves(targetCX, targetCZ, cx, cz, chunkData, rand);
            }
        }
    }

    generateChunkCaves(originCX, originCZ, currentCX, currentCZ, chunkData, rand) {
        let caveCount = rand.nextInt(rand.nextInt(rand.nextInt(40) + 1) + 1);
        if (rand.nextInt(15) !== 0) caveCount = 0;

        for (let i = 0; i < caveCount; i++) {
            const startX = originCX * CHUNK_SIZE + rand.nextInt(CHUNK_SIZE);
            const startY = rand.nextInt(rand.nextInt(120) + 8);
            const startZ = originCZ * CHUNK_SIZE + rand.nextInt(CHUNK_SIZE);

            let branches = 1;
            if (rand.nextInt(4) === 0) {
                this.carveLargeRoom(rand.nextInt(), currentCX, currentCZ, chunkData, startX, startY, startZ);
                branches += rand.nextInt(4);
            }

            for (let j = 0; j < branches; j++) {
                const yaw = rand.nextFloat() * Math.PI * 2.0;
                const pitch = ((rand.nextFloat() - 0.5) * 2.0) / 8.0;
                let scale = rand.nextFloat() * 2.0 + rand.nextFloat();
                if (rand.nextInt(10) === 0) scale *= rand.nextFloat() * rand.nextFloat() * 3.0 + 1.0;
                this.carveTunnel(rand.nextInt(), currentCX, currentCZ, chunkData, startX, startY, startZ, scale, yaw, pitch, 0, 0, 1.0);
            }
        }
    }

    carveLargeRoom(seed, currentCX, currentCZ, chunkData, x, y, z) {
        this.carveTunnel(seed, currentCX, currentCZ, chunkData, x, y, z, 1.0 + Math.random() * 6.0, 0.0, 0.0, -1, -1, 0.5);
    }

    carveTunnel(seed, currentCX, currentCZ, chunkData, x, y, z, scale, yaw, pitch, curStep, totalSteps, verticalScale) {
        const rand = new JavaRandom(seed);
        const midChunkX = currentCX * CHUNK_SIZE + 8;
        const midChunkZ = currentCZ * CHUNK_SIZE + 8;
        let yawOffset = 0.0, pitchOffset = 0.0;

        if (totalSteps <= 0) {
            const maxDist = this.range * CHUNK_SIZE - 16;
            totalSteps = maxDist - rand.nextInt(Math.floor(maxDist / 4));
        }

        let isLargeNode = false;
        if (curStep === -1) {
            curStep = Math.floor(totalSteps / 2);
            isLargeNode = true;
        }

        const branchStep = rand.nextInt(Math.floor(totalSteps / 2)) + Math.floor(totalSteps / 4);
        const steeperAngles = rand.nextInt(6) === 0;

        for (; curStep < totalSteps; curStep++) {
            const horizRadius = 1.5 + Math.sin((curStep * Math.PI) / totalSteps) * scale;
            const vertRadius = horizRadius * verticalScale;

            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);
            x += Math.cos(yaw) * cosPitch;
            y += sinPitch;
            z += Math.sin(yaw) * cosPitch;

            pitch = steeperAngles ? pitch * 0.92 : pitch * 0.7;
            pitch += pitchOffset * 0.1;
            yaw += yawOffset * 0.1;
            pitchOffset *= 0.9;
            yawOffset *= 0.75;
            pitchOffset += (rand.nextFloat() - rand.nextFloat()) * rand.nextFloat() * 2.0;
            yawOffset += (rand.nextFloat() - rand.nextFloat()) * rand.nextFloat() * 4.0;

            if (!isLargeNode && curStep === branchStep && scale > 1.0 && totalSteps > 0) {
                this.carveTunnel(rand.nextInt(), currentCX, currentCZ, chunkData, x, y, z, rand.nextFloat() * 0.5 + 0.5, yaw - Math.PI / 2, pitch / 3.0, curStep, totalSteps, 1.0);
                this.carveTunnel(rand.nextInt(), currentCX, currentCZ, chunkData, x, y, z, rand.nextFloat() * 0.5 + 0.5, yaw + Math.PI / 2, pitch / 3.0, curStep, totalSteps, 1.0);
                return;
            }

            if (isLargeNode || rand.nextInt(4) !== 0) {
                const distX = x - midChunkX, distZ = z - midChunkZ;
                const remaining = totalSteps - curStep;
                const maxReach = scale + 2.0 + 16.0;

                if (distX * distX + distZ * distZ - remaining * remaining > maxReach * maxReach) return;

                if (x >= midChunkX - 16.0 - horizRadius * 2.0 && z >= midChunkZ - 16.0 - horizRadius * 2.0 &&
                    x <= midChunkX + 16.0 + horizRadius * 2.0 && z <= midChunkZ + 16.0 + horizRadius * 2.0) {
                    
                    const minWorldX = currentCX * CHUNK_SIZE;
                    const minWorldZ = currentCZ * CHUNK_SIZE;

                    let xStart = Math.max(0, Math.floor(x - horizRadius) - minWorldX - 1);
                    let xEnd = Math.min(CHUNK_SIZE, Math.floor(x + horizRadius) - minWorldX + 1);
                    let yStart = Math.max(1, Math.floor(y - vertRadius) - 1);
                    let yEnd = Math.min(CHUNK_HEIGHT - 8, Math.floor(y + vertRadius) + 1);
                    let zStart = Math.max(0, Math.floor(z - horizRadius) - minWorldZ - 1);
                    let zEnd = Math.min(CHUNK_SIZE, Math.floor(z + horizRadius) - minWorldZ + 1);

                    for (let lx = xStart; lx < xEnd; lx++) {
                        const normX = (lx + minWorldX + 0.5 - x) / horizRadius;
                        for (let lz = zStart; lz < zEnd; lz++) {
                            const normZ = (lz + minWorldZ + 0.5 - z) / horizRadius;
                            if (normX * normX + normZ * normZ < 1.0) {
                                for (let ly = yEnd - 1; ly >= yStart; ly--) {
                                    const normY = (ly + 0.5 - y) / vertRadius;
                                    if (normY > -0.7 && normX * normX + normY * normY + normZ * normZ < 1.0) {
                                        const tile = chunkData.getTile(lx, ly, lz);
                                        if (tile === BLOCKS.STONE || tile === BLOCKS.DIRT || tile === BLOCKS.GRASS) {
                                            chunkData.setTile(lx, ly, lz, BLOCKS.AIR);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (isLargeNode) break;
                }
            }
        }
    }
}

class RavineLayer {
    constructor(level) {
        this.level = level;
        this.range = 4;
        this.roughness = new Float32Array(256);
    }

    generate(cx, cz, chunkData) {
        const rand = new JavaRandom(this.level.seed);
        const r1 = rand.nextInt();
        const r2 = rand.nextInt();

        for (let targetCX = cx - this.range; targetCX <= cx + this.range; targetCX++) {
            for (let targetCZ = cz - this.range; targetCZ <= cz + this.range; targetCZ++) {
                const chunkSeed = (targetCX * r1) ^ (targetCZ * r2) ^ this.level.seed;
                rand.setSeed(chunkSeed);
                this.generateChunkRavines(targetCX, targetCZ, cx, cz, chunkData, rand);
            }
        }
    }

    generateChunkRavines(originCX, originCZ, currentCX, currentCZ, chunkData, rand) {
        if (rand.nextInt(50) === 0) {
            const startX = originCX * CHUNK_SIZE + rand.nextInt(CHUNK_SIZE);
            const startY = rand.nextInt(rand.nextInt(40) + 8) + 20;
            const startZ = originCZ * CHUNK_SIZE + rand.nextInt(CHUNK_SIZE);
            const yaw = rand.nextFloat() * Math.PI * 2.0;
            const pitch = ((rand.nextFloat() - 0.5) * 2.0) / 8.0;
            const scale = (rand.nextFloat() * 2.0 + rand.nextFloat()) * 2.0;
            this.carveRavine(rand.nextInt(), currentCX, currentCZ, chunkData, startX, startY, startZ, scale, yaw, pitch, 0, 0, 3.0);
        }
    }

    carveRavine(seed, currentCX, currentCZ, chunkData, x, y, z, scale, yaw, pitch, curStep, totalSteps, verticalScale) {
        const rand = new JavaRandom(seed);
        const midChunkX = currentCX * CHUNK_SIZE + 8;
        const midChunkZ = currentCZ * CHUNK_SIZE + 8;
        let yawOffset = 0.0, pitchOffset = 0.0;

        if (totalSteps <= 0) {
            const maxDist = this.range * CHUNK_SIZE - 16;
            totalSteps = maxDist - rand.nextInt(Math.floor(maxDist / 4));
        }

        let isStart = false;
        if (curStep === -1) {
            curStep = Math.floor(totalSteps / 2);
            isStart = true;
        }

        let f = 1.0;
        for (let i = 0; i < 256; i++) {
            if (i === 0 || rand.nextInt(3) === 0) f = 1.0 + rand.nextFloat() * rand.nextFloat();
            this.roughness[i] = f * f;
        }

        for (; curStep < totalSteps; curStep++) {
            let horizRadius = 1.5 + Math.sin((curStep * Math.PI) / totalSteps) * scale;
            let vertRadius = horizRadius * verticalScale;
            horizRadius *= rand.nextFloat() * 0.25 + 0.75;
            vertRadius *= rand.nextFloat() * 0.25 + 0.75;

            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);
            x += Math.cos(yaw) * cosPitch;
            y += sinPitch;
            z += Math.sin(yaw) * cosPitch;

            pitch *= 0.7;
            pitch += pitchOffset * 0.05;
            yaw += yawOffset * 0.05;
            pitchOffset *= 0.8;
            yawOffset *= 0.5;
            pitchOffset += (rand.nextFloat() - rand.nextFloat()) * rand.nextFloat() * 2.0;
            yawOffset += (rand.nextFloat() - rand.nextFloat()) * rand.nextFloat() * 4.0;

            if (isStart || rand.nextInt(4) !== 0) {
                const distX = x - midChunkX, distZ = z - midChunkZ;
                const remaining = totalSteps - curStep;
                const maxReach = scale + 2.0 + 16.0;

                if (distX * distX + distZ * distZ - remaining * remaining > maxReach * maxReach) return;

                if (x >= midChunkX - 16.0 - horizRadius * 2.0 && z >= midChunkZ - 16.0 - horizRadius * 2.0 &&
                    x <= midChunkX + 16.0 + horizRadius * 2.0 && z <= midChunkZ + 16.0 + horizRadius * 2.0) {
                    
                    const minWorldX = currentCX * CHUNK_SIZE;
                    const minWorldZ = currentCZ * CHUNK_SIZE;

                    let xStart = Math.max(0, Math.floor(x - horizRadius) - minWorldX - 1);
                    let xEnd = Math.min(CHUNK_SIZE, Math.floor(x + horizRadius) - minWorldX + 1);
                    let yStart = Math.max(1, Math.floor(y - vertRadius) - 1);
                    let yEnd = Math.min(CHUNK_HEIGHT - 8, Math.floor(y + vertRadius) + 1);
                    let zStart = Math.max(0, Math.floor(z - horizRadius) - minWorldZ - 1);
                    let zEnd = Math.min(CHUNK_SIZE, Math.floor(z + horizRadius) - minWorldZ + 1);

                    for (let lx = xStart; lx < xEnd; lx++) {
                        const normX = (lx + minWorldX + 0.5 - x) / horizRadius;
                        for (let lz = zStart; lz < zEnd; lz++) {
                            const normZ = (lz + minWorldZ + 0.5 - z) / horizRadius;
                            if (normX * normX + normZ * normZ < 1.0) {
                                for (let ly = yEnd - 1; ly >= yStart; ly--) {
                                    const normY = (ly + 0.5 - y) / vertRadius;
                                    const roughIdx = Math.max(0, Math.min(255, ly));
                                    if ((normX * normX + normZ * normZ) * this.roughness[roughIdx] + (normY * normY) / 6.0 < 1.0) {
                                        const tile = chunkData.getTile(lx, ly, lz);
                                        if (tile === BLOCKS.STONE || tile === BLOCKS.DIRT || tile === BLOCKS.GRASS) {
                                            chunkData.setTile(lx, ly, lz, BLOCKS.AIR);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (isStart) break;
                }
            }
        }
    }
}

class TreeLayer {
    constructor(level) {
        this.level = level;
    }

    generate(cx, cz, chunkData) {
        const treeRand = new JavaRandom(this.level.seed + cx * 34187312871 + cz * 132897987541);
        const treeCount = treeRand.nextInt(2);

        for (let i = 0; i < treeCount; i++) {
            const tx = treeRand.nextInt(CHUNK_SIZE - 4) + 2;
            const tz = treeRand.nextInt(CHUNK_SIZE - 4) + 2;
            const worldX = cx * CHUNK_SIZE + tx;
            const worldZ = cz * CHUNK_SIZE + tz;

            let groundY = this.level.getHeight(worldX, worldZ);
            while (groundY > 0 && chunkData.getTile(tx, groundY, tz) === BLOCKS.AIR) groundY--;

            const groundTile = chunkData.getTile(tx, groundY, tz);
            if (groundTile === BLOCKS.GRASS || groundTile === BLOCKS.DIRT) {
                if (groundY > 0 && groundY < CHUNK_HEIGHT - 10) {
                    this.spawnTree(tx, groundY + 1, tz, chunkData, treeRand);
                }
            }
        }
    }

    spawnTree(lx, startY, lz, chunkData, rand) {
        const height = 4 + rand.nextInt(2);
        for (let y = 0; y < height; y++) {
            chunkData.setTile(lx, startY + y, lz, BLOCKS.LOG);
        }

        for (let ly = startY + height - 2; ly <= startY + height + 1; ly++) {
            const layer = ly - (startY + height);
            const radius = layer > 0 ? 1 : 2;

            for (let ox = -radius; ox <= radius; ox++) {
                for (let oz = -radius; oz <= radius; oz++) {
                    if (Math.abs(ox) === radius && Math.abs(oz) === radius && (layer > 0 || rand.nextBoolean())) {
                        continue;
                    }
                    const targetX = lx + ox, targetY = ly, targetZ = lz + oz;
                    if (chunkData.getTile(targetX, targetY, targetZ) === BLOCKS.AIR) {
                        chunkData.setTile(targetX, targetY, targetZ, BLOCKS.LEAVES);
                    }
                }
            }
        }
    }
}

let seed = 0;
let layers = [];
let terrainLayer = null;

self.onmessage = function (e) {
    const data = e.data;

    if (data.type === 'init') {
        seed = data.seed;
        const fakeLevel = {
            seed: seed,
            getHeight: (wx, wz) => terrainLayer.getHeight(wx, wz)
        };
        terrainLayer = new TerrainLayer(fakeLevel);
        layers = [
            terrainLayer,
            new CaveLayer(fakeLevel),
            new RavineLayer(fakeLevel),
            new TreeLayer(fakeLevel)
        ];
        self.postMessage({ type: 'ready' });
    } else if (data.type === 'generate') {
        const { cx, cz } = data;
        const chunkData = new WorkerChunkData(cx, cz);

        for (let i = 0; i < layers.length; i++) {
            layers[i].generate(cx, cz, chunkData);
        }

        self.postMessage(
            {
                type: 'chunkGenerated',
                cx: cx,
                cz: cz,
                blocks: chunkData.blocks.buffer
            },
            [chunkData.blocks.buffer]
        );
    }
};