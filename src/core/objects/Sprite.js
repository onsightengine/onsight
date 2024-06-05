import { Box } from './Box.js';
import { Box2 } from '../../math/Box2.js';

class Sprite extends Box {

    #box = new Box2();

    constructor(src) {
        super();
        this.type = 'Sprite';

	    this.image = document.createElement('img');
	    if (src) this.setImage(src);
    }

    setImage(src) {
        const self = this;
        this.image.onload = function() {
            const halfWidth = self.image.naturalWidth / 2;
            const halfHeight = self.image.naturalHeight / 2;
            self.box.min.set(-halfWidth, -halfHeight);
            self.box.max.set(+halfWidth, +halfHeight);
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
            const width = this.image.naturalWidth;
            const height = this.image.naturalHeight;
            const sx = 0;
            const sy = 0;
            const sw = width;
            const sh = height;
            const dx = width / -2;
            const dy = height / -2;
            const dw = width;
            const dh = height;
            context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }

}

export { Sprite };
