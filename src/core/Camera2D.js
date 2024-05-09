import { Matrix2 } from '../math/Matrix2.js';
import { MathUtils } from '../utils/MathUtils.js';
import { Vector2 } from '../math/Vector2.js';

class Camera2D {

    constructor() {
        this.uuid = MathUtils.randomUUID();

        // Transform
        this.position = new Vector2(0, 0);
        this.scale = 1.0;
        this.rotation = 0.0;

        // Matrix
        this.matrix = new Matrix2();
        this.inverseMatrix = new Matrix2();
        this.matrixNeedsUpdate = true;
    }

    updateMatrix(offsetX, offsetY) {
        if (!this.matrixNeedsUpdate) return;
        this.matrix.identity();

        // Rotate
        this.matrix.multiply(new Matrix2([ 1, 0, 0, 1, +offsetX, +offsetY ]));
        const c = Math.cos(this.rotation);
        const s = Math.sin(this.rotation);
        this.matrix.multiply(new Matrix2([ c, s, -s, c, 0, 0 ]));
        this.matrix.multiply(new Matrix2([ 1, 0, 0, 1, -offsetX, -offsetY ]));

        // Translate
        this.matrix.multiply(new Matrix2([ 1, 0, 0, 1, this.position.x, this.position.y ]));

        // Scale
        this.matrix.multiply(new Matrix2([ this.scale, 0, 0, this.scale, 0, 0 ]));

        this.inverseMatrix = this.matrix.getInverse();
        this.matrixNeedsUpdate = false;
    }

    lerpPosition(v1, v2, t) {
        this.position.x = (v1.x * (1 - t)) + (v2.x * t);
        this.position.y = (v1.y * (1 - t)) + (v2.y * t);
        this.matrixNeedsUpdate = true;
    }

}

export { Camera2D };
