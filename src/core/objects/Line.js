import { ColorStyle} from './style/ColorStyle.js';
import { MathUtils } from '../../utils/MathUtils.js';
import { Object2D} from '../Object2D.js';
import { Vector2} from '../../math/Vector2.js';

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
        this._cameraScale = 1;
        this._from = new Vector2();
        this._to = new Vector2();
    }

    computeBoundingBox() {
        this.boundingBox.setFromPoints(this.from, this.to);
    }

    isInside(point) {
        // Transform Points
        const globalPoint = this.globalMatrix.transformPoint(point);
        const globalFrom = this.globalMatrix.transformPoint(this.from);
        const globalTo = this.globalMatrix.transformPoint(this.to);
        const x = globalPoint.x;
        const y = globalPoint.y;
        const x1 = globalFrom.x;
        const y1 = globalFrom.y;
        const x2 = globalTo.x;
        const y2 = globalTo.y;
        // Calculate Line Width
        let scaledLineWidth;
        if (this.constantWidth) {
            scaledLineWidth = this.lineWidth / this._cameraScale;
        } else {
            function getPercentageOfDistance(origin, destination) {
                const dx = destination.x - origin.x;
                const dy = destination.y - origin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance === 0) { return { x: 0, y: 0 }; }
                const percentX = dx / distance;
                const percentY = dy / distance;
                return { x: percentX, y: percentY };
            }
            const xyPercent = getPercentageOfDistance(this.from, this.to);
            const scale = this.globalMatrix.getScale();
            const scalePercent = (Math.abs(scale.x * xyPercent.y) + Math.abs(scale.y * xyPercent.x)) / (xyPercent.x + xyPercent.y);
            scaledLineWidth = MathUtils.sanity(this.lineWidth * scalePercent);
        }
        const buffer = (scaledLineWidth / 2) + (this.mouseBuffer / this._cameraScale);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        // Line has zero length?
        if (lengthSquared === 0) return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)) <= buffer;
        // Line okay...
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
        this._cameraScale = camera.scale;
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.strokeStyle.get(context);
        context.setLineDash(this.dashPattern);
    }

    draw(context, camera, canvas, renderer) {
        context.beginPath();
        context.moveTo(this.from.x, this.from.y);
        context.lineTo(this.to.x, this.to.y);
        if (this.constantWidth) {
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.stroke();
            context.restore();
        } else {
            context.stroke();
        }
    }

    onUpdate(renderer) {
        if ((this.from.equals(this._from) === false) || (this.to.equals(this._to) === false)) {
            this.computeBoundingBox();
            this._from.copy(this.from);
            this._to.copy(this.to);
        }
    }

}

export { Line };
