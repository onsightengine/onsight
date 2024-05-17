import { ColorStyle } from './style/ColorStyle.js';
import { Object2D } from '../Object2D.js';

class Circle extends Object2D {

    constructor() {
        super();
        this.type = 'Circle';

        this.fillStyle = new ColorStyle('#FFFFFF');
        this.strokeStyle = new ColorStyle('#000000');
        this.lineWidth = 1;
        this.constantWidth = false;
        this.buffer = 0;

        // INTERNAL
        this._radius = 10.0;
    }

    get radius() { return this._radius; }
    set radius(value) {
        this._radius = value;
        this.computeBoundingBox();
    }

    computeBoundingBox() {
        const radius = this.radius;
        this.boundingBox.min.set(-radius, -radius);
        this.boundingBox.max.set(+radius, +radius);
    }

    isInside(point) {
        return point.length() <= (this._radius + this.buffer);
    }

    draw(context, camera, canvas, renderer) {
        context.beginPath();
        context.arc(0, 0, this._radius, 0, 2 * Math.PI);
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fill();
        }
        if (this.strokeStyle) {
            context.lineWidth = this.lineWidth;;
            context.strokeStyle = this.strokeStyle.get(context);
            if (this.constantWidth) {
                context.save();
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.stroke();
                context.restore();
            } else {
                context.stroke();
            }
        }
    }

}

export { Circle };
