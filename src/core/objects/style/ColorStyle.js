import { Style } from './Style.js';

/**
 * Simple solid color style represented and stored as a CSS color.
 * Example value formats supported 'rgb(0, 153, 255)' or 'rgba(0, 153, 255, 0.3)' or '#0099ff' or '#0099ffaa' or 'red'.
 */
class ColorStyle extends Style {

    constructor(color = '#000000') {
        super();
        this.color = color;
    }

    get(context) {
        if (this.needsUpdate || this.cache == null) {
            this.cache = Style.extractColor(this.color, context);
            this.needsUpdate = false;
        }
        return this.cache;
    }

}

export { ColorStyle };
