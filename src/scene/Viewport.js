import { Box2 } from './math/Box2.js';
import { Vector2 } from './math/Vector2.js';

class Viewport {

    constructor(context, camera) {
        const canvas = context.canvas;
        const topLeft = new Vector2(0, 0);
        const bottomRight = new Vector2(canvas.width, canvas.height);
        this.box = new Box2(topLeft, bottomRight)
    }

    intersectsBox(camera, box) {
        const topLeft = camera.matrix.transformPoint(box.min);
        const topRight = camera.matrix.transformPoint(new Vector2(box.max.x, box.min.y));
        const bottomLeft = camera.matrix.transformPoint(new Vector2(box.min.x, box.max.y));
        const bottomRight = camera.matrix.transformPoint(box.max);
        const actualBox = new Box2().setFromPoints(topLeft, topRight, bottomLeft, bottomRight);
        return this.box.intersectsBox(actualBox);
    }

}

export { Viewport };
