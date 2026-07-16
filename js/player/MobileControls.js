export class MobileControls {
    constructor(minecraft) {
        this.minecraft = minecraft;
        this.isMobile = MobileControls.detectMobile();

        this.joystickX = 0;
        this.joystickY = 0;

        this.actionTouchId = null;
        this.actionStartX = 0;
        this.actionStartY = 0;
        this.actionLastX = 0;
        this.actionLastY = 0;
        this.actionStartTime = 0;
        this.actionMode = null; // null | 'pending' | 'look' | 'mine'
        this.MINE_DELAY = 250;     // ms hold before mining starts
        this.MOVE_THRESHOLD = 10;  // px of movement before look mode activates
        this.LOOK_SENSITIVITY = 1.5;

        // Touch tracking
        this.touches = {};

        // Layout (set in updateLayout)
        this.joyCenterX = 0;
        this.joyCenterY = 0;
        this.joyRadius = 0;
        this.joyThumbX = 0;
        this.joyThumbY = 0;
        this.joyThumbRadius = 0;
        this.jumpBtn = null;
        this.invBtn = null;
        this.steveBtn = null;
        this.pauseBtn = null;
        this.hotbarSlots = [];

        if (this.isMobile) {
            this.updateLayout();
            this.attachTouchEvents();
            document.addEventListener('touchmove', (e) => {
                if (this.isMobile) e.preventDefault();
            }, { passive: false });
        }
    }

    static detectMobile() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())) return true;
        if ('ontouchstart' in window && window.innerWidth <= 1024) return true;
        if (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) return true;
        return false;
    }

    updateLayout() {
        const canvas = this.minecraft.guiCanvas;
        if (!canvas) return;
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = ch / 240;

        // Joystick (bottom-left)
        this.joyRadius = 42 * scale;
        this.joyThumbRadius = 18 * scale;
        this.joyCenterX = 68 * scale;
        this.joyCenterY = ch - 52 * scale;
        this.joyThumbX = this.joyCenterX;
        this.joyThumbY = this.joyCenterY;

        // Jump button (bottom-right)
        const btnR = 30 * scale;
        this.jumpBtn = { x: cw - 68 * scale, y: ch - 55 * scale, r: btnR };

        // Top-right buttons: inventory, steve, pause
        const topR = 20 * scale;
        const topY = 24 * scale;
        this.pauseBtn = { x: cw - 24 * scale, y: topY, r: topR };
        this.steveBtn = { x: cw - 64 * scale, y: topY, r: topR };
        this.invBtn = { x: cw - 104 * scale, y: topY, r: topR };

        // Hotbar touch areas
        const slotSize = 20 * scale;
        const hotbarW = 9 * slotSize;
        const hotbarX = (cw - hotbarW) / 2;
        const hotbarY = ch - slotSize - 2 * scale;
        this.hotbarSlots = [];
        for (let i = 0; i < 9; i++) {
            this.hotbarSlots.push({
                x: hotbarX + i * slotSize,
                y: hotbarY,
                w: slotSize,
                h: slotSize
            });
        }
    }

    attachTouchEvents() {
        document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
    }

    screenToCanvas(screenX, screenY) {
        const canvas = this.minecraft.guiCanvas;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (screenX - rect.left) * (canvas.width / rect.width),
            y: (screenY - rect.top) * (canvas.height / rect.height)
        };
    }

    dist(x1, y1, x2, y2) {
        const dx = x1 - x2, dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    inRect(cx, cy, rx, ry, rw, rh) {
        return cx >= rx && cy >= ry && cx < rx + rw && cy < ry + rh;
    }

    inCircle(cx, cy, bx, by, br) {
        return this.dist(cx, cy, bx, by) <= br;
    }

    // When a screen (pause, inventory) is active, mobile controls step aside
    // and let the guiCanvas touch handler deal with screen clicks.
    isScreenActive() {
        return this.minecraft.screen !== null;
    }

    onTouchStart(e) {
        if (!this.isMobile) return;
        e.preventDefault();
        if (this.isScreenActive()) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const p = this.screenToCanvas(t.clientX, t.clientY);
            let zone = this.hitTest(p.x, p.y);
            this.touches[t.identifier] = {
                startX: p.x, startY: p.y,
                lastX: p.x, lastY: p.y,
                zone: zone
            };
            this.applyTouchStart(zone, t.identifier, p.x, p.y);
        }
    }

    onTouchMove(e) {
        if (!this.isMobile) return;
        e.preventDefault();
        if (this.isScreenActive()) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const p = this.screenToCanvas(t.clientX, t.clientY);
            const info = this.touches[t.identifier];
            if (!info) continue;

            if (info.zone === 'joystick') {
                this.updateJoystick(p.x, p.y);
            } else if (info.zone === 'action') {
                this.handleActionMove(p.x, p.y);
            }

            info.lastX = p.x;
            info.lastY = p.y;
        }
    }

    onTouchEnd(e) {
        if (!this.isMobile) return;
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {
            const id = e.changedTouches[i].identifier;
            const info = this.touches[id];
            if (!info) continue;
            this.applyTouchEnd(info.zone, id);
            delete this.touches[id];
        }
    }

    hitTest(cx, cy) {
        if (this.inCircle(cx, cy, this.joyCenterX, this.joyCenterY, this.joyRadius)) return 'joystick';
        if (this.inCircle(cx, cy, this.jumpBtn.x, this.jumpBtn.y, this.jumpBtn.r)) return 'jump';
        if (this.inCircle(cx, cy, this.invBtn.x, this.invBtn.y, this.invBtn.r)) return 'inventory';
        if (this.inCircle(cx, cy, this.steveBtn.x, this.steveBtn.y, this.steveBtn.r)) return 'steve';
        if (this.inCircle(cx, cy, this.pauseBtn.x, this.pauseBtn.y, this.pauseBtn.r)) return 'pause';
        for (let i = 0; i < this.hotbarSlots.length; i++) {
            const s = this.hotbarSlots[i];
            if (this.inRect(cx, cy, s.x, s.y, s.w, s.h)) return 'hotbar';
        }
        return 'action';
    }

    updateJoystick(x, y) {
        let dx = x - this.joyCenterX;
        let dy = y - this.joyCenterY;
        const maxDist = this.joyRadius - this.joyThumbRadius;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > maxDist && d > 0) {
            dx = dx / d * maxDist;
            dy = dy / d * maxDist;
        }
        this.joyThumbX = this.joyCenterX + dx;
        this.joyThumbY = this.joyCenterY + dy;
        this.joystickX = dx / maxDist;
        this.joystickY = dy / maxDist;
        this.applyJoystick();
    }

    applyJoystick() {
        const deadzone = 0.15;
        const p = this.minecraft.player;
        if (!p) return;
        p.keys['KeyW'] = this.joystickY < -deadzone;
        p.keys['KeyS'] = this.joystickY > deadzone;
        p.keys['KeyA'] = this.joystickX < -deadzone;
        p.keys['KeyD'] = this.joystickX > deadzone;
    }

    applyTouchStart(zone, id, x, y) {
        const mc = this.minecraft;
        switch (zone) {
            case 'joystick':
                this.updateJoystick(x, y);
                break;
            case 'jump':
                if (mc.player) mc.player.keys['Space'] = true;
                break;
            case 'inventory':
                this.openInventory();
                break;
            case 'steve':
                this.spawnSteve();
                break;
            case 'pause':
                mc.pause = true;
                import('./gui/PauseScreen.js').then(m => mc.setScreen(new m.PauseScreen()));
                break;
            case 'hotbar': {
                const info = this.touches[id];
                if (!info) break;
                for (let i = 0; i < this.hotbarSlots.length; i++) {
                    const s = this.hotbarSlots[i];
                    if (this.inRect(info.startX, info.startY, s.x, s.y, s.w, s.h)) {
                        mc.inventory.selectSlot(i);
                        mc.updateGUIBlock();
                        break;
                    }
                }
                break;
            }
            case 'action':
                // Start Bedrock-style gesture detection
                this.actionTouchId = id;
                this.actionStartX = x;
                this.actionStartY = y;
                this.actionLastX = x;
                this.actionLastY = y;
                this.actionStartTime = performance.now();
                this.actionMode = 'pending';
                break;
        }
    }

    // Core Bedrock gesture logic: distinguish tap (place) vs hold (mine) vs drag (look)
    handleActionMove(x, y) {
        if (this.actionMode === null) return;

        const dx = x - this.actionStartX;
        const dy = y - this.actionStartY;
        const distFromStart = Math.sqrt(dx * dx + dy * dy);

        // Any significant movement switches to look mode (stops mining if active)
        if (distFromStart > this.MOVE_THRESHOLD) {
            if (this.actionMode === 'mine') {
                this.minecraft.leftMouseButtonDown = false;
            }
            if (this.actionMode !== 'look') {
                this.actionMode = 'look';
            }
        }

        // In look mode, rotate camera based on delta
        if (this.actionMode === 'look') {
            const deltaX = x - this.actionLastX;
            const deltaY = y - this.actionLastY;
            if (this.minecraft.player) {
                this.minecraft.player.turn(
                    -deltaX * this.LOOK_SENSITIVITY,
                    deltaY * this.LOOK_SENSITIVITY
                );
            }
        }

        this.actionLastX = x;
        this.actionLastY = y;
    }

    applyTouchEnd(zone, id) {
        const mc = this.minecraft;
        switch (zone) {
            case 'joystick':
                this.joyThumbX = this.joyCenterX;
                this.joyThumbY = this.joyCenterY;
                this.joystickX = 0;
                this.joystickY = 0;
                this.applyJoystick();
                break;
            case 'jump':
                if (mc.player) mc.player.keys['Space'] = false;
                break;
            case 'action':
                if (this.actionMode === 'pending') {
                    // Quick tap with no movement → place block
                    this.placeBlock();
                }
                if (this.actionMode === 'mine') {
                    mc.leftMouseButtonDown = false;
                }
                this.actionMode = null;
                this.actionTouchId = null;
                break;
        }
    }

    // Place a block at the targeted position (used for tap-to-place)
    placeBlock() {
        const mc = this.minecraft;
        if (!mc.levelRenderer || !mc.player || !mc.level) return;
        const hit = mc.levelRenderer.pick(5.0, mc.camera);
        if (!hit) return;

        let x = hit.x, y = hit.y, z = hit.z;
        if (hit.f === 0) y--;
        if (hit.f === 1) y++;
        if (hit.f === 2) z--;
        if (hit.f === 3) z++;
        if (hit.f === 4) x--;
        if (hit.f === 5) x++;

        const tileAABB = new AABB(x, y, z, x + 1, y + 1, z + 1);
        if (mc.isFree(tileAABB)) {
            mc.level.setTile(x, y, z, mc.inventory.getSelectedSlotId());
            if (mc.forceChunkRebuild) mc.forceChunkRebuild(x, y, z);
        }
    }

    spawnSteve() {
        const mc = this.minecraft;
        if (!mc.player || !mc.level) return;
        import('./character/Zombie.js').then(({ Zombie }) => {
            const z = new Zombie(mc.level, mc.player.x, mc.player.y, mc.player.z, mc.scene);
            mc.entities.push(z);
        });
    }

    openInventory() {
        const mc = this.minecraft;
        import('./gui/InventoryScreen.js').then(({ InventoryScreen }) => {
            mc.setScreen(new InventoryScreen());
        });
    }

    // ===== RENDERING =====

    render(ctx, canvasW, canvasH) {
        if (!this.isMobile) return;
        this.updateLayout();

        // Check for mine mode transition (finger held still > MINE_DELAY)
        if (this.actionMode === 'pending' &&
            performance.now() - this.actionStartTime > this.MINE_DELAY) {
            this.actionMode = 'mine';
            this.minecraft.leftMouseButtonDown = true;
        }

        const scale = canvasH / 240;

        this.renderJoystick(ctx, scale);
        this.renderCircleButton(ctx, this.jumpBtn, '▲', this.isZoneActive('jump'),
            'rgba(100, 180, 255, 0.3)', scale);
        this.renderCircleButton(ctx, this.invBtn, 'INV', this.isZoneActive('inventory'),
            'rgba(180, 160, 80, 0.3)', scale);
        this.renderCircleButton(ctx, this.steveBtn, 'S', this.isZoneActive('steve'),
            'rgba(100, 220, 120, 0.3)', scale);
        this.renderPauseButton(ctx, scale);
    }

    renderJoystick(ctx, scale) {
        // Outer base
        ctx.beginPath();
        ctx.arc(this.joyCenterX, this.joyCenterY, this.joyRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Thumb
        ctx.beginPath();
        ctx.arc(this.joyThumbX, this.joyThumbY, this.joyThumbRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
    }

    renderCircleButton(ctx, btn, label, pressed, color, scale) {
        ctx.beginPath();
        ctx.arc(btn.x, btn.y, btn.r, 0, Math.PI * 2);
        ctx.fillStyle = pressed ? color.replace('0.3', '0.6') : color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${14 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, btn.x, btn.y);
    }

    renderPauseButton(ctx, scale) {
        const sz = 8 * scale;
        const x = this.pauseBtn.x;
        const y = this.pauseBtn.y;
        const pressed = this.isZoneActive('pause');

        ctx.beginPath();
        ctx.arc(x, y, this.pauseBtn.r, 0, Math.PI * 2);
        ctx.fillStyle = pressed ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - sz * 0.5, y - sz, sz * 0.3, sz * 2);
        ctx.fillRect(x + sz * 0.2, y - sz, sz * 0.3, sz * 2);
    }

    isZoneActive(zone) {
        for (const id in this.touches) {
            if (this.touches[id].zone === zone) return true;
        }
        return false;
    }
}