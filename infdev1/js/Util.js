import * as THREE from 'three';

import { CHUNK_HEIGHT, CHUNK_SIZE, BLOCKS } from "./Game.js";



export function getNoise(x, y, z, seed = 0) {
    let h = (x * 374761393 + y * 668265263 + z * 362827313 + seed * 1274126177) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export class AABB {
    constructor(x0, y0, z0, x1, y1, z1) {
        this.epsilon = 0.001;
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
    }

    expand(xa, ya, za) {
        let _x0 = this.x0, _y0 = this.y0, _z0 = this.z0;
        let _x1 = this.x1, _y1 = this.y1, _z1 = this.z1;

        if (xa < 0.0) _x0 += xa;
        if (xa > 0.0) _x1 += xa;
        if (ya < 0.0) _y0 += ya;
        if (ya > 0.0) _y1 += ya;
        if (za < 0.0) _z0 += za;
        if (za > 0.0) _z1 += za;

        return new AABB(_x0, _y0, _z0, _x1, _y1, _z1);
    }

    grow(xa, ya, za) {
        return new AABB(
            this.x0 - xa, this.y0 - ya, this.z0 - za,
            this.x1 + xa, this.y1 + ya, this.z1 + za
        );
    }

    cloneMove(xa, ya, za) {
        return new AABB(this.x0 + xa, this.y0 + ya, this.z0 + za, this.x1 + xa, this.y1 + ya, this.z1 + za);
    }

    clipXCollide(c, xa) {
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return xa;
        if (c.z1 <= this.z0 || c.z0 >= this.z1) return xa;

        if (xa > 0.0 && c.x1 <= this.x0) {
            let max = this.x0 - c.x1 - this.epsilon;
            if (max < xa) xa = max;
        }
        if (xa < 0.0 && c.x0 >= this.x1) {
            let max = this.x1 - c.x0 + this.epsilon;
            if (max > xa) xa = max;
        }
        return xa;
    }

    clipYCollide(c, ya) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return ya;
        if (c.z1 <= this.z0 || c.z0 >= this.z1) return ya;

        if (ya > 0.0 && c.y1 <= this.y0) {
            let max = this.y0 - c.y1 - this.epsilon;
            if (max < ya) ya = max;
        }
        if (ya < 0.0 && c.y0 >= this.y1) {
            let max = this.y1 - c.y0 + this.epsilon;
            if (max > ya) ya = max;
        }
        return ya;
    }

    clipZCollide(c, za) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return za;
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return za;

        if (za > 0.0 && c.z1 <= this.z0) {
            let max = this.z0 - c.z1 - this.epsilon;
            if (max < za) za = max;
        }
        if (za < 0.0 && c.z0 >= this.z1) {
            let max = this.z1 - c.z0 + this.epsilon;
            if (max > za) za = max;
        }
        return za;
    }

    intersects(c) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return false;
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return false;
        return !(c.z1 <= this.z0) && !(c.z0 >= this.z1);
    }

    move(xa, ya, za) {
        this.x0 += xa; this.y0 += ya; this.z0 += za;
        this.x1 += xa; this.y1 += ya; this.z1 += za;
    }
}

export class JavaRandom {
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

export class PerlinNoiseFilter {
    constructor(levels) {
        this.levels = levels;
        this.fuzz = 16;
    }

    read(width, height, random) {
        if (!random) {
            random = new JavaRandom(Math.floor(Math.random() * 0x1000000000000));
        }

        const tmp = new Array(width * height).fill(0);
        const level = this.levels;

        let step = width >> level;
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                tmp[x + y * width] = (random.nextInt(256) - 128) * this.fuzz;
            }
        }

        for (step = width >> level; step > 1; step = Math.floor(step / 2)) {
            let val = 256 * (step << level);
            let ss = Math.floor(step / 2);

            for (let i = 0; i < height; i += step) {
                for (let x = 0; x < width; x += step) {
                    let ul = tmp[(x + 0) % width + ((i + 0) % height) * width];
                    let ur = tmp[(x + step) % width + ((i + 0) % height) * width];
                    let dl = tmp[(x + 0) % width + ((i + step) % height) * width];
                    let dr = tmp[(x + step) % width + ((i + step) % height) * width];

                    let m = Math.trunc((ul + dl + ur + dr) / 4) + random.nextInt(val * 2) - val;

                    tmp[x + ss + (i + ss) * width] = m;
                }
            }

            for (let i = 0; i < height; i += step) {
                for (let x = 0; x < width; x += step) {
                    let c = tmp[x + i * width];
                    let r = tmp[(x + step) % width + i * width];
                    let d = tmp[x + ((i + step) % height) * width];

                    let mu = tmp[((x + ss) & (width - 1)) + ((i + ss - step) & (height - 1)) * width];
                    let ml = tmp[((x + ss - step) & (width - 1)) + ((i + ss) & (height - 1)) * width];
                    let m = tmp[(x + ss) % width + ((i + ss) % height) * width];

                    let u = Math.trunc((c + r + m + mu) / 4) + random.nextInt(val * 2) - val;
                    let l = Math.trunc((c + d + m + ml) / 4) + random.nextInt(val * 2) - val;

                    tmp[x + ss + i * width] = u;
                    tmp[x + (i + ss) * width] = l;
                }
            }
        }

        const result = new Float32Array(width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                result[x + y * width] = Math.trunc(tmp[(x % width) + (y % height) * width] / 512) + 128;
            }
        }
        return result;
    }

    getHeightMap(x, y, w, h, seed, mapSize = 512) {
        let random;
        if (seed instanceof JavaRandom) {
            random = seed;
        } else if (typeof seed === 'number') {
            random = new JavaRandom(seed);
        } else {
            random = new JavaRandom(Math.floor(Math.random() * 0x1000000000000));
        }

        const fullMap = this.read(mapSize, mapSize, random);

        const result = new Float32Array(w * h);

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const sampleX = ((x + dx) % mapSize + mapSize) % mapSize;
                const sampleY = ((y + dy) % mapSize + mapSize) % mapSize;

                result[dx + dy * w] = fullMap[sampleX + sampleY * mapSize];
            }
        }

        return result;
    }
}

export class PerlinNoise2D {
    constructor(seed = 0) {
        this.p = new Int32Array(1024);
        this.init(seed);
    }

    init(seed) {
        const rand = new JavaRandom(seed);
        const perm = new Uint8Array(256);
        for (let i = 0; i < 256; i++) perm[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = rand.nextInt(i + 1);
            const temp = perm[i];
            perm[i] = perm[j];
            perm[j] = temp;
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = perm[i & 255];
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, z) {
        const h = hash & 7;
        const u = h < 4 ? x : z;
        const v = h < 4 ? z : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    eval(x, z) {
        const X = Math.floor(x) & 255;
        const Z = Math.floor(z) & 255;

        const xf = x - Math.floor(x);
        const zf = z - Math.floor(z);

        const u = this.fade(xf);
        const v = this.fade(zf);

        const aaa = this.p[this.p[X] + Z];
        const aba = this.p[this.p[X] + Z + 1];
        const baa = this.p[this.p[X + 1] + Z];
        const bba = this.p[this.p[X + 1] + Z + 1];

        const x1 = this.lerp(u, this.grad(aaa, xf, zf), this.grad(baa, xf - 1, zf));
        const x2 = this.lerp(u, this.grad(aba, xf, zf - 1), this.grad(bba, xf - 1, zf - 1));

        return this.lerp(v, x1, x2);
    }
}

export class OctaveNoise {
    constructor(octaves = 4, seed = 0) {
        this.octaves = [];
        for (let i = 0; i < octaves; i++) {
            this.octaves.push(new PerlinNoise2D(seed + i * 31));
        }
    }

    eval(x, z, scale = 0.01, persistence = 0.5) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < this.octaves.length; i++) {
            total += this.octaves[i].eval(x * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}

export function generateTextureAtlas(worldSeed) {
    const tileSize = 16;
    const padding = 1;
    const paddedSize = tileSize + padding * 2;
    const atlasCols = 8;
    const atlasRows = 8;

    const canvas = document.createElement('canvas');
    canvas.width = atlasCols * paddedSize;
    canvas.height = atlasRows * paddedSize;
    const ctx = canvas.getContext('2d');

    const textures = [
        { id: 1, col: 0, row: 0, type: 'grass_top' },
        { id: 2, col: 1, row: 0, type: 'grass_side' },
        { id: 3, col: 2, row: 0, type: 'dirt' },
        { id: 4, col: 3, row: 0, type: 'stone' },
        { id: 5, col: 4, row: 0, type: 'log_top' },
        { id: 6, col: 5, row: 0, type: 'log_side' },
        { id: 7, col: 6, row: 0, type: 'leaves' }
    ];

    textures.forEach(tex => {
        const rng = new JavaRandom(tex.id * worldSeed);

        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileSize;
        tileCanvas.height = tileSize;
        const tileCtx = tileCanvas.getContext('2d');
        const imgData = tileCtx.createImageData(tileSize, tileSize);
        const data = imgData.data;

        for (let y = 0; y < tileSize; y++) {
            for (let x = 0; x < tileSize; x++) {
                const idx = (y * tileSize + x) * 4;
                let r = 0, g = 0, b = 0, a = 255;

                const n1 = rng.nextFloat() - 0.5;
                const n2 = rng.nextFloat() - 0.5;

                // PŘESNĚJŠÍ VANILLA BAREVNÁ PALETA
                if (tex.type === 'dirt') {
                    r = 134 + n1 * 26;
                    g = 96 + n1 * 20 + n2 * 8;
                    b = 67 + n1 * 16;
                } else if (tex.type === 'grass_top') {
                    r = 89 + n1 * 20;
                    g = 168 + n1 * 30 + n2 * 12;
                    b = 61 + n1 * 18;
                } else if (tex.type === 'grass_side') {
                    const grassDepth = 3 + Math.floor((n1 + 0.5) * 2.5);
                    if (y < grassDepth || (y === grassDepth && rng.nextFloat() > 0.4)) {
                        r = 89 + n1 * 20;
                        g = 168 + n1 * 30;
                        b = 61 + n1 * 18;
                    } else {
                        r = 134 + n1 * 26;
                        g = 96 + n1 * 20;
                        b = 67 + n1 * 16;
                    }
                } else if (tex.type === 'stone') {
                    let val = 122 + n1 * 35;
                    if (rng.nextFloat() < 0.08) val -= 20;
                    if (rng.nextFloat() < 0.06) val += 20;
                    r = g = b = val;
                } else if (tex.type === 'log_top') {
                    const dx = x - 7.5;
                    const dy = y - 7.5;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist >= 6.8) {
                        r = 103 + n1 * 18;
                        g = 82 + n1 * 14;
                        b = 49 + n1 * 10;
                    } else if (Math.floor(dist) % 2 === 0) {
                        r = 160 + n1 * 18;
                        g = 130 + n1 * 14;
                        b = 80 + n1 * 10;
                    } else {
                        r = 190 + n1 * 18;
                        g = 155 + n1 * 14;
                        b = 95 + n1 * 10;
                    }
                } else if (tex.type === 'log_side') {
                    const verticalGrain = Math.sin(x * 1.2) * 12 + n1 * 25;
                    r = 103 + verticalGrain;
                    g = 82 + verticalGrain * 0.8;
                    b = 49 + verticalGrain * 0.6;
                } else if (tex.type === 'leaves') {
                    r = 50 + n1 * 20;
                    g = 120 + n1 * 35 + n2 * 15;
                    b = 35 + n1 * 18;
                    if (rng.nextFloat() < 0.15) {
                        a = 0;
                    }
                }

                data[idx] = Math.max(0, Math.min(255, r));
                data[idx + 1] = Math.max(0, Math.min(255, g));
                data[idx + 2] = Math.max(0, Math.min(255, b));
                data[idx + 3] = a;
            }
        }
        tileCtx.putImageData(imgData, 0, 0);

        const destX = tex.col * paddedSize + padding;
        const destY = tex.row * paddedSize + padding;
        ctx.drawImage(tileCanvas, destX, destY);

        ctx.drawImage(tileCanvas, 0, 0, tileSize, 1, destX, destY - 1, tileSize, 1);
        ctx.drawImage(tileCanvas, 0, tileSize - 1, tileSize, 1, destX, destY + tileSize, tileSize, 1);
        ctx.drawImage(tileCanvas, 0, 0, 1, tileSize, destX - 1, destY, 1, tileSize);
        ctx.drawImage(tileCanvas, tileSize - 1, 0, 1, tileSize, destX + tileSize, destY, 1, tileSize);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

    return texture;
}

export function getTileUVs(col, row) {
    const tileSize = 16;
    const padding = 1;
    const paddedSize = tileSize + padding * 2; // 18 px
    const atlasWidth = 8 * paddedSize;  // 144 px
    const atlasHeight = 8 * paddedSize; // 144 px

    const x = col * paddedSize + padding;
    const y = row * paddedSize + padding;

    const u0 = x / atlasWidth;
    const u1 = (x + tileSize) / atlasWidth;
    const v0 = 1 - (y + tileSize) / atlasHeight;
    const v1 = 1 - y / atlasHeight;

    return { u0, u1, v0, v1 };
}

export function getBlockFaceTile(tile, faceIdx) {
    if (tile === BLOCKS.GRASS) {
        if (faceIdx === 0) return { col: 0, row: 0 }; // Top
        if (faceIdx === 1) return { col: 2, row: 0 }; // Bottom
        return { col: 1, row: 0 };                     // Side
    }
    if (tile === BLOCKS.DIRT) return { col: 2, row: 0 };
    if (tile === BLOCKS.STONE) return { col: 3, row: 0 };
    if (tile === BLOCKS.LOG) {
        if (faceIdx === 0 || faceIdx === 1) return { col: 4, row: 0 };
        return { col: 5, row: 0 };
    }
    if (tile === BLOCKS.LEAVES) return { col: 6, row: 0 };
    return { col: 2, row: 0 };
}

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
    },
    "RenderState": {
        "Clear": 0,
        "MenuBackground": 1,
        "InGame": 2
    },
    "CursorType": {
        "Pointer": "pointer",
        "Default": "default",
        "Crosshair": "crosshair",
        "Grab": "grab",
        "None": "none"
    },
    "Color": {
        "SelectButtonColor": 0xF7FF88,
        "NormalButtonColor": 0xFFFFFF,
        "SelectTextColor": 0xFAFA00,
    },
    "Difficulty": {
        "Peaceful": 0,
        "Easy": 1,
        "Normal": 2,
        "Hard": 3
    },
    "Graphics": {
        "Fast": 0,
        "Fancy": 1
    },
    "RenderDistance": {
        "Tiny": 2,
        "Short": 4,
        "Normal": 8,
        "Far": 16
    },
    "Performance": {
        "PowerSaver": 0,
        "Balanced": 1,
        "MaxFPS": 2,
    },
    "GUIScale": {
        "Auto": 0,
        "Small": 1,
        "Normal": 2,
        "Large": 3
    },
    "Particles": {
        "Minimal": 0,
        "Decreased": 1,
        "All": 2,
    },
    "Controls": {
        "Q": "KeyQ",
        "W": "KeyW",
        "E": "KeyE",
        "R": "KeyR",
        "T": "KeyT",
        "Y": "KeyY",
        "U": "KeyU",
        "I": "KeyI",
        "O": "KeyO",
        "P": "KeyP",
        "A": "KeyA",
        "S": "KeyS",
        "D": "KeyD",
        "F": "KeyF",
        "G": "KeyG",
        "H": "KeyH",
        "J": "KeyJ",
        "K": "KeyK",
        "L": "KeyL",
        "Z": "KeyZ",
        "X": "KeyX",
        "C": "KeyC",
        "V": "KeyV",
        "B": "KeyB",
        "N": "KeyN",
        "M": "KeyM",
        "SPACE": "Space",
        "BACKSPACE": "Backspace",
        "ENTER": "Enter",
        "LSHIFT": "LeftShift",
        "RSHIFT": "RightShift",
        "LCONTROL": "LeftControl",
        "RCONTROL": "RightControl",
        "ESCAPE": "Esc",
        "TAB": "Tab",
        "Button1": "Mouse_Button_0",
        "Button2": "Mouse_Button_2",
        "Button3": "Mouse_Button_1",
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