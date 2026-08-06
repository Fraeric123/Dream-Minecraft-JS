import { build, THREE } from "./VoxWheel.js";
import { Enum, EventList, getRandomSplash, createOverlayGradient, } from "./Util.js";

export const deg2rad = Math.PI / 180;
export const rad2deg = 180 / Math.PI;

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const DEG2RAD = (deg) => { return deg * Math.PI / 180 };
export const RAD2DEG = (rad) => { return rad * 180 / Math.PI };

export const log = (data) => { console.log(data) };

export const un = undefined;

export const isPointInBox = (px, py, bx, by, bw, bh) => {
    return px >= bx && px <= bx + bw && py >= by && py <= by + bh;
}

export class BitmapFont {
    constructor(engine, textureID) {
        this.engine = engine;
        this.asset_manager = engine.asset_manager;

        this.textureID = textureID;

        this.charWidths = new Int32Array(256);
        this.fontImage = null;
        this.isReady = false;
        this.ctx = engine.ctx;

        this.colorCache = new Map();

        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');

        this.asset_manager.getAsset(this.textureID).onLoad.addEvent((asset) => {
            this.fontImage = asset.data.image;
            this._analyzeCharWidths();
        });
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
        const k = (c & 0x8) << 3;
        const r = ((c >> 2) & 1) * 191 + k;
        const g = ((c >> 1) & 1) * 191 + k;
        const b = (c & 1) * 191 + k;
        return (r << 16) | (g << 8) | b;
    }

    _shadowColor(color) {
        return (color & 0xFCFCFC) >> 2;
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

    drawText(text, x, y, rotation = 0, shadow = true, scale = 3, hexColor = 0xFFFFFF, opacity = 1, center = false) {
        if (!this.isReady) return;

        const textWidth = this.getTextWidth(text, scale);
        const textHeight = 8 * scale;

        if (textWidth <= 0 || textHeight <= 0) return;

        const originalSmoothing = this.ctx.imageSmoothingEnabled;
        this.ctx.imageSmoothingEnabled = false;

        let defaultColor;
        if (typeof hexColor === 'number') {
            defaultColor = hexColor & 0xFFFFFF;
        } else {
            const parsed = this._parseHexColorString(hexColor);
            defaultColor = parsed !== null ? parsed : 0xFFFFFF;
        }

        const shadowOffset = shadow ? Math.ceil(scale) : 0;
        this.tempCanvas.width = Math.ceil(textWidth) + shadowOffset;
        this.tempCanvas.height = Math.ceil(textHeight) + shadowOffset;

        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.imageSmoothingEnabled = false;

        if (shadow) {
            this._renderToContext(this.tempCtx, text, shadowOffset, shadowOffset, scale, defaultColor, true, opacity);
        }
        this._renderToContext(this.tempCtx, text, 0, 0, scale, defaultColor, false, opacity);

        this.ctx.save();

        const halfW = this.tempCanvas.width / 2;
        const halfH = this.tempCanvas.height / 2;

        if (center) {
            this.ctx.translate(Math.round(x), Math.round(y));
            if (rotation !== 0) this.ctx.rotate(rotation);
            this.ctx.drawImage(this.tempCanvas, -Math.round(halfW), -Math.round(halfH));
        } else {
            if (rotation !== 0) {
                this.ctx.translate(Math.round(x + halfW), Math.round(y + halfH));
                this.ctx.rotate(rotation);
                this.ctx.drawImage(this.tempCanvas, -halfW, -halfH);
            } else {
                this.ctx.drawImage(this.tempCanvas, Math.round(x), Math.round(y));
            }
        }

        this.ctx.restore();
        this.ctx.imageSmoothingEnabled = originalSmoothing;
    }

    _renderToContext(ctx, text, x, y, scale, defaultColor, isShadow, opacity) {
        let xo = 0;

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
                const targetX = Math.round(x + xo);
                const targetY = Math.round(y);
                const targetW = Math.round(8 * scale);
                const targetH = Math.round(8 * scale);

                ctx.save();
                ctx.globalAlpha = opacity;

                ctx.drawImage(
                    currentTexture,
                    srcX, srcY, 8, 8,
                    targetX, targetY, targetW, targetH
                );

                ctx.restore();
            }
            xo += charWidth * scale;
        }
    }
}








export class GUIDrawCommand {
    constructor() {
        this.visible = true;
    }

    render(ctx, element) { }
}

export class GUIBlurPanel extends GUIDrawCommand {
    constructor(intensity = 10, x = 0, y = 0, w = 200, h = 200, rotation = 0, opacity = 1) {
        super();

        this.intensity = intensity;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.translate(-this.w / 2, -this.h / 2);
        } else {
            ctx.translate(targetX, targetY);
        }

        ctx.beginPath();
        ctx.rect(0, 0, this.w, this.h);
        ctx.clip();

        ctx.save();
        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(this.w / 2, this.h / 2);
            ctx.rotate(-totalRotation);
            ctx.translate(-centerX, -centerY);
        } else {
            ctx.translate(-targetX, -targetY);
        }

        ctx.filter = `blur(${this.intensity}px)`;
        ctx.drawImage(ctx.canvas, 0, 0);

        ctx.restore();
        ctx.restore();
    }
}


export class GUIColorPanel extends GUIDrawCommand {
    constructor(color, x, y, w, h, rotation = 0, opacity = 1) {
        super();

        this.color = color;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(targetX, targetY, this.w, this.h);
        }
        ctx.restore();
    }
}


export class GUITexturePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h, rotation = 0, opacity = 1) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const asset = this.asset_manager.getAsset(this.textureID);

        if (!asset || !asset.isLoaded)
            return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.drawImage(
                asset.data.image,
                -this.w / 2,
                -this.h / 2,
                this.w,
                this.h
            );
        } else {
            ctx.drawImage(
                asset.data.image,
                targetX,
                targetY,
                this.w,
                this.h
            );
        }
        ctx.restore();
    }
}


export class GUIImagePanel extends GUIDrawCommand {
    constructor(engine, image, x, y, w, h, rotation = 0, opacity = 1) {
        super();

        this.asset_manager = engine.asset_manager;
        this.image = image;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = (element.globalRot + this.rotation) * deg2rad;

        ctx.save();

        ctx.globalAlpha = this.opacity;

        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.drawImage(
                this.image,
                -this.w / 2,
                -this.h / 2,
                this.w,
                this.h
            );
        } else {
            ctx.drawImage(
                this.image,
                targetX,
                targetY,
                this.w,
                this.h
            );
        }
        ctx.restore();
    }
}


export class GUITiledImagePanel extends GUIDrawCommand {
    constructor(engine, image, x, y, w, h, patternScale = 1, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super();

        this.asset_manager = engine.asset_manager;
        this.image = image;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.patternScale = patternScale;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const image = this.image;
        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalPanelRotation = (element.globalRot + this.rotation) * deg2rad;

        const srcW = image.width;
        const srcH = image.height;

        const tileW = srcW * this.patternScale;
        const tileH = srcH * this.patternScale;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalPanelRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalPanelRotation);

            ctx.beginPath();
            ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
            ctx.clip();
            ctx.translate(-this.w / 2, -this.h / 2);
        } else {
            ctx.beginPath();
            ctx.rect(targetX, targetY, this.w, this.h);
            ctx.clip();
            ctx.translate(targetX, targetY);
        }

        if (this.patternRotation !== 0) {
            ctx.rotate(this.patternRotation * deg2rad);
        }

        const startX = Math.floor(this.patternOffsetX * this.patternScale) % tileW;
        const startY = Math.floor(this.patternOffsetY * this.patternScale) % tileH;

        const boundSize = Math.max(this.w, this.h) * (this.patternRotation !== 0 ? 2.0 : 1.0);
        const margin = (boundSize - this.w) / 2;

        const drawMinX = -margin - tileW;
        const drawMaxX = this.w + margin + tileW;
        const drawMinY = -margin - tileH;
        const drawMaxY = this.h + margin + tileH;

        for (let offsetX = drawMinX + startX; offsetX < drawMaxX; offsetX += tileW) {
            for (let offsetY = drawMinY + startY; offsetY < drawMaxY; offsetY += tileH) {
                ctx.drawImage(
                    image,
                    0, 0, srcW, srcH,
                    offsetX, offsetY, tileW, tileH
                );
            }
        }

        ctx.restore();
    }
}


export class GUITiledTexturePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h, patternScale = 1, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.patternScale = patternScale;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const asset = this.asset_manager.getAsset(this.textureID);
        if (!asset || !asset.isLoaded) return;

        const image = asset.data.image;
        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalPanelRotation = (element.globalRot + this.rotation) * deg2rad;

        const srcW = image.width;
        const srcH = image.height;

        const tileW = srcW * this.patternScale;
        const tileH = srcH * this.patternScale;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (totalPanelRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalPanelRotation);

            ctx.beginPath();
            ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
            ctx.clip();
            ctx.translate(-this.w / 2, -this.h / 2);
        } else {
            ctx.beginPath();
            ctx.rect(targetX, targetY, this.w, this.h);
            ctx.clip();
            ctx.translate(targetX, targetY);
        }

        if (this.patternRotation !== 0) {
            ctx.rotate(this.patternRotation * deg2rad);
        }

        const startX = Math.floor(this.patternOffsetX * this.patternScale) % tileW;
        const startY = Math.floor(this.patternOffsetY * this.patternScale) % tileH;

        const boundSize = Math.max(this.w, this.h) * (this.patternRotation !== 0 ? 2.0 : 1.0);
        const margin = (boundSize - this.w) / 2;

        const drawMinX = -margin - tileW;
        const drawMaxX = this.w + margin + tileW;
        const drawMinY = -margin - tileH;
        const drawMaxY = this.h + margin + tileH;

        for (let offsetX = drawMinX + startX; offsetX < drawMaxX; offsetX += tileW) {
            for (let offsetY = drawMinY + startY; offsetY < drawMaxY; offsetY += tileH) {
                ctx.drawImage(
                    image,
                    0, 0, srcW, srcH,
                    offsetX, offsetY, tileW, tileH
                );
            }
        }

        ctx.restore();
    }
}


export class GUITextureSpritePanel extends GUIDrawCommand {
    constructor(engine, textureID, x, y, w, h, cords = null, rotation = 0, opacity = 1) {
        super();

        this.asset_manager = engine.asset_manager;
        this.textureID = textureID;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.cords = cords ? [...cords] : [0, 0, 0, 0];

        this.rotation = rotation;
        this.opacity = opacity;
    }

    render(ctx, element) {
        if (this.visible === false) return;

        const asset = this.asset_manager.getAsset(this.textureID);
        if (!asset || !asset.isLoaded) return;

        const image = asset.data.image;
        if (!image || !image.complete || image.naturalWidth === 0) return;

        const targetX = Math.round(element.globalX + this.x);
        const targetY = Math.round(element.globalY + this.y);
        const totalRotation = element.globalRot + this.rotation;

        ctx.save();

        ctx.imageSmoothingEnabled = false;

        ctx.globalAlpha = (element.globalOpacity ?? 1) * this.opacity;

        const centerX = targetX + Math.round(this.w / 2);
        const centerY = targetY + Math.round(this.h / 2);

        ctx.translate(centerX, centerY);
        if (totalRotation !== 0) {
            ctx.rotate(totalRotation);
        }

        const margin = 0.01;

        const sx = this.cords[0] + margin;
        const sy = this.cords[1] + margin;
        const sw = this.cords[2] - (margin * 2);
        const sh = this.cords[3] - (margin * 2);

        ctx.drawImage(
            image,
            sx, sy, sw, sh,
            -this.w / 2, -this.h / 2, this.w, this.h
        );

        ctx.restore();
    }
}


export class GUIClipBegin extends GUIDrawCommand {
    constructor(x, y, w, h, rotation = 0) {
        super();

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.rotation = rotation;
    }

    render(ctx, element) {
        if (!this.visible) return;

        ctx.save();

        const targetX = element.globalX + this.x;
        const targetY = element.globalY + this.y;
        const totalRotation = element.globalRot + this.rotation;

        ctx.beginPath();
        if (totalRotation !== 0) {
            const centerX = targetX + this.w / 2;
            const centerY = targetY + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(totalRotation);
            ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
        } else {
            ctx.rect(targetX, targetY, this.w, this.h);
        }

        ctx.clip();
    }
}


export class GUIEnd extends GUIDrawCommand {
    render(ctx) {
        ctx.restore();
    }
}


export class GUIText extends GUIDrawCommand {
    constructor(font, text, x, y, rotation = 0, size = 15, color = "white", opacity = 1) {
        super();

        this.font = font;
        this.text = text;

        this.x = x;
        this.y = y;

        this.rotation = rotation;

        this.size = size;
        this.color = color;
        this.opacity = opacity;
    }


    render(ctx, element) {
        if (!this.visible) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        this.font.drawText(
            this.text,
            element.globalX + this.x,
            element.globalY + this.y,
            true,
            this.size,
            this.color
        );

        ctx.restore();
    }
}


export class GUIBitmapText extends GUIDrawCommand {
    constructor(engine, text, x, y, rotation = 0, size = 5, color = 0xFFFFFF, shadow = true, opacity = 1, center = false) {
        super();
        this.bitmap_font = engine.bitmap_font;
        this.text = text;
        this.shadow = shadow;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.size = size;
        this.color = color;
        this.opacity = opacity;
        this.center = center;
    }

    getTextWidth(text = this.text, scale = this.size) {
        return this.bitmap_font.getTextWidth(text, scale);
    }

    getTextHeight(scale = this.size) {
        return scale * 8;
    }

    render(ctx, element) {
        if (!this.visible) return;

        const totalRotRad = (element.globalRot + this.rotation) * deg2rad;
        this.bitmap_font.drawText(
            this.text,
            element.globalX + this.x,
            element.globalY + this.y,
            totalRotRad,
            this.shadow,
            this.size,
            this.color,
            this.opacity,
            this.center
        );
    }
}






export class ScrollListObjectList {
    constructor(objects = []) {
        this.objects = objects;
        this.selectedObject = null;
    }

    addScrollListObject(object) {
        this.objects.push(object);
    }

    removeScrollListObject(object) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objects.splice(index, 1);
        }

        if (this.selectedObject === object) {
            this.selectedObject = null;
        }
    }

    selectObject(object) {
        this.selectedObject = object;
    }

    removeSelectedObject() {
        this.removeScrollListObject(this.selectedObject);
    }

    getSelectedObject() {
        return this.selectedObject;
    }

    getObjects() {
        return this.objects;
    }
}








export class GUIElement {
    constructor(screen) {
        this.screen = screen;
        this.engine = this.screen.engine;

        this.x = 0;
        this.y = 0;

        this.width = 1;
        this.height = 1;

        this.offsetX = 0;
        this.offsetY = 0;

        this.rotation = 0;

        this.layer = 0;

        this.visible = true;

        this.drawCommands = [];
    }

    get globalX() {
        return this.parent ? this.parent.globalX + this.x : this.x;
    }

    get globalY() {
        return this.parent ? this.parent.globalY + this.y : this.y;
    }

    get globalRot() {
        return this.parent ? this.parent.globalRot + this.rotation : this.rotation;
    }

    add(command) {
        this.drawCommands.push(command);

        return command
    }

    clear() {
        this.drawCommands = [];
    }

    addColorPanel(color, x, y, w, h, rotation, opacity) {
        return this.add(new GUIColorPanel(color, x, y, w, h, rotation, opacity));
    }

    addTexturePanel(textureID, x, y, w, h, rotation, opacity) {
        return this.add(new GUITexturePanel(this.engine, textureID, x, y, w, h, rotation, opacity));
    }

    addText(font, text, x, y, rotation, size, color, opacity) {
        return this.add(new GUIText(font, text, x, y, rotation, size, color, opacity));
    }

    addBitmapText(text, x, y, rotation, size, color, shadow, opacity, center) {
        return this.add(new GUIBitmapText(this.engine, text, x, y, rotation, size, color, shadow, opacity, center));
    }

    addImagePanel(image, x, y, w, h, rotation, opacity) {
        return this.add(new GUIImagePanel(this.engine, image, x, y, w, h, rotation, opacity));
    }

    addTextureSpritePanel(textureID, x, y, w, h, cords, rotation, opacity) {
        return this.add(new GUITextureSpritePanel(this.engine, textureID, x, y, w, h, cords, rotation, opacity))
    }

    render(ctx) {
        if (!this.visible) return;

        this.drawCommands.forEach((command) => {
            command.render(ctx, this);
        })
    }
}


export class GUITexturePanelElement extends GUIElement {
    constructor(screen, textureID, x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.textureID = textureID;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.texturePanel = this.add(new GUITexturePanel(
            this.engine,
            textureID,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.texturePanel.w = this.width * this.scale;
        this.texturePanel.h = this.height * this.scale;
        this.texturePanel.textureID = this.textureID;
        this.texturePanel.rotation = this.rotation;
        this.texturePanel.opacity = this.opacity;
        this.texturePanel.x = 0;
        this.texturePanel.y = 0;

        super.render(ctx);
    }
}


export class GUIImagePanelElement extends GUIElement {
    constructor(screen, image, x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.imagePanel = this.add(new GUIImagePanel(
            this.engine,
            image,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.imagePanel.w = this.width * this.scale;
        this.imagePanel.h = this.height * this.scale;
        this.imagePanel.image = this.image;
        this.imagePanel.rotation = this.rotation;
        this.imagePanel.opacity = this.opacity;

        this.imagePanel.x = 0;
        this.imagePanel.y = 0;

        super.render(ctx);
    }
}


export class GUITiledImagePanelElement extends GUIElement {
    constructor(screen, image, x = 0, y = 0, width = 100, height = 100, tileSize = 64, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.tileSize = tileSize;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;

        this.scale = 1;

        this.tiledPanel = this.add(new GUITiledImagePanel(
            this.engine,
            image,
            0,
            0,
            width,
            height,
            tileSize,
            rotation,
            opacity,
            patternOffsetX,
            patternOffsetY,
            patternRotation
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.tiledPanel.w = this.width * this.scale;
        this.tiledPanel.h = this.height * this.scale;
        this.tiledPanel.image = this.image;
        this.tiledPanel.tileSize = this.tileSize;
        this.tiledPanel.rotation = this.rotation;
        this.tiledPanel.opacity = this.opacity;

        this.tiledPanel.patternOffsetX = this.patternOffsetX;
        this.tiledPanel.patternOffsetY = this.patternOffsetY;
        this.tiledPanel.patternRotation = this.patternRotation;

        this.tiledPanel.x = 0;
        this.tiledPanel.y = 0;

        super.render(ctx);
    }
}


export class GUITiledTexturePanelElement extends GUIElement {
    constructor(screen, textureID, x = 0, y = 0, width = 100, height = 100, tileSize = 64, rotation = 0, opacity = 1, patternOffsetX = 0, patternOffsetY = 0, patternRotation = 0) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.textureID = textureID;
        this.tileSize = tileSize;
        this.rotation = rotation;
        this.opacity = opacity;

        this.patternOffsetX = patternOffsetX;
        this.patternOffsetY = patternOffsetY;
        this.patternRotation = patternRotation;

        this.scale = 1;

        this.tiledPanel = this.add(new GUITiledTexturePanel(
            this.engine,
            textureID,
            0,
            0,
            width,
            height,
            tileSize,
            rotation,
            opacity,
            patternOffsetX,
            patternOffsetY,
            patternRotation
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.tiledPanel.w = this.width * this.scale;
        this.tiledPanel.h = this.height * this.scale;
        this.tiledPanel.textureID = this.textureID;
        this.tiledPanel.tileSize = this.tileSize;
        this.tiledPanel.rotation = this.rotation;
        this.tiledPanel.opacity = this.opacity;

        this.tiledPanel.patternOffsetX = this.patternOffsetX;
        this.tiledPanel.patternOffsetY = this.patternOffsetY;
        this.tiledPanel.patternRotation = this.patternRotation;

        this.tiledPanel.x = 0;
        this.tiledPanel.y = 0;

        super.render(ctx);
    }
}


export class GUITextureSpritePanelElement extends GUIElement {
    constructor(screen, textureID, x = 0, y = 0, width = 100, height = 100, cords = [0, 0, 0, 0], rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.textureID = textureID;
        this.cords = cords;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.spritePanel = this.add(new GUITextureSpritePanel(
            this.engine,
            textureID,
            0,
            0,
            width,
            height,
            cords,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.spritePanel.w = this.width * this.scale;
        this.spritePanel.h = this.height * this.scale;
        this.spritePanel.textureID = this.textureID;
        this.spritePanel.cords = this.cords;
        this.spritePanel.rotation = this.rotation;
        this.spritePanel.opacity = this.opacity;

        this.spritePanel.x = 0;
        this.spritePanel.y = 0;

        super.render(ctx);
    }
}


export class GUIBlurPanelElement extends GUIElement {
    constructor(screen, intensity = 10, x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.intensity = intensity;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.blurPanel = this.add(new GUIBlurPanel(
            intensity,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.blurPanel.w = this.width * this.scale;
        this.blurPanel.h = this.height * this.scale;
        this.blurPanel.rotation = this.rotation;
        this.blurPanel.opacity = this.opacity;
        this.blurPanel.intensity = this.intensity;

        this.blurPanel.x = 0;
        this.blurPanel.y = 0;

        super.render(ctx);
    }
}


export class GUIColorPanelElement extends GUIElement {
    constructor(screen, color = "#000000", x = 0, y = 0, width = 100, height = 100, rotation = 0, opacity = 1) {
        super(screen);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.rotation = rotation;
        this.opacity = opacity;

        this.scale = 1;

        this.colorPanel = this.add(new GUIColorPanel(
            color,
            0,
            0,
            width,
            height,
            rotation,
            opacity
        ));
    }

    render(ctx) {
        if (!this.visible) return;

        this.colorPanel.w = this.width * this.scale;
        this.colorPanel.h = this.height * this.scale;
        this.colorPanel.color = this.color;
        this.colorPanel.rotation = this.rotation;
        this.colorPanel.opacity = this.opacity;

        this.colorPanel.x = 0;
        this.colorPanel.y = 0;

        super.render(ctx);
    }
}


export class GUICrosshairElement extends GUIElement {
    constructor(screen, x = 0, y = 0, scale = 2, gap = 2, color = '#ffffff') {
        super(screen);
        this.x = x;
        this.y = y;

        this.color = color;
    }

    render(ctx) {
        const cx = Math.floor(this.x);
        const cy = Math.floor(this.y);
        ctx.save();

        ctx.globalCompositeOperation = 'difference';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(cx - 15, cy);
        ctx.lineTo(cx + 15, cy);

        ctx.moveTo(cx, cy - 15);
        ctx.lineTo(cx, cy + 15);

        ctx.stroke();
        ctx.restore();
    }
}


export class GUIBitmapTextElement extends GUIElement {
    constructor(screen, text, x = 0, y = 0, rotation = 0, size = 3, color = 0xFFFFFF, shadow = true, opacity = 1, center = false) {
        super(screen);
        this.bitmap_font = this.engine.bitmap_font;
        this.text = text;
        this.shadow = shadow;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.size = size;
        this.color = color;
        this.opacity = opacity;
        this.center = center;

        this.bitmapText = this.add(new GUIBitmapText(this.engine, text, 0, 0, 0, size, color, shadow, opacity, center));
    }

    getTextWidth(text = this.text, scale = this.size) {
        return this.bitmapText.getTextWidth(text, scale);
    }

    getTextHeight(scale = this.size) {
        return scale * 8;
    }

    render(ctx) {
        if (!this.visible) return;

        this.bitmapText.text = this.text;
        this.bitmapText.shadow = this.shadow;
        this.bitmapText.size = this.size;
        this.bitmapText.color = this.color;
        this.bitmapText.opacity = this.opacity;
        this.bitmapText.center = this.center;

        this.bitmapText.rotation = this.rotation;

        super.render(ctx);
    }
}


export class GUIButtonElement extends GUIElement {
    constructor(screen, text = "Button", x = 0, y = 0, width = 200, height = 20, affectCursor = false, onClickEvent = null) {
        super(screen);

        this.input = this.engine.input;

        this.normal = [0, 66, 200, 20];
        this.hovered = [0, 86, 200, 20];
        this.disabled = [0, 46, 200, 20];

        this.state = this.normal;

        this.interactState = "none";
        this.pushState = false;
        this.pushHoverState = false;

        this.mouseHover = false;
        this.mousePress = false;

        this.isDisabled = false;

        this.affectCursor = affectCursor;

        this.text = text;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();

        this.clickSound = "click";
        this.hoverSound = "hover";
        this.unhoverSound = "release";

        if (onClickEvent) this.onClick.addEvent(onClickEvent);

        this.clickSound = "click";
        this.hoverSound = "hover";

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.state);
        this.title = this.addBitmapText(this.text, 0 + (this.width * this.scale / 2), 0, 0, this.scale);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.x = -(this.width * this.scale / 2);
        this.sprite.y = -(this.height * this.scale / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover && !this.isDisabled && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();

                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }

                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }

                if (this.interactState == "push" && this.pushState == false) {
                    this.pushState = true;

                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                    this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);
                    this.onClick.runAll();

                    switch (this.clickSound) {
                        case "click": this.engine.playClick(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }

                    if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
            } else {
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
                if (this.interactState == "hover" && this.pushState == true) {
                    this.pushState = false;

                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "hover" || this.interactState == "push") {
                this.interactState = "none";

                this.state = this.normal;
                this.title.color = Enum.Color.NormalButtonColor;

                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();
                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }

                if (this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                }
            }
            if (this.pushState == true) {
                this.pushState = false;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        if (this.isDisabled) {
            this.sprite.cords = [0, 46, 200, 20];
        } else {
            this.sprite.cords = this.state;
        }


        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}


export class GUISliderElement extends GUIElement {
    constructor(screen, title = "Slider", texts = { 50: "Normal" }, beforemark = "", mark = "", start = 0, stop = 100, step = 1, value = 50, x = 0, y = 0, width = 160, height = 20, affectCursor = false, onSlideEvent = null) {
        super(screen);

        this.input = this.engine.input;

        this.bg = [0, 46, 200, 20];
        this.knob = [201, 45, 8, 22];

        this.interactState = "none";
        this.pushState = false;
        this.pushHoverState = false;

        this.mouseHover = false;
        this.mousePress = false;

        this.affectCursor = affectCursor;

        this.texts = texts;
        this.titletext = title;
        this.beforemark = beforemark;
        this.mark = mark;

        this.start = start;
        this.stop = stop;
        this.step = step;
        this.value = value;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();
        this.onSlide = new EventList();

        this.clickSound = "click";
        this.hoverSound = "hover";
        this.unhoverSound = "release";

        if (onSlideEvent) this.onSlide.addEvent(onSlideEvent);

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.bg);
        this.knobsprite = this.addTextureSpritePanel("gui", -(this.width / 200 * 8 * this.scale / 2), -(this.height / 20 * 22 * this.scale / 2), 8, 21, this.knob);
        this.title = this.addBitmapText(this.titletext + " : " + this.beforemark + this.value + this.mark, 0 + (this.width * this.scale / 2), 0, 0, this.scale);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.knobsprite.w = 8 * this.scale;
        this.knobsprite.h = 22 * this.scale;

        this.sprite.x = -(this.sprite.w / 2);
        this.sprite.y = -(this.sprite.h / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.title.color = Enum.Color.SelectButtonColor;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Grab);
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
            } else {
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
                if (this.pushState) {
                    this.pushState = false;
                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "push" && !this.mousePress) {
                this.interactState = "none";
                this.title.color = Enum.Color.NormalButtonColor;
                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();
                if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
            } else if (this.interactState == "hover") {
                this.interactState = "none";
                this.title.color = Enum.Color.NormalButtonColor;
                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();
                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }
                if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
            }

            if (!this.mousePress && this.pushState) {
                this.pushState = false;
                this.interactState = "none";
                this.title.color = Enum.Color.NormalButtonColor;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        const halfSlider = this.sprite.w / 2;
        const minKnobX = -halfSlider;
        const maxKnobX = halfSlider - this.knobsprite.w;
        const totalTravelDistance = maxKnobX - minKnobX;

        if (this.interactState == "push") {
            if (this.pushState == false) {
                this.pushState = true;
                this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);
                this.onClick.runAll();
                switch (this.clickSound) {
                    case "click": this.engine.playClick(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }
                if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
            }

            const clickXInsideSlider = mpos.x - (this.x + minKnobX) - this.knobsprite.w / 2;

            let percentage = clickXInsideSlider / totalTravelDistance;
            percentage = Math.max(0, Math.min(1, percentage));

            const rawValue = this.start + percentage * (this.stop - this.start);

            let steppedValue = Math.round(rawValue / this.step) * this.step;

            this.value = Math.max(this.start, Math.min(this.stop, steppedValue));

            this.onSlide.runAll(this.value);
        }

        const currentPercentage = (this.value - this.start) / (this.stop - this.start);
        this.knobsprite.x = minKnobX + (currentPercentage * totalTravelDistance);

        const specialText = this.texts[this.value.toString()];

        if (specialText) {
            this.title.text = specialText
        } else {
            this.title.text = this.titletext + ": " + this.beforemark + this.value + this.mark;
        }

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}


export class GUISwitchElement extends GUIElement {
    constructor(screen, text = "Switch", options = { "ON": true, "OFF": false }, value = "OFF", x = 0, y = 0, width = 160, height = 20, affectCursor = false, onSwitchEvent = null) {
        super(screen);

        this.input = this.engine.input;

        this.normal = [0, 66, 200, 20];
        this.hovered = [0, 86, 200, 20];
        this.disabled = [0, 46, 200, 20];

        this.state = this.normal;

        this.interactState = "none";
        this.pushState = false;
        this.pushHoverState = false;

        this.mouseHover = false;
        this.mousePress = false;

        this.affectCursor = affectCursor;

        this.text = text;
        this.options = options;
        this.value = value;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();
        this.onSwitch = new EventList();

        this.clickSound = "click";
        this.hoverSound = "hover";
        this.unhoverSound = "release";

        if (onSwitchEvent) this.onSwitch.addEvent(onSwitchEvent);

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.state);

        const initialText = `${this.text}: ${this.value}`;
        this.title = this.addBitmapText(initialText, 0, 0, 0, this.scale);

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;
    }

    _cycleValue() {
        const keys = Object.keys(this.options);
        let currentIndex = keys.indexOf(this.value);

        if (currentIndex === -1) currentIndex = 0;
        const nextIndex = (currentIndex + 1) % keys.length;

        this.value = keys[nextIndex];
        const associatedValue = this.options[this.value];

        this.title.text = `${this.text}: ${this.value}`;

        this.onSwitch.runAll(associatedValue);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.x = -(this.width * this.scale / 2);
        this.sprite.y = -(this.height * this.scale / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }

                if (this.interactState == "push" && this.pushState == false) {
                    this.pushState = true;

                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                    this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);

                    this._cycleValue();

                    this.onClick.runAll();
                    switch (this.clickSound) {
                        case "click": this.engine.playClick(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
            } else {
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
                if (this.interactState == "hover" && this.pushState == true) {
                    this.pushState = false;

                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "hover" || this.interactState == "push") {
                this.interactState = "none";

                this.state = this.normal;
                this.title.color = Enum.Color.NormalButtonColor;

                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();

                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }

                if (this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                }
            }
            if (this.pushState == true) {
                this.pushState = false;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        this.sprite.cords = this.state;
        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}


export class GUIWorldScrollListObjectElement extends GUIElement {
    constructor(screen, text1 = "", text2 = "", text3 = "", spacing = 10, textSize = 3, x = 0, y = 0, width = 300, height = 80, center = false) {
        super(screen);
        this.bitmap_font = this.engine.bitmap_font;

        this.text1 = text1;
        this.text2 = text2;
        this.text3 = text3;

        this.spacing = spacing;
        this.textSize = textSize;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.center = center;

        this.Text1 = this.add(new GUIBitmapText(this.engine, this.text1, 0, 0, 0, this.textSize, un, un, 1, this.center));
        this.Text2 = this.add(new GUIBitmapText(this.engine, this.text2, 0, 0, 0, this.textSize, un, un, 1, this.center));
        this.Text3 = this.add(new GUIBitmapText(this.engine, this.text3, 0, 0, 0, this.textSize, un, un, 1, this.center));
    }

    render(ctx) {
        if (!this.visible) return;

        [this.Text1, this.Text2, this.Text3].forEach((Text) => {
            switch (Text) {
                case this.Text1:
                    Text.text = this.text1;
                    Text.y = this.y;
                    break;
                case this.Text2:
                    Text.text = this.text2;
                    Text.y = this.y + this.spacing;
                    break;
                case this.Text3:
                    Text.text = this.text3;
                    Text.y = this.y + this.spacing * 2;
                    break;
            }
            Text.size = this.textSize;
            Text.center = this.center;
            Text.x = this.x;
        })

        super.render(ctx);
    }
}


export class GUIWorldScrollListElement extends GUIElement {
    constructor(screen, scrollListObjects = new ScrollListObjectList(), x = 0, y = 0, width = 200, height = 20, affectCursor = false, onClickEvent = null) {
        super(screen);

        this.input = this.engine.input;


        this.isDisabled = false;

        this.affectCursor = affectCursor;

        this.text = text;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onClick = new EventList();
        this.onRelease = new EventList();
        this.onHover = new EventList();
        this.onUnHover = new EventList();

        this.clickSound = "click";
        this.hoverSound = "hover";
        this.unhoverSound = "release";

        if (onClickEvent) this.onClick.addEvent(onClickEvent);

        this.clickSound = "click";
        this.hoverSound = "hover";

        this.scale = 3;

        this.sprite = this.addTextureSpritePanel("gui", -(this.width * this.scale / 2), -(this.height * this.scale / 2), 199, 19, this.state);
        this.title = this.addBitmapText(this.text, 0 + (this.width * this.scale / 2), 0, 0, this.scale);
    }

    render(ctx) {
        const mpos = this.input.getInputState("Mouse_Position") || { x: 999999, y: 999999 };
        const mbuttonDown = this.input.getInputState("Mouse_Button_0") || false;
        const mtriggerActive = this.input.getInputState("Mouse_Trigger_0") || false;

        this.sprite.x = -(this.width * this.scale / 2);
        this.sprite.y = -(this.height * this.scale / 2);

        this.mouseHover = isPointInBox(mpos.x, mpos.y, this.x + this.sprite.x, this.y + this.sprite.y, this.sprite.w, this.sprite.h);
        this.mousePress = mbuttonDown;

        if (this.mouseHover && !this.isDisabled && (!this.engine.extraScreen || this.engine.extraScreen == this.screen) && !document.pointerLockElement) {
            if (this.mousePress) {
                if (this.interactState == "hover" && mtriggerActive) {
                    this.interactState = "push";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;
                }

                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.state = this.hovered;
                    this.title.color = Enum.Color.SelectButtonColor;

                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();

                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }

                    if (this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }

                if (this.interactState == "push" && this.pushState == false) {
                    this.pushState = true;

                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                    this.engine.input_manager.mouseGUIButtonElementClick.runAll(this);
                    this.onClick.runAll();

                    switch (this.clickSound) {
                        case "click": this.engine.playClick(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }

                    if (this.mouseHover && this.screen == this.engine.screen && this.affectCursor) {
                        this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                    }
                }
            } else {
                if (this.interactState == "none") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    this.engine.input_manager.mouseGUIButtonElementHover.runAll(this);
                    this.onHover.runAll();
                    switch (this.hoverSound) {
                        case "hover": this.engine.playHover(); break;
                        case "random": this.engine.playRandom(); break;
                        case null: break;
                        default: this.engine.playSound(this.clickSound); break;
                    }
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                } else if (this.interactState == "push") {
                    this.interactState = "hover";
                    this.title.color = Enum.Color.SelectButtonColor;
                    this.state = this.hovered;
                    if (this.affectCursor) this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Pointer);
                }
                if (this.interactState == "hover" && this.pushState == true) {
                    this.pushState = false;

                    this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                    this.onRelease.runAll();
                }
            }
        } else {
            if (this.interactState == "hover" || this.interactState == "push") {
                this.interactState = "none";

                this.state = this.normal;
                this.title.color = Enum.Color.NormalButtonColor;

                this.engine.input_manager.mouseGUIButtonElementUnHover.runAll(this);
                this.onUnHover.runAll();
                switch (this.unhoverSound) {
                    case "release": this.engine.playRelease(); break;
                    case "random": this.engine.playRandom(); break;
                    case null: break;
                    default: this.engine.playSound(this.clickSound); break;
                }

                if (this.affectCursor) {
                    this.engine.canvas_renderer.setCanvasCursor(Enum.CursorType.Default);
                }
            }
            if (this.pushState == true) {
                this.pushState = false;
                this.engine.input_manager.mouseGUIButtonElementRelease.runAll(this);
                this.onRelease.runAll();
            }
        }

        if (this.isDisabled) {
            this.sprite.cords = [0, 46, 200, 20];
        } else {
            this.sprite.cords = this.state;
        }


        this.sprite.w = this.width * this.scale;
        this.sprite.h = this.height * this.scale;

        this.title.x = 0 - this.title.getTextWidth() / 2;
        this.title.y = 0 - this.title.getTextHeight() / 2;

        super.render(ctx);
    }
}








export class Page {
    constructor(screen) {
        this.screen = screen;
        this.engine = screen.engine;

        this.guiElements = [];
    }

    addElement(element) {
        this.guiElements.push(element);
        this.guiElements.sort((a, b) => (a.layer || 0) - (b.layer || 0));
        return element;
    }

    addBlurPanel(intensity, x, y, width, height, rotation, opacity) { return this.addElement(new GUIBlurPanelElement(this.screen, intensity, x, y, width, height, rotation, opacity)) };
    addColorPanel(color, x, y, width, height, rotation, opacity) { return this.addElement(new GUIColorPanelElement(this.screen, color, x, y, width, height, rotation, opacity)) };
    addCrosshair(x, y, scale, gap) { return this.addElement(new GUICrosshairElement(this.screen, x, y, scale, gap)) };
    addTexturePanel(textureID, x, y, width, height, rotation, opacity) { return this.addElement(new GUITexturePanelElement(this.screen, textureID, x, y, width, height, rotation, opacity)) };
    addImagePanel(image, x, y, width, height, rotation, opacity) { return this.addElement(new GUIImagePanelElement(this.screen, image, x, y, width, height, rotation, opacity)) };
    addTiledImagePanel(image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.addElement(new GUITiledImagePanelElement(this.screen, image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTiledTexturePanel(textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.addElement(new GUITiledTexturePanelElement(this.screen, textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTextureSpritePanel(textureID, x, y, width, height, cords, rotation, opacity) { return this.addElement(new GUITextureSpritePanelElement(this.screen, textureID, x, y, width, height, cords, rotation, opacity)) };
    addBitmapText(text, x, y, rotation, size, color, shadow, opacity, center) { return this.addElement(new GUIBitmapTextElement(this.screen, text, x, y, rotation, size, color, shadow, opacity, center)) };
    addButton(text, x, y, width, height, affectCursor, onClickEvent) { return this.addElement(new GUIButtonElement(this.screen, text, x, y, width, height, affectCursor, onClickEvent)) };
    addSwitch(text, options, value, x, y, width, height, affectCursor, onSwitchEvent) { return this.addElement(new GUISwitchElement(this.screen, text, options, value, x, y, width, height, affectCursor, onSwitchEvent)) };
    addSlider(title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent) { return this.addElement(new GUISliderElement(this.screen, title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent)) };
    addWorldScrollListObject(text1, text2, text3, spacing, textSize, x, y, width, height, center) { return this.addElement(new GUIWorldScrollListObjectElement(this.screen, text1, text2, text3, spacing, textSize, x, y, width, height, center)) };

    render(ctx) {
        this.guiElements.forEach((element) => {
            element.render(ctx);
        });
    }
}








export class Screen {
    constructor(engine) {
        this.engine = engine;

        this.pages = [];
        this.page = 0;
    }

    getPage(num = this.page) {
        if (!this.pages[num]) {
            this.pages[num] = new Page(this);
        }
        return this.pages[num];
    }

    nextPage() {
        const nextIndex = this.page >= this.pages.length - 1 ? 0 : this.page + 1;
        this.turnPage(nextIndex);
    }

    prevPage() {
        if (this.page <= 0) {
            if (this.pages.length > 0) {
                this.turnPage(this.pages.length - 1);
            }
            return;
        }
        this.turnPage(this.page - 1);
    }

    turnPage(num) {
        if (!this.pages[num]) {
            this.pages[num] = new Page(this);
        }
        this.page = num;
    }

    setPage(pageInstance) {
        const index = this.pages.indexOf(pageInstance);
        if (index !== -1) {
            this.page = index;
        }
    }

    /*
    addBlurPanel(...args) { return this.getPage().addBlurPanel(...args); }
    addColorPanel(...args) { return this.getPage().addColorPanel(...args); }
    addCrosshair(...args) { return this.getPage().addCrosshair(...args); }
    addTexturePanel(...args) { return this.getPage().addTexturePanel(...args); }
    addImagePanel(...args) { return this.getPage().addImagePanel(...args); }
    addTiledImagePanel(...args) { return this.getPage().addTiledImagePanel(...args); }
    addTiledTexturePanel(...args) { return this.getPage().addTiledTexturePanel(...args); }
    addTextureSpritePanel(...args) { return this.getPage().addTextureSpritePanel(...args); }
    addBitmapText(...args) { return this.getPage().addBitmapText(...args); }
    addButton(...args) { return this.getPage().addButton(...args); }
    addSwitch(...args) { return this.getPage().addSwitch(...args); }
    addSlider(...args) { return this.getPage().addSlider(...args); }
    addWorldScrollListObject(...args) { return this.getPage().addWorldScrollListObject(...args); }
    */

    addBlurPanel(intensity, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUIBlurPanelElement(this, intensity, x, y, width, height, rotation, opacity)) };
    addColorPanel(color, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUIColorPanelElement(this, color, x, y, width, height, rotation, opacity)) };
    addCrosshair(x, y, scale, gap) { return this.getPage().addElement(new GUICrosshairElement(this, x, y, scale, gap)) };
    addTexturePanel(textureID, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUITexturePanelElement(this, textureID, x, y, width, height, rotation, opacity)) };
    addImagePanel(image, x, y, width, height, rotation, opacity) { return this.getPage().addElement(new GUIImagePanelElement(this, image, x, y, width, height, rotation, opacity)) };
    addTiledImagePanel(image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.getPage().addElement(new GUITiledImagePanelElement(this, image, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTiledTexturePanel(textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation) { return this.getPage().addElement(new GUITiledTexturePanelElement(this, textureID, x, y, width, height, tileSize, rotation, opacity, patternOffsetX, patternOffsetY, patternRotation)) };
    addTextureSpritePanel(textureID, x, y, width, height, cords, rotation, opacity) { return this.getPage().addElement(new GUITextureSpritePanelElement(this, textureID, x, y, width, height, cords, rotation, opacity)) };
    addBitmapText(text, x, y, rotation, size, color, shadow, opacity, center) { return this.getPage().addElement(new GUIBitmapTextElement(this, text, x, y, rotation, size, color, shadow, opacity, center)) };
    addButton(text, x, y, width, height, affectCursor, onClickEvent) { return this.getPage().addElement(new GUIButtonElement(this, text, x, y, width, height, affectCursor, onClickEvent)) };
    addSwitch(text, options, value, x, y, width, height, affectCursor, onSwitchEvent) { return this.getPage().addElement(new GUISwitchElement(this, text, options, value, x, y, width, height, affectCursor, onSwitchEvent)) };
    addSlider(title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent) { return this.getPage().addElement(new GUISliderElement(this, title, texts, beforemark, mark, start, stop, step, value, x, y, width, height, affectCursor, onSlideEvent)) };
    addWorldScrollListObject(text1, text2, text3, spacing, textSize, x, y, width, height, center) { return this.getPage().addElement(new GUIWorldScrollListObjectElement(this, text1, text2, text3, spacing, textSize, x, y, width, height, center)) };

    init() { };

    render(ctx) {
        this.getPage().render(ctx);
    }
}


export class AssetLoadingScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;

        this.addColorPanel("black", 0, 0, canvasW, canvasH);

        this.addBitmapText("Loading Assets...", centerX, 150, 0, 5, un, un, un, true);
        this.Pic = this.addTexturePanel("terrain", 900, 600, 300, 300);
        this.Text = this.addBitmapText("", centerX, 320, 0, 5, 0xFFFFFF, un, un, true);

        this.barWidth = 1000;
        this.barHeight = 30;
        this.barX = centerX - (this.barWidth / 2);
        this.barY = 1200;
        this.factor = 5;
        this.padding = 5;

        this.barBorder = this.addColorPanel(
            "#ffffff",
            this.barX - this.factor,
            this.barY - this.factor,
            this.barWidth + (this.factor * 2),
            this.barHeight + (this.factor * 2)
        );

        this.barBg = this.addColorPanel(
            "#000000",
            this.barX,
            this.barY,
            this.barWidth,
            this.barHeight
        );

        this.innerMaxWidth = this.barWidth - (this.padding * 2);
        this.barFill = this.addColorPanel(
            "#ffffff",
            this.barX + this.padding,
            this.barY + this.padding,
            0,
            this.barHeight - (this.padding * 2)
        );

        this.ProgressText = this.addBitmapText("0%", centerX, centerY + 440, 0, 5, 0xFFFFFF, un, un, true);

        this.engine.asset_manager.onProgress.addEvent((progress) => {
            this.assetLoaded(progress);
            this.render(this.engine.ctx);
        });
    }

    assetLoaded(progress) {
        const path = progress.asset?.path ?? "";
        const value = progress.value ?? 0;

        this.Text.text = `Loaded: ${path}`;
        this.ProgressText.text = `${Math.round(value * 100)}%`;

        if (this.barFill) {
            this.barFill.width = Math.floor(this.innerMaxWidth * value);
        }

        let img = null;
        if (progress.asset.type === Enum.AssetType.Texture) {
            this.Pic.textureID = progress.asset.getCleanID();
            img = progress.asset.data?.image;
        } else {
            this.Pic.textureID = "pack";
            img = this.engine.asset_manager.get("pack")?.image;
        }

        if (img && img.height > 0) {
            this.Pic.width = this.Pic.height * (img.width / img.height);
        } else {
            this.Pic.width = this.Pic.height;
        }

        this.Pic.x = 1280 - (this.Pic.width / 2);
    }
}


export class LogoScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.addColorPanel("black", 0, 0, 2560, 1440);
        this.addBitmapText("Logo", centerX, 300, 0, 16, un, un, un, true);
        //this.Pic = this.addTexturePanel("font", -500, 500, 5000, 500);

        this.renderTime = 0;
    }

    render(ctx) {
        this.renderTime++;

        if (this.renderTime > 1) {
            this.engine.setScreen(this.engine.menuScreen);
        }

        super.render(ctx);
    }
}


export class MenuScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = (canvasH / 2) + 100;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.splashTextStr = engine.splash;
        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTexturePanel("gamelogo", canvasW / 2 - 500, 100, 1000, 170);

        this.splashText = this.addBitmapText(this.splashTextStr, centerX + 330, 237, -10, 5, 0xFFFF00, true, 1, true);

        const hotbarX = 800;
        const hotbarY = 800;

        //this.hotbar = this.addTextureSpritePanel("gui", centerX - 183*3/2, down - 22*3, 183*3, 22*3, [0, 0, 183, 22]);
        //this.hotbarSelector = this.addTextureSpritePanel("gui", centerX - 183*3/2, down - selW, selW, selW, [0, 22, 24, 24]);
        //this.hotbarSelectorPositions = [0, (selW + slotOffset), (selW + slotOffset)*2, (selW + slotOffset)*3, (selW + slotOffset)*4, (selW + slotOffset)*5, (selW + slotOffset)*6, (selW + slotOffset)*7, (selW + slotOffset)*8];
        //this.hotbarSelectorStartX = this.hotbarSelector.x;
        this.sele = 0;

        this.addBitmapText("by Fraeric123", left - 225, down - 30, 0, 3);
        this.addBitmapText("Alpha Test Build no." + build, 10, down - 60, 0, 3);
        this.addBitmapText("not Minecraft 1.0.0", 10, down - 30, 0, 3);

        const playBut = this.addButton("Singleplayer", centerX, centerY - 100, un, un, un, () => { engine.setScreen(engine.worldSelectScreen) });
        const optionsBut = this.addButton("Options", centerX - 153, centerY - 30, 98, un, un, () => { engine.setScreen(engine.optionsScreen) });
        const exitBut = this.addButton("Quit Game", centerX + 153, centerY - 30, 98, un, un, () => { window.close() });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("panorama0"); const p3 = this.engine.asset_manager.get("panorama3");
            const p1 = this.engine.asset_manager.get("panorama1"); const p4 = this.engine.asset_manager.get("panorama4");
            const p2 = this.engine.asset_manager.get("panorama2"); const p5 = this.engine.asset_manager.get("panorama5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;
        this.blur.intensity = this.engine.config.data.BlurIntensity;

        //this.hotbarSelector.x = this.hotbarSelectorStartX + this.hotbarSelectorPositions[this.sele.toFixed()];
        //this.sele += 0.01;
        if (this.sele > 8.5) this.sele = 0

        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        const textScaleFactor = 1;
        const timeMs = this.engine.ms() % 1000;
        const wave = Math.abs(Math.sin((timeMs / 1000) * Math.PI * 2));
        const scaleFactor = (1.8 * textScaleFactor) - wave * 0.1 * textScaleFactor;

        const textWidth = this.splashText.getTextWidth(this.splashText.text, 1);

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');
        this.splashText.size = (scaleFactor * 100) / (textWidth + 32) * 3;

        super.render(ctx);
    }
}


export class OptionsScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const lefty = 2560;
        const righty = 0;

        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Options", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const musicVolumeSlider = this.addSlider(
            "Music",
            {
                0: "Music: OFF"
            },
            "", "%",
            0, 100, 1,
            this.engine.config.data.Music,
            centerX - 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.Music = val }
        );
        const masterVolumeSlider = this.addSlider(
            "Sound",
            {
                0: "Sound: OFF"
            },
            "", "%",
            0, 100, 1,
            this.engine.config.data.MasterVolume,
            centerX + 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.MasterVolume = val }
        );

        const invertMouseSwitch = this.addSwitch(
            "Invert Mouse",
            {
                "ON": true, "OFF": false
            },
            engine.config.data.InvertMouse ? "ON" : "OFF",
            centerX - 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.InvertMouse = val }
        );
        const sensitivitySlider = this.addSlider(
            "Sensitivity",
            {
                0: "Sensitivity: *yawn*",
                200: "Sensitivity: HYPERSPEED!!!"
            },
            "", "%",
            0, 200, 1,
            this.engine.config.data.Sensitivity,
            centerX + 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.Sensitivity = val }
        );

        const fovSlider = this.addSlider(
            "FOV",
            {
                70: "FOV: Normal",
                110: "FOV: Quake Pro"
            },
            "", "",
            30, 110, 1,
            this.engine.config.data.FOV,
            centerX - 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.FOV = val }
        );
        const difficultySwitch = this.addSwitch(
            "Difficulty",
            {
                "Peaceful": 0,
                "Easy": 1,
                "Normal": 2,
                "Hard": 3
            },
            engine.config.getDifficulty(),
            centerX + 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.Difficulty = val }
        );

        const extrasBut = this.addButton("§6Extras", centerX, centerY + 120, un, un, un, () => { this.turnPage(3) });
        const videoSettingsBut = this.addButton("Video Settings...", centerX, centerY + 200, un, un, un, () => { this.turnPage(1) });
        const constrolsBut = this.addButton("Controls...", centerX, centerY + 280, un, un, un, () => { this.turnPage(2) });

        const doneBut = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { engine.setScreen(engine.menuScreen) });

        this.turnPage(1);

        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Video Settings", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const graphicsSwitch = this.addSwitch(
            "Graphics",
            {
                "Fancy": Enum.Graphics.Fancy,
                "Fast": Enum.Graphics.Fast
            },
            engine.config.getGraphics(),
            centerX - 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.Graphics = val }
        );
        const renderDistanceSwitch = this.addSwitch(
            "Render Distance",
            {
                "Far": Enum.RenderDistance.Far,
                "Normal": Enum.RenderDistance.Normal,
                "Short": Enum.RenderDistance.Short,
                "Tiny": Enum.RenderDistance.Tiny
            },
            engine.config.getRenderDistance(),
            centerX + 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.RenderDistance = val }
        );

        const smoothLightingSwitch = this.addSwitch(
            "Smooth Lighting",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.SmoothLighting ? "ON" : "OFF",
            centerX - 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.SmoothLighting = val }
        );
        const performanceSwitch = this.addSwitch(
            "Performance",
            {
                "Balanced": Enum.Performance.Balanced,
                "MaxFPS": Enum.Performance.MaxFPS,
                "PowerSaver": Enum.Performance.PowerSaver
            },
            engine.config.getPerformance(),
            centerX + 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.Performance = val }
        );

        const threeDAnaglyphSwitch = this.addSwitch(
            "3D Anaglyph",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data["3DAnaglyph"] ? "ON" : "OFF",
            centerX - 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data["3DAnaglyph"] = val }
        );
        const viewBobbingSwitch = this.addSwitch(
            "View Bobbing",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ViewBobbing ? "ON" : "OFF",
            centerX + 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.ViewBobbing = val }
        );

        const guiScaleSwitch = this.addSwitch(
            "GUI Scale",
            {
                "Auto": Enum.GUIScale.Auto,
                "Large": Enum.GUIScale.Large,
                "Normal": Enum.GUIScale.Normal,
                "Small": Enum.GUIScale.Small
            },
            engine.config.getGUIScale(),
            centerX - 260, centerY - 160,
            un, un, un,
            (val) => { engine.config.data.GUIScale = val }
        );
        const cloudsSwitch = this.addSwitch(
            "Clouds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.Clouds ? "ON" : "OFF",
            centerX + 260, centerY - 160,
            un, un, un,
            (val) => { engine.config.data.Clouds = val }
        );

        const brightnessSlider = this.addSlider(
            "Brightness",
            {
                0: "Brightness: Moody",
                100: "Brightness: Bright"
            },
            "+", "%",
            0, 100, 1,
            this.engine.config.data.Brightness,
            centerX - 260, centerY - 80,
            un, un, un,
            (val) => { engine.config.data.Brightness = val }
        );
        const blurIntensitySlider = this.addSlider(
            "Blur Intensity",
            {},
            "", "",
            0, 100, 1,
            this.engine.config.data.BlurIntensity,
            centerX + 260, centerY - 80,
            un, un, un,
            (val) => { engine.config.data.BlurIntensity = val }
        );

        const particlesSwitch = this.addSwitch(
            "Particles",
            {
                "Minimal": Enum.Particles.Minimal,
                "Decreased": Enum.Particles.Decreased,
                "All": Enum.Particles.All
            },
            engine.config.getParticles(),
            centerX - 260, centerY,
            un, un, un,
            (val) => { engine.config.data.Particles = val }
        );
        const blurEffectsSwitch = this.addSwitch(
            "Blur Effects",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.BlurEffects ? "ON" : "OFF",
            centerX + 260, centerY,
            un, un, un,
            (val) => { engine.config.data.BlurEffects = val }
        );


        const fullScreenSwitch = this.addSwitch(
            "FullScreen",
            {
                "ON": true,
                "OFF": false
            },
            document.fullscreenElement !== null ? "ON" : "OFF",
            centerX - 260, centerY + 80,
            un, un, un,
            (val) => {
                if (val) {
                    if (!document.fullscreenElement) {
                        this.engine.canvas.requestFullscreen().catch(err => {
                            console.error(`fullscreen error: ${err.message}`);
                        });
                        screen.orientation.lock('landscape');
                    }
                } else {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(err => {
                            console.error(`exit fullscreen error: ${err.message}`);
                        });
                    }
                }
            }
        );

        const doneBut2 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });

        this.turnPage(2);

        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Controls", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const attack = null
        const useItem = null

        const forward = null
        const left = null

        const back = null
        const right = null

        const jump = null
        const sneak = null

        const drop = null
        const inventory = null

        const chat = null
        const listPlayers = null

        const pickBlock = null

        const doneBut3 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });

        this.turnPage(3);

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 0.7);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Extras", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const menuSpinSpeedSlider = this.addSlider(
            "Menu Spin Speed",
            {
                "-10000": "Menu Spin Speed: LIGHTSPEED Backwards",
                "-5000": "Menu Spin Speed: FAST AND FURIOUS Backwards",
                "-2500": "Menu Spin Speed: Dizzy Backwards",
                "-50": "Menu Spin Speed: Normal Backwards",
                "0": "Menu Spin Speed: Motionless",
                "50": "Menu Spin Speed: Normal",
                "2500": "Menu Spin Speed: Dizzy",
                "5000": "Menu Spin Speed: FAST AND FURIOUS",
                "10000": "Menu Spin Speed: LIGHTSPEED"
            },
            "", "",
            -10000, 10000, 50,
            engine.config.data.MenuSpinSpeed,
            centerX, centerY - 400,
            250, un, un,
            (vol) => { engine.config.data.MenuSpinSpeed = vol }
        );

        const extraSoundsSwitch = this.addSwitch(
            "Extra Sounds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ExtraSounds ? "ON" : "OFF",
            centerX, centerY - 300,
            un, un, un,
            (val) => { engine.config.data.ExtraSounds = val; }
        );

        const renderFactorSwitch = this.addSwitch(
            "Render Factor",
            {
                "0.05x": 0.05,
                "0.1x": 0.1,
                "0.2x": 0.2,
                "0.4x": 0.4,
                "0.8x": 0.8,
                "1x": 1,
                "1.5x": 1.5,
                "2x": 2
            },
            engine.config.data.RenderFactor + "x",
            centerX, centerY - 200,
            un, un, un,
            (val) => { engine.config.data.RenderFactor = val }
        );

        const doneBut4 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("panorama0"); const p3 = this.engine.asset_manager.get("panorama3");
            const p1 = this.engine.asset_manager.get("panorama1"); const p4 = this.engine.asset_manager.get("panorama4");
            const p2 = this.engine.asset_manager.get("panorama2"); const p5 = this.engine.asset_manager.get("panorama5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;
        this.blur.intensity = this.engine.config.data.BlurIntensity;

        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class WorldSelectScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const down = 1440;

        this.selectedWorldId = null;
        this.worldButtons = [];

        this.gradientImage = createOverlayGradient(canvasW, canvasH);

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addImagePanel(this.gradientImage, 0, 0, canvasW, canvasH, 0, 0.25);
        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.55);
        this.bg2 = this.addTiledTexturePanel("dirt", 0, 0, canvasW, 120, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, 120, 0, 0.75);
        this.bg3 = this.addTiledTexturePanel("dirt", 0, down - 190, canvasW, 190, 6.8, 0, 1);
        this.addColorPanel("black", 0, down - 190, canvasW, 190, 0, 0.75);
        this.addBitmapText("Select World", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.playSelectedBut = this.addButton("Play Selected World", centerX - 255, down - 130, 160);
        this.createNewBut = this.addButton("Create New World", centerX + 255, down - 130, 160);
        this.renameBut = this.addButton("Rename", centerX - 255 - 127, down - 55, 75);
        this.deleteBut = this.addButton("Delete", centerX - 255 + 127, down - 55, 75);
        this.cancelBut = this.addButton("Cancel", centerX + 255, down - 55, 160);
        /*
                this.playSelectedBut.isDisabled = true;
                this.renameBut.isDisabled = true;
                this.deleteBut.isDisabled = true;
        */

        this.addWorldScrollListObject("New World", "New World (7/25/26 6:53 PM)", "Survival Mode", 35, 3, 500, 500, 500, 500, false);

        this.createNewBut.onClick.addEvent(() => { engine.setScreen(engine.createWorldScreen) });
        this.cancelBut.onClick.addEvent(() => { engine.setScreen(engine.menuScreen) });

        this.playSelectedBut.onClick.addEvent(() => {
            engine.screen = null;
            engine.loadWorld(null);
        });

        this.deleteBut.onClick.addEvent(() => {
            if (!this.selectedWorldId || !engine.worldStorage) return;

            const idToDelete = this.selectedWorldId;

            engine.worldStorage.deleteWorld(
                idToDelete,
                () => {
                    this.selectedWorldId = null;
                    this.refreshWorldList();
                },
                (err) => {
                    console.error("Chyba při mazání světa:", err);
                }
            );
        });

        this.renameBut.onClick.addEvent(() => {
            if (!this.selectedWorldId || !engine.worldStorage) return;

            const currentId = this.selectedWorldId;

            engine.worldStorage.getWorld(
                currentId,
                (worldRecord) => {
                    if (!worldRecord) return;

                    const oldName = worldRecord.metadata?.name || "";
                    const newName = prompt("Enter new world name:", oldName);

                    if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
                        const updatedMetadata = {
                            ...worldRecord.metadata,
                            name: newName.trim()
                        };

                        const zipData = worldRecord.zipData || null;

                        engine.worldStorage.saveWorld(
                            currentId,
                            updatedMetadata,
                            zipData,
                            () => {
                                this.refreshWorldList();
                            },
                            (err) => {
                                console.error("Chyba při přejmenování světa:", err);
                            }
                        );
                    }
                },
                (err) => {
                    console.error("Chyba při načítání světa k přejmenování:", err);
                }
            );
        });

        this.updateButtonStates();
    }

    refreshWorldList() {
        const page = typeof this.getPage === 'function' ? this.getPage() : null;
        const elements = page?.elements || this.elements || [];

        this.worldButtons.forEach(btn => {
            if (typeof btn.destroy === 'function') {
                btn.destroy();
            } else if (typeof btn.remove === 'function') {
                btn.remove();
            } else if (Array.isArray(elements)) {
                const idx = elements.indexOf(btn);
                if (idx !== -1) {
                    elements.splice(idx, 1);
                }
            }
        });
        this.worldButtons = [];

        const storage = this.engine?.worldStorage;
        if (!storage || typeof storage.getWorldsList !== 'function') {
            console.warn("WorldStorage nebo metoda getWorldsList není k dispozici.");
            this.updateButtonStates();
            return;
        }

        storage.getWorldsList((worlds) => {
            const canvasW = 2560;
            const centerX = canvasW / 2;
            let startY = 180;

            (worlds || []).forEach((world) => {
                const isSelected = this.selectedWorldId === world.id;
                const dateStr = new Date(world.lastPlayed || Date.now()).toLocaleDateString();
                const btnText = `${isSelected ? "> " : ""}${world.name || "Unnamed"} (${dateStr})`;

                const btn = this.addButton(btnText, centerX, startY, 400, un, un, () => {
                    this.selectedWorldId = world.id;
                    this.refreshWorldList();
                });

                this.worldButtons.push(btn);
                startY += 85;
            });

            this.updateButtonStates();
        });
    }

    updateButtonStates() {
        const hasSelection = this.selectedWorldId !== null;
        this.playSelectedBut.disabled = !hasSelection;
        this.renameBut.disabled = !hasSelection;
        this.deleteBut.disabled = !hasSelection;
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("panorama0"); const p3 = this.engine.asset_manager.get("panorama3");
            const p1 = this.engine.asset_manager.get("panorama1"); const p4 = this.engine.asset_manager.get("panorama4");
            const p2 = this.engine.asset_manager.get("panorama2"); const p5 = this.engine.asset_manager.get("panorama5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }

        this.selectedWorldId = null;
        this.refreshWorldList();
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;
        this.blur.intensity = this.engine.config.data.BlurIntensity;

        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        const patternY = 500 * (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const patternX = 500 * (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.bg.patternOffsetY = patternY;
        this.bg.patternOffsetX = patternX;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class CreateWorldScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;

        this.worldName = "New World";
        this.gameMode = "Survival";
        this.seed = Math.floor(Math.random() * 1000000000).toString();

        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Create World", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.nameBtn = this.addButton(`World Name: ${this.worldName}`, centerX, centerY - 200, 300, un, un, () => {
            const input = prompt("Enter World Name:", this.worldName);
            if (input && input.trim() !== "") {
                this.worldName = input.trim();
                this.nameBtn.text = `World Name: ${this.worldName}`;
            }
        });

        this.modeBtn = this.addSwitch(
            "Game Mode",
            { "Survival": "Survival", "Creative": "Creative", "Hardcore": "Hardcore" },
            this.gameMode,
            centerX, centerY - 100, 300, un, un,
            (val) => { this.gameMode = val; }
        );

        this.seedBtn = this.addButton(`Seed: ${this.seed}`, centerX, centerY, 300, un, un, () => {
            this.seed = Math.floor(Math.random() * 1000000000).toString();
            this.seedBtn.text = `Seed: ${this.seed}`;
        });

        this.importBut = this.addButton("Import World (.zip)", centerX, centerY + 120, 300, un, un, () => {
            if (engine.worldStorage) {
                engine.worldStorage.import(() => {
                    engine.setScreen(engine.worldSelectScreen);
                });
            }
        });

        const createBut = this.addButton("Create New World", centerX - 255, down - 55, 160, un, un, () => {
            if (engine.worldStorage) {
                const worldId = 'world_' + Date.now();
                const metadata = {
                    name: this.worldName,
                    mode: this.gameMode,
                    seed: this.seed,
                    created: Date.now(),
                    lastPlayed: Date.now()
                };

                engine.worldStorage.saveWorld(worldId, metadata, null, (savedRecord) => {
                    if (engine.loadWorld) {
                        engine.loadWorld(savedRecord);
                    } else {
                        engine.setScreen(engine.worldSelectScreen);
                    }
                });
            }
        });

        const cancelBut = this.addButton("Cancel", centerX + 255, down - 55, 160, un, un, () => {
            engine.setScreen(engine.worldSelectScreen);
        });
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("panorama0"); const p3 = this.engine.asset_manager.get("panorama3");
            const p1 = this.engine.asset_manager.get("panorama1"); const p4 = this.engine.asset_manager.get("panorama4");
            const p2 = this.engine.asset_manager.get("panorama2"); const p5 = this.engine.asset_manager.get("panorama5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }

        this.worldName = "New World";
        this.seed = Math.floor(Math.random() * 1000000000).toString();
        if (this.nameBtn) this.nameBtn.text = `World Name: ${this.worldName}`;
        if (this.seedBtn) this.seedBtn.text = `Seed: ${this.seed}`;
    }

    render(ctx) {
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class ErrorScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.errorText = "Error"

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 0.2);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("§4Error Report", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        this.title = this.addBitmapText(this, centerX, centerY, 0, 3, 0xFFFFFF, true, 1, true);

        const okBut = this.addButton("OK", centerX, down - 55, 160);

        okBut.onClick.addEvent(() => { engine.extraScreen = null });
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;
        this.blur.intensity = this.engine.config.data.BlurIntensity;

        this.title.text = this.errorText;
        super.render(ctx);
    }
}


export class InGameScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.addCrosshair(centerX, centerY, 7, 0);

        this.addBitmapText("Alpha Test Build no." + build, 185, 30, 0, 3, 0xFFFFFF, true, 1, true);

        const menuX = 20;
        const menuY = 50;
        const textRotation = 0;
        const textSize = 3;
        const textColor = 0xFFFFFF;
        const textShadow = true;
        const textOpacity = 1;
        const isCentered = false;

        let currentY = 30 + menuY;
        const lineSpacing = 30;

        this.hotbar = this.addTextureSpritePanel("gui", centerX - 274.5, down - 66, 547, 66, [0, 0, 183, 22]);
        this.hotbarSelector = this.addTextureSpritePanel("gui", centerX - 274.5, down - 66, 66, 66, [0, 22, 24, 24]);
        this.hotbarSelectorPositions = [0, 66, 132, 132, 132, 132, 132, 132, 132];
        this.hotbarSelectorStartX = centerX - 274.5;

        const addDebugLine = (label) => {
            const el = this.addBitmapText(label, menuX, currentY, textRotation, textSize, textColor, textShadow, textOpacity, isCentered);
            currentY += lineSpacing;
            return el;
        };

        this.debugFpsText = addDebugLine("FPS: 0");
        this.debugCallsText = addDebugLine("Draw Calls: 0");
        this.debugComputeText = addDebugLine("Compute Calls: 0");
        this.debugTrianglesText = addDebugLine("Triangles: 0");
        this.debugGeoText = addDebugLine("Geometries: 0");
        this.debugMatText = addDebugLine("Materials: 0");
        this.debugTexText = addDebugLine("Textures: 0");
        this.debugObjectsText = addDebugLine("Scene Objects: 0 (Meshes: 0)");

        currentY += 15;

        this.debugEntitiesText = addDebugLine("Entities: 0");
        this.debugPosText = addDebugLine("XYZ: 0.00 / 0.00 / 0.00");
        this.debugChunkText = addDebugLine("Chunk: 0 0 0");
        this.debugFacingText = addDebugLine("Facing: north");

        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 250;
        this.lastFpsUpdate = performance.now();
        this.currentFps = 0;

        engine.input_manager.exitedPointerlock.addEvent(() => { engine.setExtraScreen(engine.gameMenuScreen); this.engine.level.pause = true; });
    }

    getUniqueMaterialsCount() {
        if (!this.engine.scene) return 0;

        const materials = new Set();
        this.engine.scene.traverse((object) => {
            if (object.isMesh && object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => materials.add(m.id));
                } else {
                    materials.add(object.material.id);
                }
            }
        });
        return materials.size;
    }

    getSceneObjectsCount() {
        if (!this.engine.scene) return { total: 0, meshes: 0 };

        let total = 0;
        let meshes = 0;

        this.engine.scene.traverse((object) => {
            total++;
            if (object.isMesh) meshes++;
        });

        return { total, meshes };
    }

    getPlayerFacing() {
        if (!this.engine.camera) return "unknown";

        const dir = new THREE.Vector3();
        this.engine.camera.getWorldDirection(dir);

        const angle = Math.atan2(dir.x, dir.z) * (180 / Math.PI);

        if (angle >= -45 && angle < 45) return "south (+Z)";
        if (angle >= 45 && angle < 135) return "west (-X)";
        if (angle >= -135 && angle < -45) return "east (+X)";
        return "north (-Z)";
    }

    render(ctx) {
        const now = performance.now();
        this.frameCount++;

        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        this.hotbarSelector.x = this.hotbarSelectorStartX + this.hotbarSelectorPositions[this.engine.level.inventory.selected];

        if (this.engine.renderer && this.engine.renderer.info) {
            const memory = this.engine.renderer.info.memory;
            const renderStats = this.engine.renderer.info.render;
            const computeStats = this.engine.renderer.info.compute;

            const sceneStats = this.getSceneObjectsCount();

            this.debugFpsText.text = `FPS: ${this.currentFps}`;
            this.debugCallsText.text = `Draw Calls: ${renderStats?.calls ?? 0}`;
            this.debugComputeText.text = `Compute Calls: ${computeStats?.calls ?? 0}`;
            this.debugTrianglesText.text = `Triangles: ${(renderStats?.triangles ?? 0).toLocaleString()}`;
            this.debugGeoText.text = `Geometries: ${memory?.geometries ?? 0}`;
            this.debugMatText.text = `Materials: ${this.getUniqueMaterialsCount()}`;
            this.debugTexText.text = `Textures: ${memory?.textures ?? 0}`;
            this.debugObjectsText.text = `Scene Objects: ${sceneStats.total} (Meshes: ${sceneStats.meshes})`; // <- AKTUALIZACE TEXTU

            const entitiesCount = this.engine.level?.entities?.length ?? 0;
            this.debugEntitiesText.text = `Entities: ${entitiesCount}`;

            const cam = this.engine.camera || this.engine.player?.camera;
            if (cam) {
                const px = cam.position.x;
                const py = cam.position.y;
                const pz = cam.position.z;

                this.debugPosText.text = `XYZ: ${px.toFixed(2)} / ${py.toFixed(2)} / ${pz.toFixed(2)}`;

                const cx = Math.floor(px / 16);
                const cy = Math.floor(py / 16);
                const cz = Math.floor(pz / 16);
                this.debugChunkText.text = `Chunk: ${cx} ${cy} ${cz}`;

                this.debugFacingText.text = `Facing: ${this.getPlayerFacing()}`;
            }
        }

        super.render(ctx);
    }
}


export class GameMenuScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const left = 2560;
        const right = 0;

        this.blur = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Game Menu", centerX, centerY - 300, 0, 3, 0xFFFFFF, true, 1, true);

        this.addButton("Back To Game", centerX, centerY - 200, 200, un, un, () => { engine.input_manager.lockMouse() });
        this.addButton("Options", centerX, centerY + 20, 200, un, un, () => { engine.setExtraScreen(engine.inGameOptionsScreen) });
        this.addButton("Save and quit to title", centerX, centerY + 100, 200, un, un, () => { engine.saveAndQuitWorld() });

        engine.input_manager.enteredPointerlock.addEvent(() => { if (engine.extraScreen == this) { engine.extraScreen = null; this.engine.level.pause = false; } });
    }

    render(ctx) {
        this.blur.visible = this.engine.config.data.BlurEffects;
        this.blur.intensity = this.engine.config.data.BlurIntensity;

        super.render(ctx);
    }
}


export class InGameOptionsScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;
        const up = 0;
        const lefty = 2560;
        const righty = 0;

        this.blur1 = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Options", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const musicVolumeSlider = this.addSlider(
            "Music",
            {
                0: "Music: OFF"
            },
            "", "%",
            0, 100, 1,
            this.engine.config.data.Music,
            centerX - 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.Music = val }
        );
        const masterVolumeSlider = this.addSlider(
            "Sound",
            {
                0: "Sound: OFF"
            },
            "", "%",
            0, 100, 1,
            this.engine.config.data.MasterVolume,
            centerX + 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.MasterVolume = val }
        );

        const invertMouseSwitch = this.addSwitch(
            "Invert Mouse",
            {
                "ON": true, "OFF": false
            },
            engine.config.data.InvertMouse ? "ON" : "OFF",
            centerX - 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.InvertMouse = val }
        );
        const sensitivitySlider = this.addSlider(
            "Sensitivity",
            {
                0: "Sensitivity: *yawn*",
                200: "Sensitivity: HYPERSPEED!!!"
            },
            "", "%",
            0, 200, 1,
            this.engine.config.data.Sensitivity,
            centerX + 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.Sensitivity = val }
        );

        const fovSlider = this.addSlider(
            "FOV",
            {
                70: "FOV: Normal",
                110: "FOV: Quake Pro"
            },
            "", "",
            30, 110, 1,
            this.engine.config.data.FOV,
            centerX - 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.FOV = val }
        );
        const difficultySwitch = this.addSwitch(
            "Difficulty",
            {
                "Peaceful": 0,
                "Easy": 1,
                "Normal": 2,
                "Hard": 3
            },
            engine.config.getDifficulty(),
            centerX + 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.Difficulty = val }
        );

        const extrasBut = this.addButton("§6Extras", centerX, centerY + 120, un, un, un, () => { this.turnPage(3) });
        const videoSettingsBut = this.addButton("Video Settings...", centerX, centerY + 200, un, un, un, () => { this.turnPage(1) });
        const constrolsBut = this.addButton("Controls...", centerX, centerY + 280, un, un, un, () => { this.turnPage(2) });

        const doneBut = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { engine.extraScreen = engine.gameMenuScreen });

        this.turnPage(1);

        this.blur2 = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Video Settings", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const graphicsSwitch = this.addSwitch(
            "Graphics",
            {
                "Fancy": Enum.Graphics.Fancy,
                "Fast": Enum.Graphics.Fast
            },
            engine.config.getGraphics(),
            centerX - 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.Graphics = val }
        );
        const renderDistanceSwitch = this.addSwitch(
            "Render Distance",
            {
                "Far": Enum.RenderDistance.Far,
                "Normal": Enum.RenderDistance.Normal,
                "Short": Enum.RenderDistance.Short,
                "Tiny": Enum.RenderDistance.Tiny
            },
            engine.config.getRenderDistance(),
            centerX + 260, centerY - 400,
            un, un, un,
            (val) => { engine.config.data.RenderDistance = val }
        );

        const smoothLightingSwitch = this.addSwitch(
            "Smooth Lighting",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.SmoothLighting ? "ON" : "OFF",
            centerX - 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.SmoothLighting = val }
        );
        const performanceSwitch = this.addSwitch(
            "Performance",
            {
                "Balanced": Enum.Performance.Balanced,
                "MaxFPS": Enum.Performance.MaxFPS,
                "PowerSaver": Enum.Performance.PowerSaver
            },
            engine.config.getPerformance(),
            centerX + 260, centerY - 320,
            un, un, un,
            (val) => { engine.config.data.Performance = val }
        );

        const threeDAnaglyphSwitch = this.addSwitch(
            "3D Anaglyph",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data["3DAnaglyph"] ? "ON" : "OFF",
            centerX - 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data["3DAnaglyph"] = val }
        );
        const viewBobbingSwitch = this.addSwitch(
            "View Bobbing",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ViewBobbing ? "ON" : "OFF",
            centerX + 260, centerY - 240,
            un, un, un,
            (val) => { engine.config.data.ViewBobbing = val }
        );

        const guiScaleSwitch = this.addSwitch(
            "GUI Scale",
            {
                "Auto": Enum.GUIScale.Auto,
                "Large": Enum.GUIScale.Large,
                "Normal": Enum.GUIScale.Normal,
                "Small": Enum.GUIScale.Small
            },
            engine.config.getGUIScale(),
            centerX - 260, centerY - 160,
            un, un, un,
            (val) => { engine.config.data.GUIScale = val }
        );
        const cloudsSwitch = this.addSwitch(
            "Clouds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.Clouds ? "ON" : "OFF",
            centerX + 260, centerY - 160,
            un, un, un,
            (val) => { engine.config.data.Clouds = val }
        );

        const brightnessSlider = this.addSlider(
            "Brightness",
            {
                0: "Brightness: Moody",
                100: "Brightness: Bright"
            },
            "+", "%",
            0, 100, 1,
            this.engine.config.data.Brightness,
            centerX - 260, centerY - 80,
            un, un, un,
            (val) => { engine.config.data.Brightness = val }
        );
        const blurIntensitySlider = this.addSlider(
            "Blur Intensity",
            {},
            "", "",
            0, 100, 1,
            this.engine.config.data.BlurIntensity,
            centerX + 260, centerY - 80,
            un, un, un,
            (val) => { engine.config.data.BlurIntensity = val }
        );


        const particlesSwitch = this.addSwitch(
            "Particles",
            {
                "Minimal": Enum.Particles.Minimal,
                "Decreased": Enum.Particles.Decreased,
                "All": Enum.Particles.All
            },
            engine.config.getParticles(),
            centerX - 260, centerY,
            un, un, un,
            (val) => { engine.config.data.Particles = val }
        );
        const blurEffectsSwitch = this.addSwitch(
            "Blur Effects",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.BlurEffects ? "ON" : "OFF",
            centerX + 260, centerY,
            un, un, un,
            (val) => { engine.config.data.BlurEffects = val }
        );


        const fullScreenSwitch = this.addSwitch(
            "FullScreen",
            {
                "ON": true,
                "OFF": false
            },
            document.fullscreenElement !== null ? "ON" : "OFF",
            centerX - 260, centerY + 80,
            un, un, un,
            (val) => {
                if (val) {
                    if (!document.fullscreenElement) {
                        this.engine.canvas.requestFullscreen().catch(err => {
                            console.error(`fullscreen error: ${err.message}`);
                        });
                        screen.orientation.lock('landscape');
                    }
                } else {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(err => {
                            console.error(`exit fullscreen error: ${err.message}`);
                        });
                    }
                }
            }
        );

        const doneBut2 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });

        this.turnPage(2);

        this.blur3 = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Controls", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const attack = null
        const useItem = null

        const forward = null
        const left = null

        const back = null
        const right = null

        const jump = null
        const sneak = null

        const drop = null
        const inventory = null

        const chat = null
        const listPlayers = null

        const pickBlock = null

        const doneBut3 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });

        this.turnPage(3);

        this.blur4 = this.addBlurPanel(10, 0, 0, canvasW, canvasH, 0);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Extras", centerX, 90, 0, 3, 0xFFFFFF, true, 1, true);

        const menuSpinSpeedSlider = this.addSlider(
            "Menu Spin Speed",
            {
                "-10000": "Menu Spin Speed: LIGHTSPEED Backwards",
                "-5000": "Menu Spin Speed: FAST AND FURIOUS Backwards",
                "-2500": "Menu Spin Speed: Dizzy Backwards",
                "-50": "Menu Spin Speed: Normal Backwards",
                "0": "Menu Spin Speed: Motionless",
                "50": "Menu Spin Speed: Normal",
                "2500": "Menu Spin Speed: Dizzy",
                "5000": "Menu Spin Speed: FAST AND FURIOUS",
                "10000": "Menu Spin Speed: LIGHTSPEED"
            },
            "", "",
            -10000, 10000, 50,
            engine.config.data.MenuSpinSpeed,
            centerX, centerY - 400,
            250, un, un,
            (vol) => { engine.config.data.MenuSpinSpeed = vol }
        );

        const extraSoundsSwitch = this.addSwitch(
            "Extra Sounds",
            {
                "ON": true,
                "OFF": false
            },
            engine.config.data.ExtraSounds ? "ON" : "OFF",
            centerX, centerY - 300,
            un, un, un,
            (val) => { engine.config.data.ExtraSounds = val; }
        );

        const renderFactorSwitch = this.addSwitch(
            "Render Factor",
            {
                "0.05x": 0.05,
                "0.1x": 0.1,
                "0.2x": 0.2,
                "0.4x": 0.4,
                "0.8x": 0.8,
                "1x": 1,
                "1.5x": 1.5,
                "2x": 2
            },
            engine.config.data.RenderFactor + "x",
            centerX, centerY - 200,
            un, un, un,
            (val) => { engine.config.data.RenderFactor = val }
        );

        const doneBut4 = this.addButton("Done", centerX, centerY + 400, un, un, un, () => { this.turnPage(0) });
    }

    render(ctx) {
        this.blur1.visible = this.engine.config.data.BlurEffects;
        this.blur1.intensity = this.engine.config.data.BlurIntensity;
        this.blur2.visible = this.engine.config.data.BlurEffects;
        this.blur2.intensity = this.engine.config.data.BlurIntensity;
        this.blur3.visible = this.engine.config.data.BlurEffects;
        this.blur3.intensity = this.engine.config.data.BlurIntensity;
        this.blur4.visible = this.engine.config.data.BlurEffects;
        this.blur4.intensity = this.engine.config.data.BlurIntensity;

        super.render(ctx);
    }
}


export class SaveWorldScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;

        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Saving World...", centerX, centerY, 0, 3, 0xFFFFFF, true, 1, true);
    }

    onSave(progress) {
        this.engine.leaveWorld();
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("panorama0"); const p3 = this.engine.asset_manager.get("panorama3");
            const p1 = this.engine.asset_manager.get("panorama1"); const p4 = this.engine.asset_manager.get("panorama4");
            const p2 = this.engine.asset_manager.get("panorama2"); const p5 = this.engine.asset_manager.get("panorama5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}


export class GenerateWorldScreen extends Screen {
    constructor(engine) {
        super(engine);

        const canvasW = 2560;
        const canvasH = 1440;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const down = 1440;

        this.bg = this.addTiledTexturePanel("dirt", 0, 0, canvasW, canvasH, 6.8, 0, 1);
        this.addColorPanel("black", 0, 0, canvasW, canvasH, 0, 0.75);
        this.addBitmapText("Generate World", centerX, centerY, 0, 3, 0xFFFFFF, true, 1, true);
    }

    onGenerate(progress) {
        this.engine.enterWorld();
    }

    init() {
        if (this.engine.renderState.state == Enum.RenderState.Clear) {
            this.engine.setRenderState(Enum.RenderState.MenuBackground);

            const p0 = this.engine.asset_manager.get("panorama0"); const p3 = this.engine.asset_manager.get("panorama3");
            const p1 = this.engine.asset_manager.get("panorama1"); const p4 = this.engine.asset_manager.get("panorama4");
            const p2 = this.engine.asset_manager.get("panorama2"); const p5 = this.engine.asset_manager.get("panorama5");

            this.engine.setPanorama(p0, p1, p2, p3, p4, p5); this.engine.camera.position.set(0, 0, 0);
        }
    }

    render(ctx) {
        const speedFactor = (this.engine.config.data.MenuSpinSpeed ?? 100) / 100;
        const rotX = (Math.sin((this.engine.ms() / 10 / 400) * speedFactor) * 25 + 20) * deg2rad;
        const rotY = (-this.engine.ms() / 10 * 0.1) * speedFactor * deg2rad;

        this.engine.camera.rotation.set(rotX, rotY, 0, 'YXZ');

        super.render(ctx);
    }
}
