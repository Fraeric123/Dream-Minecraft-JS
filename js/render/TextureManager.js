export class TextureManager {
    constructor(texture, canvas, ctx) {
        this.texture = texture;
        this.canvas = canvas;
        this.ctx = ctx;
        this.animations = [];
        this.imageData = ctx.getImageData(0, 0, 256, 256);
    }

    addAnimation(anim) {
        this.animations.push(anim);
        anim.tick();
        this.writeAnimationPixels(anim);
    }

    writeAnimationPixels(anim) {
        const tileX = (anim.tileIndex % 16) * 16;
        const tileY = Math.floor(anim.tileIndex / 16) * 16;
        const data = this.imageData.data;
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const srcIdx = (y * 16 + x) * 4;
                const dstIdx = ((tileY + y) * 256 + (tileX + x)) * 4;
                data[dstIdx] = anim.data[srcIdx];
                data[dstIdx + 1] = anim.data[srcIdx + 1];
                data[dstIdx + 2] = anim.data[srcIdx + 2];
                data[dstIdx + 3] = anim.data[srcIdx + 3];
            }
        }
    }

    tick() {
        if (this.animations.length === 0) return;
        for (const anim of this.animations) {
            anim.tick();
            this.writeAnimationPixels(anim);
        }
        this.ctx.putImageData(this.imageData, 0, 0);
        this.texture.needsUpdate = true;
    }
}