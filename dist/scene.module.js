/**
 * @description Salinity Engine
 * @about       Interactive, easy to use JavaScript app & game framework.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.7
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine/engine
 */
class Vector2 {
    constructor(x, y) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x || 0;
            this.y = y || 0;
        }
    }
    set(x, y) {
        if (typeof x === 'object') return this.copy(x);
        this.x = x;
        this.y = y;
        return this;
    }
    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        return this;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    copy(vec, y) {
        if (typeof vec === 'object') {
            this.x = vec.x;
            this.y = vec.y;
        } else {
            this.x = vec;
            this.y = y;
        }
        return this;
    }
    add(x, y) {
        if (typeof x === 'object') {
            this.x += x.x;
            this.y += x.y;
        } else {
            this.x += x;
            this.y += y;
        }
        return this;
    }
    addScalar(scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    }
    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }
    addScaledVector(vec, scale) {
        this.x += vec.x * scale;
        this.y += vec.y * scale;
        return this;
    }
    sub(x, y) {
        if (typeof x === 'object') {
            this.x -= x.x;
            this.y -= x.y;
        } else {
            this.x -= x;
            this.y -= y;
        }
        return this;
    }
    subScalar(scalar) {
        this.x -= scalar;
        this.y -= scalar;
        return this;
    }
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }
    multiply(x, y) {
        if (typeof x === 'object') {
            this.x *= x.x;
            this.y *= x.y;
        } else {
            this.x *= x;
            this.y *= y;
        }
        return this;
    }
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    divide(x, y) {
        if (typeof x === 'object') {
            this.x /= x.x;
            this.y /= x.y;
        } else {
            this.x /= x;
            this.y /= y;
        }
        return this;
    }
    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }
    min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }
    max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }
    clamp(minv, maxv) {
        this.x = Math.max(minv.x, Math.min(maxv.x, this.x));
        this.y = Math.max(minv.y, Math.min(maxv.y, this.y));
        return this;
    }
    clampScalar(minVal, maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x));
        this.y = Math.max(minVal, Math.min(maxVal, this.y));
        return this;
    }
    clampLength(min, max) {
        const length = this.length();
        return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }
    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
        return this.divideScalar(this.length() || 1);
    }
    angle(forcePositive) {
        let angle = Math.atan2(this.y, this.x);
        if (forcePositive && angle < 0) angle += 2 * Math.PI;
        return angle;
    }
    angleBetween(v) {
        const dot = this.dot(v);
        const magnitudes = this.length() * v.length();
        const clampedDot = Math.min(Math.max(dot / magnitudes, -1), 1);
        return Math.acos(clampedDot);
    }
    rotateAround(center, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const x = this.x - center.x;
        const y = this.y - center.y;
        this.x = x * c - y * s + center.x;
        this.y = x * s + y * c + center.y;
    }
    distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
    }
    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
    manhattanDistanceTo(v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }
    setLength(length) {
        return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    }
    equals(v) {
        return ((v.x === this.x) && (v.y === this.y));
    }
    toArray() {
        return [ this.x, this.y ];
    }
    fromArray(array) {
        this.set(array[0], array[1]);
        return this;
    }
}

class Matrix2 {
    constructor(values) {
        if (Array.isArray(values)) this.m = [ ...values ];
        else this.identity();
    }
    copy(mat) {
        this.m = [ ...mat.m ];
        return this;
    }
    clone() {
        return new Matrix2([ ...this.m ]);
    }
    identity() {
        this.m = [ 1, 0, 0, 1, 0, 0 ];
        return this;
    }
    multiply(mat) {
        const m0 = this.m[0] * mat.m[0] + this.m[2] * mat.m[1];
        const m1 = this.m[1] * mat.m[0] + this.m[3] * mat.m[1];
        const m2 = this.m[0] * mat.m[2] + this.m[2] * mat.m[3];
        const m3 = this.m[1] * mat.m[2] + this.m[3] * mat.m[3];
        const m4 = this.m[0] * mat.m[4] + this.m[2] * mat.m[5] + this.m[4];
        const m5 = this.m[1] * mat.m[4] + this.m[3] * mat.m[5] + this.m[5];
        this.m = [ m0, m1, m2, m3, m4, m5 ];
        return this;
    }
    premultiply(mat) {
        const m0 = mat.m[0] * this.m[0] + mat.m[2] * this.m[1];
        const m1 = mat.m[1] * this.m[0] + mat.m[3] * this.m[1];
        const m2 = mat.m[0] * this.m[2] + mat.m[2] * this.m[3];
        const m3 = mat.m[1] * this.m[2] + mat.m[3] * this.m[3];
        const m4 = mat.m[0] * this.m[4] + mat.m[2] * this.m[5] + mat.m[4];
        const m5 = mat.m[1] * this.m[4] + mat.m[3] * this.m[5] + mat.m[5];
        this.m = [ m0, m1, m2, m3, m4, m5 ];
    }
    compose(px, py, sx, sy, ox, oy, rot) {
        this.m = [ 1, 0, 0, 1, px, py ];
        if (rot !== 0) {
            const c = Math.cos(rot);
            const s = Math.sin(rot);
            this.multiply(new Matrix2([ c, s, -s, c, 0, 0 ]));
        }
        if (sx !== 1 || sy !== 1) this.scale(sx, sy);
        if (ox !== 0 || oy !== 0) this.multiply(new Matrix2([ 1, 0, 0, 1, -ox, -oy ]));
        return this;
    }
    translate(x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
        return this;
    }
    rotate(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const m11 = this.m[0] * c + this.m[2] * s;
        const m12 = this.m[1] * c + this.m[3] * s;
        const m21 = this.m[0] * -s + this.m[2] * c;
        const m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    }
    scale(sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
        return this;
    }
    setPosition(x, y) {
        this.m[4] = x;
        this.m[5] = y;
        return this;
    }
    getScale() {
        return new Vector2(this.m[0], this.m[3]);
    }
    getPosition() {
        return new Vector2(this.m[4], this.m[5]);
    }
    getRotation() {
        return Math.atan2(this.m[1], this.m[0]);
    }
    skew(radianX, radianY) {
        return this.multiply(new Matrix2([ 1, Math.tan(radianY), Math.tan(radianX), 1, 0, 0 ]));
    }
    determinant() {
        return 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
    }
    getInverse() {
        const d = this.determinant();
        return new Matrix2([ this.m[3] * d, -this.m[1] * d, -this.m[2] * d, this.m[0] * d, d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]), d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]) ]);
    }
    transformPoint(x, y) {
        let px, py;
        if (typeof x === 'object') {
            px = x.x * this.m[0] + x.y * this.m[2] + this.m[4];
            py = x.x * this.m[1] + x.y * this.m[3] + this.m[5];
        } else {
            px = x * this.m[0] + y * this.m[2] + this.m[4];
            py = x * this.m[1] + y * this.m[3] + this.m[5];
        }
        return new Vector2(px, py);
    }
    setContextTransform(context) {
        context.setTransform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
        return this;
    }
    tranformContext(context) {
        context.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
        return this;
    }
    cssTransform() {
        return 'matrix(' + this.m[0] + ',' + this.m[1] + ',' + this.m[2] + ',' + this.m[3] + ',' + this.m[4] + ',' + this.m[5] + ')';
    }
}

const EPSILON = 0.000001;
function length(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
}
function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
}
function distance(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
function squaredDistance(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return x * x + y * y + z * z;
}
function squaredLength(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return x * x + y * y + z * z;
}
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
}
function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
}
function normalize(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
}
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
    let ax = a[0], ay = a[1], az = a[2];
    let bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}
function lerp(out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
}
function transformMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}
function scaleRotateMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
}
function transformMat3(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
}
function transformQuat(out, a, q) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3];
    let uvx = qy * z - qz * y;
    let uvy = qz * x - qx * z;
    let uvz = qx * y - qy * x;
    let uuvx = qy * uvz - qz * uvy;
    let uuvy = qz * uvx - qx * uvz;
    let uuvz = qx * uvy - qy * uvx;
    let w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;
    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;
    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
}
const angle = (function() {
    const tempA = [ 0, 0, 0 ];
    const tempB = [ 0, 0, 0 ];
    return function(a, b) {
        copy(tempA, a);
        copy(tempB, b);
        normalize(tempA, tempA);
        normalize(tempB, tempB);
        let cosine = dot(tempA, tempB);
        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1.0) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    };
})();
function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function fuzzyEquals(a, b, tolerance = 0.001) {
    if (fuzzyFloat(a[0], b[0], tolerance) === false) return false;
    if (fuzzyFloat(a[1], b[1], tolerance) === false) return false;
    if (fuzzyFloat(a[2], b[2], tolerance) === false) return false;
    return true;
}
const calculateNormal = (function() {
    const temp = [ 0, 0, 0 ];
    return function(out, a, b, c) {
        subtract(temp, a, b);
        subtract(out, b, c);
        cross(out, temp, out);
        normalize(out, out);
    };
})();
function fuzzyFloat(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
}

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];
const v0 = [ 0, 0, 0 ];
const v1 = [ 0, 0, 0 ];
const vc = [ 0, 0, 0 ];
class MathUtils {
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
        return MathUtils.lerp(x, y, 1 - Math.exp(- lambda * dt));
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
        if (MathUtils.fuzzyFloat(a.x, b.x, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.y, b.y, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.z, b.z, tolerance) === false) return false;
        return true;
    }
    static fuzzyQuaternion(a, b, tolerance = 0.001) {
        if (MathUtils.fuzzyVector(a, b, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.w, b.w, tolerance) === false) return false;
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
        number = MathUtils.sanity(number);
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
        if (MathUtils.fuzzyFloat(denom, 0, 0.0000001)) return false;
        let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1)) {
            return true;
        }
        return false;
    }
    static lineRectCollision(x1, y1, x2, y2, left, top, right, down) {
        const rectLeft =    MathUtils.lineCollision(x1, y1, x2, y2, left, top, left, down);
        const rectRight =   MathUtils.lineCollision(x1, y1, x2, y2, right, top, right, down);
        const rectTop =     MathUtils.lineCollision(x1, y1, x2, y2, left, top, right, top);
        const rectDown =    MathUtils.lineCollision(x1, y1, x2, y2, left, down, right, down);
        return (rectLeft || rectRight || rectTop || rectDown);
    }
    static triangleArea(a, b, c) {
        subtract(v0, c, b);
        subtract(v1, a, b);
        cross(vc, v0, v1);
        return (length(vc) * 0.5);
    }
    static randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }
    static randomInt(min = 0, max = 1) {
        return min + Math.floor(Math.random() * (max - min));
    }
    static randomUUID() {
        if (window.crypto && window.crypto.randomUUID) return crypto.randomUUID();
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
            _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
            _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
            _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];
        return uuid.toLowerCase();
    }
    static toUUIDArray(...objects) {
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        const uuids = [];
        for (const object of objects) {
            if (typeof object === 'object') {
                if (object.uuid) uuids.push(object.uuid);
            }
        }
        return uuids;
    }
}

class Camera2D {
    constructor() {
        this.uuid = MathUtils.randomUUID();
        this.position = new Vector2(0, 0);
        this.scale = 1.0;
        this.rotation = 0.0;
        this.matrix = new Matrix2();
        this.inverseMatrix = new Matrix2();
        this.matrixNeedsUpdate = true;
    }
    updateMatrix(offsetX, offsetY) {
        if (!this.matrixNeedsUpdate) return;
        this.matrix.identity();
        this.matrix.multiply(new Matrix2([ 1, 0, 0, 1, +offsetX, +offsetY ]));
        const c = Math.cos(this.rotation);
        const s = Math.sin(this.rotation);
        this.matrix.multiply(new Matrix2([ c, s, -s, c, 0, 0 ]));
        this.matrix.multiply(new Matrix2([ 1, 0, 0, 1, -offsetX, -offsetY ]));
        this.matrix.multiply(new Matrix2([ 1, 0, 0, 1, this.position.x, this.position.y ]));
        this.matrix.multiply(new Matrix2([ this.scale, 0, 0, this.scale, 0, 0 ]));
        this.inverseMatrix = this.matrix.getInverse();
        this.matrixNeedsUpdate = false;
    }
    lerpPosition(v1, v2, t) {
        this.position.x = (v1.x * (1 - t)) + (v2.x * t);
        this.position.y = (v1.y * (1 - t)) + (v2.y * t);
        this.matrixNeedsUpdate = true;
    }
}

class Box2 {
    constructor(min, max) {
        this.min = new Vector2(+Infinity, +Infinity);
        this.max = new Vector2(-Infinity, -Infinity);
        if (typeof min === 'object') this.min.copy(min);
        if (typeof max === 'object') this.max.copy(max);
    }
    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);
        return this;
    }
    setFromPoints(...points) {
        if (points.length > 0 && Array.isArray(points[0])) points = points[0];
        this.min = new Vector2(+Infinity, +Infinity);
        this.max = new Vector2(-Infinity, -Infinity);
        for (const point of points) {
            this.expandByPoint(point);
        }
        return this;
    }
    setFromCenterAndSize(center, size) {
        const halfSize = new Vector2().copy(size).multiplyScalar(0.5);
        this.min.copy(center).sub(halfSize);
        this.max.copy(center).add(halfSize);
        return this;
    }
    clone() {
        return new Box2().copy(this);
    }
    copy(box) {
        this.min.copy(box.min);
        this.max.copy(box.max);
        return this;
    }
    isEmpty() {
        return (this.max.x < this.min.x) || (this.max.y < this.min.y);
    }
    getCenter(target) {
        target = target ?? new Vector2();
        this.isEmpty() ? target.set(0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
        return target;
    }
    getSize(target) {
        target = target ?? new Vector2();
        this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min);
        return target;
    }
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);
        return this;
    }
    expandByVector(vector) {
        this.min.sub(vector);
        this.max.add(vector);
        return this;
    }
    expandByScalar(scalar) {
        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);
        return this;
    }
    containsPoint(point) {
        return !(point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y);
    }
    containsBox(box) {
        return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
    }
    intersectsBox(box) {
        return !(box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y);
    }
    distanceToPoint(point) {
        let v = new Vector2();
        let clampedPoint = v.copy(point).clamp(this.min, this.max);
        return clampedPoint.sub(point).length();
    }
    intersect(box) {
        this.min.max(box.min);
        this.max.min(box.max);
        return this;
    }
    union(box) {
        this.min.min(box.min);
        this.max.max(box.max);
        return this;
    }
    translate(offset) {
        this.min.add(offset);
        this.max.add(offset);
        return this;
    }
    equals(box) {
        return box.min.equals(this.min) && box.max.equals(this.max);
    }
    toArray() {
        return [ this.min.x, this.min.y, this.max.x, this.max.y ];
    }
    fromArray(array) {
        this.min.set(array[0], array[1]);
        this.max.set(array[2], array[3]);
        return this;
    }
}

class Key {
    static DOWN = -1;
    static UP = 1;
    static RESET = 0;
    constructor() {
        this.pressed = false;
        this.justPressed = false;
        this.justReleased = false;
    }
    update(action) {
        this.justPressed = false;
        this.justReleased = false;
        if (action === Key.DOWN) {
            if (this.pressed === false) this.justPressed = true;
            this.pressed = true;
        } else if(action === Key.UP) {
            if (this.pressed) this.justReleased = true;
            this.pressed = false;
        } else if(action === Key.RESET) {
            this.justReleased = false;
            this.justPressed = false;
        }
    }
    set(justPressed, pressed, justReleased) {
        this.justPressed = justPressed;
        this.pressed = pressed;
        this.justReleased = justReleased;
    }
    reset() {
        this.justPressed = false;
        this.pressed = false;
        this.justReleased = false;
    }
}

class Pointer {
    static LEFT = 0;
    static MIDDLE = 1;
    static RIGHT = 2;
    static BACK = 3;
    static FORWARD = 4;
    constructor(element, disableContextMenu = true) {
        if (!element || !element.isElement) {
            console.error(`Pointer: No Suey Element was provided`);
            return;
        }
        const self = this;
        this._keys = new Array(5);
        this._position = new Vector2(0, 0);
        this._positionUpdated = false;
        this._delta = new Vector2(0, 0);
        this._wheel = 0;
        this._wheelUpdated = false;
        this._doubleClicked = new Array(5);
        this.keys = new Array(5);
        this.position = new Vector2(0, 0);
        this.delta = new Vector2(0, 0);
        this.wheel = 0;
        this.doubleClicked = new Array(5);
        this.pointerInside = false;
        for (let i = 0; i < 5; i++) {
            this._doubleClicked[i] = false;
            this.doubleClicked[i] = false;
            this._keys[i] = new Key();
            this.keys[i] = new Key();
        }
        function updatePosition(x, y, xDiff, yDiff) {
            if (element && element.dom) {
                const rect = element.dom.getBoundingClientRect();
                x -= rect.left;
                y -= rect.top;
            }
            self._position.set(x, y);
            self._delta.x += xDiff;
            self._delta.y += yDiff;
            self._positionUpdated = true;
        }
        function updateKey(button, action) {
            if (button >= 0) self._keys[button].update(action);
        }
        if (disableContextMenu) {
            element.on('contextmenu', (event) => {
                event.preventDefault();
                event.stopPropagation();
            });
        }
        element.on('pointermove', (event) => {
            updatePosition(event.clientX, event.clientY, event.movementX, event.movementY);
        });
        element.on('pointerdown',  (event) => {
            event.preventDefault();
            event.stopPropagation();
            element.dom.setPointerCapture(event.pointerId);
            updateKey(event.button, Key.DOWN);
        });
        element.on('pointerup', (event) => {
            element.dom.releasePointerCapture(event.pointerId);
            updateKey(event.button, Key.UP);
        });
        element.on('pointerenter', () => { self.pointerInside = true; });
        element.on('pointerleave', () => { self.pointerInside = false; });
        element.on('wheel', (event) => {
            updatePosition(event.clientX, event.clientY, event.movementX, event.movementY);
            self._wheel = event.deltaY;
            self._wheelUpdated = true;
        });
        element.on('dragstart', (event) => { updateKey(event.button, Key.UP); });
        element.on('dblclick', (event) => { self._doubleClicked[event.button] = true; });
    }
    buttonPressed(button)       { return this.keys[button].pressed; }
    buttonDoubleClicked(button) { return this.doubleClicked[button] }
    buttonJustPressed(button)   { return this.keys[button].justPressed; }
    buttonJustReleased(button)  { return this.keys[button].justReleased; }
    insideDom() {
        return this.pointerInside;
    }
    update() {
        for (let i = 0; i < 5; i++) {
            if (this._keys[i].justPressed && this.keys[i].justPressed) this._keys[i].justPressed = false;
            if (this._keys[i].justReleased && this.keys[i].justReleased) this._keys[i].justReleased = false;
            this.keys[i].set(this._keys[i].justPressed, this._keys[i].pressed, this._keys[i].justReleased);
            if (this._doubleClicked[i] === true) {
                this.doubleClicked[i] = true;
                this._doubleClicked[i] = false;
            } else {
                this.doubleClicked[i] = false;
            }
        }
        if (this._wheelUpdated) {
            this.wheel = this._wheel;
            this._wheelUpdated = false;
        } else {
            this.wheel = 0;
        }
        if (this._positionUpdated) {
            this.delta.copy(this._delta);
            this.position.copy(this._position);
            this._delta.set(0,0);
            this._positionUpdated = false;
        } else {
            this.delta.x = 0;
            this.delta.y = 0;
        }
    }
}

class Object2D {
    constructor() {
        this.type = 'Object2D';
        this.uuid = MathUtils.randomUUID();
        this.children = [];
        this.parent = null;
        this.visible = true;
        this.layer = 0;
        this.level = 0;
        this.opacity = 1;
        this.globalOpacity = 1;
        this.position = new Vector2(0, 0);
        this.scale = new Vector2(1, 1);
        this.rotation = 0.0;
        this.origin = new Vector2(0, 0);
        this.matrix = new Matrix2();
        this.globalMatrix = new Matrix2();
        this.inverseGlobalMatrix = new Matrix2();
        this.matrixAutoUpdate = true;
        this.matrixNeedsUpdate = true;
        this.boundingBox = new Box2();
        this.masks = [];
        this.pointerEvents = true;
        this.draggable = false;
        this.focusable = true;
        this.selectable = true;
        this.pointerInside = false;
        this.inViewport = true;
        this.isSelected = false;
    }
    add(...objects) {
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        for (const object of objects) {
            const index = this.children.indexOf(object);
            if (index === -1) {
                object.parent = this;
                object.level = this.level + 1;
                object.traverse(function(child) {
                    if (typeof child.onAdd === 'function') child.onAdd(this);
                });
                this.children.push(object);
            }
        }
        return this;
    }
    remove(object) {
        const index = this.children.indexOf(object);
        if (index === -1) return undefined;
        const child = this.children[index];
        child.parent = null;
        child.level = 0;
        child.traverse(function(child) {
            if (typeof child.onRemove === 'function') child.onRemove(this);
        });
        this.children.splice(index, 1);
        return child;
    }
    getChildByUUID(uuid) {
        return this.getEntityByProperty('uuid', uuid);
    }
    getChildByProperty(property, value) {
        if (this[property] === value) return this;
        for (const child of this.children) {
            const object = child.getChildByProperty(property, value);
            if (object) return object;
        }
        return undefined;
    }
    traverse(callback) {
        if (typeof callback === 'function' && callback(this)) return true;
        for (const child of this.children) {
            if (child.traverse(callback)) return true;
        }
        return false;
    }
    destroy() {
        if (this.parent) this.parent.remove(this);
    }
    computeBoundingBox() {
        return this.boundingBox;
    }
    isInside(point) {
        return false;
    }
    isWorldPointInside(worldPoint, recursive = false) {
        const localPoint = this.inverseGlobalMatrix.transformPoint(worldPoint);
        if (this.isInside(localPoint)) return true;
        if (recursive) {
            for (const child of this.children) {
                if (child.isWorldPointInside(worldPoint, true)) return true;
            }
        }
        return false;
    }
    getWorldPointIntersections(worldPoint, list = []) {
        list = Array.isArray(list) ? list : [];
        const localPoint = this.inverseGlobalMatrix.transformPoint(worldPoint);
        if (this.isInside(localPoint)) list.push(this);
        for (const child of this.children) child.getWorldPointIntersections(worldPoint, list);
        return list;
    }
    getWorldBoundingBox() {
        const box = this.boundingBox;
        const topLeftWorld = this.globalMatrix.transformPoint(box.min);
        const topRightWorld = this.globalMatrix.transformPoint(new Vector2(box.max.x, box.min.y));
        const bottomLeftWorld = this.globalMatrix.transformPoint(new Vector2(box.min.x, box.max.y));
        const bottomRightWorld = this.globalMatrix.transformPoint(box.max);
        return new Box2().setFromPoints(topLeftWorld, topRightWorld, bottomLeftWorld, bottomRightWorld);
    }
    setPosition(x, y) {
        if (typeof x === 'object' && x.x && x.y) this.position.copy(x);
        else this.position.set(x, y);
        return this;
    }
    updateMatrix(force = false) {
        if (force || this.matrixAutoUpdate || this.matrixNeedsUpdate) {
            this.globalOpacity = this.opacity * ((this.parent) ? this.parent.globalOpacity : 1);
            this.matrix.compose(this.position.x, this.position.y, this.scale.x, this.scale.y, this.origin.x, this.origin.y, this.rotation);
            this.globalMatrix.copy(this.matrix);
            if (this.parent) this.globalMatrix.premultiply(this.parent.globalMatrix);
            this.inverseGlobalMatrix = this.globalMatrix.getInverse();
            this.matrixNeedsUpdate = false;
        }
    }
    transform(context, camera, canvas, renderer) {
        this.globalMatrix.tranformContext(context);
    }
    onPointerDrag(pointer, camera) {
        const pointerStart = pointer.position.clone();
        const pointerEnd = pointer.position.clone().sub(pointer.delta);
        const parent = this.parent ?? this;
        const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
        const localPositionStart = parent.inverseGlobalMatrix.transformPoint(worldPositionStart);
        const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
        const localPositionEnd = parent.inverseGlobalMatrix.transformPoint(worldPositionEnd);
        const delta = localPositionStart.clone().sub(localPositionEnd);
        const mouseSlopThreshold = 2;
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            this.dragStartPosition = pointer.position.clone();
        } else if (pointer.buttonPressed(Pointer.LEFT)) {
            const manhattanDistance = this.dragStartPosition.manhattanDistanceTo(pointerEnd);
            if (manhattanDistance >= mouseSlopThreshold) {
                this.position.add(delta);
                this.matrixNeedsUpdate = true;
            }
        }
    }
}

class Element {
    constructor(domElement) {
        if (domElement == null) {
            console.trace('Element.constructor: No HTMLElement provided!');
            domElement = document.createElement('div');
        }
        this.isElement = true;
        let dom = domElement;
        let suey = this;
        this.parent = undefined;
        this.children = [];
        this.contents = function() { return suey; };
        Object.defineProperties(this, {
            dom: {
                get: function() { return dom; },
                set: function(value) { dom = value; },
            },
            id: {
                configurable: true,
                get: function() { return dom.id; },
                set: function(value) { dom.id = value; },
            },
            name: {
                get: function() { return dom.name ?? '???'; },
                set: function(value) { dom.name = String(value); } ,
            },
        });
        Object.defineProperties(dom, {
            suey: {
                get: function() { return suey; },
            },
        });
    }
    setID(id) {
        this.id = id;
        return this;
    }
    add(...elements) {
        for (const element of elements) {
            addToParent(this.contents(), element);
        }
        return this;
    }
    addToSelf(...elements) {
        for (const element of elements) {
            addToParent(this, element);
        }
        return this;
    }
    clearContents() {
        destroyChildren(this.contents(), false );
        return this;
    }
    destroy() {
        destroyChildren(this, true );
        return this;
    }
    detach(...elements) {
        const removedElements = [];
        for (const element of elements) {
            let removed = removeFromParent(this.contents(), element, false );
            if (!removed) removed = removeFromParent(this, element, false );
            if (!removed) {  }
            removedElements.push(removed);
        }
        if (removedElements.length === 0) return undefined;
        if (removedElements.length === 1) return removedElements[0];
        return removedElements;
    }
    remove(...elements) {
        const removedElements = [];
        for (const element of elements) {
            let removed = removeFromParent(this.contents(), element, true );
            if (!removed) removed = removeFromParent(this, element, true );
            if (!removed) {  }
            removedElements.push(removed);
        }
        if (removedElements.length === 0) return undefined;
        if (removedElements.length === 1) return removedElements[0];
        return removedElements;
    }
    removeSelf() {
        this.destroy();
        const parent = this.parent ?? this.dom?.parentElement;
        removeFromParent(parent, this, false );
        return this;
    }
    setClass(...classNames) {
        this.dom.className = '';
        return this.addClass(...classNames);
    }
    addClass(...classNames) {
        for (const className of classNames) {
            if (className && typeof className === 'string' && className != '') {
                this.dom.classList.add(className);
            }
        }
        return this;
    }
    hasClass(className) {
        return this.dom.classList.contains(className);
    }
    hasClassWithString(substring) {
        substring = String(substring).toLowerCase();
        const classArray = [ ...this.dom.classList ];
        for (let i = 0; i < classArray.length; i++) {
            const className = classArray[i];
            if (className.toLowerCase().includes(substring)) return true;
        }
        return false;
    }
    removeClass(...classNames) {
        for (const className of classNames) {
            this.dom.classList.remove(className);
        }
        return this;
    }
    toggleClass(className) {
        if (className != null && typeof className === 'string' && className !== '') {
            if (this.hasClass(className)) this.removeClass(className);
            else this.addClass(className);
        }
        return this;
    }
    wantsClass(className, wants = true) {
        if (className && className != '') {
            if (wants) this.addClass(className);
            else this.removeClass(className);
        }
        return this;
    }
    setAttribute(attrib, value) {
        this.dom.setAttribute(attrib, value);
    }
    setDisabled(value = true) {
        if (value) this.addClass('suey-disabled');
        else this.removeClass('suey-disabled');
        this.dom.disabled = value;
        return this;
    }
    selectable(allowSelection) {
        if (allowSelection) this.removeClass('suey-unselectable');
        else this.addClass('suey-unselectable');
        return this;
    }
    hide(dispatchEvent = true) {
        if (this.isHidden()) return;
        if (dispatchEvent) this.dom.dispatchEvent(new Event('hidden'));
        this.addClass('suey-hidden');
        this.setStyle('display', 'none');
    }
    display(dispatchEvent = true) {
        if (this.isDisplayed() && this.hasClass('suey-hidden') === false) return;
        this.removeClass('suey-hidden');
        this.setStyle('display', '');
        if (dispatchEvent) this.dom.dispatchEvent(new Event('displayed'));
    }
    isDisplayed() {
        return getComputedStyle(this.dom).display != 'none';
    }
    isHidden() {
        return getComputedStyle(this.dom).display == 'none';
    }
    allowFocus() {
        this.dom.tabIndex = 0;
    }
    allowMouseFocus() {
        this.dom.tabIndex = -1;
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    setTextContent(value) {
        if (value != undefined) this.contents().dom.textContent = value;
        return this;
    }
    getTextContent() {
        return this.contents().dom.textContent;
    }
    setInnerText(value) {
        if (value != undefined) this.contents().dom.innerText = value;
        return this;
    }
    getInnerText() {
        return this.contents().dom.innerText;
    }
    setInnerHtml(value) {
        if (value === undefined || value === null) value = '';
        if (typeof this.contents().dom.setHTML === 'function') {
            this.contents().dom.setHTML(value);
        } else {
            this.contents().dom.innerHTML = value;
        }
        return this;
    }
    getInnerHtml() {
        return this.contents().dom.innerHTML;
    }
    setStyle() {
        for (let i = 0, l = arguments.length; i < l; i += 2) {
            const style = arguments[i];
            const value = arguments[i + 1];
            this.dom.style[style] = value;
        }
        return this;
    }
    setContentsStyle() {
        for (let i = 0, l = arguments.length; i < l; i += 2) {
            const style = arguments[i];
            const value = arguments[i + 1];
            this.contents().dom.style[style] = value;
        }
        return this;
    }
    setColor() {
        console.error(`${this.constructor.name}.setColor(): Method must be reimplemented from Element`);
        return this;
    }
    getLeft() {
        return this.dom.getBoundingClientRect().left;
    }
    getTop() {
        return this.dom.getBoundingClientRect().top;
    }
    getWidth() {
        return this.dom.getBoundingClientRect().width;
    }
    getHeight() {
        return this.dom.getBoundingClientRect().height;
    }
    getRelativePosition() {
        const rect = this.dom.getBoundingClientRect();
        let offsetParent = this.dom.offsetParent;
        while (offsetParent && getComputedStyle(offsetParent).position === 'static') {
            offsetParent = offsetParent.offsetParent;
        }
        if (!offsetParent) {
            return { left: rect.left, top: rect.top };
        }
        const parentRect = offsetParent.getBoundingClientRect();
        const relativeLeft = rect.left - parentRect.left;
        const relativeTop = rect.top - parentRect.top;
        return { left: relativeLeft, top: relativeTop };
    }
    traverse(callback, applyToSelf = true) {
        if (applyToSelf) callback(this);
        if (this.children) {
            for (const child of this.children) {
                child.traverse(callback, true);
            }
        }
    }
    traverseAncestors(callback, applyToSelf = true) {
        if (applyToSelf) callback(this);
        if (this.parent) this.parent.traverseAncestors(callback, true);
    }
    on(event, callback, options = {}) {
        if (typeof options !== 'object') options = {};
        if (typeof callback !== 'function') {
            console.warn(`Element.on(): No callback function provided for '${event}'`);
        } else {
            const eventName = event.toLowerCase();
            const eventHandler = callback.bind(this);
            const dom = this.dom;
            if (options.once || eventName === 'destroy') {
                options.once = true;
                dom.addEventListener(eventName, eventHandler, options);
            } else {
                dom.addEventListener(eventName, eventHandler, options);
                dom.addEventListener('destroy', () => dom.removeEventListener(eventName, eventHandler, options), { once: true });
            }
        }
        return this;
    }
}
function addToParent(parent, element) {
    if (!parent || !element) return;
    if (element.isElement) {
        if (parent.isElement && element.parent === parent) return;
        if (element.parent && element.parent.isElement) {
            removeFromParent(element.parent, element, false);
        }
    }
    const parentDom = parent.isElement ? parent.dom : parent;
    const elementDom = element.isElement ? element.dom : element;
    try { if (parentDom) parentDom.appendChild(elementDom); }
    catch (error) {  }
    if (element.isElement) {
        let hasIt = false;
        for (const child of parent.children) {
            if (child.dom.isSameNode(element.dom)) { hasIt = true; break; }
        }
        if (!hasIt) parent.children.push(element);
        element.parent = parent;
    }
    if (elementDom instanceof HTMLElement) {
        elementDom.dispatchEvent(new Event('parent-changed'));
    }
}
function destroyChildren(element, destroySelf = true) {
    if (!element) return;
    const dom = element.isElement ? element.dom : element;
    if (!(dom instanceof HTMLElement)) return;
    if (destroySelf) {
        if (!dom.wasDestroyed) {
            dom.dispatchEvent(new Event('destroy'));
            dom.wasDestroyed = true;
        }
    }
    for (let i = dom.children.length - 1; i >= 0; i--) {
        const child = dom.children[i];
        destroyChildren(child, true );
        try { dom.removeChild(child); } catch (error) {  }
    }
    if (dom.suey && dom.suey.isElement) dom.suey.children.length = 0;
}
function removeFromParent(parent, element, destroy = true) {
    if (!parent || !element) return undefined;
    if (destroy) destroyChildren(element, true );
    if (element.isElement && parent.isElement) {
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            if (child.dom.isSameNode(element.dom)) {
                parent.children.splice(i, 1);
                element.parent = undefined;
            }
        }
    }
    try {
        if (parent.isElement) parent = parent.dom;
        if (parent instanceof HTMLElement) {
            const removed = parent.removeChild(element.isElement ? element.dom : element);
            return (removed && removed.suey) ? removed.suey : removed;
        }
    } catch (error) {  }
}

class Keyboard {
    constructor(element) {
        if (!element || !element.isElement) {
            console.error(`Keyboard: No Suey Element was provided`);
            return;
        }
        const self = this;
        this._keys = {};
        this.keys = {};
        function updateKey(keyCode, action) {
            if (!(keyCode in self._keys)) {
            self._keys[keyCode] = new Key();
            self.keys[keyCode] = new Key();
            }
            self._keys[keyCode].update(action);
        }
        element.on('keydown', (event) => { updateKey(event.keyCode, Key.DOWN); });
        element.on('keyup', (event) => { updateKey(event.keyCode, Key.UP); });
    }
    keyPressed(keyCode) {
        return keyCode in this.keys && this.keys[keyCode].pressed;
    }
    keyJustPressed(keyCode) {
        return keyCode in this.keys && this.keys[keyCode].justPressed;
    }
    keyJustReleased(keyCode) {
        return keyCode in this.keys && this.keys[keyCode].justReleased;
    }
    update() {
        for (const keyCode in this._keys) {
            if (this._keys[keyCode].justPressed && this.keys[keyCode].justPressed) {
                this._keys[keyCode].justPressed = false;
            }
            if (this._keys[keyCode].justReleased && this.keys[keyCode].justReleased) {
                this._keys[keyCode].justReleased = false;
            }
            this.keys[keyCode].set(
                this._keys[keyCode].justPressed,
                this._keys[keyCode].pressed,
                this._keys[keyCode].justReleased
            );
        }
    }
}

class Viewport {
    constructor(context, camera) {
        const canvas = context.canvas;
        const topLeft = new Vector2(0, 0);
        const bottomRight = new Vector2(canvas.width, canvas.height);
        this.box = new Box2(topLeft, bottomRight);
    }
    intersectsBox(camera, box) {
        const topLeft = camera.matrix.transformPoint(box.min);
        const topRight = camera.matrix.transformPoint(new Vector2(box.max.x, box.min.y));
        const bottomLeft = camera.matrix.transformPoint(new Vector2(box.min.x, box.max.y));
        const bottomRight = camera.matrix.transformPoint(box.max);
        const actualBox = new Box2().setFromPoints(topLeft, topRight, bottomLeft, bottomRight);
        return this.box.intersectsBox(actualBox);
    }
}

class Renderer extends Element {
    constructor({
        alpha = true,
        disableContextMenu = true,
        imageSmoothingEnabled = true,
        imageSmoothingQuality = 'medium',
        globalCompositeOperation = 'source-over',
        width = 1000,
        height = 1000,
    } = {}) {
        const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        super(canvas);
        this.context = this.dom.getContext('2d', { alpha });
        this.context.imageSmoothingEnabled = imageSmoothingEnabled;
        this.context.imageSmoothingQuality = imageSmoothingQuality;
        this.context.globalCompositeOperation = globalCompositeOperation;
        this.pointer = new Pointer(this, disableContextMenu);
        this.keyboard = new Keyboard(this);
        this.autoClear = true;
        this.updatable = [ this.pointer, this.keyboard ];
        this.selection = [];
        const renderer = this;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                if (renderer.running) renderer.render();
            }
        });
        resizeObserver.observe(canvas);
        this.on('destroy', () => {
            resizeObserver.unobserve(canvas);
        });
        this.running = false;
        this.frame = -1;
        this.scene = null;
        this.camera = null;
        this.beingDragged = null;
    }
    get width() { return this.dom.width; }
    set width(x) { this.dom.width = x; }
    get height() { return this.dom.height; }
    set height(y) { this.dom.height = y; }
    ratio() {
        const rect = this.dom.getBoundingClientRect();
        return ((this.width / this.height) / (rect.width / rect.height));
    }
    onUpdate(object) {
        if (this.updatable.includes(object) === false) {
            this.updatable.push(object);
        }
    }
    start(scene, camera) {
        if (this.running) return;
        this.running = true;
        const renderer = this;
        function loop() {
            for (const object of renderer.updatable) {
                if (typeof object.update === 'function') object.update();
            }
            camera.updateMatrix(renderer.width / 2.0, renderer.height / 2.0);
            renderer.render(scene, camera);
            if (renderer.running) renderer.frame = requestAnimationFrame(loop);
        }
        loop();
    }
    stop() {
        this.running = false;
        cancelAnimationFrame(this.frame);
    }
    render(scene, camera) {
        if (scene) this.scene = scene; else scene = this.scene;
        if (camera) this.camera = camera; else camera = this.camera;
        if (!scene || !camera) return;
        const pointer = this.pointer;
        const context = this.context;
        const objects = [];
        scene.traverse(function(child) { if (child.visible) objects.push(child); });
        objects.sort(function(a, b) {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });
        const viewport = new Viewport(context, camera);
        const isVisible = {};
        for (const object of objects) {
            isVisible[object.uuid] = viewport.intersectsBox(camera, object.getWorldBoundingBox());
        }
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            for (const object of this.selection) object.isSelected = false;
            this.selection = [];
            const selectedObjects = scene.getWorldPointIntersections(cameraPoint);
            if (selectedObjects.length > 0) {
                for (const object of selectedObjects) {
                    if (object.selectable) {
                        object.isSelected = true;
                        this.selection.push(object);
                    }
                }
            }
        }
        let currentCursor = null;
        for (const object of objects) {
            if (object.pointerEvents && isVisible[object.uuid]) {
                const localPoint = object.inverseGlobalMatrix.transformPoint(cameraPoint);
                const isInside = object.isInside(localPoint);
                if (!currentCursor && (isInside || this.beingDragged === object) && object.cursor) {
                    if (typeof object.cursor === 'function') currentCursor = object.cursor(camera);
                    else currentCursor = object.cursor;
                }
                if (isInside) {
                    if (this.beingDragged == null) {
                        if (!object.pointerInside && typeof object.onPointerEnter === 'function') object.onPointerEnter(pointer, camera);
                        if (typeof object.onPointerOver === 'function') object.onPointerOver(pointer, camera);
                        if (pointer.buttonDoubleClicked(Pointer.LEFT) && typeof object.onDoubleClick === 'function') object.onDoubleClick(pointer, camera);
                        if (pointer.buttonPressed(Pointer.LEFT) && typeof object.onButtonPressed === 'function') object.onButtonPressed(pointer, camera);
                        if (pointer.buttonJustReleased(Pointer.LEFT) && typeof object.onButtonUp === 'function') object.onButtonUp(pointer, camera);
                        if (pointer.buttonJustPressed(Pointer.LEFT)) {
                            if (typeof object.onButtonDown === 'function') object.onButtonDown(pointer, camera);
                            if (object.draggable) {
                                this.beingDragged = object;
                                if (typeof object.onPointerDragStart === 'function') object.onPointerDragStart(pointer, camera);
                            }
                        }
                    }
                    object.pointerInside = true;
                } else if (this.beingDragged !== object && object.pointerInside) {
                    if (typeof object.onPointerLeave === 'function') object.onPointerLeave(pointer, camera);
                    object.pointerInside = false;
                }
            }
            if (this.beingDragged === object) {
                if (pointer.buttonJustReleased(Pointer.LEFT)) {
                    if (object.pointerEvents && typeof object.onPointerDragEnd === 'function') {
                        object.onPointerDragEnd(pointer, camera);
                    }
                    this.beingDragged = null;
                } else if (object.pointerEvents && typeof object.onPointerDrag === 'function') {
                    object.onPointerDrag(pointer, camera);
                }
            }
        }
        document.body.style.cursor = currentCursor ?? 'default';
        scene.traverse(function(child) {
            child.updateMatrix();
            if (typeof child.onUpdate === 'function') child.onUpdate(context, camera);
        });
        context.setTransform(1, 0, 0, 1, 0, 0);
        if (this.autoClear) context.clearRect(0, 0, this.width, this.height);
        for (let i = objects.length - 1; i >= 0; i--) {
            const object = objects[i];
            if (object.isMask) continue;
            if (isVisible[object.uuid] !== true) {
                continue;
            }
            for (const mask of object.masks) {
                camera.matrix.setContextTransform(context);
                mask.transform(context, camera, this.dom, this);
                mask.clip(context, camera, this.dom);
            }
            camera.matrix.setContextTransform(context);
            object.transform(context, camera, this.dom, this);
            context.globalAlpha = object.globalOpacity;
            if (typeof object.style === 'function') object.style(context, camera, this.dom, this);
            if (typeof object.draw === 'function') object.draw(context, camera, this.dom, this);
            if (object.isSelected) {
                camera.matrix.setContextTransform(context);
                context.globalAlpha = 1;
                context.strokeStyle = '#00aacc';
                context.lineWidth = 2 / camera.scale;
                const box = object.boundingBox;
                const topLeft = object.globalMatrix.transformPoint(box.min);
                const topRight = object.globalMatrix.transformPoint(new Vector2(box.max.x, box.min.y));
                const bottomLeft = object.globalMatrix.transformPoint(new Vector2(box.min.x, box.max.y));
                const bottomRight = object.globalMatrix.transformPoint(box.max);
                context.beginPath();
                context.moveTo(topLeft.x, topLeft.y);
                context.lineTo(topRight.x, topRight.y);
                context.lineTo(bottomRight.x, bottomRight.y);
                context.lineTo(bottomLeft.x, bottomLeft.y);
                context.closePath();
                context.stroke();
            }
        }
    }
}

class CameraControls {
    constructor(renderer, camera) {
        const self = this;
        this.renderer = renderer;
        this.camera = camera;
        this.allowDrag = true;
        this.allowScale = true;
        this.allowRotation = true;
        this.dragButton = Pointer.RIGHT;
        this.rotateButton = Pointer.MIDDLE;
        this.rotationPoint = new Vector2(0, 0);
        this.rotationInitial = 0;
        renderer.on('dblclick', (event) => {
            if (!renderer.scene || !renderer.camera) return;
            const point = new Vector2(event.clientX, event.clientY);
            const worldPoint = renderer.camera.inverseMatrix.transformPoint(point);
            const objects = renderer.scene.getWorldPointIntersections(worldPoint);
            for (const object of objects) if (object.focusable) return self.focusCamera(object, false );
            return self.focusCamera(renderer.scene, true );
        });
    }
    update() {
        const camera = this.camera;
        const pointer = this.renderer.pointer;
        if (this.allowScale && pointer.wheel !== 0) {
            const scaleFactor = pointer.wheel * 0.001 * camera.scale;
            const pointerPos = camera.inverseMatrix.transformPoint(pointer.position);
            camera.scale -= scaleFactor;
            camera.position.add(pointerPos.multiplyScalar(scaleFactor));
            camera.matrixNeedsUpdate = true;
        }
        if (this.allowRotation) {
            if (pointer.buttonJustPressed(this.rotateButton)) {
                this.rotationPoint.copy(pointer.position);
                this.rotationInitial = camera.rotation;
            } else if (pointer.buttonPressed(this.rotateButton)) {
                const point = pointer.position.clone().sub(this.rotationPoint);
                camera.rotation = this.rotationInitial + (point.x * 0.01);
                camera.matrixNeedsUpdate = true;
            }
        }
        if (this.allowDrag && pointer.buttonPressed(this.dragButton)) {
            const currentPointerPos = camera.inverseMatrix.transformPoint(pointer.position.clone());
            const lastPointerPos = camera.inverseMatrix.transformPoint(pointer.position.clone().sub(pointer.delta));
            const delta = currentPointerPos.clone().sub(lastPointerPos).multiplyScalar(camera.scale);
            camera.position.add(delta);
            camera.matrixNeedsUpdate = true;
        }
    }
    focusCamera(object, isScene = false, animationDuration = 200 ) {
        const renderer = this.renderer;
        let targetScale, targetPosition;
        if (isScene) {
            const sceneBounds = new Box2();
            object.traverse((child) => { sceneBounds.union(child.getWorldBoundingBox()); });
            targetScale = 0.5 * Math.min(renderer.width / sceneBounds.getSize().x, renderer.height / sceneBounds.getSize().y);
            targetPosition = sceneBounds.getCenter();
            targetPosition.multiplyScalar(-targetScale);
            targetPosition.add(new Vector2(renderer.width / 2.0, renderer.height / 2.0));
        } else {
            const worldBox = object.getWorldBoundingBox();
            const worldSize = worldBox.getSize();
            const worldCenter = worldBox.getCenter();
            targetScale = 0.1 * Math.min(renderer.width / worldSize.x, renderer.height / worldSize.y);
            targetPosition = worldCenter;
            targetPosition.multiplyScalar(-targetScale);
            targetPosition.add(new Vector2(renderer.width / 2.0, renderer.height / 2.0));
        }
        targetScale = Math.abs(targetScale);
        const camera = renderer.camera;
        const startTime = performance.now();
        const startPosition = camera.position.clone();
        const startScale = camera.scale;
        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / animationDuration, 1);
            camera.lerpPosition(startPosition, targetPosition, t);
            camera.scale = startScale + (targetScale - startScale) * t;
            if (t < 1) requestAnimationFrame(animate);
        };
        animate();
    }
}

class DragControls {
    constructor(renderer) {
        this.renderer = renderer;
    }
    update() {
    }
}

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
                if (computedColor && typeof computedColor === 'string' && computedColor !== '') return `rgb(${computedColor})`;
                else return '#ffffff';
            }
        }
        return color;
    }
    constructor() {
        this.cache = null;
        this.needsUpdate = true;
    }
    get(context) {}
}

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

let count = 0;
class Box extends Object2D {
    constructor() {
        super();
        this.type = 'Box';
        this.box = new Box2(new Vector2(-50, -50), new Vector2(50, 50));
        this.fillStyle = new ColorStyle('#FFFFFF');
        this.strokeStyle = new ColorStyle('#000000');
        this.lineWidth = 1;
        this.constantWidth = false;
        this._box = new Box2();
    }
    computeBoundingBox() {
        this.boundingBox.copy(this.box);
    }
    isInside(point) {
        return this.box.containsPoint(point);
    }
    draw(context, camera, canvas) {
        const width = this.box.max.x - this.box.min.x;
        const height = this.box.max.y - this.box.min.y;
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fillRect(this.box.min.x, this.box.min.y, width, height);
        }
        if (this.strokeStyle) {
            let scaleX = 1;
            let scaleY = 1;
            if (this.constantWidth) {
                const matrix = context.getTransform();
                scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
                scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            }
            context.lineWidth = this.lineWidth / Math.max(scaleX, scaleY);
            context.strokeStyle = this.strokeStyle.get(context);
            context.strokeRect(this.box.min.x, this.box.min.y, width, height);
        }
    }
    onUpdate(context, camera) {
        if (this.box.equals(this._box) === false) {
            this.computeBoundingBox();
            this._box.copy(this.box);
        }
    }
}

class Circle extends Object2D {
    constructor() {
        super();
        this.type = 'Circle';
        this.fillStyle = new ColorStyle('#FFFFFF');
        this.strokeStyle = new ColorStyle('#000000');
        this.lineWidth = 1;
        this.constantWidth = false;
        this._radius = 10.0;
    }
    get radius() { return this._radius; }
    set radius(value) {
        this._radius = value;
        this.computeBoundingBox();
    }
    computeBoundingBox() {
        this.boundingBox.min.set(-this._radius, -this._radius);
        this.boundingBox.max.set(+this._radius, +this._radius);
    }
    isInside(point) {
        return point.length() <= this._radius;
    }
    draw(context, camera, canvas) {
        context.beginPath();
        context.arc(0, 0, this._radius, 0, 2 * Math.PI);
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fill();
        }
        if (this.strokeStyle) {
            let scaleX = 1;
            let scaleY = 1;
            if (this.constantWidth) {
                const matrix = context.getTransform();
                scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
                scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            }
            context.lineWidth = this.lineWidth / Math.max(scaleX, scaleY);
            context.strokeStyle = this.strokeStyle.get(context);
            context.stroke();
        }
    }
}

class Line extends Object2D {
    constructor() {
        super();
        this.type = 'Line';
        this.from = new Vector2();
        this.to = new Vector2();
        this.strokeStyle = new ColorStyle('#ffffff');
        this.lineWidth = 5;
        this.constantWidth = false;
        this.mouseBuffer = 5;
        this.dashPattern = [];
        this.scaledLineWidth = this.lineWidth;
        this._from = new Vector2();
        this._to = new Vector2();
    }
    computeBoundingBox() {
        this.boundingBox.setFromPoints(this.from, this.to);
    }
    isInside(point) {
        const x = point.x;
        const y = point.y;
        const x1 = this.from.x;
        const y1 = this.from.y;
        const x2 = this.to.x;
        const y2 = this.to.y;
        const buffer = (this.scaledLineWidth / 2) + this.mouseBuffer;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        if (lengthSquared === 0) {
            return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)) <= buffer;
        }
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
        let scaleX = 1;
        let scaleY = 1;
        if (this.constantWidth) {
            const matrix = context.getTransform();
            scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
            scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            this.scaledLineWidth = this.lineWidth / Math.max(scaleX, scaleY);
        } else {
            this.scaledLineWidth = this.lineWidth;
        }
        context.lineWidth = this.scaledLineWidth;
        context.strokeStyle = this.strokeStyle.get(context);
        context.setLineDash(this.dashPattern);
    }
    draw(context, camera, canvas) {
        context.beginPath();
        context.moveTo(this.from.x, this.from.y);
        context.lineTo(this.to.x, this.to.y);
        context.stroke();
    }
    onUpdate(context, camera) {
        if ((this.from.equals(this._from) === false) || (this.to.equals(this._to) === false)) {
            this.computeBoundingBox();
            this._from.copy(this.from);
            this._to.copy(this.to);
        }
    }
}

class GradientColorStop {
    constructor(offset, color) {
        this.offset = offset;
        this.color = color;
    }
}

class GradientStyle extends Style {
    constructor() {
        super();
        this.colors = [];
    }
    addColorStop(offset, color) {
        this.colors.push(new GradientColorStop(offset, color));
    }
}

class LinearGradientStyle extends GradientStyle {
    constructor() {
        super();
        this.start = new Vector2(-100, 0);
        this.end = new Vector2(100, 0);
    }
    get(context) {
        if (this.needsUpdate || this.cache == null) {
            const style = context.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
            for (const colorStop of this.colors) {
                const finalColor = Style.extractColor(colorStop.color, context);
                style.addColorStop(colorStop.offset, finalColor);
            }
            this.cache = style;
            this.needsUpdate = false;
        }
        return this.cache;
    }
}

const CURSOR_ROTATE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij48cGF0aCBkPSJNMjEuMjQ3LDUuODY3YzAuNDE3LC0wLjQ1MiAxLjAzNiwtMC42NjYgMS42NDcsLTAuNTYzYzAuNjQ0LDAuMTA5IDEuMTgsMC41NTMgMS40MDcsMS4xNjRsMS44MjQsNC45MDFjMC4yMjcsMC42MTEgMC4xMTEsMS4yOTggLTAuMzA1LDEuODAxYy0wLjQxNiwwLjUwMyAtMS4wNjksMC43NDUgLTEuNzEzLDAuNjM2bC01LjE1NCwtMC44NzRjLTAuNjQ0LC0wLjEwOSAtMS4xOCwtMC41NTMgLTEuNDA3LC0xLjE2NWMtMC4xNzksLTAuNDgxIC0wLjE0NSwtMS4wMDggMC4wOCwtMS40NTVjLTAuNTIxLC0wLjE0OCAtMS4wNjQsLTAuMjI1IC0xLjYxNSwtMC4yMjVjLTMuMjY0LDAgLTUuOTEzLDIuNjUgLTUuOTEzLDUuOTEzYy0wLDMuMjYzIDIuNjQ5LDUuOTEzIDUuOTEzLDUuOTEzYzEuNjQsMCAzLjIwNiwtMC42ODEgNC4zMjQsLTEuODhjMC42ODgsLTAuNzM4IDEuODQ0LC0wLjc3OCAyLjU4MiwtMC4wOWwxLjM0NiwxLjI1NWMwLjczNywwLjY4OCAwLjc3OCwxLjg0MyAwLjA5LDIuNTgxYy0yLjE1OCwyLjMxNCAtNS4xNzksMy42MjcgLTguMzQyLDMuNjI3Yy02LjI5NSwwIC0xMS40MDYsLTUuMTExIC0xMS40MDYsLTExLjQwNmMtMCwtNi4yOTUgNS4xMTEsLTExLjQwNiAxMS40MDYsLTExLjQwNmMxLjgzOCwtMCAzLjYzMSwwLjQ0MyA1LjIzNiwxLjI3M1oiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHBhdGggZD0iTTE5LjgzNSw5Ljc2N2wtMC45MDUsMS4wOTNjLTAuMDk3LDAuMTE3IC0wLjEyNCwwLjI3NyAtMC4wNzEsMC40MTljMC4wNTMsMC4xNDMgMC4xNzgsMC4yNDYgMC4zMjgsMC4yNzJsNS4xNTQsMC44NzRjMC4xNTEsMC4wMjYgMC4zMDMsLTAuMDMxIDAuNCwtMC4xNDhjMC4wOTcsLTAuMTE3IDAuMTI0LC0wLjI3NyAwLjA3MSwtMC40MmwtMS44MjMsLTQuOWMtMC4wNTMsLTAuMTQzIC0wLjE3OCwtMC4yNDYgLTAuMzI4LC0wLjI3MWMtMC4xNSwtMC4wMjYgLTAuMzAyLDAuMDMxIC0wLjM5OSwwLjE0OGwtMC42OTksMC44NDRjLTEuNjMyLC0xLjA5MSAtMy41NjIsLTEuNjgzIC01LjU1MiwtMS42ODNjLTUuNTIyLC0wIC0xMC4wMDYsNC40ODMgLTEwLjAwNiwxMC4wMDVjMCw1LjUyMiA0LjQ4NCwxMC4wMDUgMTAuMDA2LDEwLjAwNWMyLjc3NSwwIDUuNDI1LC0xLjE1MiA3LjMxNywtMy4xODFjMC4xNjEsLTAuMTcyIDAuMTUxLC0wLjQ0MiAtMC4wMjEsLTAuNjAybC0xLjM0NSwtMS4yNTVjLTAuMTcyLC0wLjE2IC0wLjQ0MiwtMC4xNTEgLTAuNjAyLDAuMDIxYy0xLjM4MywxLjQ4MyAtMy4zMjEsMi4zMjYgLTUuMzQ5LDIuMzI2Yy00LjAzNywtMCAtNy4zMTQsLTMuMjc3IC03LjMxNCwtNy4zMTRjMCwtNC4wMzcgMy4yNzcsLTcuMzE0IDcuMzE0LC03LjMxNGMxLjM2LDAgMi42ODIsMC4zNzkgMy44MjQsMS4wODFaIi8+PC9zdmc+';
class ResizeTool {
    static ALL = 0;
    static RESIZE = 1;
    static ROTATE = 2;
    constructor(object, scene, tools = ResizeTool.ALL, radius = 5) {
        if (!object || !scene) return console.warn(`ResizeTool(): Object or scene missing from argument list`);
        if (!object.boundingBox) return console.warn(`ResizeTool(): Object missing 'boundingBox' property`);
        function localDelta(pointer, camera) {
            const pointerStart = pointer.position.clone();
            const pointerEnd = pointer.position.clone().sub(pointer.delta);
            const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
            const localPositionStart = object.inverseGlobalMatrix.transformPoint(worldPositionStart);
            const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
            const localPositionEnd = object.inverseGlobalMatrix.transformPoint(worldPositionEnd);
            const delta = localPositionStart.clone().sub(localPositionEnd).multiply(object.scale);
            return delta;
        }
        const resizerContainer = new Object2D();
        resizerContainer.draggable = false;
        resizerContainer.focusable = false;
        resizerContainer.selectable = false;
        resizerContainer.pointerEvents = false;
        resizerContainer.layer = object.layer + 1;
        scene.add(resizerContainer);
        let topLeft, topRight, bottomLeft, bottomRight;
        let topResizer, rightResizer, bottomResizer, leftResizer;
        let rotater, rotateLine;
        if (tools === ResizeTool.ALL || tools === ResizeTool.RESIZE) {
            function createResizer(x, y, type = 'box', addRotation, alpha) {
                let resizer;
                switch (type) {
                    case 'circle':
                        resizer = new Circle();
                        resizer.radius = radius;
                        break;
                    case 'line':
                        resizer = new Line();
                        resizer.mouseBuffer = radius;
                        break;
                    case 'box':
                    default:
                        resizer = new Box();
                        resizer.box.set(new Vector2(-radius, -radius), new Vector2(radius, radius));
                }
                resizer.draggable = true;
                resizer.focusable = false;
                resizer.selectable = false;
                resizer.layer = object.layer + 1;
                resizer.opacity = alpha;
                resizer.constantWidth = true;
                switch (type) {
                    case 'box':
                    case 'circle':
                        resizer.fillStyle = new LinearGradientStyle();
                        resizer.fillStyle.start.set(-radius, -radius);
                        resizer.fillStyle.end.set(radius, radius);
                        resizer.fillStyle.addColorStop(0, '--icon-light');
                        resizer.fillStyle.addColorStop(1, '--icon-dark');
                        resizer.strokeStyle.color = '--highlight';
                        break;
                    case 'line':
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = 1;
                        break;
                }
                resizer.cursor = function(camera) {
                    const cursorStyles = [
                        { angle:   0, cursor: 'ew-resize' },
                        { angle:  45, cursor: 'nwse-resize' },
                        { angle:  90, cursor: 'ns-resize' },
                        { angle: 135, cursor: 'nesw-resize' },
                        { angle: 180, cursor: 'ew-resize' },
                        { angle: 225, cursor: 'nwse-resize' },
                        { angle: 270, cursor: 'ns-resize' },
                        { angle: 315, cursor: 'nesw-resize' },
                        { angle: 360, cursor: 'ew-resize' },
                    ];
                    let localScale =  object.globalMatrix.getScale();
                    let localRotation = object.globalMatrix.getRotation();
                    if (localScale.x < 0 && localScale.y > 0 || localScale.x > 0 && localScale.y < 0) {
                        localRotation -= (addRotation * (Math.PI / 180));
                    } else {
                        localRotation += (addRotation * (Math.PI / 180));
                    }
                    const rotation = (localRotation + camera.rotation) * 180 / Math.PI;
                    const normalizedRotation = (rotation + 720) % 360;
                    let closestCursor = 'default';
                    let minAngleDiff = Infinity;
                    for (const { angle, cursor } of cursorStyles) {
                        const angleDiff = Math.abs(normalizedRotation - angle);
                        if (angleDiff < minAngleDiff) {
                            minAngleDiff = angleDiff;
                            closestCursor = cursor;
                        }
                    }
                    return closestCursor;
                };
                resizer.onPointerDrag = function(pointer, camera) {
                    Object2D.prototype.onPointerDrag.call(this, pointer, camera);
                    const delta = localDelta(pointer, camera);
                    if (x === 0) delta.x = 0;
                    if (y === 0) delta.y = 0;
                    delta.multiplyScalar(0.5);
                    const size = object.boundingBox.getSize();
                    const scaleX = (x === 0) ? 0 : 2 / size.x;
                    const scaleY = (y === 0) ? 0 : 2 / size.y;
                    const scale = new Vector2(scaleX, scaleY);
                    const rotationMatrix = new Matrix2().rotate(object.rotation);
                    const rotatedDelta = rotationMatrix.transformPoint(delta);
                    object.position.add(rotatedDelta);
                    object.scale.sub(delta.multiply(x, y).multiply(scale));
                    object.matrixNeedsUpdate = true;
                };
                resizerContainer.add(resizer);
                return resizer;
            }
            bottomRight = createResizer(-1, -1, 'box', 45, 1);
            bottomLeft = createResizer(1, -1, 'box', 135, 1);
            topLeft = createResizer(1, 1, 'box', 225, 1);
            topRight = createResizer(-1, 1, 'box', 315, 1);
            rightResizer = createResizer(-1, 0, 'line', 0, 1);
            bottomResizer = createResizer(0, -1, 'line', 90, 1);
            leftResizer = createResizer(1, 0, 'line', 180, 1);
            topResizer = createResizer(0, 1, 'line', 270, 1);
        }
        if (tools === ResizeTool.ALL || tools === ResizeTool.ROTATE) {
            rotater = new Circle();
            rotater.draggable = true;
            rotater.focusable = false;
            rotater.selectable = false;
            rotater.radius = radius + 1;
            rotater.layer = object.layer + 1;
            rotater.constantWidth = true;
            rotater.fillStyle = new LinearGradientStyle();
            rotater.fillStyle.start.set(-radius, -radius);
            rotater.fillStyle.end.set(radius, radius);
            rotater.fillStyle.addColorStop(0, '--icon-light');
            rotater.fillStyle.addColorStop(1, '--icon-dark');
            rotater.strokeStyle.color = '--highlight';
            rotater.cursor = `url('${CURSOR_ROTATE}') 16 16, auto`;
            rotater.onPointerDrag = function(pointer, camera) {
                const objectCenter = object.boundingBox.getCenter();
                const pointerStart = pointer.position.clone();
                const pointerEnd = pointer.position.clone().sub(pointer.delta);
                const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
                const localPositionStart = object.inverseGlobalMatrix.transformPoint(worldPositionStart);
                const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
                const localPositionEnd = object.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                localPositionStart.sub(objectCenter).multiply(object.scale);
                localPositionEnd.sub(objectCenter).multiply(object.scale);
                const angle = localPositionEnd.angleBetween(localPositionStart);
                const cross = localPositionEnd.cross(localPositionStart);
                const sign = Math.sign(cross);
                object.rotation += (angle * sign);
                object.updateMatrix(true);
            };
            rotateLine = new Line();
            rotateLine.lineWidth = 1;
            rotateLine.draggable = false;
            rotateLine.focusable = false;
            rotateLine.selectable = false;
            rotateLine.layer = object.layer + 1;
            rotateLine.constantWidth = true;
            rotateLine.strokeStyle.color = '--highlight';
            resizerContainer.add(rotater, rotateLine);
        }
        resizerContainer.onUpdate = function(context, camera) {
            const box = object.boundingBox;
            const center = box.getCenter();
            const handleOffset = ((radius * 4) / Math.abs(object.scale.y)) / camera.scale;
            const topCenterWorld = object.globalMatrix.transformPoint(center.x, box.min.y);
            const topCenterWorldOffset = object.globalMatrix.transformPoint(center.x, box.min.y - handleOffset);
            if (rotater) {
                rotater.position.copy(topCenterWorldOffset);
                rotater.scale.set(1 / camera.scale, 1 / camera.scale);
                rotater.updateMatrix();
            }
            if (rotateLine) {
                rotateLine.from.copy(topCenterWorldOffset);
                rotateLine.to.copy(topCenterWorld);
                rotateLine.updateMatrix();
            }
            const topLeftWorld = object.globalMatrix.transformPoint(box.min);
            const topRightWorld = object.globalMatrix.transformPoint(new Vector2(box.max.x, box.min.y));
            const bottomLeftWorld = object.globalMatrix.transformPoint(new Vector2(box.min.x, box.max.y));
            const bottomRightWorld = object.globalMatrix.transformPoint(box.max);
            function updateCornerResizer(resizer, point) {
                resizer.position.copy(point);
                resizer.scale.set(1 / camera.scale, 1 / camera.scale);
                resizer.rotation = object.rotation;
                resizer.updateMatrix();
            }
            if (topLeft) updateCornerResizer(topLeft, topLeftWorld);
            if (topRight) updateCornerResizer(topRight, topRightWorld);
            if (bottomLeft) updateCornerResizer(bottomLeft, bottomLeftWorld);
            if (bottomRight) updateCornerResizer(bottomRight, bottomRightWorld);
            const leftMiddleWorld = object.globalMatrix.transformPoint(new Vector2(box.min.x, center.y));
            const rightMiddleWorld = object.globalMatrix.transformPoint(new Vector2(box.max.x, center.y));
            const topMiddleWorld = object.globalMatrix.transformPoint(new Vector2(center.x, box.min.y));
            const bottomMiddleWorld = object.globalMatrix.transformPoint(new Vector2(center.x, box.max.y));
            const halfWidth = object.boundingBox.getSize().x / 2 * Math.abs(object.scale.x);
            const halfHeight = object.boundingBox.getSize().y / 2 * Math.abs(object.scale.y);
            if (leftResizer) {
                leftResizer.position.copy(leftMiddleWorld);
                leftResizer.rotation = object.rotation;
                if (leftResizer.type === 'Box') {
                    leftResizer.scale.set(1 / camera.scale, 1);
                    leftResizer.box.set(new Vector2(-radius, -halfHeight), new Vector2(radius, halfHeight));
                }
                if (leftResizer.type === 'Line') {
                    leftResizer.mouseBuffer = radius / camera.scale;
                    leftResizer.from.set(0, -halfHeight);
                    leftResizer.to.set(0, +halfHeight);
                }
                leftResizer.updateMatrix();
            }
            if (rightResizer) {
                rightResizer.position.copy(rightMiddleWorld);
                rightResizer.rotation = object.rotation;
                if (rightResizer.type === 'Box') {
                    rightResizer.scale.set(1 / camera.scale, 1);
                    rightResizer.box.set(new Vector2(-radius, -halfHeight), new Vector2(radius, halfHeight));
                }
                if (rightResizer.type === 'Line') {
                    rightResizer.mouseBuffer = radius / camera.scale;
                    rightResizer.from.set(0, -halfHeight);
                    rightResizer.to.set(0, +halfHeight);
                }
                rightResizer.updateMatrix();
            }
            if (topResizer) {
                topResizer.position.copy(topMiddleWorld);
                topResizer.rotation = object.rotation;
                if (topResizer.type === 'Box') {
                    topResizer.scale.set(1, 1 / camera.scale);
                    topResizer.box.set(new Vector2(-halfWidth, -radius), new Vector2(halfWidth, radius));
                }
                if (topResizer.type === 'Line') {
                    topResizer.mouseBuffer = radius / camera.scale;
                    topResizer.from.set(-halfWidth, 0);
                    topResizer.to.set(+halfWidth, 0);
                }
                topResizer.updateMatrix();
            }
            if (bottomResizer) {
                bottomResizer.position.copy(bottomMiddleWorld);
                bottomResizer.rotation = object.rotation;
                if (bottomResizer.type === 'Box') {
                    bottomResizer.scale.set(1, 1 / camera.scale);
                    bottomResizer.box.set(new Vector2(-halfWidth, -radius), new Vector2(halfWidth, radius));
                }
                if (bottomResizer.type === 'Line') {
                    bottomResizer.mouseBuffer = radius / camera.scale;
                    bottomResizer.from.set(-halfWidth, 0);
                    bottomResizer.to.set(+halfWidth, 0);
                }
                bottomResizer.updateMatrix();
            }
        };
    }
}

class Text extends Object2D {
    constructor(text = '', font = '16px Arial') {
        super();
        this.type = 'Text';
        this.text = text;
        this.font = font;
        this.strokeStyle = null;
        this.lineWidth = 1;
        this.fillStyle = new ColorStyle('#000000');
        this.textAlign = 'center';
        this.textBaseline = 'middle';
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

class Mask extends Object2D {
    constructor() {
        super();
        this.isMask = true;
        this.type = 'Mask';
    }
    clip(context, camera, canvas) {
    }
}

class BoxMask extends Mask {
    constructor() {
        super();
        this.type = 'BoxMask';
        this.box = new Box2(new Vector2(-50, -35), new Vector2(50, 35));
        this.invert = false;
    }
    isInside(point) {
        return this.box.containsPoint(point);
    }
    clip(context, camera, canvas) {
        context.beginPath();
        const width = this.box.max.x - this.box.min.x;
        if (this.invert) {
            context.rect(this.box.min.x - 1e4, -5e3, 1e4, 1e4);
            context.rect(this.box.max.x, -5e3, 1e4, 1e4);
            context.rect(this.box.min.x, this.box.min.y - 1e4, width, 1e4);
            context.rect(this.box.min.x, this.box.max.y, width, 1e4);
        } else {
            const height = this.box.max.y - this.box.min.y;
            context.fillRect(this.box.min.x, this.box.min.y, width, height);
        }
        context.clip();
    }
}

class RadialGradientStyle extends GradientStyle {
    constructor() {
        super();
        this.start = new Vector2(0, 0);
        this.startRadius = 10;
        this.end = new Vector2(0, 0);
        this.endRadius = 50;
    }
    get(context) {
        if (this.needsUpdate || this.cache == null) {
            const style = context.createRadialGradient(this.start.x, this.start.y, this.startRadius, this.end.x, this.end.y, this.endRadius);
            for (const colorStop of this.colors) {
                style.addColorStop(colorStop.offset, colorStop.color);
            }
            this.cache = style;
            this.needsUpdate = false;
        }
        return this.cache;
    }
}

export { Box, Box2, BoxMask, Camera2D, CameraControls, Circle, ColorStyle, DragControls, GradientColorStop, GradientStyle, Key, Keyboard, Line, LinearGradientStyle, Mask, Matrix2, Object2D, Pointer, RadialGradientStyle, Renderer, ResizeTool, Style, Text, Vector2, Viewport };
