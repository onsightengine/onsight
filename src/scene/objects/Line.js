import { ColorStyle} from './style/ColorStyle.js';
import { Object2D} from '../Object2D.js';
import { Style} from './style/Style.js';
import { Vector2} from '../math/Vector2.js';

class Line extends Object2D {

    constructor() {
        super();
        this.type = 'Line';

        this.from = new Vector2();
        this.to = new Vector2();

        this.strokeStyle = new ColorStyle('#ffffff');
        this.lineWidth = 5;
        this.constantWidth = false;

        /** Mouse inside pixel buffer, extends this many pixels away from line */
        this.mouseBuffer = 5;

        /**
         * Dash line pattern to be used, if empty draws a solid line.
         * Dash pattern is defined as the size of dashes as pairs of space with no line and with line.
         * E.g if the dash pattern is [1, 2] we get 1 point with line, 2 without line repeat infinitelly.
         */
        this.dashPattern = [];

        // INTERNAL
        this.scaledLineWidth = this.lineWidth;
        this._from = new Vector2();
        this._to = new Vector2();
    }

    computeBoundingBox() {
        this.boundingBox.setFromPoints(this.from, this.to);
    }

    isInside(point) {
        const x = point.x;
        const y = point.y;
        const x1 = this.from.x;
        const y1 = this.from.y;
        const x2 = this.to.x;
        const y2 = this.to.y;
        const buffer = (this.scaledLineWidth / 2) + this.mouseBuffer;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        // Line has zero length
        if (lengthSquared === 0) {
            return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)) <= buffer;
        }
        const t = ((x - x1) * dx + (y - y1) * dy) / lengthSquared;
        let nearestX, nearestY;
        if (t < 0) {
            nearestX = x1;
            nearestY = y1;
        } else if (t > 1) {
            nearestX = x2;
            nearestY = y2;
        } else {
            nearestX = x1 + t * dx;
            nearestY = y1 + t * dy;
        }
        const distanceSquared = (x - nearestX) * (x - nearestX) + (y - nearestY) * (y - nearestY);
        return distanceSquared <= buffer * buffer;
    }

    style(context, camera, canvas) {
        let scaleX = 1;
        let scaleY = 1;
        if (this.constantWidth) {
            const matrix = context.getTransform();
            scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
            scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            this.scaledLineWidth = this.lineWidth / Math.max(scaleX, scaleY);
        } else {
            this.scaledLineWidth = this.lineWidth;
        }
        context.lineWidth = this.scaledLineWidth;
        context.strokeStyle = this.strokeStyle.get(context);
        context.setLineDash(this.dashPattern);
    }

    draw(context, camera, canvas) {
        context.beginPath();
        context.moveTo(this.from.x, this.from.y);
        context.lineTo(this.to.x, this.to.y);
        context.stroke();
    }

    onUpdate(context, camera) {
        if ((this.from.equals(this._from) === false) || (this.to.equals(this._to) === false)) {
            this.computeBoundingBox();
            this._from.copy(this.from);
            this._to.copy(this.to);
        }
    }

}

export { Line };
