import { Box } from './Box.js';

class Sprite extends Box {

    constructor(src) {
        super();
        this.type = 'Sprite';

	    this.image = document.createElement('img');
	    if (src) this.setImage(src);

        // INTERNAL
        this._loaded = false;
    }

    setImage(src) {
        this._loaded = false;
        const self = this;
        this.image.onload = function() {
            self.box.min.set(0, 0);
            self.box.max.set(self.image.naturalWidth, self.image.naturalHeight);
            self.origin.copy(self.box.getCenter());
            self.computeBoundingBox();
            self._loaded = true;
        };
        this.image.src = src;
    }

    draw(context, viewport, canvas) {
        if (this.image.src.length > 0 && this._loaded) {
            context.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.box.min.x, this.box.min.y, this.box.max.x - this.box.min.x, this.box.max.y - this.box.min.y);
        }
    }

}

export { Sprite };
