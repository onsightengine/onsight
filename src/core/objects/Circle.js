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

        // INTERNAL
        this._radius = 10.0;
    }

    get radius() { return this._radius; }
    set radius(value) {
        this._radius = value;
        this.computeBoundingBox();
    }

    computeBoundingBox() {
        this.boundingBox.min.set(-this._radius, -this._radius);
        this.boundingBox.max.set(+this._radius, +this._radius);
    }

    isInside(point) {
        return point.length() <= this._radius;
    }

    draw(context, camera, canvas) {
        context.beginPath();
        context.arc(0, 0, this._radius, 0, 2 * Math.PI);
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fill();
        }
        if (this.strokeStyle) {
            let scaleX = 1;
            let scaleY = 1;
            if (this.constantWidth) {
                const matrix = context.getTransform();
                scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
                scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            }
            context.lineWidth = this.lineWidth / Math.max(scaleX, scaleY);
            context.strokeStyle = this.strokeStyle.get(context);
            context.stroke();
        }
    }

}

export { Circle };
