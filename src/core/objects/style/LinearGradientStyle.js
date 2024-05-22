import { Style } from './Style.js';
import { Vector2 } from '../../../math/Vector2.js';

/**
 * Gradient of colors from one point to another, behind the two points used the color is solid.
 * Returns CanvasGradient (https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient)
 */
class LinearGradientStyle extends Style {

    constructor() {
        super();
        this.colors = [];                       // ordered list of gradient color stops (need at least one)
        this.start = new Vector2(-100, 0);      // starting point of the gradient
        this.end = new Vector2(100, 0);         // ending point of the gradient
    }

    /** Add a new color stop defined by an offset (between 0 and 1 inclusive) and a color to the gradient */
    addColorStop(offset, color) {
        this.colors.push({ offset, color });
    }

    get(context) {
        if (this.needsUpdate || this.cache == null) {
            const style = context.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
            for (const colorStop of this.colors) {
                const finalColor = Style.extractColor(colorStop.color) ?? '#ffffff';
                style.addColorStop(colorStop.offset, finalColor);
            }
            this.cache = style;
            this.needsUpdate = false;
        }
        return this.cache;
    }

}

export { LinearGradientStyle };
