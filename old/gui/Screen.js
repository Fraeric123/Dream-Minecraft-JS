export class Screen {
    init(minecraft, width, height) {
        this.minecraft = minecraft;
        this.width = width;
        this.height = height;
        this.initUI();
    }

    initUI() { }

    fill(x0, y0, x1, y1, color) {
        this.minecraft.ctx.fillStyle = color;
        this.minecraft.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    fillGradient(x0, y0, x1, y1, topColor, bottomColor) {
        const ctx = this.minecraft.ctx;
        const grad = ctx.createLinearGradient(0, y0, 0, y1);
        const tA = ((topColor >>> 24) & 0xFF) / 255;
        const tR = ((topColor >>> 16) & 0xFF);
        const tG = ((topColor >>> 8) & 0xFF);
        const tB = (topColor & 0xFF);
        const bA = ((bottomColor >>> 24) & 0xFF) / 255;
        const bR = ((bottomColor >>> 16) & 0xFF);
        const bG = ((bottomColor >>> 8) & 0xFF);
        const bB = (bottomColor & 0xFF);
        grad.addColorStop(0, `rgba(${tR},${tG},${tB},${tA})`);
        grad.addColorStop(1, `rgba(${bR},${bG},${bB},${bA})`);
        ctx.fillStyle = grad;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    drawCenteredString(str, x, y, hexColor, scale = 2) {
        const textWidth = this.minecraft.bitmap_font.getTextWidth(str, scale);
        this.minecraft.bitmap_font.drawText(str, x - textWidth / 2, y, true, scale, hexColor);
    }

    drawButton(btn, mouseX, mouseY, scale) {
        if (!btn.visible) return;
        const gui = this.minecraft.guiRenderer;
        const scaledW = btn.w * scale;
        const scaledH = btn.h * scale;
        const hovered = mouseX >= btn.x && mouseX < btn.x + scaledW &&
            mouseY >= btn.y && mouseY < btn.y + scaledH;

        if (gui && gui.guiReady) {
            gui.drawButton(btn.x, btn.y, btn.w, btn.h, btn.msg, hovered, btn.active, scale);
        } else {
            const ctx = this.minecraft.ctx;
            ctx.fillStyle = hovered ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)';
            ctx.fillRect(btn.x, btn.y, scaledW, scaledH);
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(btn.x, btn.y, scaledW, scaledH);
            this.drawCenteredString(btn.msg, btn.x + scaledW / 2, btn.y + (scaledH - 8 * scale) / 2, btn.active ? (hovered ? 0xFFFFA0 : 0xE0E0E0) : 0xA0A0A0, scale);
        }
    }

    buttonHitTest(btn, x, y, scale) {
        if (!btn.visible || !btn.active) return false;
        return x >= btn.x && x < btn.x + btn.w * scale &&
            y >= btn.y && y < btn.y + btn.h * scale;
    }

    updateEvents() { }
    keyPressed(eventKey) { }
    mouseClicked(x, y, button) { }
    tick() { }
}