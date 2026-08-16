import { Entity } from '../Entity.js';

export class Player extends Entity {
    constructor(level) {
        super(level);

        this.level = level;

        this.heightOffset = 1.62;

        this.keys = {};

        // Store bound handlers so we can remove them in destroy().
        // Without this, every regenerate leaks 2 window listeners (keydown +
        // keyup) that keep firing on every key event forever, holding a
        // reference to the old Player instance and preventing GC.
        this._onKeyDown = (e) => this.keys[e.code] = true;
        this._onKeyUp = (e) => this.keys[e.code] = false;
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        this.resetPos();
    }

    /**
     * Remove window event listeners so this Player can be garbage-collected.
     * Called from Minecraft.generateNewLevel() before creating a new Player.
     */
    destroy() {
        if (this._onKeyDown) {
            window.removeEventListener('keydown', this._onKeyDown);
            this._onKeyDown = null;
        }
        if (this._onKeyUp) {
            window.removeEventListener('keyup', this._onKeyUp);
            this._onKeyUp = null;
        }
    }

    resetPos() {
        if (this.level == null) return;
        let x = this.level.xSpawn + 0.5;
        let y = this.level.ySpawn;
        let z = this.level.zSpawn + 0.5;

        if (y <= 0) {
            y = this.level.getWaterLevel() + 2;
        }
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

    tick(camera) {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;
        this.xRotO = this.xRot;
        this.yRotO = this.yRot;

        let xa = 0;
        let za = 0;

        const inWater = this.isInWater();
        const inLava = this.isInLava();

        if (this.keys['KeyR'] && !this._prevKeyR) this.resetPos();
        this._prevKeyR = this.keys['KeyR'];

        if (this.keys['ArrowUp'] || this.keys['KeyW']) za -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) za += 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) xa -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) xa += 1;

        if (this.keys['Space']) {
            if (inWater) {
                this.yd += 0.04;
            } else if (inLava) {
                this.yd += 0.04;
            } else if (this.onGround) {
                this.yd = 0.42;
            }
        }

        if (inWater) {
            const yo = this.y;
            this.moveRelative(xa, za, 0.02);
            this.move(this.xd, this.yd, this.zd);
            this.xd *= 0.8;
            this.yd *= 0.8;
            this.zd *= 0.8;
            this.yd = (this.yd - 0.02);
            if (this.horizontalCollision && this.isFree(this.xd, this.yd + 0.6 - this.y + yo, this.zd))
                this.yd = 0.3;
        } else if (inLava) {
            const yo = this.y;
            this.moveRelative(xa, za, 0.02);
            this.move(this.xd, this.yd, this.zd);
            this.xd *= 0.5;
            this.yd *= 0.5;
            this.zd *= 0.5;
            this.yd = (this.yd - 0.02);
            if (this.horizontalCollision && this.isFree(this.xd, this.yd + 0.6 - this.y + yo, this.zd))
                this.yd = 0.3;
        } else {
            this.moveRelative(xa, za, this.onGround ? 0.1 : 0.02);
            this.move(this.xd, this.yd, this.zd);
            this.xd *= 0.91;
            this.yd *= 0.98;
            this.zd *= 0.91;
            this.yd = (this.yd - 0.08);
            if (this.onGround) {
                this.xd *= 0.6;
                this.zd *= 0.6;
            }
        }
    }

    releaseAllKeys() {
        for (const key in this.keys) {
            this.keys[key] = false;
        }
        this._jumpPending = false;
    }

    setKey(keyCode, state) {
        if (keyCode === 'KeyW' || keyCode === 'ArrowUp') this.keys['ArrowUp'] = state;
        if (keyCode === 'KeyS' || keyCode === 'ArrowDown') this.keys['ArrowDown'] = state;
        if (keyCode === 'KeyA' || keyCode === 'ArrowLeft') this.keys['ArrowLeft'] = state;
        if (keyCode === 'KeyD' || keyCode === 'ArrowRight') this.keys['ArrowRight'] = state;
        if (keyCode === 'Space') this.keys['Space'] = state;
    }
}