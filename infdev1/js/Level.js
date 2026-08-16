import { CHUNK_HEIGHT, CHUNK_SIZE, BLOCKS, NUM_SUBCHUNKS, SUBCHUNK_HEIGHT } from "./Game.js";

export class ChunkData {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
        this.generated = false;
        this.subChunksDirty = new Array(NUM_SUBCHUNKS).fill(true);
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
            const sy = Math.floor(y / SUBCHUNK_HEIGHT);
            this.subChunksDirty[sy] = true;
        }
    }
}

export class Level {
    constructor(engine, seed) {
        this.engine = engine;
        this.seed = seed;
        this.time = 6000;
        this.chunksData = new Map();
        this.requestedChunks = new Set();
        
        this.generationQueue = [];
        this.activeWorkerTasks = 0;
        this.MAX_CONCURRENT_TASKS = 4;
        this.workerReady = false;

        this.worker = new Worker(new URL('./WorldWorker.js', import.meta.url));

        this.worker.onerror = (err) => {
            console.error("[Level] Chyba Workeru:", err);
        };

        this.worker.onmessage = (e) => {
            const data = e.data;
            if (data.type === 'ready') {
                this.workerReady = true;
                this.processQueue();
            } else if (data.type === 'chunkGenerated') {
                this.onChunkGenerated(data.cx, data.cz, data.blocks);
                this.activeWorkerTasks--;
                this.processQueue();
            }
        };

        this.worker.postMessage({
            type: 'init',
            seed: this.seed
        });
    }

    // Kontrola zda je chunk vygenerován
    isChunkGenerated(cx, cz) {
        const key = `${cx},${cz}`;
        const chunk = this.chunksData.get(key);
        return !!(chunk && chunk.generated);
    }

    // Kontrola podle světových souřadnic hráče
    isLoaded(worldX, worldZ) {
        const cx = Math.floor(worldX / CHUNK_SIZE);
        const cz = Math.floor(worldZ / CHUNK_SIZE);
        return this.isChunkGenerated(cx, cz);
    }

    requestChunk(cx, cz, playerX = null, playerZ = null) {
        const key = `${cx},${cz}`;
        if (this.requestedChunks.has(key)) return;

        this.requestedChunks.add(key);

        let chunkData = this.chunksData.get(key);
        if (!chunkData) {
            chunkData = new ChunkData(cx, cz);
            this.chunksData.set(key, chunkData);
        }

        const distSq = playerX !== null && playerZ !== null 
            ? (cx * CHUNK_SIZE + 8 - playerX) ** 2 + (cz * CHUNK_SIZE + 8 - playerZ) ** 2 
            : 0;

        this.generationQueue.push({ cx, cz, distSq });
        
        // Řazení požadavků tak, aby se nejprve generovaly chunky u hráče
        this.generationQueue.sort((a, b) => a.distSq - b.distSq);
        this.processQueue();
    }

    processQueue() {
        if (!this.workerReady) return;

        while (this.activeWorkerTasks < this.MAX_CONCURRENT_TASKS && this.generationQueue.length > 0) {
            const task = this.generationQueue.shift();
            this.activeWorkerTasks++;
            this.worker.postMessage({
                type: 'generate',
                cx: task.cx,
                cz: task.cz
            });
        }
    }

    onChunkGenerated(cx, cz, blocksBuffer) {
        const key = `${cx},${cz}`;
        let chunkData = this.chunksData.get(key);
        if (!chunkData) {
            chunkData = new ChunkData(cx, cz);
            this.chunksData.set(key, chunkData);
        }

        chunkData.blocks = new Uint8Array(blocksBuffer);
        chunkData.generated = true;
        chunkData.subChunksDirty.fill(true);

        // Označení sousedních chunků k přerenderování hran
        this.markChunkDirty(cx + 1, cz);
        this.markChunkDirty(cx - 1, cz);
        this.markChunkDirty(cx, cz + 1);
        this.markChunkDirty(cx, cz - 1);
    }

    markChunkDirty(cx, cz) {
        const key = `${cx},${cz}`;
        const chunkData = this.chunksData.get(key);
        if (chunkData && chunkData.generated) {
            chunkData.subChunksDirty.fill(true);
        }
    }

    getHeight(worldX, worldZ) {
        const cx = Math.floor(worldX / CHUNK_SIZE);
        const cz = Math.floor(worldZ / CHUNK_SIZE);
        const lx = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((worldZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${cx},${cz}`;
        const chunkData = this.chunksData.get(key);
        if (chunkData && chunkData.generated) {
            for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
                if (chunkData.getTile(lx, y, lz) !== BLOCKS.AIR) {
                    return y + 1;
                }
            }
        }
        return 72;
    }

    getTile(worldX, worldY, worldZ) {
        if (worldY < 0 || worldY >= CHUNK_HEIGHT) return BLOCKS.AIR;

        const cx = Math.floor(worldX / CHUNK_SIZE);
        const cz = Math.floor(worldZ / CHUNK_SIZE);
        const lx = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((worldZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${cx},${cz}`;
        const chunkData = this.chunksData.get(key);
        if (!chunkData || !chunkData.generated) return BLOCKS.AIR;

        return chunkData.getTile(lx, worldY, lz);
    }

    setTile(worldX, worldY, worldZ, type) {
        if (worldY < 0 || worldY >= CHUNK_HEIGHT) return;

        const cx = Math.floor(worldX / CHUNK_SIZE);
        const cz = Math.floor(worldZ / CHUNK_SIZE);
        const lx = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((worldZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${cx},${cz}`;
        const chunkData = this.chunksData.get(key);
        if (!chunkData) return;

        chunkData.setTile(lx, worldY, lz, type);

        const sy = Math.floor(worldY / SUBCHUNK_HEIGHT);
        if (lx === 0) this.markSubChunkDirty(cx - 1, cz, sy);
        if (lx === CHUNK_SIZE - 1) this.markSubChunkDirty(cx + 1, cz, sy);
        if (lz === 0) this.markSubChunkDirty(cx, cz - 1, sy);
        if (lz === CHUNK_SIZE - 1) this.markSubChunkDirty(cx, cz + 1, sy);
        if (worldY % SUBCHUNK_HEIGHT === 0 && sy > 0) this.markSubChunkDirty(cx, cz, sy - 1);
        if (worldY % SUBCHUNK_HEIGHT === SUBCHUNK_HEIGHT - 1 && sy < NUM_SUBCHUNKS - 1) this.markSubChunkDirty(cx, cz, sy + 1);
    }

    markSubChunkDirty(cx, cz, sy) {
        const key = `${cx},${cz}`;
        const chunkData = this.chunksData.get(key);
        if (chunkData && chunkData.generated && sy >= 0 && sy < NUM_SUBCHUNKS) {
            chunkData.subChunksDirty[sy] = true;
        }
    }
}