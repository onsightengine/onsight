import { Box2 } from '../math/Box2.js';
import { ColorStyle } from './style/ColorStyle.js';
import { Object2D } from '../Object2D.js';
import { Vector2 } from '../math/Vector2.js';

class Text extends Object2D {

    constructor(text = '', font = '16px Arial') {
        super();
        this.type = 'Text';

        this.text = text;
        this.font = font;

        this.strokeStyle = null;
        this.lineWidth = 1;
        this.fillStyle = new ColorStyle('#000000');

        this.textAlign = 'center';      // https://developer.mozilla.org/en-US/docs/Web/CSS/text-align
        this.textBaseline = 'middle';   // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline

        // INTERNAL
        this._font = font;
        this._text = text;
    }

    computeBoundingBox(context) {
        if (!context) return false;
        context.font = this.font;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;
        const textMetrics = context.measureText(this.text);
        const textWidth = textMetrics.width;
        const textHeight = Math.max(textMetrics.actualBoundingBoxAscent, textMetrics.actualBoundingBoxDescent) * 2.0;
        this.boundingBox.set(new Vector2(textWidth / -2, textHeight / -2), new Vector2(textWidth / 2, textHeight / 2));
        return true;
    }

    isInside(point) {
        return this.boundingBox.containsPoint(point);
    }

    draw(context, camera, canvas) {
        context.font = this.font;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;

        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fillText(this.text, 0, 0);
        }
        if (this.strokeStyle) {
            context.strokeStyle = this.strokeStyle.get(context);
            context.strokeText(this.text, 0, 0);
        }
    }

    onUpdate(context, camera) {
        if (this._font !== this.font || this._text !== this.text) {
            if (this.computeBoundingBox(context)) {
                this._font = this.font;
                this._text = this.text;
            }
        }
    }

}

export { Text };
