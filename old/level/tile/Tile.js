import { AABB } from '../../phys/AABB.js';

export class Tile {
    static tiles = new Array(256).fill(null);

    static NOT_LIQUID = 0;
    static LIQUID_WATER = 1;
    static LIQUID_LAVA = 2;

    constructor(id, tex) {
        this.level = null;
        this.id = id;
        this.tex = tex;
        Tile.tiles[id] = this;
        this.shouldTick = false;
        this.xx0 = 0;
        this.yy0 = 0;
        this.zz0 = 0;
        this.xx1 = 0;
        this.yy1 = 0;
        this.zz1 = 0;
        this.setShape(0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
    }

    setTicking(tick) {
        this.shouldTick = tick;
    }

    setShape(x0, y0, z0, x1, y1, z1) {
        this.xx0 = x0;
        this.yy0 = y0;
        this.zz0 = z0;
        this.xx1 = x1;
        this.yy1 = y1;
        this.zz1 = z1;
    }

    render(t, level, layer, x, y, z) {
        this.level = level;
        const c1 = 1.0;
        const c2 = 0.8;
        const c3 = 0.6;
        if (this.shouldRenderFace(level, x, y - 1, z, layer, 0)) {
            t.color(c1, c1, c1);
            this.renderFace(t, x, y, z, 0);
        }
        if (this.shouldRenderFace(level, x, y + 1, z, layer, 1)) {
            t.color(c1, c1, c1);
            this.renderFace(t, x, y, z, 1);
        }
        if (this.shouldRenderFace(level, x, y, z - 1, layer, 2)) {
            t.color(c2, c2, c2);
            this.renderFace(t, x, y, z, 2);
        }
        if (this.shouldRenderFace(level, x, y, z + 1, layer, 3)) {
            t.color(c2, c2, c2);
            this.renderFace(t, x, y, z, 3);
        }
        if (this.shouldRenderFace(level, x - 1, y, z, layer, 4)) {
            t.color(c3, c3, c3);
            this.renderFace(t, x, y, z, 4);
        }
        if (this.shouldRenderFace(level, x + 1, y, z, layer, 5)) {
            t.color(c3, c3, c3);
            this.renderFace(t, x, y, z, 5);
        }
    }

    renderFace(t, x, y, z, face, nbmode = false) {
        if (!nbmode) {
            let brightness = 1.0;
            if (face === 0) brightness = this.getBrightness(this.level, x, y - 1, z) * 0.5;
            if (face === 1) brightness = this.getBrightness(this.level, x, y + 1, z) * 1.0;
            if (face === 2) brightness = this.getBrightness(this.level, x, y, z - 1) * 0.8;
            if (face === 3) brightness = this.getBrightness(this.level, x, y, z + 1) * 0.8;
            if (face === 4) brightness = this.getBrightness(this.level, x - 1, y, z) * 0.6;
            if (face === 5) brightness = this.getBrightness(this.level, x + 1, y, z) * 0.6;
            t.color(brightness, brightness, brightness);
        }

        const tex = this.getTexture(face);

        const texOff = (tex % 16) * 16;
        const u1 = (texOff + 15.99) / 256.0; const u0 = texOff / 256.0;
        const texOffV = Math.floor(tex / 16) * 16;
        const v1 = (texOffV + 15.99) / 256.0; const v0 = texOffV / 256.0;

        const x0 = x + this.xx0;
        const x1 = x + this.xx1;
        const y0 = y + this.yy0;
        const y1 = y + this.yy1;
        const z0 = z + this.zz0;
        const z1 = z + this.zz1;

        if (face == 0) {
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x0, y0, z0, u0, v0);
            t.vertexUV(x1, y0, z0, u1, v0);
            t.vertexUV(x1, y0, z1, u1, v1);
        }
        if (face == 1) {
            t.vertexUV(x1, y1, z1, u1, v1);
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y1, z1, u0, v1);
        }
        if (face == 2) {
            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z0, u0, v0);
            t.vertexUV(x1, y0, z0, u0, v1);
            t.vertexUV(x0, y0, z0, u1, v1);
        }
        if (face == 3) {
            t.vertexUV(x0, y1, z1, u0, v0);
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x1, y1, z1, u1, v0);
        }
        if (face == 4) {
            t.vertexUV(x0, y1, z1, u1, v0);
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y0, z0, u0, v1);
            t.vertexUV(x0, y0, z1, u1, v1);
        }
        if (face == 5) {
            t.vertexUV(x1, y0, z1, u0, v1);
            t.vertexUV(x1, y0, z0, u1, v1);
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z1, u0, v0);
        }
    }

    renderBackFace(t, x, y, z, face, nbmode = false) {
        if (!nbmode) {
            let brightness = 1.0;
            if (face === 0) brightness = this.getBrightness(this.level, x, y - 1, z) * 0.5;
            if (face === 1) brightness = this.getBrightness(this.level, x, y + 1, z) * 1.0;
            if (face === 2) brightness = this.getBrightness(this.level, x, y, z - 1) * 0.8;
            if (face === 3) brightness = this.getBrightness(this.level, x, y, z + 1) * 0.8;
            if (face === 4) brightness = this.getBrightness(this.level, x - 1, y, z) * 0.6;
            if (face === 5) brightness = this.getBrightness(this.level, x + 1, y, z) * 0.6;
            t.color(brightness, brightness, brightness);
        }

        const tex = this.getTexture(face);

        const texOff = (tex % 16) * 16;
        const u1 = (texOff + 15.99) / 256.0; const u0 = texOff / 256.0;
        const texOffV = Math.floor(tex / 16) * 16;
        const v1 = (texOffV + 15.99) / 256.0; const v0 = texOffV / 256.0;

        const x0 = x + this.xx0;
        const x1 = x + this.xx1;
        const y0 = y + this.yy0;
        const y1 = y + this.yy1;
        const z0 = z + this.zz0;
        const z1 = z + this.zz1;

        if (face == 0) {
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x1, y0, z0, u1, v0);
            t.vertexUV(x0, y0, z0, u0, v0);
            t.vertexUV(x0, y0, z1, u0, v1);
        }
        if (face == 1) {
            t.vertexUV(x0, y1, z1, u0, v1);
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z1, u1, v1);
        }
        if (face == 2) {
            t.vertexUV(x0, y0, z0, u1, v1);
            t.vertexUV(x1, y0, z0, u0, v1);
            t.vertexUV(x1, y1, z0, u0, v0);
            t.vertexUV(x0, y1, z0, u1, v0);
        }
        if (face == 3) {
            t.vertexUV(x1, y1, z1, u1, v0);
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x0, y1, z1, u0, v0);
        }
        if (face == 4) {
            t.vertexUV(x0, y0, z1, u1, v1);
            t.vertexUV(x0, y0, z0, u0, v1);
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y1, z1, u1, v0);
        }
        if (face == 5) {
            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x1, y0, z0, u1, v1);
            t.vertexUV(x1, y0, z1, u0, v1);
        }
    }

    renderFaceNoTexture(t, x, y, z, face, nbmode = false) {
        if (!nbmode) {
            let brightness = 1.0;
            if (face === 0) brightness = this.getBrightness(this.level, x, y - 1, z) * 0.5;
            if (face === 1) brightness = this.getBrightness(this.level, x, y + 1, z) * 1.0;
            if (face === 2) brightness = this.getBrightness(this.level, x, y, z - 1) * 0.8;
            if (face === 3) brightness = this.getBrightness(this.level, x, y, z + 1) * 0.8;
            if (face === 4) brightness = this.getBrightness(this.level, x - 1, y, z) * 0.6;
            if (face === 5) brightness = this.getBrightness(this.level, x + 1, y, z) * 0.6;
            t.color(brightness, brightness, brightness);
        }

        const x0 = x + this.xx0;
        const x1 = x + this.xx1;
        const y0 = y + this.yy0;
        const y1 = y + this.yy1;
        const z0 = z + this.zz0;
        const z1 = z + this.zz1;

        if (face == 0) {
            t.vertex(x0, y0, z1);
            t.vertex(x0, y0, z0);
            t.vertex(x1, y0, z0);
            t.vertex(x1, y0, z1);
        }
        if (face == 1) {
            t.vertex(x1, y1, z1);
            t.vertex(x1, y1, z0);
            t.vertex(x0, y1, z0);
            t.vertex(x0, y1, z1);
        }
        if (face == 2) {
            t.vertex(x0, y1, z0);
            t.vertex(x1, y1, z0);
            t.vertex(x1, y0, z0);
            t.vertex(x0, y0, z0);
        }
        if (face == 3) {
            t.vertex(x0, y1, z1);
            t.vertex(x0, y0, z1);
            t.vertex(x1, y0, z1);
            t.vertex(x1, y1, z1);
        }
        if (face == 4) {
            t.vertex(x0, y1, z1);
            t.vertex(x0, y1, z0);
            t.vertex(x0, y0, z0);
            t.vertex(x0, y0, z1);
        }
        if (face == 5) {
            t.vertex(x1, y0, z1);
            t.vertex(x1, y0, z0);
            t.vertex(x1, y1, z0);
            t.vertex(x1, y1, z1);
        }
    }

    addQuad(t, x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3, x4, y4, z4, u4, v4) {
        t.tex(u1, v1); t.vertex(x1, y1, z1);
        t.tex(u2, v2); t.vertex(x2, y2, z2);
        t.tex(u3, v3); t.vertex(x3, y3, z3);

        t.tex(u1, v1); t.vertex(x1, y1, z1);
        t.tex(u3, v3); t.vertex(x3, y3, z3);
        t.tex(u4, v4); t.vertex(x4, y4, z4);
    }

    shouldRenderFace(level, x, y, z, layer, face) {
        if (layer === 1) return false;
        return !level.isSolidTile(x, y, z);
    }

    getBrightness(level, x, y, z) {
        return level.getBrightness(x, y, z);
    }

    getTexture(face) {
        return this.tex;
    }

    getAABB(x, y, z) {
        return new AABB(x, y, z, x + 1, y + 1, z + 1);
    }

    blocksLight() {
        return true;
    }

    isSolid() {
        return true;
    }

    mayPick() {
        return true;
    }

    tick(level, x, y, z, random) { }

    neighborChanged(level, x, y, z, type) { }

    getLiquidType() {
        return 0;
    }

    getTickDelay() {
        return 0;
    }

    destroy(level, x, y, z, particleEngine) {
        const SD = 4;
        for (let xx = 0; xx < SD; xx++) {
            for (let yy = 0; yy < SD; yy++) {
                for (let zz = 0; zz < SD; zz++) {
                    const xp = x + (xx + 0.5) / SD;
                    const yp = y + (yy + 0.5) / SD;
                    const zp = z + (zz + 0.5) / SD;

                    particleEngine.add(
                        xp, yp, zp,
                        xp - x - 0.5, yp - y - 0.5, zp - z - 0.5,
                        this.id
                    );
                }
            }
        }
    }
}

class DirtTile extends Tile {
    constructor(id, tex) {
        super(id, tex);
    }
}

class GrassTile extends Tile {
    constructor(id) {
        super(id);
        this.tex = 3;
    }

    getTexture(face) {
        if (face === 1) return 0;
        if (face === 0) return 2;
        return 3;
    }

    tick(level, x, y, z, random) {
        if (!level.isLit(x, y, z)) {
            level.setBlock(x, y, z, Tile.dirt.id);
        } else {
            for (let i = 0; i < 4; i++) {

                const xt = x + random.nextInt(3) - 1;
                const yt = y + random.nextInt(5) - 3;
                const zt = z + random.nextInt(3) - 1;

                if (level.getTile(xt, yt, zt) === Tile.dirt.id && level.isLit(xt, yt, zt)) {
                    level.setBlock(xt, yt, zt, Tile.grass.id);
                }
            }
        }
    }
}

class BushTile extends Tile {
    constructor(id) {
        super(id);
        this.tex = 15;
    }

    tick(level, x, y, z, random) {
        const below = level.getTile(x, y - 1, z);

        if (!level.isLit(x, y, z) || (below !== Tile.dirt.id && below !== Tile.grass.id)) {
            level.setTile(x, y, z, 0);
        }
    }

    render(t, level, layer, x, y, z) {
        if (level.isLit(x, y, z) ^ layer !== 1) {
            return;
        }

        const tex = this.getTexture(15);
        const u0 = (tex % 16) / 16.0;
        const u1 = u0 + 0.0624375;
        const v0 = Math.floor(tex / 16) / 16.0;
        const v1 = v0 + 0.0624375;

        const rots = 2;
        t.color(1.0, 1.0, 1.0);

        for (let r = 0; r < rots; r++) {
            const xa = Math.sin((r * Math.PI) / rots + 0.7853981633974483) * 0.5;
            const za = Math.cos((r * Math.PI) / rots + 0.7853981633974483) * 0.5;

            const x0 = x + 0.5 - xa;
            const x1 = x + 0.5 + xa;
            const y0 = y + 0.0;
            const y1 = y + 1.0;
            const z0 = z + 0.5 - za;
            const z1 = z + 0.5 + za;

            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x1, y0, z1, u0, v1);
            t.vertexUV(x0, y0, z0, u1, v1);

            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x0, y0, z0, u1, v1);
            t.vertexUV(x1, y0, z1, u0, v1);
        }
    }

    getAABB(x, y, z) {
        return null;
    }

    blocksLight() {
        return false;
    }

    isSolid() {
        return false;
    }
}

class PlantTile extends Tile {
    constructor(id, tex) {
        super(id);
        this.tex = tex;
        this.setTicking(true);
    }

    tick(level, x, y, z, random) {
        const below = level.getTile(x, y - 1, z);
        if (!level.isLit(x, y, z) || (below !== Tile.dirt.id && below !== Tile.grass.id)) {
            level.setTile(x, y, z, 0);
        }
    }

    render(t, level, layer, x, y, z) {
        if (level.isLit(x, y, z) ^ layer !== 1) {
            return;
        }

        const tex = this.getTexture(15);
        const u0 = (tex % 16) / 16.0;
        const u1 = u0 + 0.0624375;
        const v0 = Math.floor(tex / 16) / 16.0;
        const v1 = v0 + 0.0624375;

        const rots = 2;
        t.color(1.0, 1.0, 1.0);

        for (let r = 0; r < rots; r++) {
            const xa = Math.sin((r * Math.PI) / rots + 0.7853981633974483) * 0.5;
            const za = Math.cos((r * Math.PI) / rots + 0.7853981633974483) * 0.5;

            const x0 = x + 0.5 - xa;
            const x1 = x + 0.5 + xa;
            const y0 = y + 0.0;
            const y1 = y + 1.0;
            const z0 = z + 0.5 - za;
            const z1 = z + 0.5 + za;

            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x1, y0, z1, u0, v1);
            t.vertexUV(x0, y0, z0, u1, v1);

            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x0, y0, z0, u1, v1);
            t.vertexUV(x1, y0, z1, u0, v1);
        }
    }

    getAABB(x, y, z) {
        return null;
    }

    blocksLight() {
        return false;
    }

    isSolid() {
        return false;
    }
}

class LeavesTile extends Tile {
    constructor(id) {
        super(id, 22);
    }

    shouldRenderFace(level, x, y, z, layer, face) {
        return super.shouldRenderFace(level, x, y, z, layer, face);
    }

    blocksLight() { return false; }
    isSolid() { return false; }
}

class GlassTile extends Tile {
    constructor(id) {
        super(id, 49);
    }

    shouldRenderFace(level, x, y, z, layer, face) {
        const tileId = level.getTile(x, y, z);
        if (tileId === this.id) return false;
        return super.shouldRenderFace(level, x, y, z, layer, face);
    }

    blocksLight() { return false; }
    isSolid() { return false; }
}

class LogTile extends Tile {
    constructor(id) {
        super(id);
        this.tex = 20;
    }

    getTexture(face) {
        if (face === 0 || face === 1) return 21;
        return 20;
    }
}

class SpongeTile extends Tile {
    constructor(id) {
        super(id, 48);
    }

    onPlace(level, x, y, z) {
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                for (let dz = -2; dz <= 2; dz++) {
                    if (level.isWater(x + dx, y + dy, z + dz)) {
                        level.setTileNoNeighborChange(x + dx, y + dy, z + dz, 0);
                    }
                }
            }
        }
    }

    onRemove(level, x, y, z) {
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                for (let dz = -2; dz <= 2; dz++) {
                    const nx = x + dx, ny = y + dy, nz = z + dz;
                    level.updateNeighborsAt(nx, ny, nz, level.getTile(nx, ny, nz));
                }
            }
        }
    }
}

class FallingTile extends Tile {
    constructor(id, tex) {
        super(id, tex);
    }

    neighborChanged(level, x, y, z, type) {
        this.tryFall(level, x, y, z);
    }

    onPlace(level, x, y, z) {
        this.tryFall(level, x, y, z);
    }

    tryFall(level, x, y, z) {
        let newY = y;
        while (newY > 0) {
            const belowId = level.getTile(x, newY - 1, z);
            const belowTile = Tile.tiles[belowId];
            if (belowId !== 0 && (!belowTile || belowTile.getLiquidType() === 0)) {
                break;
            }
            newY--;
        }
        if (newY !== y) {
            level.swap(x, y, z, x, newY, z);
        }
    }
}

class LiquidTile extends Tile {
    constructor(id, liquidType) {
        super(id);
        this.liquidType = liquidType;

        this.tex = 14;
        if (liquidType == 2) this.tex = 30;

        this.tileId = id;
        this.calmTileId = id + 1;

        this.dd = 0.1;

        super.setShape(0.01, 0.0 - this.dd + 0.01, 0.01, 0.01 + 1.0, 1.0 - this.dd + 0.01, 0.01 + 1.0);
        super.setTicking(true);
    }

    onPlace(level, x, y, z) {
        level.addToTickNextTick(x, y, z, this.tileId);
    }

    tick(level, x, y, z, random) {
        let hasChanged = false;

        let belowY = y;
        while (level.getTile(x, --belowY, z) === 0 && this.canFlowTo(level, x, belowY, z)) {
            if (level.setTile(x, belowY, z, this.tileId)) {
                hasChanged = true;
            }
            if (this.liquidType !== Tile.LIQUID_WATER) break;
        }
        belowY++;

        if (this.liquidType === Tile.LIQUID_WATER || !hasChanged) {
            hasChanged |= this.flowTo(level, x - 1, belowY, z);
            hasChanged |= this.flowTo(level, x + 1, belowY, z);
            hasChanged |= this.flowTo(level, x, belowY, z - 1);
            hasChanged |= this.flowTo(level, x, belowY, z + 1);
        }

        if (!hasChanged) {
            level.setTileNoUpdate(x, belowY, z, this.calmTileId);
        } else {
            level.addToTickNextTick(x, belowY, z, this.tileId);
        }
    }

    canFlowTo(level, x, y, z) {
        if (this.liquidType === Tile.LIQUID_WATER) {
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dz = -2; dz <= 2; dz++) {
                        if (level.getTile(x + dx, y + dy, z + dz) === Tile.sponge.id) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    flowTo(level, x, y, z) {
        const type = level.getTile(x, y, z);
        if (type === 0) {
            if (!this.canFlowTo(level, x, y, z)) return false;
            if (level.setTile(x, y, z, this.tileId)) {
                level.addToTickNextTick(x, y, z, this.tileId);
            }
        }
        return false;
    }

    shouldRenderFace(level, x, y, z, layer, face) {
        if (x < 0 || y < 0 || z < 0 || x >= level.width || z >= level.height)
            return false;

        if (layer !== 1 && this.liquidType === Tile.LIQUID_WATER) return false;

        const neighborId = level.getTile(x, y, z);
        if (neighborId === this.tileId || neighborId === this.calmTileId) return false;

        if (face === 1 && (
            level.getTile(x - 1, y, z) === 0 ||
            level.getTile(x + 1, y, z) === 0 ||
            level.getTile(x, y, z - 1) === 0 ||
            level.getTile(x, y, z + 1) === 0
        )) {
            return true;
        }

        return !level.isSolidTile(x, y, z);
    }

    renderFace(t, x, y, z, face) {
        super.renderFace(t, x, y, z, face);
        this.renderBackFace(t, x, y, z, face);
    }

    getBrightness(level, x, y, z) {
        if (this.liquidType === Tile.LIQUID_LAVA) return 1.0;
        return level.getBrightness(x, y, z);
    }

    mayPick() { return false; }
    blocksLight() { return true; }
    isSolid() { return false; }
    getLiquidType() { return this.liquidType; }
    getAABB(x, y, z) { return null; }

    getTickDelay() {
        return this.liquidType === Tile.LIQUID_LAVA ? 5 : 0;
    }

    neighborChanged(level, x, y, z, type) {
        if (type !== 0) {
            const neighborTile = Tile.tiles[type];
            if (neighborTile != null) {
                const neighborLiquid = neighborTile.getLiquidType();
                if ((this.liquidType === Tile.LIQUID_WATER && neighborLiquid === Tile.LIQUID_LAVA) ||
                    (this.liquidType === Tile.LIQUID_LAVA && neighborLiquid === Tile.LIQUID_WATER)) {
                    level.setTile(x, y, z, Tile.rock.id);
                    return;
                }
            }
        }
        level.addToTickNextTick(x, y, z, type);
    }
}

class CalmLiquidTile extends LiquidTile {
    constructor(id, liquidType) {
        super(id, liquidType);
        this.tileId = id - 1;
        this.calmTileId = id;
        this.shouldTick = false;
    }

    tick(level, x, y, z, random) { }

    neighborChanged(level, x, y, z, type) {
        let hasAirNeighbor = false;
        if (level.getTile(x - 1, y, z) === 0) hasAirNeighbor = true;
        if (level.getTile(x + 1, y, z) === 0) hasAirNeighbor = true;
        if (level.getTile(x, y, z - 1) === 0) hasAirNeighbor = true;
        if (level.getTile(x, y, z + 1) === 0) hasAirNeighbor = true;
        if (level.getTile(x, y - 1, z) === 0) hasAirNeighbor = true;

        if (type !== 0) {
            const neighborTile = Tile.tiles[type];
            if (neighborTile != null) {
                const neighborLiquid = neighborTile.getLiquidType();
                if ((this.liquidType === Tile.LIQUID_WATER && neighborLiquid === Tile.LIQUID_LAVA) ||
                    (this.liquidType === Tile.LIQUID_LAVA && neighborLiquid === Tile.LIQUID_WATER)) {
                    level.setTile(x, y, z, Tile.rock.id);
                    return;
                }
            }
        }

        if (hasAirNeighbor) {
            level.setTileNoUpdate(x, y, z, this.tileId);
            level.addToTickNextTick(x, y, z, this.tileId);
        }
    }
}

Tile.empty = null;
Tile.rock = new Tile(1, 1);                 // Stone
Tile.grass = new GrassTile(2);              // Grass
Tile.dirt = new DirtTile(3, 2);             // Dirt
Tile.cobblestone = new Tile(4, 16);         // Cobblestone
Tile.wood = new Tile(5, 4);                 // Planks/Oak Planks
Tile.bush = new BushTile(6);                // Sapling (kept as BushTile)
Tile.unbreakable = new Tile(7, 17);         // Bedrock
Tile.water = new LiquidTile(8, 1);          // Water (flowing)
Tile.calmWater = new CalmLiquidTile(9, 1);  // Water (still)
Tile.lava = new LiquidTile(10, 2);          // Lava (flowing)
Tile.calmLava = new CalmLiquidTile(11, 2);  // Lava (still)
Tile.sand = new FallingTile(12, 18);        // Sand (falls)
Tile.gravel = new FallingTile(13, 19);      // Gravel (falls)
Tile.goldOre = new Tile(14, 32);            // Gold Ore
Tile.ironOre = new Tile(15, 33);            // Iron Ore
Tile.coalOre = new Tile(16, 34);            // Coal Ore
Tile.log = new LogTile(17);                 // Log/Tree Trunk
Tile.leaves = new LeavesTile(18);           // Leaves
Tile.sponge = new SpongeTile(19);           // Sponge
Tile.glass = new GlassTile(20);             // Glass
// Wool colors (IDs 21-36, texture indices 64-79)
Tile.woolWhite = new Tile(21, 64);          // White Wool
Tile.woolOrange = new Tile(22, 65);         // Orange Wool
Tile.woolMagenta = new Tile(23, 66);        // Magenta Wool
Tile.woolLightBlue = new Tile(24, 67);      // Light Blue Wool
Tile.woolYellow = new Tile(25, 68);         // Yellow Wool
Tile.woolLightGreen = new Tile(26, 69);     // Light Green Wool
Tile.woolPink = new Tile(27, 70);           // Pink Wool
Tile.woolGray = new Tile(28, 71);           // Gray Wool
Tile.woolLightGray = new Tile(29, 72);      // Light Gray Wool
Tile.woolCyan = new Tile(30, 73);           // Cyan Wool
Tile.woolPurple = new Tile(31, 74);         // Purple Wool
Tile.woolBlue = new Tile(32, 75);           // Blue Wool
Tile.woolBrown = new Tile(33, 76);          // Brown Wool
Tile.woolGreen = new Tile(34, 77);          // Green Wool
Tile.woolRed = new Tile(35, 78);            // Red Wool
Tile.woolBlack = new Tile(36, 79);          // Black Wool
// Flowers and Mushrooms (IDs 37-40)
Tile.yellowFlower = new PlantTile(37, 13);  // Yellow Flower
Tile.redRose = new PlantTile(38, 12);       // Red Rose
Tile.brownMushroom = new PlantTile(39, 29); // Brown Mushroom
Tile.redMushroom = new PlantTile(40, 28);   // Red Mushroom
// Gold Block
Tile.goldBlock = new Tile(41, 40);          // Gold Block