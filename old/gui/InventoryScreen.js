import { Screen } from './Screen.js';
import { Inventory } from '../player/Inventory.js';
import { Tile } from '../level/tile/Tile.js';

export class InventoryScreen extends Screen {
    initUI() {
        this.blockButtons = [];
        const scale = this.height / 240;
        const blockSize = 22;
        const cols = 9;
        const blocks = Inventory.ALLOWED_TILES;
        const rows = Math.ceil(blocks.length / cols);
        const gridW = cols * blockSize * scale;
        const gridH = rows * blockSize * scale;
        const startX = (this.width - gridW) / 2;
        const startY = (this.height - gridH) / 2 + 10 * scale;

        for (let i = 0; i < blocks.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            this.blockButtons.push({
                x: startX + col * blockSize * scale,
                y: startY + row * blockSize * scale,
                w: blockSize * scale,
                h: blockSize * scale,
                blockId: blocks[i]
            });
        }
    }

    mouseClicked(x, y, button) {
        if (button !== 0) return;

        for (const btn of this.blockButtons) {
            if (x >= btn.x && x < btn.x + btn.w &&
                y >= btn.y && y < btn.y + btn.h) {
                this.minecraft.inventory.slots[this.minecraft.inventory.selected] = btn.blockId;
                this.minecraft.setScreen(null);
                return;
            }
        }
        this.minecraft.setScreen(null);
    }

    render(xm, ym, w, h) {
        this.width = w;
        this.height = h;
        const scale = h / 240;

        this.fillGradient(0, 0, w, h, 0x80000000, 0xB0000000);

        this.drawCenteredString("Select Block", w / 2, 20 * scale, 0xFFFFFF, scale);

        const gui = this.minecraft.guiRenderer;
        const ctx = this.minecraft.ctx;

        for (const btn of this.blockButtons) {
            const tile = Tile.tiles[btn.blockId];
            if (!tile) continue;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

            if (gui) {
                gui.drawBlockIcon(tile, btn.x + btn.w / 2, btn.y + btn.h / 2, 7 * scale, 1.0);
            }

            if (this.minecraft.inventory.slots[this.minecraft.inventory.selected] === btn.blockId) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 * scale;
                ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            }
        }
    }
}