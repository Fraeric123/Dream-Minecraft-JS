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

        this.speed = 10;
        this.onGround = false;

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
            this.aabb.move(0, level.getHeight(this.x, this.z)-this.y, 0)
            this._isReady = true;
        }

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

        const sin = Math.sin(yaw);
        const cos = Math.cos(yaw);

        const forwardX = -sin;
        const forwardZ = -cos;
        const rightX = cos;
        const rightZ = -sin;

        const targetVx = (forwardX * moveDirZ + rightX * moveDirX) * this.speed;
        const targetVz = (forwardZ * moveDirZ + rightZ * moveDirX) * this.speed;

        const accel = this.onGround ? 12.0 : 3.0;
        this.vx += (targetVx - this.vx) * Math.min(accel * dt, 1.0);
        this.vz += (targetVz - this.vz) * Math.min(accel * dt, 1.0);

        let dx = this.vx * dt;
        let dy = this.vy * dt;
        let dz = this.vz * dt;

        const origDx = dx;
        const origDy = dy;
        const origDz = dz;

        const broad = this.aabb.expand(dx, dy, dz);
        const minX = Math.floor(broad.x0);
        const maxX = Math.floor(broad.x1);
        const minY = Math.floor(broad.y0);
        const maxY = Math.floor(broad.y1);
        const minZ = Math.floor(broad.z0);
        const maxZ = Math.floor(broad.z1);

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

        for (const box of obstacleBoxes) {
            dy = box.clipYCollide(this.aabb, dy);
        }
        this.aabb.move(0, dy, 0);

        this.onGround = origDy < 0 && dy !== origDy;
        if (dy !== origDy) {
            this.vy = 0;
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