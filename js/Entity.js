import { AABB } from './phys/AABB.js';

export class Entity {
    constructor(level) {
        this.level = level;

        this.xo = 0;
        this.yo = 0;
        this.zo = 0;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.heightOffset = 0;

        this.xd = 0;
        this.yd = 0;
        this.zd = 0;

        this.yRot = 0;
        this.xRot = 0;
        this.yRotO = 0;
        this.xRotO = 0;

        this.bb = null;
        this.onGround = false;
        this.horizontalCollision = false;

        this.removed = false;

        this.bbWidth = 0.6;
        this.bbHeight = 1.8;

        this.makeStepSound = true;
    }

    resetPos() {
        if (this.level == null) return;
        let x = this.level.xSpawn + 0.5;
        let y = this.level.ySpawn;
        let z = this.level.zSpawn + 0.5;
        while (y > 0) {
            this.setPos(x, y, z);
            if (this.level.getCubes(this.bb).length !== 0) {
                y++;
            } else {
                break;
            }
        }
        this.xd = 0;
        this.yd = 0;
        this.zd = 0;
        this.yRot = this.level.rotSpawn || 0;
        this.xRot = 0;
    }

    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        const w = this.bbWidth / 2.0;
        const h = this.bbHeight / 2.0;
        this.bb = new AABB(x - w, y - h, z - w, x + w, y + h, z + w);
    }

    remove() {
        this.removed = true;
    }

    setSize(w, h) {
        this.bbWidth = w;
        this.bbHeight = h;
    }

    turn(xo, yo) {
        const prevXRot = this.xRot;
        const prevYRot = this.yRot;
        this.yRot = (this.yRot + xo * 0.15);
        this.xRot = (this.xRot - yo * 0.15);
        if (this.xRot < -90.0)
            this.xRot = -90.0;
        if (this.xRot > 90.0)
            this.xRot = 90.0;
        this.xRotO += this.xRot - prevXRot;
        this.yRotO += this.yRot - prevYRot;
    }

    interpolateTurn(xo, yo) {
        this.yRot = (this.yRot + xo * 0.15);
        this.xRot = (this.xRot - yo * 0.15);
        if (this.xRot < -90.0)
            this.xRot = -90.0;
        if (this.xRot > 90.0)
            this.xRot = 90.0;
    }

    isFree(xa, ya, za) {
        const box = this.bb.cloneMove(xa, ya, za);
        const aABBs = this.level.getCubes(box);
        if (aABBs.length > 0) return false;
        if (this.level.containsAnyLiquid(box)) return false;

        return true;
    }

    isInWater() {
        return this.level.containsLiquid(this.bb.grow(0.0, -0.4, 0.0), 1);
    }

    isInLava() {
        return this.level.containsLiquid(this.bb.grow(0.0, -0.4, 0.0), 2);
    }

    tick() {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;
        this.xRotO = this.xRot;
        this.yRotO = this.yRot;
    }

    move(xa, ya, za) {
        let xaOrg = xa;
        let yaOrg = ya;
        let zaOrg = za;

        const aABBs = this.level.getCubes(this.bb.expand(xa, ya, za));

        for (let i = 0; i < aABBs.length; i++) {
            ya = aABBs[i].clipYCollide(this.bb, ya);
        }
        this.bb.move(0, ya, 0);

        for (let i = 0; i < aABBs.length; i++) {
            xa = aABBs[i].clipXCollide(this.bb, xa);
        }
        this.bb.move(xa, 0, 0);

        for (let i = 0; i < aABBs.length; i++) {
            za = aABBs[i].clipZCollide(this.bb, za);
        }
        this.bb.move(0, 0, za);

        this.horizontalCollision = !(xaOrg == xa && zaOrg == za);
        this.onGround = (yaOrg !== ya && yaOrg < 0.0);

        if (xaOrg !== xa) this.xd = 0;
        if (yaOrg !== ya) this.yd = 0;
        if (zaOrg !== za) this.zd = 0;

        this.x = (this.bb.x0 + this.bb.x1) / 2;
        this.y = this.bb.y0 + this.heightOffset;
        this.z = (this.bb.z0 + this.bb.z1) / 2;
    }

    moveRelative(xa, za, speed) {
        let dist = xa * xa + za * za;
        if (dist < 0.01)
            return;
        dist = Math.sqrt(dist);
        if (dist < 1.0) dist = 1.0;
        dist = speed / dist;
        xa *= dist;
        za *= dist;

        let sin = Math.sin(this.yRot * Math.PI / 180);
        let cos = Math.cos(this.yRot * Math.PI / 180);
        this.xd += xa * cos + za * sin;
        this.zd += -xa * sin + za * cos;
    }

    isLit(isHumanoid = false) {
        const xTile = Math.floor(this.x);
        const yTile = Math.floor(this.y);
        const zTile = Math.floor(this.z);
        if (isHumanoid) {
            return (this.level.isLit(xTile, yTile, zTile) || this.level.isLit(xTile, yTile + 1, zTile));
        } else {
            return (this.level.isLit(xTile, yTile, zTile));
        }
    }

    getBrightness() {
        const xTile = Math.floor(this.x);
        const yTile = Math.floor(this.y + this.heightOffset / 2);
        const zTile = Math.floor(this.z);
        return this.level.getBrightness(xTile, yTile, zTile);
    }

    moveTo(x, y, z, yRot, xRot) {
        this.xo = this.x = x;
        this.yo = this.y = y;
        this.zo = this.z = z;
        this.yRot = yRot;
        this.xRot = xRot;
        this.setPos(x, y, z);
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    setLevel(level) {
        this.level = level;
    }
}