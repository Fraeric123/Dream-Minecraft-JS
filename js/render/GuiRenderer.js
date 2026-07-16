import * as THREE from '../libs/three.module.min.js';
import { Tile } from '../level/tile/Tile.js';
import { Tesselator } from '../render/Tesselator.js';

export class GuiRenderer {
    constructor(ctx, bitmapFont, minecraft) {
        this.ctx = ctx;
        this.font = bitmapFont;
        this.minecraft = minecraft;
        this.guiImage = null;
        this.guiReady = false;

        this.guiImage = new Image();
        this.guiImage.onload = () => { this.guiReady = true; };
        this.guiImage.src = './assets/textures/gui.png';

        this.terrainImage = null;
        this.terrainReady = false;
        this.terrainImage = new Image();
        this.terrainImage.onload = () => { this.terrainReady = true; };
        this.terrainImage.src = './assets/textures/terrain.png';

        this._blockPreviewCache = new Map();
    }

    clearBlockPreviewCache() {
        this._blockPreviewCache.clear();
    }

    drawTexture(screenX, screenY, texU, texV, texW, texH, scale) {
        if (!this.guiReady) return;
        this.ctx.drawImage(
            this.guiImage,
            texU, texV, texW, texH,
            screenX, screenY,
            texW * scale, texH * scale
        );
    }

    drawHotbar(x, y, scale) {
        if (!this.guiReady) return;
        this.ctx.drawImage(
            this.guiImage,
            0, 0, 182, 22,
            x, y,
            182 * scale, 22 * scale
        );
    }

    drawSelectedSlot(x, y, scale) {
        if (!this.guiReady) return;
        this.ctx.drawImage(
            this.guiImage,
            0, 22, 24, 22,
            x, y,
            24 * scale, 22 * scale
        );
    }

    renderBlockPreview(blockId, options = {}) {
        const {
            width = 64,
            height = 64,
            zoom = 1.0,
            direction = { x: 1, y: 1, z: 1 }
        } = options;

        const renderer = this.minecraft.renderer;
        const level = this.minecraft.level;

        if (!renderer || !level || !level.material) {
            return null;
        }

        const tile = Tile.tiles[blockId];
        if (!tile) return null;

        const realLevel = level;
        const stubLevel = {
            material: realLevel.material,
            texture: realLevel.texture,
            width: 1, height: 1, depth: 1,
            isSolidTile: () => false,
            getTile: () => Tile.air,
            isLit: () => true,
            getBrightness: () => 1.0,
        };

        const t = new Tesselator();
        t.init();
        tile.render(t, stubLevel, 0, 0, 0, 0);

        const geometry = t.flush();
        if (!geometry) return null;

        const previewScene = new THREE.Scene();
        const mesh = new THREE.Mesh(geometry, stubLevel.material);
        previewScene.add(mesh);

        const center = new THREE.Vector3(0.5, 0.5, 0.5);
        const dir = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
        const distance = 10;

        const aspect = width / height;
        const halfExtent = 1.0 / zoom;

        const cam = new THREE.OrthographicCamera(
            -halfExtent * aspect, halfExtent * aspect,
            halfExtent, -halfExtent,
            0.1, 100
        );

        cam.up.set(0, 1, 0);
        cam.position.copy(center).add(dir.clone().multiplyScalar(distance));
        cam.lookAt(center);

        const renderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
        });

        const prevRenderTarget = renderer.getRenderTarget();
        const prevClearColor = new THREE.Color();
        renderer.getClearColor(prevClearColor);
        const prevClearAlpha = renderer.getClearAlpha();

        renderer.setRenderTarget(renderTarget);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        renderer.render(previewScene, cam);

        renderer.setRenderTarget(prevRenderTarget);
        renderer.setClearColor(prevClearColor, prevClearAlpha);

        const buffer = new Uint8Array(width * height * 4);
        renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
            const srcRow = (height - 1 - y) * width * 4;
            const destRow = y * width * 4;
            for (let i = 0; i < width * 4; i++) {
                imageData.data[destRow + i] = buffer[srcRow + i];
            }
        }
        ctx.putImageData(imageData, 0, 0);

        renderTarget.dispose();
        geometry.dispose();

        return canvas;
    }

    drawBlockIcon(tile, cx, cy, iconSize, brightness = 1.0) {
        const ctx = this.ctx;
        const blockId = tile.id;
        const size = Math.max(1, Math.floor(iconSize)) * 2.5;
        const dx = Math.floor(cx - size / 2);
        const dy = Math.floor(cy - size / 2);

        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = Math.max(0, Math.min(1, brightness));
        ctx.imageSmoothingEnabled = false;

        let previewCanvas = this._blockPreviewCache.get(blockId);
        if (!previewCanvas) {
            previewCanvas = this.renderBlockPreview(blockId, {
                width: 64,
                height: 64,
                zoom: 1.0,
                direction: { x: 1, y: 1, z: 1 }
            });
            if (previewCanvas) {
                this._blockPreviewCache.set(blockId, previewCanvas);
            }
        }

        if (previewCanvas) {
            ctx.drawImage(previewCanvas, 0, 0, 64, 64, dx, dy, size, size);
        }

        ctx.globalAlpha = prevAlpha;
    }

    drawButton(x, y, width, height, text, hovered, enabled, scale) {
        if (!this.guiReady) return;

        const state = !enabled ? 0 : (hovered ? 2 : 1);
        const texV = 46 + state * 20;
        const halfW = width / 2;

        this.ctx.drawImage(
            this.guiImage,
            0, texV, halfW, 20,
            x, y,
            halfW * scale, height * scale
        );

        this.ctx.drawImage(
            this.guiImage,
            200 - halfW, texV, halfW, 20,
            x + halfW * scale, y,
            halfW * scale, height * scale
        );

        const color = !enabled ? 0xA060C0 : (hovered ? 0xFFFFA0 : 0xE0E0E0);

        const textX = x + (width * scale) / 2 - this.font.getTextWidth(text, scale) / 2;
        const textY = y + (height * scale - 8 * scale) / 2;
        this.font.drawText(text, textX, textY, true, scale, color);
    }

    drawCrosshair(centerX, centerY, scale = 1) {
        const crosshairSize = 4 * scale;
        const crosshairLineWidth = scale;
        const gap = 0;

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'difference';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = crosshairLineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - crosshairSize, centerY);
        this.ctx.lineTo(centerX - gap, centerY);
        this.ctx.moveTo(centerX + gap, centerY);
        this.ctx.lineTo(centerX + crosshairSize, centerY);
        this.ctx.moveTo(centerX, centerY - crosshairSize);
        this.ctx.lineTo(centerX, centerY - gap);
        this.ctx.moveTo(centerX, centerY + gap);
        this.ctx.lineTo(centerX, centerY + crosshairSize);
        this.ctx.stroke();
        this.ctx.restore();
    }

    fill(x0, y0, x1, y1, argbColor) {
        const a = ((argbColor >>> 24) & 0xFF) / 255;
        const r = ((argbColor >>> 16) & 0xFF) / 255;
        const g = ((argbColor >>> 8) & 0xFF) / 255;
        const b = (argbColor & 0xFF) / 255;
        this.ctx.fillStyle = `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    fillGradient(x0, y0, x1, y1, topColor, bottomColor) {
        const tA = ((topColor >>> 24) & 0xFF) / 255;
        const tR = ((topColor >>> 16) & 0xFF);
        const tG = ((topColor >>> 8) & 0xFF);
        const tB = (topColor & 0xFF);
        const bA = ((bottomColor >>> 24) & 0xFF) / 255;
        const bR = ((bottomColor >>> 16) & 0xFF);
        const bG = ((bottomColor >>> 8) & 0xFF);
        const bB = (bottomColor & 0xFF);

        const grad = this.ctx.createLinearGradient(0, y0, 0, y1);
        grad.addColorStop(0, `rgba(${tR},${tG},${tB},${tA})`);
        grad.addColorStop(1, `rgba(${bR},${bG},${bB},${bA})`);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    drawCenteredString(text, x, y, color, scale) {
        const w = this.font.getTextWidth(text, scale);
        this.font.drawText(text, x - w / 2, y, true, scale, color);
    }
}