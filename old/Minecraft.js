import * as THREE from './libs/three.module.min.js';
import { sleep, Vec3, HitResult, JavaRandom } from './Utils.js';
import { AABB } from './phys/AABB.js';
import { Frustum } from './render/Frustum.js';
import { Screen } from './gui/Screen.js';
import { Button } from './gui/Button.js';
import { PauseScreen } from './gui/PauseScreen.js';
import { LevelGenScreen } from './gui/LevelGenScreen.js';
import { InventoryScreen } from './gui/InventoryScreen.js';
import { GuiRenderer } from './render/GuiRenderer.js';
import { BitmapFont } from './gui/BitmapFont.js';
import { CanvasRenderer } from './render/CanvasRenderer.js';
import { Tile } from './level/tile/Tile.js';
import { Level } from './level/Level.js';
import { Chunk } from './level/Chunk.js';
import { LevelGen } from './level/gen/LevelGen.js';
import { ParticleEngine } from './particle/ParticleEngine.js';
import { LevelRenderer } from './render/LevelRenderer.js';
import { MobileControls } from './player/MobileControls.js';
import { Inventory } from './player/Inventory.js';
import { Textures } from './render/Textures.js';
import { Player } from './player/Player.js';
import { Zombie } from './character/Zombie.js';
import { Timer } from './Timer.js';

export const zombie_texture = Textures.loadTexture('./assets/textures/char.png');
export const terrain_atlas_texture = Textures.loadTexture('./assets/textures/terrain.png');

class Minecraft {
    constructor() {
        this.timer = new Timer(20.0, this);

        this.level = null;
        this.levelRenderer = null;
        this.player = null;
        this.entities = [];

        this.inventory = new Inventory();
        this.mobileControls = null;

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.canvas_renderer = new CanvasRenderer(this);
        this.ctx = this.canvas_renderer.ctx;

        this.pause = false;

        this.title = "0.0.23a_01";

        this.screen = null;
        this.mouseX = 0;
        this.mouseY = 0;

        this.fogColor = new THREE.Color(0.5, 0.8, 1.0);

        this.skyFogColor = new THREE.Color(0.5, 0.8, 1.0);
        this.skyFogDensity = 0.008;

        this.waterFogColor = new THREE.Color(0.2, 0.2, 0.8);
        this.waterFogDensity = 0.1;

        this.lavaFogColor = new THREE.Color(0.8, 0.2, 0.2);
        this.lavaFogDensity = 0.4;

        this.bitmap_font = new BitmapFont(this.ctx, "./assets/fonts/default.gif");
    }

    renderGUI(skippause) {
        const w = this.canvas_renderer.VIRTUAL_WIDTH;
        const h = this.canvas_renderer.VIRTUAL_HEIGHT;
        const scale = h / 480;

        this.ctx.imageSmoothingEnabled = false;

        if (!this.guiRenderer) {
            this.guiRenderer = new GuiRenderer(this.ctx, this.bitmap_font, this);
        }

        this.renderHotbar(w, h, scale);

        this.bitmap_font.drawText(this.title, 2 * scale, 2 * scale, true, scale, 0xFFFFFF);
        this.bitmap_font.drawText(`${this.timer.calmfps.toFixed(0)} fps, ${this.timer.chunkUpdatesPerSecond} chunk updates`, 2 * scale, 12 * scale, true, scale, 0xFFFFFF);

        this.guiRenderer.drawCrosshair(w / 2, h / 2, scale);

        if (this.mobileControls && this.mobileControls.isMobile) {
            this.mobileControls.render(this.ctx, w, h);
        }

        if (this.screen !== null) {
            this.screen.render(this.mouseX, this.mouseY, w, h);
        }
    }

    renderHotbar(canvasW, canvasH, scale) {
        const slotSize = 20 * scale;
        const hotbarW = 182 * scale;
        const hotbarH = 22 * scale;
        const hotbarX = (canvasW - hotbarW) / 2;
        const hotbarY = canvasH - hotbarH-0 * scale;

        if (this.guiRenderer && this.guiRenderer.guiReady) {
            this.guiRenderer.drawHotbar(hotbarX, hotbarY, scale);
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(hotbarX, hotbarY, hotbarW, hotbarH);
        }

        const selectedX = hotbarX - scale + this.inventory.selected * slotSize;
        const selectedY = hotbarY - scale;
        if (this.guiRenderer && this.guiRenderer.guiReady) {
            this.guiRenderer.drawSelectedSlot(selectedX, selectedY, scale);
        } else {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.fillRect(selectedX + scale, selectedY + scale, slotSize, slotSize);
        }

        if (this.guiRenderer) {
            const iconSize = 7 * scale;
            for (let i = 0; i < 9; i++) {
                const tileId = this.inventory.slots[i];
                if (tileId <= 0) continue;
                const tile = Tile.tiles[tileId];
                if (!tile) continue;
                const cx = hotbarX + 11 * scale + i * slotSize;
                const cy = hotbarY + 11 * scale;
                this.guiRenderer.drawBlockIcon(tile, cx, cy, iconSize, 1.0);
            }
        }
    }

    async init() {
        const w = this.canvas_renderer.VIRTUAL_WIDTH;
        const h = this.canvas_renderer.VIRTUAL_HEIGHT;

        this.renderer.setClearColor(this.fogColor);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.008);

        this.camera = new THREE.PerspectiveCamera(70, w / h, 0.01, 1000.0);

        await this.generateNewLevel();

        this.setScreen(new PauseScreen());

        this.setupControls();

        this.mobileControls = new MobileControls(this);

        if (this.mobileControls.isMobile) {
            this.pause = false;
            this.screen = null;
        }

        this.render();
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        try {
            if (!this.pause) {
                this.timer.advanceTime();
                for (let i = 0; i < this.timer.ticks; i++) {
                    this.tick();
                }
            }
            this.render();
        } catch (e) {
            console.error('Game loop error:', e);
        }
    }

    async run() {
        await this.init();
        this.loop();
    }

    // ===== Save / Load format =====
    // The .dat file is gzip-compressed. The decompressed payload is either:
    //
    //   New format (v1): 38-byte header + raw blocks
    //     offset 0  : magic "DMJS" (4 bytes)
    //     offset 4  : version uint16 LE (== 1)
    //     offset 6  : width  uint32 LE
    //     offset 10 : height uint32 LE
    //     offset 14 : depth  uint32 LE
    //     offset 18 : player.x float32 LE
    //     offset 22 : player.y float32 LE
    //     offset 26 : player.z float32 LE
    //     offset 30 : player.yRot float32 LE
    //     offset 34 : player.xRot float32 LE
    //     offset 38 : blocks (width*height*depth bytes)
    //
    //   Legacy format: just raw blocks (width*height*depth bytes).
    //   Detected by size when the payload does not start with "DMJS".

    static SAVE_VERSION = 1;
    static SAVE_HEADER_SIZE = 38;

    async saveLevel() {
        try {
            if (!this.level) {
                console.error("saveLevel: no level loaded");
                return;
            }

            const blocks = this.level.blocks;
            const headerSize = Minecraft.SAVE_HEADER_SIZE;
            const payload = new Uint8Array(headerSize + blocks.length);
            const dv = new DataView(payload.buffer);

            // Magic "DMJS"
            payload[0] = 0x44; payload[1] = 0x4D;
            payload[2] = 0x4A; payload[3] = 0x53;
            // Version
            dv.setUint16(4, Minecraft.SAVE_VERSION, true);
            // Dimensions
            dv.setUint32(6, this.level.width, true);
            dv.setUint32(10, this.level.height, true);
            dv.setUint32(14, this.level.depth, true);
            // Player position + rotation
            const px = this.player ? this.player.x : this.level.xSpawn + 0.5;
            const py = this.player ? this.player.y : this.level.ySpawn;
            const pz = this.player ? this.player.z : this.level.zSpawn + 0.5;
            const pyRot = this.player ? this.player.yRot : (this.level.rotSpawn || 0);
            const pxRot = this.player ? this.player.xRot : 0;
            dv.setFloat32(18, px, true);
            dv.setFloat32(22, py, true);
            dv.setFloat32(26, pz, true);
            dv.setFloat32(30, pyRot, true);
            dv.setFloat32(34, pxRot, true);

            // Blocks
            payload.set(blocks, headerSize);

            // gzip-compress
            const blob = new Blob([payload]);
            const compressionStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
            const compressedBuffer = await new Response(compressionStream).arrayBuffer();

            const saveBlob = new Blob([compressedBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(saveBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'level.dat';
            link.click();
            URL.revokeObjectURL(url);

            console.log(`World saved (${blocks.length} blocks, ${payload.length} byte payload)`);
        } catch (error) {
            console.error("World save error:", error);
        }
    }

    async loadLevel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.dat,.gz';
        input.onchange = async e => {
            try {
                const file = e.target.files[0];
                if (!file) return;

                const decompressionStream = file.stream().pipeThrough(new DecompressionStream('gzip'));
                const decompressedBuffer = await new Response(decompressionStream).arrayBuffer();
                const data = new Uint8Array(decompressedBuffer);

                if (!this.level || !this.level.blocks) {
                    console.error("loadLevel: no active level to load into");
                    return;
                }

                const expectedBlocks = this.level.blocks.length;
                let blocks;
                let playerPos = null;

                // Detect format by magic + size
                const isNewFormat =
                    data.length === Minecraft.SAVE_HEADER_SIZE + expectedBlocks &&
                    data[0] === 0x44 && data[1] === 0x4D &&
                    data[2] === 0x4A && data[3] === 0x53;

                if (isNewFormat) {
                    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
                    const version = dv.getUint16(4, true);
                    if (version !== Minecraft.SAVE_VERSION) {
                        console.error("loadLevel: unsupported save version " + version);
                        return;
                    }
                    const w = dv.getUint32(6, true);
                    const h = dv.getUint32(10, true);
                    const d = dv.getUint32(14, true);
                    if (w !== this.level.width || h !== this.level.height || d !== this.level.depth) {
                        console.error(`loadLevel: dimension mismatch (save ${w}x${h}x${d} vs level ${this.level.width}x${this.level.height}x${this.level.depth})`);
                        return;
                    }
                    playerPos = {
                        x: dv.getFloat32(18, true),
                        y: dv.getFloat32(22, true),
                        z: dv.getFloat32(26, true),
                        yRot: dv.getFloat32(30, true),
                        xRot: dv.getFloat32(34, true)
                    };
                    blocks = data.subarray(Minecraft.SAVE_HEADER_SIZE);
                } else if (data.length === expectedBlocks) {
                    blocks = data;
                    console.warn("loadLevel: loading legacy save (no player position stored)");
                } else {
                    console.error("loadLevel: size mismatch - got " + data.length + " bytes, expected " + expectedBlocks + " (legacy) or " + (Minecraft.SAVE_HEADER_SIZE + expectedBlocks) + " (v1)");
                    return;
                }

                // === Apply the loaded blocks ===
                this.level.blocks.set(blocks);
                this.level.calcLightDepths(0, 0, this.level.width, this.level.height);
                this.level.findSpawn();

                // Wipe stale chunk geometry, mark all dirty, rebuild all now
                if (this.levelRenderer && this.levelRenderer.clearChunkGeometries) {
                    this.levelRenderer.clearChunkGeometries();
                }
                this.levelRenderer.allChanged();
                this.levelRenderer.rebuildAllChunksNow();

                // Recompile auxiliary meshes for a clean state
                this.levelRenderer.compileSurroundingGround();
                this.levelRenderer.compileSurroundingWater();
                this.levelRenderer.compileClouds();

                // === Reset the player ===
                if (this.player) {
                    if (playerPos) {
                        this.player.setPos(playerPos.x, playerPos.y, playerPos.z);
                        this.player.xo = this.player.x;
                        this.player.yo = this.player.y;
                        this.player.zo = this.player.z;
                        this.player.yRot = playerPos.yRot;
                        this.player.xRot = playerPos.xRot;
                        // If stuck inside a block, fall back to spawn
                        if (this.level.getCubes(this.player.bb).length > 0) {
                            this.player.resetPos();
                        }
                    } else {
                        this.player.resetPos();
                    }
                }

                // === Clear and respawn zombies ===
                if (this.entities && this.entities.length > 0) {
                    this.entities.forEach(ent => {
                        if (ent && typeof ent.destroy === 'function') {
                            ent.destroy();
                        } else if (ent && ent.group) {
                            this.scene.remove(ent.group);
                        }
                    });
                    this.entities = [];
                }
                for (let i = 0; i < 10; i++) {
                    const zombie = new Zombie(this.level, 128, 64, 127, this.scene);
                    zombie.resetPos();
                    this.entities.push(zombie);
                }

                // Clear particles
                if (this.particleEngine) {
                    this.particleEngine.particles = [];
                }

                console.log(`World loaded (${blocks.length} blocks)`);
                this.render(true);
            } catch (error) {
                console.error("World load error. GZIP only", error);
            }
        };
        input.click();
    }

    takeScreenshot() {
        const superSamplingFactor = 2;
        const screenshotWidth = this.width * superSamplingFactor;
        const screenshotHeight = this.height * superSamplingFactor;

        const renderTarget = new THREE.WebGLRenderTarget(screenshotWidth, screenshotHeight, {
            minFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
        });

        this.renderer.setRenderTarget(renderTarget);

        const activeFogColor = (this.scene && this.scene.fog && this.scene.fog.color)
            ? this.scene.fog.color
            : this.fogColor;
        this.renderer.setClearColor(activeFogColor);
        this.renderer.clear();

        this.levelRenderer.updateFrustum(this.camera);
        this.levelRenderer.render(this.player, 0);
        this.levelRenderer.render(this.player, 1);
        this.particleEngine.render(this.player, this.timer.a);
        this.entities.forEach(z => z.render(this.timer.a));
        this.levelRenderer.renderClouds(this.timer.a);

        this.renderer.render(this.scene, this.camera);

        this.renderer.setRenderTarget(null);

        this._lastClearColorHex = null;

        const canvas2d = document.createElement('canvas');
        canvas2d.width = screenshotWidth;
        canvas2d.height = screenshotHeight;
        const ctx2d = canvas2d.getContext('2d');

        const buffer = new Uint8Array(screenshotWidth * screenshotHeight * 4);
        this.renderer.readRenderTargetPixels(renderTarget, 0, 0, screenshotWidth, screenshotHeight, buffer);

        const imageData = ctx2d.createImageData(screenshotWidth, screenshotHeight);
        for (let y = 0; y < screenshotHeight; y++) {
            const srcRow = (screenshotHeight - 1 - y) * screenshotWidth * 4;
            const destRow = y * screenshotWidth * 4;
            for (let x = 0; x < screenshotWidth * 4; x++) {
                imageData.data[destRow + x] = buffer[srcRow + x];
            }
        }
        ctx2d.putImageData(imageData, 0, 0);

        const dataURL = canvas2d.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `minecraft-screenshot-${Date.now()}.png`;
        link.href = dataURL;
        link.click();

        renderTarget.dispose();
    }

    setupControls() {
        const isMobile = this.mobileControls ? this.mobileControls.isMobile : false;

        if (!isMobile) {
            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement === document.body) {
                    this.pause = false;
                } else {
                    if (this.screen == null) {
                        this.setScreen(new PauseScreen());
                        this.pause = true;
                    }
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (document.pointerLockElement) {
                    this.player.turn(-e.movementX, e.movementY);
                }
            });
        }

        this.canvas_renderer.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas_renderer.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.canvas_renderer.canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (this.canvas_renderer.canvas.height / rect.height);
        });

        this.canvas_renderer.canvas.addEventListener('mousedown', (e) => {
            if (this.screen !== null) {
                this.screen.mouseClicked(this.mouseX, this.mouseY, e.button);
            } else if (!isMobile) {
                if (!document.pointerLockElement) document.body.requestPointerLock();
            }
        });

        this.canvas_renderer.canvas.addEventListener('touchstart', (e) => {
            if (this.screen !== null && this.mobileControls && this.mobileControls.isMobile) {
                const touch = e.changedTouches[0];
                const rect = this.canvas_renderer.canvas.getBoundingClientRect();
                this.mouseX = (touch.clientX - rect.left) * (this.canvas_renderer.canvas.width / rect.width);
                this.mouseY = (touch.clientY - rect.top) * (this.canvas_renderer.canvas.height / rect.height);
                this.screen.mouseClicked(this.mouseX, this.mouseY, 0);
            }
        }, { passive: true });

        window.addEventListener('mousedown', (e) => {
            if (!document.pointerLockElement) return;
            if (e.button === 0) {
                this.leftMouseButtonDown = true;  // Left click = destroy
            }
            if (e.button === 1) {
                this.middleMouseButtonDown = true; // Middle click = pick block
            }
            else if (e.button === 2) {
                this.rightMouseButtonDown = true;  // Right click = place
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.leftMouseButtonDown = false;
            }
            if (e.button === 1) {
                this.middleMouseButtonDown = false;
            }
            if (e.button === 2) {
                this.rightMouseButtonDown = false;
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Enter') {
                this.saveLevel();
            }
            if (e.code === 'Insert') {
                this.loadLevel();
            }
            if (e.code === 'KeyG') {
                const blockEntity = new Zombie(this.level, this.player.x, this.player.y, this.player.z, this.scene);
                this.entities.push(blockEntity);
            }
            if (e.code === 'KeyO') {
                this.takeScreenshot();
            }
            // Number keys 1-9 for hotbar
            if (e.code === 'Digit1' || e.code === 'Numpad1') {
                this.inventory.selectSlot(0);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit2' || e.code === 'Numpad2') {
                this.inventory.selectSlot(1);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit3' || e.code === 'Numpad3') {
                this.inventory.selectSlot(2);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit4' || e.code === 'Numpad4') {
                this.inventory.selectSlot(3);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit5' || e.code === 'Numpad5') {
                this.inventory.selectSlot(4);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit6' || e.code === 'Numpad6') {
                this.inventory.selectSlot(5);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit7' || e.code === 'Numpad7') {
                this.inventory.selectSlot(6);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit8' || e.code === 'Numpad8') {
                this.inventory.selectSlot(7);
                this.updateGUIBlock();
            }
            if (e.code === 'Digit9' || e.code === 'Numpad9') {
                this.inventory.selectSlot(8);
                this.updateGUIBlock();
            }
            if (e.code === 'KeyF') {
                this.levelRenderer.toggleDrawDistance();
            }
            if (e.code === 'KeyB') {
                this.setScreen(new InventoryScreen());
            }
        });

        window.addEventListener('wheel', (event) => {
            if (!document.pointerLockElement) return;
            this.inventory.scroll(event.deltaY > 0 ? -1 : 1);
        }, { passive: true });

        window.addEventListener('contextmenu', e => e.preventDefault());
    }

    setScreen(screen) {
        this.screen = screen;
        if (screen !== null) {
            if (!this.mobileControls || !this.mobileControls.isMobile) {
                document.exitPointerLock();
            }
            screen.init(this, this.canvas_renderer.VIRTUAL_WIDTH, this.canvas_renderer.VIRTUAL_HEIGHT);
        }
    }

    isFree(aabb) {
        if (this.player.bb.intersects(aabb))
            return false;
        for (let i = 0; i < this.entities.length; i++) {
            if ((this.entities[i]).bb.intersects(aabb))
                return false;
        }
        return true;
    }

    forceChunkRebuild(x, y, z) {
        if (!this.levelRenderer) return;
        const lr = this.levelRenderer;
        const CS = lr.CHUNK_SIZE;
        const cx = Math.floor(x / CS);
        const cy = Math.floor(y / CS);
        const cz = Math.floor(z / CS);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const chunk = lr.getChunkAt(cx + dx, cy + dy, cz + dz);
                    if (chunk) {
                        chunk.rebuild(0);
                        chunk.rebuild(1);
                        chunk.visible = true;
                    }
                }
            }
        }
    }

    async generateNewLevel() {
        // Re-entry guard: if a regen is already in progress (e.g. user
        // double-clicked the button before the screen switched), ignore.
        if (this._generatingLevel) return;
        this._generatingLevel = true;

        try {
            this.setScreen(new LevelGenScreen());
            this.screen.setTitle("Generating level");

            // Entities (zombies, etc.) - cheap (10 small meshes), always
            // torn down and recreated fresh.
            if (this.entities && this.entities.length > 0) {
                this.entities.forEach(e => {
                    if (e && typeof e.destroy === 'function') {
                        e.destroy();
                    } else if (e && e.group) {
                        this.scene.remove(e.group);
                    }
                });
                this.entities = [];
            }

            // The world is always 256x256x64, so the Level / LevelRenderer /
            // Player / ParticleEngine only need to be built once, on the
            // very first call. Every subsequent "regenerate" reuses the same
            // instances and just replaces the block data - this avoids
            // tearing down and reallocating ~2000 chunk meshes, materials,
            // and textures back-to-back, which is what caused FPS to
            // permanently drop after repeated regenerations (rebuilding that
            // much GPU state in a burst outpaces the driver/GC).
            const isFirstRun = !this.level;

            if (isFirstRun) {
                this.level = new Level(256, 256, 64);

                // Shared singleton texture - only needs animation set up once.
                Textures.setupTerrainAnimation(this.level.texture, './assets/textures/terrain.png');

                this.levelRenderer = new LevelRenderer(this.level, this.scene);
                this.particleEngine = new ParticleEngine(this.level, this.scene, this.level.texture);
                this.level.particleEngine = this.particleEngine;
            } else {
                this.particleEngine.particles = [];
            }

            const generator = new LevelGen(this.screen);
            // generateLevel() calls this.level.setData(...) at the end, which
            // replaces the block array in place and notifies the (already
            // registered) LevelRenderer listener via allChanged().
            await generator.generateLevel(this.level, "Player", 256, 256, 64);

            if (isFirstRun) {
                this.player = new Player(this.level);
                this.player.level = this.level;
            } else {
                // Force every chunk to redraw immediately instead of popping
                // in 8 at a time, since the whole world just changed under it.
                this.levelRenderer.clearChunkGeometries();
                this.levelRenderer.rebuildAllChunksNow();
                this.player.level = this.level;
            }
            this.player.resetPos();

            for (let i = 0; i < 10; i++) {
                const zombie = new Zombie(this.level, 128, 64, 127, this.scene);
                zombie.resetPos();
                this.entities.push(zombie);
            }

            this.render(true);

            this.setScreen(null);
        } finally {
            this._generatingLevel = false;
        }
    }

    tick() {
        this.level.tick();

        Textures.tickAnimations();
        this.particleEngine.tick();

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.tick();
            if (e.removed) {
                if (typeof e.destroy === 'function') {
                    e.destroy();
                } else if (e.group) {
                    this.scene.remove(e.group);
                }
                this.entities.splice(i, 1);
            }
        }

        if (this.leftMouseButtonDown) {
            if (!this.lastMineTime) {
                this.lastMineTime = performance.now();
            } else {
                const elapsed = performance.now() - this.lastMineTime;
                if (elapsed > 200) {
                    const hit = this.levelRenderer.pick(5.0, this.camera);

                    if (hit) {
                        const oldTile = Tile.tiles[this.level.getTile(hit.x, hit.y, hit.z)];
                        if (oldTile && oldTile.id !== Tile.unbreakable.id) {
                            const changed = this.level.setTile(hit.x, hit.y, hit.z, 0);
                            if (oldTile != null && changed) {
                                this.lastMineTime = 0;
                                oldTile.destroy(this.level, hit.x, hit.y, hit.z, this.particleEngine);
                                this.forceChunkRebuild(hit.x, hit.y, hit.z);
                            }
                        }
                    }
                }
            }
        } else {
            this.lastMineTime = 200;
        }

        if (this.rightMouseButtonDown) {
            if (!this.lastBuildTime) {
                this.lastBuildTime = performance.now();
            } else {
                const elapsed = performance.now() - this.lastBuildTime;
                if (elapsed > 200) {
                    const hit = this.levelRenderer.pick(5.0, this.camera);

                    if (hit) {
                        let x = hit.x;
                        let y = hit.y;
                        let z = hit.z;

                        if (hit.f === 0) y--;
                        if (hit.f === 1) y++;
                        if (hit.f === 2) z--;
                        if (hit.f === 3) z++;
                        if (hit.f === 4) x--;
                        if (hit.f === 5) x++;

                        const playerAABB = this.player.bb;
                        const tileAABB = new AABB(x, y, z, x + 1, y + 1, z + 1);

                        if (this.isFree(tileAABB)) {
                            this.lastBuildTime = 0;
                            this.level.setTile(x, y, z, this.inventory.getSelectedSlotId());
                            this.forceChunkRebuild(x, y, z);
                        }
                    }
                }
            }
        } else {
            this.lastBuildTime = 200;
        }

        if (this.middleMouseButtonDown) {
            const hit = this.levelRenderer.pick(5.0, this.camera);
            if (hit) {
                const blockId = this.level.getTile(hit.x, hit.y, hit.z);
                if (blockId > 0) {
                    this.inventory.pickBlock(blockId);
                    this.updateGUIBlock();
                }
            }
            this.middleMouseButtonDown = false;
        }

        this.player.tick(this.camera);
    }

    render(skippause = false) {
        this.moveCameraToPlayer();

        this.updateFogForLiquid();

        if (!this.pause || skippause) {
            if (this.levelRenderer) {
                this.levelRenderer.updateFrustum(this.camera);
            }

            if (this.levelRenderer) {
                const hit = this.levelRenderer.pick(5.0, this.camera);
                if (hit) {
                    this.levelRenderer.renderHit(hit, 0, 0xFFFFFF, (Math.sin(performance.now() / 110.0) * 0.2 + 0.5) / 1.7);
                }
            }

            this.levelRenderer.updateDirtyChunks(this.player)

            this.levelRenderer.render(this.player, 0);
            this.levelRenderer.render(this.player, 1);

            this.particleEngine.render(this.player, this.timer.a);

            this.entities.forEach(e => e.render(this.timer.a));

            this.levelRenderer.renderSurroundingGround();
            this.levelRenderer.renderSurroundingWater();

            this.levelRenderer.renderClouds(this.timer.a);

            if (this.levelRenderer && this.levelRenderer.selectionMesh) {
                this.levelRenderer.selectionMesh.visible = false;
            }
        }

        this.canvas_renderer.render();
    }

    moveCameraToPlayer() {
        this.camera.rotation.set(
            THREE.MathUtils.degToRad(this.player.xRot),
            THREE.MathUtils.degToRad(this.player.yRot),
            0,
            'YXZ'
        );

        const a = this.timer.a;
        const x = this.player.xo + (this.player.x - this.player.xo) * a;
        const y = this.player.yo + (this.player.y - this.player.yo) * a;
        const z = this.player.zo + (this.player.z - this.player.zo) * a;

        this.camera.position.set(x, y, z);
    }

    updateFogForLiquid() {
        if (!this.scene || !this.scene.fog || !this.level || !this.camera) return;

        const cx = Math.floor(this.camera.position.x);
        const cy = Math.floor(this.camera.position.y);
        const cz = Math.floor(this.camera.position.z);

        const tileId = this.level.getTile(cx, cy, cz);
        const tile = tileId > 0 ? Tile.tiles[tileId] : null;
        const liquidType = tile ? tile.getLiquidType() : Tile.NOT_LIQUID;

        let fogColor, fogDensity;
        if (liquidType === Tile.LIQUID_WATER) {
            fogColor = this.waterFogColor;
            fogDensity = this.waterFogDensity;
        } else if (liquidType === Tile.LIQUID_LAVA) {
            fogColor = this.lavaFogColor;
            fogDensity = this.lavaFogDensity;
        } else {
            fogColor = this.skyFogColor;
            fogDensity = this.skyFogDensity;
        }

        if (this.scene.fog.color.getHex() !== fogColor.getHex()) {
            this.scene.fog.color.copy(fogColor);
        }
        if (this.scene.fog.density !== fogDensity) {
            this.scene.fog.density = fogDensity;
        }

        if (this.renderer && this._lastClearColorHex !== fogColor.getHex()) {
            this.renderer.setClearColor(fogColor);
            this._lastClearColorHex = fogColor.getHex();
        }
    }

    /**
     * Diagnostic helper - call game.debugSceneStats() from the browser console
     * to inspect scene graph size and renderer memory after regenerating.
     * If scene.children.length grows across regens, there is a leak.
     */
    debugSceneStats() {
        const scene = this.scene;
        if (!scene) {
            console.log("No scene");
            return;
        }

        // Count total objects in the scene graph (recursive)
        let totalObjects = 0;
        let totalMeshes = 0;
        let totalGeometries = 0;
        let totalMaterials = 0;
        scene.traverse(obj => {
            totalObjects++;
            if (obj.isMesh) {
                totalMeshes++;
                if (obj.geometry) totalGeometries++;
                if (obj.material) totalMaterials++;
            }
        });

        console.log("=== Scene Stats ===");
        console.log("  scene.children (top-level):", scene.children.length);
        console.log("  total objects (recursive):", totalObjects);
        console.log("  total meshes:", totalMeshes);
        console.log("  total geometries:", totalGeometries);
        console.log("  total materials:", totalMaterials);
        console.log("  entities:", this.entities ? this.entities.length : 0);
        console.log("  chunks:", this.levelRenderer && this.levelRenderer.chunks ? this.levelRenderer.chunks.length : 0);

        if (this.renderer && this.renderer.info) {
            console.log("=== Renderer Memory ===");
            console.log("  geometries:", this.renderer.info.memory.geometries);
            console.log("  textures:", this.renderer.info.memory.textures);
            console.log("=== Renderer Render (last frame) ===");
            console.log("  calls:", this.renderer.info.render.calls);
            console.log("  triangles:", this.renderer.info.render.triangles);
            console.log("  lines:", this.renderer.info.render.lines);
            console.log("  points:", this.renderer.info.render.points);
        }

        if (typeof Chunk !== 'undefined' && Chunk.updates !== undefined) {
            console.log("=== Chunk Stats ===");
            console.log("  total chunk updates:", Chunk.updates);
        }

        // Top-level children breakdown
        if (scene.children) {
            const breakdown = {};
            for (const child of scene.children) {
                const type = child.constructor.name;
                breakdown[type] = (breakdown[type] || 0) + 1;
            }
            console.log("=== Top-level children by type ===");
            console.table(breakdown);
        }
    }
}

const game = new Minecraft();
// Expose to window so the user can call game.debugSceneStats() from the
// browser console to diagnose leaks.
window.game = game;
await game.run();