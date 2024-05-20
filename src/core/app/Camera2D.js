import { Box2 } from '../../math/Box2.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Thing } from '../Thing.js';
import { Vector2 } from '../../math/Vector2.js';

class Camera2D extends Thing {

    constructor() {
        super('Camera2D');
        this.type = 'Camera2D';

        // Transform
        this.position = new Vector2(0, 0);
        this.scale = 1.0;
        this.rotation = 0.0;

        // Matrix
        this.matrix = new Matrix2();
        this.inverseMatrix = new Matrix2();
        this.matrixNeedsUpdate = true;

        // Viewport
        this.viewport = new Box2(new Vector2(0, 0), new Vector2(1, 1));
    }

    intersectsViewport(box) {
        const topLeft = this.matrix.transformPoint(box.min);
        const topRight = this.matrix.transformPoint(new Vector2(box.max.x, box.min.y));
        const bottomLeft = this.matrix.transformPoint(new Vector2(box.min.x, box.max.y));
        const bottomRight = this.matrix.transformPoint(box.max);
        const cameraViewBox = new Box2().setFromPoints(topLeft, topRight, bottomLeft, bottomRight);
        return this.viewport.intersectsBox(cameraViewBox);
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

    setViewport(width = 1, height = 1) {
        this.viewport.max.set(width, height);
    }

}

export { Camera2D };
