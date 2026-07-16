import { TextureAnimation } from './TextureAnimation.js';

export class LavaTexture extends TextureAnimation {
    constructor() {
        super(30);
        this.c = new Float32Array(256);
        this.d = new Float32Array(256);
        this.e = new Float32Array(256);
        this.f = new Float32Array(256);
    }

    tick() {
        for (let b1 = 0; b1 < 16; b1++) {
            for (let b = 0; b < 16; b++) {
                let f = 0.0;
                const i = Math.trunc(Math.sin(b * Math.PI * 2.0 / 16.0) * 1.2000000476837158);
                const j = Math.trunc(Math.sin(b1 * Math.PI * 2.0 / 16.0) * 1.2000000476837158);
                for (let k = b1 - 1; k <= b1 + 1; k++) {
                    for (let m = b - 1; m <= b + 1; m++) {
                        const n = (k + i) & 0xF;
                        const i1 = (m + j) & 0xF;
                        f += this.c[n + (i1 << 4)];
                    }
                }
                this.d[b1 + (b << 4)] = f / 10.0 + (
                    this.e[(b1 & 0xF) + ((b & 0xF) << 4)] +
                    this.e[(b1 + 1 & 0xF) + ((b & 0xF) << 4)] +
                    this.e[(b1 + 1 & 0xF) + ((b + 1 & 0xF) << 4)] +
                    this.e[(b1 & 0xF) + ((b + 1 & 0xF) << 4)]
                ) / 4.0 * 0.8;
                this.e[b1 + (b << 4)] += this.f[b1 + (b << 4)] * 0.01;
                if (this.e[b1 + (b << 4)] < 0.0)
                    this.e[b1 + (b << 4)] = 0.0;
                this.f[b1 + (b << 4)] -= 0.06;
                if (Math.random() < 0.005)
                    this.f[b1 + (b << 4)] = 1.5;
            }
        }
        const tmp = this.d;
        this.d = this.c;
        this.c = tmp;

        for (let b2 = 0; b2 < 256; b2++) {
            let f1 = this.c[b2] * 2.0;
            if (f1 > 1.0) f1 = 1.0;
            if (f1 < 0.0) f1 = 0.0;
            const f2 = f1;
            const i = Math.trunc(f2 * 100.0 + 155.0);
            const j = Math.trunc(f2 * f2 * 255.0);
            const k = Math.trunc(f2 * f2 * f2 * f2 * 128.0);
            this.data[b2 << 2] = i & 0xFF;
            this.data[(b2 << 2) + 1] = j & 0xFF;
            this.data[(b2 << 2) + 2] = k & 0xFF;
            this.data[(b2 << 2) + 3] = 255;
        }
    }
}