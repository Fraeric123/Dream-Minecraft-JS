import * as THREE from '../libs/three.module.min.js';
import { JavaRandom } from '../Utils.js';
import { Tile } from './tile/Tile.js';
import { terrain_atlas_texture } from '../Minecraft.js';

export class Level {
    static _sharedMaterial = null;
    static _sharedTransparentMaterial = null;

    constructor(w, h, d, seed) {
        this.width = w;
        this.height = h;
        this.depth = d;

        this.name = "";
        this.creator = "";
        this.createTime = 0;
        this.seed = seed;

        this.xSpawn = 0;
        this.ySpawn = 0;
        this.zSpawn = 0;
        this.rotSpawn = 0;

        this.random = new JavaRandom(this.seed);
        this.randValue = this.random.nextInt();

        this.tickNextTickList = [];
        this.tickCount = 0;
        this.unprocessed = 0;

        this.multiplier = 3;
        this.addend = 1013904223;

        this.texture = terrain_atlas_texture;
        this.texture.flipY = false;

        // The chunk materials only depend on the shared terrain texture and
        // some fixed flags - they are identical for every Level that will
        // ever exist. Build them once and reuse the same instances instead
        // of allocating (and later disposing) a new WebGL shader program
        // every time a Level is created.
        if (!Level._sharedMaterial) {
            Level._sharedMaterial = new THREE.MeshBasicMaterial({
                map: this.texture,
                vertexColors: true,
                transparent: false,
                alphaTest: 0.5,
                side: THREE.FrontSide
            });

            Level._sharedTransparentMaterial = new THREE.MeshBasicMaterial({
                map: this.texture,
                vertexColors: true,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.FrontSide,
                depthWrite: false
            });
        }

        this.material = Level._sharedMaterial;
        this.transparentMaterial = Level._sharedTransparentMaterial;

        this.blocks = new Uint8Array(w * h * d);
        this.lightDepths = new Int32Array(w * h);
        this.metadata = new Uint8Array(w * h * d);
        this.levelListeners = [];

        this.particleEngine = null;
        this.networkMode = false;

        this.calcLightDepths(0, 0, this.width, this.height);

        this.findSpawn();
    }

    findSpawn() {
        const random = new JavaRandom();
        let attempts = 0;
        while (true) {
            attempts++;
            const x = random.nextInt(Math.floor(this.width / 2)) + Math.floor(this.width / 4);
            const z = random.nextInt(Math.floor(this.height / 2)) + Math.floor(this.height / 4);
            const y = this.getHighestTile(x, z) + 1;
            if (attempts >= 100) {
                this.xSpawn = x;
                this.ySpawn = -100;
                this.zSpawn = z;
                return;
            }
            if (y > this.getWaterLevel()) {
                this.xSpawn = x;
                this.ySpawn = y;
                this.zSpawn = z;
                return;
            }
        }
    }

    getHighestTile(x, z) {
        let y;
        for (y = this.depth;
            (this.getTile(x, y - 1, z) === 0 || (Tile.tiles[this.getTile(x, y - 1, z)] != null && Tile.tiles[this.getTile(x, y - 1, z)].getLiquidType() > 0)) && y > 0;
            y--);
        return y;
    }

    initTransient() {
        this.levelListeners = [];
        this.lightDepths = new Int32Array(this.width * this.height);
        this.calcLightDepths(0, 0, this.width, this.height);
        this.random = new JavaRandom();
        this.randValue = this.random.nextInt();
        this.tickNextTickList = [];
        if (this.xSpawn === 0 && this.ySpawn === 0 && this.zSpawn === 0) {
            this.findSpawn();
        }
    }

    setData(w, d, h, blocks) {
        this.width = w;
        this.height = h;
        this.depth = d;
        this.blocks = blocks;

        this.lightDepths = new Int32Array(w * h);
        this.calcLightDepths(0, 0, w, h);
        for (let i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].allChanged();
        }
        this.tickNextTickList = [];
        this.findSpawn();
    }

    tick() {
        this.tickCount++;

        if (this.tickCount % 5 === 0) {
            const listLen = this.tickNextTickList.length;
            for (let i = 0; i < listLen; i++) {
                const entry = this.tickNextTickList.shift();
                if (entry.delay > 0) {
                    entry.delay--;
                    this.tickNextTickList.push(entry);
                } else {
                    if (this.inBounds(entry.x, entry.y, entry.z)) {
                        const blockId = this.blocks[(entry.y * this.height + entry.z) * this.width + entry.x];
                        if (blockId === entry.blockId && blockId > 0) {
                            const tile = Tile.tiles[blockId];
                            if (tile != null) {
                                tile.tick(this, entry.x, entry.y, entry.z, this.random);
                            }
                        }
                    }
                }
            }
        }

        this.unprocessed += this.width * this.height * this.depth;
        const count = Math.floor(this.unprocessed / 200);
        this.unprocessed -= count * 200;

        let wBits = 1, hBits = 1;
        while ((1 << wBits) < this.width) wBits++;
        while ((1 << hBits) < this.height) hBits++;
        const j = this.width - 1;
        const m = this.depth - 1;
        const i = this.height - 1;

        for (let b = 0; b < count; b++) {
            this.randValue = this.randValue * this.multiplier + this.addend;
            let r = this.randValue >> 2;
            const rx = r & j;
            r = r >> wBits;
            const rz = r & i;
            r = r >> hBits;
            const ry = r & m;

            const blockId = this.blocks[(ry * this.height + rz) * this.width + rx] & 0xFF;
            if (blockId > 0) {
                const tile = Tile.tiles[blockId];
                if (tile != null && tile.shouldTick) {
                    tile.tick(this, rx, ry, rz, this.random);
                }
            }
        }
    }

    inBounds(x, y, z) {
        return x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.depth && z < this.height;
    }

    getGroundLevel() {
        return this.depth / 2 - 2;
    }

    getWaterLevel() {
        return this.depth / 2;
    }

    isWater(x, y, z) {
        const tileId = this.getTile(x, y, z);
        if (tileId <= 0) return false;
        const tile = Tile.tiles[tileId];
        return tile != null && tile.getLiquidType() === Tile.LIQUID_WATER;
    }

    swap(x1, y1, z1, x2, y2, z2) {
        const tile1 = this.getTile(x1, y1, z1);
        const tile2 = this.getTile(x2, y2, z2);
        this.setTileNoNeighborChange(x1, y1, z1, tile2);
        this.setTileNoNeighborChange(x2, y2, z2, tile1);
        this.neighborChanged(x1, y1, z1, tile2);
        this.neighborChanged(x2, y2, z2, tile1);
    }

    containsAnyLiquid(box) {
        let x0 = Math.floor(box.x0);
        let x1 = Math.floor(box.x1) + 1;
        let y0 = Math.floor(box.y0);
        let y1 = Math.floor(box.y1) + 1;
        let z0 = Math.floor(box.z0);
        let z1 = Math.floor(box.z1) + 1;
        if (box.x0 < 0) x0--;
        if (box.y0 < 0) y0--;
        if (box.z0 < 0) z0--;
        if (x0 < 0) x0 = 0;
        if (y0 < 0) y0 = 0;
        if (z0 < 0) z0 = 0;
        if (x1 > this.width) x1 = this.width;
        if (y1 > this.depth) y1 = this.depth;
        if (z1 > this.height) z1 = this.height;
        for (let x = x0; x < x1; x++) {
            for (let y = y0; y < y1; y++) {
                for (let z = z0; z < z1; z++) {
                    const tile = Tile.tiles[this.getTile(x, y, z)];
                    if (tile != null && tile.getLiquidType() > 0)
                        return true;
                }
            }
        }
        return false;
    }

    containsLiquid(box, liquidId) {
        let x0 = Math.floor(box.x0);
        let x1 = Math.floor(box.x1) + 1;
        let y0 = Math.floor(box.y0);
        let y1 = Math.floor(box.y1) + 1;
        let z0 = Math.floor(box.z0);
        let z1 = Math.floor(box.z1) + 1;
        if (box.x0 < 0) x0--;
        if (box.y0 < 0) y0--;
        if (box.z0 < 0) z0--;
        if (x0 < 0) x0 = 0;
        if (y0 < 0) y0 = 0;
        if (z0 < 0) z0 = 0;
        if (x1 > this.width) x1 = this.width;
        if (y1 > this.depth) y1 = this.depth;
        if (z1 > this.height) z1 = this.height;
        for (let x = x0; x < x1; x++) {
            for (let y = y0; y < y1; y++) {
                for (let z = z0; z < z1; z++) {
                    const tile = Tile.tiles[this.getTile(x, y, z)];
                    if (tile != null && tile.getLiquidType() == liquidId)
                        return true;
                }
            }
        }
        return false;
    }

    isLightBlocker(x, y, z) {
        const tile = Tile.tiles[this.getTile(x, y, z)];
        if (tile == null) return false;
        return tile.blocksLight();
    }

    calcLightDepths(x0, y0, x1, y1) {
        for (let x = x0; x < x0 + x1; x++) {
            for (let z = y0; z < y0 + y1; z++) {
                let oldDepth = this.lightDepths[x + z * this.width];
                let y = this.depth - 1;
                while (y > 0 && !this.isLightBlocker(x, y, z)) {
                    y--;
                }
                this.lightDepths[x + z * this.width] = y + 1;

                if (oldDepth != y) {
                    let yl0 = (oldDepth < y) ? oldDepth : y;
                    let yl1 = (oldDepth > y) ? oldDepth : y;
                    for (let i = 0; i < this.levelListeners.length; i++)
                        (this.levelListeners[i]).lightColumnChanged(x, z, yl0, yl1);
                }
            }
        }
    }

    getTileMetadata(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) return 0;
        return this.metadata[(y * this.height + z) * this.width + x];
    }

    setTileMetadata(x, y, z, val) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) return;
        const idx = (y * this.height + z) * this.width + x;
        this.metadata[idx] = val;
    }

    getBrightness(x, y, z) {
        return this.isLit(x, y, z) ? 1.0 : 0.6;
    }

    addListener(levelListener) {
        this.levelListeners.push(levelListener);
    }

    removeListener(levelListener) {
        const idx = this.levelListeners.indexOf(levelListener);
        if (idx >= 0) this.levelListeners.splice(idx, 1);
    }

    isTile(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return false;
        }
        return this.blocks[(y * this.height + z) * this.width + x] === 1;
    }

    getTile(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return 0;
        }
        return this.blocks[(y * this.height + z) * this.width + x] & 0xFF;
    }

    isSolidTile(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.depth || z < 0 || z >= this.height) {
            return false;
        }
        const tileId = this.blocks[(y * this.height + z) * this.width + x];
        const tile = Tile.tiles[tileId];
        return tile ? tile.isSolid() : false;
    }

    isSolid(x, y, z, margin) {
        return this.isSolidAt(x - margin, y - margin, z - margin) ||
            this.isSolidAt(x - margin, y - margin, z + margin) ||
            this.isSolidAt(x - margin, y + margin, z - margin) ||
            this.isSolidAt(x - margin, y + margin, z + margin) ||
            this.isSolidAt(x + margin, y - margin, z - margin) ||
            this.isSolidAt(x + margin, y - margin, z + margin) ||
            this.isSolidAt(x + margin, y + margin, z - margin) ||
            this.isSolidAt(x + margin, y + margin, z + margin);
    }

    isSolidAt(x, y, z) {
        const id = this.getTile(Math.floor(x), Math.floor(y), Math.floor(z));
        return id > 0 && Tile.tiles[id] != null && Tile.tiles[id].isSolid();
    }

    setTile(x, y, z, type) {
        if (this.networkMode) return false;
        if (this.setTileNoNeighborChange(x, y, z, type)) {
            this.neighborChanged(x - 1, y, z, type);
            this.neighborChanged(x + 1, y, z, type);
            this.neighborChanged(x, y - 1, z, type);
            this.neighborChanged(x, y + 1, z, type);
            this.neighborChanged(x, y, z - 1, type);
            this.neighborChanged(x, y, z + 1, type);
            return true;
        }
        return false;
    }

    setTileNoNeighborChange(x, y, z, type) {
        if (this.networkMode) return false;
        return this.netSetTileNoNeighborChange(x, y, z, type);
    }

    netSetTileNoNeighborChange(x, y, z, type) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height)
            return false;
        const idx = (y * this.height + z) * this.width + x;
        if (type == (this.blocks[idx] & 0xFF))
            return false;

        if (type === 0 && (x === 0 || z === 0 || x === this.width - 1 || z === this.height - 1) &&
            y >= this.getGroundLevel() && y < this.getWaterLevel()) {
            type = Tile.calmWater.id;
        }

        const oldType = this.blocks[idx] & 0xFF;
        this.blocks[idx] = type;

        if (oldType !== 0) {
            const oldTile = Tile.tiles[oldType];
            if (oldTile && typeof oldTile.onRemove === 'function') {
                oldTile.onRemove(this, x, y, z);
            }
        }

        if (type !== 0) {
            const newTile = Tile.tiles[type];
            if (newTile && typeof newTile.onPlace === 'function') {
                newTile.onPlace(this, x, y, z);
            }
        }

        this.calcLightDepths(x, z, 1, 1);
        for (let i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].tileChanged(x - 1, y - 1, z - 1, x + 1, y + 1, z + 1);
        }
        return true;
    }

    netSetTile(x, y, z, type) {
        if (this.netSetTileNoNeighborChange(x, y, z, type)) {
            this.neighborChanged(x - 1, y, z, type);
            this.neighborChanged(x + 1, y, z, type);
            this.neighborChanged(x, y - 1, z, type);
            this.neighborChanged(x, y + 1, z, type);
            this.neighborChanged(x, y, z - 1, type);
            this.neighborChanged(x, y, z + 1, type);
            return true;
        }
        return false;
    }

    setTileNoUpdate(x, y, z, type) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height)
            return false;
        const idx = (y * this.height + z) * this.width + x;
        if (type == (this.blocks[idx] & 0xFF))
            return false;
        this.blocks[idx] = type;
        return true;
    }

    neighborChanged(x, y, z, type) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height)
            return;
        const tile = Tile.tiles[this.blocks[(y * this.height + z) * this.width + x] & 0xFF];
        if (tile != null)
            tile.neighborChanged(this, x, y, z, type);
    }

    updateNeighborsAt(x, y, z, type) {
        this.neighborChanged(x - 1, y, z, type);
        this.neighborChanged(x + 1, y, z, type);
        this.neighborChanged(x, y - 1, z, type);
        this.neighborChanged(x, y + 1, z, type);
        this.neighborChanged(x, y, z - 1, type);
        this.neighborChanged(x, y, z + 1, type);
    }

    addToTickNextTick(x, y, z, blockId) {
        if (this.networkMode) return;
        const tile = Tile.tiles[blockId];
        let delay = 0;
        if (tile != null) {
            delay = tile.getTickDelay();
        }
        this.tickNextTickList.push({ x, y, z, blockId, delay });
    }

    getCubes(box) {
        let boxes = [];
        let x0 = Math.floor(box.x0);
        let x1 = Math.floor(box.x1) + 1;
        let y0 = Math.floor(box.y0);
        let y1 = Math.floor(box.y1) + 1;
        let z0 = Math.floor(box.z0);
        let z1 = Math.floor(box.z1) + 1;
        if (box.x0 < 0) x0--;
        if (box.y0 < 0) y0--;
        if (box.z0 < 0) z0--;
        for (let x = x0; x < x1; x++) {
            for (let y = y0; y < y1; y++) {
                for (let z = z0; z < z1; z++) {
                    if (x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.depth && z < this.height) {
                        let tile = Tile.tiles[this.getTile(x, y, z)];
                        if (tile != null) {
                            let aabb = tile.getAABB(x, y, z);
                            if (aabb != null)
                                boxes.push(aabb);
                        }
                    } else if (x < 0 || y < 0 || z < 0 || x >= this.width || z >= this.height) {
                        let aabb = Tile.unbreakable.getAABB(x, y, z);
                        if (aabb != null)
                            boxes.push(aabb);
                    }
                }
            }
        }
        return boxes;
    }

    isLit(x, y, z) {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.depth && z < this.height)
            return (y >= this.lightDepths[x + z * this.width]);
        return true;
    }

    tickEntities() { }

    setSpawnPos(x, y, z, rot) {
        this.xSpawn = x;
        this.ySpawn = y;
        this.zSpawn = z;
        this.rotSpawn = rot;
    }

    setNetworkMode(mode) {
        this.networkMode = mode;
    }

    isFree(box) {
        return true;
    }

    copyBlocks() {
        return new Uint8Array(this.blocks);
    }

    /**
     * Tear down this level. The chunk materials (material/transparentMaterial)
     * and the terrain texture are shared singletons reused by every Level
     * that ever exists, so they are NOT disposed here - only per-instance
     * state is cleared.
     */
    destroy() {
        this.material = null;
        this.transparentMaterial = null;
        // Remove all listeners so a stale level cannot fire callbacks into a
        // destroyed / replaced LevelRenderer.
        this.levelListeners = [];
        this.particleEngine = null;
    }
}