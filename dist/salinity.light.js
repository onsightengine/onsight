/**
 * @description Salinity Engine
 * @about       Interactive, easy to use JavaScript app & game framework.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.7
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine/engine
 */
var name = "@salinity/engine";
var version = "0.0.7";
var description = "Interactive, easy to use JavaScript app & game framework.";
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
	"@rollup/plugin-multi-entry": "^6.0.1",
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
        for (const type of _types$2.keys()) {
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
        for (const type of _types$2.keys()) {
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
        _types$2.set(type, AssetClass);
    }
    static type(type) {
        return _types$2.get(type);
    }
}
const _types$2 = new Map();

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
        temp1.copy(this).normalize();
        temp2.copy(vec).normalize();
        const cosine = temp1.dot(temp2);
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
        temp1.subVectors(a, b);
        target.subVectors(b, c);
        target.cross(temp1);
        return target.normalize();
    }
    equals(vec) {
        return ((vec.x === this.x) && (vec.y === this.y) && (vec.z === this.z));
    }
    fuzzyEquals(vec, tolerance = 0.001) {
        if (fuzzyFloat$1(this.x, vec.x, tolerance) === false) return false;
        if (fuzzyFloat$1(this.y, vec.y, tolerance) === false) return false;
        if (fuzzyFloat$1(this.z, vec.z, tolerance) === false) return false;
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
const temp1 = new Vector3();
const temp2 = new Vector3();
function fuzzyFloat$1(a, b, tolerance = 0.001) {
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
}

class Entity extends Thing {
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
            clonedComponent.tag = component.tag;
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
                    component.tag = componentData.base.tag;
                }
            }
        }
        if (data.children) {
            for (const childData of data.children) {
                const Constructor = Entity.type(childData.type);
                if (Constructor) {
                    const child = new Constructor().fromJSON(childData);
                    this.addEntity(child);
                } else {
                    console.warn(`Entity.fromJSON(): Unknown entity type '${childData.type}'`);
                }
            }
        }
        return this;
    }
    static register(type, EntityClass) {
	    _types$1.set(type, EntityClass);
    }
    static type(type) {
        return _types$1.get(type);
    }
}
const _types$1 = new Map();
Entity.register('Entity', Entity);

class World extends Entity {
    constructor(type = WORLD_TYPES.WORLD_2D, name = 'World 1') {
        super(name);
        if (Object.values(WORLD_TYPES).indexOf(type) === -1) {
            console.warn(`World: Invalid world type '${type}', using 'World2D`);
            type = WORLD_TYPES.WORLD_2D;
        }
        this.isWorld = true;
        this.type = type;
        this.position = new Vector3();
        this.activeStageUUID = null;
        this.loadPosition = new Vector3();
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
Entity.register('World2D', World);
Entity.register('World3D', World);
Entity.register('WorldUI', World);

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
Entity.register('Stage2D', Stage);
Entity.register('Stage3D', Stage);
Entity.register('StageUI', Stage);

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
        this.x = a.x + ((b.x - a.x) * t);
        this.y = a.y + ((b.y - a.y) * t);
        return this;
    }
    equals(vec) {
        return ((vec.x === this.x) && (vec.y === this.y));
    }
    fuzzyEquals(vec, tolerance = 0.001) {
        if (fuzzyFloat(this.x, vec.x, tolerance) === false) return false;
        if (fuzzyFloat(this.y, vec.y, tolerance) === false) return false;
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
function fuzzyFloat(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
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
    #locked = false;
    #lockID = 1;
    constructor(element, disableContextMenu = true) {
        if (!element || !element.dom) {
            console.error(`Pointer: No element was provided`);
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
        element.on('pointerdown', (event) => {
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
    buttonPressed(button, id = -1) {
        if (this.#locked && this.#locked !== id) return false;
        return this.keys[button].pressed;
    }
    buttonDoubleClicked(button, id = -1) {
        if (this.#locked && this.#locked !== id) return false;
        return this.doubleClicked[button]
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
        if (this._positionUpdated) {
            this.delta.copy(this._delta);
            this.position.copy(this._position);
            this._delta.set(0, 0);
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
    getWorldPointIntersections(worldPoint) {
        const objects = [];
        this.traverse((child) => {
            if (!child.visible) return;
            const localPoint = child.inverseGlobalMatrix.transformPoint(worldPoint);
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

class Renderer {
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
        canvas.setAttribute('tabindex', '0');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.outline = 'none';
        this.dom = canvas;
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
    addUpdate(object) {
        if (this.updatable.includes(object) === false) {
            this.updatable.push(object);
        }
    }
    start(scene, camera, onBeforeRender, onAfterRender) {
        if (this.running) return;
        this.running = true;
        const renderer = this;
        function loop() {
            if (typeof onBeforeRender === 'function') onBeforeRender();
            for (const object of renderer.updatable) {
                if (typeof object.update === 'function') object.update(renderer);
            }
            camera.updateMatrix(renderer.width / 2.0, renderer.height / 2.0);
            renderer.render(scene, camera);
            if (typeof onAfterRender === 'function') onAfterRender();
            if (renderer.running) renderer.frame = requestAnimationFrame(loop);
        }
        loop();
    }
    stop() {
        this.running = false;
        cancelAnimationFrame(this.frame);
    }
    render(scene, camera) {
        this.drawCallCount = 0;
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
        for (const object of objects) {
            object.inViewport = viewport.intersectsBox(camera, object.getWorldBoundingBox());
        }
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);
        let currentCursor = null;
        for (const object of objects) {
            if (object.pointerEvents && object.inViewport) {
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
            if (object.inViewport !== true) {
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
            if (typeof object.style === 'function') {
                object.style(context, camera, this.dom, this);
            }
            if (typeof object.draw === 'function') {
                object.draw(context, camera, this.dom, this);
                this.drawCallCount++;
            }
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

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}

export { APP_EVENTS, APP_ORIENTATION, APP_SIZE, App, ArrayUtils, Asset, AssetManager, Box, Box2, BoxMask, Camera2D, Circle, Clock, ColorStyle, Entity, GradientColorStop, GradientStyle, Key, Keyboard, Line, LinearGradientStyle, Mask, MathUtils, Matrix2, Object2D, Palette, Pointer, Project, RadialGradientStyle, Renderer, SCRIPT_FORMAT, STAGE_TYPES, SceneManager, Script, Stage, Style, SysUtils, Text, Thing, VERSION, Vector2, Vector3, Viewport, WORLD_TYPES, World };
