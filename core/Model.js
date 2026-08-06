import { THREE } from "./VoxWheel.js";
import { Vec3 } from "./Util.js";





export class Vertex {
    constructor(...args) {
        if (args.length === 5 &&
            typeof args[0] === 'number' &&
            typeof args[1] === 'number' &&
            typeof args[2] === 'number') {
            const [x, y, z, u, v] = args;
            this.pos = new Vec3(x, y, z);
            this.u = u;
            this.v = v;
        }
        else if (args.length === 3 && args[0] instanceof Vertex) {
            const [vertex, u, v] = args;
            this.pos = vertex.pos;
            this.u = u;
            this.v = v;
        }
        else if (args.length === 3 && args[0] instanceof Vec3) {
            const [pos, u, v] = args;
            this.pos = pos;
            this.u = u;
            this.v = v;
        }
        else {
            throw new Error("Invalid arguments for Vertex constructor");
        }
    }

    remap(u, v) {
        return new Vertex(this, u, v);
    }

    get x() { return this.pos.x; }
    get y() { return this.pos.y; }
    get z() { return this.pos.z; }
}


export class Polygon {
    constructor(vertices, u0 = null, v0 = null, u1 = null, v1 = null) {
        this.vertices = vertices.slice();
        this.vertexCount = vertices.length;

        if (u0 !== null && v0 !== null && u1 !== null && v1 !== null) {
            this.vertices[0] = this.vertices[0].remap(u1, v0);
            this.vertices[1] = this.vertices[1].remap(u0, v0);
            this.vertices[2] = this.vertices[2].remap(u0, v1);
            this.vertices[3] = this.vertices[3].remap(u1, v1);
        }
    }

    getVerticesAndUVs() {
        const positions = [];
        const uvs = [];

        const indices = [3, 2, 1, 3, 1, 0];

        for (const i of indices) {
            const v = this.vertices[i];
            positions.push(v.x, v.y, v.z);
            uvs.push(v.u / 64.0, v.v / 32.0);
        }

        return { positions, uvs };
    }
}


export class Cube {
    constructor(xTexOffs = 0, yTexOffs = 0) {
        this.xTexOffs = xTexOffs;
        this.yTexOffs = yTexOffs;

        this.vertices = [];
        this.polygons = [];

        this.x = 0; this.y = 0; this.z = 0;
        this.xRot = 0; this.yRot = 0; this.zRot = 0;

        this.geometry = null;
        this.material = null;

        this.mesh = null;
        this.group = null;
    }

    addBox(x0, y0, z0, w, h, d) {
        this.vertices = [];
        this.polygons = [];

        const x1 = x0 + w;
        const y1 = y0 + h;
        const z1 = z0 + d;

        const u0 = new Vertex(x0, y0, z0, 0.0, 0.0);
        const u1 = new Vertex(x1, y0, z0, 0.0, 8.0);
        const u2 = new Vertex(x1, y1, z0, 8.0, 8.0);
        const u3 = new Vertex(x0, y1, z0, 8.0, 0.0);
        const l0 = new Vertex(x0, y0, z1, 0.0, 0.0);
        const l1 = new Vertex(x1, y0, z1, 0.0, 8.0);
        const l2 = new Vertex(x1, y1, z1, 8.0, 8.0);
        const l3 = new Vertex(x0, y1, z1, 8.0, 0.0);

        this.vertices.push(u0, u1, u2, u3, l0, l1, l2, l3);

        this.polygons.push(
            new Polygon([l1, u1, u2, l2], this.xTexOffs + d + w, this.yTexOffs + d, this.xTexOffs + d + w + d, this.yTexOffs + d + h),
            new Polygon([u0, l0, l3, u3], this.xTexOffs + 0, this.yTexOffs + d, this.xTexOffs + d, this.yTexOffs + d + h),
            new Polygon([l1, l0, u0, u1], this.xTexOffs + d, this.yTexOffs + 0, this.xTexOffs + d + w, this.yTexOffs + d),
            new Polygon([u2, u3, l3, l2], this.xTexOffs + d + w, this.yTexOffs + 0, this.xTexOffs + d + w + w, this.yTexOffs + d),
            new Polygon([u1, u0, u3, u2], this.xTexOffs + d, this.yTexOffs + d, this.xTexOffs + d + w, this.yTexOffs + d + h),
            new Polygon([l0, l1, l2, l3], this.xTexOffs + d + w + d, this.yTexOffs + d, this.xTexOffs + d + w + d + w, this.yTexOffs + d + h)
        );
    }

    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        if (this.group) {
            this.group.position.set(this.x, this.y, this.z);
        }
    }

    createMesh(texture, parentGroup) {
        if (!texture) throw new Error("Cube.createMesh: texture required");
        if (!parentGroup) throw new Error("Cube.createMesh: parentGroup required");

        this.group = new THREE.Group();
        parentGroup.add(this.group);

        const positions = [];
        const uvs = [];
        const indices = [];
        let vertexIndex = 0;

        const faceIndices = [0, 1, 2, 0, 2, 3];

        for (const poly of this.polygons) {
            const polyVertices = poly.vertices;

            for (const offset of faceIndices) {
                indices.push(vertexIndex + offset);
            }

            const uValues = polyVertices.map(v => v.u);
            const vValues = polyVertices.map(v => v.v);
            const minU = Math.min(...uValues);
            const maxU = Math.max(...uValues);
            const minV = Math.min(...vValues);
            const maxV = Math.max(...vValues);

            for (const v of polyVertices) {
                positions.push(v.pos.x, v.pos.y, v.pos.z);

                let u = v.u;
                let vOrig = v.v;

                const pad = 0.005;

                if (u === minU) u += pad;
                if (u === maxU) u -= pad;
                if (vOrig === minV) vOrig += pad;
                if (vOrig === maxV) vOrig -= pad;

                let uFinal = u / 64.0;
                let vFinal = 1.0 - (vOrig / 32.0);

                uvs.push(uFinal, vFinal);
            }

            vertexIndex += 4;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.geometry.setIndex(indices);
        this.geometry.computeVertexNormals();

        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            transparent: true,
            alphaTest: 0.5
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);

        if (this.x !== 0 || this.y !== 0 || this.z !== 0) {
            this.group.position.set(this.x, this.y, this.z);
        }
    }

    render() {
        if (!this.group) return;

        this.group.position.set(this.x, this.y, this.z);

        this.group.rotation.order = 'ZYX';
        this.group.rotation.set(this.xRot, this.yRot, this.zRot);
    }

    destroy() {
        this.geometry.dispose();
        this.material.dispose();
    }
}





export class ZombieModel {
    constructor(level, scene, texture) {
        this.level = level;
        this.scene = scene;

        this.texture = texture;

        this.group = new THREE.Group();

        this.scene.add(this.group);

        this.head = new Cube(0, 0);
        this.head.addBox(-4, -8, -4, 8, 8, 8);

        this.body = new Cube(16, 16);
        this.body.addBox(-4, 0, -2, 8, 12, 4);

        this.arm0 = new Cube(40, 16);
        this.arm0.addBox(-3, -2, -2, 4, 12, 4);
        this.arm0.setPos(-5, 2, 0);

        this.arm1 = new Cube(40, 16);
        this.arm1.addBox(-1, -2, -2, 4, 12, 4);
        this.arm1.setPos(5, 2, 0);

        this.leg0 = new Cube(0, 16);
        this.leg0.addBox(-2, 0, -2, 4, 12, 4);
        this.leg0.setPos(-2, 12, 0);

        this.leg1 = new Cube(0, 16);
        this.leg1.addBox(-2, 0, -2, 4, 12, 4);
        this.leg1.setPos(2, 12, 0);

        this.head.createMesh(this.texture, this.group);
        this.body.createMesh(this.texture, this.group);
        this.arm0.createMesh(this.texture, this.group);
        this.arm1.createMesh(this.texture, this.group);
        this.leg0.createMesh(this.texture, this.group);
        this.leg1.createMesh(this.texture, this.group);
    }

    render(time) {
        this.head.yRot = Math.sin(time * 0.83) * 1.0;
        this.head.xRot = Math.sin(time) * 0.8;
        this.arm0.xRot = Math.sin(time * 0.6662 + Math.PI) * 2.0;
        this.arm0.zRot = (Math.sin(time * 0.2312) + 1.0) * 1.0;
        this.arm1.xRot = Math.sin(time * 0.6662) * 2.0;
        this.arm1.zRot = (Math.sin(time * 0.2812) - 1.0) * 1.0;
        this.leg0.xRot = Math.sin(time * 0.6662) * 1.4;
        this.leg1.xRot = Math.sin(time * 0.6662 + Math.PI) * 1.4;

        this.head.render();
        this.body.render();
        this.arm0.render();
        this.arm1.render();
        this.leg0.render();
        this.leg1.render();
    }

    destroy() {
        this.head.destroy();
        this.body.destroy();
        this.arm0.destroy();
        this.arm1.destroy();
        this.leg0.destroy();
        this.leg1.destroy();

        if (this.group && this.group.parent) {
            this.group.parent.remove(this.group);
        }
    }
}