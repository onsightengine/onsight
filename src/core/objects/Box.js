import { Box2 } from '../../math/Box2.js';
import { ColorStyle } from './style/ColorStyle.js';
import { Object2D } from '../Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

class Box extends Object2D {

    #box = new Box2();

    constructor() {
        super();
        this.type = 'Box';

        this.box = new Box2(new Vector2(-50, -50), new Vector2(50, 50));
        this.fillStyle = new ColorStyle('#FFFFFF');
        this.strokeStyle = new ColorStyle('#000000');
        this.lineWidth = 1;
        this.radius = 0;
        this.constantWidth = false;
    }

    computeBoundingBox() {
        this.boundingBox.copy(this.box);
        this.#box.copy(this.box);
        return this.boundingBox;
    }

    isInside(point) {
        return this.box.containsPoint(point);
    }

    draw(renderer) {
        // Check Bounds
        if (this.box.equals(this.#box) === false) {
            this.computeBoundingBox();
        }
        // Draw
        const context = renderer.context;
        if (this.radius === 0) {
            context.beginPath();
            context.moveTo(this.box.min.x, this.box.min.y);
            context.lineTo(this.box.max.x, this.box.min.y);
            context.lineTo(this.box.max.x, this.box.max.y);
            context.lineTo(this.box.min.x, this.box.max.y);
            context.closePath();
        } else {
            const width = Math.abs(this.box.max.x - this.box.min.x);
            const height = Math.abs(this.box.max.y - this.box.min.y);
            const x = Math.min(this.box.min.x, this.box.max.x);
            const y = Math.min(this.box.min.y, this.box.max.y);
            const radius = this.radius;
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
        }
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fill();
        }
        if (this.strokeStyle) {
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.strokeStyle.get(context);
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.stroke();
            context.restore();
        }
    }

}

export { Box };
