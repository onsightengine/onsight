import { Box2 } from '../../math/Box2.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Thing } from '../Thing.js';
import { Vector2 } from '../../math/Vector2.js';

const _cameraView = new Box2();
const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();
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
        this.viewport = new Box2(new Vector2(0, 0), new Vector2(1, 1));
    }

    intersectsViewport(box) {
        this.matrix.applyToVector(_topLeft.copy(box.min));
        this.matrix.applyToVector(_topRight.copy(box.max.x, box.min.y));
        this.matrix.applyToVector(_botLeft.copy(box.min.x, box.max.y));
        this.matrix.applyToVector(_botRight.copy(box.max));
        _cameraView.setFromPoints(_topLeft, _topRight, _botLeft, _botRight);
        return this.viewport.intersectsBox(_cameraView);
    }

    updateMatrix(offsetX, offsetY) {
        if (!this.matrixNeedsUpdate) return;
        this.matrix.identity();

        // Rotate
        this.matrix.multiply(_translate.set(1, 0, 0, 1, +offsetX, +offsetY));
        const c = Math.cos(this.rotation);
        const s = Math.sin(this.rotation);
        this.matrix.multiply(_rotate.set(c, s, -s, c, 0, 0));
        this.matrix.multiply(_translate.set(1, 0, 0, 1, -offsetX, -offsetY));

        // Translate
        this.matrix.multiply(_translate.set(1, 0, 0, 1, this.position.x, this.position.y));

        // Scale
        this.matrix.multiply(_scale.set(this.scale, 0, 0, this.scale, 0, 0));

        // Inverse
        this.matrix.getInverse(this.inverseMatrix);
        this.matrixNeedsUpdate = false;
    }

    setViewport(width = 1, height = 1) {
        this.viewport.max.set(width, height);
    }

}

export { Camera2D };
