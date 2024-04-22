const NAMES = {
    black: '#000000',
    gray: '#808080',
    grey: '#808080',
    white: '#ffffff',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    pink: '#ff00ff',
    purple: '#8000ff',
    cyan: '#00ffff',
    yellow: '#ffff00',
    orange: '#ff8000',
};

/**
 * Converts hex string to Color
 *
 * @param {String} hex
 * @returns {Color}
 */
export function hexToRGB(hex) {
    if (hex.length === 4) hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!rgb) console.warn(`ColorFunc.hexToRGB(): Unable to convert hex string ${hex} to rgb values`);
    return [ parseInt(rgb[1], 16) / 255, parseInt(rgb[2], 16) / 255, parseInt(rgb[3], 16) / 255 ];
}

/**
 * Converts integer to Color
 *
 * @param {Number} num
 * @returns {Color}
 */
export function numberToRGB(num) {
    num = parseInt(num);
    return [ ((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255 ];
}

/**
 * Attempts to convert input ('color') to a Color object
 *
 * @param {any} color
 * @returns {Color}
 */
export function parseColor(color) {
    // Empty ()
    if (color === undefined) return [ 0, 0, 0 ];

    // RGB (1.0, 0.0, 0.0) or (255, 0, 0);
    if (arguments.length === 3) {
        if (arguments[0] > 1 || arguments[1] > 1 || arguments[2] > 1) {
            arguments[0] /= 255;
            arguments[1] /= 255;
            arguments[2] /= 255;
        }
        return [...arguments];
    }

    // Number (16711680)
    if (!isNaN(color)) return numberToRGB(color);

    // Hex String (#ff0000)
    if (color[0] === '#') return hexToRGB(color);

    // Names ('red')
    if (NAMES[color.toLowerCase()]) return hexToRGB(NAMES[color.toLowerCase()]);

    // Unknown
    console.warn(`ColorFunc.parseColor(): Format not recognized, color - ${color}`);
    return [ 0, 0, 0 ];
}
