import * as THREE from 'three';

import { AssetList, AssetManager } from "./Asset.js";
import { Enum, AABB, generateTextureAtlas, JavaRandom } from "./Util.js";
import { Level } from "./Level.js";
import { LevelRenderer } from "./LevelRender.js";
import { Player } from "./Player.js";




export const BLOCKS = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, LOG: 4, LEAVES: 5 };
export const BLOCK_NAMES = { 1: 'GRASS', 2: 'DIRT', 3: 'STONE', 4: 'LOG', 5: 'LEAVES' };

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;
export const SUBCHUNK_COUNT = 2;
export const SUBCHUNK_HEIGHT = CHUNK_HEIGHT / SUBCHUNK_COUNT;
export const NUM_SUBCHUNKS = CHUNK_HEIGHT / SUBCHUNK_HEIGHT;
export const WORLD_SEED = Math.floor(Math.random() * JavaRandom.p2_48);

document.getElementById('seed-display').innerText = WORLD_SEED;





class Game {
    constructor() {
        this.assets = new AssetList();

        this.assets.newAsset("clouds", "./assets/textures/clouds.png", Enum.AssetType.Texture);
        this.assets.newAsset("sun", "./assets/textures/sun.png", Enum.AssetType.Texture);
        this.assets.newAsset("moon", "./assets/textures/moon.png", Enum.AssetType.Texture);

        this.asset_manager = new AssetManager(this);

        this.scene = new THREE.Scene();

        const skyColor = new THREE.Color(0xc0d8ff);
        this.fogColor = skyColor;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.025);

        this.skyGroup = new THREE.Group();

        // Shader pro tělesa: černou barvu pozadí mění na průhlednost (discard)
        const celestialVertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const celestialFragmentShader = `
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
                vec4 texColor = texture2D(uTexture, vUv);
                float brightness = max(max(texColor.r, texColor.g), texColor.b);
                if (brightness < 0.08 || texColor.a < 0.1) {
                    discard;
                }
                gl_FragColor = texColor;
            }
        `;

        const celestialDist = 380;

        // --- SLUNCE ---
        const sunGeo = new THREE.PlaneGeometry(60, 60);
        this.sunMat = new THREE.ShaderMaterial({
            vertexShader: celestialVertexShader,
            fragmentShader: celestialFragmentShader,
            uniforms: {
                uTexture: { value: new THREE.Texture() }
            },
            transparent: true,
            depthWrite: false,
            fog: false,
            side: THREE.DoubleSide
        });
        this.sunMesh = new THREE.Mesh(sunGeo, this.sunMat);
        this.sunMesh.position.set(0, celestialDist, 0);
        this.sunMesh.rotation.x = Math.PI / 2;

        // --- MĚSÍC ---
        const moonGeo = new THREE.PlaneGeometry(60, 60);
        this.moonMat = new THREE.ShaderMaterial({
            vertexShader: celestialVertexShader,
            fragmentShader: celestialFragmentShader,
            uniforms: {
                uTexture: { value: new THREE.Texture() }
            },
            transparent: true,
            depthWrite: false,
            fog: false,
            side: THREE.DoubleSide
        });
        this.moonMesh = new THREE.Mesh(moonGeo, this.moonMat);
        this.moonMesh.position.set(0, -celestialDist, 0);
        this.moonMesh.rotation.x = -Math.PI / 2;

        this.celestialGroup = new THREE.Group();
        this.celestialGroup.add(this.sunMesh);
        this.celestialGroup.add(this.moonMesh);

        this.skyGroup.add(this.celestialGroup);
        this.scene.add(this.skyGroup);

        this.createStars();
        this.createSkyDome();

        const outlineVertexShader = `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `;

        const outlineFragmentShader = `
                    varying vec2 vUv;
                    uniform float uTime;
                    uniform vec3 uColor;
                    uniform float uThickness;

                    void main() {
                        vec2 border = step(vec2(uThickness), vUv) * step(vec2(uThickness), 1.0 - vUv);
                        float isEdge = 1.0 - (border.x * border.y);

                        if (isEdge < 0.5) discard;

                        float pulse = 0.7 + 0.3 * sin(uTime * 5.0);
                        gl_FragColor = vec4(uColor * 1.3, pulse * 0.9);
                    }
                `;

        const blockVertexShader = `
                    attribute vec4 uvTile;
                    uniform vec3 uSunDirection;
                    varying vec2 vUv;
                    varying vec4 vUvTile;
                    varying vec3 vWorldPosition;
                    varying float vLight;

                    void main() {
                        vUv = uv;
                        vUvTile = uvTile;
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;

                        vec3 norm = normalize(mat3(modelMatrix) * normal);

                        float faceLight = 1.0;
                        if (norm.y > 0.5) faceLight = 1.0;
                        else if (norm.y < -0.5) faceLight = 0.5;
                        else if (abs(norm.z) > 0.5) faceLight = 0.8;
                        else if (abs(norm.x) > 0.5) faceLight = 0.6;

                        float dayFactor = max(uSunDirection.y, 0.0);
                        float sunVisibility = smoothstep(-0.2, 0.2, uSunDirection.y);
                        float brightness = mix(0.15, 1.0, sunVisibility);

                        float finalFaceLight = mix(1.0, faceLight, sunVisibility * 0.5 + 0.5);

                        vLight = finalFaceLight * brightness;

                        gl_Position = projectionMatrix * viewMatrix * worldPosition;
                    }
                `;

        const blockFragmentShader = `
                    uniform sampler2D uTexture;
                    uniform vec3 uFogColor;
                    uniform float uFogNear;
                    uniform float uFogFar;

                    varying vec2 vUv;
                    varying vec4 vUvTile;
                    varying vec3 vWorldPosition;
                    varying float vLight;

                    void main() {
                        vec2 tileUv = vUvTile.xy + fract(vUv) * vUvTile.zw;

                        vec4 texColor = texture2D(uTexture, tileUv);
                        if (texColor.a < 0.5) discard;

                        vec3 color = texColor.rgb * vLight;

                        float dist = length(cameraPosition - vWorldPosition);
                        
                        float fogFactor = clamp((dist - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);

                        vec3 finalColor = mix(color, uFogColor, fogFactor);
                        gl_FragColor = vec4(finalColor, texColor.a);
                    }
                `;

        this.textureAtlas = generateTextureAtlas(WORLD_SEED);
        this.textureAtlas.colorSpace = THREE.SRGBColorSpace;
        this.textureAtlas.magFilter = THREE.NearestFilter;
        this.textureAtlas.minFilter = THREE.NearestFilter;

        this.sharedMaterial = new THREE.ShaderMaterial({
            vertexShader: blockVertexShader,
            fragmentShader: blockFragmentShader,
            uniforms: {
                uTexture: { value: this.textureAtlas },
                uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
                uFogColor: { value: skyColor },
                uFogNear: { value: 10.0 },
                uFogFar: { value: 100.0 }
            }
        });

        this.level = new Level(this, WORLD_SEED);

        this.renderDistances = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
        this.renderDistanceIdx = 3;
        const initialDist = this.renderDistances[this.renderDistanceIdx];

        this.levelRenderer = new LevelRenderer(this.level, this.scene, initialDist, this.sharedMaterial);

        this.updateFog();

        const startX = 0, startZ = 0;
        const startY = 100;

        this.player = new Player(startX, startY, startZ);
        this.selectedBlock = BLOCKS.GRASS;

        const outlineGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
        this.outlineMaterial = new THREE.ShaderMaterial({
            vertexShader: outlineVertexShader,
            fragmentShader: outlineFragmentShader,
            uniforms: {
                uColor: { value: new THREE.Color(0x000000) },
                uThickness: { value: 0.005 }
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.selectionBox = new THREE.Mesh(outlineGeo, this.outlineMaterial);
        this.selectionBox.visible = false;
        this.scene.add(this.selectionBox);

        this.keys = {};
        this.yaw = 0;
        this.pitch = 0;
        this.setupInputs();

        this.clock = new THREE.Clock();

        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsTime = performance.now();

        window.addEventListener('resize', () => this.onResize());
    }

    updateFog() {
        const distInUnits = this.levelRenderer.renderDistance * CHUNK_SIZE;

        const fogNear = distInUnits * 0.3;
        const fogFar = distInUnits * 0.75;

        if (this.sharedMaterial && this.sharedMaterial.uniforms) {
            this.sharedMaterial.uniforms.uFogNear.value = fogNear;
            this.sharedMaterial.uniforms.uFogFar.value = fogFar;
        }

        this.camera.far = 1000 //(this.levelRenderer.renderDistance + 2) * CHUNK_SIZE;
        this.camera.updateProjectionMatrix();
    }

    createStars() {
        const starCount = 1500;
        const starRadius = 500;
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Rovnoměrné rozložení na sféře
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = starRadius;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            sizes[i] = 0.5 + Math.random() * 1.5;
        }

        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            fog: false,
            depthWrite: false
        });

        this.starsMesh = new THREE.Points(starGeo, starMat);
        this.skyGroup.add(this.starsMesh);
    }

    createSkyDome() {
        const skyDomeGeo = new THREE.SphereGeometry(450, 32, 32);

        const skyDomeVertexShader = `
                    varying vec3 vDir;
                    void main() {
                        vDir = normalize(position);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `;

        const skyDomeFragmentShader = `
                    uniform float uSunHeight;
                    uniform float uTime;
                    varying vec3 vDir;

                    void main() {
                        float height = vDir.y;

                        // Denní obloha: jasně modrá nahoře, světlejší u horizontu
                        vec3 dayTop = vec3(0.25, 0.48, 1.0);
                        vec3 dayHorizon = vec3(0.65, 0.82, 1.0);

                        // Soumrak: teplé oranžovo-červené tóny
                        vec3 sunsetTop = vec3(0.15, 0.15, 0.45);
                        vec3 sunsetHorizon = vec3(0.85, 0.35, 0.12);

                        // Noc: tmavě modrá až černá
                        vec3 nightTop = vec3(0.01, 0.01, 0.04);
                        vec3 nightHorizon = vec3(0.04, 0.04, 0.1);

                        // Výpočet přechodů na základě výšky slunce
                        float dayFactor = smoothstep(-0.1, 0.3, uSunHeight);
                        float sunsetFactor = smoothstep(-0.15, 0.0, uSunHeight) * (1.0 - smoothstep(0.0, 0.25, uSunHeight));
                        float nightFactor = 1.0 - smoothstep(-0.2, 0.0, uSunHeight);

                        // Vertikální přechod (od horizontu k zenitu)
                        float vertFade = max(height, 0.0);
                        vertFade = pow(vertFade, 0.6);

                        vec3 dayColor = mix(dayHorizon, dayTop, vertFade);
                        vec3 sunsetColor = mix(sunsetHorizon, sunsetTop, vertFade);
                        vec3 nightColor = mix(nightHorizon, nightTop, vertFade);

                        // Kombinace barev
                        vec3 finalColor = nightColor;
                        finalColor = mix(finalColor, sunsetColor, sunsetFactor);
                        finalColor = mix(finalColor, dayColor, dayFactor);

                        // Jemné přidání teplé barvy u horizontu při soumraku
                        float horizonGlow = exp(-abs(height) * 8.0) * sunsetFactor;
                        finalColor += vec3(0.5, 0.2, 0.05) * horizonGlow;

                        gl_FragColor = vec4(finalColor, 1.0);
                    }
                `;

        const skyDomeMat = new THREE.ShaderMaterial({
            vertexShader: skyDomeVertexShader,
            fragmentShader: skyDomeFragmentShader,
            uniforms: {
                uSunHeight: { value: 0.5 },
                uTime: { value: 0.0 }
            },
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });

        this.skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
        this.scene.add(this.skyDome);
    }

    pick(distance = 5.0) {
        const start = new THREE.Vector3(
            this.player.x,
            this.player.y + this.player.eyeHeight,
            this.player.z
        );
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();

        let x = Math.floor(start.x), y = Math.floor(start.y), z = Math.floor(start.z);
        const stepX = dir.x > 0 ? 1 : -1, stepY = dir.y > 0 ? 1 : -1, stepZ = dir.z > 0 ? 1 : -1;
        const tDeltaX = dir.x !== 0 ? Math.abs(1 / dir.x) : Infinity;
        const tDeltaY = dir.y !== 0 ? Math.abs(1 / dir.y) : Infinity;
        const tDeltaZ = dir.z !== 0 ? Math.abs(1 / dir.z) : Infinity;

        let tMaxX = dir.x !== 0 ? (dir.x > 0 ? (x + 1 - start.x) : (start.x - x)) * tDeltaX : Infinity;
        let tMaxY = dir.y !== 0 ? (dir.y > 0 ? (y + 1 - start.y) : (start.y - y)) * tDeltaY : Infinity;
        let tMaxZ = dir.z !== 0 ? (dir.z > 0 ? (z + 1 - start.z) : (start.z - z)) * tDeltaZ : Infinity;

        let f = -1, dist = 0;
        const isPickable = (bx, by, bz) => this.level.getTile(bx, by, bz) > BLOCKS.AIR;

        if (isPickable(x, y, z)) return { x, y, z, f };

        while (dist < distance) {
            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) { dist = tMaxX; tMaxX += tDeltaX; x += stepX; f = stepX > 0 ? 4 : 5; }
                else { dist = tMaxZ; tMaxZ += tDeltaZ; z += stepZ; f = stepZ > 0 ? 2 : 3; }
            } else {
                if (tMaxY < tMaxZ) { dist = tMaxY; tMaxY += tDeltaY; y += stepY; f = stepY > 0 ? 0 : 1; }
                else { dist = tMaxZ; tMaxZ += tDeltaZ; z += stepZ; f = stepZ > 0 ? 2 : 3; }
            }

            if (dist > distance) break;
            if (isPickable(x, y, z)) return { x, y, z, f };
        }
        return null;
    }

    setupInputs() {
        document.addEventListener('click', () => {
            if (document.pointerLockElement !== document.body) document.body.requestPointerLock();
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.yaw -= e.movementX * 0.002;
                this.pitch -= e.movementY * 0.002;
                this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));

                this.camera.rotation.order = "YXZ";
                this.camera.rotation.y = this.yaw;
                this.camera.rotation.x = this.pitch;
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (document.pointerLockElement !== document.body) return;
            const hit = this.pick(5.0);
            if (!hit) return;

            if (e.button === 0) {
                this.level.setTile(hit.x, hit.y, hit.z, BLOCKS.AIR);
            } else if (e.button === 2) {
                let px = hit.x, py = hit.y, pz = hit.z;
                if (hit.f === 0) py--; else if (hit.f === 1) py++;
                else if (hit.f === 2) pz--; else if (hit.f === 3) pz++;
                else if (hit.f === 4) px--; else if (hit.f === 5) px++;

                const placedBox = new AABB(px, py, pz, px + 1, py + 1, pz + 1);
                if (!this.player.aabb.intersects(placedBox)) {
                    this.level.setTile(px, py, pz, this.selectedBlock);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code.startsWith('Digit')) {
                const num = parseInt(e.code.replace('Digit', ''));
                if (num >= 1 && num <= 5) {
                    this.selectedBlock = num;
                    document.getElementById('selected-block').innerText = BLOCK_NAMES[num];
                }
            }

            if (e.code === 'KeyF') {
                this.renderDistanceIdx = (this.renderDistanceIdx + 1) % this.renderDistances.length;
                const newDist = this.renderDistances[this.renderDistanceIdx];
                this.levelRenderer.renderDistance = newDist;
                this.updateFog();
                document.getElementById('render-distance-display').innerText = newDist;
            }

            if (e.code === 'KeyG') {
                this.player.aabb.move(619925*2*Math.random() - 619925, 0, 619925*2*Math.random() - 619925)
            }
        });

        document.addEventListener('keyup', (e) => this.keys[e.code] = false);

        document.addEventListener('wheel', (e) => {
            let next = this.selectedBlock + (e.deltaY > 0 ? 1 : -1);
            if (next > 5) next = 1;
            if (next < 1) next = 5;
            this.selectedBlock = next;
            document.getElementById('selected-block').innerText = BLOCK_NAMES[next];
        });
    }

    render(dt) {
        this.scene.position.set(-this.player.x, 0, -this.player.z);
        this.player.update(dt, this.keys, this.yaw, this.level, this.camera);

        const hit = this.pick(5.0);
        if (hit) {
            this.selectionBox.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
            this.selectionBox.visible = true;
        } else {
            this.selectionBox.visible = false;
        }

        const angle = this.levelRenderer.calculateCelestialAngle(this.level.time);

        const sunPhi = angle * Math.PI * 2;
        const sunDir = new THREE.Vector3(
            Math.sin(sunPhi),
            Math.cos(sunPhi),
            0.0
        ).normalize();

        if (this.sharedMaterial && this.sharedMaterial.uniforms) {
            this.sharedMaterial.uniforms.uSunDirection.value.copy(sunDir);
            this.sharedMaterial.uniforms.uFogColor.value.copy(this.levelRenderer.getFogColor(angle));
        }

        this.celestialGroup.rotation.z = -sunPhi;

        const sunHeight = sunDir.y;

        if (this.skyDome) {
            this.skyDome.material.uniforms.uSunHeight.value = sunHeight;
            this.skyDome.material.uniforms.uTime.value = performance.now() / 1000;
        }

        if (this.starsMesh) {
            this.starsMesh.material.opacity = Math.max(0, Math.min(1, -sunHeight * 3 + 0.2));
            this.starsMesh.rotation.z = -sunPhi;
        }

        const fogColor = this.levelRenderer.getFogColor(angle);
        if (this.sharedMaterial && this.sharedMaterial.uniforms) {
            this.sharedMaterial.uniforms.uFogColor.value.copy(fogColor);
        }
        this.scene.fog.color.copy(fogColor);

        if (this.levelRenderer.cloudColorMaterial) {
            if (sunHeight > 0.3) {
                this.levelRenderer.cloudColorMaterial.color.set(0xffffff);
            } else if (sunHeight > -0.1) {
                const blend = (sunHeight + 0.1) / 0.4;
                const cr = 1.0;
                const cg = 0.7 + blend * 0.3;
                const cb = 0.5 + blend * 0.5;
                this.levelRenderer.cloudColorMaterial.color.setRGB(cr, cg, cb);
            } else {
                this.levelRenderer.cloudColorMaterial.color.set(0x555566);
            }
        }

        this.levelRenderer.update(this.player.x, this.player.z, this.player.y);
        this.renderer.render(this.scene, this.camera);

        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 500) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
            this.frameCount = 0;
            this.lastFpsTime = now;
        }

        document.getElementById('fps-display').innerText = this.fps;
        document.getElementById('pos-display').innerText = `X: ${this.player.x.toFixed(1)}, Y: ${this.player.y.toFixed(1)}, Z: ${this.player.z.toFixed(1)}`;
        document.getElementById('chunks-mem-display').innerText = this.level.chunksData.size;
        document.getElementById('chunks-render-display').innerText = this.levelRenderer.renderedChunks.size;
        document.getElementById('geo-display').innerText = this.renderer.info.memory.geometries;
        document.getElementById('mat-display').innerText = this.renderer.info.programs ? this.renderer.info.programs.length : 2;
        document.getElementById('drawcalls-display').innerText = this.renderer.info.render.calls;
    }

    update(dt) {
        const eyeY = this.player.y + this.player.eyeHeight;
        if (this.skyGroup) {
            this.skyGroup.position.set(this.player.x, eyeY, this.player.z);
        }
        if (this.skyDome) {
            this.skyDome.position.set(this.player.x, eyeY, this.player.z);
        }

        this.level.time += 0.2;
    }

    async init() {
        await this.asset_manager.loadAll();

        const sunTexture = this.asset_manager.get("sun");
        if (sunTexture) {
            sunTexture.magFilter = THREE.NearestFilter;
            sunTexture.minFilter = THREE.NearestFilter;
            sunTexture.generateMipmaps = false;
            sunTexture.colorSpace = THREE.SRGBColorSpace;
            this.sunMat.uniforms.uTexture.value = sunTexture;
            this.sunMat.needsUpdate = true;
        }

        const moonTexture = this.asset_manager.get("moon");
        if (moonTexture) {
            moonTexture.magFilter = THREE.NearestFilter;
            moonTexture.minFilter = THREE.NearestFilter;
            moonTexture.generateMipmaps = false;
            moonTexture.colorSpace = THREE.SRGBColorSpace;
            this.moonMat.uniforms.uTexture.value = moonTexture;
            this.moonMat.needsUpdate = true;
        }
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.update(dt);
        this.render(dt);
    }

    async run() {
        await this.init();
        this.loop();
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const g = new Game();

await g.run();