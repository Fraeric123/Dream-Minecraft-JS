export class BitmapFont {
    constructor(ctx, texturePath) {
        this.charWidths = new Int32Array(256);
        this.fontImage = new Image();
        this.isReady = false;
        this.ctx = ctx;

        this.colorCache = new Map();

        this.fontImage.onload = () => {
            this._analyzeCharWidths();
        };
        this.fontImage.src = texturePath;
    }

    _analyzeCharWidths() {
        const w = this.fontImage.width;
        const h = this.fontImage.height;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = w;
        offscreenCanvas.height = h;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.drawImage(this.fontImage, 0, 0);

        const imgData = offscreenCtx.getImageData(0, 0, w, h);
        const rawPixels = imgData.data;

        for (let i = 0; i < 128; i++) {
            let xt = i % 16;
            let yt = Math.floor(i / 16);

            let x = 0;
            let emptyColumn = false;

            for (; x < 8 && !emptyColumn; x++) {
                let xPixel = xt * 8 + x;
                emptyColumn = true;

                for (let y = 0; y < 8 && emptyColumn; y++) {
                    let yPixel = (yt * 8 + y) * w;
                    let idx = (xPixel + yPixel) * 4;

                    let alpha = rawPixels[idx + 3];
                    let r = rawPixels[idx];
                    if (alpha > 128 || r > 128) {
                        emptyColumn = false;
                    }
                }
            }

            if (i === 32) x = 4;
            this.charWidths[i] = x;
        }

        this.colorCache.set('#ffffff', this.fontImage);
        this.isReady = true;
    }

    _getColoredFontTexture(hexColorStr) {
        const cleanColor = hexColorStr.toLowerCase();

        if (this.colorCache.has(cleanColor)) {
            return this.colorCache.get(cleanColor);
        }

        const cacheCanvas = document.createElement('canvas');
        cacheCanvas.width = this.fontImage.width;
        cacheCanvas.height = this.fontImage.height;
        const cacheCtx = cacheCanvas.getContext('2d');

        cacheCtx.drawImage(this.fontImage, 0, 0);

        cacheCtx.globalCompositeOperation = 'source-in';
        cacheCtx.fillStyle = cleanColor;
        cacheCtx.fillRect(0, 0, cacheCanvas.width, cacheCanvas.height);

        this.colorCache.set(cleanColor, cacheCanvas);
        return cacheCanvas;
    }

    _hexToString(hex) {
        return `#${hex.toString(16).padStart(6, '0')}`;
    }

    _parseHexColorString(str) {
        if (typeof str !== 'string') return null;
        const m = str.match(/^#?([0-9a-f]{6})$/i);
        if (m) return parseInt(m[1], 16);
        return null;
    }

    _computeColorCode(c) {
        const k = (c & 0x8) << 3;          // 0 or 64
        const r = ((c >> 2) & 1) * 191 + k;
        const g = ((c >> 1) & 1) * 191 + k;
        const b = (c & 1) * 191 + k;
        return (r << 16) | (g << 8) | b;
    }

    _shadowColor(color) {
        return (color & 0xFCFCFC) >> 2;
    }

    drawText(text, x, y, shadow = true, scale = 3, hexColor = 0xFFFFFF) {
        if (!this.isReady) return;

        x = Math.floor(x);
        y = Math.floor(y);

        const originalSmoothing = this.ctx.imageSmoothingEnabled;
        this.ctx.imageSmoothingEnabled = false;

        let defaultColor;
        if (typeof hexColor === 'number') {
            defaultColor = hexColor & 0xFFFFFF;
        } else {
            const parsed = this._parseHexColorString(hexColor);
            defaultColor = parsed !== null ? parsed : 0xFFFFFF;
        }

        if (shadow) {
            this._renderTextString(text, x + scale, y + scale, scale, defaultColor, true);
        }
        this._renderTextString(text, x, y, scale, defaultColor, false);

        this.ctx.imageSmoothingEnabled = originalSmoothing;
    }

    getTextWidth(text, scale = 1) {
        if (!this.isReady) return 0;
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            if ((text.charAt(i) === '§' || text.charAt(i) === '&') && i + 1 < text.length) {
                i++;
                continue;
            }
            const charCode = text.charCodeAt(i);
            totalWidth += (this.charWidths[charCode] || 0) * scale;
        }
        return totalWidth;
    }

    _renderTextString(text, x, y, scale, defaultColor, isShadow) {
        let xo = 0;
        const ctx = this.ctx;

        let currentColor = isShadow ? this._shadowColor(defaultColor) : defaultColor;
        let currentTexture = this._getColoredFontTexture(this._hexToString(currentColor));

        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);

            if ((ch === '§' || ch === '&') && i + 1 < text.length) {
                const codeChar = text.charAt(i + 1).toLowerCase();
                const colorIndex = "0123456789abcdef".indexOf(codeChar);
                const effectiveIndex = colorIndex >= 0 ? colorIndex : 15;
                const baseColor = this._computeColorCode(effectiveIndex);
                currentColor = isShadow ? this._shadowColor(baseColor) : baseColor;
                currentTexture = this._getColoredFontTexture(this._hexToString(currentColor));
                i++;
                continue;
            }

            const charCode = text.charCodeAt(i);
            const srcX = (charCode % 16) * 8;
            const srcY = Math.floor(charCode / 16) * 8;
            const charWidth = this.charWidths[charCode] || 0;

            if (charWidth > 0) {
                ctx.drawImage(
                    currentTexture,
                    srcX, srcY, 8, 8,
                    x + xo, y, 8 * scale, 8 * scale
                );
            }
            xo += charWidth * scale;
        }
    }
}