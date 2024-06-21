import { Circle } from '../../core/objects/Circle.js';

class OriginHelper extends Circle {

    constructor(size = 5) {
        super(size);
        this.isHelper = true;
        this.type = 'OriginHelper';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.fillStyle.color = '--icon';
        this.strokeStyle.color = '#000000';

        this.lineWidth = 1;
        this.constantWidth = true;
    }

    computeBoundingBox() {
        this.boundingBox.clear();
    }

    draw(renderer) {
        this.layer = +Infinity;
        super.draw(renderer);
    }

}

export { OriginHelper };
