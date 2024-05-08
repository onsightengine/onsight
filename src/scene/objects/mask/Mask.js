import { Object2D } from '../../Object2D.js';

/**
 * A mask can be used to set the drawing region.
 * Masks are treated as objects their shape is used to filter other objects shape.
 * Multiple mask objects can be active simultaneously, they have to be attached to the object mask list to filter the render region.
 * A mask objects is draw using the context.clip() method.
 */
class Mask extends Object2D {

    constructor() {
        super();
        this.isMask = true;
        this.type = 'Mask';
    }

    /**
     * Clip the canvas context. Define a clipping path and set the clip using the context.clip() method.
     * Ensures that next objects being drawn are clipped to the path stored here.
     * More information about canvas clipping https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip.
     * @param {CanvasRenderingContext2D} context Canvas 2d drawing context.
     * @param {Camera} camera Camera applied to the canvas.
     * @param {DOM} canvas DOM canvas element where the content is being drawn.
     */
    clip(context, camera, canvas) {

    }

}

export { Mask };
