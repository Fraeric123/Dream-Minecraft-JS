import { AABB } from "./Util.js";
import { CHUNK_HEIGHT, CHUNK_SIZE, BLOCKS } from "./Game.js";

export class Player {
    constructor(x, y, z) {
        this.width = 0.6;
        this.height = 1.8;
        this.eyeHeight = 1.62;

        this.x = x;
        this.y = y;
        this.z = z;

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        this.speed = 7;
        this.flySpeed = 12;
        this.sprintMultiplier = 1.4;
        this.flySprintMultiplier = 2;

        this.standHeight = 1.8;
        this.crouchHeight = 1.2;
        this.standEyeHeight = 1.62;
        this.crouchEyeHeight = 1.1;

        this.onGround = false;
        this.isFlying = false;
        this.isSprinting = false;
        this.isCrouching = false;
        
        this._lastSpacePress = 0;
        this._spaceWasDown = false;
        
        this._lastWPress = 0;
        this._wWasDown = false;
        this._rWasDown = false;

        this.aabb = new AABB(
            x - this.width / 2, y, z - this.width / 2,
            x + this.width / 2, y + this.height, z + this.width / 2
        );
    }

    update(dt, keys, yaw, level, camera) {
        const isReady = level.isLoaded(this.x, this.z);

        if (!isReady) {
            this._isReady = false;
            this.vx = 0;
            this.vy = 0;
            this.vz = 0;
            camera.position.set(0, this.y + this.eyeHeight, 0);
            return;
        }

        if (isReady && !this._isReady) {
            this.aabb.move(0, level.getHeight(this.x, this.z) - this.y, 0);
            this._isReady = true;
        }

        const spaceIsDown = !!keys['Space'];
        if (spaceIsDown && !this._spaceWasDown) {
            const now = performance.now();
            if (now - this._lastSpacePress < 300) {
                this.isFlying = !this.isFlying;
                this.vy = 0;
            }
            this._lastSpacePress = now;
        }
        this._spaceWasDown = spaceIsDown;

        const wIsDown = !!keys['KeyW'];
        if (wIsDown && !this._wWasDown) {
            const now = performance.now();
            if (now - this._lastWPress < 300) {
                this.isSprinting = true;
            }
            this._lastWPress = now;
        }
        this._wWasDown = wIsDown;

        const rIsDown = !!keys['KeyR'];
        if (rIsDown && !this._rWasDown) {
            this.isSprinting = !this.isSprinting;
        }
        this._rWasDown = rIsDown;

        if (!keys['KeyW'] && !keys['KeyS'] && !keys['KeyA'] && !keys['KeyD']) {
            this.isSprinting = false;
        }

        this.isCrouching = !this.isFlying && (keys['ShiftLeft'] || keys['ShiftRight']);
        
        const targetHeight = this.isCrouching ? this.crouchHeight : this.standHeight;
        const targetEyeHeight = this.isCrouching ? this.crouchEyeHeight : this.standEyeHeight;

        const currentHeight = this.aabb.y1 - this.aabb.y0;
        if (Math.abs(currentHeight - targetHeight) > 0.001) {
            const diff = targetHeight - currentHeight;
            this.aabb.y1 += diff;
            this.height = targetHeight;
        }
        this.eyeHeight = targetEyeHeight;

        let dx = this.vx * dt;
        let dy = this.vy * dt;
        let dz = this.vz * dt;

        if (this.isFlying) {
            let moveDirX = 0;
            let moveDirZ = 0;
            let moveDirY = 0;

            if (keys['KeyW']) moveDirZ += 1;
            if (keys['KeyS']) moveDirZ -= 1;
            if (keys['KeyA']) moveDirX -= 1;
            if (keys['KeyD']) moveDirX += 1;
            if (keys['Space']) moveDirY += 1;
            if (keys['ShiftLeft'] || keys['ShiftRight']) moveDirY -= 1;

            const len = Math.hypot(moveDirX, moveDirZ, moveDirY);
            if (len > 0) {
                moveDirX /= len;
                moveDirZ /= len;
                moveDirY /= len;
            }

            let currentSpeed = this.flySpeed;
            if (this.isCrouching) {
                currentSpeed *= 0.5;
            } else if (this.isSprinting) {
                currentSpeed *= this.flySprintMultiplier;
            }

            const sin = Math.sin(yaw);
            const cos = Math.cos(yaw);

            const forwardX = -sin;
            const forwardZ = -cos;
            const rightX = cos;
            const rightZ = -sin;

            const targetVx = (forwardX * moveDirZ + rightX * moveDirX) * currentSpeed;
            const targetVz = (forwardZ * moveDirZ + rightZ * moveDirX) * currentSpeed;
            const targetVy = moveDirY * this.flySpeed;

            const flyAccel = 4.0; 
            this.vx += (targetVx - this.vx) * Math.min(flyAccel * dt, 1.0);
            this.vz += (targetVz - this.vz) * Math.min(flyAccel * dt, 1.0);
            this.vy += (targetVy - this.vy) * Math.min(flyAccel * dt, 1.0);

            dx = this.vx * dt;
            dy = this.vy * dt;
            dz = this.vz * dt;

            this.onGround = false;

        } else {
            this.vy -= 25.0 * dt;

            if (keys['Space'] && this.onGround) {
                this.vy = 8.5;
                this.onGround = false;
            }

            let moveDirX = 0;
            let moveDirZ = 0;
            if (keys['KeyW']) moveDirZ += 1;
            if (keys['KeyS']) moveDirZ -= 1;
            if (keys['KeyA']) moveDirX -= 1;
            if (keys['KeyD']) moveDirX += 1;

            const len = Math.hypot(moveDirX, moveDirZ);
            if (len > 0) {
                moveDirX /= len;
                moveDirZ /= len;
            }

            let currentSpeed = this.speed;
            if (this.isCrouching) {
                currentSpeed *= 0.5;
            } else if (this.isSprinting) {
                currentSpeed *= this.sprintMultiplier;
            }

            const sin = Math.sin(yaw);
            const cos = Math.cos(yaw);

            const forwardX = -sin;
            const forwardZ = -cos;
            const rightX = cos;
            const rightZ = -sin;

            const targetVx = (forwardX * moveDirZ + rightX * moveDirX) * currentSpeed;
            const targetVz = (forwardZ * moveDirZ + rightZ * moveDirX) * currentSpeed;

            const accel = this.onGround ? 12.0 : 3.0;
            this.vx += (targetVx - this.vx) * Math.min(accel * dt, 1.0);
            this.vz += (targetVz - this.vz) * Math.min(accel * dt, 1.0);

            dx = this.vx * dt;
            dy = this.vy * dt;
            dz = this.vz * dt;
        }

        const broad = this.aabb.expand(dx, dy, dz);
        const minX = Math.floor(broad.x0 - 1);
        const maxX = Math.floor(broad.x1 + 1);
        const minY = Math.floor(broad.y0 - 1);
        const maxY = Math.floor(broad.y1 + 1);
        const minZ = Math.floor(broad.z0 - 1);
        const maxZ = Math.floor(broad.z1 + 1);

        const obstacleBoxes = [];
        for (let bx = minX; bx <= maxX; bx++) {
            for (let by = minY; by <= maxY; by++) {
                for (let bz = minZ; bz <= maxZ; bz++) {
                    const tile = level.getTile(bx, by, bz);
                    if (tile !== BLOCKS.AIR) {
                        obstacleBoxes.push(new AABB(bx, by, bz, bx + 1, by + 1, bz + 1));
                    }
                }
            }
        }

        const origDx = dx;
        const origDy = dy;
        const origDz = dz;

        for (const box of obstacleBoxes) {
            dy = box.clipYCollide(this.aabb, dy);
        }
        this.aabb.move(0, dy, 0);

        if (origDy < 0 && dy !== origDy) {
            if (this.isFlying) {
                this.isFlying = false;
            }
            this.onGround = true;
        } else if (!this.isFlying) {
            this.onGround = false;
        }

        if (dy !== origDy) {
            this.vy = 0;
        }

        if (this.isCrouching && this.onGround) {
            const step = 0.01;
            const inset = 0.01;

            const hasGroundAt = (offX, offZ) => {
                const testBox = new AABB(
                    this.aabb.x0 + offX + inset, this.aabb.y0 - 0.1, this.aabb.z0 + offZ + inset,
                    this.aabb.x1 + offX - inset, this.aabb.y0,       this.aabb.z1 + offZ - inset
                );
                for (const box of obstacleBoxes) {
                    if (box.intersects(testBox)) return true;
                }
                return false;
            };

            while (dx !== 0 && !hasGroundAt(dx, 0)) {
                if (Math.abs(dx) <= step) {
                    dx = 0;
                    this.vx = 0;
                    break;
                }
                dx -= Math.sign(dx) * step;
            }

            while (dz !== 0 && !hasGroundAt(0, dz)) {
                if (Math.abs(dz) <= step) {
                    dz = 0;
                    this.vz = 0;
                    break;
                }
                dz -= Math.sign(dz) * step;
            }

            while ((dx !== 0 || dz !== 0) && !hasGroundAt(dx, dz)) {
                if (Math.abs(dx) > step) {
                    dx -= Math.sign(dx) * step;
                } else {
                    dx = 0;
                    this.vx = 0;
                }

                if (Math.abs(dz) > step) {
                    dz -= Math.sign(dz) * step;
                } else {
                    dz = 0;
                    this.vz = 0;
                }
            }
        }

        for (const box of obstacleBoxes) {
            dx = box.clipXCollide(this.aabb, dx);
        }
        this.aabb.move(dx, 0, 0);
        if (dx !== origDx) {
            this.vx = 0;
        }

        for (const box of obstacleBoxes) {
            dz = box.clipZCollide(this.aabb, dz);
        }
        this.aabb.move(0, 0, dz);
        if (dz !== origDz) {
            this.vz = 0;
        }

        if (this.aabb.y0 < -20) {
            this.aabb.move(0, 100, 0);
            this.vy = 0;
        }

        this.x = (this.aabb.x0 + this.aabb.x1) / 2;
        this.y = this.aabb.y0;
        this.z = (this.aabb.z0 + this.aabb.z1) / 2;

        camera.position.set(0, this.y + this.eyeHeight, 0);
    }
}