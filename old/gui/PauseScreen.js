import { Screen } from './Screen.js';
import { Button } from './Button.js';

export class PauseScreen extends Screen {
    initUI() {
        this.buttons = [];
        const scale = this.height / 480;

        const bw = 200;
        const bh = 20;
        const cx = this.width / 2 - (bw / 2) * scale;
        const cy = this.height / 4;
        const spacing = 24 * scale;

        const yOffsets = [0, 1, 2, 3, 5];
        const labels = [
            "Options...",
            "Generate new level",
            "Save level..",
            "Load level..",
            "Back to game"
        ];

        for (let i = 0; i < labels.length; i++) {
            const btn = new Button(i, cx, cy + yOffsets[i] * spacing, bw, bh, labels[i]);
            this.buttons.push(btn);
        }
    }

    mouseClicked(x, y, buttonNum) {
        if (buttonNum === 0) {
            // BUGFIX: this used /240 but initUI() and render() use /480.
            // The 2x larger scale made each button's hit area 2x taller than
            // the rendered button, so adjacent buttons' hit areas overlapped.
            // Clicking "Save level" also hit "Generate new level", and
            // clicking "Load level" also hit "Save level".
            const scale = this.height / 480;
            for (let i = 0; i < this.buttons.length; i++) {
                const btn = this.buttons[i];
                if (this.buttonHitTest(btn, x, y, scale)) {
                    this.buttonClicked(btn);
                    // Only fire one button per click - defensive guard
                    // against any future hit-test drift.
                    break;
                }
            }
        }
    }

    async buttonClicked(button) {
        const mc = this.minecraft;
        const isMobile = mc.mobileControls && mc.mobileControls.isMobile;

        // Use else-if so only one action fires per click, even if multiple
        // buttons somehow pass the hit test.
        if (button.id === 0) {
            // Options - not implemented
        } else if (button.id === 1) {
            await mc.generateNewLevel();
            mc.setScreen(null);
            if (!isMobile) document.body.requestPointerLock();
            mc.pause = false;
        } else if (button.id === 2) {
            mc.saveLevel();
        } else if (button.id === 3) {
            mc.loadLevel();
        } else if (button.id === 4) {
            mc.setScreen(null);
            if (!isMobile) document.body.requestPointerLock();
            mc.pause = false;
        }
    }

    render(xm, ym, w, h) {
        this.width = w;
        this.height = h;
        const scale = h / 480;

        const bw = 200;
        const bh = 20;
        const cx = this.width / 2 - (bw / 2) * scale;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].x = cx;
            this.buttons[i].w = bw;
            this.buttons[i].h = bh;
            this.buttons[i].active = true;
            this.buttons[i].visible = true;
        }

        this.fillGradient(0, 0, w, h, 0x60000000, 0xA0000000);

        this.drawCenteredString("Game menu", this.width / 2, 80 * scale, 0xFFFFFF, scale);

        for (let i = 0; i < this.buttons.length; i++) {
            this.drawButton(this.buttons[i], xm, ym, scale);
        }
    }
}