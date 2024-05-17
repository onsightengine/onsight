class Style {

    static extractColor(color, context) {
        function extractCSSVariableName(str) {
            const regex = /--[a-zA-Z0-9-_]+/;
            const match = str.match(regex);
            return match ? match[0] : null;
        }
        if (typeof color === 'string' && context) {
            const cssVariable = extractCSSVariableName(color, context);
            if (cssVariable) {
                const canvas = context.canvas;
                const computedStyle = getComputedStyle(canvas);
                const computedColor = computedStyle.getPropertyValue(cssVariable);
                if (computedColor && typeof computedColor === 'string' && computedColor !== '') {
                    if (color.includes('rgb(') || color.includes('rgba(')) {
                        return color.replace(cssVariable, computedColor);
                    } else {
                        return `rgb(${computedColor})`;
                    }
                } else {
                    return null;
                }
            }
        }
        return color;
    }

    constructor() {
        /**
         * Cached style object pre-generated from previous calls. To avoid regenerating the same style object every cycle.
         * Inherited classes should write their own get method that returns the style object and stores it in this property.
         * @type {string | CanvasGradient | CanvasPattern}
         */
        this.cache = null;

        /**
         * Indicates if the style object needs to be updated, should be used after applying changed to the style in order to generate a new object.
         * Inherited classes should implement this functionality.
         */
        this.needsUpdate = true;
    }

    /**
     * Get generated style object from style data and the drawing context.
     * @param {CanvasRenderingContext2D} context Context being used to draw the object.
     * @return {string | CanvasGradient | CanvasPattern} Return the canvas style object generated.
     */
    get(context) {}

}

export { Style };
