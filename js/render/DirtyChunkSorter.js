import { Frustum } from './Frustum.js';

export class DirtyChunkSorter {
    constructor(player, frustum) {
        this.player = player;
        if (frustum && frustum instanceof Frustum) {
            this.frustum = frustum;
        } else if (frustum && frustum.projectionMatrix && frustum.matrixWorldInverse) {
            this.frustum = Frustum.getFrustum(
                frustum.projectionMatrix.elements,
                frustum.matrixWorldInverse.elements
            );
        } else {
            this.frustum = null;
        }
    }

    compare(c0, c1) {
        const i0 = this.frustum ? this.frustum.isVisible(c0.aabb) : true;
        const i1 = this.frustum ? this.frustum.isVisible(c1.aabb) : true;

        if (i0 && !i1) return -1;
        if (i1 && !i0) return 1;

        const d0 = c0.distanceToSqr(this.player);
        const d1 = c1.distanceToSqr(this.player);

        if (d0 < d1) return -1;
        if (d0 > d1) return 1;
        return 0;
    }
}