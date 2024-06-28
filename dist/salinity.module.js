/**
 * @description Salinity Engine
 * @about       Interactive, easy to use JavaScript game framework.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.7
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine/engine
 */
var name = "@salinity/engine";
var version = "0.0.7";
var description = "Interactive, easy to use JavaScript game framework.";
var module = "src/Salinity.js";
var main = "dist/salinity.module.js";
var type = "module";
var scripts = {
	build: "rollup -c",
	prepublishOnly: "npm run build"
};
var files = [
	"dist/*",
	"files/*",
	"src/*"
];
var keywords = [
	"salinity",
	"game",
	"engine",
	"webgl",
	"javascript",
	"graphics",
	"framework",
	"canvas"
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
const MOUSE_CLICK_TIME = 350;
const MOUSE_DOUBLE_TIME = 500;
const MOUSE_SLOP = 2;
const OUTLINE_THICKNESS = 2;
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
const STAGE_TYPES = {
    STAGE_2D:        'Stage2D',
    STAGE_3D:        'Stage3D',
    STAGE_UI:        'StageUI',
};
const WORLD_TYPES = {
    WORLD_2D:        'World2D',
    WORLD_3D:        'World3D',
    WORLD_UI:        'WorldUI',
};
const SCRIPT_FORMAT = {
    JAVASCRIPT:     'javascript',
    PYTHON:         'python',
};

class Vector2 {
    constructor(x = 0, y = 0) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
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
    copy(x, y) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
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
    min(vec) {
        this.x = Math.min(this.x, vec.x);
        this.y = Math.min(this.y, vec.y);
        return this;
    }
    max(vec) {
        this.x = Math.max(this.x, vec.x);
        this.y = Math.max(this.y, vec.y);
        return this;
    }
    clamp(minv, maxv) {
        if (minv.x < maxv.x) this.x = Math.max(minv.x, Math.min(maxv.x, this.x));
        else this.x = Math.max(maxv.x, Math.min(minv.x, this.x));
        if (minv.y < maxv.y) this.y = Math.max(minv.y, Math.min(maxv.y, this.y));
        else this.y = Math.max(maxv.y, Math.min(minv.y, this.y));
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
    abs() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return this;
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    cross(vec) {
        return this.x * vec.y - this.y * vec.x;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y;
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
    angleBetween(vec) {
        const magnitudes = this.length() * vec.length();
        const dot = this.dot(vec);
        const theta = dot / magnitudes;
        const clampedDot = Math.min(Math.max(theta, -1), 1);
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
    distanceTo(vec) {
        return Math.sqrt(this.distanceToSquared(vec));
    }
    distanceToSquared(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        return dx * dx + dy * dy;
    }
    manhattanDistanceTo(vec) {
        return Math.abs(this.x - vec.x) + Math.abs(this.y - vec.y);
    }
    setLength(length) {
        return this.normalize().multiplyScalar(length);
    }
    lerp(vec, t) {
        return this.lerpVectors(this, vec, t);
    }
    lerpVectors(a, b, t) {
        this.x = (a.x * (1.0 - t)) + (b.x * t);
        this.y = (a.y * (1.0 - t)) + (b.y * t);
        return this;
    }
    smoothstep(vec, t) {
        t = 3 * t * t - 2 * t * t * t;
        t = Math.min(1, Math.max(0, t));
        this.x = this.x + ((vec.x - this.x) * t);
        this.y = this.y + ((vec.y - this.y) * t);
        return this;
    }
    equals(vec) {
        return ((vec.x === this.x) && (vec.y === this.y));
    }
    fuzzyEquals(vec, tolerance = 0.001) {
        if (fuzzyFloat$1(this.x, vec.x, tolerance) === false) return false;
        if (fuzzyFloat$1(this.y, vec.y, tolerance) === false) return false;
        return true;
    }
    random() {
        this.x = Math.random();
        this.y = Math.random();
    }
    log(description = '') {
        if (description !== '') description += ' - ';
        console.log(`${description}X: ${this.x}, Y: ${this.y}`);
        return this;
    }
    toArray() {
        return [ this.x, this.y ];
    }
    fromArray(array, offset = 0) {
        this.set(array[offset + 0], array[offset + 1]);
        return this;
    }
}
function fuzzyFloat$1(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
}

const _clamp = new Vector2();
const _half = new Vector2();
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
        this.clear();
        if (points.length > 0 && Array.isArray(points[0])) points = points[0];
        for (const point of points) this.expandByPoint(point);
        return this;
    }
    setFromCenterAndSize(center, size) {
        _half.copy(size).multiplyScalar(0.5);
        this.min.copy(center).sub(_half);
        this.max.copy(center).add(_half);
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
    clear() {
        this.min.set(+Infinity, +Infinity);
        this.max.set(-Infinity, -Infinity);
    }
    isEmpty() {
        return (this.max.x < this.min.x) || (this.max.y < this.min.y);
    }
    getCenter(target = new Vector2()) {
        this.isEmpty() ? target.set(0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
        return target;
    }
    getSize(target = new Vector2()) {
        this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min).abs();
        return target;
    }
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);
        return this;
    }
    expandByVector(vector, y) {
        let ex, ey;
        if (typeof vector === 'object') {
            ex = vector.x / 2;
            ey = vector.y / 2;
        } else {
            ex = vector / 2;
            ey = y / 2;
        }
        this.min.sub(ex, ey);
        this.max.add(ex, ey);
        return this;
    }
    expandByScalar(scalar) {
        this.min.addScalar(scalar * -1);
        this.max.addScalar(scalar * +1);
        return this;
    }
    multiply(x, y) {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        this.min.multiply(x, y);
        this.max.multiply(x, y);
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
        _clamp.copy(point).clamp(this.min, this.max).sub(point);
        return _clamp.length();
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
    translate(x, y) {
        this.min.add(x, y);
        this.max.add(x, y);
        return this;
    }
    equals(box) {
        return box.min.equals(this.min) && box.max.equals(this.max);
    }
    toArray() {
        return [ this.min.x, this.min.y, this.max.x, this.max.y ];
    }
    fromArray(array, offset = 0) {
        this.min.set(array[offset + 0], array[offset + 1]);
        this.max.set(array[offset + 2], array[offset + 3]);
        return this;
    }
}

const EPSILON = 0.000001;
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
    set(x, y, z) {
        if (typeof x === 'object') return this.copy(x);
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        this.z = scalar;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    copy(x, y, z) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return this;
    }
    add(x, y, z) {
        if (typeof x === 'object') {
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
        } else {
            this.x += x;
            this.y += y;
            this.z += z;
        }
        return this;
    }
    addScalar(scalar) {
        this.x += scalar;
        this.y += scalar;
        this.z += scalar;
        return this;
    }
    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }
    addScaledVector(vec, scale) {
        this.x += vec.x * scale;
        this.y += vec.y * scale;
        this.z += vec.z * scale;
        return this;
    }
    sub(x, y, z) {
        if (typeof x === 'object') {
            this.x -= x.x;
            this.y -= x.y;
            this.z -= x.z;
        } else {
            this.x -= x;
            this.y -= y;
            this.z -= z;
        }
        return this;
    }
    subScalar(scalar) {
        this.x -= scalar;
        this.y -= scalar;
        this.z -= scalar;
        return this;
    }
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }
    multiply(x, y, z) {
        if (typeof x === 'object') {
            this.x *= x.x;
            this.y *= x.y;
            this.z *= x.z;
        } else {
            this.x *= x;
            this.y *= y;
            this.z *= z;
        }
        return this;
    }
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    divide(x, y) {
        if (typeof x === 'object') {
            this.x /= x.x;
            this.y /= x.y;
            this.z /= x.z;
        } else {
            this.x /= x;
            this.y /= y;
            this.z /= z;
        }
        return this;
    }
    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }
    min(vec) {
        this.x = Math.min(this.x, vec.x);
        this.y = Math.min(this.y, vec.y);
        this.z = Math.min(this.z, vec.z);
        return this;
    }
    max(vec) {
        this.x = Math.max(this.x, vec.x);
        this.y = Math.max(this.y, vec.y);
        this.z = Math.max(this.z, vec.z);
        return this;
    }
    clamp(minv, maxv) {
        if (minv.x < maxv.x) this.x = Math.max(minv.x, Math.min(maxv.x, this.x));
        else this.x = Math.max(maxv.x, Math.min(minv.x, this.x));
        if (minv.y < maxv.y) this.y = Math.max(minv.y, Math.min(maxv.y, this.y));
        else this.y = Math.max(maxv.y, Math.min(minv.y, this.y));
        if (minv.z < maxv.z) this.z = Math.max(minv.z, Math.min(maxv.z, this.z));
        else this.z = Math.max(maxv.z, Math.min(minv.z, this.z));
        return this;
    }
    clampScalar(minVal, maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x));
        this.y = Math.max(minVal, Math.min(maxVal, this.y));
        this.z = Math.max(minVal, Math.min(maxVal, this.z));
        return this;
    }
    clampLength(min, max) {
        const length = this.length();
        return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }
    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }
    abs() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        this.z = Math.abs(this.z);
        return this;
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }
	cross(vec) {
		return this.crossVectors(this, vec);
	}
	crossVectors(a, b) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}
    length() {
        return Math.sqrt(this.lengthSq());
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
        return this.divideScalar(this.length() || 1);
    }
    angle(vec) {
        _temp1.copy(this).normalize();
        _temp2.copy(vec).normalize();
        const cosine = _temp1.dot(_temp2);
        if (cosine > 1.0) return 0;
        if (cosine < -1.0) return Math.PI;
        return Math.acos(cosine);
    }
    distanceTo(vec) {
        return Math.sqrt(this.distanceToSquared(vec));
    }
    distanceToSquared(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        const dz = this.z - vec.z;
        return dx * dx + dy * dy + dz * dz;
    }
    manhattanDistanceTo(vec) {
        return Math.abs(this.x - vec.x) + Math.abs(this.y - vec.y) + Math.abs(this.z - vec.z);
    }
    lerp(vec, t) {
        return this.lerpVectors(this, vec, t);
    }
    lerpVectors(a, b, t) {
        this.x = a.x + ((b.x - a.x) * t);
        this.y = a.y + ((b.y - a.y) * t);
        this.z = a.z + ((b.z - a.z) * t);
        return this;
    }
    applyMatrix3(mat3) {
        this.x = this.x * mat3[0] + this.y * mat3[3] + this.z * mat3[6];
        this.y = this.x * mat3[1] + this.y * mat3[4] + this.z * mat3[7];
        this.z = this.x * mat3[2] + this.y * mat3[5] + this.z * mat3[8];
        return this;
    }
    applyMatrix4(mat4) {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let w =  (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
        this.x = (m[0] * x + m[4] * y + m[ 8] * z + m[12]) / w;
        this.y = (m[1] * x + m[5] * y + m[ 9] * z + m[13]) / w;
        this.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return this;
    }
    scaleRotateMatrix4(mat4) {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let w =  (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
        this.x = (m[0] * x + m[4] * y + m[ 8] * z) / w;
        this.y = (m[1] * x + m[5] * y + m[ 9] * z) / w;
        this.z = (m[2] * x + m[6] * y + m[10] * z) / w;
        return this;
    }
    applyQuaternion(q) {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let qx = q[0];
        let qy = q[1];
        let qz = q[2];
        let qw = q[3];
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
        this.x = x + uvx + uuvx;
        this.y = y + uvy + uuvy;
        this.z = z + uvz + uuvz;
        return this;
    }
    transformDirection(mat4) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        this.x = mat4[0] * x + mat4[4] * y + mat4[ 8] * z;
        this.y = mat4[1] * x + mat4[5] * y + mat4[ 9] * z;
        this.z = mat4[2] * x + mat4[6] * y + mat4[10] * z;
        return this.normalize();
    }
    calculateNormal(target = new Vector3(), a, b, c) {
        _temp1.subVectors(a, b);
        target.subVectors(b, c);
        target.cross(_temp1);
        target.normalize();
        return target;
    }
    equals(vec) {
        return ((vec.x === this.x) && (vec.y === this.y) && (vec.z === this.z));
    }
    fuzzyEquals(vec, tolerance = 0.001) {
        if (fuzzyFloat(this.x, vec.x, tolerance) === false) return false;
        if (fuzzyFloat(this.y, vec.y, tolerance) === false) return false;
        if (fuzzyFloat(this.z, vec.z, tolerance) === false) return false;
        return true;
    }
    random() {
        this.x = Math.random();
        this.y = Math.random();
        this.z = Math.random();
    }
    log(description = '') {
        if (description !== '') description += ' - ';
        console.log(`${description}X: ${this.x}, Y: ${this.y}, Z: ${this.z}`);
        return this;
    }
    toArray() {
        return [ this.x, this.y, this.z ];
    }
    fromArray(array, offset = 0) {
        this.set(array[offset + 0], array[offset + 1], array[offset + 2]);
        return this;
    }
}
const _temp1 = new Vector3();
const _temp2 = new Vector3();
function fuzzyFloat(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
}

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];
const v0 = new Vector3();
const v1 = new Vector3();
const vc = new Vector3();
class MathUtils {
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    static degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees;
    }
    static equalizeAngle0to360(angle, degrees = true) {
        let equalized = (degrees) ? angle : MathUtils.radiansToDegrees(angle);
        while (equalized < 0) { equalized += 360; }
        while (equalized >= 360) { equalized -= 360; }
        return (degrees) ? equalized : MathUtils.degreesToRadians(equalized);
    }
    static clamp(number, min, max) {
        number = Number(number);
        if (number < min) number = min;
        if (number > max) number = max;
        return number;
    }
    static roundTo(number, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        return Math.round(number * shift) / shift;
    }
    static damp(a, b, lambda, dt) {
        return MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));
    }
    static lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
    static smoothstep(a, b, t) {
        t = 3 * t * t - 2 * t * t * t;
        t = Math.min(1, Math.max(0, t));
        return a + ((b - a) * t);
    }
    static smootherstep(a, b, t) {
        t = t * t * t * (t * (t * 6 - 15) + 10);
        t = Math.min(1, Math.max(0, t));
        return a + ((b - a) * t);
    }
    static fuzzyFloat(a, b, tolerance = 0.001) {
        return ((a < (b + tolerance)) && (a > (b - tolerance)));
    }
    static fuzzyVector(a, b, tolerance = 0.001) {
        if (MathUtils.fuzzyFloat(a.x, b.x, tolerance) === false) return false;
        if (MathUtils.fuzzyFloat(a.y, b.y, tolerance) === false) return false;
        if (('z' in a) && ('z' in b) && MathUtils.fuzzyFloat(a.z, b.z, tolerance) === false) return false;
        if (('w' in a) && ('w' in b) && MathUtils.fuzzyFloat(a.w, b.w, tolerance) === false) return false;
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
        return (number != null && typeof number === 'number' && Number.isFinite(number));
    }
    static noZero(number, min = 0.00001) {
        min = Math.abs(min);
        number = MathUtils.sanity(number);
        if (number >= 0 && number < min) number = min;
        if (number < 0 && number > min * -1.0) number = min * -1.0;
        return number;
    }
    static sanity(number) {
        if (MathUtils.isNumber(number)) return number;
        return 0;
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
        v0.subVectors(c, b);
        v1.subVectors(a, b);
        vc.crossVectors(v0, v1);
        return (vc.length() * 0.5);
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

class Matrix2 {
    constructor(...values) {
        this.m = [ 1, 0, 0, 1, 0, 0 ];
        if (values && values.length > 0) {
            if (Array.isArray(values[0])) this.set(...values[0]);
            else this.set(...values);
        }
    }
    set(m0, m1, m2, m3, m4, m5) {
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
        return this;
    }
    copy(mat) {
        if (mat && mat instanceof Matrix2) this.set(...mat.m);
        return this;
    }
    clone() {
        return new Matrix2(...this.m);
    }
    identity() {
        return this.set(1, 0, 0, 1, 0, 0);
    }
    multiply(mat) {
        const m0 = this.m[0] * mat.m[0] + this.m[2] * mat.m[1];
        const m1 = this.m[1] * mat.m[0] + this.m[3] * mat.m[1];
        const m2 = this.m[0] * mat.m[2] + this.m[2] * mat.m[3];
        const m3 = this.m[1] * mat.m[2] + this.m[3] * mat.m[3];
        const m4 = this.m[0] * mat.m[4] + this.m[2] * mat.m[5] + this.m[4];
        const m5 = this.m[1] * mat.m[4] + this.m[3] * mat.m[5] + this.m[5];
        return this.set(m0, m1, m2, m3, m4, m5);
    }
    premultiply(mat) {
        const m0 = mat.m[0] * this.m[0] + mat.m[2] * this.m[1];
        const m1 = mat.m[1] * this.m[0] + mat.m[3] * this.m[1];
        const m2 = mat.m[0] * this.m[2] + mat.m[2] * this.m[3];
        const m3 = mat.m[1] * this.m[2] + mat.m[3] * this.m[3];
        const m4 = mat.m[0] * this.m[4] + mat.m[2] * this.m[5] + mat.m[4];
        const m5 = mat.m[1] * this.m[4] + mat.m[3] * this.m[5] + mat.m[5];
        return this.set(m0, m1, m2, m3, m4, m5);
    }
    compose(px, py, sx, sy, rot) {
        this.identity();
        this.multiply(_translate$4.set(1, 0, 0, 1, px, py));
        if (rot !== 0) {
            const c = Math.cos(rot);
            const s = Math.sin(rot);
            this.multiply(_rotate$3.set(c, s, -s, c, 0, 0));
        }
        if (sx !== 1 || sy !== 1) this.scale(sx, sy);
        return this;
    }
    decompose(object) {
        if (!object || typeof object !== 'object') return this;
        if (object.position) this.getPosition(object.position);
        object.rotation = this.getRotation();
        if (object.scale) this.getScale(object.scale);
        return this;
    }
    setPosition(x, y) {
        this.m[4] = x;
        this.m[5] = y;
        return this;
    }
    translate(x, y) {
        if (typeof x === 'object') {
            this.m[4] += this.m[0] * x.x + this.m[2] * x.y;
            this.m[5] += this.m[1] * x.x + this.m[3] * x.y;
        } else {
            this.m[4] += this.m[0] * x + this.m[2] * y;
            this.m[5] += this.m[1] * x + this.m[3] * y;
        }
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
    scale(x, y) {
        if (typeof x === 'object') {
            this.m[0] *= x.x;
            this.m[1] *= x.x;
            this.m[2] *= x.y;
            this.m[3] *= x.y;
        } else {
            if (y == undefined) y = x;
            this.m[0] *= x;
            this.m[1] *= x;
            this.m[2] *= y;
            this.m[3] *= y;
        }
        return this;
    }
    skew(radianX, radianY) {
        return this.multiply(_skew.set(1, Math.tan(radianY), Math.tan(radianX), 1, 0, 0));
    }
    getScale(target = new Vector2()) {
        const scaleX = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
        const scaleY = Math.sqrt(this.m[2] * this.m[2] + this.m[3] * this.m[3]);
        target.set(scaleX, scaleY);
        return target;
    }
    getPosition(target = new Vector2()) {
        target.set(this.m[4], this.m[5]);
        return target;
    }
    getRotation() {
        return Math.atan2(this.m[1], this.m[0]);
    }
    getSkew(target = new Vector2()) {
        const scaleX = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
        const scaleY = Math.sqrt(this.m[2] * this.m[2] + this.m[3] * this.m[3]);
        const skewX = Math.atan2(-this.m[2] / scaleY, this.m[0] / scaleX);
        const skewY = Math.atan2( this.m[1] / scaleX, this.m[3] / scaleY);
        target.set(skewX, skewY);
        return target;
    }
    getSign(target = new Vector2()) {
        const signX = (this.m[0] < 0) ? -1 : 1;
        const signY = (this.m[3] < 0) ? -1 : 1;
        target.set(signX, signY);
        return target;
    }
    determinant() {
        return this.m[0] * this.m[3] - this.m[1] * this.m[2];
    }
    getInverse(mat = new Matrix2()) {
        const d = this.determinant();
        if (d === 0) console.error(`Matrix2.getInverse(): Matrix is non-invertible`);
        const invD = 1 / d;
        const m0 =  this.m[3] * invD;
        const m1 = -this.m[1] * invD;
        const m2 = -this.m[2] * invD;
        const m3 =  this.m[0] * invD;
        const m4 = invD * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        const m5 = invD * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        return mat.set(m0, m1, m2, m3, m4, m5);
    }
    applyToVector(target) {
        if (!target) console.warn(`Matrix2.applyToVector(): Missing vector target`);
        const x = target.x * this.m[0] + target.y * this.m[2] + this.m[4];
        const y = target.x * this.m[1] + target.y * this.m[3] + this.m[5];
        return target.set(x, y);
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
        context.setTransform(1, 0, 0, 1, 0, 0);
        this.transformContext(context);
        return this;
    }
    transformContext(context) {
        context.transform(this.m[0], -this.m[1], -this.m[2], this.m[3], this.m[4], -this.m[5]);
        return this;
    }
    cssTransform() {
        return `matrix(${this.m[0]}, ${-this.m[1]}, ${-this.m[2]}, ${this.m[3]}, ${this.m[4]}, ${-this.m[5]}`;
    }
    toArray() {
        return [ ...this.m ];
    }
    fromArray(array, offset = 0) {
        this.set(array[offset + 0], array[offset + 1], array[offset + 2], array[offset + 3], array[offset + 4], array[offset + 5]);
        return this;
    }
}
const _translate$4 = new Matrix2();
const _rotate$3 = new Matrix2();
const _skew = new Matrix2();

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
    #locked = false;
    #lockID = 1;
    constructor(element, disableContextMenu = true) {
        if (!element || !element.dom) {
            console.error(`Pointer: No element was provided`);
            return;
        }
        const self = this;
        this._keys = new Array(5);
        this._location = new Vector2(0, 0);
        this._locationUpdated = false;
        this._delta = new Vector2(0, 0);
        this._wheel = 0;
        this._wheelUpdated = false;
        this._doubleClicked = new Array(5);
        this._clickTime = new Array(5);
        this.keys = new Array(5);
        this.position = new Vector2(0, 0);
        this.location = new Vector2(0, 0);
        this.delta = new Vector2(0, 0);
        this.wheel = 0;
        this.doubleClicked = new Array(5);
        this.downAt = new Vector2(0, 0);
        this.pointerInside = false;
        this.dragging = false;
        for (let i = 0; i < 5; i++) {
            this._doubleClicked[i] = false;
            this.doubleClicked[i] = false;
            this._keys[i] = new Key();
            this.keys[i] = new Key();
        }
        function updateLocation(x, y) {
            if (element && element.dom) {
                const rect = element.dom.getBoundingClientRect();
                x -= rect.left;
                y -= rect.top;
            }
            const xDiff = x - self._location.x;
            const yDiff = y - self._location.y;
            self._delta.x += xDiff;
            self._delta.y += yDiff;
            self._location.set(x, y);
            self._locationUpdated = true;
            self.position.set(x, -y);
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
            updateLocation(event.clientX, event.clientY);
        });
        element.on('pointerdown', (event) => {
            element.dom.setPointerCapture(event.pointerId);
            updateKey(event.button, Key.DOWN);
            self._clickTime[event.button] = performance.now();
        });
        element.on('pointerup', (event) => {
            element.dom.releasePointerCapture(event.pointerId);
            updateKey(event.button, Key.UP);
        });
        element.on('pointerenter', () => { self.pointerInside = true; });
        element.on('pointerleave', () => { self.pointerInside = false; });
        element.on('wheel', (event) => {
            self._wheel = event.deltaY;
            self._wheelUpdated = true;
        });
        element.on('dragstart', (event) => { updateKey(event.button, Key.UP); });
        element.on('dblclick', (event) => {
            self._doubleClicked[event.button] = (performance.now() - self._clickTime[event.button]) < MOUSE_DOUBLE_TIME;
        });
    }
    buttonPressed(button, id = -1) {
        if (this.#locked && this.#locked !== id) return false;
        return this.keys[button].pressed;
    }
    buttonDoubleClicked(button, id = -1) {
        if (this.#locked && this.#locked !== id) return false;
        return this.doubleClicked[button];
    }
    buttonJustPressed(button, id = -1) {
        if (this.#locked && this.#locked !== id) return false;
        return this.keys[button].justPressed;
    }
    buttonJustReleased(button, id = -1) {
        if (this.#locked && this.#locked !== id) return false;
        return this.keys[button].justReleased;
    }
    insideDom() {
        return this.pointerInside;
    }
    lock() {
        this.#locked = this.#lockID;
        this.#lockID++;
        return this.#locked;
    }
    unlock() {
        this.#locked = false;
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
        if (this._locationUpdated) {
            this.delta.copy(this._delta);
            this.location.copy(this._location);
            this._delta.set(0, 0);
            this._locationUpdated = false;
        } else {
            this.delta.x = 0;
            this.delta.y = 0;
        }
    }
}

class SysUtils {
    static isObject(variable) {
        return (variable && typeof variable === 'object' && !Array.isArray(variable));
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
            return console.warn(error);
        }
    }
    static saveBuffer(buffer, filename, optionalType = { type: 'application/octet-stream' }) {
        const url = URL.createObjectURL(new Blob([ buffer ], { type: optionalType }));
        SysUtils.save(url, filename);
    }
    static saveImage(imageUrl, filename) {
        SysUtils.save(imageUrl, filename);
    }
    static saveString(text, filename) {
        const url = URL.createObjectURL(new Blob([ text ], { type: 'text/plain' }));
        SysUtils.save(url, filename);
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
        const system = SysUtils.detectOS();
        if (system === 'Mac') {
            return '⌘';
        } else {
            return '⌃';
        }
    }
    static sleep(ms) {
        const beginTime = performance.now();
        let endTime = beginTime;
        while (endTime - beginTime < ms) {
            endTime = performance.now();
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
        let startTimeMs = performance.now();
        let alertTimeMs = performance.now();
        function loopSearch() {
            if (timeoutMs > 0 && (performance.now() - startTimeMs > timeoutMs)) {
                console.info(`Operation: ${operationName} timed out`);
                return;
            }
            if ((alertMs > 0) && performance.now() - alertTimeMs > alertMs) {
                console.info(`Still waiting on operation: ${operationName}`);
                alertTimeMs = performance.now();
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

const _types$2 = new Map();
class Thing {
    constructor(name = 'Thing') {
        this.isThing = true;
        this.type = 'Thing';
        this.name = name;
        this.uuid = MathUtils.randomUUID();
    }
    clone(recursive = false) {
        return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = true) {
        this.dispose();
        this.name = source.name;
        return this;
    }
    toJSON() {
        const data = {};
        data.meta = {
            type: this.type,
            version: VERSION,
        };
        data.name = this.name;
        data.uuid = this.uuid;
        return data;
    }
    fromJSON(data) {
        if (!SysUtils.isObject(data)) {
            console.warn(`Thing.fromJSON(): No json data provided for ${this.constructor.name}`);
            return this;
        }
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        return this;
    }
    static register(type, ThingClass) {
	    _types$2.set(type, ThingClass);
    }
    static type(type) {
        return _types$2.get(type);
    }
}
Thing.register('Thing', Thing);

const _position$2 = new Vector2();
const _corner1$2 = new Vector2();
const _corner2$2 = new Vector2();
const _corner3$2 = new Vector2();
const _corner4$2 = new Vector2();
class Object2D extends Thing {
    constructor(name = 'Object') {
        super(name);
        this.type = 'Object2D';
        this.children = [];
        this.parent = null;
        this.visible = true;
        this.opacity = 1;
        this.layer = 0;
        this.level = 0;
        this.globalOpacity = 1;
        this.position = new Vector2(0, 0);
        this.scale = new Vector2(1, 1);
        this.rotation = 0.0;
        this.matrix = new Matrix2();
        this.globalMatrix = new Matrix2();
        this.inverseGlobalMatrix = new Matrix2();
        this.matrixAutoUpdate = true;
        this.matrixNeedsUpdate = true;
        this.lateUpdate = false;
        this.boundingBox = new Box2();
        this.masks = [];
        this.pointerEvents = true;
        this.draggable = true;
        this.focusable = true;
        this.selectable = true;
        this.pointerInside = false;
        this.inViewport = true;
        this.isSelected = false;
        this.isDragging = false;
    }
    add(...objects) {
        if (!objects) return this;
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        for (const object of objects) {
            if (!object || !object.uuid) continue;
            const index = this.children.indexOf(object);
            if (index === -1) {
                if (object.parent) object.parent.remove(object);
                this.children.push(object);
                object.parent = this;
                object.level = this.level + 1;
                object.computeBoundingBox();
                object.traverse(function(child) {
                    if (typeof child.onAdd === 'function') child.onAdd(this);
                    child.matrixNeedsUpdate = true;
                });
            }
        }
        return this;
    }
    remove(...objects) {
        if (!objects) return this;
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        for (const object of objects) {
            if (!object || !object.uuid) continue;
            const index = this.children.indexOf(object);
            if (index !== -1) {
                this.children.splice(index, 1);
                object.parent = null;
                object.level = 0;
                object.traverse(function(child) {
                    if (typeof child.onRemove === 'function') child.onRemove(this);
                    child.matrixNeedsUpdate = true;
                });
            }
        }
        return this;
    }
    removeFromParent() {
		const parent = this.parent;
		if (parent) parent.remove(this);
		return this;
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
    traverseVisible(callback) {
        if (!this.visible) return false;
        if (typeof callback === 'function' && callback(this)) return true;
        for (const child of this.children) {
            if (child.traverseVisible(callback)) return true;
        }
        return false;
    }
    traverseAncestors(callback) {
		const parent = this.parent;
        if (!parent) return false;
		if (typeof callback === 'function' && callback(parent)) return true;
		return parent.traverseAncestors(callback);
	}
    clear() {
        return this.remove(...this.children);
    }
    destroy() {
        this.clear();
        this.removeFromParent();
        return this;
    }
    computeBoundingBox(renderer) {
        return this.boundingBox;
    }
    isInside(point) {
        return false;
    }
    isWorldPointInside(worldPoint, recursive = false) {
        const localPoint = this.worldToLocal(worldPoint);
        if (this.isInside(localPoint)) return true;
        if (recursive) {
            for (const child of this.children) {
                if (child.isWorldPointInside(worldPoint, true)) return true;
            }
        }
        return false;
    }
    getWorldPointIntersections(worldPoint) {
        const objects = [];
        this.traverseVisible((child) => {
            const localPoint = child.worldToLocal(worldPoint);
            if (child.isInside(localPoint)) objects.push(child);
        });
        objects.sort((a, b) => {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });
        return objects;
    }
    getWorldBoundingBox() {
        const box = this.boundingBox;
        if (Number.isFinite(box.min.x) === false || Number.isFinite(box.min.y) === false) return box;
        if (Number.isFinite(box.max.x) === false || Number.isFinite(box.max.y) === false) return box;
        this.globalMatrix.applyToVector(_corner1$2.copy(box.min.x, box.min.y));
        this.globalMatrix.applyToVector(_corner2$2.copy(box.min.x, box.max.y));
        this.globalMatrix.applyToVector(_corner3$2.copy(box.max.x, box.min.y));
        this.globalMatrix.applyToVector(_corner4$2.copy(box.max.x, box.max.y));
        return new Box2().setFromPoints(_corner1$2, _corner2$2, _corner3$2, _corner4$2);
    }
    localToWorld(vector) {
        return this.globalMatrix.transformPoint(vector);
    }
    worldToLocal(vector) {
        return this.inverseGlobalMatrix.transformPoint(vector);
    }
    applyMatrix(matrix) {
        this.updateMatrix(true);
        this.matrix.premultiply(matrix);
        this.matrix.getPosition(this.position);
        this.rotation = this.matrix.getRotation();
        this.matrix.getScale(this.scale);
        this.updateMatrix(true);
        return this;
    }
    attach(object) {
        if (!object || !object.uuid) return this;
        if (this.children.indexOf(object) !== -1) return this;
        const oldParent = object.parent;
        this.updateMatrix(true);
        const m1 = new Matrix2().copy(this.inverseGlobalMatrix);
        if (oldParent) {
            oldParent.updateMatrix(true);
            m1.multiply(oldParent.globalMatrix);
        }
        object.applyMatrix(m1);
        object.removeFromParent();
        this.children.push(object);
        object.parent = this;
        object.level = this.level + 1;
        object.traverse(function(child) {
            if (typeof child.onAdd === 'function') child.onAdd(this);
            child.matrixNeedsUpdate = true;
        });
        return this;
    }
    getWorldPosition() {
        this.updateMatrix(true);
        return this.globalMatrix.getPosition();
    }
    getWorldRotation() {
        this.updateMatrix(true);
        return this.globalMatrix.getRotation();
    }
    getWorldScale() {
        this.updateMatrix(true);
        return this.globalMatrix.getScale();
    }
    setPosition(x, y) {
        this.position.copy(x, y);
        this.updateMatrix(true);
        return this;
    }
    setRotation(rad) {
        this.rotation = rad;
        this.updateMatrix(true);
        return this;
    }
    setScale(x, y) {
        this.scale.copy(x, y);
        this.updateMatrix(true);
        return this;
    }
    updateMatrix(force = false) {
        if (force || this.matrixAutoUpdate || this.matrixNeedsUpdate) {
            this.globalOpacity = this.opacity * ((this.parent) ? this.parent.globalOpacity : 1);
            this.scale.x = MathUtils.noZero(MathUtils.sanity(this.scale.x));
            this.scale.y = MathUtils.noZero(MathUtils.sanity(this.scale.y));
            this.matrix.compose(this.position.x, this.position.y, this.scale.x, this.scale.y, this.rotation);
            this.globalMatrix.copy(this.matrix);
            if (this.parent) this.globalMatrix.premultiply(this.parent.globalMatrix);
            this.globalMatrix.getInverse(this.inverseGlobalMatrix);
            this.matrixNeedsUpdate = false;
        }
    }
    transform(renderer) {
        this.globalMatrix.transformContext(renderer.context);
    }
    onPointerDrag(renderer) {
        const pointer = renderer.pointer;
        const camera = renderer.camera;
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            this.pointerStartPosition = pointer.position.clone();
            this.dragStartPosition = this.position.clone();
        }
        const pointerStart = this.pointerStartPosition.clone();
        const pointerEnd = pointer.position.clone();
        if (pointer.buttonPressed(Pointer.LEFT)) {
            const manhattanDistance = pointerStart.manhattanDistanceTo(pointerEnd);
            if (manhattanDistance >= MOUSE_SLOP || this.isDragging) {
                this.isDragging = true;
                const parent = this.parent ?? this;
                const worldPositionStart = renderer.screenToWorld(pointerStart);
                const localPositionStart = parent.inverseGlobalMatrix.transformPoint(worldPositionStart);
                const worldPositionEnd = renderer.screenToWorld(pointerEnd);
                const localPositionEnd = parent.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                const delta = localPositionStart.clone().sub(localPositionEnd);
                _position$2.copy(this.dragStartPosition).sub(delta);
                this.position.copy(_position$2);
                this.matrixNeedsUpdate = true;
            }
        }
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.visible = source.visible;
        this.opacity = source.opacity;
        this.layer = source.layer;
        this.position.copy(source.position);
        this.scale.copy(source.scale);
        this.rotation = source.rotation;
        this.matrixAutoUpdate = source.matrixAutoUpdate;
        this.lateUpdate = source.lateUpdate;
        this.pointerEvents = source.pointerEvents;
        this.draggable = source.draggable;
        this.focusable = source.focusable;
        this.selectable = source.selectable;
        if (recursive && Array.isArray(source.masks)) {
            for (const mask of source.masks) {
                this.masks.push(mask.clone());
            }
        }
        if (recursive && Array.isArray(source.children)) {
            for (const child of source.children) {
                this.add(child.clone());
            }
        }
        return this;
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.visible = this.visible;
        data.opacity = this.opacity;
        data.layer = this.layer;
        data.position = this.position.toArray();
        data.scale = this.scale.toArray();
        data.rotation = this.rotation;
        data.matrixAutoUpdate = this.matrixAutoUpdate;
        data.lateUpdate = this.lateUpdate;
        data.pointerEvents = this.pointerEvents;
        data.draggable = this.draggable;
        data.focusable = this.focusable;
        data.selectable = this.selectable;
        data.masks = [];
        for (const mask of this.masks) {
            data.masks.push(mask.toJSON(recursive));
        }
        if (recursive) {
            for (const child of this.children) {
                data.children.push(child.toJSON(recursive));
            }
        }
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.visible !== undefined) this.visible = data.visible;
        if (data.opacity !== undefined) this.opacity = data.opacity;
        if (data.layer !== undefined) this.layer = data.layer;
        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);
        if (data.rotation !== undefined) this.rotation = data.rotation;
        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;
        if (data.lateUpdate !== undefined) this.lateUpdate = data.lateUpdate;
        if (data.pointerEvents !== undefined) this.pointerEvents = data.pointerEvents;
        if (data.draggable !== undefined) this.draggable = data.draggable;
        if (data.focusable !== undefined) this.focusable = data.focusable;
        if (data.selectable !== undefined) this.selectable = data.selectable;
        if (data.masks) {
            for (const maskData of data.masks) {
                const Constructor = Thing.type(maskData.type);
                if (Constructor) {
                    const child = new Constructor().fromJSON(maskData);
                    this.masks.push(child);
                } else {
                    console.warn(`Object2D.fromJSON(): Unknown mask type '${maskData.type}'`);
                }
            }
        }
        if (data.children) {
            for (const childData of data.children) {
                const Constructor = Thing.type(childData.type);
                if (Constructor) {
                    const child = new Constructor().fromJSON(childData);
                    this.add(child);
                } else {
                    console.warn(`Object2D.fromJSON(): Unknown child type '${childData.type}'`);
                }
            }
        }
        return this;
    }
}
Thing.register('Object2D', Object2D);

const _assets = {};
class AssetManager {
    static get(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }
    static library(type, category) {
        const library = [];
        if (type && typeof type === 'string') type = type.toLowerCase();
        if (category && typeof category === 'string') category = category.toLowerCase();
        for (const [ uuid, asset ] of Object.entries(_assets)) {
            if (type && typeof asset.type === 'string' && asset.type.toLowerCase() !== type) continue;
            if (category == undefined || (typeof asset.category === 'string' && asset.category.toLowerCase() === category)) {
                library.push(asset);
            }
        }
        return library;
    }
    static add(...assets) {
        if (assets.length > 0 && Array.isArray(assets[0])) assets = assets[0];
        let addedAsset = undefined;
        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;
            _assets[asset.uuid] = asset;
            addedAsset = addedAsset ?? asset;
        }
        return addedAsset;
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
    static toJSON() {
        const data = {};
        for (const type of _types$1.keys()) {
            const assets = AssetManager.library(type);
            if (assets.length > 0) {
                data[type] = [];
                for (const asset of assets) {
                    data[type].push(asset.toJSON());
                }
            }
        }
        return data;
    }
    static fromJSON(json, onLoad = () => {}) {
        AssetManager.clear();
        for (const type of _types$1.keys()) {
            if (!json[type]) continue;
            for (const assetData of json[type]) {
                const Constructor = AssetManager.type(type);
                if (Constructor) {
                    const asset = new Constructor().fromJSON(assetData);
                    AssetManager.add(asset);
                } else {
                    console.warn(`AssetManager.fromJSON(): Unknown asset type '${assetData.type}'`);
                }
            }
        }
        if (typeof onLoad === 'function') onLoad();
    }
    static register(type, AssetClass) {
        _types$1.set(type, AssetClass);
    }
    static type(type) {
        return _types$1.get(type);
    }
}
const _types$1 = new Map();

class Entity extends Object2D {
    constructor(name = 'Entity') {
        super(name);
        this.isEntity = true;
        this.type = 'Entity';
        this.category = null;
        this.locked = false;
        this.visible = true;
        this.components = [];
        this.children = [];
        this.parent = null;
        this.loadedDistance = 0;
    }
    componentFamily() {
        return [ 'Entity' ];
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
    getComponent(type, id ) {
        if (id === undefined) return this.getComponentByProperty('type', type);
        const components = this.getComponentsWithProperties('type', type, 'id', id);
        if (components.length > 0) return components[0];
        return undefined;
    }
    getComponentByID(id) {
        return this.getComponentByProperty('id', id);
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
        console.warn(`Entity.removeComponent(): Component ${component.uuid}, type '${component.type}' not found`);
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
    addEntity(...entities) {
        for (const entity of entities) {
            if (!entity || !entity.isEntity) continue;
            if (this.children.indexOf(entity) !== -1) continue;
            if (entity === this) continue;
            entity.removeFromParent();
            entity.parent = this;
            this.children.push(entity);
        }
        return this;
    }
    getEntities() {
        return [ ...this.children ];
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
        if (!forceDelete && entity.locked) return;
        const index = this.children.indexOf(entity);
        if (index !== -1) {
            entity.parent = null;
            this.children.splice(index, 1);
        }
        return entity;
    }
    traverse(callback, recursive = true) {
        if (typeof callback === 'function' && callback(this)) return true;
        for (const child of this.children) {
            if (child.traverse(callback, recursive)) return true;
        }
    }
    changeParent(newParent = undefined, newIndex = -1) {
        if (!newParent) newParent = this.parent;
        if (!newParent || !newParent.isEntity) return;
        const oldParent = this.parent;
        if (newIndex === -1 && oldParent) newIndex = oldParent.children.indexOf(this);
        newParent.addEntity(this);
        if (newIndex !== -1) {
            newParent.children.splice(newIndex, 0, this);
            newParent.children.pop();
        }
        return this;
    }
    parentEntity() {
        let entity = this;
        while (entity && entity.parent) {
            if (entity.parent.isStage) return entity;
            if (entity.parent.isWorld) return entity;
            entity = entity.parent;
        }
        return entity;
    }
    parentStage() {
        if (this.isStage || this.isWorld) return this;
        if (this.parent && this.parent.isEntity) return this.parent.parentStage();
        return null;
    }
    parentWorld() {
        if (this.isWorld) return this;
        if (this.parent && this.parent.isEntity) return this.parent.parentWorld();
        return null;
    }
    removeFromParent() {
        const parent = this.parent;
        if (parent) parent.removeEntity(this);
        return this;
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.category = source.category;
        this.locked = source.locked;
        this.visible = source.visible;
        for (const component of source.components) {
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
        }
        if (recursive) {
            for (const child of source.getEntities()) {
                this.addEntity(child.clone());
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
            this.children[0].dispose();
        }
        this.removeFromParent();
        return this;
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.category = this.category;
        data.locked = this.locked;
        data.visible = this.visible;
        data.components = [];
        data.children = [];
        for (const component of this.components) {
            data.components.push(component.toJSON());
        }
        if (recursive) {
            for (const child of this.getEntities()) {
                data.children.push(child.toJSON(recursive));
            }
        }
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.category !== undefined) this.category = data.category;
        if (data.locked !== undefined) this.locked = data.locked;
        if (data.visible !== undefined) this.visible = data.visible;
        if (data.components) {
            for (const componentData of data.components) {
                if (componentData && componentData.base && componentData.base.type) {
                    const component = this.addComponent(componentData.base.type, componentData, false);
                }
            }
        }
        if (data.children) {
            for (const childData of data.children) {
                const Constructor = Thing.type(childData.type);
                if (Constructor) {
                    const child = new Constructor().fromJSON(childData);
                    this.addEntity(child);
                } else {
                    console.warn(`Entity.fromJSON(): Unknown child type '${childData.type}'`);
                }
            }
        }
        return this;
    }
}
Thing.register('Entity', Entity);

class World extends Entity {
    constructor(type = WORLD_TYPES.WORLD_2D, name = 'World 1') {
        super(name);
        if (Object.values(WORLD_TYPES).indexOf(type) === -1) {
            console.warn(`World: Invalid world type '${type}', using 'World2D`);
            type = WORLD_TYPES.WORLD_2D;
        }
        this.isWorld = true;
        this.type = type;
        this.activeStageUUID = null;
        this.loadPosition = new Vector2();
        this.loadDistance = 0;
    }
    componentFamily() {
        return [ 'World', this.type ];
    }
    activeStage() {
        const stage = this.getStageByUUID(this.activeStageUUID);
        return stage ?? this;
    }
    setActiveStage(stage) {
        this.activeStageUUID = null;
        if (stage && stage.isEntity && this.getStageByUUID(stage.uuid)) {
            this.activeStageUUID = stage.uuid;
        }
        return this;
    }
    addEntity(...entities) {
        super.addEntity(...entities);
        if (!this.activeStageUUID) {
            const stages = this.getStages();
            if (stages.length > 0) this.setActiveStage(stages[0]);
        }
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
            stage.traverse(callback, recursive);
        }
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.type = source.type;
        this.position.copy(source.position);
        const stageIndex = source.getStages().indexOf(source.activeStage());
        this.activeStageUUID = (stageIndex !== -1) ? this.getStages()[stageIndex].uuid : null;
        this.loadPosition.copy(source.loadPosition);
        this.loadDistance = source.loadDistance;
        return this;
    }
    dispose() {
        super.dispose();
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.type = this.type;
        data.position = JSON.stringify(this.position.toArray());
        data.activeStageUUID = this.activeStageUUID;
        data.loadPosition = JSON.stringify(this.loadPosition.toArray());
        data.loadDistance = this.loadDistance;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.type !== undefined) this.type = data.type;
        if (data.position !== undefined) this.position.copy(JSON.parse(data.position));
        if (data.activeStageUUID !== undefined) this.activeStageUUID = data.activeStageUUID;
        if (data.loadPosition !== undefined) this.loadPosition.copy(JSON.parse(data.loadPosition));
        if (data.loadDistance !== undefined) this.loadDistance = data.loadDistance;
        return this;
    }
}
Thing.register('World2D', World);
Thing.register('World3D', World);
Thing.register('WorldUI', World);

class Project extends Thing {
    constructor(name = 'My Project') {
        super(name);
        this.isProject = true;
        this.type = 'Salinity';
        this.notes = '';
        this.settings = {
            orientation: APP_ORIENTATION.PORTRAIT,
            preload: 10,
            unload: 10,
        };
        this.worlds = {};
        this.activeWorldUUID = null;
        this.startWorldUUID = null;
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
        if (!world || !world.isWorld ) {
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
        if (Object.values(WORLD_TYPES).indexOf(world.type) !== -1) {
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
    worldCount(type) {
        if (!type) return Object.keys(this.worlds).length;
        let count = 0;
        for (const key in this.worlds) {
            if (this.worlds[key].type === type) count++;
        }
        return count;
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
        this.uuid = MathUtils.randomUUID();
        this.activeWorldUUID = null;
    }
    toJSON() {
        const data = super.toJSON();
        data.assets = AssetManager.toJSON();
        data.notes = this.notes;
        data.settings = structuredClone(this.settings);
        data.worlds = [];
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            data.worlds.push(world.toJSON());
        }
        data.activeWorldUUID = this.activeWorldUUID;
        data.startWorldUUID = this.startWorldUUID;
        return data;
    }
    fromJSON(data, loadAssets = true) {
        const type = data?.meta?.type ?? 'unknown';
        const version = data?.meta?.version ?? 'unknown';
        if (!SysUtils.isObject(data)) {
            console.error(`Project.fromJSON(): No json data provided`);
            return this;
        } else if (!SysUtils.isObject(data.meta)) {
            console.error(`Project.fromJSON(): No meta data found within JSON data`);
            return this;
        } else if (type !== 'Salinity') {
            console.error(`Project.fromJSON(): Unknown project type '${type}', expected '${this.type}'`);
            return this;
        } else if (version !== VERSION) {
            console.warn(`Project.fromJSON(): Project saved in 'v${version}', attempting to load with 'v${VERSION}'`);
        }
        this.clear();
        super.fromJSON(data);
        if (loadAssets) AssetManager.fromJSON(data.assets);
        this.notes = data.notes;
        this.settings = structuredClone(data.settings);
        for (const worldData of data.worlds) {
            const world = new World().fromJSON(worldData);
            console.log(world.type);
            this.addWorld(world);
        }
        this.activeWorldUUID = data.activeWorldUUID;
        this.startWorldUUID = data.startWorldUUID;
        return this;
    }
}

class ArrayUtils {
    static isIterable(array) {
        return (array && (typeof array[Symbol.iterator] === 'function') || Array.isArray(array));
    }
    static swapItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }
    static combineThingArrays(arrayOne, arrayTwo) {
        const things = [ ...arrayOne ];
        for (const thing of arrayTwo) {
            if (ArrayUtils.includesThing(thing, arrayOne) === false) things.push(thing);
        }
        return things;
    }
    static compareThingArrays(arrayOne, arrayTwo) {
        arrayOne = Array.isArray(arrayOne) ? arrayOne : [ arrayOne ];
        arrayTwo = Array.isArray(arrayTwo) ? arrayTwo : [ arrayTwo ];
        if (arrayOne.length === 0 && arrayTwo.length === 0) return true;
        for (const thing of arrayOne) if (ArrayUtils.includesThing(thing, arrayTwo) === false) return false;
        for (const thing of arrayTwo) if (ArrayUtils.includesThing(thing, arrayOne) === false) return false;
        return true;
    }
    static filterThings(things, properties = {}) {
        const filtered = things.filter((object) => {
            return Object.keys(properties).every((key) => { return object[key] == properties[key]; });
        });
        return filtered;
    }
    static includesThing(findThing, ...things) {
        if (!findThing || !findThing.uuid) return false;
        if (things.length === 0) return false;
        if (things.length > 0 && Array.isArray(things[0])) things = things[0];
        for (const thing of things) if (thing.uuid && thing.uuid === findThing.uuid) return true;
        return false;
    }
    static removeThingFromArray(removeThing, ...things) {
        if (things.length > 0 && Array.isArray(things[0])) things = things[0];
        if (!removeThing || !removeThing.uuid) return [ ...things ];
        const newArray = [];
        for (const thing of things) if (thing.uuid !== removeThing.uuid) newArray.push(thing);
        return newArray;
    }
    static shareValues(arrayOne, arrayTwo) {
        for (let i = 0; i < arrayOne.length; i++) {
            if (arrayTwo.includes(arrayOne[i])) return true;
        }
        return false;
    }
}

class Clock {
    #running = false;
    #startTime = 0;
    #elapsedTime = 0;
    #lastChecked = 0;
    #deltaCount = 0;
    #frameTime = 0;
    #frameCount = 0;
    #lastFrameCount = null;
    constructor(autoStart = true, msRewind = 0) {
        if (autoStart) this.start();
        this.#startTime -= msRewind;
        this.#lastChecked -= msRewind;
    }
    start(reset = false) {
        if (reset) this.reset();
        this.#startTime = performance.now();
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
        this.#startTime = performance.now();
        this.#lastChecked = this.#startTime;
        this.#elapsedTime = 0;
        this.#deltaCount = 0;
    }
    getElapsedTime() {
        return this.#elapsedTime;
    }
    getDeltaTime() {
        if (!this.#running) {
            this.#lastFrameCount = null;
            return 0;
        }
        const newTime = performance.now();
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
        const frameRate = (this.#lastFrameCount !== null) ? (1 / this.#lastFrameCount) : (this.#frameTime / this.#frameCount);
        return Math.min(1, frameRate);
    }
    fps() {
        return (this.#lastFrameCount !== null) ? this.#lastFrameCount : (this.#frameCount / this.#frameTime);
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
            const clone = entity.clone(false );
            SceneManager.loadScriptsFromComponents(clone, entity);
            if (!entity.isStage) SceneManager.cloneChildren(clone, entity);
            if (fromEntity.isStage) {
                if (toEntity.isWorld) {
                    const loadedDistance = toEntity.loadDistance + Math.abs(clone.position.length());
                    clone.traverse((child) => { child.loadedDistance = loadedDistance; });
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
            const script = AssetManager.get(scriptUUID);
            if (!script || !script.isScript) continue;
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
        if (!fromScene || !fromScene.isWorld) return;
        if (!entity || !entity.isEntity) return;
        SceneManager.app.dispatch('destroy', {}, [ entity.uuid ]);
        fromScene.removeEntity(entity, true );
        if (typeof entity.dispose === 'function') entity.dispose();
    }
    static cloneStage(toScene, fromStage, updateLoadPosition = true) {
        if (!toScene || !toScene.isWorld) return;
        if (!fromStage || !fromStage.isStage) return;
        SceneManager.cloneChildren(toScene, fromStage);
        if (updateLoadPosition) {
        }
    }
    static loadStages(toScene, fromWorld, preload = 10) {
        if (!toScene || !toScene.isWorld) return;
        if (!fromWorld || !fromWorld.isWorld) return;
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
        if (!toScene || !toScene.isWorld) return;
        if (!fromWorld || !fromWorld.isWorld) return;
        if (fromWorld.background != null) {
            if (fromWorld.background.isColor) {
                toScene.background = fromWorld.background.clone();
            } else {
                const texture = AssetManager.get(fromWorld.background);
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
        if (!world || !world.isWorld) return;
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
    static register(type, ObjectClass) {
        _types.set(type, ObjectClass);
    }
    static type(type) {
        return _types.get(type);
    }
}
const _types = new Map();

class Stage extends Entity {
    constructor(type = STAGE_TYPES.STAGE_2D, name = 'Start') {
        super(name);
        if (Object.values(STAGE_TYPES).indexOf(type) === -1) {
            console.warn(`Stage: Invalid stage type '${type}', using 'Stage2D`);
            type = STAGE_TYPES.STAGE_2D;
        }
        this.isStage = true;
        this.type = type;
        this.enabled = true;
        this.start = 0;
        this.finish = -1;
        this.beginPosition = new Vector3();
        this.endPosition = new Vector3();
    }
    componentFamily() {
        return [ 'Stage', this.type ];
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.type = data.type;
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
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.type = this.type;
        data.enabled = this.enabled;
        data.start = this.start;
        data.finish = this.finish;
        data.beginPosition = JSON.stringify(this.beginPosition.toArray());
        data.endPosition = JSON.stringify(this.endPosition.toArray());
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.type !== undefined) this.type = data.type;
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.copy(JSON.parse(data.beginPosition));
        if (data.endPosition !== undefined) this.endPosition.copy(JSON.parse(data.endPosition));
        return this;
    }
}
Thing.register('Stage2D', Stage);
Thing.register('Stage3D', Stage);
Thing.register('StageUI', Stage);

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
            uuids = (original.length === 0) ? Object.keys(events) : [ ...original ];
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
        this.scene = new World(WORLD_TYPES.WORLD_2D);
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

const _cameraView = new Box2();
const _corner1$1 = new Vector2();
const _corner2$1 = new Vector2();
const _corner3$1 = new Vector2();
const _corner4$1 = new Vector2();
const _translate$3 = new Matrix2();
const _rotate$2 = new Matrix2();
const _scale$2 = new Matrix2();
class Camera2D extends Thing {
    constructor() {
        super('Camera2D');
        this.type = 'Camera2D';
        this.position = new Vector2(0, 0);
        this.scale = 1.0;
        this.rotation = 0.0;
        this.matrix = new Matrix2();
        this.inverseMatrix = new Matrix2();
        this.matrixNeedsUpdate = true;
        this.width = 0;
        this.height = 0;
        this.viewport = new Box2(new Vector2(0, 0), new Vector2(0, 0));
    }
    intersectsViewport(renderer, box) {
        _corner1$1.copy(renderer.worldToScreen(box.min.x, box.min.y));
        _corner2$1.copy(renderer.worldToScreen(box.min.x, box.max.y));
        _corner3$1.copy(renderer.worldToScreen(box.max.x, box.min.y));
        _corner4$1.copy(renderer.worldToScreen(box.max.x, box.max.y));
        _cameraView.setFromPoints(_corner1$1, _corner2$1, _corner3$1, _corner4$1);
        return this.viewport.intersectsBox(_cameraView);
    }
    updateMatrix(force = false) {
        if (force !== true && this.matrixNeedsUpdate !== true) return;
        this.matrix.identity();
        this.matrix.rotate(this.rotation);
        this.matrix.scale(this.scale);
        this.matrix.translate(-this.position.x, -this.position.y);
        this.matrix.getInverse(this.inverseMatrix);
        this.matrixNeedsUpdate = false;
    }
    setViewport(width = 0, height = 0) {
        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.viewport.min.set(0, -height);
            this.viewport.max.set(width, 0);
            this.matrixNeedsUpdate = true;
        }
    }
}

const _cameraPoint$1 = new Vector2();
const _localPoint = new Vector2();
const _translate$2 = new Matrix2();
class EventManager {
    static pointerEvents(renderer, objects) {
        const camera = renderer.camera;
        const pointer = renderer.pointer;
        _cameraPoint$1.copy(renderer.screenToWorld(pointer.position));
        let currentCursor = null;
        for (const object of objects) {
            if (object.pointerEvents && object.inViewport) {
                object.inverseGlobalMatrix.applyToVector(_localPoint.copy(_cameraPoint$1));
                const isInside = object.isInside(_localPoint);
                if (isInside) {
                    if (!currentCursor && object.cursor) setCursor(object);
                    if (renderer.dragObject == null) {
                        if (!object.pointerInside && typeof object.onPointerEnter === 'function') object.onPointerEnter(renderer);
                        if (typeof object.onPointerOver === 'function') object.onPointerOver(renderer);
                        if (pointer.buttonDoubleClicked(Pointer.LEFT) && typeof object.onDoubleClick === 'function') object.onDoubleClick(renderer);
                        if (pointer.buttonPressed(Pointer.LEFT) && typeof object.onButtonPressed === 'function') object.onButtonPressed(renderer);
                        if (pointer.buttonJustReleased(Pointer.LEFT) && typeof object.onButtonUp === 'function') object.onButtonUp(renderer);
                        if (pointer.buttonJustPressed(Pointer.LEFT)) {
                            if (typeof object.onButtonDown === 'function') object.onButtonDown(renderer);
                            if (object.draggable) {
                                renderer.setDragObject(object);
                                if (typeof object.onPointerDragStart === 'function') object.onPointerDragStart(renderer);
                            }
                        }
                    }
                    object.pointerInside = true;
                } else if (renderer.dragObject !== object && object.pointerInside) {
                    if (typeof object.onPointerLeave === 'function') object.onPointerLeave(renderer);
                    object.pointerInside = false;
                }
            }
            if (renderer.dragObject === object) {
                if (pointer.buttonJustReleased(Pointer.LEFT)) {
                    renderer.setDragObject(null);
                    if (object.pointerEvents && typeof object.onPointerDragEnd === 'function') {
                        object.onPointerDragEnd(renderer);
                    }
                } else {
                    if (object.pointerEvents && typeof object.onPointerDrag === 'function') {
                        object.onPointerDrag(renderer);
                    }
                    setCursor(object);
                }
            }
        }
        function setCursor(object) {
            if (object.cursor) {
                currentCursor = (typeof object.cursor === 'function') ? object.cursor(camera) : object.cursor;
            } else {
                currentCursor = 'move';
            }
        }
        document.body.style.cursor = currentCursor ?? 'default';
    }
}

class Style {
    static extractColor(color) {
        function extractCSSVariableName(str) {
            const regex = /--[a-zA-Z0-9-_]+/;
            const match = str.match(regex);
            return match ? match[0] : null;
        }
        if (typeof color === 'string') {
            const cssVariable = extractCSSVariableName(color);
            if (cssVariable) {
                const computedStyle = getComputedStyle(document.body);
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
        this.cache = null;
        this.needsUpdate = true;
    }
    get(context) {}
}

class ColorStyle extends Style {
    constructor(color = '#000000', fallback = '#ffffff') {
        super();
        this.color = color;
        this.fallback = fallback;
    }
    get(context) {
        if (this.needsUpdate || this.cache == null) {
            this.cache = Style.extractColor(this.color) ?? this.fallback;
            this.needsUpdate = false;
        }
        return this.cache;
    }
}

class Keyboard {
    constructor(element) {
        if (!element || !element.dom) {
            console.error(`Keyboard: No element was provided`);
            return;
        }
        const self = this;
        this._keys = {};
        this.keys = {};
        function updateKey(code, action) {
            if (!(code in self._keys)) {
                self._keys[code] = new Key();
                self.keys[code] = new Key();
            }
            self._keys[code].update(action);
        }
        element.on('keydown', (event) => { updateKey(event.code, Key.DOWN); });
        element.on('keyup', (event) => { updateKey(event.code, Key.UP); });
    }
    keyPressed(code) {
        return code in this.keys && this.keys[code].pressed;
    }
    keyJustPressed(code) {
        return code in this.keys && this.keys[code].justPressed;
    }
    keyJustReleased(code) {
        return code in this.keys && this.keys[code].justReleased;
    }
    altPressed() { return this.keyPressed('AltLeft') || this.keyPressed('AltRight'); }
    ctrlPressed() { return this.keyPressed('ControlLeft') || this.keyPressed('ControlRight'); }
    metaPressed() { return this.keyPressed('MetaLeft') || this.keyPressed('MetaRight'); }
    shiftPressed() { return this.keyPressed('ShiftLeft') || this.keyPressed('ShiftRight'); }
    spacePressed() { return this.keyPressed('Space'); }
    modifierPressed() {
        return this.altPressed() || this.ctrlPressed() || this.metaPressed() || this.shiftPressed() || this.spacePressed();
    }
    update() {
        for (const code in this._keys) {
            if (this._keys[code].justPressed && this.keys[code].justPressed) {
                this._keys[code].justPressed = false;
            }
            if (this._keys[code].justReleased && this.keys[code].justReleased) {
                this._keys[code].justReleased = false;
            }
            this.keys[code].set(
                this._keys[code].justPressed,
                this._keys[code].pressed,
                this._keys[code].justReleased
            );
        }
    }
}

const _center$1 = new Vector2();
const _topLeft$2 = new Vector2();
const _topRight$2 = new Vector2();
const _botLeft$2 = new Vector2();
const _botRight$2 = new Vector2();
const _reset = new Matrix2();
const _screen = new Matrix2();
const _translate$1 = new Matrix2();
const _world = new Matrix2();
class Renderer {
    constructor({
        alpha = true,
        disableContextMenu = true,
        imageSmoothingEnabled = true,
        imageSmoothingQuality = 'medium',
        globalCompositeOperation = 'source-over',
        pointerEvents = true,
        width = 1000,
        height = 1000,
    } = {}) {
        const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.setAttribute('tabindex', '0');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.outline = 'none';
        this.screenContext  = canvas.getContext('bitmaprenderer');
        const offscreen = new OffscreenCanvas(width, height);
        this.context = offscreen.getContext('2d', { alpha });
        this.context.imageSmoothingEnabled = imageSmoothingEnabled;
        this.context.imageSmoothingQuality = imageSmoothingQuality;
        this.context.globalCompositeOperation = globalCompositeOperation;
        this.dom = canvas;
        this.offscreen = offscreen;
        this.pointerEvents = pointerEvents;
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
                offscreen.width = entry.contentRect.width;
                offscreen.height = entry.contentRect.height;
                if (renderer.running) renderer.render();
            }
        });
        resizeObserver.observe(canvas);
        this.on('destroy', () => {
            resizeObserver.unobserve(canvas);
        });
        this.clock = new Clock(false);
        this.deltaTime = 0;
        this.totalTime = 0;
        this.selectColor = new ColorStyle('--icon-light');
        this.running = false;
        this.frame = -1;
        this.scene = null;
        this.camera = null;
        this.dragObject = null;
        this.helpers = new Object2D();
    }
    destroy() {
        dom.dispatchEvent(new Event('destroy'));
    }
    on(event, callback, options = {}) {
        if (typeof options !== 'object') options = {};
        if (typeof callback !== 'function') {
            console.warn(`Renderer.on(): No callback function provided for '${event}'`);
            callback = () => { return; };
        }
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
        return this;
    }
    get width() { return this.dom.width; }
    set width(x) { this.dom.width = x; }
    get height() { return this.dom.height; }
    set height(y) { this.dom.height = y; }
    ratio() {
        const rect = this.dom.getBoundingClientRect();
        return ((this.width / this.height) / (rect.width / rect.height));
    }
    refreshColors() {
        this.selectColor.needsUpdate = true;
        if (this.scene) {
            this.scene.traverse((object) => {
                for (const prop in object) {
                    if (object[prop] instanceof Style) object[prop].needsUpdate = true;
                }
            });
        }
    }
    addHelper(helper) {
        this.helpers.add(helper);
    }
    addUpdate(object) {
        if (this.updatable.includes(object) === false) {
            this.updatable.push(object);
        }
    }
    start(scene, camera, onBeforeRender, onAfterRender) {
        if (this.running) return;
        if (scene) this.scene = scene;
        if (camera) this.camera = camera;
        this.running = true;
        this.clock.start(true );
        const renderer = this;
        function loop() {
            renderer.deltaTime = renderer.clock.getDeltaTime();
            renderer.totalTime = renderer.clock.getElapsedTime();
            if (typeof onBeforeRender === 'function') onBeforeRender();
            for (const object of renderer.updatable) {
                if (typeof object.update === 'function') object.update(renderer);
            }
            renderer.render();
            try {
                const backBuffer = renderer.offscreen.transferToImageBitmap();
                renderer.screenContext.transferFromImageBitmap(backBuffer);
            } catch {
            }
            if (typeof onAfterRender === 'function') onAfterRender();
            if (renderer.running) renderer.frame = requestAnimationFrame(loop);
        }
        loop();
    }
    stop() {
        this.running = false;
        cancelAnimationFrame(this.frame);
    }
    setDragObject(object) {
        if (this.dragObject) this.dragObject.isDragging = false;
        this.dragObject = object;
    }
    render(scene, camera) {
        this.drawCallCount = 0;
        if (scene) this.scene = scene; else scene = this.scene;
        if (camera) this.camera = camera; else camera = this.camera;
        if (!scene || !camera) return;
        const renderer = this;
        const context = this.context;
        const objects = [];
        scene.traverseVisible((child) => { if (child.visible) objects.push(child); });
        renderer.helpers.traverseVisible((child) => { if (child.visible) objects.push(child); });
        objects.sort((a, b) => {
            if (b.layer === a.layer) return b.level - a.level;
            return b.layer - a.layer;
        });
        camera.setViewport(this.width, this.height);
        camera.updateMatrix();
        for (const object of objects) {
            object.inViewport = camera.intersectsViewport(this, object.getWorldBoundingBox());
        }
        if (this.pointerEvents) {
            EventManager.pointerEvents(renderer, objects);
        }
        const lateUpdate = [];
        function updateTraversal(object) {
            object.traverse((child) => {
                if (child.lateUpdate) lateUpdate.push(child);
                else updateObject(child);
            });
        }
        function updateObject(object) {
            object.updateMatrix();
            if (typeof object.onUpdate === 'function') object.onUpdate(renderer);
        }
        updateTraversal(scene);
        updateTraversal(renderer.helpers);
        for (const object of lateUpdate) { updateObject(object); }
        if (this.autoClear) {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, this.width, this.height);
        }
        for (let i = objects.length - 1; i >= 0; i--) {
            const object = objects[i];
            if (object.isMask) continue;
            if (object.inViewport !== true) continue;
            for (const mask of object.masks) {
                this.resetTransform();
                mask.transform(renderer);
                mask.clip(renderer);
            }
            this.resetTransform();
            object.transform(renderer);
            context.globalAlpha = object.globalOpacity;
            if (typeof object.style === 'function') { object.style(renderer); }
            if (typeof object.draw === 'function') { object.draw(renderer); this.drawCallCount++; }
            if (object.isSelected) this.renderOutline(object);
        }
    }
    renderOutline(object) {
        const camera = this.camera;
        const context = this.context;
        context.globalAlpha = 1;
        context.lineWidth = OUTLINE_THICKNESS;
        context.strokeStyle = '#ffffff';
        this.resetTransform();
        object.globalMatrix.applyToVector(_center$1.set(0, 0));
        const centerRadius = Math.max(3 / camera.scale, 0.00001);
        context.beginPath();
        context.arc(_center$1.x, -_center$1.y, centerRadius, 0, 2 * Math.PI);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
        context.strokeStyle = this.selectColor.get(context);
        this.resetTransform();
        const box = object.boundingBox;
        object.globalMatrix.applyToVector(_topLeft$2.copy(box.min.x, box.max.y));
        object.globalMatrix.applyToVector(_topRight$2.copy(box.max.x, box.max.y));
        object.globalMatrix.applyToVector(_botRight$2.copy(box.max.x, box.min.y));
        object.globalMatrix.applyToVector(_botLeft$2.copy(box.min.x, box.min.y));
        context.beginPath();
        context.moveTo(_topLeft$2.x, -_topLeft$2.y);
        context.lineTo(_topRight$2.x, -_topRight$2.y);
        context.lineTo(_botRight$2.x, -_botRight$2.y);
        context.lineTo(_botLeft$2.x, -_botLeft$2.y);
        context.closePath();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.shadowBlur = 1;
        context.shadowColor = 'rgba(0, 0, 0, 0.25)';
        context.stroke();
        context.shadowBlur = 0;
        context.shadowColor = 'transparent';
    }
    resetTransform(applyToContext = true) {
        const offsetX = this.width / 2;
        const offsetY = this.height / -2;
        _reset.identity();
        _reset.translate(offsetX, offsetY);
        if (this.camera) _reset.multiply(this.camera.matrix);
        if (applyToContext) _reset.setContextTransform(this.context);
        return _reset;
    }
    screenToWorld(x, y) {
        if (!this.camera) return undefined;
        const offsetX = this.width / -2;
        const offsetY = this.height / 2;
        _world.identity();
        _world.multiply(this.camera.inverseMatrix);
        _world.translate(offsetX, offsetY);
        return _world.transformPoint(x, y);
    }
    worldToScreen(x, y) {
        if (!this.camera) return undefined;
        const offsetX = this.width / 2;
        const offsetY = this.height / -2;
        _screen.identity();
        _screen.translate(offsetX, offsetY);
        _screen.multiply(this.camera.matrix);
        return _screen.transformPoint(x, y);
    }
}

class Asset extends Thing {
    constructor(name = '') {
        super(name);
        this.isAsset = true;
        this.type = 'Asset';
        this.category = 'unknown';
    }
    toJSON() {
        const data = super.toJSON();
        data.category = this.category;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.category !== undefined) this.category = data.category;
        return this;
    }
}

class Palette extends Asset {
    constructor() {
        super('New Palette');
        this.isPalette = true;
        this.type = 'Palette';
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
    toJSON() {
        const data = super.toJSON();
        data.colors = JSON.stringify(this.colors);
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.colors !== undefined) this.colors = JSON.parse(data.colors);
        return this;
    }
}
AssetManager.register('Palette', Palette);

class Script extends Asset {
    constructor(format = SCRIPT_FORMAT.JAVASCRIPT, variables = false) {
        super('New Script');
        this.isScript = true;
        this.type = 'Script';
        this.format = format;
        this.position = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;
        this.selectFrom = 0;
        this.selectTo = 0;
        if (format === SCRIPT_FORMAT.JAVASCRIPT) {
            this.source = `//
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
        } else if (format === SCRIPT_FORMAT.PYTHON) {
            this.source = `# This program adds two numbers

num1 = 1.5
num2 = 6.3

# Add two numbers
sum = num1 + num2

# Display the sum
print('The sum of {0} and {1} is {2}'.format(num1, num2, sum))
`;
        }
    }
    toJSON() {
        const data = super.toJSON();
        data.format = this.format;
        data.position = this.position;
        data.scrollLeft = this.scrollLeft;
        data.scrollTop = this.scrollTop;
        data.selectFrom = this.selectFrom;
        data.selectTo = this.selectTo;
        data.source = this.source;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.format !== undefined) this.format = data.format;
        if (data.position !== undefined) this.position = data.position;
        if (data.scrollLeft !== undefined) this.scrollLeft = data.scrollLeft;
        if (data.scrollTop !== undefined) this.scrollTop = data.scrollTop;
        if (data.selectFrom !== undefined) this.selectFrom = data.selectFrom;
        if (data.selectTo !== undefined) this.selectTo = data.selectTo;
        if (data.source !== undefined) this.source = data.source;
        return this;
    }
}
AssetManager.register('Script', Script);
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
};
`);
    }
}

const _mouseBox = new Box2();
class Box extends Object2D {
    #box = new Box2();
    constructor() {
        super();
        this.type = 'Box';
        this.box = new Box2(new Vector2(-50, -50), new Vector2(50, 50));
        this.fillStyle = new ColorStyle('#ffffff');
        this.strokeStyle = new ColorStyle('#000000');
        this.lineWidth = 1;
        this.radius = 0;
        this.constantWidth = false;
        this.mouseBuffer = 0;
    }
    computeBoundingBox() {
        this.boundingBox.copy(this.box);
        this.#box.copy(this.box);
        return this.boundingBox;
    }
    isInside(point) {
        _mouseBox.copy(this.box);
        _mouseBox.expandByScalar(this.mouseBuffer);
        return _mouseBox.containsPoint(point);
    }
    draw(renderer) {
        if (this.box.equals(this.#box) === false) {
            this.computeBoundingBox();
        }
        const context = renderer.context;
        if (this.radius === 0) {
            context.beginPath();
            context.moveTo(this.box.min.x, this.box.min.y);
            context.lineTo(this.box.max.x, this.box.min.y);
            context.lineTo(this.box.max.x, this.box.max.y);
            context.lineTo(this.box.min.x, this.box.max.y);
            context.closePath();
        } else {
            const width = Math.abs(this.box.max.x - this.box.min.x);
            const height = Math.abs(this.box.max.y - this.box.min.y);
            const x = Math.min(this.box.min.x, this.box.max.x);
            const y = Math.min(this.box.min.y, this.box.max.y);
            const radius = this.radius;
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
        }
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fill();
        }
        if (this.strokeStyle) {
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.strokeStyle.get(context);
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.stroke();
            context.restore();
        }
    }
}
Thing.register('Box', Box);

class Circle extends Object2D {
    #radius = 25;
    constructor(radius = 25) {
        super();
        this.type = 'Circle';
        this.radius = radius;
        this.fillStyle = new ColorStyle('#ffffff');
        this.strokeStyle = new ColorStyle('#000000');
        this.lineWidth = 1;
        this.constantWidth = false;
        this.mouseBuffer = 0;
    }
    get radius() { return this.#radius; }
    set radius(value) {
        this.#radius = value;
        this.computeBoundingBox();
    }
    computeBoundingBox() {
        const radius = this.#radius;
        this.boundingBox.min.set(-radius, -radius);
        this.boundingBox.max.set(+radius, +radius);
        return this.boundingBox;
    }
    isInside(point) {
        return point.length() <= (this.#radius + this.mouseBuffer);
    }
    draw(renderer) {
        const context = renderer.context;
        context.beginPath();
        context.arc(0, 0, this.#radius, 0, 2 * Math.PI);
        if (this.fillStyle) {
            context.fillStyle = this.fillStyle.get(context);
            context.fill();
        }
        if (this.strokeStyle) {
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.strokeStyle.get(context);
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
}
Thing.register('Circle', Circle);

const _projection = new Matrix2();
class DomElement extends Object2D {
	constructor(element) {
		super();
		this.type = 'DomElement';
		this.size = new Vector2(100, 100);
		this.parentElement = null;
		this.dom = element ?? document.createElement('div');
		this.dom.style.pointerEvents = 'none';
		this.dom.style.transformStyle = 'preserve-3d';
		this.dom.style.position = 'absolute';
		this.dom.style.top = '0px';
		this.dom.style.left = '0px';
		this.dom.style.transformOrigin = '0px 0px';
		this.dom.style.overflow = 'none';
		this.dom.style.zIndex = '1';
	}
    computeBoundingBox() {
		this.boundingBox.min.set(0, -this.size.y);
        this.boundingBox.max.set(this.size.x, 0);
		return this.boundingBox;
    }
    isInside(point) {
        return this.boundingBox.containsPoint(point);
    }
	onAdd() {
		if (this.parentElement) this.parentElement.appendChild(this.dom);
	}
	onRemove() {
		if (this.parentElement) this.parentElement.removeChild(this.dom);
	}
	onUpdate(renderer) {
		this.dom.style.display = this.inViewport ? '' : 'none';
	}
	transform(renderer) {
		if (this.parentElement == null) {
			this.parentElement = renderer.dom.parentElement;
			this.parentElement.appendChild(this.dom);
		}
		if (this.ignoreViewport) {
			this.dom.style.transform = this.globalMatrix.cssTransform();
		} else {
			_projection.copy(renderer.resetTransform(false ));
			_projection.multiply(this.globalMatrix);
			this.dom.style.transform = _projection.cssTransform();
		}
		this.dom.style.width = `${this.size.x}px`;
		this.dom.style.height = `${this.size.y}px`;
		this.dom.style.display = this.visible ? '' : 'none';
	}
	setSize(width, height) {
		this.size.set(width, height);
		this.computeBoundingBox();
	}
}
Thing.register('DomElement', DomElement);

const _globalPoint = new Vector2();
const _globalFrom = new Vector2();
const _globalTo = new Vector2();
const _scale$1 = new Vector2();
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
        this.mouseBuffer = 5;
        this.dashPattern = [];
    }
    computeBoundingBox() {
        this.boundingBox.setFromPoints(this.from, this.to);
        return this.boundingBox;
    }
    isInside(point) {
        this.globalMatrix.applyToVector(_globalPoint.copy(point));
        this.globalMatrix.applyToVector(_globalFrom.copy(this.from));
        this.globalMatrix.applyToVector(_globalTo.copy(this.to));
        const x = _globalPoint.x;
        const y = _globalPoint.y;
        const x1 = _globalFrom.x;
        const y1 = _globalFrom.y;
        const x2 = _globalTo.x;
        const y2 = _globalTo.y;
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
            this.globalMatrix.getScale(_scale$1);
            const scalePercent = (Math.abs(_scale$1.x * xyPercent.y) + Math.abs(_scale$1.y * xyPercent.x)) / (xyPercent.x + xyPercent.y);
            scaledLineWidth = MathUtils.sanity(this.lineWidth * scalePercent);
        }
        const buffer = (scaledLineWidth / 2) + (this.mouseBuffer / this.#cameraScale);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        if (lengthSquared === 0) return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)) <= buffer;
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
        context.moveTo(this.from.x, - this.from.y);
        context.lineTo(this.to.x, - this.to.y);
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
Thing.register('Line', Line);

class Pattern extends Box {
    #box = new Box2();
    constructor(src) {
        super();
        this.type = 'Pattern';
	    this.image = document.createElement('img');
	    if (src) this.setImage(src);
        this.repetition = 'repeat';
    }
    setImage(src) {
        const self = this;
        this.image.onload = function() {
            self.box.min.set(0, 0);
            self.box.max.set(self.image.naturalWidth, self.image.naturalHeight);
            self.computeBoundingBox();
        };
        this.image.src = src;
    }
    draw(renderer) {
        if (this.box.equals(this.#box) === false) {
            this.computeBoundingBox();
        }
        const context = renderer.context;
        if (this.image.src.length > 0 && this.image.complete) {
            const width = this.box.max.x - this.box.min.x;
	        const height = this.box.max.y - this.box.min.y;
            const pattern = context.createPattern(this.image, this.repetition);
		    context.fillStyle = pattern;
		    context.fillRect(this.box.min.x, - this.box.max.y, width, height);
        }
    }
}
Thing.register('Pattern', Pattern);

const ALPHA_THRESHOLD = 5;
class PolyUtils {
    static isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;
            const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    static isPointInConcavePolygon(point, polygon) {
        function isLeft(p1, p2, point) {
            return (p2.x - p1.x) * (point.y - p1.y) - (point.x - p1.x) * (p2.y - p1.y);
        }
        let windingNumber = 0;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];
            if (p1.y <= point.y) {
                if (p2.y > point.y && isLeft(p1, p2, point) > 0) windingNumber++;
            } else {
                if (p2.y <= point.y && isLeft(p1, p2, point) < 0) windingNumber--;
            }
        }
        return windingNumber !== 0;
    }
    static findObjects(maskData, simplify = 1.0) {
        const width = maskData.width;
        const height = maskData.height;
        const visited = new Array(width * height).fill(false);
        for (let x = 0; x < width; x++) PolyUtils.floodFill(x, 0, maskData, visited, 'border');
        for (let x = 0; x < width; x++) PolyUtils.floodFill(x, height - 1, maskData, visited, 'border');
        for (let y = 0; y < height; y++) PolyUtils.floodFill(0, y, maskData, visited, 'border');
        for (let y = 0; y < height; y++) PolyUtils.floodFill(width - 1, y, maskData, visited, 'border');
        const objects = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alreadyVisited = visited[y * width + x];
                const alphaValue = maskData.data[(y * width + x) * 4 + 3];
                if (!alreadyVisited && alphaValue > ALPHA_THRESHOLD) {
                    const pixels = PolyUtils.floodFill(x, y, maskData, visited, 'object');
                    if (pixels.length > 0) {
                        const holes = PolyUtils.findHoles(pixels, maskData, visited);
                        const outerContour = PolyUtils.traceContour(pixels, maskData);
                        objects.push({ outerContour, holes });
                    }
                }
            }
        }
        const contours = [];
        objects.forEach((object) => {
            if (object.outerContour.length > 0) {
                const simplifiedOuterContour = PolyUtils.simplifyContour(object.outerContour, simplify);
                contours.push({ outerContour: simplifiedOuterContour, holes: [] });
                object.holes.forEach((hole) => {
                    if (hole.length > 0) {
                        const simplifiedHole = PolyUtils.simplifyContour(hole, simplify);
                        contours[contours.length - 1].holes.push(simplifiedHole);
                    }
                });
            }
        });
        return contours;
    }
    static findHoles(pixels, maskData, visited) {
        const width = maskData.width;
        const height = maskData.height;
        const minX = Math.min(...pixels.map(point => point[0]));
        const maxX = Math.max(...pixels.map(point => point[0]));
        const minY = Math.min(...pixels.map(point => point[1]));
        const maxY = Math.max(...pixels.map(point => point[1]));
        const objectVisited = [ ...visited ];
        for (const [ x, y ] of pixels) {
            objectVisited[y * width + x] = true;
        }
        for (let x = minX; x <= maxX; x++) PolyUtils.floodFill(x, minY, maskData, objectVisited, 'border');
        for (let x = minX; x <= maxX; x++) PolyUtils.floodFill(x, maxY, maskData, objectVisited, 'border');
        for (let y = minY; y <= maxY; y++) PolyUtils.floodFill(minX, y, maskData, objectVisited, 'border');
        for (let y = minY; y <= maxY; y++) PolyUtils.floodFill(maxX, y, maskData, objectVisited, 'border');
        let holes = [];
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const alreadyVisited = objectVisited[y * width + x];
                const alphaValue = maskData.data[(y * width + x) * 4 + 3];
                if (!alreadyVisited && alphaValue <= ALPHA_THRESHOLD) {
                    const hole = PolyUtils.floodFill(x, y, maskData, objectVisited, 'hole');
                    if (hole.length > 0) holes.push(PolyUtils.traceContour(hole, maskData, true ));
                }
            }
        }
        return holes;
    }
    static floodFill(x, y, maskData, visited, type) {
        const width = maskData.width;
        const height = maskData.height;
        const queue = [ [ x, y ] ];
        const directions = [ [  0,  1 ], [  1,  0 ], [  0, -1 ], [ -1,  0 ], ];
        const floodedPixels = [];
        while (queue.length > 0) {
            const [ cx, cy ] = queue.shift();
            const index = cy * width + cx;
            if (cx < 0 || cx >= width) continue;
            if (cy < 0 || cy >= height) continue;
            if (visited[index]) continue;
            if (type === 'border' && maskData.data[index * 4 + 3] > ALPHA_THRESHOLD) continue;
            if (type === 'object' && maskData.data[index * 4 + 3] <= ALPHA_THRESHOLD) continue;
            if (type === 'hole') {  }
            visited[index] = true;
            floodedPixels.push([ cx, cy ]);
            for (let i = 0; i < 4; i++) {
                const nx = cx + directions[i][0];
                const ny = cy + directions[i][1];
                queue.push([ nx, ny ]);
            }
        }
        return floodedPixels;
    }
    static traceContour(pixels, maskData, isHole = false) {
        if (!pixels || pixels.length === 0) return [];
        const width = maskData.width;
        const height = maskData.height;
        const contour = [];
        const directions = [ [  1,  0 ], [  0,  1 ], [ -1,  0 ], [  0, -1 ], ];
        let startX = pixels[0][0];
        let startY = pixels[0][1];
        let currentX = startX;
        let currentY = startY;
        let dir = isHole ? 2 : 0;
        do {
            contour.push([ currentX, currentY ]);
            for (let i = 0; i < 4; i++) {
                const newDir = (dir + i) % 4;
                const newX = currentX + directions[newDir][0];
                const newY = currentY + directions[newDir][1];
                let opaque = true;
                opaque = opaque && (newX >= 0 && newX < width && newY >= 0 && newY < height);
                opaque = opaque && (maskData.data[((newY * width + newX) * 4) + 3] > ALPHA_THRESHOLD);
                if (isHole ? !opaque : opaque) {
                    currentX = newX;
                    currentY = newY;
                    dir = (newDir + 3) % 4;
                    break;
                }
            }
        } while (currentX !== startX || currentY !== startY);
        return contour;
    }
    static simplifyContour(contour, tolerance = 1) {
        function perpendicularDistance(point, lineStart, lineEnd) {
            const dx = lineEnd[0] - lineStart[0];
            const dy = lineEnd[1] - lineStart[1];
            const norm = Math.sqrt(dx * dx + dy * dy);
            const nx = dy / norm;
            const ny = -dx / norm;
            const vx = point[0] - lineStart[0];
            const vy = point[1] - lineStart[1];
            return Math.abs(nx * vx + ny * vy);
        }
        function simplifySegment(contour, start, end, tolerance, simplified) {
            let maxDist = 0;
            let maxIndex = 0;
            for (let i = start + 1; i < end; i++) {
                const dist = perpendicularDistance(contour[i], contour[start], contour[end]);
                if (dist > maxDist) {
                    maxDist = dist;
                    maxIndex = i;
                }
            }
            if (maxDist > tolerance) {
                simplifySegment(contour, start, maxIndex, tolerance, simplified);
                simplified.push(contour[maxIndex]);
                simplifySegment(contour, maxIndex, end, tolerance, simplified);
            }
        }
        const simplified = [ contour[0] ];
        simplifySegment(contour, 0, contour.length - 1, tolerance, simplified);
        simplified.push(contour[contour.length - 1]);
        const dx = simplified[simplified.length - 1][0] - simplified[0][0];
        const dy = simplified[simplified.length - 1][1] - simplified[0][1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < tolerance) simplified[simplified.length - 1] = simplified[0];
        return simplified;
    }
}

const PATTERN_SPACING = 5;
const SIMPLIFY_AMOUNT = 0.2;
let _pattern;
class Sprite extends Box {
    #box = new Box2();
    constructor(src) {
        super();
        this.type = 'Sprite';
	    this.image = document.createElement('img');
        this.patternStyle = new ColorStyle('--icon');
        this.contours = [];
        this.path = new Path2D();
	    if (src) this.setImage(src);
    }
    setImage(src) {
        const self = this;
        this.image.onload = function() {
            const width = self.image.naturalWidth;
            const height = self.image.naturalWidth;
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            self.box.min.set(-halfWidth, -halfHeight);
            self.box.max.set(+halfWidth, +halfHeight);
            self.computeBoundingBox();
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskContext = maskCanvas.getContext('2d');
            maskContext.drawImage(self.image, 0, 0, width, height, 0, 0, width, height);
            const imageData = maskContext.getImageData(0, 0, width, height);
            const alphaData = imageData.data;
            const maskData = maskContext.createImageData(width, height);
            const maskPixels = maskData.data;
            for (let i = 3; i < alphaData.length; i += 4) {
                const alpha = alphaData[i];
                maskPixels[i - 3] = alpha;
                maskPixels[i - 2] = alpha;
                maskPixels[i - 1] = alpha;
                maskPixels[i] = alpha;
            }
            maskContext.putImageData(maskData, 0, 0);
            self.contours = PolyUtils.findObjects(maskData, SIMPLIFY_AMOUNT);
            const path = new Path2D();
            for (const contour of self.contours) {
                const outerContour = contour.outerContour;
                path.moveTo(outerContour[0][0] - halfWidth, outerContour[0][1] - halfHeight);
                for (let i = 1; i < outerContour.length; i++) {
                    path.lineTo(outerContour[i][0] - halfWidth, outerContour[i][1] - halfHeight);
                }
                path.closePath();
                for (const hole of contour.holes) {
                    const hl = hole.length - 1;
                    path.moveTo(hole[hl][0] - halfWidth, hole[hl][1] - halfHeight);
                    for (let i = hl - 1; i >= 0; i--) {
                        path.lineTo(hole[i][0] - halfWidth, hole[i][1] - halfHeight);
                    }
                    path.closePath();
                }
            }
            self.path = path;
        };
        this.image.src = src;
    }
    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;
        if (!_pattern) {
            const color = this.patternStyle.get(context);
            const lineWidth = 0.5;
            const spacing = PATTERN_SPACING;
            _pattern = context.createPattern(createCrossHatchPattern(color, lineWidth, spacing), 'repeat');
        }
        if (this.box.equals(this.#box) === false) this.computeBoundingBox();
        if (this.image.src.length === 0 || !this.image.complete) return;
        const width = this.image.naturalWidth;
        const height = this.image.naturalHeight;
        const sx = 0;
        const sy = 0;
        const sw = width;
        const sh = height;
        const dx = width / -2;
        const dy = height / -2;
        const dw = width;
        const dh = height;
        if (context.globalAlpha < 0.05) {
            context.save();
            context.globalAlpha = 1;
            const scaledPath = new Path2D();
            scaledPath.addPath(this.path, new DOMMatrix([ camera.scale, 0, 0, camera.scale, 0, 0 ]));
            context.scale(1 / camera.scale, 1 / camera.scale);
            context.clip(scaledPath);
            context.fillStyle = _pattern;
            context.fillRect(dx * camera.scale, dy * camera.scale, dw * camera.scale, dh * camera.scale);
            context.strokeStyle = this.patternStyle.get(context);
            context.lineWidth = 1.5;
            context.stroke(scaledPath);
            context.restore();
        } else {
            context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
}
Thing.register('Sprite', Sprite);
function createCrossHatchPattern(color, lineWidth, spacing) {
    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    const size = spacing * 2;
    patternCanvas.width = size;
    patternCanvas.height = size;
    patternContext.strokeStyle = color;
    patternContext.lineWidth = lineWidth;
    patternContext.beginPath();
    patternContext.moveTo(0, 0);    patternContext.lineTo(size, size);
    patternContext.moveTo(size, 0); patternContext.lineTo(0, size);
    patternContext.stroke();
    return patternCanvas;
}

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
        this.textAlign = 'center';
        this.textBaseline = 'middle';
    }
    computeBoundingBox(renderer) {
        this.#needsBounds = true;
        if (renderer) {
            const context = renderer.context;
            context.font = this.font;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;
            const lines = this.text.split('\n');
            const fontSize = parseInt(this.font.match(/\d+/), 10);
            const lineHeight = fontSize * this.lineHeight;
            let maxWidth = 0;
            lines.forEach((line) => {
                const textMetrics = context.measureText(line);
                const textWidth = textMetrics.width;
                maxWidth = Math.max(maxWidth, textWidth);
            });
            const textMetrics = context.measureText(this.text);
            const textHeight = Math.max(textMetrics.actualBoundingBoxAscent, textMetrics.actualBoundingBoxDescent) * 2.0;
            const totalHeight = (lines.length * textHeight) + ((lines.length - 1) * ((textHeight * this.lineHeight) - textHeight));
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
        const lines = this.text.split('\n');
        const fontSize = parseInt(this.font.match(/\d+/), 10);
        const lineHeight = fontSize * this.lineHeight;
        const offset = ((lines.length - 1) * lineHeight) / 2;
        let x = 0;
        if (this.textAlign === 'center') {
            x = 0;
        } else if (this.textAlign === 'left') {
            x = this.boundingBox.min.x;
        } else if (this.textAlign === 'right') {
            x = this.boundingBox.max.x;
        }
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

class Mask extends Object2D {
    constructor() {
        super();
        this.isMask = true;
        this.type = 'Mask';
    }
    clip(renderer) {
    }
}
Thing.register('Mask', Mask);

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
    clip(renderer) {
        const context = renderer.context;
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
Thing.register('BoxMask', BoxMask);

class LinearGradientStyle extends Style {
    constructor() {
        super();
        this.colors = [];
        this.start = new Vector2(-100, 0);
        this.end = new Vector2(100, 0);
    }
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

class RadialGradientStyle extends Style {
    constructor() {
        super();
        this.colors = [];
        this.start = new Vector2(0, 0);
        this.startRadius = 10;
        this.end = new Vector2(0, 0);
        this.endRadius = 50;
    }
    addColorStop(offset, color) {
        this.colors.push({ offset, color });
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

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}

const ZOOM_MAX = 25;
const ZOOM_MIN = 0.01;
const _rotate$1 = new Matrix2();
class CameraControls {
    constructor(camera) {
        this.camera = camera;
        this.allowDrag = true;
        this.allowScale = true;
        this.allowRotation = true;
        this.dragButton = Pointer.RIGHT;
        this.dragButton2 = Pointer.LEFT;
        this.rotateButton = Pointer.MIDDLE;
        this.animateID = -1;
        this.dragID = -1;
        this.dragging = false;
        this.rotationPoint = new Vector2(0, 0);
        this.rotationInitial = 0;
    }
    update(renderer) {
        const camera = this.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        if (pointer.buttonDoubleClicked(Pointer.LEFT) && camera && renderer.scene) {
            if (!keyboard.modifierPressed()) {
                const worldPoint = renderer.screenToWorld(pointer.position);
                const objects = renderer.scene.getWorldPointIntersections(worldPoint);
                if (objects.length === 0) {
                    this.focusCamera(renderer, renderer.scene);
                } else {
                    const object = objects[0];
                    if (object.focusable) this.focusCamera(renderer, object);
                }
            }
        }
        if (this.allowScale && pointer.wheel !== 0) {
            let scaleFactor = pointer.wheel * 0.0015 * camera.scale;
            if (pointer.wheel < 0) scaleFactor = Math.max(scaleFactor, camera.scale - ZOOM_MAX);
            if (pointer.wheel > 0) scaleFactor = Math.min(scaleFactor, camera.scale - ZOOM_MIN);
            const beforePosition = renderer.screenToWorld(pointer.position);
            camera.scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, camera.scale - scaleFactor));
            camera.updateMatrix(true);
            const afterPosition = renderer.screenToWorld(pointer.position);
            const delta = afterPosition.clone().sub(beforePosition);
            camera.position.sub(delta.x, delta.y);
            camera.matrixNeedsUpdate = true;
        }
        if (this.allowRotation) {
            if (pointer.buttonJustPressed(this.rotateButton)) {
                this.rotationPoint.copy(pointer.position);
                this.rotationInitial = camera.rotation;
            } else if (pointer.buttonPressed(this.rotateButton)) {
                const point = pointer.position.clone().sub(this.rotationPoint);
                camera.rotation = this.rotationInitial + (point.x * -0.01);
                camera.matrixNeedsUpdate = true;
            }
        }
        if (this.allowDrag) {
            let wantsToDrag = pointer.buttonPressed(this.dragButton, this.dragID);
            renderer.dom.style.cursor = wantsToDrag ? 'grabbing' : '';
            if (!wantsToDrag) {
                if (keyboard.spacePressed()) {
                    if (pointer.buttonPressed(this.dragButton2, this.dragID)) {
                        renderer.dom.style.cursor = 'grabbing';
                        wantsToDrag = true;
                    } else {
                        renderer.dom.style.cursor = 'grab';
                    }
                } else {
                    renderer.dom.style.cursor = '';
                }
            }
            if (wantsToDrag) {
                if (!this.dragging) {
                    this.dragID = pointer.lock();
                    this.dragging = true;
                }
                _rotate$1.identity().rotate(camera.rotation);
                const delta = _rotate$1.transformPoint(pointer.delta.x / camera.scale, pointer.delta.y / camera.scale);
                camera.position.sub(delta.x, delta.y * -1);
                camera.matrixNeedsUpdate = true;
            } else {
                pointer.unlock();
                this.dragging = false;
            }
        }
    }
    focusCamera(renderer, object, animationDuration = 200 ) {
        if (!animationDuration) animationDuration = 1;
        if (this.animateID) cancelAnimationFrame(this.animateID);
        let targetScale = 1;
        let targetPosition = new Vector2(0, 0);
        if (object) {
            const bounds = new Box2();
            object.traverse((child) => {
                const childBounds = child.getWorldBoundingBox();
                let finite = true;
                finite = finite && Number.isFinite(childBounds.min.x);
                finite = finite && Number.isFinite(childBounds.min.y);
                finite = finite && Number.isFinite(childBounds.max.x);
                finite = finite && Number.isFinite(childBounds.max.y);
                if (finite && child.focusable) bounds.union(childBounds);
            });
            if (Number.isFinite(bounds.getSize().x) && Number.isFinite(bounds.getSize().y)) {
                targetScale = 0.2 * Math.min(renderer.width / bounds.getSize().x, renderer.height / bounds.getSize().y);
                targetPosition = bounds.getCenter();
            }
        }
        targetScale = Math.abs(targetScale);
        const camera = this.camera;
        const startTime = performance.now();
        const startPosition = camera.position.clone();
        const startScale = camera.scale;
        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / animationDuration, 1);
            camera.position.lerpVectors(startPosition, targetPosition, t);
            camera.scale = (startScale * (1.0 - t)) + (targetScale * t);
            camera.matrixNeedsUpdate = true;
            if (t < 1) this.animateID = requestAnimationFrame(animate);
        };
        animate();
    }
}

const CURSOR_ROTATE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij48cGF0aCBkPSJNMjEuMjQ3LDUuODY3YzAuNDE3LC0wLjQ1MiAxLjAzNiwtMC42NjYgMS42NDcsLTAuNTYzYzAuNjQ0LDAuMTA5IDEuMTgsMC41NTMgMS40MDcsMS4xNjRsMS44MjQsNC45MDFjMC4yMjcsMC42MTEgMC4xMTEsMS4yOTggLTAuMzA1LDEuODAxYy0wLjQxNiwwLjUwMyAtMS4wNjksMC43NDUgLTEuNzEzLDAuNjM2bC01LjE1NCwtMC44NzRjLTAuNjQ0LC0wLjEwOSAtMS4xOCwtMC41NTMgLTEuNDA3LC0xLjE2NWMtMC4xNzksLTAuNDgxIC0wLjE0NSwtMS4wMDggMC4wOCwtMS40NTVjLTAuNTIxLC0wLjE0OCAtMS4wNjQsLTAuMjI1IC0xLjYxNSwtMC4yMjVjLTMuMjY0LDAgLTUuOTEzLDIuNjUgLTUuOTEzLDUuOTEzYy0wLDMuMjYzIDIuNjQ5LDUuOTEzIDUuOTEzLDUuOTEzYzEuNjQsMCAzLjIwNiwtMC42ODEgNC4zMjQsLTEuODhjMC42ODgsLTAuNzM4IDEuODQ0LC0wLjc3OCAyLjU4MiwtMC4wOWwxLjM0NiwxLjI1NWMwLjczNywwLjY4OCAwLjc3OCwxLjg0MyAwLjA5LDIuNTgxYy0yLjE1OCwyLjMxNCAtNS4xNzksMy42MjcgLTguMzQyLDMuNjI3Yy02LjI5NSwwIC0xMS40MDYsLTUuMTExIC0xMS40MDYsLTExLjQwNmMtMCwtNi4yOTUgNS4xMTEsLTExLjQwNiAxMS40MDYsLTExLjQwNmMxLjgzOCwtMCAzLjYzMSwwLjQ0MyA1LjIzNiwxLjI3M1oiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHBhdGggZD0iTTE5LjgzNSw5Ljc2N2wtMC45MDUsMS4wOTNjLTAuMDk3LDAuMTE3IC0wLjEyNCwwLjI3NyAtMC4wNzEsMC40MTljMC4wNTMsMC4xNDMgMC4xNzgsMC4yNDYgMC4zMjgsMC4yNzJsNS4xNTQsMC44NzRjMC4xNTEsMC4wMjYgMC4zMDMsLTAuMDMxIDAuNCwtMC4xNDhjMC4wOTcsLTAuMTE3IDAuMTI0LC0wLjI3NyAwLjA3MSwtMC40MmwtMS44MjMsLTQuOWMtMC4wNTMsLTAuMTQzIC0wLjE3OCwtMC4yNDYgLTAuMzI4LC0wLjI3MWMtMC4xNSwtMC4wMjYgLTAuMzAyLDAuMDMxIC0wLjM5OSwwLjE0OGwtMC42OTksMC44NDRjLTEuNjMyLC0xLjA5MSAtMy41NjIsLTEuNjgzIC01LjU1MiwtMS42ODNjLTUuNTIyLC0wIC0xMC4wMDYsNC40ODMgLTEwLjAwNiwxMC4wMDVjMCw1LjUyMiA0LjQ4NCwxMC4wMDUgMTAuMDA2LDEwLjAwNWMyLjc3NSwwIDUuNDI1LC0xLjE1MiA3LjMxNywtMy4xODFjMC4xNjEsLTAuMTcyIDAuMTUxLC0wLjQ0MiAtMC4wMjEsLTAuNjAybC0xLjM0NSwtMS4yNTVjLTAuMTcyLC0wLjE2IC0wLjQ0MiwtMC4xNTEgLTAuNjAyLDAuMDIxYy0xLjM4MywxLjQ4MyAtMy4zMjEsMi4zMjYgLTUuMzQ5LDIuMzI2Yy00LjAzNywtMCAtNy4zMTQsLTMuMjc3IC03LjMxNCwtNy4zMTRjMCwtNC4wMzcgMy4yNzcsLTcuMzE0IDcuMzE0LC03LjMxNGMxLjM2LDAgMi42ODIsMC4zNzkgMy44MjQsMS4wODFaIi8+PC9zdmc+';
let _lastRenderer = null;
const _position$1 = new Vector2();
const _topLeft$1 = new Vector2();
const _topRight$1 = new Vector2();
const _botLeft$1 = new Vector2();
const _botRight$1 = new Vector2();
const _objectMatrix = new Matrix2();
const _rotateMatrix = new Matrix2();
const dragger = Object.assign(new Circle(10), { type: 'Resizer', selectable: false, focusable: false });
class ResizeHelper extends Box {
    static ALL = 0;
    static RESIZE = 1;
    static ROTATE = 2;
    constructor(objects, radius = 5, tools = ResizeHelper.ALL) {
        if (!objects) return console.error(`ResizeHelper(): Missing 'objects' argument`);
        objects = Array.isArray(objects) ? objects : [ objects ];
        if (objects.length === 0) return console.error(`ResizeHelper(): Objects array is empty`);
        super();
        this.isHelper = true;
        this.type = 'ResizeHelper';
        this.pointerEvents = true;
        this.draggable = true;
        this.focusable = true;
        this.selectable = false;
        this.lateUpdate = true;
        this.fillStyle = null;
        this.strokeStyle = null;
        let topLayer = 0;
        let bottomLayer = 0;
        for (const object of objects) {
            topLayer = Math.max(topLayer, object.layer + 1);
            bottomLayer = Math.max(bottomLayer, object.layer - 1);
        }
        this.layer = topLayer;
        const background = Object.assign(new Box(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        background.isHelper = true;
        background.layer = bottomLayer;
        background.fillStyle.color = 'rgba(--icon-dark, 0.35)';
        background.fillStyle.fallback = 'rgba(0, 85, 102, 0.35)';
        background.strokeStyle.color = 'rgba(--icon-dark, 0.35)';
        background.strokeStyle.fallback = 'rgba(0, 85, 102, 0.35)';
        background.lineWidth = 2;
        background.constantWidth = true;
        background.visible = false;
        this.add(background);
        this.background = background;
        const self = this;
        this.objects = objects;
        const initialTransforms = {};
        for (const object of objects) {
            initialTransforms[object.uuid] = {
                position: object.position.clone(),
                scale: object.scale.clone(),
                rotation: object.rotation,
            };
        }
        let firstRotation = MathUtils.equalizeAngle0to360(objects[0].rotation, false );
        let sameRotation = true;
        for (const object of objects) {
            let nextRotation = MathUtils.equalizeAngle0to360(object.rotation, false );
            sameRotation = sameRotation && MathUtils.fuzzyFloat(firstRotation, nextRotation, MathUtils.degreesToRadians(1));
        }
        const worldBox = new Box2();
        let center;
        if (sameRotation || objects.length === 1) {
            this.rotation = objects[0].rotation;
            worldBox.clear();
            const rotationMatrix = new Matrix2().rotate(this.rotation);
            const unRotateMatrix = new Matrix2().rotate(-this.rotation);
            for (const object of objects) {
                const unRotatedPosition = unRotateMatrix.transformPoint(object.position);
                _objectMatrix.compose(unRotatedPosition.x, unRotatedPosition.y, object.scale.x, object.scale.y, 0, 0, 0);
                const box = object.boundingBox;
                _objectMatrix.applyToVector(_topLeft$1.copy(box.min));
                _objectMatrix.applyToVector(_topRight$1.copy(box.max.x, box.min.y));
                _objectMatrix.applyToVector(_botLeft$1.copy(box.min.x, box.max.y));
                _objectMatrix.applyToVector(_botRight$1.copy(box.max));
                const unrotatedBox = new Box2().setFromPoints(_topLeft$1, _topRight$1, _botLeft$1, _botRight$1);
                worldBox.union(unrotatedBox);
            }
            const rotatedCenter = worldBox.getCenter();
            center = rotationMatrix.transformPoint(rotatedCenter);
            for (const object of objects) {
                const position = object.position.clone().sub(center);
                const initialPosition = unRotateMatrix.transformPoint(position).add(center);
                initialTransforms[object.uuid].position.copy(initialPosition);
            }
        } else {
            for (const object of objects) {
                worldBox.union(object.getWorldBoundingBox());
            }
            center = worldBox.getCenter();
        }
        const halfSize = worldBox.getSize().multiplyScalar(0.5);
        this.position.copy(center);
        this.box.set(new Vector2(-halfSize.x, -halfSize.y), new Vector2(+halfSize.x, +halfSize.y));
        this.computeBoundingBox();
        this.updateMatrix(true);
        const startPosition = this.position.clone();
        const startRotation = this.rotation;
        const startScale = this.scale.clone();
        this.origin = new Vector2();
        if (objects.length === 1) {
            objects[0].matrix.applyToVector(this.origin);
            this.inverseGlobalMatrix.applyToVector(this.origin);
        }
        let topLeft, topRight, bottomLeft, bottomRight;
        let topResizer, rightResizer, bottomResizer, leftResizer;
        let rotater, topLine, zeroLine, rotateLine;
        if (tools === ResizeHelper.ALL || tools === ResizeHelper.RESIZE) {
            function createResizer(name, x, y, type = 'box', addRotation, alpha, color) {
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
                resizer.name = name;
                resizer.type = 'Resizer';
                resizer.draggable = true;
                resizer.focusable = false;
                resizer.selectable = false;
                resizer.mouseBuffer = 5;
                resizer.layer = topLayer + 1;
                resizer.opacity = alpha;
                resizer.constantWidth = true;
                switch (type) {
                    case 'box':
                    case 'circle':
                        if (color) {
                            resizer.fillStyle = new ColorStyle(color);
                        } else {
                            resizer.fillStyle = new LinearGradientStyle();
                            resizer.fillStyle.start.set(-radius, -radius);
                            resizer.fillStyle.end.set(radius, radius);
                            resizer.fillStyle.addColorStop(0, '--icon-light');
                            resizer.fillStyle.addColorStop(1, '--icon-dark');
                        }
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = OUTLINE_THICKNESS;
                        break;
                    case 'line':
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = OUTLINE_THICKNESS;
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
                    let rotation = self.rotation;
                    if (self.scale.x < 0 && self.scale.y > 0 || self.scale.x > 0 && self.scale.y < 0) {
                        rotation -= (addRotation * (Math.PI / 180));
                    } else {
                        rotation += (addRotation * (Math.PI / 180));
                    }
                    rotation = (rotation + camera.rotation) * 180 / Math.PI;
                    rotation = 360 - rotation;
                    const normalizedRotation = MathUtils.equalizeAngle0to360(rotation, true );
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
                let startDragPosition, startDragRotation, startDragScale;
                let startBox, worldPositionStart;
                resizer['onPointerDragStart'] = function(renderer) {
                    startBox = self.boundingBox.clone();
                    startDragPosition = self.position.clone();
                    startDragRotation = self.rotation;
                    startDragScale = self.scale.clone();
                    self.parent.add(dragger);
                    dragger.type = 'Resizer';
                    dragger.resizeHelper = self;
                    dragger['onPointerDragEnd'] = function(renderer) {
                        if (self.parent) self.parent.remove(dragger);
                    };
                    dragger['onPointerDrag'] = function(renderer) {
                        Object2D.prototype.onPointerDrag.call(this, renderer);
                        updateResizer(renderer);
                    };
                    dragger.setPosition = function(x, y) {
                        Object2D.prototype.setPosition.call(this, x, y);
                        updateResizer();
                        return dragger;
                    };
                    const worldPosition = resizer.getWorldPosition();
                    const parentPosition = self.parent.inverseGlobalMatrix.transformPoint(worldPosition);
                    dragger.position.copy(parentPosition);
                    dragger.cursor = resizer.cursor;
                    dragger.fillStyle = null;
                    dragger.strokeStyle = null;
                    dragger.pointerStartPosition = renderer.pointer.position.clone();
                    dragger.dragStartPosition = dragger.position.clone();
                    worldPositionStart = worldPosition.clone();
                    renderer.setDragObject(dragger);
                };
                function updateResizer(renderer = _lastRenderer) {
                    if (renderer) _lastRenderer = renderer;
                    const localPositionStart = self.inverseGlobalMatrix.transformPoint(worldPositionStart);
                    const worldPositionEnd = dragger.getWorldPosition();
                    const localPositionEnd = self.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                    const delta = localPositionStart.clone().sub(localPositionEnd).multiply(self.scale);
                    if (x === 0) delta.x = 0;
                    if (y === 0) delta.y = 0;
                    delta.multiplyScalar(0.5);
                    const size = startBox.getSize();
                    const scaleX = MathUtils.sanity((x === 0) ? 0 : 2 / size.x);
                    const scaleY = MathUtils.sanity((y === 0) ? 0 : 2 / size.y);
                    if (renderer?.keyboard?.shiftPressed() && x !== 0 && y !== 0) {
                        const aspectRatio = (size.x * startDragScale.x) / (size.y * startDragScale.y);
                        if (Math.abs(aspectRatio) < Math.abs(delta.x / delta.y)) {
                            delta.y = delta.x / aspectRatio;
                            if (x !== y) delta.y *= -1;
                        } else {
                            delta.x = delta.y * aspectRatio;
                            if (x !== y) delta.x *= -1;
                        }
                    }
                    const scale = new Vector2(scaleX, scaleY);
                    const positionOffset = new Vector2();
                    if (renderer?.keyboard?.ctrlPressed()) {
                        positionOffset.x = ((self.origin.x - startBox.min.x) / size.x) * -2;
                        positionOffset.y = ((self.origin.y - startBox.min.y) / size.y) * -2;
                        if (x > 0) positionOffset.x = -2 - positionOffset.x;
                        if (y > 0) positionOffset.y = -2 - positionOffset.y;
                        positionOffset.multiply(delta);
                    } else {
                        positionOffset.copy(startBox.getCenter());
                        positionOffset.multiply(delta).multiply(scale).multiply(x, y);
                    }
                    const rotationMatrix = new Matrix2().rotate(startDragRotation);
                    const rotatedDelta = rotationMatrix.transformPoint(delta);
                    const rotatedPositionOffset = rotationMatrix.transformPoint(positionOffset);
                    self.position.copy(startDragPosition).sub(rotatedDelta).sub(rotatedPositionOffset);
                    delta.multiply(x, y).multiply(scale);
                    self.scale.copy(startDragScale).add(delta);
                    self.scale.x = MathUtils.noZero(MathUtils.sanity(self.scale.x));
                    self.scale.y = MathUtils.noZero(MathUtils.sanity(self.scale.y));
                    self.updateMatrix(true);
                    for (const object of objects) {
                        const initialTransform = initialTransforms[object.uuid];
                        const rotatedScale = self.scale.clone();
                        let initialRotation = initialTransform.rotation - startRotation;
                        initialRotation = MathUtils.equalizeAngle0to360(initialRotation, false);
                        const fortyFive = Math.PI / 4;
                        let flip = false;
                        if      (initialRotation < fortyFive * 1) flip = false;
                        else if (initialRotation < fortyFive * 3) flip = true;
                        else if (initialRotation < fortyFive * 5) flip = false;
                        else if (initialRotation < fortyFive * 7) flip = true;
                        else flip = false;
                        if (flip) {
                            const sx = Math.sign(rotatedScale.x);
                            const sy = Math.sign(rotatedScale.y);
                            rotatedScale.x = Math.abs(self.scale.y) * sx;
                            rotatedScale.y = Math.abs(self.scale.x) * sy;
                        }
                        object.scale.copy(initialTransform.scale).multiply(rotatedScale);
                        object.scale.x = MathUtils.noZero(MathUtils.sanity(object.scale.x));
                        object.scale.y = MathUtils.noZero(MathUtils.sanity(object.scale.y));
                    }
                    updateObjects(renderer, false );
                }
                return resizer;
            }
            topRight = createResizer('Top Right', -1, -1, 'box', 45, 1);
            topLeft = createResizer('Top Left', 1, -1, 'box', 135, 1);
            bottomLeft = createResizer('Bottom Left', 1, 1, 'box', 225, 1);
            bottomRight = createResizer('Bottom Right', -1, 1, 'box', 315, 1);
            rightResizer = createResizer('Right', -1, 0, 'line', 0, 1);
            topResizer = createResizer('Top', 0, -1, 'line', 90, 1);
            leftResizer = createResizer('Left', 1, 0, 'line', 180, 1);
            bottomResizer = createResizer('Bottom', 0, 1, 'line', 270, 1);
            this.add(bottomRight, bottomLeft, topLeft, topRight);
            this.add(rightResizer, bottomResizer, leftResizer, topResizer);
        }
        if (tools === ResizeHelper.ALL || tools === ResizeHelper.ROTATE) {
            rotater = Object.assign(new Circle(), { draggable: true, focusable: false, selectable: false });
            rotater.type = 'Rotater';
            rotater.resizeHelper = self;
            rotater.radius = radius + 1;
            rotater.mouseBuffer = 5;
            rotater.layer = topLayer + 2;
            rotater.lineWidth = OUTLINE_THICKNESS;
            rotater.constantWidth = true;
            rotater.fillStyle = new LinearGradientStyle();
            rotater.fillStyle.start.set(-radius, -radius);
            rotater.fillStyle.end.set(radius, radius);
            rotater.fillStyle.addColorStop(0, '--icon-light');
            rotater.fillStyle.addColorStop(1, '--icon-dark');
            rotater.strokeStyle.color = '--highlight';
            rotater.cursor = `url('${CURSOR_ROTATE}') 16 16, auto`;
            let rotating = false, rotaterAngle = 0, rotaterStart = 0;
            let rotationStart = new Vector2();
            let rotationOrigin = new Vector2();
            rotater['onPointerDragStart'] = function(renderer) {
                rotaterAngle = self.rotation;
                rotaterStart = self.rotation;
                rotationStart = self.globalMatrix.transformPoint(new Vector2(0, 0));
                rotationOrigin = self.globalMatrix.transformPoint(self.origin);
                rotating = true;
            };
            rotater['onPointerDragEnd'] = function(renderer) {
                rotating = false;
            };
            rotater.onPointerDrag = function(renderer) {
                Object2D.prototype.onPointerDrag.call(this, renderer);
                if (renderer) _lastRenderer = renderer;
                if (rotater.isDragging) {
                    const pointer = renderer.pointer;
                    const camera = renderer.camera;
                    const pointerStart = pointer.position.clone();
                    const pointerEnd = pointer.position.clone().sub(pointer.delta.x, pointer.delta.y * -1);
                    const worldPositionStart = renderer.screenToWorld(pointerStart);
                    const localPositionStart = self.inverseGlobalMatrix.transformPoint(worldPositionStart);
                    const worldPositionEnd = renderer.screenToWorld(pointerEnd);
                    const localPositionEnd = self.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                    localPositionStart.sub(self.origin).multiply(self.scale);
                    localPositionEnd.sub(self.origin).multiply(self.scale);
                    const angle = localPositionEnd.angleBetween(localPositionStart);
                    const cross = localPositionEnd.cross(localPositionStart);
                    const sign = Math.sign(cross);
                    rotaterAngle += (angle * sign);
                    while (rotaterAngle < Math.PI * -2) { rotaterAngle += Math.PI * 2; }
                    while (rotaterAngle > Math.PI * +2) { rotaterAngle -= Math.PI * 2; }
                    rotater.setRotation(rotaterAngle);
                }
            };
            rotater.setRotation = function(rad) {
                Object2D.prototype.setRotation.call(this, rad);
                self.rotation = rad;
                if (rotating) {
                    const rotateMatrix = new Matrix2().rotate(rad - rotaterStart);
                    const worldPosition = rotationStart.clone();
                    worldPosition.sub(rotationOrigin);
                    rotateMatrix.applyToVector(worldPosition);
                    worldPosition.add(rotationOrigin);
                    const parentPosition = self.parent.inverseGlobalMatrix.transformPoint(worldPosition);
                    self.position.copy(parentPosition);
                }
                updateObjects(null, false );
                return self;
            };
            topLine = Object.assign(new Line(), { draggable: false, focusable: false, selectable: false });
            topLine.layer = topLayer + 1;
            topLine.lineWidth = OUTLINE_THICKNESS;
            topLine.constantWidth = true;
            topLine.strokeStyle.color = '--highlight';
            zeroLine = Object.assign(new Line(), { draggable: false, focusable: false, selectable: false });
            zeroLine.layer = topLayer + 1;
            zeroLine.lineWidth = OUTLINE_THICKNESS;
            zeroLine.constantWidth = true;
            zeroLine.strokeStyle.color = '--highlight';
            rotateLine = Object.assign(new Line(), { draggable: false, focusable: false, selectable: false });
            rotateLine.layer = topLayer + 1;
            rotateLine.lineWidth = OUTLINE_THICKNESS;
            rotateLine.constantWidth = true;
            rotateLine.strokeStyle.color = '--highlight';
            this.add(rotater, topLine, zeroLine, rotateLine);
        }
        this.onPointerDrag = function(renderer) {
            Object2D.prototype.onPointerDrag.call(this, renderer);
            updateObjects(renderer, true );
        };
        this.onPointerDragEnd = function(renderer) {
            updateObjects(renderer, false );
        };
        this.setPosition = function(x, y) {
            Object2D.prototype.setPosition.call(this, x, y);
            updateObjects(null, false );
            return self;
        };
        function updateObjects(renderer = _lastRenderer, lerp = true) {
            if (!renderer && !_lastRenderer) return;
            if (renderer) _lastRenderer = renderer;
            for (const object of objects) {
                const initialPosition = initialTransforms[object.uuid].position;
                const initialRotation = initialTransforms[object.uuid].rotation;
                const initialScale = initialTransforms[object.uuid].scale;
                object.rotation = initialRotation + (self.rotation - startRotation);
                const relativePosition = initialPosition.clone().sub(startPosition);
                const scaledPosition = relativePosition.clone().multiply(self.scale);
                const rotateAngle = (object.rotation - initialRotation) + startRotation;
                const rotationMatrix = new Matrix2().rotate(rotateAngle);
                const rotatedPosition = rotationMatrix.transformPoint(scaledPosition);
                _position$1.copy(rotatedPosition).add(self.position);
                if (lerp && self.isDragging) {
                    object.position.smoothstep(_position$1, renderer.deltaTime * 30);
                } else {
                    object.position.copy(_position$1);
                }
                const wasSame = Math.sign(object.scale.x) === Math.sign(object.scale.y);
                const isSame =  Math.sign(initialScale.x) === Math.sign(initialScale.y);
                if (wasSame !== isSame) {
                    object.rotation -= self.rotation;
                    object.rotation *= -1;
                    object.rotation += self.rotation;
                }
                object.traverse((child) => { child.updateMatrix(true); });
            }
            self.onUpdate(renderer);
        }
        this.onUpdate = function(renderer) {
            if (!renderer) return;
            const camera = renderer.camera;
            const showResizers = !self.isDragging;
            const worldPosition = self.globalMatrix.getPosition();
            const worldRotation = self.globalMatrix.getRotation();
            const worldScale = self.globalMatrix.getScale();
            if (self.background) {
                self.background.box.set(new Vector2(-halfSize.x, -halfSize.y), new Vector2(+halfSize.x, +halfSize.y));
                self.background.updateMatrix(true);
                self.background.visible = true;
            }
            const handleOffset = ((radius * 4) / Math.abs(worldScale.y)) / camera.scale;
            const topCenterWorld = new Vector2(0, halfSize.y);
            const topCenterWorldOffset = new Vector2(0, halfSize.y + handleOffset);
            if (rotater) {
                rotater.position.copy(topCenterWorldOffset);
                rotater.rotation = 0;
                rotater.scale.set(1 / worldScale.x, 1 / worldScale.y).divideScalar(camera.scale);
                rotater.updateMatrix(true);
                rotater.visible = showResizers;
            }
            if (topLine) {
                topLine.from.copy(topCenterWorldOffset);
                topLine.to.copy(topCenterWorld);
                topLine.updateMatrix(true);
                topLine.visible = showResizers;
            }
            if (zeroLine) {
                zeroLine.from.set(self.origin.x, self.origin.y);
                zeroLine.to.set(self.origin.x, self.origin.y + (handleOffset * 1.5));
                zeroLine.updateMatrix(true);
                zeroLine.visible = rotater.isDragging;
            }
            if (rotateLine) {
                rotateLine.from.set(self.origin.x, self.origin.y);
                rotateLine.to.set(0, radius * 4 * 1.5).add(worldPosition);
                self.inverseGlobalMatrix.applyToVector(rotateLine.to);
                rotateLine.to.divideScalar(camera.scale);
                rotateLine.to.add(self.origin);
                rotateLine.updateMatrix(true);
                rotateLine.visible = rotater.isDragging;
            }
            function updateResizer(resizer, x, y, type) {
                if (!resizer) return;
                resizer.position.set(x, y);
                if      (type === 'v') { resizer.from.set(0, -halfSize.y); resizer.to.set(0, +halfSize.y); }
                else if (type === 'h') { resizer.from.set(-halfSize.x, 0); resizer.to.set(+halfSize.x, 0); }
                else { resizer.scale.set((1 / worldScale.x) / camera.scale, (1 / worldScale.y) / camera.scale); }
                resizer.updateMatrix(true);
                resizer.visible = showResizers;
            }
            updateResizer(topLeft, -halfSize.x, +halfSize.y);
            updateResizer(topRight, +halfSize.x, +halfSize.y);
            updateResizer(bottomLeft, -halfSize.x, -halfSize.y);
            updateResizer(bottomRight, +halfSize.x, -halfSize.y);
            updateResizer(leftResizer, -halfSize.x, 0, 'v');
            updateResizer(rightResizer, +halfSize.x, 0, 'v');
            updateResizer(topResizer, 0, +halfSize.y, 'h');
            updateResizer(bottomResizer, 0, -halfSize.y, 'h');
        };
    }
}

const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();
class RubberBandBox extends Box {
    constructor() {
        super();
        this.isHelper = true;
        this.type = 'RubberBandBox';
        this.cursor = 'pointer';
        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;
        this.fillStyle.color = 'rgba(--icon, 0.5)';
        this.fillStyle.fallback = 'rgba(0, 170, 204, 0.5)';
        this.strokeStyle.color = 'rgb(--icon-light)';
        this.strokeStyle.fallback = 'rgba(101, 229, 255)';
        this.lineWidth = OUTLINE_THICKNESS;
        this.constantWidth = true;
    }
    intersected(scene, includeChildren = true) {
        const objects = [];
        const rubberBandBox = this;
        const rubberBandLines = this.getLines(this);
        function checkIntersectObject(object) {
            if (object.visible && object.selectable) {
                const objectLines = rubberBandBox.getLines(object);
                if (rubberBandBox.intersectsPolygon(rubberBandLines, objectLines) ||
                    rubberBandBox.containsPolygon(rubberBandLines, objectLines)) {
                    objects.push(object);
                }
            }
        }
        if (includeChildren) {
            scene.traverse((object) => { if (object !== scene) checkIntersectObject(object); });
        } else {
            for (const object of scene.children) { checkIntersectObject(object); }
        }
        return objects;
    }
    getLines(object) {
        const lines = [];
        const box = object.boundingBox;
        if (Number.isFinite(box.min.x) === false || Number.isFinite(box.min.y) === false) return [];
        if (Number.isFinite(box.max.x) === false || Number.isFinite(box.max.y) === false) return [];
        object.globalMatrix.applyToVector(_topLeft.copy(box.min));
        object.globalMatrix.applyToVector(_topRight.copy(box.max.x, box.min.y));
        object.globalMatrix.applyToVector(_botLeft.copy(box.min.x, box.max.y));
        object.globalMatrix.applyToVector(_botRight.copy(box.max));
        lines.push({ from: new Vector2(_topLeft.x, _topLeft.y), to: new Vector2(_topRight.x, _topRight.y) });
        lines.push({ from: new Vector2(_topRight.x, _topRight.y), to: new Vector2(_botRight.x, _botRight.y) });
        lines.push({ from: new Vector2(_botRight.x, _botRight.y), to: new Vector2(_botLeft.x, _botLeft.y) });
        lines.push({ from: new Vector2(_botLeft.x, _botLeft.y), to: new Vector2(_topLeft.x, _topLeft.y) });
        return lines;
    }
    intersectsPolygon(rubberBandLines, objectLines) {
        for (const rubberBandLine of rubberBandLines) {
            for (const objectLine of objectLines) {
                if (this.intersectsLine(rubberBandLine, objectLine)) return true;
            }
        }
        return false;
    }
    intersectsLine(line1, line2) {
        const { x: x1, y: y1 } = line1.from;
        const { x: x2, y: y2 } = line1.to;
        const { x: x3, y: y3 } = line2.from;
        const { x: x4, y: y4 } = line2.to;
        const denom = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        if (denom === 0) return false;
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }
    containsPolygon(rubberBandLines, objectLines) {
        const rubberBandPolygon = this.linesToPolygon(rubberBandLines);
        const objectPolygon = this.linesToPolygon(objectLines);
        for (const point of objectPolygon) {
            if (!PolyUtils.isPointInPolygon(point, rubberBandPolygon)) return false;
        }
        return true;
    }
    linesToPolygon(lines) {
        const polygon = [];
        for (const line of lines) {
            polygon.push(line.from);
        }
        return polygon;
    }
}

const _cameraPoint = new Vector2();
const _center = new Vector2();
const _size = new Vector2();
class SelectControls {
    constructor() {
        this.selection = [];
        this.resizeHelper = null;
        this.rubberBandBox = null;
        this.downTimer = 0;
        this._existingSelection = [];
        this._mouseStart = new Vector2();
        this._mouseNow = new Vector2();
        this._wantsRubberBand = false;
    }
    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        let newSelection = [ ...this.selection ];
        _cameraPoint.copy(renderer.screenToWorld(pointer.position));
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            this._mouseStart.copy(_cameraPoint);
            const underMouse = scene.getWorldPointIntersections(_cameraPoint);
            if (keyboard.ctrlPressed() || keyboard.metaPressed() || keyboard.shiftPressed()) {
                let resizerClicked = false;
                if (underMouse.length > 0) {
                    const topObject = underMouse[0];
                    resizerClicked = resizerClicked || (topObject.type === 'Resizer');
                    resizerClicked = resizerClicked || (topObject.type === 'Rotater');
                }
                if (!resizerClicked) {
                    const selectableOnly = ArrayUtils.filterThings(underMouse, { selectable: true });
                    if (selectableOnly.length > 0) {
                        const object = selectableOnly[0];
                        if (object.isSelected) {
                            newSelection = ArrayUtils.removeThingFromArray(object, newSelection);
                        } else {
                            newSelection = ArrayUtils.combineThingArrays(newSelection, [ object ]);
                        }
                    } else {
                        this._existingSelection = [ ...this.selection ];
                        this._wantsRubberBand = true;
                    }
                }
            } else {
                this.downTimer = performance.now();
                if (underMouse.length === 0) {
                    newSelection = [];
                    this._existingSelection = [];
                    this._wantsRubberBand = true;
                } else if (underMouse.length > 0) {
                    const object = underMouse[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        newSelection = [ object ];
                        this.downTimer = 0;
                    }
                }
            }
        }
        this._mouseNow.copy(_cameraPoint);
        if (pointer.buttonPressed(Pointer.LEFT)) {
            const mouseTravel = this._mouseStart.manhattanDistanceTo(this._mouseNow);
            if (this._wantsRubberBand) {
                if (this.rubberBandBox == null) {
                    if (mouseTravel >= MOUSE_SLOP) {
                        const rubberBandBox = new RubberBandBox();
                        scene.traverse((child) => { rubberBandBox.layer = Math.max(rubberBandBox.layer, child.layer + 1); });
                        scene.add(rubberBandBox);
                        this.rubberBandBox = rubberBandBox;
                        renderer.setDragObject(this.rubberBandBox);
                    }
                }
                if (this.rubberBandBox) {
                    const viewportStart = renderer.worldToScreen(this._mouseStart);
                    const viewportEnd = renderer.worldToScreen(this._mouseNow);
                    _center.addVectors(viewportStart, viewportEnd).divideScalar(2);
                    _center.copy(renderer.screenToWorld(_center));
                    this.rubberBandBox.position.copy(_center);
                    _size.subVectors(viewportStart, viewportEnd).abs().divideScalar(2);
                    this.rubberBandBox.box.min.set(-_size.x, -_size.y);
                    this.rubberBandBox.box.max.set(+_size.x, +_size.y);
                    this.rubberBandBox.computeBoundingBox();
                    this.rubberBandBox.rotation = -camera.rotation;
                    this.rubberBandBox.scale.set(1 / camera.scale, 1 / camera.scale);
                    this.rubberBandBox.updateMatrix(true);
                    let intersectedObjects;
                    if (this._existingSelection.length > 0) {
                        intersectedObjects = this.rubberBandBox.intersected(this._existingSelection[0].parent, false );
                    } else {
                        intersectedObjects = this.rubberBandBox.intersected(scene, true );
                    }
                    newSelection = ArrayUtils.combineThingArrays(this._existingSelection, intersectedObjects);
                }
            }
        }
        if (pointer.buttonJustReleased(Pointer.LEFT)) {
            const mouseTravel = this._mouseStart.manhattanDistanceTo(this._mouseNow);
            const shortClick = performance.now() - this.downTimer < MOUSE_CLICK_TIME;
            this._wantsRubberBand = false;
            if (this.rubberBandBox) {
                if (renderer.dragObject === this.rubberBandBox) renderer.setDragObject(null);
                this.rubberBandBox.destroy();
                this.rubberBandBox = null;
            } else if (shortClick && mouseTravel <= MOUSE_SLOP) {
                const underMouse = scene.getWorldPointIntersections(_cameraPoint);
                const withoutResizeHelper = ArrayUtils.filterThings(underMouse, { isHelper: undefined });
                if (withoutResizeHelper.length === 0) {
                    newSelection = [];
                } else if (withoutResizeHelper.length > 0) {
                    const object = withoutResizeHelper[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        newSelection = [ object ];
                    }
                }
            }
        }
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            const siblings = [];
            if (newSelection.length > 0) {
                const wantsParent = newSelection[0].parent;
                for (const object of newSelection) {
                    if (object.parent === wantsParent) siblings.push(object);
                }
            }
            newSelection = [ ...siblings ];
        }
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            scene.traverse((child) => { child.isSelected = false; });
            newSelection.forEach((object) => { object.isSelected = true; });
            if (this.resizeHelper) {
                this.resizeHelper.objects = [];
                this.resizeHelper.destroy();
                this.resizeHelper = null;
            }
            if (newSelection.length > 0) {
                this.resizeHelper = new ResizeHelper(newSelection);
                const commonAncestor = findCommonMostAncestor(newSelection);
                commonAncestor.add(this.resizeHelper);
                if (typeof this.resizeHelper.onUpdate === 'function') this.resizeHelper.onUpdate(renderer);
                if (this.rubberBandBox == null) renderer.setDragObject(this.resizeHelper);
            }
            this.selection = [ ...newSelection ];
        }
    }
}
function findCommonMostAncestor(objects) {
    if (objects.length === 0) return null;
    if (objects.length === 1) return objects[0].parent;
    function getAncestors(object) {
        const ancestors = [];
        let currentObject = object;
        while (currentObject.parent) {
            ancestors.unshift(currentObject.parent);
            currentObject = currentObject.parent;
        }
        return ancestors;
    }
    const ancestors = objects.map(getAncestors);
    const minLength = Math.min(...ancestors.map(arr => arr.length));
    for (let i = 0; i < minLength; i++) {
        const ancestor = ancestors[0][i];
        for (let j = 1; j < ancestors.length; j++) {
            if (ancestors[j][i] !== ancestor) {
                return ancestor.parent;
            }
        }
    }
    return ancestors[0][minLength - 1];
}

const NEAREST_ANGLE = 5;
const SIZE_OF_CROSS = 15;
const _bounds = new Box2();
const _corner1 = new Vector2();
const _corner2 = new Vector2();
const _corner3 = new Vector2();
const _corner4 = new Vector2();
const _start = new Vector2();
const _matrix = new Matrix2();
const _inverse = new Matrix2();
const _translate = new Matrix2();
const _rotate = new Matrix2();
const _scale = new Matrix2();
class GridHelper extends Object2D {
    #gridX = 50;
    #gridY = 50;
    constructor(gridSizeX = 50, gridSizeY = gridSizeX) {
        super();
        const self = this;
        this.isHelper = true;
        this.type = 'GridHelper';
        this.gridColor = new ColorStyle('rgb(128, 128, 128)', 'rgb(128, 128, 128)');
        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;
        this.gridX = gridSizeX;
        this.gridY = gridSizeY;
        this.snap = true;
        this.onTop = false;
        const cross = Object.assign(new Object2D(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        cross.layer = +Infinity;
        cross.visible = false;
        cross.draw = function (renderer) {
            const context = renderer.context;
            const worldPosition = cross.getWorldPosition();
            renderer.resetTransform();
            _translate.identity().translate(worldPosition.x, worldPosition.y).transformContext(context);
            _scale.identity().scale(self.scale.x, self.scale.y).transformContext(context);
            _rotate.identity().rotate(self.rotation).transformContext(context);
            function degreesToYAxisAlignment(degrees) {
                let normalizedDegrees = ((degrees + 180) % 360 + 360) % 360 - 180;
                while (normalizedDegrees > +90) normalizedDegrees -= 180;
                while (normalizedDegrees < -90) normalizedDegrees += 180;
                return Math.abs(normalizedDegrees) / 90;
            }
            const lerp = degreesToYAxisAlignment(MathUtils.radiansToDegrees(self.rotation));
            const scale = self.scale.clone();
            scale.x = ((1 - lerp) * self.scale.x) + (lerp * self.scale.y);
            scale.y = ((1 - lerp) * self.scale.y) + (lerp * self.scale.x);
            const sizeX = (SIZE_OF_CROSS / renderer.camera.scale) / scale.x;
            const sizeY = (SIZE_OF_CROSS / renderer.camera.scale) / scale.y;
            context.beginPath();
            context.moveTo(-sizeX, 0); context.lineTo(+sizeX, 0);
            context.moveTo(0, -sizeY); context.lineTo(0, +sizeY);
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.strokeStyle = '#ffffff'; context.lineWidth = 5; context.lineCap = 'round'; context.stroke();
            context.strokeStyle = '#000000'; context.lineWidth = 2; context.lineCap = 'butt'; context.stroke();
            context.restore();
        };
        this.cross = cross;
        this.add(cross);
        this.cache = null;
        this.gridScale = 1;
        this.patternCanvas = document.createElement('canvas');
        this.patternContext = this.patternCanvas.getContext('2d');
        this.drawPattern();
    }
    get gridX() { return this.#gridX; }
    set gridX(size) {
        if (!isFinite(size) || size < 1) size = 1;
        this.#gridX = size;
        this.cache = null;
    }
    get gridY() { return this.#gridY; }
    set gridY(size) {
        if (!isFinite(size) || size < 1) size = 1;
        this.#gridY = size;
        this.cache = null;
    }
    alignToGrid(object) {
        if (!object.parent) return;
        const worldPosition = object.getWorldPosition();
        const originOffset = new Vector2();
        if (object.origin) {
            const worldOrigin = object.globalMatrix.transformPoint(object.origin);
            const parentOrigin = object.parent.inverseGlobalMatrix.transformPoint(worldOrigin);
            originOffset.copy(parentOrigin).sub(object.position);
            worldPosition.copy(worldOrigin);
        }
        const inverseMatrix = new Matrix2()
            .translate(-this.position.x, -this.position.y)
            .rotate(-this.rotation)
            .scale(1 / this.scale.x, 1 / this.scale.y);
        const gridPosition = inverseMatrix.transformPoint(worldPosition);
        const closestX = Math.round(gridPosition.x / this.gridX) * this.gridX;
        const closestY = Math.round(gridPosition.y / this.gridY) * this.gridY;
        const transformMatrix = new Matrix2()
            .scale(this.scale.x, this.scale.y)
            .rotate(this.rotation)
            .translate(this.position.x, this.position.y);
        const closestWorldPosition = transformMatrix.transformPoint(new Vector2(closestX, closestY));
        const parentPosition = object.parent.inverseGlobalMatrix.transformPoint(closestWorldPosition);
        parentPosition.sub(originOffset);
        object.setPosition(parentPosition.x, parentPosition.y);
    }
    alignToRotation(object) {
        const angle = this.rotation;
        const scaleX = this.scale.x;
        const scaleY = this.scale.y;
        const horizontalAngle = MathUtils.radiansToDegrees(Math.atan((scaleY * Math.tan(angle)) / scaleX));
        const verticalAngle = MathUtils.radiansToDegrees((Math.PI / 2) - Math.atan((scaleY / scaleX) * (1 / Math.tan(angle))));
        const alignedAngle = roundToNearestWithTwoRotations(MathUtils.radiansToDegrees(object.rotation), NEAREST_ANGLE, horizontalAngle, verticalAngle);
        object.setRotation(MathUtils.degreesToRadians(alignedAngle));
    }
    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;
        context.save();
        _matrix.copy(renderer.resetTransform(false));
        _matrix.multiply(_scale.identity().scale(this.scale.x, this.scale.y));
        _matrix.multiply(_rotate.identity().rotate(this.rotation));
        _matrix.setContextTransform(context);
        _matrix.getInverse(_inverse);
        const halfWidth = renderer.width / 2;
        const halfHeight = renderer.height / 2;
        _inverse.applyToVector(_corner1.set(-halfWidth, +halfHeight));
        _inverse.applyToVector(_corner2.set(+halfWidth, +halfHeight));
        _inverse.applyToVector(_corner3.set(-halfWidth, -halfHeight));
        _inverse.applyToVector(_corner4.set(+halfWidth, -halfHeight));
        _bounds.setFromPoints(_corner1, _corner2, _corner3, _corner4);
        const visibleWidth = _bounds.getSize().x;
        const visibleHeight = _bounds.getSize().y;
        const gridCountX = Math.ceil(visibleWidth / this.gridX) + 2;
        const gridCountY = Math.ceil(visibleHeight / this.gridY) + 2;
        _start.set(
            (camera.position.x / this.scale.x) * -1,
            (camera.position.y / this.scale.y),
        );
        _rotate.identity().rotate(this.rotation);
        _rotate.applyToVector(_start);
        const startX = Math.ceil((_start.x + (visibleWidth / 2)) / this.gridX) * this.gridX * -1;
        const startY = Math.ceil((_start.y + (visibleHeight / 2)) / this.gridY) * this.gridY * -1;
        if (this.gridScale !== camera.scale || !this.cache) {
            this.drawPattern(camera.scale);
            this.gridColor.color = '--button-dark';
            this.gridColor.needsUpdate = true;
        }
        if (camera.scale <= 1.5) {
            if (!this.cache) this.cache = context.createPattern(this.patternCanvas, 'repeat');
            context.fillStyle = this.cache;
            context.fillRect(startX, startY, gridCountX * this.gridX, gridCountY * this.gridY);
        } else {
            context.strokeStyle = this.gridColor.get(context);
            context.globalAlpha = 1;
            context.lineWidth = 1;
            context.beginPath();
            for (let i = 0; i <= gridCountX; i++) {
                const x = startX + (i * this.gridX);
                context.moveTo(x, startY);
                context.lineTo(x, startY + gridCountY * this.gridY);
            }
            for (let j = 0; j <= gridCountY; j++) {
                const y = startY + (j * this.gridY);
                context.moveTo(startX, y);
                context.lineTo(startX + gridCountX * this.gridX, y);
            }
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.stroke();
        }
        context.restore();
    }
    drawPattern(scale = 1) {
        this.cache = null;
        this.gridScale = scale;
        const context = this.patternContext;
        this.patternCanvas.width = this.gridX;
        this.patternCanvas.height = this.gridY;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
        context.translate(this.gridX / 2, this.gridY / 2);
        context.strokeStyle = this.gridColor.get(context);
        context.globalAlpha = Math.min(1, scale);
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(this.gridX / 2, -this.gridY);
        context.lineTo(this.gridX / 2, +this.gridY);
        context.moveTo(-this.gridX, this.gridY / 2);
        context.lineTo(+this.gridX, this.gridY / 2);
        context.stroke();
    }
    onUpdate(renderer) {
        this.layer = (this.onTop) ? +Infinity : -Infinity;
        this.level = -1;
        const object = renderer.dragObject;
        this.cross.visible = false;
        if (object && object.isDragging) {
            if (object.type === 'Rotater') {
                if (renderer.keyboard.modifierPressed() !== this.snap) {
                    this.alignToRotation(object);
                }
            } else {
                if (this.snap) {
                    this.alignToGrid(object);
                    if (object.origin) {
                        const originPosition = object.globalMatrix.transformPoint(object.origin);
                        this.cross.position.copy(originPosition);
                        this.inverseGlobalMatrix.applyToVector(this.cross.position);
                        this.cross.updateMatrix(true);
                        this.cross.level = -1;
                        this.cross.visible = true;
                    }
                }
            }
        }
    }
}
function roundToNearestWithTwoRotations(angle, nearest, startRotation1, startRotation2) {
    const relativeAngle1 = angle - startRotation1;
    const roundedRelativeAngle1 = Math.round(relativeAngle1 / nearest) * nearest;
    const roundedAngle1 = startRotation1 + roundedRelativeAngle1;
    const relativeAngle2 = angle - startRotation2;
    const roundedRelativeAngle2 = Math.round(relativeAngle2 / nearest) * nearest;
    const roundedAngle2 = startRotation2 + roundedRelativeAngle2;
    const diff1 = Math.abs(angle - roundedAngle1);
    const diff2 = Math.abs(angle - roundedAngle2);
    return diff1 < diff2 ? roundedAngle1 : roundedAngle2;
}

class OriginHelper extends Circle {
    constructor(size = 5) {
        super(size);
        this.isHelper = true;
        this.type = 'OriginHelper';
        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;
        this.fillStyle.color = '--icon';
        this.strokeStyle.color = '#000000';
        this.lineWidth = 1;
        this.constantWidth = true;
    }
    computeBoundingBox() {
        this.boundingBox.clear();
    }
    draw(renderer) {
        this.layer = +Infinity;
        super.draw(renderer);
    }
}

const DURATION = 1500;
const FADEOUT = 500;
const TIME_OFFSET = 100000;
const _minimum = new Box2(new Vector2(-30, -12), new Vector2(30, 12));
const _position = new Vector2();
class TooltipHelper extends Box {
    constructor(sceneTips = false) {
        super();
        this.isHelper = true;
        this.type = 'TooltipHelper';
        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;
        this.layer = +Infinity;
        this.visible = false;
        this.sceneTips = sceneTips;
        this.box.min.set(-40, -14);
        this.box.max.set(+40, +14);
        this.radius = 7;
        this.fillStyle.color = '--background-dark';
        this.strokeStyle.color = '--icon';
        this.lineWidth = 2;
        const displayText = Object.assign(new Text(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        displayText.layer = +Infinity;
        displayText.fillStyle.color = '--highlight';
        this.add(displayText);
        this.displayText = displayText;
        const outline = Object.assign(new Box(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        outline.layer = +Infinity;
        outline.fillStyle.color = `--shadow`;
        outline.opacity = 0.65;
        outline.strokeStyle = null;
        outline.radius = 10;
        this.add(outline);
        this.outline = outline;
        this.duration = DURATION;
        this.initialPosition = new Vector2();
        this.offset = new Vector2();
        this.startTime = 0;
        this.wasChanged = false;
    }
    popup(text = '', align = 'center', duration, fadeOut) {
        this.duration = duration ?? DURATION;
        this.fadeOut = (fadeOut != null) ? fadeOut : FADEOUT;
        this.displayText.text = String(text);
        this.displayText.textAlign = align;
        this.startTime = performance.now() + TIME_OFFSET;
        this.wasChanged = true;
    }
    onUpdate(renderer) {
        const camera = renderer.camera;
        const pointer = renderer.pointer;
        if (this.sceneTips) {
            if (renderer.pointer.wheel !== 0) {
                let scale = renderer.camera.scale * 100;
                scale = scale.toFixed((scale < 50) ? ((scale < 5) ? 2 : 1) : 0);
                this.popup(` ${scale}% `, 'center');
            } else if (renderer.dragObject && renderer.dragObject.isDragging) {
                let tooltipText = '';
                const object = renderer.dragObject;
                if (object.type === 'Resizer') {
                    const resizeHelper = object.resizeHelper;
                    if (resizeHelper) {
                        const toolSize = resizeHelper.boundingBox.getSize();
                        let w = (toolSize.x * resizeHelper.scale.x).toFixed(3);
                        let h = (toolSize.y * resizeHelper.scale.y).toFixed(3);
                        w = parseFloat(w).toString();
                        h = parseFloat(h).toString();
                        tooltipText = `W: ${w}\nH: ${h}`;
                    }
                } else if (object.type === 'Rotater') {
                    const resizeHelper = object.resizeHelper;
                    if (resizeHelper) {
                        let angle = SALT.MathUtils.radiansToDegrees(resizeHelper.rotation);
                        angle = angle.toFixed(3);
                        angle = parseFloat(angle).toString();
                        tooltipText = `${angle}°`;
                    }
                } else  {
                    if (object.type === 'ResizeHelper' && object.objects.length === 1) {
                        let x = parseFloat((object.objects[0].position.x).toFixed(3)).toString();
                        let y = parseFloat((object.objects[0].position.y).toFixed(3)).toString();
                        tooltipText = `X: ${x}\nY: ${y}`;
                    } else {
                        let x = parseFloat((object.position.x).toFixed(3)).toString();
                        let y = parseFloat((object.position.y).toFixed(3)).toString();
                        tooltipText = `X: ${x}\nY: ${y}`;
                    }
                }
                if (tooltipText !== '') {
                    this.popup(tooltipText, 'left' , 10 , 0 );
                }
            }
        }
        const timePassed = (performance.now() + TIME_OFFSET) - this.startTime;
        const expired = timePassed > this.duration;
        if (expired) {
            this.visible = false;
        } else {
            this.visible = true;
            if (this.wasChanged) {
                this.wasChanged = false;
                this.displayText.computeBoundingBox(renderer);
                this.box.copy(this.displayText.boundingBox);
                this.box.min.x -= 10;
                this.box.max.x += 10;
                this.box.min.y -= 8;
                this.box.max.y += 4;
                this.box.union(_minimum);
                this.offset.x = ((this.box.max.x - this.box.min.x) / 2) + 25;
                this.offset.y = ((this.box.max.y - this.box.min.y) / 2) + 25;
                _position.set(pointer.position.x + this.offset.x, pointer.position.y + this.offset.y);
                _position.copy(renderer.screenToWorld(_position));
                this.position.copy(_position);
                this.opacity = 1;
                this.visible = true;
                this.displayText.level = this.level + 1;
                this.outline.level = this.level - 1;
                this.outline.box.copy(this.box);
                this.outline.box.expandByScalar(3);
            } else {
                _position.set(pointer.position.x + this.offset.x, pointer.position.y + this.offset.y);
                _position.copy(renderer.screenToWorld(_position));
                this.position.smoothstep(_position, renderer.deltaTime * 60);
                this.opacity = (timePassed >= this.duration - this.fadeOut) ? Math.max(0, 1 - (timePassed - (this.duration - this.fadeOut)) / this.fadeOut) : 1;
            }
            this.rotation = -camera.rotation;
            this.scale.set(1 / camera.scale, 1 / camera.scale);
            this.updateMatrix(true);
        }
    }
}

let _singleton = null;
class Debug {
    #startInternal;
    #stopInternal;
    constructor(openFrame = false, openScene = false, openBuffers = false, openSystem = false) {
        if (_singleton) return _singleton;
        function checkState(key) {
            const value = localStorage.getItem(key);
            if (typeof value === 'string') {
                if (value === 'undefined' || value === 'null' || value === 'false') return false;
                return true;
            }
            return !!value;
        }
        openFrame = openFrame || checkState('DebugFrame');
        openScene = openScene || checkState('DebugScene');
        openBuffers = openBuffers || checkState('DebugBuffers');
        openSystem = openSystem || checkState('DebugSystem');
        const buttonColor = getVariable('button-light') ?? '60, 60, 60';
        const backgroundColor = getVariable('background-light') ?? '32, 32, 32';
        const backgroundAlpha = getVariable('panel-transparency') ?? '1.0';
        const textColor = getVariable('text') ?? '170, 170, 170';
        const textLight = getVariable('text-light') ?? '225, 225, 225';
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            #EyeDebug {
                position: absolute;
                display: flex;
                flex-direction: column;
                justify-content: left;
                text-align: left;
                left: 0;
                bottom: 0;
                margin: 0.25em;
                padding: 0;
                z-index: 1000; /* Debug Info */
                background: transparent;
            }

            .EyeDiv {
                user-select: none;
                pointer-events: none;
                margin: 0.35em;
                margin-bottom: 0;
                padding: 0.25em;
                border-radius: 0.71429em;
                background-color: rgba(${backgroundColor}, ${backgroundAlpha});
            }

            .EyeButtonRow {
                display: flex;
                background: transparent;
                margin: 0.35em;
            }

            .EyeDebugButton {
                filter: grayscale(100%);
                flex: 1 1 auto;
                border-radius: 1000px;
                background-color: rgba(${backgroundColor}, ${backgroundAlpha});
                height: 2.5em;
                width: 2.5em;
                margin-left: 0.2em;
                margin-right: 0.2em;
                padding-bottom: 0.05em;
            }

            .EyeDebugButton:hover {
                filter: brightness(125%) grayscale(100%);
                box-shadow:
                    inset -1px 1px 1px -1px rgba(255, 255, 255, 0.2),
                    inset 2px -2px 2px -1px rgba(0, 0, 0, 0.75);
            }

            .EyeDebugButton.suey-selected {
                filter: brightness(100%);
                box-shadow: none;
            }

            #ButtonFrame { border: solid 2px rgba(${buttonColor}, 0.7); }
            #ButtonScene { border: solid 2px rgba(${buttonColor}, 0.7); }
            #ButtonBuffers { border: solid 2px rgba(${buttonColor}, 0.7); }
            #ButtonSystem { border: solid 2px rgba(${buttonColor}, 0.7); }

            #FrameFrame, #ButtonFrame.suey-selected { border: solid 2px rgba(0, 180, 175, 0.75); }
            #SceneFrame, #ButtonScene.suey-selected { border: solid 2px rgba(255, 113, 0, 0.75); }
            #BuffersFrame, #ButtonBuffers.suey-selected { border: solid 2px rgba(255, 93, 0, 0.75); }
            #SystemFrame, #ButtonSystem.suey-selected { border: solid 2px rgba(145, 223, 0, 0.75); }

            .EyeDebugButton.suey-selected:hover {
                filter: brightness(125%);
            }

            .EyeDebugButton:active {
                filter: brightness(100%);
                box-shadow:
                    inset -1px 1px 3px 1px rgba(0, 0, 0, 0.75),
                    inset  1px 1px 3px 1px rgba(0, 0, 0, 0.75),
                    inset -1px -1px 3px 1px rgba(0, 0, 0, 0.75),
                    inset  1px -1px 3px 1px rgba(0, 0, 0, 0.75);
            }

            .EyeDetails { /* closed */
                filter: brightness(0.75);
                padding: 0;
                margin: 0;
                left: 0;
                right: 0;
                width: 100%;
            }

            .EyeDetails[open] {
                filter: none;
                padding-top: 0.1em;
                min-width: 9em;
            }

            .EyeHeader {
                padding: 0.1em 0.3em;
                padding-top: 0;
                left: 0;
                width: 100%;
                margin: 0;
                font-size: 0.9em;
            }

            #FrameHeader { color: #00b4af; }
            #SceneHeader { color: #ff7100; }
            #BuffersHeader { color: #d8007f; }
            #SystemHeader { color: #75b300; }

            .EyeRow {
                display: flex;
                justify-content: space-between;
                padding: 0.1em;
                padding-left: 0.3em;
                padding-right: 0.3em;
                width: 100%;
                font-size: 0.8em;
                color: rgba(${textColor}, 0.8);
            }

            .EyeInfo, .EyeInfo > * {
                font-size: inherit;
                color: rgb(${textLight});
            }

            .Light {
                font-size: 12px;
                color: #a5f300;
            }

            .EyeImageHolder {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin: 0.4em;
                /* max-width: 1.35em; */
                /* max-height: 1.35em; */
            }

            .ColorIcon {
                filter: brightness(50%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 160deg));
            }

            .ColorComplement {
                filter: brightness(50%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 0deg));
            }

            .suey-rotate-colorize1 {
                filter: brightness(50%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 270deg));
            }

            .suey-rotate-colorize2 {
                filter: brightness(65%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 35deg));
            }
        `;
        document.head.appendChild(styleSheet);
        const dom = document.createElement('div');
        dom.id = 'EyeDebug';
        dom.innerHTML = `
            <div class="EyeDiv" id="FrameFrame">
                <div class="EyeHeader" id="FrameHeader">Frame</div>
                <div class="EyeRow">FPS<span class="EyeInfo" id="EyeFps">?</span></div>
                <div class="EyeRow">Render<span class="EyeInfo" id="EyeRender">?</span></div>
                <div class="EyeRow">Max<span class="EyeInfo" id="EyeMax">?</span></div>
                <div class="EyeRow">Draws <span class="EyeInfo" id="EyeDraws">?</span></div>
                </div>
            </div>

            <div class="EyeDiv" id="SceneFrame">
                <div class="EyeHeader" id="SceneHeader">Scene</div>
                <div class="EyeRow">Objects <span class="EyeInfo" id="EyeObjects">?</span></div>
                <div class="EyeRow">Lights <span class="EyeInfo" id="EyeLights">?</span></div>
                <div class="EyeRow">Vertices <span class="EyeInfo" id="EyeVertices">?</span></div>
                <div class="EyeRow">Triangles <span class="EyeInfo" id="EyeTriangles">?</span></div>
                </details>
            </div>

            <div class="EyeDiv" id="BuffersFrame">
                <div class="EyeHeader" id="BuffersHeader">Buffers</div>
                <div class="EyeRow">Programs <span class="EyeInfo" id="EyePrograms">?</span></div>
                <div class="EyeRow">Geometries <span class="EyeInfo" id="EyeGeometries">?</span></div>
                <div class="EyeRow">Textures <span class="EyeInfo" id="EyeTextures">?</span></div>
                </details>
            </div>

            <div class="EyeDiv" id="SystemFrame">
                <div class="EyeHeader" id="SystemHeader">System</div>
                <div class="EyeRow">Memory <span class="EyeInfo" id="EyeMemory">?</span></div>
                </details>
            </div>

            <div class="EyeButtonRow">
                <button class="EyeDebugButton" id="ButtonFrame">
                    <div class="EyeImageHolder ColorIcon">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M253.007,34c123.372,0.146 224.847,101.621 224.993,224.993l0,0.007c0,123.431 -101.569,225 -225,225c-123.431,0 -225,-101.569 -225,-225c0,-123.431 101.569,-225 225,-225l0.007,0Zm-0.011,398.23c94.989,-0.118 173.116,-78.245 173.234,-173.234c-0.002,-95.029 -78.2,-173.226 -173.23,-173.226c-95.031,-0 -173.23,78.199 -173.23,173.23c-0,95.03 78.197,173.228 173.226,173.23Z" style="fill:#c0c0c0;"/><path d="M279.881,249.916l51.859,51.858c0.028,0.029 0.057,0.058 0.085,0.087c4.838,5.009 7.546,11.709 7.546,18.674c-0,14.746 -12.135,26.881 -26.881,26.881c-6.966,-0 -13.665,-2.707 -18.675,-7.546c-0.029,-0.028 -0.058,-0.056 -0.086,-0.085l-59.733,-59.733c-5.039,-5.037 -7.874,-11.879 -7.877,-19.004l0,-119.471c0,-14.746 12.135,-26.881 26.881,-26.881c14.746,-0 26.881,12.135 26.881,26.881l-0,108.339Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
                <button class="EyeDebugButton" id="ButtonScene">
                    <div class="EyeImageHolder ColorComplement">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M336.33,61.901c0.054,0.046 87.151,87.14 87.223,87.223c0.015,0.017 0.028,0.032 0.039,0.044c1.231,1.375 2.251,2.87 3.086,4.423c1.775,3.293 2.772,7.051 2.772,11.035l0,258.458c0,8.282 -3.289,16.224 -9.145,22.08l-1.192,1.191c-6.176,6.175 -14.551,9.645 -23.286,9.645l-260.361,0c-8.282,0 -16.225,-3.29 -22.08,-9.146l-1.191,-1.191c-6.176,-6.176 -9.645,-14.551 -9.645,-23.286l0,-333.461c0,-8.282 3.289,-16.224 9.145,-22.08l1.192,-1.191c6.176,-6.175 14.551,-9.645 23.286,-9.645l184.652,0c3.983,0 7.741,0.997 11.034,2.773c1.572,0.843 3.084,1.878 4.471,3.128Zm-51.29,107.446l-0,-69.22l-138.363,0l-0,311.746l238.646,0l-0,-211.463l-69.925,0c-7.603,0 -14.894,-3.02 -20.271,-8.396l-1.19,-1.191c-5.697,-5.696 -8.897,-13.422 -8.897,-21.476Zm42.579,-9.526l44,-0l-44,-44l-0,44Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
                <button class="EyeDebugButton" id="ButtonBuffers">
                    <div class="EyeImageHolder suey-rotate-colorize1">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M449.119,359.79c9.175,15.892 9.175,34.87 -0,50.764c-9.175,15.891 -25.611,25.382 -43.964,25.382l-298.311,0c-18.35,0 -34.783,-9.486 -43.961,-25.38c-9.177,-15.896 -9.177,-34.874 0,-50.766l149.154,-258.344c9.175,-15.893 25.611,-25.382 43.964,-25.382c18.353,-0 34.786,9.486 43.964,25.38l149.154,258.346Zm-338.984,23.483l291.732,-0l-145.866,-252.645l-145.866,252.645Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
                <button class="EyeDebugButton" id="ButtonSystem">
                    <div class="EyeImageHolder suey-rotate-colorize2">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M410.964,152.852c24.705,0 45.036,20.331 45.036,45.037l0,116.222c0,24.706 -20.331,45.037 -45.036,45.037l-13.075,-0l-0,32.445c-0,14.081 -11.586,25.666 -25.666,25.666c-14.081,0 -25.666,-11.585 -25.666,-25.666l-0,-32.445l-64.891,-0l-0,32.445c-0,14.081 -11.586,25.666 -25.666,25.666c-14.08,0 -25.666,-11.585 -25.666,-25.666l0,-32.445l-64.891,-0l0,32.445c0,14.081 -11.585,25.666 -25.666,25.666c-14.08,0 -25.666,-11.585 -25.666,-25.666l0,-32.445l-13.075,-0c-24.705,-0 -45.036,-20.331 -45.036,-45.037l0,-116.222c0,-24.706 20.331,-45.037 45.036,-45.037l13.075,0l0,-32.445c0,-14.081 11.586,-25.666 25.666,-25.666c14.081,-0 25.666,11.585 25.666,25.666l0,32.445l64.891,0l0,-32.445c0,-14.081 11.586,-25.666 25.666,-25.666c14.08,-0 25.666,11.585 25.666,25.666l-0,32.445l64.891,0l-0,-32.445c-0,-14.081 11.585,-25.666 25.666,-25.666c14.08,-0 25.666,11.585 25.666,25.666l-0,32.445l13.075,0Zm-303.632,154.964l297.336,-0l0,-103.632l-297.336,0l-0,103.632Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
            </div>
        `;
        document.body.appendChild(dom);
        const frameFrame = document.getElementById('FrameFrame');
        const sceneFrame = document.getElementById('SceneFrame');
        const buffersFrame = document.getElementById('BuffersFrame');
        const systemFrame = document.getElementById('SystemFrame');
        const buttonFrame = document.getElementById('ButtonFrame');
        const buttonScene = document.getElementById('ButtonScene');
        const buttonBuffers = document.getElementById('ButtonBuffers');
        const buttonSystem = document.getElementById('ButtonSystem');
        buttonFrame.setAttribute('tooltip', 'Frame');
        buttonScene.setAttribute('tooltip', 'Scene');
        buttonBuffers.setAttribute('tooltip', 'Buffers');
        buttonSystem.setAttribute('tooltip', 'System');
        function toggleFrame(frame, button, open, storageKey) {
            if (open) {
                frame.style.display = '';
                button.classList.add('suey-selected');
            } else {
                frame.style.display = 'none';
                button.classList.remove('suey-selected');
            }
            localStorage.setItem(storageKey, open);
        }
        buttonFrame.addEventListener('click', () => {
            openFrame = !openFrame;
            toggleFrame(frameFrame, buttonFrame, openFrame, 'DebugFrame');
        });
        buttonScene.addEventListener('click', () => {
            openScene = !openScene;
            toggleFrame(sceneFrame, buttonScene, openScene, 'DebugScene');
        });
        buttonBuffers.addEventListener('click', () => {
            openBuffers = !openBuffers;
            toggleFrame(buffersFrame, buttonBuffers, openBuffers, 'DebugBuffers');
        });
        buttonSystem.addEventListener('click', () => {
            openSystem = !openSystem;
            toggleFrame(systemFrame, buttonSystem, openSystem, 'DebugSystem');
        });
        toggleFrame(frameFrame, buttonFrame, openFrame, 'DebugFrame');
        toggleFrame(sceneFrame, buttonScene, openScene, 'DebugScene');
        toggleFrame(buffersFrame, buttonBuffers, openBuffers, 'DebugBuffers');
        toggleFrame(systemFrame, buttonSystem, openSystem, 'DebugSystem');
        const domFps = document.getElementById('EyeFps');
        const domRender = document.getElementById('EyeRender');
        const domMax = document.getElementById('EyeMax');
        const domDraws = document.getElementById('EyeDraws');
        const domObjects = document.getElementById('EyeObjects');
        const domLights = document.getElementById('EyeLights');
        const domVertices = document.getElementById('EyeVertices');
        const domTriangles = document.getElementById('EyeTriangles');
        const domPrograms = document.getElementById('EyePrograms');
        const domGeometries = document.getElementById('EyeGeometries');
        const domTextures = document.getElementById('EyeTextures');
        const domMem = document.getElementById('EyeMemory');
        const frameClock = new Clock();
        const elapsedClock = new Clock();
        this.#startInternal = function(renderer) {
            frameClock.start();
            renderer.drawCallCount = 0;
        };
        this.#stopInternal = function(renderer) {
            frameClock.stop();
            elapsedClock.getDeltaTime();
            const elapsed = elapsedClock.getElapsedTime();
            if (elapsed > 1) {
                const fps = elapsedClock.count() / elapsed;
                if (domFps) domFps.firstChild.textContent = `${fps.toFixed(1)} fps`;
                elapsedClock.reset();
                const frameAvg = frameClock.averageDelta();
                if (domRender) domRender.firstChild.textContent = `${frameAvg.toFixed(3) * 1000} ms`;
                if (domMax) domMax.firstChild.textContent = `~ ${Math.floor(1 / frameAvg)} fps`;
                frameClock.reset();
                if (domDraws) domDraws.firstChild.textContent = `${renderer.drawCallCount}`;
                if (domMem && performance.memory) {
                    const memory = performance.memory.usedJSHeapSize / 1048576;
                    domMem.firstChild.textContent = `${memory.toFixed(2)} mb`;
                }
                let objects = 0, vertices = 0, triangles = 0, lights = 0;
                const scene = renderer.scene;
                if (scene) {
                    objects = -1;
                    scene.traverse((object) => {
                        if (object.visible) objects++;
                        if (object.isLight) lights++;
                        if (object.isMesh && object.geometry) {
                            const geometry = object.geometry;
                            vertices += geometry.attributes.position.count;
                            const instance = (geometry.isInstanced) ? geometry.instancedCount : 1;
                            if (geometry.attributes.index) triangles += (geometry.attributes.index.count / 3) * instance;
                            else triangles += (geometry.attributes.position.count / 3) * instance;
                        }
                    });
                }
                domObjects.firstChild.textContent = `${objects}`;
                domLights.firstChild.textContent = `${lights}`;
                domVertices.firstChild.textContent = `${vertices}`;
                domTriangles.firstChild.textContent = `${triangles.toFixed(0)}`;
                domPrograms.firstChild.textContent = `${renderer.info?.programs ?? 0}`;
                domGeometries.firstChild.textContent = `${renderer.info?.geometries ?? 0}`;
                domTextures.firstChild.textContent = `${renderer.info?.textures ?? 0}`;
            }
        };
        _singleton = this;
    }
    startFrame(renderer) {
        this.#startInternal(renderer);
    }
    endFrame(renderer) {
        this.#stopInternal(renderer);
    }
}
function getVariable(variable) {
    variable = String(variable);
    if (!variable.startsWith('--')) variable = '--' + variable;
    const rootElement = document.querySelector(':root');
    const value = getComputedStyle(rootElement).getPropertyValue(variable);
    return ((value === '') ? undefined : value);
}

export { APP_EVENTS, APP_ORIENTATION, APP_SIZE, App, ArrayUtils, Asset, AssetManager, Box, Box2, BoxMask, Camera2D, CameraControls, Circle, Clock, ColorStyle, Debug, DomElement, Entity, EventManager, GridHelper, Key, Keyboard, Line, LinearGradientStyle, MOUSE_CLICK_TIME, MOUSE_DOUBLE_TIME, MOUSE_SLOP, Mask, MathUtils, Matrix2, OUTLINE_THICKNESS, Object2D, OriginHelper, Palette, Pattern, Pointer, PolyUtils, Project, RadialGradientStyle, Renderer, ResizeHelper, RubberBandBox, SCRIPT_FORMAT, STAGE_TYPES, SceneManager, Script, SelectControls, Sprite, Stage, Style, SysUtils, Text, Thing, TooltipHelper, VERSION, Vector2, Vector3, WORLD_TYPES, World };
