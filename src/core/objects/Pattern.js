import { Box } from './Box.js';
import { Box2 } from '../../math/Box2.js';

class Pattern extends Box {

    #box = new Box2();

    constructor(src) {
        super();
        this.type = 'Pattern';

	    this.image = document.createElement('img');
	    if (src) this.setImage(src);

        // Pattern, see https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern
        //
        // - repitition: 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
        //
        // - transform: pattern always starts at (0, 0), use CanvasPattern.setTransform() to apply a DOMMatrix
        //              representing a linear transform to the pattern
        //
        this.repetition = 'repeat';
    }

    setImage(src) {
        const self = this;
        this.image.onload = function() {
            self.box.min.set(0, 0);
            self.box.max.set(self.image.naturalWidth, self.image.naturalHeight);
            self.computeBoundingBox();
        };
        this.image.src = src;
    }

    draw(renderer) {
        // Check Bounds
        if (this.box.equals(this.#box) === false) {
            this.computeBoundingBox();
        }
        // Draw
        const context = renderer.context;
        if (this.image.src.length > 0 && this.image.complete) {
            const width = this.box.max.x - this.box.min.x;
	        const height = this.box.max.y - this.box.min.y;
            const pattern = context.createPattern(this.image, this.repetition);
		    context.fillStyle = pattern;
		    context.fillRect(this.box.min.x, - this.box.max.y, width, height);
        }
    }

}

export { Pattern };
