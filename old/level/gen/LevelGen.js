import { sleep, JavaRandom } from '../../Utils.js';
import { PerlinNoiseFilter } from './PerlinNoiseFilter.js';
import { Tile } from '../tile/Tile.js';

export class LevelGen {
    constructor(levelGenScreen) {
        this.random = new JavaRandom();
        this.coords = new Int32Array(1048576);

        this.levelGenScreen = levelGenScreen;

        this.width = 0;
        this.height = 0;
        this.depth = 0;
        this.blocks = null;
    }

    async generateLevel(level, userName, width, height, depth) {
        console.log(`Generating level`);

        const canvas_renderer = this.levelGenScreen.minecraft.canvas_renderer;

        this.levelGenScreen.setTitle("Generating level");
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        await sleep(200);

        this.width = width;
        this.height = height;
        this.depth = depth;

        this.blocks = new Uint8Array(width * height * depth);

        console.log(`Raising..`);
        this.levelGenScreen.setStatus("Raising..", 0);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        const heightMap = this.buildHeightmap(width, height);
        await sleep(20);

        console.log(`Eroding..`);
        this.levelGenScreen.setStatus("Eroding..", 20);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.buildBlocks(heightMap);
        await sleep(20);

        console.log(`Soiling..`);
        this.levelGenScreen.setStatus("Soiling..", 30);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        await sleep(20);

        console.log(`Carving..`);
        this.levelGenScreen.setStatus("Carving..", 40);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.carveTunnels();
        await sleep(20);

        // Place ores before watering (matching original order)
        console.log(`Ores..`);
        this.placeOres();
        await sleep(20);

        console.log(`Watering..`);
        this.levelGenScreen.setStatus("Watering..", 60);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.addWater();
        await sleep(20);

        console.log(`Melting..`);
        this.levelGenScreen.setStatus("Melting..", 80);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.addLava();
        await sleep(20);

        console.log(`Growing..`);
        this.levelGenScreen.setStatus("Growing..", 90);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.growSurface(heightMap);
        await sleep(20);

        console.log(`Planting..`);
        this.levelGenScreen.setStatus("Planting..", 95);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.growTrees();
        this.placeFlowers();
        this.placeMushrooms();
        await sleep(20);

        this.levelGenScreen.setStatus("Completing..", 100);
        this.levelGenScreen.render(0, 0, canvas_renderer.VIRTUAL_WIDTH, canvas_renderer.VIRTUAL_HEIGHT);
        this.levelGenScreen.minecraft.levelRenderer.compileSurroundingGround();
        this.levelGenScreen.minecraft.levelRenderer.compileSurroundingWater();

        this.levelGenScreen.minecraft.levelRenderer.compileClouds();
        await sleep(20);

        if (typeof level.setData === "function") {
            level.setData(width, depth, height, this.blocks);
        } else {
            level.blocks = this.blocks;
        }

        level.createTime = Date.now();
        level.creator = userName;
        level.name = "A Nice World";

        return true;
    }

    buildHeightmap(width, height) {
        const noise1 = new PerlinNoiseFilter(0);
        const noise2 = new PerlinNoiseFilter(0);
        const cfNoise = new PerlinNoiseFilter(1);
        const rockNoise = new PerlinNoiseFilter(1);

        const hm1 = noise1.read(width, height, this.random);
        const hm2 = noise2.read(width, height, this.random);
        const cf = cfNoise.read(width, height, this.random);
        const rock = rockNoise.read(width, height, this.random);

        const heightMap = new Float64Array(width * height);
        const rockMap = new Float64Array(width * height);

        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                const idx = x + z * width;
                let dh1 = hm1[idx];
                let dh2 = hm2[idx];

                if (cf[idx] < 128) {
                    dh2 = dh1;
                }

                let dh = dh1;
                if (dh2 > dh) {
                    dh = dh2;
                }

                heightMap[idx] = Math.floor(dh / 8) + Math.floor(this.depth / 3);
                rockMap[idx] = Math.floor(rock[idx] / 8) + Math.floor(this.depth / 3);
                if (rockMap[idx] > heightMap[idx] - 2) {
                    rockMap[idx] = heightMap[idx] - 2;
                }
            }
        }

        this._rockMap = rockMap;
        return heightMap;
    }

    buildBlocks(heightMap) {
        const w = this.width;
        const h = this.height;
        const d = this.depth;
        const rockMap = this._rockMap;

        for (let x = 0; x < w; x++) {
            for (let z = 0; z < h; z++) {
                const mapIdx = x + z * w;
                const dh = heightMap[mapIdx];
                const rh = rockMap ? rockMap[mapIdx] : Math.trunc(d / 3);

                for (let y = 0; y < d; y++) {
                    const i = (y * h + z) * w + x;
                    let id = 0;

                    if (y === dh) id = Tile.grass.id;
                    if (y < dh) id = Tile.dirt.id;
                    if (y <= rh) id = Tile.rock.id;

                    this.blocks[i] = id;
                }
            }
        }
    }

    // Surface decoration: place sand near water, grass on top of dirt
    // Matches original Java LevelGen.grow()
    growSurface(heightMap) {
        const w = this.width;
        const h = this.height;
        const d = this.depth;

        const noise1 = new PerlinNoiseFilter(8);
        const noise2 = new PerlinNoiseFilter(8);

        const sandNoise = noise1.read(w, h, this.random);
        const gravelNoise = noise2.read(w, h, this.random);

        for (let x = 0; x < w; x++) {
            for (let z = 0; z < h; z++) {
                const isSand = sandNoise[x + z * w] > 8.0;
                const isGravel = gravelNoise[x + z * w] > 12.0;

                const mapIdx = x + z * w;
                const n = heightMap[mapIdx];
                const i1 = (n * h + z) * w + x;

                // Check block above heightmap
                const aboveId = this.blocks[((n + 1) * h + z) * w + x] & 0xFF;

                // Place gravel next to water
                if ((aboveId === Tile.calmWater.id || aboveId === Tile.water.id) &&
                    n <= Math.floor(d / 2) - 1 && isGravel) {
                    this.blocks[i1] = Tile.gravel.id;
                }

                // Place sand next to water, grass on dry land
                if (aboveId === 0) {
                    let surfaceTile = Tile.grass.id;
                    if (n <= Math.floor(d / 2) - 1 && isSand) {
                        surfaceTile = Tile.sand.id;
                    }
                    this.blocks[i1] = surfaceTile;
                }
            }
        }
    }

    carveTunnels() {
        const w = this.width;
        const h = this.height;
        const d = this.depth;
        const count = Math.trunc((w * h * d) / 256 / 64);

        for (let i = 0; i < count; i++) {
            let x = this.random.nextFloat() * w;
            let y = this.random.nextFloat() * d;
            let z = this.random.nextFloat() * h;

            const length = Math.trunc((this.random.nextFloat() + this.random.nextFloat()) * 150.0);
            let dir1 = this.random.nextFloat() * Math.PI * 2.0;
            let dira1 = 0.0;
            let dir2 = this.random.nextFloat() * Math.PI * 2.0;
            let dira2 = 0.0;

            for (let l = 0; l < length; l++) {
                x += Math.sin(dir1) * Math.cos(dir2);
                z += Math.cos(dir1) * Math.cos(dir2);
                y += Math.sin(dir2);

                dir1 += dira1 * 0.2;
                dira1 *= 0.9;
                dira1 += this.random.nextFloat() - this.random.nextFloat();

                dir2 += dira2 * 0.5;
                dir2 *= 0.5;
                dira2 *= 0.9;
                dira2 += this.random.nextFloat() - this.random.nextFloat();

                // Size varies along the tunnel (larger in middle, smaller at ends)
                const size = Math.sin(l * Math.PI / length) * 2.5 + 1.0;

                const xStart = Math.floor(x - size);
                const xEnd = Math.floor(x + size);
                const yStart = Math.floor(y - size);
                const yEnd = Math.floor(y + size);
                const zStart = Math.floor(z - size);
                const zEnd = Math.floor(z + size);

                for (let xx = xStart; xx <= xEnd; xx++) {
                    for (let yy = yStart; yy <= yEnd; yy++) {
                        for (let zz = zStart; zz <= zEnd; zz++) {
                            const xd = xx - x;
                            const yd = yy - y;
                            const zd = zz - z;
                            const dd = xd * xd + yd * yd * 2.0 + zd * zd;

                            if (dd < size * size && xx >= 1 && yy >= 1 && zz >= 1 && xx < w - 1 && yy < d - 1 && zz < h - 1) {
                                const ii = (yy * h + zz) * w + xx;
                                if (this.blocks[ii] === Tile.rock.id) {
                                    this.blocks[ii] = 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    addWater() {
        const before = performance.now();
        let tiles = 0;
        const source = 0;
        const target = Tile.calmWater.id;
        const halfDepth = Math.trunc(this.depth / 2) - 1;

        // Flood fill from edges
        for (let x = 0; x < this.width; x++) {
            tiles += this.floodFillLiquid(x, halfDepth, 0, source, target);
            tiles += this.floodFillLiquid(x, halfDepth, this.height - 1, source, target);
        }
        for (let z = 0; z < this.height; z++) {
            tiles += this.floodFillLiquid(0, halfDepth, z, source, target);
            tiles += this.floodFillLiquid(this.width - 1, halfDepth, z, source, target);
        }

        // Additional water sources
        const count = Math.trunc((this.width * this.height) / 5000);
        for (let i = 0; i < count; i++) {
            let j = this.random.nextInt(this.width);
            let k = halfDepth;
            let z = this.random.nextInt(this.height);
            if (this.blocks[(k * this.height + z) * this.width + j] === 0) {
                tiles += this.floodFillLiquid(j, k, z, 0, target);
            }
        }
        const after = performance.now();
        console.log("Flood filled " + tiles + " tiles in " + (after - before) + " ms");
    }

    addLava() {
        let lavaCount = 0;
        const count = Math.trunc((this.width * this.height * this.depth) / 10000);
        for (let i = 0; i < count; i++) {
            const x = this.random.nextInt(this.width);
            const y = this.random.nextInt(Math.trunc(this.depth / 2));
            const z = this.random.nextInt(this.height);
            const idx = (y * this.height + z) * this.width + x;
            if (this.blocks[idx] === 0) {
                lavaCount++;
                this.floodFillLiquid(x, y, z, 0, Tile.calmLava.id);
            }
        }
        console.log("LavaCount: " + lavaCount);
    }

    // Ore placement matching original Java vein algorithm
    placeOres() {
        const w = this.width;
        const h = this.height;
        const d = this.depth;

        // Original: Coal=90%, Iron=70%, Gold=50% (as percentage of max count)
        this.placeOreVein(Tile.coalOre.id, 90, 0, w, h, d);
        this.placeOreVein(Tile.ironOre.id, 70, 1, w, h, d);
        this.placeOreVein(Tile.goldOre.id, 50, 2, w, h, d);
    }

    placeOreVein(oreId, percentage, progressGroup, w, h, d) {
        const k = Math.floor(w * h * d / 256 / 64 * percentage / 100);

        for (let i = 0; i < k; i++) {
            let f1 = this.random.nextFloat() * w;
            let f2 = this.random.nextFloat() * d;
            let f3 = this.random.nextFloat() * h;

            const m = Math.floor((this.random.nextFloat() + this.random.nextFloat()) * 75.0 * percentage / 100.0);
            let f4 = this.random.nextFloat() * Math.PI * 2.0;
            let f5 = 0.0;
            let f6 = this.random.nextFloat() * Math.PI * 2.0;
            let f7 = 0.0;

            for (let b1 = 0; b1 < m; b1++) {
                f1 += Math.sin(f4) * Math.cos(f6);
                f3 += Math.cos(f4) * Math.cos(f6);
                f2 += Math.sin(f6);

                f4 += f5 * 0.2;
                f5 = f5 * 0.9 + this.random.nextFloat() - this.random.nextFloat();
                f6 = f6 + f7 * 0.5;
                f6 *= 0.5;
                f7 = f7 * 0.9 + this.random.nextFloat() - this.random.nextFloat();

                const f = Math.sin(b1 * Math.PI / m) * percentage / 100.0 + 1.0;

                for (let n = Math.floor(f1 - f); n <= Math.floor(f1 + f); n++) {
                    for (let i1 = Math.floor(f2 - f); i1 <= Math.floor(f2 + f); i1++) {
                        for (let i2 = Math.floor(f3 - f); i2 <= Math.floor(f3 + f); i2++) {
                            const f8 = n - f1;
                            const f9 = i1 - f2;
                            const f10 = i2 - f3;
                            if (f8 * f8 + f9 * f9 * 2.0 + f10 * f10 < f * f &&
                                n >= 1 && i1 >= 1 && i2 >= 1 &&
                                n < w - 1 && i1 < d - 1 && i2 < h - 1) {
                                const idx = (i1 * h + i2) * w + n;
                                if (this.blocks[idx] === Tile.rock.id) {
                                    this.blocks[idx] = oreId;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Tree generation matching original Java algorithm
    growTrees() {
        const w = this.width;
        const h = this.height;
        const d = this.depth;
        const treeCount = Math.floor(w * h / 4000);

        for (let i = 0; i < treeCount; i++) {
            const x = this.random.nextInt(w);
            const z = this.random.nextInt(h);
            let y = d - 1;

            // Najdi úroveň země (sněž dolů, dokud nenarazíš na blok)
            while (y > 0 && this.blocks[(y * h + z) * w + x] === 0) {
                y--;
            }

            // Zkontroluj, zda je blok pod stromem tráva (v originále ID 2)
            if (this.blocks[(y * h + z) * w + x] === Tile.grass.id) {
                const height = this.random.nextInt(3) + 4;

                // Polož kmen stromu
                for (let dy = 0; dy < height; dy++) {
                    if (y + dy + 1 < d) {
                        this.blocks[((y + dy + 1) * h + z) * w + x] = Tile.log.id;
                    }
                }

                const topY = y + height;

                // Polož listí (opraveno: širší dole, užší nahoře -> kůl je správně)
                for (let ly = 0; ly <= 2; ly++) {
                    for (let lx = -2; lx <= 2; lx++) {
                        for (let lz = -2; lz <= 2; lz++) {
                            const tx = x + lx;
                            const ty = topY - 1 + ly; // Posuneme y tak, aby spodní vrstva byla širší
                            const tz = z + lz;

                            // Zkontroluj hranice světa
                            if (tx >= 0 && ty >= 0 && tz >= 0 && tx < w && ty < d && tz < h) {
                                // Matematický vzorec pro tvar listí: `ly` se zvětšuje, takže poloměr se zmenšuje
                                if (Math.abs(lx) + Math.abs(lz) + ly < 4 &&
                                    this.blocks[(ty * h + tz) * w + tx] === 0) {
                                    this.blocks[(ty * h + tz) * w + tx] = Tile.leaves.id;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    placeFlowers() {
        const w = this.width;
        const h = this.height;
        const d = this.depth;
        const count = Math.trunc((w * h) / 100);

        for (let i = 0; i < count; i++) {
            const fx = this.random.nextInt(w);
            const fz = this.random.nextInt(h);

            let groundY = d - 1;
            while (groundY > 0 && this.blocks[(groundY * h + fz) * w + fx] === 0) {
                groundY--;
            }

            if (this.blocks[(groundY * h + fz) * w + fx] !== Tile.grass.id) continue;

            const flowerY = groundY + 1;
            if (flowerY >= d) continue;

            const flowerType = this.random.nextInt(2) === 0 ? Tile.yellowFlower.id : Tile.redRose.id;
            this.blocks[(flowerY * h + fz) * w + fx] = flowerType;
        }
    }

    placeMushrooms() {
        const w = this.width;
        const h = this.height;
        const d = this.depth;
        const count = Math.trunc((w * h) / 200);

        for (let i = 0; i < count; i++) {
            const mx = this.random.nextInt(w);
            const mz = this.random.nextInt(h);
            const my = this.random.nextInt(Math.trunc(d / 2)) + 1;

            const idx = (my * h + mz) * w + mx;
            if (this.blocks[idx] === 0 && this.blocks[((my - 1) * h + mz) * w + mx] !== 0) {
                const mushType = this.random.nextInt(2) === 0 ? Tile.brownMushroom.id : Tile.redMushroom.id;
                this.blocks[idx] = mushType;
            }
        }
    }

    floodFillLiquid(x, y, z, source, tt) {
        let target = tt;
        let coordBuffer = [];
        let p = 0;
        let wBits = 1, hBits = 1;
        while ((1 << wBits) < this.width) wBits++;
        while ((1 << hBits) < this.height) hBits++;

        let hMask = this.height - 1;
        let wMask = this.width - 1;

        if (!this.coords || this.coords.length !== 1048576) {
            this.coords = new Int32Array(1048576);
        }

        this.coords[p++] = ((((y << hBits) + z) << wBits) + x) | 0;
        let tiles = 0;
        let upStep = this.width * this.height;

        while (p > 0) {
            let cl = this.coords[--p] | 0;
            if (p === 0 && coordBuffer.length > 0) {
                this.coords = coordBuffer.pop();
                p = this.coords.length;
            }

            let z0 = (cl >> wBits) & hMask;
            let y0 = (cl >>> (wBits + hBits)) | 0;
            let x0 = cl & wMask;
            let x1 = x0;

            while (x0 > 0 && this.blocks[cl - 1] === source) {
                x0--;
                cl--;
            }
            while (x1 < this.width && this.blocks[cl + x1 - x0] === source) {
                x1++;
            }

            let lastNorth = false;
            let lastSouth = false;
            let lastBelow = false;
            tiles += (x1 - x0);

            for (let xx = x0; xx < x1; xx++) {
                this.blocks[cl] = target;
                if (z0 > 0) {
                    let north = (this.blocks[cl - this.width] === source);
                    if (north && !lastNorth) {
                        if (p === this.coords.length) {
                            coordBuffer.push(this.coords);
                            this.coords = new Int32Array(1048576);
                            p = 0;
                        }
                        this.coords[p++] = (cl - this.width) | 0;
                    }
                    lastNorth = north;
                }
                if (z0 < this.height - 1) {
                    let south = (this.blocks[cl + this.width] === source);
                    if (south && !lastSouth) {
                        if (p === this.coords.length) {
                            coordBuffer.push(this.coords);
                            this.coords = new Int32Array(1048576);
                            p = 0;
                        }
                        this.coords[p++] = (cl + this.width) | 0;
                    }
                    lastSouth = south;
                }
                if (y0 > 0) {
                    let belowId = this.blocks[cl - upStep];
                    // Lava + Water = Stone (original behavior)
                    if ((target === Tile.lava.id || target === Tile.calmLava.id) &&
                        (belowId === Tile.water.id || belowId === Tile.calmWater.id)) {
                        this.blocks[cl - upStep] = Tile.rock.id;
                    }
                    if ((target === Tile.water.id || target === Tile.calmWater.id) &&
                        (belowId === Tile.lava.id || belowId === Tile.calmLava.id)) {
                        this.blocks[cl - upStep] = Tile.cobblestone.id;
                    }
                    let below = (belowId === source);
                    if (below && !lastBelow) {
                        if (p === this.coords.length) {
                            coordBuffer.push(this.coords);
                            this.coords = new Int32Array(1048576);
                            p = 0;
                        }
                        this.coords[p++] = (cl - upStep) | 0;
                    }
                    lastBelow = below;
                }
                cl++;
            }
        }
        return tiles;
    }
}