import { ColorStyle} from './style/ColorStyle.js';
import { MathUtils } from '../../utils/MathUtils.js';
import { Object2D} from '../Object2D.js';
import { Vector2} from '../../math/Vector2.js';

const _globalPoint = new Vector2();
const _globalFrom = new Vector2();
const _globalTo = new Vector2();
const _scale = new Vector2();

class Line extends Object2D {

    #cameraScale = 1;

    constructor() {
        super();
        this.type = 'Line';

        this.from = new Vector2();
        this.to = new Vector2();

        this.strokeStyle = new ColorStyle('#ffffff');
        this.lineWidth = 5;
        this.constantWidth = false;

        /** Mouse isInside() pixel buffer, extends this many pixels away from line */
        this.mouseBuffer = 5;

        /**
         * Dash line pattern, if empty draws solid line.
         * Defined as the size of dashes as pairs of space with no line and with line.
         * For example, [1, 2] we get 1 point with line, 2 without line repeated.
         */
        this.dashPattern = [];
    }

    computeBoundingBox() {
        this.boundingBox.setFromPoints(this.from, this.to);
        return this.boundingBox;
    }

    isInside(point) {
        // Transform Points
        this.globalMatrix.applyToVector(_globalPoint.copy(point));
        this.globalMatrix.applyToVector(_globalFrom.copy(this.from));
        this.globalMatrix.applyToVector(_globalTo.copy(this.to));
        const x = _globalPoint.x;
        const y = _globalPoint.y;
        const x1 = _globalFrom.x;
        const y1 = _globalFrom.y;
        const x2 = _globalTo.x;
        const y2 = _globalTo.y;
        // Calculate Line Width
        let scaledLineWidth;
        if (this.constantWidth) {
            scaledLineWidth = this.lineWidth / this.#cameraScale;
        } else {
            function getPercentageOfDistance(start, destination) {
                const dx = destination.x - start.x;
                const dy = destination.y - start.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance === 0) return { x: 0, y: 0 };
                const percentX = Math.abs(dx / distance);
                const percentY = Math.abs(dy / distance);
                return { x: percentX, y: percentY };
            }
            const xyPercent = getPercentageOfDistance(this.from, this.to);
            this.globalMatrix.getScale(_scale);
            const scalePercent = (Math.abs(_scale.x * xyPercent.y) + Math.abs(_scale.y * xyPercent.x)) / (xyPercent.x + xyPercent.y);
            scaledLineWidth = MathUtils.sanity(this.lineWidth * scalePercent);
        }
        const buffer = (scaledLineWidth / 2) + (this.mouseBuffer / this.#cameraScale);
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

    style(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;
        this.#cameraScale = camera.scale;
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.strokeStyle.get(context);
        context.setLineDash(this.dashPattern);
    }

    draw(renderer) {
        const context = renderer.context;
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

}

export { Line };
