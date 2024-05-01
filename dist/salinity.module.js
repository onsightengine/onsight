/**
 * @description Salinity Engine
 * @about       Easy to use JavaScript game engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.6
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine/engine
 */
var name = "@salinity/engine";
var version = "0.0.6";
var description = "Easy to use JavaScript game engine.";
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

class Arrays {
    static isIterable(obj) {
        return (obj && typeof obj[Symbol.iterator] === 'function');
    }
    static swapItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }
    static combineEntityArrays(arrayOne, arrayTwo) {
        const entities = [...arrayOne];
        for (const entity of arrayTwo) if (Arrays.includesEntity(entity, arrayOne) === false) entities.push(entity);
        return entities;
    }
    static compareEntityArrays(arrayOne, arrayTwo) {
        arrayOne = Array.isArray(arrayOne) ? arrayOne : [ arrayOne ];
        arrayTwo = Array.isArray(arrayTwo) ? arrayTwo : [ arrayTwo ];
        for (const entity of arrayOne) if (Arrays.includesEntity(entity, arrayTwo) === false) return false;
        for (const entity of arrayTwo) if (Arrays.includesEntity(entity, arrayOne) === false) return false;
        return true;
    }
    static includesEntity(findEntity, ...entities) {
        if (!findEntity || !findEntity.isEntity) return false;
        if (entities.length === 0) return false;
        if (entities.length > 0 && Array.isArray(entities[0])) entities = entities[0];
        for (const entity of entities) if (entity.isEntity && entity.uuid === findEntity.uuid) return true;
        return false;
    }
    static removeEntityFromArray(removeEntity, ...entities) {
        if (entities.length > 0 && Array.isArray(entities[0])) entities = entities[0];
        if (!removeEntity || !removeEntity.isEntity) return [...entities];
        const newArray = [];
        for (const entity of entities) if (entity.uuid !== removeEntity.uuid) newArray.push(entity);
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
        for (const type of Object.keys(_types$1)) {
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
        for (const type of Object.keys(_types$1)) {
            if (!json[type]) continue;
            for (const assetData of json[type]) {
                const Constructor = _types$1[type];
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
	    if (!_types$1[type]) _types$1[type] = AssetClass;
    }
}
const _types$1 = {};

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
            this.#lastFrameCount = 0;
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
        const frameRate = 1 / this.#lastFrameCount;
        return Math.min(1, frameRate);
    }
    fps() {
        return this.#lastFrameCount;
    }
}

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];
class Uuid {
    static generate() {
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
    static arrayFromObjects(...objects) {
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        const uuids = [];
        for (const object of objects) {
            if (typeof object === 'object' && object.uuid) uuids.push(object.uuid);
        }
        return uuids;
    }
}

const EPSILON$1 = 0.000001;
function length$1(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
function copy$1(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
}
function set$1(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}
function add$1(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}
function subtract$1(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}
function multiply$1(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}
function divide$1(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}
function scale$1(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
}
function distance$1(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
function squaredDistance$1(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return x * x + y * y + z * z;
}
function squaredLength$1(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return x * x + y * y + z * z;
}
function negate$1(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
}
function inverse$1(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
}
function normalize$1(out, a) {
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
function dot$1(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross$1(out, a, b) {
    let ax = a[0], ay = a[1], az = a[2];
    let bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}
function lerp$1(out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
}
function transformMat4$1(out, a, m) {
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
function transformMat3$1(out, a, m) {
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
        copy$1(tempA, a);
        copy$1(tempB, b);
        normalize$1(tempA, tempA);
        normalize$1(tempB, tempB);
        let cosine = dot$1(tempA, tempB);
        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1.0) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    };
})();
function exactEquals$1(a, b) {
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
        subtract$1(temp, a, b);
        subtract$1(out, b, c);
        cross$1(out, temp, out);
        normalize$1(out, out);
    };
})();
function fuzzyFloat(a, b, tolerance = 0.001) {
    return ((a < (b + tolerance)) && (a > (b - tolerance)));
}

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
        subtract$1(v0, c, b);
        subtract$1(v1, a, b);
        cross$1(vc, v0, v1);
        return (length$1(vc) * 0.5);
    }
    static randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }
    static randomInt(min = 0, max = 1) {
        return min + Math.floor(Math.random() * (max - min));
    }
}

class System {
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
                const data = (this.data?.style) ? this.defaultData('style', this.data.style) : this.defaultData();
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

class Entity {
    constructor(name = 'Entity') {
        this.isEntity = true;
        this.type = 'Entity';
        this.name = name;
        this.uuid = Uuid.generate();
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
        if (typeof callback === 'function' && callback(this)) return;
        for (const child of this.children) {
            child.traverse(callback, recursive);
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
    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = true) {
        this.dispose();
        this.name = source.name;
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
        const data = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
            category: this.category,
            locked: this.locked,
            visible: this.visible,
            components: [],
            children: [],
        };
        if (recursive === false) {
            data.meta = {
                type: this.type,
                version: VERSION,
            };
        }
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
        if (data.type !== undefined) this.type = data.type;
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
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
	    if (!_types[type]) _types[type] = EntityClass;
    }
    static type(type) {
        return _types[type];
    }
}
const _types = { 'Entity': Entity };

const EPSILON = 0.000001;
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
}
function set(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
}
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
}
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
}
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
}
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x * x + y * y);
}
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x * x + y * y;
}
function length(a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x * x + y * y);
}
function squaredLength(a) {
    var x = a[0],
        y = a[1];
    return x * x + y * y;
}
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
}
function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
}
function normalize(out, a) {
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;
}
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}
function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
}
function transformMat3(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}
function transformMat4(out, a, m) {
    let x = a[0];
    let y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
}
function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

class Vec2 extends Array {
    constructor(x = 0, y = x) {
        super(x, y);
        return this;
    }
    get x() {
        return this[0];
    }
    get y() {
        return this[1];
    }
    set x(v) {
        this[0] = v;
    }
    set y(v) {
        this[1] = v;
    }
    set(x, y = x) {
        if (x.length) return this.copy(x);
        set(this, x, y);
        return this;
    }
    copy(v) {
        copy(this, v);
        return this;
    }
    add(va, vb) {
        if (vb) add(this, va, vb);
        else add(this, this, va);
        return this;
    }
    sub(va, vb) {
        if (vb) subtract(this, va, vb);
        else subtract(this, this, va);
        return this;
    }
    multiply(v) {
        if (v.length) multiply(this, this, v);
        else scale(this, this, v);
        return this;
    }
    divide(v) {
        if (v.length) divide(this, this, v);
        else scale(this, this, 1 / v);
        return this;
    }
    inverse(v = this) {
        inverse(this, v);
        return this;
    }
    len() {
        return length(this);
    }
    distance(v) {
        if (v) return distance(this, v);
        else return length(this);
    }
    squaredLen() {
        return this.squaredDistance();
    }
    squaredDistance(v) {
        if (v) return squaredDistance(this, v);
        else return squaredLength(this);
    }
    negate(v = this) {
        negate(this, v);
        return this;
    }
    cross(va, vb) {
        if (vb) return cross(va, vb);
        return cross(this, va);
    }
    scale(v) {
        scale(this, this, v);
        return this;
    }
    normalize() {
        normalize(this, this);
        return this;
    }
    dot(v) {
        return dot(this, v);
    }
    equals(v) {
        return exactEquals(this, v);
    }
    applyMatrix3(mat3) {
        transformMat3(this, this, mat3);
        return this;
    }
    applyMatrix4(mat4) {
        transformMat4(this, this, mat4);
        return this;
    }
    lerp(v, a) {
        lerp(this, this, v, a);
        return this;
    }
    clone() {
        return new Vec2(this[0], this[1]);
    }
    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        return this;
    }
    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        return a;
    }
    log(description = '') {
        if (description !== '') description += ' - ';
        console.log(`${description}X: ${this.x}, Y: ${this.y}`);
    }
}

class Vec3 extends Array {
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
        return this;
    }
    get x() {
        return this[0];
    }
    get y() {
        return this[1];
    }
    get z() {
        return this[2];
    }
    set x(v) {
        this[0] = v;
    }
    set y(v) {
        this[1] = v;
    }
    set z(v) {
        this[2] = v;
    }
    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        set$1(this, x, y, z);
        return this;
    }
    copy(v) {
        copy$1(this, v);
        return this;
    }
    add(va, vb) {
        if (vb) add$1(this, va, vb);
        else add$1(this, this, va);
        return this;
    }
    sub(va, vb) {
        if (vb) subtract$1(this, va, vb);
        else subtract$1(this, this, va);
        return this;
    }
    multiply(v) {
        if (v.length) multiply$1(this, this, v);
        else scale$1(this, this, v);
        return this;
    }
    divide(v) {
        if (v.length) divide$1(this, this, v);
        else scale$1(this, this, 1 / v);
        return this;
    }
    inverse(v = this) {
        inverse$1(this, v);
        return this;
    }
    len() {
        return length$1(this);
    }
    distance(v) {
        if (v) return distance$1(this, v);
        else return length$1(this);
    }
    squaredLen() {
        return squaredLength$1(this);
    }
    squaredDistance(v) {
        if (v) return squaredDistance$1(this, v);
        else return squaredLength$1(this);
    }
    negate(v = this) {
        negate$1(this, v);
        return this;
    }
    cross(va, vb) {
        if (vb) cross$1(this, va, vb);
        else cross$1(this, this, va);
        return this;
    }
    scale(multiplier) {
        scale$1(this, this, multiplier);
        return this;
    }
    normalize() {
        normalize$1(this, this);
        return this;
    }
    dot(v) {
        return dot$1(this, v);
    }
    equals(v) {
        return exactEquals$1(this, v);
    }
    fuzzyEquals(v, tolerance) {
        return fuzzyEquals(this, v, tolerance);
    }
    applyMatrix3(mat3) {
        transformMat3$1(this, this, mat3);
        return this;
    }
    applyMatrix4(mat4) {
        transformMat4$1(this, this, mat4);
        return this;
    }
    scaleRotateMatrix4(mat4) {
        scaleRotateMat4(this, this, mat4);
        return this;
    }
    applyQuaternion(q) {
        transformQuat(this, this, q);
        return this;
    }
    angle(v) {
        return angle(this, v);
    }
    lerp(v, t) {
        lerp$1(this, this, v, t);
        return this;
    }
    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }
    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        return this;
    }
    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }
    transformDirection(mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];
        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;
        return this.normalize();
    }
    log(description = '') {
        if (description !== '') description += ' - ';
        console.log(`${description}X: ${this.x}, Y: ${this.y}, Z: ${this.z}`);
    }
}

class World extends Entity {
    constructor(type = WORLD_TYPES.WORLD_2D, name = 'World 1') {
        super(name);
        if (Object.values(WORLD_TYPES).indexOf(type) === -1) {
            console.warn(`World: Invalid world type '${type}', using 'World2D`);
            type = WORLD_TYPES.WORLD_2D;
        }
        this.isWorld = true;
        this.type = type;
        this.position = new Vec2();
        this.activeStageUUID = null;
        this.loadPosition = new Vec3();
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
        data.position = JSON.stringify(this.position.toArray());
        data.activeStageUUID = this.activeStageUUID;
        data.loadPosition = JSON.stringify(this.loadPosition.toArray());
        data.loadDistance = this.loadDistance;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
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

class Project {
    constructor(name = 'My Project') {
        this.isProject = true;
        this.type = 'Project';
        this.name = name;
        this.uuid = Uuid.generate();
        this.activeWorldUUID = null;
        this.startWorldUUID = null;
        this.notes = '';
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
        this.uuid = Uuid.generate();
        this.activeWorldUUID = null;
    }
    toJSON() {
        const data = {};
        data.meta = {
            type: 'Salinity',
            version: VERSION,
            generator: 'Salinity.Project.toJSON()',
        };
        data.assets = AssetManager.toJSON();
        data.object = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
            activeWorldUUID: this.activeWorldUUID,
            startWorldUUID: this.startWorldUUID,
        };
        data.notes = this.notes;
        data.settings = structuredClone(this.settings);
        data.worlds = [];
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            data.worlds.push(world.toJSON());
        }
        return data;
    }
    fromJSON(data, loadAssets = true) {
        const type = data.meta?.type ?? 'undefined';
        if (type !== 'Salinity') {
            console.error(`Project.fromJSON(): Unknown project type '${type}', expected 'Salinity'`);
            return;
        }
        const version = data.meta?.version ?? 'unknown';
        if (version !== VERSION) {
            console.warn(`Project.fromJSON(): Project saved in 'v${version}', attempting to load with 'v${VERSION}'`);
        }
        if (!data.object || data.object.type !== this.type) {
            console.error(`Project.fromJSON(): Save file corrupt, no 'Project' object found!`);
            return;
        }
        this.clear();
        if (loadAssets) {
            AssetManager.fromJSON(data.assets);
        }
        this.name = data.object.name;
        this.uuid = data.object.uuid;
        this.activeWorldUUID = data.object.activeWorldUUID;
        this.startWorldUUID = data.object.startWorldUUID;
        this.notes = data.notes;
        this.settings = structuredClone(data.settings);
        for (const worldData of data.worlds) {
            const world = new World().fromJSON(worldData);
            console.log(world.type);
            this.addWorld(world);
        }
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
}

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
        this.beginPosition = new Vec3();
        this.endPosition = new Vec3();
    }
    componentFamily() {
        return [ 'Stage', this.type ];
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
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
        data.enabled = this.enabled;
        data.start = this.start;
        data.finish = this.finish;
        data.beginPosition = JSON.stringify(this.beginPosition.toArray());
        data.endPosition = JSON.stringify(this.endPosition.toArray());
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
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

class Cache {
    constructor() {
        this.items = {};
    }
    add(key, item) {
        this.items[key] = item;
    }
    get(key) {
        return this.items[key];
    }
    getByProperty(property, value) {
        for (const key in this.items) {
            if (this.items[key][property] === value) {
                return this.items[key];
            }
        }
    }
    remove(key) {
        delete this.items[key];
    }
    removeByProperty(property, value) {
        for (const key in this.items) {
            if (this.items[key][property] === value) {
                delete this.items[key];
            }
        }
    }
    clear() {
        this.items = {};
    }
}

class LoadingManager {
    constructor(onLoad, onProgress, onError) {
        const self = this;
        let isLoading = false;
        let itemsLoaded = 0;
        let itemsTotal = 0;
        let urlModifier = undefined;
        const handlers = [];
        this.onStart = undefined;
        this.onLoad = onLoad;
        this.onProgress = onProgress;
        this.onError = onError;
        this.itemStart = function (url) {
            itemsTotal++;
            if (!isLoading && typeof self.onStart === 'function') {
                self.onStart(url, itemsLoaded, itemsTotal);
            }
            isLoading = true;
        };
        this.itemEnd = function (url) {
            itemsLoaded++;
            if (typeof self.onProgress === 'function') {
                self.onProgress(url, itemsLoaded, itemsTotal);
            }
            if (itemsLoaded === itemsTotal) {
                isLoading = false;
                if (typeof self.onLoad === 'function') self.onLoad();
            }
        };
        this.itemError = function (url) {
            if (typeof self.onError === 'function') self.onError(url);
        };
        this.resolveURL = function (url) {
            if (urlModifier) return urlModifier(url);
            return url;
        };
        this.setURLModifier = function (transform) {
            urlModifier = transform;
            return this;
        };
        this.addHandler = function (regex, loader) {
            handlers.push(regex, loader);
            return this;
        };
        this.removeHandler = function (regex) {
            const index = handlers.indexOf(regex);
            if (index !== -1) handlers.splice(index, 2);
            return this;
        };
        this.getHandler = function (file) {
            for (let i = 0, l = handlers.length; i < l; i += 2) {
                const regex = handlers[i];
                const loader = handlers[i + 1];
                if (regex.global) regex.lastIndex = 0;
                if (regex.test(file)) return loader;
            }
            return null;
        };
    }
}
const DefaultLoadingManager = new LoadingManager();

class Loader {
    constructor(manager) {
        this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;
        this.crossOrigin = 'anonymous';
        this.withCredentials = false;
        this.path = '';
        this.resourcePath = '';
        this.requestHeader = {};
    }
    load() {}
    loadAsync(url, onProgress) {
        const scope = this;
        return new Promise(function (resolve, reject) {
            scope.load(url, resolve, onProgress, reject);
        });
    }
    parse() {}
    setCrossOrigin(crossOrigin) {
        this.crossOrigin = crossOrigin;
        return this;
    }
    setWithCredentials(value) {
        this.withCredentials = value;
        return this;
    }
    setPath(path) {
        this.path = path;
        return this;
    }
    setResourcePath(resourcePath) {
        this.resourcePath = resourcePath;
        return this;
    }
    setRequestHeader(requestHeader) {
        this.requestHeader = requestHeader;
        return this;
    }
}

const loading = {};
class FileLoader extends Loader {
    constructor(manager) {
        super(manager);
    }
    load(url, onLoad, onProgress, onError) {
        if (url === undefined) url = '';
        if (this.path !== undefined) url = this.path + url;
        url = this.manager.resolveURL(url);
        const cached = Cache.get(url);
        if (cached !== undefined) {
            this.manager.itemStart(url);
            setTimeout(() => {
                if (onLoad) onLoad(cached);
                this.manager.itemEnd(url);
            }, 0);
            return cached;
        }
        if (loading[url] !== undefined) {
            loading[url].push({
                onLoad: onLoad,
                onProgress: onProgress,
                onError: onError
            });
            return;
        }
        loading[url] = [];
        loading[url].push({
            onLoad: onLoad,
            onProgress: onProgress,
            onError: onError,
        });
        const req = new Request(url, {
            headers: new Headers(this.requestHeader),
            credentials: this.withCredentials ? 'include' : 'same-origin',
        });
        const mimeType = this.mimeType;
        const responseType = this.responseType;
        fetch(req)
            .then(response => {
                if (response.status === 200 || response.status === 0) {
                    if (response.status === 0) {
                        console.warn('FileLoader.load(): HTTP Status 0 received');
                    }
                    if (typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined) {
                        return response;
                    }
                    const callbacks = loading[url];
                    const reader = response.body.getReader();
                    const contentLength = response.headers.get('X-File-Size') || response.headers.get('Content-Length');
                    const total = contentLength ? parseInt(contentLength) : 0;
                    const lengthComputable = total !== 0;
                    let loaded = 0;
                    const stream = new ReadableStream({
                        start(controller) {
                            readData();
                            function readData() {
                                reader.read().then(({ done, value }) => {
                                    if (done) {
                                        controller.close();
                                    } else {
                                        loaded += value.byteLength;
                                        const event = new ProgressEvent('progress', { lengthComputable, loaded, total });
                                        for (let i = 0, il = callbacks.length; i < il; i ++) {
                                            const callback = callbacks[ i ];
                                            if (callback.onProgress) callback.onProgress(event);
                                        }
                                        controller.enqueue(value);
                                        readData();
                                    }
                                });
                            }
                        }
                    });
                    return new Response(stream);
                } else {
                    console.error(`Fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response);
                }
            })
            .then(response => {
                switch (responseType) {
                    case 'arraybuffer':
                        return response.arrayBuffer();
                    case 'blob':
                        return response.blob();
                    case 'document':
                        return response.text()
                            .then(text => {
                                const parser = new DOMParser();
                                return parser.parseFromString(text, mimeType);
                            });
                    case 'json':
                        return response.json();
                    default:
                        if (mimeType === undefined) {
                            return response.text();
                        } else {
                            const re = /charset="?([^;"\s]*)"?/i;
                            const exec = re.exec(mimeType);
                            const label = exec && exec[1] ? exec[1].toLowerCase() : undefined;
                            const decoder = new TextDecoder(label);
                            return response.arrayBuffer().then(ab => decoder.decode(ab));
                        }
                }
            })
            .then(data => {
                Cache.add(url, data);
                const callbacks = loading[url];
                delete loading[url];
                for (let i = 0, il = callbacks.length; i < il; i++) {
                    const callback = callbacks[i];
                    if (callback.onLoad) callback.onLoad(data);
                }
            })
            .catch(err => {
                const callbacks = loading[url];
                if (callbacks === undefined) {
                    this.manager.itemError(url);
                    throw err;
                }
                delete loading[url];
                for (let i = 0, il = callbacks.length; i < il; i ++) {
                    const callback = callbacks[i];
                    if (callback.onError) callback.onError(err);
                }
                this.manager.itemError(url);
            })
            .finally(() => {
                this.manager.itemEnd(url);
            });
        this.manager.itemStart(url);
    }
    setResponseType(value) {
        this.responseType = value;
        return this;
    }
    setMimeType(value) {
        this.mimeType = value;
        return this;
    }
}

class ImageLoader extends Loader {
    constructor(manager) {
        super(manager);
    }
    load(url, onLoad, onProgress, onError) {
        if (this.path !== undefined) url = this.path + url;
        url = this.manager.resolveURL(url);
        const scope = this;
        const cached = Cache.get(url);
        if (cached !== undefined) {
            scope.manager.itemStart(url);
            setTimeout(function () {
                if (onLoad) onLoad(cached);
                scope.manager.itemEnd(url);
            }, 0);
            return cached;
        }
        const image = document.createElement('img');
        function onImageLoad() {
            removeEventListeners();
            Cache.add(url, this);
            if (onLoad) onLoad(this);
            scope.manager.itemEnd(url);
        }
        function onImageError(event) {
            removeEventListeners();
            if (onError) onError(event);
            scope.manager.itemError(url);
            scope.manager.itemEnd(url);
        }
        function removeEventListeners() {
            image.removeEventListener('load', onImageLoad, false);
            image.removeEventListener('error', onImageError, false);
        }
        image.addEventListener('load', onImageLoad, false);
        image.addEventListener('error', onImageError, false);
        if (url.slice(0, 5) !== 'data:') {
            if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin;
        }
        scope.manager.itemStart(url);
        image.src = url;
        return image;
    }
}

class Asset {
    constructor(name = '') {
        this.isAsset = true;
        this.type = 'Asset';
        this.name = name ?? '';
        this.uuid = Uuid.generate();
        this.category = 'unknown';
    }
    toJSON() {
        const data = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
            category: this.category,
        };
        return data;
    }
    fromJSON(data) {
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
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

let Script$1 = class Script extends Asset {
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
};
AssetManager.register('Script', Script$1);
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

class Entity2D extends Entity {
    constructor(name = 'Entity') {
        super(name);
        this.isEntity2D = true;
        this.type = 'Entity2D';
        this.lookAtCamera = false;
        this.bloom = false;
    }
    componentFamily() {
        return [ 'Entity2D' ];
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.lookAtCamera = source.lookAtCamera;
        this.bloom = source.bloom;
        return this;
    }
    dispose() {
        super.dispose();
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.lookAtCamera = this.lookAtCamera;
        data.bloom = this.bloom;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.bloom !== undefined) this.bloom = data.bloom;
        return this;
    }
}
Entity.register('Entity2D', Entity2D);

class Entity3D extends Entity {
    constructor(name = 'Entity') {
        super(name);
        this.isEntity3D = true;
        this.type = 'Entity3D';
        this.lookAtCamera = false;
        this.lookAtYOnly = false;
        this.bloom = false;
    }
    componentFamily() {
        return [ 'Entity3D' ];
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.lookAtCamera = source.lookAtCamera;
        this.lookAtYOnly = source.lookAtYOnly;
        this.bloom = source.bloom;
        return this;
    }
    dispose() {
        super.dispose();
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.lookAtCamera = this.lookAtCamera;
        data.lookAtYOnly = this.lookAtYOnly;
        data.bloom = this.bloom;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.lookAtYOnly !== undefined) this.lookAtYOnly = data.lookAtYOnly;
        if (data.bloom !== undefined) this.bloom = data.bloom;
        return this;
    }
}
Entity.register('Entity3D', Entity3D);

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
    }
    updateMatrixWorld(force) {
    }
    updateWorldMatrix(updateParents, updateChildren) {
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
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.changeType(source.type);
        this.fit = source.fit;
        this.near = source.near;
        this.far = source.far;
        this.fieldOfView = source.fieldOfView;
        this.setSize(source.lastWidth, source.lastHeight);
        return this;
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        data.cameraType = this.type;
        data.type = 'Camera3D';
        data.fit = this.fit;
        data.near = this.near;
        data.far = this.far;
        data.fieldOfView = this.fieldOfView;
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        if (data.cameraType !== undefined) {
            this.type = data.cameraType;
            this.changeType(this.type);
        }
        if (data.fit !== undefined) this.fit = data.fit;
        if (data.near !== undefined) this.near = data.near;
        if (data.far !== undefined) this.far = data.far;
        if (data.fieldOfView !== undefined) this.fieldOfView = data.fieldOfView;
        return this;
    }
}
Entity.register('Camera3D', Camera3D);

class EntityUI extends Entity {
    constructor(name = 'Entity') {
        super(name);
        this.isEntityUI = true;
        this.type = 'EntityUI';
    }
    componentFamily() {
        return [ 'EntityUI' ];
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        return this;
    }
    dispose() {
        super.dispose();
    }
    toJSON(recursive = true) {
        const data = super.toJSON(recursive);
        return data;
    }
    fromJSON(data) {
        super.fromJSON(data);
        return this;
    }
}
Entity.register('EntityUI', EntityUI);

class Geometry {
    init(data = {}) {
        if (data.isBufferGeometry) {
            const assetUUID = data.uuid;
            AssetManager.add(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        }
        let geometry = undefined;
        switch (data.style) {
            case 'asset':
                const assetGeometry = AssetManager.get(data.asset);
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
            AssetManager.add(data);
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
                        AssetManager.add(value);
                    } else {
                        const textureCheck = AssetManager.get(value);
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
                const assetMaterial = AssetManager.get(data.asset);
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
            AssetManager.add(data);
            data = this.defaultData();
            data.script = assetUUID;
        }
        const script = AssetManager.get(data.script);
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

export { APP_EVENTS, APP_ORIENTATION, APP_SIZE, App, Arrays, AssetManager, Cache, Camera3D, Clock, ColorChange, ComponentManager, DragControls, DrivingControls, Entity, Entity2D, Entity3D, EntityUI, FileLoader, FollowCamera, ImageLoader, KeyControls, Loader, LoadingManager, Maths, MoveCamera, OrbitEntity, Palette, Project, RotateEntity, SCRIPT_FORMAT, STAGE_TYPES, SceneManager, Script$1 as Script, Stage, System, Uuid, VERSION, Vectors, WORLD_TYPES, World, ZigZagControls };
