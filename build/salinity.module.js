/**
 * @description Salinity Engine
 * @about       Easy to use JavaScript game engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.3
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine/engine
 */
var name = "@salinity/engine";
var version = "0.0.3";
var description = "Easy to use JavaScript game engine.";
var module = "src/Salinity.js";
var main = "build/salinity.module.js";
var type = "module";
var scripts = {
	build: "rollup -c",
	prepublishOnly: "npm run build"
};
var files = [
	"build/*",
	"src/*"
];
var keywords = [
	"salinity",
	"game",
	"engine",
	"webgl",
	"javascript",
	"graphics"
];
var repository = {
	type: "git",
	url: "git+https://github.com/salinityengine/engine.git"
};
var author = "Stephens Nunnally <stephens@scidian.com>";
var license = "MIT";
var bugs = {
	url: "https://github.com/salinityengine/engine/issues"
};
var homepage = "https://github.com/salinityengine";
var publishConfig = {
	access: "public",
	registry: "https://registry.npmjs.org/"
};
var devDependencies = {
	"@rollup/plugin-json": "^6.1.0",
	"@rollup/plugin-terser": "^0.4.4",
	"rollup-plugin-cleanup": "^3.2.1",
	"rollup-plugin-visualizer": "^5.12.0"
};
var pkg = {
	name: name,
	version: version,
	description: description,
	module: module,
	main: main,
	type: type,
	scripts: scripts,
	files: files,
	keywords: keywords,
	repository: repository,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	"private": false,
	publishConfig: publishConfig,
	devDependencies: devDependencies
};

const VERSION = pkg.version;
const APP_SIZE = 1000;
const APP_EVENTS = [
    'init',
    'update',
    'destroy',
    'keydown',
    'keyup',
    'pointerdown',
    'pointerup',
    'pointermove',
];
const APP_ORIENTATION = {
    PORTRAIT:       'portrait',
    LANDSCAPE:      'landscape',
};
const WORLD_TYPES = {
    World2D:        'World2D',
    World3D:        'World3D',
    WorldUI:        'WorldUI',
};
const SCRIPT_FORMAT = {
    JAVASCRIPT:     'js',
    PYTHON:         'python',
};

class Iris {
    static get NAMES() { return COLOR_KEYWORDS; }
    constructor(r = 0xffffff, g, b, format = '') {
        this.isColor = true;
        this.isIris = true;
        this.type = 'Color';
        this.r = 1;
        this.g = 1;
        this.b = 1;
        this.set(r, g, b, format);
    }
    copy(colorObject) {
        return this.set(colorObject);
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b);
    }
    set(r = 0, g, b, format = '') {
        if (arguments.length === 0) {
            return this.set(0);
        } else if (r === undefined || r === null || Number.isNaN(r)) {
            if (g || b) console.warn(`Iris.set(): Invalid 'r' value ${r}`);
        } else if (g === undefined && b === undefined) {
            let value = r;
            if (typeof value === 'number' || value === 0) { return this.setHex(value);
            } else if (value && isRGB(value)) { return this.setRGBF(value.r, value.g, value.b);
            } else if (value && isHSL(value)) { return this.setHSL(value.h * 360, value.s, value.l);
            } else if (value && isRYB(value)) { return this.setRYB(value.r * 255, value.y * 255, value.b * 255);
            } else if (Array.isArray(value) && value.length > 2) {
                let offset = (g != null && !Number.isNaN(g) && g > 0) ? g : 0;
                return this.setRGBF(value[offset], value[offset + 1], value[offset + 2])
            } else if (typeof value === 'string') {
                return this.setStyle(value);
            }
        } else {
            switch (format) {
                case 'rgb': return this.setRGB(r, g, b);
                case 'hsl': return this.setHSL(r, g, b);
                case 'ryb': return this.setRYB(r, g, b);
                default:    return this.setRGBF(r, g, b);
            }
        }
        return this;
    }
    setColorName(style) {
        const hex = COLOR_KEYWORDS[style.toLowerCase()];
        if (hex) return this.setHex(hex);
        console.warn(`Iris.setColorName(): Unknown color ${style}`);
        return this;
    }
    setHex(hexColor) {
        hexColor = Math.floor(hexColor);
        if (hexColor > 0xffffff || hexColor < 0) {
            console.warn(`Iris.setHex(): Given decimal outside of range, value was ${hexColor}`);
            hexColor = clamp(hexColor, 0, 0xffffff);
        }
        const r = (hexColor & 0xff0000) >> 16;
        const g = (hexColor & 0x00ff00) >>  8;
        const b = (hexColor & 0x0000ff);
        return this.setRGB(r, g, b);
    }
    setHSL(h, s, l) {
        h = keepInRange(h, 0, 360);
        s = clamp(s, 0, 1);
        l = clamp(l, 0, 1);
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - (c / 2);
        let r = 0, g = 0, b = 0;
        if                  (h <  60) { r = c; g = x; b = 0; }
        else if ( 60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h)            { r = c; g = 0; b = x; }
        this.setRGBF(r + m, g + m, b + m);
        return this;
    }
    setRandom() {
        return this.setRGBF(Math.random(), Math.random(), Math.random());
    };
    setRGB(r, g, b) {
        return this.setRGBF(r / 255, g / 255, b / 255);
    }
    setRGBF(r, g, b) {
        this.r = clamp(r, 0, 1);
        this.g = clamp(g, 0, 1);
        this.b = clamp(b, 0, 1);
        return this;
    }
    setRYB(r, y, b) {
        const hexColor = cubicInterpolation(clamp(r, 0, 255), clamp(y, 0, 255), clamp(b, 0, 255), 255, CUBE.RYB_TO_RGB);
        return this.setHex(hexColor);
    }
    setScalar(scalar) {
        return this.setRGB(scalar, scalar, scalar);
    }
    setScalarF(scalar) {
        return this.setRGBF(scalar, scalar, scalar);
    }
    setStyle(style) {
        let m;
        if (m = /^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(style)) {
            let color;
            const name = m[1];
            const components = m[2];
            switch (name) {
                case 'rgb':
                case 'rgba':
                    if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                        const r = Math.min(255, parseInt(color[1], 10));
                        const g = Math.min(255, parseInt(color[2], 10));
                        const b = Math.min(255, parseInt(color[3], 10));
                        return this.setRGB(r, g, b);
                    }
                    if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                        const r = (Math.min(100, parseInt(color[1], 10)) / 100);
                        const g = (Math.min(100, parseInt(color[2], 10)) / 100);
                        const b = (Math.min(100, parseInt(color[3], 10)) / 100);
                        return this.setRGBF(r, g, b);
                    }
                    break;
                case 'hsl':
                case 'hsla':
                    if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                        const h = parseFloat(color[1]);
                        const s = parseInt(color[2], 10) / 100;
                        const l = parseInt(color[3], 10) / 100;
                        return this.setHSL(h, s, l);
                    }
                    break;
            }
        } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
            const hex = m[1];
            const size = hex.length;
            if (size === 3) {
                const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
                const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
                const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
                return this.setRGB(r, g, b);
            } else if (size === 6) {
                const r = parseInt(hex.charAt(0) + hex.charAt(1), 16);
                const g = parseInt(hex.charAt(2) + hex.charAt(3), 16);
                const b = parseInt(hex.charAt(4) + hex.charAt(5), 16);
                return this.setRGB(r, g, b);
            }
        }
        if (style && style.length > 0) {
            return this.setColorName(style);
        }
        return this;
    }
    cssString(alpha ) {
        return ('rgb(' + this.rgbString(alpha) + ')');
    }
    hex() {
        return ((this.red() << 16) + (this.green() << 8) + this.blue());
    }
    hexString(inputColorData ){
        if (inputColorData) this.set(inputColorData);
        return Iris.hexString(this.hex());
    }
    static hexString(inputColorData = 0x000000){
        _temp.set(inputColorData);
        return '#' + ('000000' + ((_temp.hex()) >>> 0).toString(16)).slice(-6);
    }
    static randomHex() {
        return _random.setRandom().hex();
    }
    rgbString(alpha) {
        const rgb = this.red() + ', ' + this.green() + ', ' + this.blue();
        return ((alpha != undefined) ? String(rgb + ', ' + alpha) : rgb);
    }
    toJSON() {
        return this.hex();
    }
    getHSL(target) {
        if (target && isHSL(target)) {
            target.h = hueF(this.hex());
            target.s = saturation(this.hex());
            target.l = lightness(this.hex());
        } else {
            return { h: hueF(this.hex()), s: saturation(this.hex()), l: lightness(this.hex()) };
        }
    }
    getRGB(target) {
        if (target && isHSL(target)) {
            target.r = this.r;
            target.g = this.g;
            target.b = this.b;
        } else {
            return { r: this.r, g: this.g, b: this.b };
        }
    }
    getRYB(target) {
        let rybAsHex = cubicInterpolation(this.r, this.g, this.b, 1.0, CUBE.RGB_TO_RYB);
        if (target && isRYB(target)) {
            target.r = redF(rybAsHex);
            target.y = greenF(rybAsHex);
            target.b = blueF(rybAsHex);
            return target;
        }
        return {
            r: redF(rybAsHex),
            y: greenF(rybAsHex),
            b: blueF(rybAsHex)
        };
    }
    toArray(array = [], offset = 0) {
        array[offset] = this.r;
        array[offset + 1] = this.g;
        array[offset + 2] = this.b;
        return array;
    }
    red() { return clamp(Math.floor(this.r * 255), 0, 255); }
    green() { return clamp(Math.floor(this.g * 255), 0, 255); }
    blue() { return clamp(Math.floor(this.b * 255), 0, 255); }
    redF() { return this.r; }
    greenF() { return this.g; }
    blueF() { return this.b; }
    hue() { return hue(this.hex()); }
    saturation() { return saturation(this.hex()); }
    lightness() { return lightness(this.hex()); }
    hueF() { return hueF(this.hex()); }
    hueRYB() {
        for (let i = 1; i < RYB_OFFSET.length; i++) {
            if (RYB_OFFSET[i] > this.hue()) return i - 2;
        }
    }
    add(color) {
        if (!color.isColor) console.warn(`Iris.add(): Missing 'color' object`);
        return this.setRGBF(this.r + color.r, this.g + color.g, this.b + color.b);
    }
    addScalar(scalar) {
        return this.setRGB(this.red() + scalar, this.green() + scalar, this.blue() + scalar);
    }
    addScalarF(scalar) {
        return this.setRGBF(this.r + scalar, this.g + scalar, this.b + scalar);
    }
    brighten(amount = 0.5  ) {
        let h = hue(this.hex());
        let s = saturation(this.hex());
        let l = lightness(this.hex());
        l = l + ((1.0 - l) * amount);
        this.setHSL(h, s, l);
        return this;
    }
    darken(amount = 0.5  ) {
        let h = hue(this.hex());
        let s = saturation(this.hex());
        let l = lightness(this.hex()) * amount;
        return this.setHSL(h, s, l);
    }
    greyscale(percent = 1.0, format = 'luminosity') { return this.grayscale(percent, format) }
    grayscale(percent = 1.0, format = 'luminosity') {
        let gray = 0;
        switch (format) {
            case 'luminosity':
                gray = (this.r * 0.21) + (this.g * 0.72) + (this.b * 0.07);
            case 'average':
            default:
                gray = (this.r + this.g + this.b) / 3;
        }
        percent = clamp(percent, 0, 1);
        const r = (this.r * (1.0 - percent)) + (percent * gray);
        const g = (this.g * (1.0 - percent)) + (percent * gray);
        const b = (this.b * (1.0 - percent)) + (percent * gray);
        return this.setRGBF(r, g, b);
    }
    hslOffset(h, s, l) {
        return this.setHSL(this.hue() + h, this.saturation() + s, this.lightness() + l);
    }
    mix(color, percent = 0.5) {
        if (!color.isColor) console.warn(`Iris.mix(): Missing 'color' object`);
        percent = clamp(percent, 0, 1);
        const r = (this.r * (1.0 - percent)) + (percent * color.r);
        const g = (this.g * (1.0 - percent)) + (percent * color.g);
        const b = (this.b * (1.0 - percent)) + (percent * color.b);
        return this.setRGBF(r, g, b);
    }
    multiply(color) {
        if (!color.isColor) console.warn(`Iris.multiply(): Missing 'color' object`);
        return this.setRGBF(this.r * color.r, this.g * color.g, this.b * color.b);
    }
    multiplyScalar(scalar) {
        return this.setRGBF(this.r * scalar, this.g * scalar, this.b * scalar);
    }
    rgbComplementary() {
        return this.rgbRotateHue(180);
    }
    rgbRotateHue(degrees = 90) {
        const newHue = keepInRange(this.hue() + degrees);
        return this.setHSL(newHue, this.saturation(), this.lightness());
    }
    rybAdjust() {
        return this.setHSL(hue(matchSpectrum(this.hue(), SPECTRUM.RYB)), this.saturation(), this.lightness());
    }
    rybComplementary() {
        return this.rybRotateHue(180);
    }
    rybRotateHue(degrees = 90) {
        const newHue = keepInRange(this.hueRYB() + degrees);
        return this.setHSL(hue(matchSpectrum(newHue, SPECTRUM.RYB)), this.saturation(), this.lightness());
    }
    subtract(color) {
        if (!color.isColor) console.warn(`Iris: subtract() was not called with a 'Color' object`);
        return this.setRGBF(this.r - color.r, this.g - color.g, this.b - color.b);
    }
    equals(color) {
        if (!color.isColor) console.warn(`Iris: equals() was not called with a 'Color' object`);
        return (fuzzy(this.r, color.r) && fuzzy(this.g, color.g) && fuzzy(this.b, color.b));
    }
    isEqual(color) {
        return this.equals(color);
    }
    isDark() {
        const h = this.hue();
        const l = this.lightness();
        return ((l < 0.60 && (h >= 210 || h <= 27)) || (l <= 0.32));
    }
    isLight() {
        return (!this.isDark());
    }
}
function isRGB(object) { return (object.r !== undefined && object.g !== undefined && object.b !== undefined); }
function isHSL(object) { return (object.h !== undefined && object.s !== undefined && object.l !== undefined); }
function isRYB(object) { return (object.r !== undefined && object.y !== undefined && object.b !== undefined); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function red(hexColor) { return clamp((hexColor & 0xff0000) >> 16, 0, 255); }
function green(hexColor) { return clamp((hexColor & 0x00ff00) >> 8, 0, 255); }
function blue(hexColor) { return clamp((hexColor & 0x0000ff), 0, 255); }
function redF(hexColor) { return red(hexColor) / 255.0; }
function greenF(hexColor) { return green(hexColor) / 255.0; }
function blueF(hexColor) { return blue(hexColor) / 255.0; }
function hue(hexColor) { return hsl(hexColor, 'h'); }
function hueF(hexColor) { return hue(hexColor) / 360; }
function saturation(hexColor) { return hsl(hexColor, 's'); }
function lightness(hexColor) { return hsl(hexColor, 'l'); }
function fuzzy(a, b, tolerance = 0.0015) { return ((a < (b + tolerance)) && (a > (b - tolerance))); }
function keepInRange(value, min = 0, max = 360) {
    while (value >= max) value -= (max - min);
    while (value <  min) value += (max - min);
    return value;
}
let _hslHex, _hslH, _hslS, _hslL;
function hsl(hexColor, channel = 'h') {
    if (hexColor !== _hslHex) {
        if (hexColor === undefined || hexColor === null) return 0;
        const r = redF(hexColor), g = greenF(hexColor), b = blueF(hexColor);
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const delta = max - min;
        _hslL = (max + min) / 2;
        if (delta === 0) {
            _hslH = _hslS = 0;
        } else {
            _hslS = (_hslL <= 0.5) ? (delta / (max + min)) : (delta / (2 - max - min));
            switch (max) {
                case r: _hslH = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: _hslH = (b - r) / delta + 2; break;
                case b: _hslH = (r - g) / delta + 4; break;
            }
            _hslH = Math.round(_hslH * 60);
            if (_hslH < 0) _hslH += 360;
        }
        _hslHex = hexColor;
    }
    switch (channel) {
        case 'h': return _hslH;
        case 's': return _hslS;
        case 'l': return _hslL;
        default: console.warn(`Iris.hsl(): Unknown channel (${channel}) requested`);
    }
    return 0;
}
const _interpolate = new Iris();
const _mix1 = new Iris();
const _mix2 = new Iris();
const _random = new Iris();
const _temp = new Iris();
function matchSpectrum(matchHue, spectrum = SPECTRUM.RYB) {
    let colorDegrees = 360 / spectrum.length;
    let degreeCount = colorDegrees;
    let stopCount = 0;
    for (let i = 0; i < spectrum.length; i++) {
        if (matchHue < degreeCount) {
            let percent = (degreeCount - matchHue) / colorDegrees;
            _mix1.set(spectrum[stopCount + 1]);
            return _mix1.mix(_mix2.set(spectrum[stopCount]), percent).hex();
        } else {
            degreeCount = degreeCount + colorDegrees;
            stopCount = stopCount + 1;
        }
    }
}
function cubicInterpolation(v1, v2, v3, scale = 255, table = CUBE.RYB_TO_RGB) {
    v1 = clamp(v1 / scale, 0, 1);
    v2 = clamp(v2 / scale, 0, 1);
    v3 = clamp(v3 / scale, 0, 1);
    const f0 = table[0], f1 = table[1], f2 = table[2], f3 = table[3];
    const f4 = table[4], f5 = table[5], f6 = table[6], f7 = table[7];
    const i1 = 1.0 - v1;
    const i2 = 1.0 - v2;
    const i3 = 1.0 - v3;
    const c0 = i1 * i2 * i3;
    const c1 = i1 * i2 * v3;
    const c2 = i1 * v2 * i3;
    const c3 = v1 * i2 * i3;
    const c4 = i1 * v2 * v3;
    const c5 = v1 * i2 * v3;
    const c6 = v1 * v2 * i3;
    const v7 = v1 * v2 * v3;
    const o1 = c0*f0[0] + c1*f1[0] + c2*f2[0] + c3*f3[0] + c4*f4[0] + c5*f5[0] + c6*f6[0] + v7*f7[0];
    const o2 = c0*f0[1] + c1*f1[1] + c2*f2[1] + c3*f3[1] + c4*f4[1] + c5*f5[1] + c6*f6[1] + v7*f7[1];
    const o3 = c0*f0[2] + c1*f1[2] + c2*f2[2] + c3*f3[2] + c4*f4[2] + c5*f5[2] + c6*f6[2] + v7*f7[2];
    return _interpolate.set(o1, o2, o3, 'gl').hex();
}
const CUBE = {
    RYB_TO_RGB: [
        [ 1.000, 1.000, 1.000 ],
        [ 0.163, 0.373, 0.600 ],
        [ 1.000, 1.000, 0.000 ],
        [ 1.000, 0.000, 0.000 ],
        [ 0.000, 0.660, 0.200 ],
        [ 0.500, 0.000, 0.500 ],
        [ 1.000, 0.500, 0.000 ],
        [ 0.000, 0.000, 0.000 ]
    ],
    RGB_TO_RYB: [
        [ 1.000, 1.000, 1.000 ],
        [ 0.000, 0.000, 1.000 ],
        [ 0.000, 1.000, 0.483 ],
        [ 1.000, 0.000, 0.000 ],
        [ 0.000, 0.053, 0.210 ],
        [ 0.309, 0.000, 0.469 ],
        [ 0.000, 1.000, 0.000 ],
        [ 0.000, 0.000, 0.000 ]
    ]
};
const SPECTRUM = {
    RYB: [
        0xFF0000, 0xFF4900, 0xFF7400, 0xFF9200, 0xFFAA00, 0xFFBF00, 0xFFD300, 0xFFE800,
        0xFFFF00, 0xCCF600, 0x9FEE00, 0x67E300, 0x00CC00, 0x00AF64, 0x009999, 0x0B61A4,
        0x1240AB, 0x1B1BB3, 0x3914AF, 0x530FAD, 0x7109AA, 0xA600A6, 0xCD0074, 0xE40045,
        0xFF0000
    ]
};
const RYB_OFFSET = [
    0,   1,   2,   3,   5,   6,   7,   8,   9,  10,  11,  13,  14,  15,  16,  17,  18,  19,  19,  20,
    21,  21,  22,  23,  23,  24,  25,  25,  26,  27,  27,  28,  28,  29,  29,  30,  30,  31,  31,  32,
    32,  32,  33,  33,  34,  34,  35,  35,  35,  36,  36,  37,  37,  37,  38,  38,  38,  39,  39,  40,
    40,  40,  41,  41,  41,  42,  42,  42,  43,  43,  43,  44,  44,  44,  45,  45,  45,  46,  46,  46,
    47,  47,  47,  47,  48,  48,  48,  49,  49,  49,  50,  50,  50,  51,  51,  51,  52,  52,  52,  53,
    53,  53,  54,  54,  54,  55,  55,  55,  56,  56,  56,  57,  57,  57,  58,  58,  59,  59,  59,  60,
    60,  61,  61,  62,  63,  63,  64,  65,  65,  66,  67,  68,  68,  69,  70,  70,  71,  72,  72,  73,
    73,  74,  75,  75,  76,  77,  77,  78,  79,  79,  80,  81,  82,  82,  83,  84,  85,  86,  87,  88,
    88,  89,  90,  91,  92,  93,  95,  96,  98, 100, 102, 104, 105, 107, 109, 111, 113, 115, 116, 118,
    120, 122, 125, 127, 129, 131, 134, 136, 138, 141, 143, 145, 147, 150, 152, 154, 156, 158, 159, 161,
    163, 165, 166, 168, 170, 171, 173, 175, 177, 178, 180, 182, 184, 185, 187, 189, 191, 192, 194, 196,
    198, 199, 201, 203, 205, 206, 207, 208, 209, 210, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221,
    222, 223, 224, 226, 227, 228, 229, 230, 232, 233, 234, 235, 236, 238, 239, 240, 241, 242, 243, 244,
    245, 246, 247, 248, 249, 250, 251, 251, 252, 253, 254, 255, 256, 257, 257, 258, 259, 260, 260, 261,
    262, 263, 264, 264, 265, 266, 267, 268, 268, 269, 270, 271, 272, 273, 274, 274, 275, 276, 277, 278,
    279, 280, 282, 283, 284, 286, 287, 289, 290, 292, 293, 294, 296, 297, 299, 300, 302, 303, 305, 307,
    309, 310, 312, 314, 316, 317, 319, 321, 323, 324, 326, 327, 328, 329, 330, 331, 332, 333, 334, 336,
    337, 338, 339, 340, 341, 342, 343, 344, 345, 347, 348, 349, 350, 352, 353, 354, 355, 356, 358, 359,
    999
];
const COLOR_KEYWORDS = {
    'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4,
    'azure': 0xF0FFFF, 'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD,
    'blue': 0x0000FF, 'blueviolet': 0x8A2BE2, 'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0,
    'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50, 'cornflowerblue': 0x6495ED,
    'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
    'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9,
    'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B, 'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00,
    'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
    'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1,
    'darkviolet': 0x9400D3, 'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969,
    'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222, 'floralwhite': 0xFFFAF0,
    'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF,
    'gold': 0xFFD700, 'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F,
    'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4, 'indianred': 0xCD5C5C, 'indigo': 0x4B0082,
    'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
    'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF,
    'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3, 'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3,
    'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
    'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0,
    'lime': 0x00FF00, 'limegreen': 0x32CD32, 'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000,
    'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3, 'mediumpurple': 0x9370DB,
    'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A,
    'mediumturquoise': 0x48D1CC, 'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA,
    'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD, 'navy': 0x000080, 'oldlace': 0xFDF5E6,
    'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
    'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093,
    'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9, 'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD,
    'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000,
    'rosybrown': 0xBC8F8F, 'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072,
    'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE, 'sienna': 0xA0522D, 'silver': 0xC0C0C0,
    'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
    'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8,
    'tomato': 0xFF6347, 'turquoise': 0x40E0D0, 'transparent': 0x000000, 'violet': 0xEE82EE, 'wheat': 0xF5DEB3,
    'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32
};

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];
const v0 = [ 0, 0, 0 ];
const v1 = [ 0, 0, 0 ];
const vc = [ 0, 0, 0 ];
class Maths {
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    static degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees;
    }
    static clamp(number, min, max) {
        number = Number(number);
        if (number < min) number = min;
        if (number > max) number = max;
        return number;
    }
    static damp(x, y, lambda, dt) {
        return Maths.lerp(x, y, 1 - Math.exp(- lambda * dt));
    }
    static lerp(x, y, t) {
        return (1 - t) * x + t * y;
    }
    static roundTo(number, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        return Math.round(number * shift) / shift;
    }
    static fuzzyFloat(a, b, tolerance = 0.001) {
        return ((a < (b + tolerance)) && (a > (b - tolerance)));
    }
    static fuzzyVector(a, b, tolerance = 0.001) {
        if (Maths.fuzzyFloat(a.x, b.x, tolerance) === false) return false;
        if (Maths.fuzzyFloat(a.y, b.y, tolerance) === false) return false;
        if (Maths.fuzzyFloat(a.z, b.z, tolerance) === false) return false;
        return true;
    }
    static fuzzyQuaternion(a, b, tolerance = 0.001) {
        if (Maths.fuzzyVector(a, b, tolerance) === false) return false;
        if (Maths.fuzzyFloat(a.w, b.w, tolerance) === false) return false;
        return true;
    }
    static isPowerOfTwo(value) {
        return (value & (value - 1)) === 0 && value !== 0;
    }
    static addCommas(number) {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    static countDecimals(number) {
        if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
        return number.toString().split('.')[1].length || 0;
    }
    static isNumber(number) {
        return (number != null && typeof number === 'number' && !Number.isNaN(number) && Number.isFinite(number));
    }
    static noZero(number, min = 0.00001) {
        min = Math.abs(min);
        number = Maths.sanity(number);
        if (number >= 0 && number < min) number = min;
        if (number < 0 && number > min * -1.0) number = min * -1.0;
        return number;
    }
    static sanity(number) {
        if (isNaN(number)) number = 0;
        return number;
    }
    static lineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
        let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (Maths.fuzzyFloat(denom, 0, 0.0000001)) return false;
        let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1)) {
            return true;
        }
        return false;
    }
    static lineRectCollision(x1, y1, x2, y2, left, top, right, down) {
        const rectLeft =    Maths.lineCollision(x1, y1, x2, y2, left, top, left, down);
        const rectRight =   Maths.lineCollision(x1, y1, x2, y2, right, top, right, down);
        const rectTop =     Maths.lineCollision(x1, y1, x2, y2, left, top, right, top);
        const rectDown =    Maths.lineCollision(x1, y1, x2, y2, left, down, right, down);
        return (rectLeft || rectRight || rectTop || rectDown);
    }
    static triangleArea(a, b, c) {
        Vec3Func.subtract(v0, c, b);
        Vec3Func.subtract(v1, a, b);
        Vec3Func.cross(vc, v0, v1);
        return (Vec3Func.length(vc) * 0.5);
    }
    static randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }
    static randomInt(min = 0, max = 1) {
        return min + Math.floor(Math.random() * (max - min));
    }
    static uuid() {
        if (window.crypto && window.crypto.randomUUID) return crypto.randomUUID();
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
            _lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
            _lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
            _lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];
        return uuid.toLowerCase();
    }
}

class Palette {
    constructor() {
        this.isPalette = true;
        this.type = 'Palette';
        this.name = 'New Palette';
        this.uuid = Maths.uuid();
        this.colors = [];
    }
    default16() {
        this.colors = [
            0x000000,
            0x808080,
            0xc0c0c0,
            0xffffff,
            0x00ffff,
            0x0000ff,
            0x000080,
            0x800080,
            0xff00ff,
            0xff0000,
            0x800000,
            0x808000,
            0xffff00,
            0x00ff00,
            0x008000,
            0x008080,
        ];
        return this;
    }
    purpleGold() {
        this.colors = [
            0x000000,
            0xffffff,
            0xd400ff,
            0xffc800,
        ];
        return this;
    }
    fromJSON(json) {
        const data = json.object;
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        if (data.colors !== undefined) this.colors = JSON.parse(data.colors);
        return this;
    }
    toJSON() {
        const json = {
            object: {
                type: this.type,
                name: this.name,
                uuid: this.uuid,
            }
        };
        json.object.colors = JSON.stringify(this.colors);
        return json;
    }
}

const _assets = {};
const _types = {
    'Palette':  Palette,
};
let AssetManager$1 = class AssetManager {
    static checkType(asset) {
        if (!asset) return undefined;
        if (asset.isBufferGeometry) return 'geometry';
        if (asset.type === 'Shape') return 'shape';
        if (asset.isMaterial) return 'material';
        if (asset.isPalette) return 'palette';
        if (asset.isScript) return 'script';
        if (asset.isTexture) return 'texture';
        if (asset.isEntity) return 'prefab';
        return 'asset';
    }
    static get(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }
    static library(type, category) {
        const library = [];
        for (const [ uuid, asset ] of Object.entries(_assets)) {
            if (type && AssetManager.checkType(asset) !== type) continue;
            if (category == undefined || (asset.category && asset.category === category)) {
                library.push(asset);
            }
        }
        return library;
    }
    static add(asset ) {
        const assets = Array.isArray(asset) ? asset : [ ...arguments ];
        let returnAsset = undefined;
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i];
            if (!asset || !asset.uuid) continue;
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;
            _assets[asset.uuid] = asset;
            if (returnAsset === undefined) returnAsset = asset;
        }
        return returnAsset;
    }
    static clear() {
        for (const uuid in _assets) {
            const asset = _assets[uuid];
            if (asset.isBuiltIn) continue;
            AssetManager.remove(_assets[uuid], true);
        }
    }
    static remove(asset, dispose = true) {
        const assets = Array.isArray(asset) ? asset : [ asset ];
        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;
            if (_assets[asset.uuid]) {
                if (dispose && typeof asset.dispose === 'function') asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }
    static fromJSON(json, onLoad = () => {}) {
        AssetManager.clear();
        for (const type of Object.keys(_types)) {
            if (!json[type]) continue;
            for (const assetData of json[type]) {
                const Constructor = _types[type];
                const asset = new Constructor();
                asset.fromJSON(assetData);
                AssetManager.add(asset);
            }
        }
        if (typeof onLoad === 'function') {
            onLoad();
        }
    }
    static toJSON(meta) {
        const json = {};
        if (!meta) meta = {};
        for (const type of Object.keys(_types)) {
            const assets = AssetManager.library(type);
            if (assets.length === 0) continue;
            meta[type] = {};
            for (const asset of assets) {
                if (!asset.uuid || meta[type][asset.uuid]) continue;
                meta[type][asset.uuid] = asset.toJSON();
            }
        }
        for (const library in meta) {
            const valueArray = [];
            for (const key in meta[library]) {
                const data = meta[library][key];
                delete data.metadata;
                valueArray.push(data);
            }
            json[library] = valueArray;
        }
        return json;
    }
};

const _timer = (performance == null || typeof performance === 'undefined') ? Date : performance;
class Clock {
    #running = false;
    #startTime = 0;
    #elapsedTime = 0;
    #lastChecked = 0;
    #deltaCount = 0;
    #frameTime = 0;
    #frameCount = 0;
    #lastFrameCount = 0;
    constructor(autoStart = true, msRewind = 0) {
        if (autoStart) this.start();
        this.#startTime -= msRewind;
        this.#lastChecked -= msRewind;
    }
    start(reset = false) {
        if (reset) this.reset();
        this.#startTime = _timer.now();
        this.#lastChecked = this.#startTime;
        this.#running = true;
    }
    stop() {
        this.getDeltaTime();
        this.#running = false;
    }
    toggle() {
        if (this.#running) this.stop();
        else this.start();
    }
    reset() {
        this.#startTime = _timer.now();
        this.#lastChecked = this.#startTime;
        this.#elapsedTime = 0;
        this.#deltaCount = 0;
    }
    getElapsedTime() {
        return this.#elapsedTime;
    }
    getDeltaTime() {
        if (!this.#running) {
            this.#lastFrameCount = 0;
            return 0;
        }
        const newTime = _timer.now();
        const dt = (newTime - this.#lastChecked) / 1000;
        this.#lastChecked = newTime;
        this.#elapsedTime += dt;
        this.#deltaCount++;
        this.#frameTime += dt;
        this.#frameCount++;
        if (this.#frameTime > 1) {
            this.#lastFrameCount = this.#frameCount;
            this.#frameTime = 0;
            this.#frameCount = 0;
        }
        return dt;
    }
    isRunning() {
        return this.#running;
    }
    isStopped() {
        return !(this.#running);
    }
    count() {
        return this.#deltaCount;
    }
    averageDelta() {
        const frameRate = 1 / this.#lastFrameCount;
        return Math.min(1, frameRate);
    }
    fps() {
        return this.#lastFrameCount;
    }
}

class EntityUtils {
    static clearObject(object, removeFromParent = true) {
    }
    static combineEntityArrays(intoEntityArray, entityArrayToAdd) {
        for (const entity of entityArrayToAdd) {
            if (EntityUtils.containsEntity(intoEntityArray, entity) === false) {
                intoEntityArray.push(entity);
            }
        }
    }
    static commonEntity(entityArrayOne, entityArrayTwo) {
        entityArrayOne = Array.isArray(entityArrayOne) ? entityArrayOne : [ entityArrayOne ];
        entityArrayTwo = Array.isArray(entityArrayTwo) ? entityArrayTwo : [ entityArrayTwo ];
        for (let i = 0; i < entityArrayOne.length; i++) {
            if (EntityUtils.containsEntity(entityArrayTwo, entityArrayOne[i]) === true) return true;
        }
        for (let i = 0; i < entityArrayTwo.length; i++) {
            if (EntityUtils.containsEntity(entityArrayOne, entityArrayTwo[i]) === true) return true;
        }
        return false;
    }
    static compareArrayOfEntities(entityArrayOne, entityArrayTwo) {
        entityArrayOne = Array.isArray(entityArrayOne) ? entityArrayOne : [ entityArrayOne ];
        entityArrayTwo = Array.isArray(entityArrayTwo) ? entityArrayTwo : [ entityArrayTwo ];
        for (let i = 0; i < entityArrayOne.length; i++) {
            if (EntityUtils.containsEntity(entityArrayTwo, entityArrayOne[i]) === false) return false;
        }
        for (let i = 0; i < entityArrayTwo.length; i++) {
            if (EntityUtils.containsEntity(entityArrayOne, entityArrayTwo[i]) === false) return false;
        }
        return true;
    }
    static containsEntity(arrayOfEntities, entity) {
        if (!Array.isArray(arrayOfEntities)) return false;
        if (!entity || !entity.isEntity) return false;
        for (const checkEntity of arrayOfEntities) {
            if (checkEntity.isEntity && checkEntity.uuid === entity.uuid) return true;
        }
        return false;
    }
    static copyTransform(source, target) {
        target.position.copy(source.position);
        target.rotation.order = source.rotation.order;
        target.quaternion.copy(source.quaternion);
        target.scale.copy(source.scale);
        target.matrix.copy(source.matrix);
        target.matrixWorld.copy(source.matrixWorld);
    }
    static parentEntity(entity, immediateOnly = false) {
        while (entity && entity.parent) {
            if (entity.parent.isStage) return entity;
            if (entity.parent.isWorld) return entity;
            entity = entity.parent;
            if (immediateOnly) {
                let validEntity = entity.isEntity;
                validEntity = validEntity || entity.userData.flagIgnore;
                validEntity = validEntity || entity.userData.flagHelper;
                if (validEntity) return entity;
            }
        }
        return entity;
    }
    static removeEntityFromArray(entityArray, entity) {
        if (!entity || !entity.isEntity || !Array.isArray(entityArray)) return;
        for (let i = entityArray.length - 1; i >= 0; --i) {
            if (entityArray[i].uuid === entity.uuid) entityArray.splice(i, 1);
        }
        return entityArray;
    }
    static uuidArray(objects) {
        objects = Array.isArray(objects) ? objects : [...arguments];
        const uuids = [];
        for (const object of objects) {
            if (typeof object === 'object' && object.uuid) uuids.push(object.uuid);
        }
        return uuids;
    }
}

class System {
    static isIterable(obj) {
        return (obj && typeof obj[Symbol.iterator] === 'function');
    }
    static isObject(variable) {
        return (variable && typeof variable === 'object' && !Array.isArray(variable));
    }
    static swapArrayItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }
    static save(url, filename) {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'data.json';
            link.click();
            setTimeout(function() {
                window.URL.revokeObjectURL(url);
            }, 0);
        } catch (error) {
            console.warn(error);
            return;
        }
    }
    static saveBuffer(buffer, filename, optionalType = { type: 'application/octet-stream' }) {
        const url = URL.createObjectURL(new Blob([ buffer ], { type: optionalType }));
        System.save(url, filename);
    }
    static saveImage(imageUrl, filename) {
        System.save(imageUrl, filename);
    }
    static saveString(text, filename) {
        const url = URL.createObjectURL(new Blob([ text ], { type: 'text/plain' }));
        System.save(url, filename);
    }
    static detectOS() {
        const systems = {
            Android:    [ 'android' ],
            iOS:        [ 'iphone', 'ipad', 'ipod', 'ios' ],
            Linux:      [ 'linux', 'x11', 'wayland' ],
            MacOS:      [ 'mac', 'darwin', 'osx', 'os x' ],
            Windows:    [ 'win' ],
        };
        const userAgent = window.navigator.userAgent;
        const userAgentData = window.navigator.userAgentData;
        const platform = ((userAgentData) ? userAgentData.platform : userAgent).toLowerCase();
        for (const key in systems) {
            for (const os of systems[key]) {
                if (platform.indexOf(os) !== -1) return key;
            }
        }
        return 'Unknown OS';
    }
    static fullscreen(element) {
        const isFullscreen =
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
        if (isFullscreen) {
            const el = document;
            const cancelMethod = el.cancelFullScreen || el.exitFullscreen || el.webkitCancelFullScreen || el.webkitExitFullscreen || el.mozCancelFullScreen;
            cancelMethod.call(el);
        } else {
            const el = element ?? document.body;
            const requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
            requestMethod.call(el);
        }
    }
    static metaKeyOS() {
        const system = System.detectOS();
        if (system === 'Mac') {
            return '⌘';
        } else {
            return '⌃';
        }
    }
    static sleep(ms) {
        const beginTime = Date.now();
        let endTime = beginTime;
        while (endTime - beginTime < ms) {
            endTime = Date.now();
        }
    }
    static waitForObject(
        operationName = '',
        getter,
        callback,
        checkFrequencyMs = 100,
        timeoutMs = -1,
        alertMs = 5000,
    ) {
        let startTimeMs = Date.now();
        let alertTimeMs = Date.now();
        function loopSearch() {
            if (timeoutMs > 0 && (Date.now() - startTimeMs > timeoutMs)) {
                console.info(`Operation: ${operationName} timed out`);
                return;
            }
            if ((alertMs > 0) && Date.now() - alertTimeMs > alertMs) {
                console.info(`Still waiting on operation: ${operationName}`);
                alertTimeMs = Date.now();
            }
            if (!getter || typeof getter !== 'function' || getter()) {
                if (callback && typeof callback === 'function') callback();
                return;
            } else {
                setTimeout(loopSearch, checkFrequencyMs);
            }
        }
        loopSearch();
    }
}

const _registered = {};
class ComponentManager {
    static defaultValue(type) {
        switch (type) {
            case 'select':      return null;
            case 'number':      return 0;
            case 'int':         return 0;
            case 'angle':       return 0;
            case 'slider':      return 0;
            case 'variable':    return [ 0, 0 ];
            case 'vector':      return [ 0 ];
            case 'option':      return [ false ];
            case 'boolean':     return false;
            case 'color':       return 0xffffff;
            case 'string':      return '';
            case 'key':         return '';
            case 'asset':       return null;
            case 'object':      return {};
            case 'divider':     return null;
            default:            console.warn(`ComponentManager.defaultValue(): Unknown property type '${type}'`);
        }
        return null;
    }
    static registered(type = '') {
        const ComponentClass = _registered[type];
        if (!ComponentClass) console.warn(`ComponentManager.registered(): Component '${type}' not registered'`);
        return ComponentClass;
    }
    static registeredTypes() {
        return Object.keys(_registered);
    }
    static register(type = '', ComponentClass) {
        type = type.toLowerCase();
        if (_registered[type]) return console.warn(`ComponentManager.register(): Component '${type}' already registered`);
        if (!System.isObject(ComponentClass.config)) ComponentClass.config = {};
        if (!System.isObject(ComponentClass.config.schema)) ComponentClass.config.schema = {};
        const schema = ComponentClass.config.schema;
        for (const key in schema) {
            const properties = Array.isArray(schema[key]) ? schema[key] : [ schema[key] ];
            for (const property of properties) {
                if (property.type === undefined) {
                    console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                } else if (property.type === 'divider') {
                    continue;
                }
                if (property.default === undefined) property.default = ComponentManager.defaultValue(property.type);
                if (property.proMode !== undefined) property.promode = property.proMode;
            }
        }
        class Component extends ComponentClass {
            constructor() {
                super();
                this.isComponent = true;
                this.type = type;
                this.attached = true;
                this.expanded = true;
                this.order = 0;
                this.tag = '';
                this.entity = null;
                this.backend = undefined;
                this.data = {};
            }
            init(data = {}) {
                this.dispose();
                if (typeof super.init === 'function') super.init(data);
            }
            dispose() {
                if (typeof super.dispose === 'function') super.dispose();
                if (typeof this.backend === 'object' && typeof this.backend.dispose === 'function') this.backend.dispose();
                this.backend = undefined;
            }
            attach() {
                this.attached = true;
                if (typeof super.attach === 'function') super.attach();
            }
            detach() {
                this.attached = false;
                if (typeof super.detach === 'function') super.detach();
            }
            defaultData() {
                const data = {};
                for (let i = 0, l = arguments.length; i < l; i += 2) {
                    data[arguments[i]] = arguments[i + 1];
                }
                ComponentManager.sanitizeData(this.type, data);
                data.base = {
                    isComponent:    true,
                    attached:       this.attached,
                    expanded:       this.expanded,
                    order:          this.order,
                    tag:            this.tag,
                    type:           this.type,
                };
                return data;
            }
            toJSON() {
                let data;
                if (this.data && this.data.style) {
                    data = this.defaultData('style', this.data.style);
                } else {
                    data = this.defaultData();
                }
                for (const key in data) {
                    if (this.data[key] !== undefined) {
                        if (this.data[key] && this.data[key].isTexture) {
                            data[key] = this.data[key].uuid;
                        } else {
                            data[key] = structuredClone(this.data[key]);
                        }
                    }
                }
                return data;
            }
        }
        _registered[type] = Component;
    }
    static includeData(item, data1, data2 = undefined) {
        for (const key in item.if) {
            const conditions = Array.isArray(item.if[key]) ? item.if[key] : [ item.if[key] ];
            let check1 = false, check2 = false;
            for (const condition of conditions) {
                check1 = check1 || (data1[key] === condition);
                check2 = check2 || (data2 === undefined) ? true : (data2[key] === condition);
            }
            if (!check1 || !check2) return false;
        }
        for (const key in item.not) {
            const conditions = Array.isArray(item.not[key]) ? item.not[key] : [ item.not[key] ];
            let check1 = false, check2 = false;
            for (const condition of conditions) {
                check1 = check1 || (data1[key] === condition);
                check2 = check2 || (data2 === undefined) ? false : (data2[key] === condition);
            }
            if (check1 || check2) return false;
        }
        return true;
    }
    static sanitizeData(type, data) {
        if (!data || typeof data !== 'object') data = {};
        const ComponentClass = ComponentManager.registered(type);
        if (!ComponentClass || !ComponentClass.config || !ComponentClass.config.schema) return;
        const schema = ComponentClass.config.schema;
        if (!System.isObject(schema)) return;
        for (const schemaKey in schema) {
            const itemArray = Array.isArray(schema[schemaKey]) ? schema[schemaKey] : [ schema[schemaKey] ];
            let itemToInclude = undefined;
            for (const item of itemArray) {
                if (item.type === 'divider') continue;
                if (!ComponentManager.includeData(item, data)) continue;
                itemToInclude = item;
                break;
            }
            if (itemToInclude !== undefined) {
                if (data[schemaKey] === undefined) {
                    if (Array.isArray(itemToInclude.default)) {
                        data[schemaKey] = [...itemToInclude.default];
                    } else if (typeof itemToInclude.default === 'object') {
                        data[schemaKey] = structuredClone(itemToInclude.default);
                    } else {
                        data[schemaKey] = itemToInclude.default;
                    }
                }
                if (Maths.isNumber(data[schemaKey])) {
                    const min = itemToInclude['min'] ?? -Infinity;
                    const max = itemToInclude['max'] ??  Infinity;
                    if (data[schemaKey] < min) data[schemaKey] = min;
                    if (data[schemaKey] > max) data[schemaKey] = max;
                }
            } else {
                delete data[schemaKey];
            }
        }
    }
    static stripData(type, oldData, newData) {
        const ComponentClass = ComponentManager.registered(type);
        if (!ComponentClass || !ComponentClass.config || !ComponentClass.config.schema) return;
        const schema = ComponentClass.config.schema;
        if (!System.isObject(schema)) return;
        for (const schemaKey in schema) {
            let matchedConditions = false;
            const itemArray = Array.isArray(schema[schemaKey]) ? schema[schemaKey] : [ schema[schemaKey] ];
            for (const item of itemArray) {
                if (item.type === 'divider') continue;
                if (!ComponentManager.includeData(item, oldData, newData)) continue;
                matchedConditions = true;
                break;
            }
            if (matchedConditions !== true) {
                delete newData[schemaKey];
            }
        }
    }
}

class Entity3D {
    constructor(name = 'Entity') {
        this.name = name;
        this.castShadow = true;
        this.receiveShadow = true;
        this.isEntity = true;
        this.isEntity3D = true;
        this.type = 'Entity3D';
        this.locked = false;
        this.lookAtCamera = false;
        this.lookAtYOnly = false;
        this.bloom = false;
        this.category = null;
        this.components = [];
    }
    componentFamily() {
        return 'Entity3D';
    }
    addComponent(type, data = {}, includeDependencies = true) {
        const ComponentClass = ComponentManager.registered(type);
        if (ComponentClass === undefined) return undefined;
        const config = ComponentClass.config;
        let component = this.getComponent(type);
        if (!component || ComponentClass.config.multiple) {
            component = new ComponentClass();
            this.components.push(component);
        }
        if (config.dependencies && includeDependencies) {
            for (const dependency of config.dependencies) {
                if (this.getComponent(dependency) == undefined) {
                    this.addComponent(dependency, {}, false );
                }
            }
        }
        ComponentManager.sanitizeData(type, data);
        component.detach();
        component.entity = this;
        component.init(data);
        component.attach();
        return component;
    }
    attachComponent(component) {
        this.components.push(component);
        component.detach();
        component.entity = this;
        component.init(component.toJSON());
        component.attach();
        return component;
    }
    updateComponent(type, data = {}, index = 0) {
        const component = this.getComponentsWithProperties('type', type)[index];
        if (!component || !component.isComponent) return;
        const newData = component.data ?? {};
        Object.assign(newData, data);
        ComponentManager.sanitizeData(type, newData);
        this.detach();
        this.init(newData);
        this.attach();
        return component;
    }
    replaceComponent(type, data = {}, index = 0) {
        const component = this.getComponentsWithProperties('type', type)[index];
        if (!component || !component.isComponent) return;
        ComponentManager.sanitizeData(type, data);
        component.detach();
        component.init(data);
        component.attach();
        return component;
    }
    getComponent(type, tag ) {
        if (tag === undefined) return this.getComponentByProperty('type', type);
        const components = this.getComponentsWithProperties('type', type, 'tag', tag);
        if (components.length > 0) return components[0];
        return undefined;
    }
    getComponentByTag(tag) {
        return this.getComponentByProperty('tag', tag);
    }
    getComponentByType(type) {
        return this.getComponentByProperty('type', type);
    }
    getComponentsByType(type) {
        return this.getComponentsWithProperties('type', type);
    }
    getComponentByProperty(property, value) {
        for (const component of this.components) {
            if (component[property] === value) return component;
        }
        return undefined;
    }
    getComponentsWithProperties() {
        const components = [];
        for (const component of this.components) {
            let hasProperties = true;
            for (let i = 0; i < arguments.length; i += 2) {
                const key = arguments[i];
                const value = arguments[i + 1];
                if (component[key] !== value) {
                    hasProperties = false;
                    break;
                }
            }
            if (hasProperties) components.push(component);
        }
        return components;
    }
    removeComponent(component) {
        if (!component) return;
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.detach();
            return component;
        }
        console.warn(`Entity3D.removeComponent(): Component ${component.uuid}, type '${component.type}' not found`);
    }
    rebuildComponents() {
        for (const component of this.components) {
            component.detach();
            component.init(component.toJSON());
            component.attach();
        }
        return this;
    }
    traverseComponents(callback) {
        for (const component of this.components) {
            if (typeof callback === 'function' && callback(component)) return;
        }
    }
    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (!entity || !entity.isEntity3D) return this;
        if (this.children.indexOf(entity) !== -1) return this;
        if (maintainWorldTransform && entity.parent) {
            this.attach(entity);
        } else {
            this.add(entity);
        }
        if (index !== -1) {
            this.children.splice(index, 0, entity);
            this.children.pop();
        }
        return this;
    }
    getEntities() {
        const entities = [];
        for (const entity of this.children) {
            if (!entity || !entity.isEntity3D) continue;
            if (entity.userData.flagIgnore) continue;
            if (entity.userData.flagHelper) continue;
            entities.push(entity);
        }
        return entities;
    }
    getEntityById(id) {
        return this.getEntityByProperty('id', parseInt(id));
    }
    getEntityByName(name) {
        return this.getEntityByProperty('name', name);
    }
    getEntityByUUID(uuid) {
        return this.getEntityByProperty('uuid', uuid);
    }
    getEntityByProperty(property, value) {
        if (this[property] === value) return this;
        for (const child of this.getEntities()) {
            const entity = child.getEntityByProperty(property, value);
            if (entity) return entity;
        }
        return undefined;
    }
    removeEntity(entity, forceDelete = false) {
        if (!entity) return;
        if (!forceDelete) {
            if (entity.locked) return;
            if (entity.userData.flagHelper) return;
        }
        this.remove(entity);
        return entity;
    }
    traverse(callback, recursive = true) {
		if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.children) {
            child.traverse(callback, recursive);
        }
	}
    traverseEntities(callback, recursive = true) {
        if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.getEntities()) {
            child.traverseEntities(callback, recursive);
        }
    }
    changeParent(newParent = undefined, newIndex = -1) {
        if (!newParent) newParent = this.parent;
        if (!newParent || !newParent.isObject3D) return;
        const oldParent = this.parent;
        if (newIndex === -1 && oldParent) newIndex = oldParent.children.indexOf(this);
        newParent.safeAttach(this);
        if (newIndex !== -1) {
            newParent.children.splice(newIndex, 0, this);
            newParent.children.pop();
        }
        return this;
    }
    parentStage() {
        if (this.isStage || this.isWorld) return this;
        if (this.parent && this.parent.isEntity3D) return this.parent.parentStage();
        return null;
    }
    parentWorld() {
        if (this.isWorld) return this;
        if (this.parent && this.parent.isEntity3D) return this.parent.parentWorld();
        return null;
    }
    updateMatrix() {
        const onRotationChange = this.rotation._onChangeCallback;
        const onQuaternionChange = this.rotation._onChangeCallback;
        this.rotation._onChange(() => {});
        this.quaternion._onChange(() => {});
        const camera = window.activeCamera;
        let lookAtCamera = Boolean(this.lookAtCamera && camera);
        if (lookAtCamera && this.parent && this.parent.isObject3D) {
            this.traverseAncestors((parent) => {
                if (parent.lookAtCamera) lookAtCamera = false;
            });
        }
        if (!lookAtCamera) {
            this.quaternion.setFromEuler(this.rotation, false);
        } else {
            if (this.parent && this.parent.isObject3D) {
                this.parent.getWorldQuaternion(_parentQuaternion, false );
                _parentQuaternionInv.copy(_parentQuaternion).invert();
                this.quaternion.copy(_parentQuaternionInv);
            } else {
                this.quaternion.identity();
            }
            _rotationQuaternion.setFromEuler(this.rotation, false);
            this.matrixWorld.decompose(_worldPosition, _worldQuaternion, _worldScale);
            camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);
            if (!this.lookAtYOnly) {
                    _lookQuaternion.copy(_camQuaternion);
            } else {
                _camRotation.set(0, Math.atan2((_camPosition.x - _worldPosition.x), (_camPosition.z - _worldPosition.z)), 0);
                _lookQuaternion.setFromEuler(_camRotation, false);
            }
            this.quaternion.copy(_lookQuaternion);
            this.quaternion.multiply(_rotationQuaternion);
        }
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
        this.rotation._onChange(onRotationChange);
        this.quaternion._onChange(onQuaternionChange);
    }
    getWorldQuaternion(targetQuaternion, ignoreBillboard = true) {
        let beforeBillboard = this.lookAtCamera;
        if (ignoreBillboard && beforeBillboard) {
            this.lookAtCamera = false;
        }
        this.updateWorldMatrix(true, false);
        this.matrixWorld.decompose(_objPosition, targetQuaternion, _objScale);
        if (ignoreBillboard && beforeBillboard) {
            this.lookAtCamera = true;
            this.updateWorldMatrix(true, false);
        }
        return targetQuaternion;
    }
    safeAttach(object) {
        if (!object || !object.isObject3D) return;
        object.getWorldQuaternion(_worldQuaternion);
        object.getWorldScale(_worldScale);
        object.getWorldPosition(_worldPosition);
        object.removeFromParent();
        object.rotation.copy(_worldRotation.setFromQuaternion(_worldQuaternion, undefined, false));
        object.scale.copy(_worldScale);
        object.position.copy(_worldPosition);
        this.attach(object);
        return this;
    }
    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = true) {
        super.copy(source, false );
        this.position.copy(source.position);
        this.rotation.copy(source.rotation);
        this.scale.copy(source.scale);
        if (source.locked) this.locked = true;
        if (source.lookAtCamera) this.lookAtCamera = true;
        if (source.lookAtYOnly) this.lookAtYOnly = true;
        this.updateMatrix();
        if (recursive) {
            for (const child of source.children) {
                if (child.userData.flagIgnore) continue;
                if (child.userData.flagHelper) continue;
                this.add(child.clone());
            }
        }
        return this;
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        this.dispose();
        this.copy(source, false );
        this.locked = source.locked;
        this.lookAtCamera = source.lookAtCamera;
        this.lookAtYOnly = source.lookAtYOnly;
        this.bloom = source.bloom;
        this.category = source.category;
        for (const component of source.components) {
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
            clonedComponent.tag = component.tag;
        }
        if (recursive) {
            for (const child of source.getEntities()) {
                this.add(child.cloneEntity());
            }
        }
        return this;
    }
    dispose() {
        while (this.components.length > 0) {
            const component = this.components[0];
            this.removeComponent(component);
            if (typeof component.dispose === 'function') component.dispose();
        }
        while (this.children.length > 0) {
            EntityUtils.clearObject(this.children[0], true );
        }
        this.dispatchEvent({ type: 'destroy' });
    }
    fromJSON(json) {
        const data = json.object;
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);
        if (data.castShadow !== undefined) this.castShadow = data.castShadow;
        if (data.receiveShadow !== undefined) this.receiveShadow = data.receiveShadow;
        if (data.visible !== undefined) this.visible = data.visible;
        if (data.frustumCulled !== undefined) this.frustumCulled = data.frustumCulled;
        if (data.renderOrder !== undefined) this.renderOrder = data.renderOrder;
        if (data.layers !== undefined) this.layers.mask = data.layers;
        if (data.up !== undefined) this.up.fromArray(data.up);
        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;
        if (typeof data.userData === 'object') this.userData = structuredClone(data.userData);
        if (data.locked !== undefined) this.locked = data.locked;
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.lookAtYOnly !== undefined) this.lookAtYOnly = data.lookAtYOnly;
        if (data.bloom !== undefined) this.bloom = data.bloom;
        if (data.category !== undefined) this.category = data.category;
        for (const componentData of json.object.components) {
            if (componentData && componentData.base && componentData.base.type) {
                const component = this.addComponent(componentData.base.type, componentData, false);
                component.tag = componentData.base.tag;
            }
        }
        this.loadChildren(data.entities);
        this.updateMatrix();
        return this;
    }
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new (eval(entityData.object.type))();
            this.add(entity.fromJSON(entityData));
        }
    }
    toJSON() {
        const json = {
            object: {
                type: this.type,
                name: this.name,
                uuid: this.uuid,
                components: [],
                entities: [],
            }
        };
        json.object.position  = this.position.toArray();
        json.object.rotation = this.rotation.toArray();
        json.object.scale = this.scale.toArray();
        json.object.castShadow = this.castShadow;
        json.object.receiveShadow = this.receiveShadow;
        json.object.visible = this.visible;
        json.object.frustumCulled = this.frustumCulled;
        json.object.renderOrder = this.renderOrder;
        json.object.layers = this.layers.mask;
        json.object.up = this.up.toArray();
        json.object.matrixAutoUpdate = this.matrixAutoUpdate;
        if (Object.keys(this.userData).length > 0) {
            json.object.userData = structuredClone(this.userData);
        }
        json.object.locked = this.locked;
        json.object.lookAtCamera = this.lookAtCamera;
        json.object.lookAtYOnly = this.lookAtYOnly;
        json.object.bloom = this.bloom;
        json.object.category = this.category;
        for (const component of this.components) {
            json.object.components.push(component.toJSON());
        }
        for (const child of this.getEntities()) {
            json.object.entities.push(child.toJSON());
        }
        return json;
    }
}

class Camera3D extends Entity3D {
    constructor({
        name,
        type = 'PerspectiveCamera',
        width = APP_SIZE,
        height = APP_SIZE,
        fit,
        near,
        far,
        fieldOfView,
    } = {}) {
        super(name ?? 'Camera');
        if (type !== 'OrthographicCamera' && type !== 'PerspectiveCamera') {
            type = 'PerspectiveCamera';
        }
        this.isCamera = true;
        this.isCamera3D = true;
        this.type = type;
        if (fit !== 'width' && fit !== 'height') fit = 'none';
        this.fit = fit;
        this.near = near ?? ((type === 'PerspectiveCamera') ? 0.01 : - 1000);
        this.far = far ?? ((type === 'OrthographicCamera') ? 1000 : 1000);
        this.fieldOfView = fieldOfView ?? 58.10;
        this.isPerspectiveCamera = (type === 'PerspectiveCamera');
        this.isOrthographicCamera = (type === 'OrthographicCamera');
        this.aspect = 1;
        this.rotateLock = false;
        this.view = null;
        this.zoom = 1;
        this.fov = 58.10;
        this.setSize(width, height);
    }
    updateMatrix() {
    }
    getWorldDirection(target) {
		this.updateWorldMatrix(true, false);
		const e = this.matrixWorld.elements;
		return target.set(- e[8], - e[9], - e[10]).normalize();
	}
	updateMatrixWorld(force) {
		super.updateMatrixWorld(force);
		this.matrixWorldInverse.copy(this.matrixWorld).invert();
	}
	updateWorldMatrix(updateParents, updateChildren) {
		super.updateWorldMatrix(updateParents, updateChildren);
		this.matrixWorldInverse.copy(this.matrixWorld).invert();
	}
    changeType(type) {
        if (!type || typeof type !== 'string') return this;
        type = type.toLowerCase().replace('camera', '');
        if (type === 'orthographic') this.type = 'OrthographicCamera';
        else if (type === 'perspective') this.type = 'PerspectiveCamera';
        else return this;
        this.isPerspectiveCamera = (this.type === 'PerspectiveCamera');
        this.isOrthographicCamera = (this.type === 'OrthographicCamera');
        if (this.isPerspectiveCamera) this.near = (10 / this.far);
        if (this.isOrthographicCamera) this.near = (this.far * -1);
        this.updateProjectionMatrix();
        return this;
    }
    changeFit(fit) {
        if (fit === 'landscape') fit = 'width';
        if (fit === 'portrait') fit = 'height';
        if (fit !== 'width' && fit !== 'height') fit = 'none';
        this.fit = fit;
        return this;
    }
    setSize(width = APP_SIZE, height = APP_SIZE) {
        this.lastWidth = width;
        this.lastHeight = height;
        this.aspect = width / height;
         {
            if (this.fit === 'height') {
                this.fov = this.fieldOfView;
            } else {
                const tanFOV = Math.tan(((Math.PI / 180) * this.fieldOfView) / 2);
                if (this.fit === 'width') {
                    this.fov = (360 / Math.PI) * Math.atan(tanFOV / this.aspect);
                } else {
                    this.fov = (360 / Math.PI) * Math.atan(tanFOV * (height / APP_SIZE));
                }
            }
        }
         {
            if (this.fit === 'width') {
                width = APP_SIZE;
                height = width / this.aspect;
            } else if (this.fit === 'height') {
                height = APP_SIZE;
                width = height * this.aspect;
            }
            this.left =    - width / 2;
            this.right =     width / 2;
            this.top =       height / 2;
            this.bottom =  - height / 2;
        }
        this.updateProjectionMatrix();
        return this;
    }
    updateProjectionMatrix(target ) {
        if (target) {
            if (target.isObject3D) target = target.position;
            this.target.copy(target);
        }
        const distance = this.position.distanceTo(this.target);
        const zoom = Maths.noZero(1000 / distance);
        this.zoom = zoom;
        if (this.isPerspectiveCamera) {
            let top = this.near * Math.tan((Math.PI / 180) * 0.5 * this.fov);
            let height = 2 * top;
            let width = this.aspect * height;
            let left = - 0.5 * width;
            const view = this.view;
            if (view && view.enabled) {
                const fullWidth = view.fullWidth;
                const fullHeight = view.fullHeight;
                left += view.offsetX * width / fullWidth;
                top -= view.offsetY * height / fullHeight;
                width *= view.width / fullWidth;
                height *= view.height / fullHeight;
            }
            this.projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far, this.coordinateSystem);
            this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
        }
        if (this.isOrthographicCamera) {
            const dx = (this.right - this.left) / (2 * zoom);
            const dy = (this.top - this.bottom) / (2 * zoom);
            const cx = (this.right + this.left) / 2;
            const cy = (this.top + this.bottom) / 2;
            let left = cx - dx;
            let right = cx + dx;
            let top = cy + dy;
            let bottom = cy - dy;
            const view = this.view;
            if (view && view.enabled) {
                const scaleW = (this.right - this.left) / view.fullWidth / zoom;
                const scaleH = (this.top - this.bottom) / view.fullHeight / zoom;
                left += scaleW * view.offsetX;
                right = left + scaleW * view.width;
                top -= scaleH * view.offsetY;
                bottom = top - scaleH * view.height;
            }
            this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far, this.coordinateSystem);
            this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
        }
    }
    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
        if (!this.view) this.view = {};
        this.view.enabled = true;
        this.view.fullWidth = fullWidth;
        this.view.fullHeight = fullHeight;
        this.view.offsetX = x;
        this.view.offsetY = y;
        this.view.width = width;
        this.view.height = height;
        this.setSize(fullWidth, fullHeight);
    }
    clearViewOffset() {
        if (this.view && this.view.enabled) {
            this.view.enabled = false;
            this.setSize(this.view.fullWidth, this.view.fullHeight);
        }
    }
    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.changeType(source.type);
        this.matrixWorldInverse.copy(source.matrixWorldInverse);
		this.projectionMatrix.copy(source.projectionMatrix);
		this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
		this.coordinateSystem = source.coordinateSystem;
        this.fit = source.fit;
        this.near = source.near;
        this.far = source.far;
        this.fieldOfView = source.fieldOfView;
        this.setSize(source.lastWidth, source.lastHeight);
        return this;
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        super.copyEntity(source, recursive);
        return this;
    }
    fromJSON(json) {
        const data = json.object;
        super.fromJSON(json, this);
        if (data.cameraType !== undefined) {
            this.type = data.cameraType;
            this.changeType(this.type);
        }
        if (data.fit !== undefined) this.fit = data.fit;
        if (data.near !== undefined) this.near = data.near;
        if (data.far !== undefined) this.far = data.far;
        if (data.fieldOfView !== undefined) this.fieldOfView = data.fieldOfView;
        this.updateProjectionMatrix();
        return this;
    }
    toJSON() {
        const json = super.toJSON();
        json.object.cameraType = this.type;
        json.object.type = 'Camera3D';
        json.object.fit = this.fit;
        json.object.near = this.near;
        json.object.far = this.far;
        json.object.fieldOfView = this.fieldOfView;
        return json;
    }
}

class Stage3D extends Entity3D {
    constructor(name = 'Start') {
        super(name);
        this.isStage = true;
        this.isStage3D = true;
        this.type = 'Stage3D';
        this.enabled = true;
        this.start = 0;
        this.finish = -1;
    }
    componentFamily() {
        return 'Stage3D';
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        super.copyEntity(source, recursive);
        this.enabled = source.enabled;
        this.start = source.start;
        this.finish = source.finish;
        this.beginPosition.copy(source.beginPosition);
        this.endPosition.copy(source.endPosition);
        return this;
    }
    dispose() {
        super.dispose();
    }
    fromJSON(json) {
        const data = json.object;
        super.fromJSON(json);
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.fromArray(data.beginPosition);
        if (data.endPosition !== undefined) this.endPosition.fromArray(data.endPosition);
        return this;
    }
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new (eval(entityData.object.type))();
            this.add(entity.fromJSON(entityData));
        }
    }
    toJSON() {
        const json = super.toJSON();
        json.object.enabled = this.enabled;
        json.object.start = this.start;
        json.object.finish = this.finish;
        json.object.beginPosition = this.beginPosition.toArray();
        json.object.endPosition = this.endPosition.toArray();
        return json;
    }
}

class World3D extends Entity3D {
    constructor(name = 'World 1') {
        super(name);
        this.isScene = true;
        this.isWorld = true;
        this.isWorld3D = true;
        this.type = 'World3D';
        this.background = null;
        this.environment = null;
        this.fog = null;
        this.backgroundBlurriness = 0;
		this.backgroundIntensity = 1;
        this.overrideMaterial = null;
        this.xPos = 0;
        this.yPos = 0;
        this.activeStageUUID = null;
        this.loadDistance = 0;
    }
    componentFamily() {
        return 'World3D';
    }
    activeStage() {
        const stage = this.getStageByUUID(this.activeStageUUID);
        return stage ?? this;
    }
    setActiveStage(stage) {
        if (stage && stage.isEntity && this.getStageByUUID(stage.uuid)) {
            this.activeStageUUID = stage.uuid;
        } else {
            this.activeStageUUID = null;
        }
        return this;
    }
    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (!entity || !entity.isEntity3D) return this;
        if (this.children.indexOf(entity) !== -1) return this;
        if (entity.isWorld) return this;
        if (entity.isStage) maintainWorldTransform = false;
        super.addEntity(entity, index, maintainWorldTransform);
        if (entity.isStage && this.getStages().length === 1) this.setActiveStage(entity);
        return this;
    }
    getEntities(includeStages = true) {
        const filteredChildren = [];
        for (const child of super.getEntities()) {
            if (!includeStages && child.isStage) continue;
            filteredChildren.push(child);
        }
        return filteredChildren;
    }
    getFirstStage() {
        const stages = this.getStages();
        if (stages.length > 0) return stages[0];
    }
    getStages() {
        const filteredChildren = [];
        for (const child of super.getEntities()) {
            if (child.isStage) filteredChildren.push(child);
        }
        return filteredChildren;
    }
    getStageByName(name) {
        const stage = this.getEntityByProperty('name', name);
        if (stage && stage.isStage) return stage;
    }
    getStageByUUID(uuid) {
        const stage = this.getEntityByProperty('uuid', uuid);
        if (stage && stage.isStage) return stage;
    }
    getStageByProperty(property, value) {
        for (const stage of this.getStages()) {
            if (stage[property] === value) return stage;
        }
    }
    traverseStages(callback, recursive = true) {
        const cancel = (typeof callback === 'function') ? callback(this) : false;
        if (cancel) return;
        for (const stage of this.getStages()) {
            stage.traverseEntities(callback, recursive);
        }
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        super.copyEntity(source, recursive);
        if (source.background) {
            if (source.background.isColor) {
                this.background = source.background.clone();
            } else {
                this.background = source.background;
            }
        }
		if (source.environment !== null) this.environment = source.environment.clone();
		if (source.fog !== null) this.fog = source.fog.clone();
		this.backgroundBlurriness = source.backgroundBlurriness;
		this.backgroundIntensity = source.backgroundIntensity;
		if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();
        this.xPos = source.xPos;
        this.yPos = source.yPos;
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;
        this.loadPosition.copy(source.loadPosition);
        this.loadDistance = source.loadDistance;
        return this;
    }
    dispose() {
        super.dispose();
        if (this.background && typeof this.background.dispose === 'function') this.background.dispose();
        if (this.environment && typeof this.environment.dispose === 'function') this.environment.dispose();
        if (this.fog && typeof this.fog.dispose === 'function') this.fog.dispose();
        if (this.overrideMaterial && typeof this.overrideMaterial.dispose === 'function') this.overrideMaterial.dispose();
    }
    fromJSON(json) {
        const data = json.object;
        super.fromJSON(json);
        if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
                this.background = new THREE.Color(data.background);
            } else {
                this.background = data.background;
            }
        }
        if (data.environment !== undefined) {
            const environmentTexture = AssetManager.get(data.background);
            if (environmentTexture && environmentTexture.isTexture) this.environment = environmentTexture;
        }
        if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
                this.fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
                this.fog = new THREE.FogExp2(data.fog.color, data.fog.density);
            }
        }
        if (data.backgroundBlurriness !== undefined) this.backgroundBlurriness = data.backgroundBlurriness;
		if (data.backgroundIntensity !== undefined) this.backgroundIntensity = data.backgroundIntensity;
        if (data.xPos !== undefined) this.xPos = data.xPos;
        if (data.yPos !== undefined) this.yPos = data.yPos;
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;
        if (data.loadPosition !== undefined) this.loadPosition.fromArray(data.loadPosition);
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;
        return this;
    }
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new (eval(entityData.object.type))();
            this.add(entity.fromJSON(entityData));
        }
    }
    toJSON() {
        const json = super.toJSON();
        if (this.background) {
            if (this.background.isColor) {
                json.object.background = this.background.toJSON();
            } else {
                json.object.background = this.background;
            }
        }
        if (this.environment) {
        }
        if (this.fog) json.object.fog = this.fog.toJSON();
        if (this.backgroundBlurriness > 0) json.object.backgroundBlurriness = this.backgroundBlurriness;
		if (this.backgroundIntensity !== 1) json.object.backgroundIntensity = this.backgroundIntensity;
        json.object.xPos = this.xPos;
        json.object.yPos = this.yPos;
        json.object.activeStageUUID = this.activeStageUUID;
        json.object.loadPosition = this.loadPosition.toArray();
        json.object.loadDistance = this.loadDistance;
        return json;
    }
}

class Project {
    constructor(name = 'My Project') {
        this.isProject = true;
        this.type = 'Project';
        this.name = name;
        this.uuid = Maths.uuid();
        this.activeWorldUUID = null;
        this.settings = {
            orientation: APP_ORIENTATION.PORTRAIT,
            preload: 10,
            unload: 10,
        };
        this.worlds = {};
    }
    setting(key) {
        if (typeof this.settings !== 'object') this.settings = {};
        switch (key) {
            case 'orientation': case 'orient': return this.settings.orientation ?? APP_ORIENTATION.PORTRAIT;
            case 'preload': case 'add': return this.settings.preload ?? 10;
            case 'unload': case 'remove': return this.settings.unload ?? 10;
        }
        return undefined;
    }
    activeWorld() {
        let world = this.getWorldByUUID(this.activeWorldUUID);
        if (!world || !world.isWorld) {
            const worldUUIDs = Object.keys(this.worlds);
            if (worldUUIDs.length > 0) world = this.worlds[worldUUIDs[0]];
        }
        return world;
    }
    setActiveWorld(world) {
        if (!world || !world.isWorld) return this;
        if (this.worlds[world.uuid]) this.activeWorldUUID = world.uuid;
        return this;
    }
    addWorld(world) {
        if (!world || !world.isWorld) return this;
        if (WORLD_TYPES[world.type]) {
            this.worlds[world.uuid] = world;
            if (this.activeWorldUUID == null) this.activeWorldUUID = world.uuid;
        } else {
            console.error(`Project.addWorld(): Invalid world type '${world.type}'`, world);
        }
        return this;
    }
    getWorldByName(name) {
        return this.getWorldByProperty('name', name);
    }
    getWorldByUUID(uuid) {
        if (!uuid) return undefined;
        return this.worlds[uuid];
    }
    getWorldByProperty(property, value) {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (world[property] === value) return world;
        }
    }
    removeWorld(world) {
        if (!world || !world.isWorld) return;
        delete this.worlds[world.uuid];
    }
    traverseWorlds(callback, recursive = true) {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (typeof callback === 'function') callback(world);
            if (recursive) world.traverseStages(callback, recursive);
        }
    }
    worldCount() {
        return Object.keys(this.worlds).length;
    }
    findEntityByUUID(uuid, searchAllWorlds = false) {
        const activeWorld = null;
        let worldList = [];
        if (searchAllWorlds) worldList = [...this.worlds];
        else if (activeWorld) worldList = [ activeWorld ];
        for (const world of worldList) {
            if (uuid && world.uuid && uuid === world.uuid) return world;
            const entity = world.getEntityByProperty('uuid', uuid);
            if (entity) return entity;
        }
        return undefined;
    }
    clear() {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            this.removeWorld(world);
            if (typeof world.dispose === 'function') world.dispose();
        }
        this.name = 'My Project';
        this.uuid = Maths.uuid();
        this.activeWorldUUID = null;
    }
    fromJSON(json, loadAssets = true, onLoad = () => {}) {
        const metaType = (json.metadata) ? json.metadata.type : 'Undefined';
        if (metaType !== 'Salinity') {
            console.error(`Project.fromJSON(): Unknown project type ('${metaType}'), expected 'Salinity'`);
            return;
        }
        const metaVersion = json.metadata.version;
        if (metaVersion !== VERSION) {
            console.warn(`Project.fromJSON(): Project saved in 'v${metaVersion}', attempting to load with 'v${VERSION}'`);
        }
        if (!json.object || json.object.type !== this.type) {
            console.error(`Project.fromJSON(): Save file corrupt, no 'Project' object found!`);
            return;
        }
        this.clear();
        if (loadAssets) {
            AssetManager$1.fromJSON(json, onLoad);
        }
        this.name = json.object.name;
        this.uuid = json.object.uuid;
        this.activeWorldUUID = json.object.activeWorldUUID;
        this.settings = structuredClone(json.settings);
        for (const worldData of json.worlds) {
            let world = undefined;
            switch (worldData.object.type) {
                case 'World3D': world = new World3D().fromJSON(worldData); break;
            }
            if (world && world.isWorld) this.addWorld(world);
        }
        return this;
    }
    toJSON() {
        const meta = {};
        const json = AssetManager$1.toJSON(meta);
        json.metadata = {
            type: 'Salinity',
            version: VERSION,
            generator: 'Salinity.Project.toJSON',
        };
        json.object = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
            activeWorldUUID: this.activeWorldUUID,
        };
        json.settings = structuredClone(this.settings);
        json.worlds = [];
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            json.worlds.push(world.toJSON());
        }
        return json;
    }
}

const scriptFunctions = APP_EVENTS.toString();
const scriptReturnObject = {};
for (const event of APP_EVENTS) scriptReturnObject[event] = event;
const scriptParameters = 'app,' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');
class SceneManager {
    static app = undefined;
    static cloneChildren(toEntity, fromEntity) {
        for (const entity of fromEntity.getEntities()) {
            const clone = entity.cloneEntity(false );
            SceneManager.loadScriptsFromComponents(clone, entity);
            if (!entity.isStage) SceneManager.cloneChildren(clone, entity);
            if (fromEntity.isStage) {
                if (toEntity.isWorld) {
                    const loadedDistance = toEntity.loadDistance + Math.abs(clone.position.length());
                    clone.traverse((child) => { child.userData.loadedDistance = loadedDistance; });
                }
            }
            toEntity.add(clone);
            for (const component of clone.components) {
                if (typeof component.onLoad === 'function') component.onLoad();
            }
        }
    }
    static loadScriptsFromComponents(toEntity, fromEntity) {
        if (!toEntity || !toEntity.isEntity) return;
        if (!fromEntity || !fromEntity.isEntity || !fromEntity.components) return;
        for (const component of fromEntity.components) {
            if (component.type !== 'script' || !component.data) continue;
            const scriptUUID = component.data.script;
            const script = AssetManager$1.get(scriptUUID);
            if (!script || !script.isScript) continue;
            if (script.errors) { console.warn(`Entity '${fromEntity.name}' has errors in script '${script.name}'. Script will not be loaded!`); continue; }
            let body = `${script.source}\n`;
            for (const variable in component.data.variables) {
                const value = component.data.variables[variable];
                if (value && typeof value === 'object') {
                    if (typeof value.value !== 'undefined') {
                        let json = JSON.stringify(value.value);
                        json = json.replace(/[.*+`'"?^${}()|[\]\\]/g, '\\$&');
                        body = body + `let ${variable} = JSON.parse('${json}');\n`;
                    } else {
                        body = body + `let ${variable} = undefined;\n`;
                    }
                }
            }
            body = body + `return ${scriptReturnString};`;
            const returnFunctionObject = new Function(scriptParameters , body ).bind(toEntity);
            const functionObject = returnFunctionObject(SceneManager.app);
            for (const name in functionObject) {
                if (typeof functionObject[name] !== 'function') continue;
                const callback = functionObject[name].bind(toEntity);
                SceneManager.app.addEvent(name, toEntity, callback);
            }
        }
    }
    static removeEntity(fromScene, entity) {
        if (!fromScene || !fromScene.isWorld3D) return;
        if (!entity || !entity.isObject3D) return;
        SceneManager.app.dispatch('destroy', {}, [ entity.uuid ]);
        fromScene.removeEntity(entity, true );
        if (typeof entity.dispose === 'function') entity.dispose();
    }
    static cloneStage(toScene, fromStage, updateLoadPosition = true) {
        if (!toScene || !toScene.isWorld3D) return;
        if (!fromStage || !fromStage.isStage3D) return;
        SceneManager.cloneChildren(toScene, fromStage);
        if (updateLoadPosition) {
        }
    }
    static loadStages(toScene, fromWorld, preload = 10) {
        if (!toScene || !toScene.isWorld3D) return;
        if (!fromWorld || !fromWorld.isWorld3D) return;
        if (preload < 0) return;
        const startDistance = toScene.loadDistance;
        let addedStageCount = 0;
        while (toScene.loadDistance - startDistance < preload) {
            const stages = [];
            for (const stage of fromWorld.getStages()) {
                if (!stage.enabled) continue;
                if (stage.start >= 0 && stage.start > toScene.loadDistance) continue;
                if (stage.finish >= 0 && stage.finish < toScene.loadDistance) continue;
                stages.push(stage);
            }
            if (stages.length > 0) {
                SceneManager.cloneStage(toScene, stages[Math.floor(Math.random() * stages.length)]);
                addedStageCount++;
            } else {
                toScene.loadDistance += preload;
                break;
            }
        }
        if (addedStageCount > 0) {
            SceneManager.app.dispatch('init');
        }
    }
    static loadWorld(toScene, fromWorld) {
        if (!toScene || !toScene.isWorld3D) return;
        if (!fromWorld || !fromWorld.isWorld3D) return;
        if (fromWorld.background != null) {
            if (fromWorld.background.isColor) {
                toScene.background = fromWorld.background.clone();
            } else {
                const texture = AssetManager$1.get(fromWorld.background);
                if (texture && texture.isTexture) toScene.background = texture.clone();
            }
        }
        const worldPhysicsComponent = fromWorld.getComponentByType('physics');
        if (worldPhysicsComponent) {
            const scenePhysicsComponent = toScene.addComponent(worldPhysicsComponent.type, worldPhysicsComponent.toJSON(), false);
            scenePhysicsComponent.onLoad();
            toScene.physics = scenePhysicsComponent;
        }
        SceneManager.cloneChildren(toScene, fromWorld);
    }
    static renderWorld(world) {
        if (!world || !world.isWorld3D) return;
    }
    static setCamera(world, camera) {
        SceneManager.app.camera = camera;
    }
    static setSize(width, height) {
        const fit = SceneManager.app?.project?.settings?.orientation;
        const ratio = APP_SIZE / ((fit === 'portrait') ? height : width);
        const fixedWidth = width * ratio;
        const fixedHeight = height * ratio;
    }
    static dispose() {
    }
}

let _animationID = null;
class App {
    constructor() {
        this.project = new Project();
        this.dom = document.createElement('div');
        this.events = {};
        this.world = null;
        this.scene = null;
        this.gameClock = new Clock(false );
        this.keys = {};
        this.pointer = { x: 0, y: 0 };
        this.isPlaying = false;
    }
    addEvent(name, owner, callback) {
        if (APP_EVENTS.indexOf(name) === -1) return;
        if (!owner || !owner.uuid) return;
        if (typeof callback !== 'function') return;
        if (!this.events[name]) this.events[name] = {};
        if (!this.events[name][owner.uuid]) this.events[name][owner.uuid] = [];
        this.events[name][owner.uuid].push(callback);
    }
    clearEvents(names = [], uuids = []) {
        if (names.length === 0) names = [...APP_EVENTS];
        const original = [...uuids];
        for (const name of names) {
            const events = this.events[name];
            if (typeof events !== 'object') return;
            uuids = (original.length === 0) ? Object.keys(events) : [...original];
            for (const uuid of uuids) {
                delete events[uuid];
            }
        }
    }
    dispatch(name, event = {}, uuids = [] ) {
        const events = this.events[name];
        if (typeof events !== 'object') return;
        if (uuids.length === 0) uuids = Object.keys(events);
        for (const uuid of uuids) {
            const callbacks = events[uuid];
            if (!Array.isArray(callbacks)) continue;
            for (const callback of callbacks) {
                if (typeof callback === 'function') {
                    try { callback(event); }
                    catch (error) { console.error((error.message || error), (error.stack || '')); }
                }
            }
        }
        if (name === 'init') {
            this.clearEvents([ name ], uuids);
        } else if (name === 'destroy') {
            this.clearEvents([], uuids);
        }
    }
    load(json, loadAssets = true) {
        SceneManager.app = this;
        this.project.fromJSON(json, loadAssets);
        this.world = this.project.activeWorld();
        const preload = this.project.setting('preload');
        this.scene = new World3D();
        SceneManager.loadWorld(this.scene, this.world);
        SceneManager.loadStages(this.scene, this.world, preload);
    }
    animate() {
        if (this.gameClock.isRunning()) {
            const delta = this.gameClock.getDeltaTime();
            const total = this.gameClock.getElapsedTime();
            this.dispatch('update', { delta, total });
            if (this.scene.physics) {
                this.scene.physics.onUpdate(delta);
                for (const child of this.scene.getEntities()) {
                    for (const component of child.components) {
                        if (typeof component.onUpdate === 'function') component.onUpdate(delta);
                    }
                }
            }
            if (this.camera && this.camera.target && this.camera.target.isVector3) {
            }
        }
        SceneManager.renderWorld(this.world);
        if (this.isPlaying) _animationID = requestAnimationFrame(function() { this.animate(); }.bind(this));
    }
    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this._appKeyDown = appKeyDown.bind(this);
        this._appKeyUp = appKeyUp.bind(this);
        this._appPointerDown = appPointerDown.bind(this);
        this._appPointerUp = appPointerUp.bind(this);
        this._appPointerMove = appPointerMove.bind(this);
        document.addEventListener('keydown', this._appKeyDown);
        document.addEventListener('keyup', this._appKeyUp);
        document.addEventListener('pointerdown', this._appPointerDown);
        document.addEventListener('pointerup', this._appPointerUp);
        document.addEventListener('pointermove', this._appPointerMove);
        this.gameClock.start(true );
        SceneManager.renderWorld(this.world);
        cancelAnimationFrame(_animationID);
        _animationID = requestAnimationFrame(function() { this.animate(); }.bind(this));
    }
    pause() {
        if (!this.isPlaying) return;
        this.gameClock.toggle();
    }
    stop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        document.removeEventListener('keydown', this._appKeyDown);
        document.removeEventListener('keyup', this._appKeyUp);
        document.removeEventListener('pointerdown', this._appPointerDown);
        document.removeEventListener('pointerup', this._appPointerUp);
        document.removeEventListener('pointermove', this._appPointerMove);
        cancelAnimationFrame(_animationID);
        _animationID = null;
        if (this.renderer) this.renderer.clear();
        this.gameClock.stop();
        SceneManager.dispose();
        EntityUtils.clearObject(this.camera);
        EntityUtils.clearObject(this.scene);
        this.project.clear();
        this.clearEvents();
    }
    setSize(width, height) {
        width = Math.ceil(Math.max(1, width));
        height = Math.ceil(Math.max(1, height));
        if (this.camera) this.camera.setSize(width, height);
        if (this.renderer) this.renderer.setSize(width, height);
        SceneManager.setSize(width, height);
    }
    gameCoordinates(event) {
        this.updatePointer(event);
        const worldPoint = { x: 0, y: 0 };
        return worldPoint;
    }
    updatePointer(event) {
        const rect = this.dom.getBoundingClientRect();
        const eventX = event.clientX - rect.left;
        const eventY = event.clientY - rect.top;
        this.pointer.x =  ((eventX / rect.width ) * 2) - 1;
        this.pointer.y = -((eventY / rect.height) * 2) + 1;
    }
}
function appKeyDown(event) {
    if (this.isPlaying) {
        this.keys[event.key] = true;
        this.dispatch('keydown', event);
    }
}
function appKeyUp(event) {
    if (this.isPlaying) {
        this.keys[event.key] = false;
        this.dispatch('keyup', event);
    }
}
function appPointerDown(event) {
    if (this.isPlaying) {
        this.dispatch('pointerdown', event);
    }
}
function appPointerUp(event) {
    if (this.isPlaying) {
        this.dispatch('pointerup', event);
    }
}
function appPointerMove(event) {
    if (this.isPlaying) {
        this.dispatch('pointermove', event);
    }
}

let Script$1 = class Script {
    constructor(format = SCRIPT_FORMAT.JAVASCRIPT, variables = false) {
        this.isScript = true;
        this.type = 'Script';
        this.name ='New Script';
        this.uuid = Maths.uuid();
        this.format = format;
        this.category = 'unknown';
        this.line = 0;
        this.char = 0;
        this.errors = false;
        if (format === SCRIPT_FORMAT.JAVASCRIPT) {
            this.source =
`//
// Lifecycle Events:    init, update, destroy
// Input Events:        keydown, keyup, pointerdown, pointerup, pointermove
// Within Events:
//      'this'          represents entity this script is attached to
//      'app'           access .renderer, .project, .scene, .camera, .keys
// Pointer Events:
//      'event.entity'  entity under pointer (if there is one)
// Update Event:
//      'event.delta'   time since last frame (in seconds)
//      'event.total'   total elapsed time (in seconds)
//
${variableTemplate(variables)}
// ...script scope variable declarations allowed here...

// "init()" is executed when an entity is loaded
function init() {

}

// "update()" is executed once each frame
function update(event) {

}

// "destroy()" is executed right before an entity is removed
function destroy() {

}

// Example Input Event
function keydown(event) {

}
`;
        }
    }
    fromJSON(json) {
        const data = json.object;
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        if (data.format !== undefined) this.format = data.format;
        if (data.category !== undefined) this.category = data.category;
        if (data.line !== undefined) this.line = data.line;
        if (data.char !== undefined) this.char = data.char;
        if (data.errors !== undefined) this.errors = data.errors;
        if (data.source !== undefined) this.source = data.source;
        return this;
    }
    toJSON() {
        const json = {
            object: {
                type: this.type,
                name: this.name,
                uuid: this.uuid,
                format: this.format,
                category: this.category,
            }
        };
        json.object.line = this.line;
        json.object.char = this.char;
        json.object.errors = structuredClone(this.errors);
        json.object.source = this.source;
        return json;
    }
};
function variableTemplate(includeVariables = false) {
    if (!includeVariables) {
return (`
// Script Properties:
let variables = {
//  myNumber: { type: 'number', default: 10 },
//  myString: { type: 'string', default: '' },
//  myColor: { type: 'color', default: 0x0000ff },
};
`);
    } else {
return (
`
//
// Example Script Properties
//      - 'info' property text will appear in Advisor
//      - see 'ComponentManager.js' for more information
//
let variables = {

    // The following 'asset' types are saved as asset UUID values
    geometry: { type: 'asset', class: 'geometry', info: 'Geometry Asset' },
    material: { type: 'asset', class: 'material', info: 'Material Asset' },
    script: { type: 'asset', class: 'script', info: 'Script Asset' },
    shape: { type: 'asset', class: 'shape', info: 'Shape Asset' },
    texture: { type: 'asset', class: 'texture', info: 'Texture Asset' },
    divider1: { type: 'divider' },
    prefab: { type: 'asset', class: 'prefab', info: 'Prefab Asset' },
    divider2: { type: 'divider' },

    // Dropdown selection box, saved as 'string' value
    select: { type: 'select', default: 'Banana', select: [ 'Apple', 'Banana', 'Cherry' ], info: 'Selection Box' },

    // Numeric values, saved as 'number' values
    number: { type: 'number', default: 0.05, min: 0, max: 1, step: 0.05, label: 'test', info: 'Floating Point' },
    int: { type: 'int', default: 5, min: 3, max: 10, info: 'Integer' },

    // Angle, saved as 'number' value in radians
    angle: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, info: 'Angle' },

    // Numeric value +/- a range value, saved as Array
    variable: { type: 'variable', default: [ 0, 0 ], min: 0, max: 100, info: 'Ranged Value' },
    slider: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, info: 'Numeric Slider' },

    // Boolean
    boolean: { type: 'boolean', default: true, info: 'true || false' },

    // Color returns integer value at runtime
    color: { type: 'color', default: 0xff0000, info: 'Color Value' },

    // Strings
    string: { type: 'string', info: 'String Value' },
    multiline: { type: 'string', rows: 4, info: 'Multiline String' },
    keyboard: { type: 'key', default: 'Escape' },

    // Vectors returned as Array types at runtime
    numberArray: { type: 'vector', size: 1, info: 'Numeric Array' },
    vector2: { type: 'vector', size: 2, tint: true, label: [ 'x', 'y' ], info: 'Vector 2' },
    vector3: { type: 'vector', size: 3, tint: true, min: [ 1, 1, 1 ], max: [ 2, 2, 2 ], step: 0.1, precision: 2, info: 'Vector 3' },
    vector4: { type: 'vector', size: 4, tint: true, info: 'Vector 4' },
}
`);
    }
}

class MoveCamera extends Script$1 {
    constructor() {
        super();
        this.name = 'Move Camera';
        this.category = 'camera';
        this.source =
`
// Properties
let variables = {
    // Rotation in degress per second
    moveX: { type: 'number', default: 0 },
    moveY: { type: 'number', default: 2 },
    moveZ: { type: 'number', default: 0 },
};

function update(event) {
    app.camera.position.x += moveX * event.delta;
    app.camera.position.y += moveY * event.delta;
    app.camera.position.z += moveZ * event.delta;
}
`;
    }
}

class OrbitEntity extends Script$1 {
    constructor() {
        super();
        this.name = 'Orbit Entity';
        this.category = 'camera';
        this.source =
`
// Properties
let variables = {
    distance: { type: 'number', default: 10 },
    orbit: { type: 'boolean', default: true },
    pan: { type: 'boolean', default: false },
    rotate: { type: 'boolean', default: false },
    smooth: { type: 'boolean', default: true },
};

// Locals
let controls;
let direction;
let quaternion;
let up;
let rotation;

function init() {
    // Init Orbit Controls
    app.camera.position.x = this.position.x;
    app.camera.position.y = this.position.y;
    app.camera.position.z = this.position.z + distance;
    controls = new SALT.OrbitControls(app.camera, app.renderer.domElement, this);
    controls.enablePan = pan;
    controls.enableRotate = rotate;
    controls.smoothAnimate = smooth;

    // Initialize Temp Variables
    direction = new THREE.Vector3();
    quaternion = new THREE.Quaternion();
    up = new THREE.Vector3(0, 1, 0);
    rotation = new THREE.Vector3().copy(this.rotation)
}

function update(event) {
    if (orbit) {
        // Maintain World Up
        this.getWorldQuaternion(quaternion);
        direction.copy(up).applyQuaternion(quaternion);
        app.camera.up.lerp(direction, event.delta * 10);

        // Rotate to Match Entity
        const angleDiff = (rotation.y - this.rotation.y);
        controls.applyRotation(angleDiff);
        rotation.copy(this.rotation);
    }

    // Update Orbit Controls
    controls.centerOnTarget(this);
    controls.update(event.delta);
}
`;
    }
}

class DragControls extends Script$1 {
    constructor() {
        super();
        this.name = 'Drag Controls';
        this.category = 'control';
        this.source =
`
// Properties
let variables = {
    updateSpeed: { type: 'slider', default: 10, min: 0, max: 50 },
};

// Locals
let downOnEntity = false;
let position;
let pointer;
let camera;

function init() {
    position = new THREE.Vector3();
    pointer = new THREE.Vector3();
    camera = new THREE.Vector3();

    // Starting Position
    position.copy(this.position);
}

function pointerdown(event) {
    if (event.entity === this && event.button !== 2) {
        const coords = app.gameCoordinates(event);
        pointer.copy(coords ? coords : this.position);
        camera.copy(app.camera.position);
        downOnEntity = true;
    }
}

function pointermove(event) {
    if (downOnEntity) {
        const coords = app.gameCoordinates(event);
        if (coords) pointer.copy(coords);
    }
}

function pointerup(event) {
    downOnEntity = false;
}

function update(event) {
    if (downOnEntity) {
        // Update Pointer
        if (downOnEntity) position.lerp(pointer, event.delta * updateSpeed);

        // Camera Moved?
        pointer.x += app.camera.position.x - camera.x;
        pointer.y += app.camera.position.y - camera.y;
        pointer.z += app.camera.position.z - camera.z;
        camera.copy(app.camera.position);
    } else {
        // Dissipate Target
        position.lerp(this.position, event.delta * updateSpeed);
    }

    // Update Position
    this.position.lerp(position, event.delta * updateSpeed);
}

`;
    }
}

class DrivingControls extends Script$1 {
    constructor() {
        super();
        this.name = 'Driving Controls';
        this.category = 'control';
        this.source =
`
// Properties
let variables = {
    axis: { type: 'select', default: 'XY (2D)', select: [ 'XY (2D)', 'XZ (3D)' ] },
    moveSpeed: { type: 'number', default: 5 },
    turnSpeed: { type: 'number', default: 5 },
    keyLeft: { type: 'key', default: 'ArrowLeft' },
    keyRight: { type: 'key', default: 'ArrowRight' },
    keyUp: { type: 'key', default: 'ArrowUp' },
    keyDown: { type: 'key', default: 'ArrowDown' },
};

// Locals
let position, rotation;
let direction;
let quaternion;
let up;
let spin;

function init() {
    // Prep Variables
    moveSpeed /= 100;
    turnSpeed /= 100;

    // Initialize Temp Variables
    position = new THREE.Vector3();
    rotation = new THREE.Vector3();
    direction = new THREE.Vector3();
    quaternion = new THREE.Quaternion();
    up = new THREE.Vector3();
    spin = new THREE.Vector3();

    // Movement Type
    if (axis === 'XY (2D)') {
        spin.z = turnSpeed;
        up.y = 1;
    }
    if (axis === 'XZ (3D)') {
        spin.y = turnSpeed;
        moveSpeed *= -1;
        up.z = 1;
    }

    // Starting Position
    position.copy(this.position);
}

function update(event) {
    // Rotate
    if (app.keys[keyLeft] || app.keys[keyRight]) {
        rotation.setFromEuler(this.rotation);
        if (app.keys[keyLeft]) rotation.add(spin);
        if (app.keys[keyRight]) rotation.sub(spin);
        this.rotation.setFromVector3(rotation);
    }

    // Movement
    if (app.keys[keyUp] || app.keys[keyDown]) {
        this.getWorldQuaternion(quaternion);
        direction.copy(up).applyQuaternion(quaternion);
        direction.multiplyScalar(moveSpeed);
        if (app.keys[keyUp]) position.add(direction);
        if (app.keys[keyDown]) position.sub(direction);
    } else {
        // Dissipate Movement
        position.lerp(this.position, event.delta * 10);
    }

    // Update Position
    this.position.lerp(position, event.delta * 10);
}
`;
    }
}

class KeyControls extends Script$1 {
    constructor() {
        super();
        this.name = 'Key Controls';
        this.category = 'control';
        this.source =
`
// Properties
let variables = {
    moveSpeed: { type: 'number', default: 5 },
    pixels: { type: 'number', default: 1 },
    keyLeft: { type: 'key', default: 'ArrowLeft' },
    keyRight: { type: 'key', default: 'ArrowRight' },
    keyUp: { type: 'key', default: 'ArrowUp' },
    keyDown: { type: 'key', default: 'ArrowDown' },
};

// Locals
let position;

function init() {
    // Starting Position
    position = new THREE.Vector3().copy(this.position);

    // "Target" Position (for smooth scrolling OrbitControls)
    this.target = new THREE.Vector3().copy(position);
}

function update(event) {
    // Movement
    if (app.keys[keyLeft] || app.keys[keyRight] || app.keys[keyUp] || app.keys[keyDown]) {
        if (app.keys[keyLeft]) position.x -= moveSpeed / 100;
        if (app.keys[keyRight]) position.x += moveSpeed / 100;
        if (app.keys[keyUp]) position.y += moveSpeed / 100;
        if (app.keys[keyDown]) position.y -= moveSpeed / 100;
    } else {
        // Dissipate Movement
        position.lerp(this.target, event.delta * moveSpeed);
    }

    this.target.lerp(position, event.delta * moveSpeed);

    // Update Position
    this.position.x = ((this.target.x * 100) - (this.target.x * 100) % pixels) / 100;
    this.position.y = ((this.target.y * 100) - (this.target.y * 100) % pixels) / 100;
    this.position.z = ((this.target.z * 100) - (this.target.z * 100) % pixels) / 100;
}
`;
    }
}

class ZigZagControls extends Script$1 {
    constructor() {
        super();
        this.name = 'Zig Zag Controls';
        this.category = 'control';
        this.source =
`
// Properties
let variables = {
    forward: { type: 'number', default: 2 },
    sideways: { type: 'number', default: 4 },
    keySwitch: { type: 'key', default: ' ' },
};

function update(event) {
    this.position.x += sideways * event.delta;
    this.position.y += forward * event.delta;
}

function keydown(event) {
    if (event.key === keySwitch) sideways *= -1;
}
`;
    }
}

class ColorChange extends Script$1 {
    constructor() {
        super();
        this.name = 'Color Change';
        this.category = 'entity';
        this.source =
`
// Properties
let variables = {
    color: { type: 'color', default: 0xff0000 },
};

function init() {
    this.updateComponent('material', { color: Number(color) });
}

function pointerdown(event) {
    if (event.entity === this) {
        const clr = new THREE.Color(Math.random(), Math.random(), Math.random());
        this.replaceComponent('material', { color: clr });
    }
}
`;
    }
}

class FollowCamera extends Script$1 {
    constructor() {
        super();
        this.name = 'Follow Camera';
        this.category = 'entity';
        this.source =
`
// Properties
let variables = {
    offsetX: { type: 'number', default: 0 },
	offsetY: { type: 'number', default: 0 },
    offsetZ: { type: 'number', default: 0 },
};

let offset;

function init() {
    offset = new THREE.Vector3();
    if (this.target) {
    	offset.copy(this.position).sub(this.target.position);
    }
}

function update(event) {
    if (app.camera && app.camera.target) {
    	this.position.x = app.camera.target.x + offsetX;
    	this.position.y = app.camera.target.y + offsetY;
        this.position.z = app.camera.target.z + offsetZ;

        if (this.target) {
        	this.target.position.copy(this.position).sub(offset);
        }
    }
}
`;
    }
}

class RotateEntity extends Script$1 {
    constructor() {
        super();
        this.name = 'Rotate Entity';
        this.category = 'entity';
        this.source =
`
// Properties
let variables = {
    // Rotation in degress per second
    rotateX: { type: 'number', default: 0 },
    rotateY: { type: 'number', default: 0 },
    rotateZ: { type: 'number', default: 180 },
};

function update(event) {
    this.rotation.x += (rotateX * (Math.PI / 180) * event.delta);
    this.rotation.y += (rotateY * (Math.PI / 180) * event.delta);
    this.rotation.z += (rotateZ * (Math.PI / 180) * event.delta);
}
`;
    }
}

class Vectors {
    static absolute(vec3) {
        vec3.x = Math.abs(vec3.x);
        vec3.y = Math.abs(vec3.y);
        vec3.z = Math.abs(vec3.z);
        return vec3;
    }
    static isNaN(vec3) {
        if (isNaN(vec3.x)) return true;
        if (isNaN(vec3.y)) return true;
        if (isNaN(vec3.z)) return true;
        if (vec3.w != null && isNaN(vec3.w)) return true;
        return false;
    }
    static noZero(vec3, min = 0.001) {
        min = Math.abs(min);
        Vectors.sanity(vec3);
        if (vec3.x >= 0 && vec3.x < min) vec3.x = min;
        if (vec3.y >= 0 && vec3.y < min) vec3.y = min;
        if (vec3.z >= 0 && vec3.z < min) vec3.z = min;
        if (vec3.x < 0 && vec3.x > min * -1.0) vec3.x = min * -1.0;
        if (vec3.y < 0 && vec3.y > min * -1.0) vec3.y = min * -1.0;
        if (vec3.z < 0 && vec3.z > min * -1.0) vec3.z = min * -1.0;
        return vec3;
    }
    static printOut(vec3, name = '') {
        if (name !== '') name += ' - ';
        console.info(`${name}X: ${vec3.x}, Y: ${vec3.y}, Z: ${vec3.z}`);
        return vec3;
    }
    static round(vec3, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        vec3.x = Math.round(vec3.x * shift) / shift;
        vec3.y = Math.round(vec3.y * shift) / shift;
        vec3.z = Math.round(vec3.z * shift) / shift;
        return vec3;
    }
    static sanity(vec3) {
        if (isNaN(vec3.x)) vec3.x = 0;
        if (isNaN(vec3.y)) vec3.y = 0;
        if (isNaN(vec3.z)) vec3.z = 0;
        if (vec3.w != null && isNaN(vec3.w)) vec3.w = 1;
        return vec3;
    }
}

class Geometry {
    init(data = {}) {
        if (data.isBufferGeometry) {
            const assetUUID = data.uuid;
            AssetManager$1.add(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        }
        let geometry = undefined;
        switch (data.style) {
            case 'asset':
                const assetGeometry = AssetManager$1.get(data.asset);
                if (assetGeometry && assetGeometry.isBufferGeometry) {
                    geometry = assetGeometry;
                }
                break;
            case 'box':
                break;
            case 'capsule':
                break;
            case 'circle':
                break;
            case 'cone':
                break;
            case 'cylinder':
                break;
            case 'lathe':
                break;
            case 'plane':
                break;
            case 'platonicSolid':
                break;
            case 'ring':
                break;
            case 'roundedBox':
                break;
            case 'shape':
                break;
            case 'sphere':
                break;
            case 'torus':
                break;
            case 'torusKnot':
                break;
            case 'tube':
                break;
            default:
                console.error(`GeometryComponent.init(): Invalid style '${data.style}'`);
        }
        if (geometry && geometry.isBufferGeometry) {
            const geometryName = geometry.constructor.name;
            geometry.name = geometryName;
        } else {
        }
        this.backend = geometry;
        this.data = data;
    }
    dispose() {
    }
    attach() {
        if (this.entity) {
            const materialComponent = this.entity.getComponent('material');
            if (materialComponent) materialComponent.attach();
        }
    }
    detach() {
        if (this.entity) {
            const materialComponent = this.entity.getComponent('material');
            if (materialComponent) materialComponent.detach();
        }
    }
}
Geometry.config = {
    schema: {
        style: [ { type: 'select', default: 'box', select: [ 'asset', 'box', 'capsule', 'circle', 'cone', 'cylinder', 'lathe', 'plane', 'platonicSolid', 'ring', 'roundedBox', 'shape', 'sphere', 'torus', 'torusKnot', 'tube' ] } ],
        asset: { type: 'asset', class: 'geometry', if: { style: [ 'asset' ] } },
        shape: { type: 'asset', class: 'shape', if: { style: [ 'lathe', 'shape', 'tube' ] } },
        styleDivider: { type: 'divider' },
        polyhedron: [ { type: 'select', default: 'dodecahedron', select: [ 'dodecahedron', 'icosahedron', 'octahedron', 'tetrahedron' ], if: { style: [ 'platonicSolid' ] } } ],
        points: { type: 'shape', alias: 'points', default: null, if: { style: [ 'lathe' ] } },
        shapes: { type: 'shape', alias: 'shape', default: null, if: { style: [ 'shape' ] } },
        path: { type: 'shape', alias: 'curve', default: null, if: { style: [ 'tube' ] } },
        depth: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'roundedBox' ] } },
            { type: 'number', default: 0.5, min: 0, step: 'grid', if: { style: [ 'shape' ] } },
        ],
        height: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'capsule', 'cone', 'cylinder', 'plane', 'roundedBox' ] } },
        ],
        width: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'plane', 'roundedBox' ] } },
        ],
        widthSegments: [
            { type: 'int', default: 1, min: 1, max: 1024, promode: true, if: { style: [ 'box', 'plane' ] } },
            { type: 'int', default: 24, min: 4, max: 1024, if: { style: [ 'sphere' ] } }
        ],
        heightSegments: [
            { type: 'int', default: 1, min: 1, max: 1024, promode: true, if: { style: [ 'box', 'plane' ] } },
            { type: 'int', default: 1, min: 1, max: 1024, if: { style: [ 'cone', 'cylinder' ] } },
            { type: 'int', default: 24, min: 1, max: 1024, if: { style: [ 'sphere' ] } },
        ],
        depthSegments: [
            { type: 'int', default: 1, min: 1, max: 1024, promode: true, if: { style: [ 'box' ] } },
        ],
        radius: [
            { type: 'number', default: 0.25, min: 0, step: 0.01, if: { style: [ 'roundedBox' ] } },
            { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'circle', 'cone', 'platonicSolid', 'sphere' ] } },
            { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'torus' ] } },
            { type: 'number', default: 0.40, min: 0, step: 0.01, if: { style: [ 'torusKnot' ] } },
            { type: 'number', default: 0.10, min: 0, step: 0.01, if: { style: [ 'tube' ] } },
        ],
        radiusTop: [
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'capsule' ] } },
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'cylinder' ] } },
        ],
        radiusBottom: [
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'capsule' ] } },
            { type: 'number', default: 0.5, min: 0, step: 0.01, if: { style: [ 'cylinder' ] } },
        ],
        segments: [
            { type: 'int', default: 36, min: 3, max: 64, if: { style: [ 'circle' ] } },
            { type: 'int', default: 16, min: 1, max: 64, if: { style: [ 'lathe' ] } },
            { type: 'int', default: 4, min: 1, max: 10, if: { style: [ 'roundedBox' ] } },
        ],
        thetaLength: [
            { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'circle', 'ring' ] } },
            { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, promode: true, if: { style: [ 'capsule', 'cone', 'cylinder' ] } },
            { type: 'angle', default: Math.PI, min: 0, max: 720, promode: true, if: { style: [ 'sphere' ] } }
        ],
        thetaStart: [
            { type: 'angle', default: 0, if: { style: [ 'circle', 'ring', 'sphere' ] } },
            { type: 'angle', default: 0, promode: true, if: { style: [ 'capsule', 'cone', 'cylinder' ] } },
        ],
        phiLength: { type: 'angle', default: 2 * Math.PI, max: 360, if: { style: [ 'lathe', 'sphere' ] } },
        phiStart: { type: 'angle', default: 0, if: { style: [ 'sphere' ] } },
        capSegments: { type: 'int', default: 6, min: 1, max: 36, if: { style: [ 'capsule' ] } },
        radialSegments: [
            { type: 'int', default: 24, min: 2, max: 64, if: { style: [ 'capsule', 'cone', 'cylinder', 'torus', 'torusKnot', 'tube' ] } },
        ],
        openEnded: { type: 'boolean', default: false, if: { style: [ 'cone', 'cylinder' ] } },
        detail: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, if: { style: [ 'platonicSolid' ] } },
        innerRadius: { type: 'number', default: 0.25, min: 0, step: 0.01, if: { style: [ 'ring' ] } },
        outerRadius: { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'ring' ] } },
        phiSegments: { type: 'int', default: 10, min: 1, max: 64, promode: true, if: { style: [ 'ring' ] } },
        thetaSegments: { type: 'int', default: 36, min: 3, max: 128, if: { style: [ 'ring' ] } },
        steps: { type: 'int', alias: 'Depth Segments', default: 3, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
        bevelEnabled: { type: 'boolean', alias: 'bevel', default: false, if: { style: [ 'shape' ] }, rebuild: true },
        bevelThickness: { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        bevelSize: { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        bevelSegments: { type: 'int', default: 4, min: 0, max: 64, promode: true, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        curveSegments: { type: 'int', default: 16, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
        tube: [
            { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'torus' ] } },
            { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'torusKnot' ] } },
        ],
        tubularSegments: [
            { type: 'int', default: 32, min: 3, max: 128, if: { style: [ 'torus' ] } },
            { type: 'int', default: 64, min: 3, max: 128, if: { style: [ 'torusKnot' ] } },
            { type: 'int', default: 128, min: 2, if: { style: [ 'tube' ] } },
        ],
        arc: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'torus' ] } },
        p: { type: 'number', default: 2, min: 1, max: 128, if: { style: [ 'torusKnot' ] } },
        q: { type: 'number', default: 3, min: 1, max: 128, if: { style: [ 'torusKnot' ] } },
        closed: { type: 'boolean', default: true, if: { style: [ 'tube' ] } },
    },
    icon: ``,
    color: 'rgb(255, 113, 0)',
    multiple: false,
    dependencies: [ 'material' ],
    family: [ 'Entity3D' ],
};
ComponentManager.register('geometry', Geometry);

const blendingModes = [ 'NoBlending', 'NormalBlending', 'AdditiveBlending', 'SubstractiveBlending', 'MultiplyBlending', 'CustomBlending' ];
const sides = [ 'FrontSide', 'BackSide', 'DoubleSide' ];
const depthPacking = [ 'BasicDepthPacking', 'RGBADepthPacking' ];
class Material {
    init(data = {}) {
        const parameters = {};
        if (data.isMaterial) {
            const assetUUID = data.uuid;
            AssetManager$1.add(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        } else {
            for (const key in data) {
                const value = data[key];
                parameters[key] = value;
                let variable = Material.config.schema[key];
                if (Array.isArray(variable) && variable.length > 0) variable = variable[0];
                if (value && variable && variable.type === 'asset') {
                    if (value.isTexture) {
                        AssetManager$1.add(value);
                    } else {
                        const textureCheck = AssetManager$1.get(value);
                        if (textureCheck && textureCheck.isTexture) {
                            parameters[key] = textureCheck;
                        } else {
                            parameters[key] = null;
                        }
                    }
                }
            }
            delete parameters['base'];
            delete parameters['style'];
            delete parameters['edgeSize'];
            delete parameters['gradientSize'];
            delete parameters['premultiplyAlpha'];
            delete parameters['useUv'];
            if (typeof parameters.blending === 'string') parameters.blending = blendingModes.indexOf(parameters.blending);
            if (typeof parameters.side === 'string') parameters.side = sides.indexOf(parameters.side);
            if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE.BasicDepthPacking;
            if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE.RGBADepthPacking;
        }
        let material = undefined;
        switch (data.style) {
            case 'asset':
                const assetMaterial = AssetManager$1.get(data.asset);
                if (assetMaterial && assetMaterial.isMaterial) {
                    material = assetMaterial.clone();
                }
                break;
            case 'basic':
            case 'depth':
            case 'lambert':
            case 'matcap':
            case 'normal':
            case 'phong':
            case 'physical':
            case 'points':
            case 'shader':
            case 'standard':
            default:
                console.error(`MaterialComponent.init(): Invalid style '${data.style}'`);
        }
        if (material && material.isMaterial) {
        } else {
        }
        this.backend = material;
        this.data = data;
    }
    dispose() {
    }
    attach() {
        refreshMesh(this);
    }
    detach() {
        refreshMesh(this);
    }
}
Material.config = {
    schema: {
        style: [
            { type: 'select', default: 'standard', promode: true, select: [ 'asset', 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'shader', 'standard' ] },
            { type: 'select', default: 'standard', select: [ 'asset', 'basic', 'points', 'standard' ] },
        ],
        styleDivider: { type: 'divider' },
        asset: { type: 'asset', class: 'material', if: { style: [ 'asset' ] } },
        color: { type: 'color', if: { style: [ 'basic', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard' ] } },
        emissive: { type: 'color', default: 0x000000, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard' ] } },
        emissiveIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard' ] } },
        opacity: { type: 'slider', default: 1.0, min: 0.0, max: 1.0, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard' ] } },
        depthTest: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        depthWrite: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        flatShading: { type: 'boolean', default: false, if: { style: [ 'phong', 'physical', 'standard', 'normal', 'matcap' ] } },
        premultiplyAlpha: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard' ] } },
        wireframe: { type: 'boolean', default: false, if: { style: [ 'basic', 'depth', 'lambert', 'normal', 'phong', 'physical', 'standard' ] } },
        vertexColors: { type: 'boolean', default: false, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        size: { type: 'slider', default: 0.05, min: 0, max: 1, if: { style: [ 'points' ] } },
        sizeAttenuation: { type: 'boolean', default: true, if: { style: [ 'points' ] } },
        useUv: { type: 'boolean', default: false, if: { style: [ 'points' ] } },
        metalness: { type: 'slider', default: 0.1, min: 0.0, max: 1.0, if: { style: [ 'physical', 'standard' ] } },
        roughness: { type: 'slider', default: 1.0, min: 0.0, max: 1.0, if: { style: [ 'physical', 'standard' ] } },
        specular: { type: 'color', default: 0x111111, if: { style: [ 'phong' ] } },
        shininess: { type: 'number', default: 30, if: { style: [ 'phong' ] } },
        clearcoat: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        clearcoatRoughness: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        ior: { type: 'slider', default: 1.5, min: 1.0, max: 2.0, if: { style: [ 'physical' ] } },
        sheen: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        sheenRoughness: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        sheenColor: { type: 'color', if: { style: [ 'physical' ] } },
        specularColor: { type: 'color', promode: true, if: { style: [ 'physical' ] } },
        specularIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'physical' ] } },
        thickness: { type: 'slider', default: 0.0, min: 0.0, max: 5.0, if: { style: [ 'physical' ] } },
        transmission: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        depthPacking: { type: 'select', default: 'BasicDepthPacking', select: depthPacking, if: { style: [ 'depth' ] } },
        map: [
            { type: 'asset', class: 'texture', alias: 'texture', if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'points', 'physical', 'standard' ] } },
        ],
        matcap: { type: 'asset', class: 'texture', if: { style: [ 'matcap' ] } },
        alphaMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard' ] } },
        bumpMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        bumpScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        clearcoatNormalMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical' ] } },
        clearcoatNormalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'physical' ] } },
        displacementMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        displacementScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        emissiveMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard' ] } },
        metalnessMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical', 'standard' ] } },
        roughnessMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical', 'standard' ] } },
        specularMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong' ] } },
        thicknessMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical' ] } },
        transmissionMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical' ] } },
        aoMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        envMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        lightMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        normalMap: { type: 'asset', class: 'texture', if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        side: { type: 'select', default: 'FrontSide', select: sides, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
    },
    icon: ``,
    color: 'rgb(165, 243, 0)',
    multiple: false,
    dependencies: [ 'geometry' ],
    family: [ 'Entity3D' ],
};
ComponentManager.register('material', Material);

class Mesh {
    init(data = {}) {
        this.backed = mesh;
        this.data = data;
    }
    dispose() {
    }
    attach() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }
    detach() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }
}
Mesh.config = {
    icon: ``,
    color: '#F7DB63',
    multiple: true,
    family: [ 'Entity3D' ],
};
ComponentManager.register('mesh', Mesh);

class Script {
    init(data = {}) {
        if (data.isScript) {
            const assetUUID = data.uuid;
            AssetManager$1.add(data);
            data = this.defaultData();
            data.script = assetUUID;
        }
        const script = AssetManager$1.get(data.script);
        if (script && script.isScript) {
            if (!data.variables) data.variables = {};
            let variables = {};
            if (script.source) {
                try {
                    const body = `${script.source}\nreturn variables;`;
                    variables = (new Function('' , body ))();
                } catch (error) {  }
            }
            for (const key in variables) {
                const variable = variables[key];
                if (variable.type) {
                    if (key in data.variables) variable.value = data.variables[key].value;
                    if (variable.value === undefined) variable.value = variable.default;
                    if (variable.value === undefined) variable.value = ComponentManager.defaultValue(variable.type);
                } else {
                    variable.value = null;
                }
            }
            data.variables = structuredClone(variables);
        }
        this.backend = undefined;
        this.data = data;
    }
}
Script.config = {
    schema: {
        script: { type: 'asset', class: 'script', rebuild: true },
        divider: { type: 'divider' },
        variables: { type: 'object', default: {} },
    },
    icon: ``,
    color: '#090B11',
    width: '40%',
    multiple: true,
    dependencies: [],
    family: [ 'Entity3D' ],
};
ComponentManager.register('script', Script);

const exampleSelect = [ 'Apple', 'Banana', 'Cherry', 'Zebra', 'Red' ];
class Test {
    init(data = {}) {
        let test = undefined;
        this.backend = test;
        this.data = data;
    }
    dispose() {
    }
    attach() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }
    detach() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }
}
Test.config = {
    schema: {
        style: [
            { type: 'select', default: 'basic', select: [ 'asset', 'basic', 'array' ] },
        ],
        divider: { type: 'divider' },
        asset: { type: 'asset', if: { style: [ 'asset' ] } },
        assetDivider: { type: 'divider' },
        geometry: { type: 'asset', class: 'geometry', if: { style: [ 'asset' ] } },
        material: { type: 'asset', class: 'material', if: { style: [ 'asset' ] } },
        script: { type: 'asset', class: 'script', if: { style: [ 'asset' ] } },
        shape: { type: 'asset', class: 'shape', if: { style: [ 'asset' ] } },
        texture: { type: 'asset', class: 'texture', if: { style: [ 'asset' ] } },
        prefabDivider: { type: 'divider' },
        prefab: { type: 'asset', class: 'prefab', if: { style: [ 'asset' ] } },
        select: { type: 'select', default: 'Zebra', select: exampleSelect, if: { style: [ 'basic' ] } },
        number: { type: 'number', default: 0.05, min: 0, max: 1, label: 'test', if: { style: [ 'basic' ] } },
        int: { type: 'int', default: 5, min: 3, max: 10, if: { style: [ 'basic' ] } },
        angle: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'basic' ] } },
        variable: { type: 'variable', default: [ 0, 0 ], min: 0, max: 100, if: { style: [ 'basic' ] } },
        slider: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, if: { style: [ 'basic' ] } },
        boolean: { type: 'boolean', default: true, if: { style: [ 'basic' ] } },
        color: { type: 'color', default: 0xff0000, if: { style: [ 'basic' ] } },
        string: { type: 'string', if: { style: [ 'basic' ] } },
        multiline: { type: 'string', rows: 4, if: { style: [ 'basic' ] } },
        numberArray: { type: 'vector', size: 1, if: { style: [ 'array' ] } },
        vector2: { type: 'vector', size: 2, tint: true, label: [ 'x', 'y' ], if: { style: [ 'array' ] } },
        vector3: { type: 'vector', size: 3, tint: true, min: [ 1, 1, 1 ], max: [ 2, 2, 2 ], step: 0.1, precision: 2, if: { style: [ 'array' ] } },
        vector4: { type: 'vector', size: 4, tint: true, if: { style: [ 'array' ] } },
    },
    icon: ``,
    color: 'rgb(128, 128, 128)',
    multiple: false,
    dependencies: [],
    family: [ 'Entity3D' ],
};
ComponentManager.register('test', Test);

const _gravity = { x: 0, y: 9.81, z: 0 };
class Physics {
    init(data = {}) {
        let world = undefined;
        this.backend = world;
        this.data = data;
    }
    dispose() {
        const world = this.backend;
        if (world) world.free();
    }
    attach() {
    }
    detach() {
    }
    onLoad() {
        _gravity.set(0, 0, 0);
        if (this.data.gravity) _gravity.fromArray(this.data.gravity);
        const world = null;
        this.backend = world;
    }
    onUpdate(delta = 0) {
        const world = this.backend;
        if (!world) return;
        if (delta > 0.01) {
            world.timestep = delta;
            world.step();
        }
    }
}
Physics.config = {
    schema: {
        gravity: { type: 'vector', default: [ 0, - 9.807, 0 ], size: 3, tint: true, step: 0.1, precision: 2 },
    },
    icon: ``,
    color: '#0F4F94',
    multiple: false,
    dependencies: [],
    family: [ 'World3D' ],
};
ComponentManager.register('physics', Physics);

class Post {
    init(data = {}) {
        let pass = undefined;
        switch (data.style) {
            case 'ascii':
                break;
            case 'bloom':
                break;
            case 'cartoon':
                break;
            case 'dither':
                break;
            case 'edge':
                break;
            case 'levels':
                break;
            case 'pixel':
                break;
            case 'tint':
                break;
            default:
                console.error(`PostComponent.init(): Invalid style '${data.style}'`);
        }
        if (pass) {
        } else {
        }
        this.backend = pass;
        this.data = data;
    }
    dispose() {
        const pass = this.backend;
        if (!pass || !pass.uniforms) return;
        for (const property in pass.uniforms) {
            const uniform = pass.uniforms[property];
            if (uniform && uniform.value && uniform.value.isTexture) {
                if (typeof uniform.value.dispose === 'function') {
                    uniform.value.dispose();
                }
            }
        }
    }
}
Post.config = {
    schema: {
        style: [
            { type: 'select', default: 'levels', select: [ 'ascii', 'bloom', 'cartoon', 'dither', 'edge', 'levels', 'pixel', 'tint' ] },
        ],
        divider: { type: 'divider' },
        textSize: { type: 'slider', default: 16, min: 4, max: 64, step: 1, precision: 0, if: { style: [ 'ascii' ] } },
        textColor: { type: 'color', default: 0xffffff, if: { style: [ 'ascii' ] } },
        characters: { type: 'string', default: ` .,•:-+=*!?%X0#@`, if: { style: [ 'ascii' ] } },
        threshold: { type: 'slider', default: 0, min: 0, max: 1, step: 0.05, precision: 2, if: { style: [ 'bloom' ] } },
        strength: { type: 'slider', default: 1, min: 0, max: 3, step: 0.1, precision: 2, if: { style: [ 'bloom' ] } },
        radius: { type: 'slider', default: 0, min: 0, max: 1, step: 0.05, precision: 2, if: { style: [ 'bloom' ] } },
        edgeColor: { type: 'color', default: 0x000000, if: { style: [ 'cartoon' ] } },
        edgeStrength: { type: 'slider', default: 0, min: 0, max: 1, precision: 2, if: { style: [ 'cartoon' ] } },
        gradient: { type: 'slider', default: 5, min: 2, max: 32, step: 1, precision: 0, if: { style: [ 'cartoon' ] } },
        palette: { type: 'asset', class: 'palette', if: { style: [ 'dither' ] } },
        bias: { type: 'slider', default: 0.25, min: -1, max: 1, precision: 2, step: 0.05, if: { style: [ 'dither' ] } },
        scale: { type: 'slider', default: 1, min: 1, max: 9, precision: 2, step: 1, if: { style: [ 'dither' ] } },
        bitrate: { type: 'slider', promode: true, default: 8, min: 0, max: 8, step: 1, precision: 0, if: { style: [ 'levels' ] } },
        hue: { type: 'angle', default: 0.0, min: -360, max: 360, if: { style: [ 'levels' ] } },
        saturation: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        brightness: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        contrast: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        grayscale: { type: 'slider', default: 0.0, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        negative: { type: 'boolean', default: false, if: { style: [ 'levels' ] } },
        cellStyle: { type: 'select', default: 'none', select: [ 'none', 'brick', 'cross', 'knit', 'tile', 'woven' ], if: { style: [ 'pixel' ] } },
        cellSize: { type: 'vector', default: [ 8, 8 ], size: 2, tint: true, aspect: true, label: [ 'x', 'y' ], min: [ 1, 1 ], max: [ 1000, 1000 ], precision: [ 2, 2 ], if: { style: [ 'pixel' ] } },
        cutOff: { type: 'slider', promode: true, default: 0, min: 0, max: 1.0, step: 0.05, precision: 2, if: { style: [ 'pixel' ] } },
        color: { type: 'color', default: 0xff0000, if: { style: [ 'tint' ] } },
    },
    icon: ``,
    color: 'rgb(64, 64, 64)',
    multiple: true,
    dependencies: [],
    family: [ 'World3D' ],
};
ComponentManager.register('post', Post);

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}

export { APP_EVENTS, APP_ORIENTATION, APP_SIZE, App, AssetManager$1 as AssetManager, Camera3D, Clock, ColorChange, ComponentManager, DragControls, DrivingControls, Entity3D, EntityUtils, FollowCamera, Iris, KeyControls, Maths, MoveCamera, OrbitEntity, Palette, Project, RotateEntity, SCRIPT_FORMAT, SceneManager, Script$1 as Script, Stage3D, System, VERSION, Vectors, WORLD_TYPES, World3D, ZigZagControls };
