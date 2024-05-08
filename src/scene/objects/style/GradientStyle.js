import { Style } from './Style.js';
import { GradientColorStop } from './GradientColorStop.js';

class GradientStyle extends Style {

    constructor() {
        super();
        this.colors = [];       // ordered list of gradient color stops (need at least one)
    }

    /**
     * Add a new color stop defined by an offset and a color to the gradient.
     * If the offset is not between 0 and 1 inclusive, or if color can't be parsed as a CSS color, an error is raised.
     * @param {number} offset Offset of the color stop between 0 and 1 inclusive.
     * @param {string} color CSS color value.
     */
    addColorStop(offset, color) {
        this.colors.push(new GradientColorStop(offset, color));
    }

}

export { GradientStyle };
