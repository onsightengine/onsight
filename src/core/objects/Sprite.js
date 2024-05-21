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
            const halfWidth = self.image.naturalWidth / 2;
            const halfHeight = self.image.naturalHeight / 2;
            self.box.min.set(-halfWidth, -halfHeight);
            self.box.max.set(+halfWidth, +halfHeight);
            // self.origin.copy(self.box.getCenter());
            self.computeBoundingBox();
            self._loaded = true;
        };
        this.image.src = src;
    }

    draw(renderer) {
        const context = renderer.context;
        if (this.image.src.length > 0 && this._loaded) {
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
