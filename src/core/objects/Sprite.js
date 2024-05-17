import { Box } from './Box.js';

class Sprite extends Box {

    constructor(src) {
        super();
        this.type = 'Sprite';

	    this.image = document.createElement('img');
	    if (src !== undefined) this.setImage(src);
    }

    setImage(src) {
        const self = this;
        this.image.onload = function() {
            self.box.min.set(0, 0);
            self.box.max.set(self.image.naturalWidth, self.image.naturalHeight);
        };
        this.image.src = src;
    }

    draw(context, viewport, canvas) {
        if (this.image.src.length > 0) {
            context.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.box.min.x, this.box.min.y, this.box.max.x - this.box.min.x, this.box.max.y - this.box.min.y);
        }
    }

}

export { Sprite };
