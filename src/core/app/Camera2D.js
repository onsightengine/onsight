import { Box2 } from '../../math/Box2.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Thing } from '../Thing.js';
import { Vector2 } from '../../math/Vector2.js';

const _cameraView = new Box2();
const _corner1 = new Vector2();
const _corner2 = new Vector2();
const _corner3 = new Vector2();
const _corner4 = new Vector2();
const _translate = new Matrix2();
const _rotate = new Matrix2();
const _scale = new Matrix2();

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
        this.width = 0;
        this.height = 0;
        this.viewport = new Box2(new Vector2(0, 0), new Vector2(0, 0));
    }

    intersectsViewport(renderer, box) {
        _corner1.copy(renderer.worldToScreen(box.min.x, box.min.y));
        _corner2.copy(renderer.worldToScreen(box.min.x, box.max.y));
        _corner3.copy(renderer.worldToScreen(box.max.x, box.min.y));
        _corner4.copy(renderer.worldToScreen(box.max.x, box.max.y));
        _cameraView.setFromPoints(_corner1, _corner2, _corner3, _corner4);
        return this.viewport.intersectsBox(_cameraView);
    }

    updateMatrix(force = false) {
        if (force !== true && this.matrixNeedsUpdate !== true) return;
        this.matrix.identity();
        this.matrix.rotate(this.rotation);
        this.matrix.scale(this.scale);
        this.matrix.translate(-this.position.x, -this.position.y);
        this.matrix.getInverse(this.inverseMatrix);
        this.matrixNeedsUpdate = false;
    }

    setViewport(width = 0, height = 0) {
        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.viewport.min.set(0, -height);
            this.viewport.max.set(width, 0);
            this.matrixNeedsUpdate = true;
        }
    }

}

export { Camera2D };
