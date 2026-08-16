import { TextureAnimation } from './TextureAnimation.js';

export class WaterTexture extends TextureAnimation {
    constructor() {
        super(14);
        this.c = new Float32Array(256);
        this.d = new Float32Array(256);
        this.e = new Float32Array(256);
        this.f = new Float32Array(256);
        this.g = 0;
    }

    tick() {
        this.g++;
        for (let b1 = 0; b1 < 16; b1++) {
            for (let b3 = 0; b3 < 16; b3++) {
                let f = 0.0;
                for (let i = b1 - 1; i <= b1 + 1; i++) {
                    const j = i & 0xF;
                    const k = b3 & 0xF;
                    f += this.c[j + (k << 4)];
                }
                this.d[b1 + (b3 << 4)] = f / 3.3 + this.e[b1 + (b3 << 4)] * 0.8;
            }
        }
        for (let b1 = 0; b1 < 16; b1++) {
            for (let b3 = 0; b3 < 16; b3++) {
                this.e[b1 + (b3 << 4)] += this.f[b1 + (b3 << 4)] * 0.05;
                if (this.e[b1 + (b3 << 4)] < 0.0)
                    this.e[b1 + (b3 << 4)] = 0.0;
                this.f[b1 + (b3 << 4)] -= 0.1;
                if (Math.random() < 0.05)
                    this.f[b1 + (b3 << 4)] = 0.5;
            }
        }
        const tmp = this.d;
        this.d = this.c;
        this.c = tmp;

        for (let b2 = 0; b2 < 256; b2++) {
            let f1 = this.c[b2];
            if (f1 > 1.0) f1 = 1.0;
            if (f1 < 0.0) f1 = 0.0;
            const f2 = f1 * f1;
            this.data[b2 << 2] = Math.trunc(32.0 + f2 * 32.0) & 0xFF;
            this.data[(b2 << 2) + 1] = Math.trunc(50.0 + f2 * 64.0) & 0xFF;
            this.data[(b2 << 2) + 2] = 255;
            this.data[(b2 << 2) + 3] = Math.trunc(146.0 + f2 * 50.0) & 0xFF;
        }
    }
}