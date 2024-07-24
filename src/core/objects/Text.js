import { Box2 } from '../../math/Box2.js';
import { ColorStyle } from './style/ColorStyle.js';
import { Object2D } from '../Object2D.js';
import { Thing } from '../Thing.js';
import { Vector2 } from '../../math/Vector2.js';

class Text extends Object2D {

    #needsBounds = true;

    constructor(text = '', font = '14px Roboto, Helvetica, Arial, sans-serif') {
        super();
        this.type = 'Text';

        this.text = text;
        this.font = font;
        this.lineHeight = 1.2;

        this.strokeStyle = null;
        this.lineWidth = 1;
        this.fillStyle = new ColorStyle('#000000');

        this.textAlign = 'center';      // https://developer.mozilla.org/en-US/docs/Web/CSS/text-align
        this.textBaseline = 'middle';   // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
    }

    computeBoundingBox(renderer) {
        this.#needsBounds = true;
        if (renderer) {
            const context = renderer.context;
            context.font = this.font;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;
            // Split Text into Lines
            const lines = this.text.split('\n');
            const fontSize = parseInt(this.font.match(/\d+/), 10);
            const lineHeight = fontSize * this.lineHeight;
            // Find Maximum Width
            let maxWidth = 0;
            lines.forEach((line) => {
                const textMetrics = context.measureText(line);
                const textWidth = textMetrics.width;
                maxWidth = Math.max(maxWidth, textWidth);
            });
            // Find Total Height
            const textMetrics = context.measureText(this.text);
            const textHeight = Math.max(textMetrics.actualBoundingBoxAscent, textMetrics.actualBoundingBoxDescent) * 2.0;
            const totalHeight = (lines.length * textHeight) + ((lines.length - 1) * ((textHeight * this.lineHeight) - textHeight));
            // Set Bounding Box
            this.boundingBox.set(
                new Vector2(maxWidth / -2, totalHeight / -2),
                new Vector2(maxWidth / 2, totalHeight / 2)
            );
            this.#needsBounds = false;
        }
        return this.boundingBox;
    }

    isInside(point) {
        return this.boundingBox.containsPoint(point);
    }

    draw(renderer) {
        if (this.#needsBounds) this.computeBoundingBox(renderer);
        const context = renderer.context;
        context.font = this.font;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;

        // Split the text into Lines
        const lines = this.text.split('\n');
        const fontSize = parseInt(this.font.match(/\d+/), 10);
        const lineHeight = fontSize * this.lineHeight;
        const offset = ((lines.length - 1) * lineHeight) / 2;

        // Calculate the x-coordinate based on textAlign
        let x = 0;
        if (this.textAlign === 'center') {
            x = 0;
        } else if (this.textAlign === 'left') {
            x = this.boundingBox.min.x;
        } else if (this.textAlign === 'right') {
            x = this.boundingBox.max.x;
        }

        // Draw Each Line
        lines.forEach((line, index) => {
            const y = (index * lineHeight) - offset;
            if (this.fillStyle) {
                context.fillStyle = this.fillStyle.get(context);
                context.fillText(line, x, y);
            }
            if (this.strokeStyle) {
                context.lineWidth = this.lineWidth;
                context.strokeStyle = this.strokeStyle.get(context);
                context.strokeText(line, x, y);
            }
        });
    }

}

Thing.register('Text', Text);

export { Text };
