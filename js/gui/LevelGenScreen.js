import { Screen } from './Screen.js';

export class LevelGenScreen extends Screen {
    initUI() {
        this.title = "";
        this.status = "";
        this.progress = 0;

        this.bgImage = new Image();
        this.bgPattern = null;
        this.bgReady = false;

        this.textureScale = 4;

        this.bgImage.onload = () => {
            const pattern = this.minecraft.ctx.createPattern(this.bgImage, 'repeat');

            const matrix = new DOMMatrix();
            matrix.scaleSelf(this.textureScale, this.textureScale);

            pattern.setTransform(matrix);

            this.bgPattern = pattern;
            this.bgReady = true;
        };
        this.bgImage.src = './assets/textures/dirt.png';
    }

    setTitle(title) {
        this.title = title;
    }

    setStatus(status, progress = 0) {
        this.status = status;
        this.progress = progress;
    }

    render(xm, ym, w, h) {
        this.width = w;
        this.height = h;

        const ctx = this.minecraft.ctx;
        const scale = h / 240;
        const i = w;
        const j = h;
        const centerX = i / 2;
        const centerY = j / 2;

        const originalSmoothing = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        if (this.bgReady && this.bgPattern) {
            ctx.save();
            const matrix = new DOMMatrix();
            matrix.scaleSelf(this.textureScale, this.textureScale);
            this.bgPattern.setTransform(matrix);
            ctx.fillStyle = this.bgPattern;
            ctx.fillRect(0, 0, i, j);
            ctx.restore();
        } else {
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, i, j);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, i, j);

        const barW = 100 * scale;
        const barH = 2 * scale;
        const barX = centerX - (100 / 2) * scale;
        const barY = centerY + 16 * scale;

        ctx.fillStyle = 'rgb(128, 128, 128)';
        ctx.fillRect(barX, barY, barW, barH);

        if (this.progress > 0) {
            const fillW = (this.progress / 100) * barW;
            ctx.fillStyle = 'rgb(128, 255, 128)';
            ctx.fillRect(barX, barY, fillW, barH);
        }

        this.drawCenteredString(this.title, centerX, centerY - 20 * scale, 0xFFFFFF, scale);

        this.drawCenteredString(this.status, centerX, centerY + 4 * scale, 0xFFFFFF, scale);

        ctx.imageSmoothingEnabled = originalSmoothing;
    }
}