/**
 * @description Salinity Engine
 * @about       Easy to use JavaScript game engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.6
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine/engine
 */
import * as THREE$1 from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { LoopSubdivision } from 'three-subdivide';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import RAPIER from 'rapier';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

const VERSION = '0.0.6';
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
const LAYERS = {
    BASE:   0,
    BLOOM:  30,
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
const MESH_REBUILD_TYPES = [
    'geometry',
    'material',
    'palette',
    'shape',
    'texture',
];

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];
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
        return (number !== undefined && number !== null && typeof number === 'number' && !Number.isNaN(number) && Number.isFinite(number));
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

class Strings {
    static addSpaces(string) {
        if (typeof string !== 'string') string = String(string);
        string = string.replace(/([a-z])([A-Z])/g, '$1 $2');
        string = string.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
        return string.trim();
    }
    static capitalize(string) {
        const words = String(string).split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
        return words.join(' ');
    }
    static countDigits(number) {
        return parseFloat(number).toString().length;
    }
    static escapeHTML(html) {
        if (html == undefined) return html;
        return html
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    static nameFromUrl(url, capitalize = true) {
        let imageName = new String(url.replace(/^.*[\\\/]/, ''));
        imageName = imageName.replace(/\.[^/.]+$/, "");
        if (capitalize) imageName = Strings.capitalize(imageName);
        return imageName;
    }
}

class System {
    static isIterable(obj) {
        if (obj == null) return false;
        return typeof obj[Symbol.iterator] === 'function';
    }
    static isObject(variable) {
        return (typeof variable === 'object' && !Array.isArray(variable) && variable !== null);
    }
    static swapArrayItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }
    static save(url, filename) {
        try {
            const link = document.createElement('a');
            document.body.appendChild(link);
            link.href = url;
            link.download = filename || 'data.json';
            link.click();
            setTimeout(function() {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 0);
        } catch (error) {
            console.warn(error);
            return;
        }
    }
    static saveBuffer(buffer, filename, optionalType = { type: 'application/octet-stream' }) {
        let url = URL.createObjectURL(new Blob([ buffer ], { type: optionalType }));
        System.save(url, filename);
    }
    static saveImage(imageUrl, filename) {
        System.save(imageUrl, filename);
    }
    static saveString(text, filename) {
        let url = URL.createObjectURL(new Blob([ text ], { type: 'text/plain' }));
        System.save(url, filename);
    }
    static detectOS() {
        let systems = {
            Android:    [ 'android' ],
            iOS:        [ 'iphone', 'ipad', 'ipod', 'ios' ],
            Linux:      [ 'linux', 'x11', 'wayland' ],
            Mac:        [ 'mac', 'darwin', 'osx', 'os x' ],
            Win:        [ 'win' ],
        };
        let userAgent = window.navigator.userAgent;
        let userAgentData = window.navigator.userAgentData;
        let platform = (userAgentData) ? userAgentData.platform : userAgent;
        platform = platform.toLowerCase();
        for (let key in systems) {
            for (let os of systems[key]) {
                if (platform.indexOf(os) !== -1) return key;
            }
        }
        return 'Unknown OS';
    }
    static fullscreen(element) {
        let isFullscreen =
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
        if (isFullscreen) {
            let el = document;
            let cancelMethod = el.cancelFullScreen || el.exitFullscreen || el.webkitCancelFullScreen || el.webkitExitFullscreen || el.mozCancelFullScreen;
            cancelMethod.call(el);
        } else {
            let el = element ?? document.body;
            let requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
            requestMethod.call(el);
        }
    }
    static metaKeyOS() {
        let system = System.detectOS();
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
            default:            console.warn(`ComponentManager.defaultValue(): Unknown property type: '${type}'`);
        }
        return null;
    }
    static registered(type = '') {
        const ComponentClass = _registered[type];
        if (!ComponentClass) console.warn(`ComponentManager.registered: Component '${type}' not registered'`);
        return ComponentClass;
    }
    static registeredTypes() {
        return Object.keys(_registered);
    }
    static register(type = '', ComponentClass) {
        type = type.toLowerCase();
        if (_registered[type]) return console.warn(`ComponentManager.register: Component '${type}' already registered`);
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

const _boxCenter = new THREE$1.Box3();
const _tempMatrix = new THREE$1.Matrix4();
const _tempVector = new THREE$1.Vector3();
const _startQuaternion = new THREE$1.Quaternion();
const _tempQuaternion = new THREE$1.Quaternion();
const _testQuaternion = new THREE$1.Quaternion();
const _objPosition$2 = new THREE$1.Vector3();
const _objQuaternion$2 = new THREE$1.Quaternion();
const _objRotation = new THREE$1.Euler();
const _objScale$2 = new THREE$1.Vector3();
const _tempBounds = new THREE$1.Box3();
const _tempScale$1 = new THREE$1.Vector3();
class ObjectUtils {
    static childByProperty(object, property, value) {
        for (const child of object.children) {
            if (child[property] === value) return child;
        }
    }
    static clearObject(object, removeFromParent = true) {
        if (!object || !object.isObject3D) return;
        if (object.geometry && typeof object.geometry.dispose === 'function') object.geometry.dispose();
        if (object.material) ObjectUtils.clearMaterial(object.material);
        if (object.dispose && typeof object.dispose === 'function') object.dispose();
        while (object.children.length > 0) {
            ObjectUtils.clearObject(object.children[0], true );
        }
        ObjectUtils.resetTransform(object);
        if (removeFromParent) object.removeFromParent();
        object = null;
    }
    static clearMaterial(materials) {
        if (!materials) return;
        materials = Array.isArray(materials) ? materials : [...arguments];
        for (const material of materials) {
            const keys = Object.keys(material);
            for (const key of keys) {
                const property = material[key];
                if (property && typeof property.dispose === 'function') {
                    property.dispose();
                }
            }
            if (typeof material.dispose === 'function') material.dispose();
        }
    }
    static compareQuaternions(objects) {
        objects = Array.isArray(objects) ? objects : [...arguments];
        objects[0].getWorldQuaternion(_startQuaternion);
        for (let i = 1; i < objects.length; i++) {
            objects[i].getWorldQuaternion(_testQuaternion);
            if (Maths.fuzzyQuaternion(_startQuaternion, _testQuaternion) === false) return false;
        }
        return true;
    }
    static computeBounds(objects, targetBox, checkIfSingleGeometry = false) {
        if (!targetBox || targetBox.isBox3 !== true) targetBox = new THREE$1.Box3();
        targetBox.makeEmpty();
        objects = Array.isArray(objects) ? objects : [ objects ];
        if (checkIfSingleGeometry && ObjectUtils.countGeometry(objects) === 1) {
            let geomObject = undefined;
            for (const object of objects) {
                object.traverse((child) => {
                    if (child.geometry) geomObject = child;
                });
            }
            if (geomObject && geomObject.geometry) {
                geomObject.geometry.computeBoundingBox();
                targetBox.copy(geomObject.geometry.boundingBox);
                geomObject.matrixWorld.decompose(_objPosition$2, _objQuaternion$2, _objScale$2);
                _objQuaternion$2.identity();
                _tempMatrix.compose(_objPosition$2, _objQuaternion$2, _objScale$2);
                targetBox.applyMatrix4(_tempMatrix);
                return targetBox;
            }
        }
        for (const object of objects) {
            targetBox.expandByObject(object);
        }
        return targetBox;
    }
    static computeCenter(objects, targetVec3) {
        objects = Array.isArray(objects) ? objects : [ objects ];
        ObjectUtils.computeBounds(objects, _boxCenter);
        if (_boxCenter.isEmpty()) {
            for (const object of objects) {
                object.getWorldPosition(_tempVector);
                _boxCenter.expandByPoint(_tempVector);
            }
        }
        _boxCenter.getCenter(targetVec3);
        return targetVec3;
    }
    static containsObject(objectArray, object) {
        if (object && object.uuid && Array.isArray(objectArray)) {
            for (const arrayObject of objectArray) {
                if (arrayObject.uuid && arrayObject.uuid === object.uuid) return true;
            }
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
    static copyWorldTransform(source, target, updateMatrix = true) {
        source.updateWorldMatrix(true, false);
        source.matrixWorld.decompose(target.position, _tempQuaternion, target.scale);
        Vectors.sanity(_tempQuaternion);
        target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
        target.quaternion.setFromEuler(target.rotation, false);
        if (updateMatrix) {
            target.updateMatrix();
            target.updateMatrixWorld(true );
        }
    }
    static countGeometry(objects) {
        objects = Array.isArray(objects) ? objects : [ objects ];
        let geometryCount = 0;
        for (const object of objects) {
            object.traverse((child) => {
                if (child.geometry) geometryCount++;
            });
        }
        return geometryCount;
    }
    static flattenGroup(group) {
        if (!group) return;
        if (!group.parent) return;
        while (group.children) group.parent.attach(group.children[0]);
        ObjectUtils.clearObject(group, true);
    }
    static identityBoundsCalculate(object, target) {
        target = target ?? new THREE$1.Vector3();
        _tempScale$1.copy(object.scale);
        object.scale.set(1, 1, 1);
        object.updateMatrixWorld(true );
        ONE.ObjectUtils.computeBounds(object, _tempBounds, true );
        _tempBounds.getSize(target);
        object.scale.copy(_tempScale$1);
        object.updateMatrixWorld(true );
        return target;
    }
    static resetTransform(object) {
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.quaternion.set(0, 0, 0, 1);
        object.scale.set(1, 1, 1);
        object.updateMatrix();
        object.updateMatrixWorld(true );
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

const _m1 = new THREE$1.Matrix4();
const _camPosition$2 = new THREE$1.Vector3();
const _camQuaternion$1 = new THREE$1.Quaternion();
const _camRotation$1 = new THREE$1.Euler();
const _camScale$1 = new THREE$1.Vector3();
const _lookQuaternion = new THREE$1.Quaternion();
const _lookUpVector = new THREE$1.Vector3();
const _objPosition$1 = new THREE$1.Vector3();
const _objScale$1 = new THREE$1.Vector3();
const _objQuaternion$1 = new THREE$1.Quaternion();
const _parentQuaternion = new THREE$1.Quaternion();
const _parentQuaternionInv = new THREE$1.Quaternion();
const _rotationQuaternion$1 = new THREE$1.Quaternion();
const _rotationQuaternionInv = new THREE$1.Quaternion();
const _worldPosition$1 = new THREE$1.Vector3();
const _worldQuaternion$1 = new THREE$1.Quaternion();
const _worldScale$1 = new THREE$1.Vector3();
const _worldRotation = new THREE$1.Euler();
class Entity3D extends THREE$1.Object3D {
    constructor(name = 'Entity') {
        super();
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
    componentGroup() {
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
        console.warn(`Entity3D.removeComponent: Component ${component.uuid}, type '${component.type}' not found`);
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
            _rotationQuaternion$1.setFromEuler(this.rotation, false);
            this.matrixWorld.decompose(_worldPosition$1, _worldQuaternion$1, _worldScale$1);
            camera.matrixWorld.decompose(_camPosition$2, _camQuaternion$1, _camScale$1);
            if (!this.lookAtYOnly) {
                    _lookQuaternion.copy(_camQuaternion$1);
            } else {
                _camRotation$1.set(0, Math.atan2((_camPosition$2.x - _worldPosition$1.x), (_camPosition$2.z - _worldPosition$1.z)), 0);
                _lookQuaternion.setFromEuler(_camRotation$1, false);
            }
            this.quaternion.copy(_lookQuaternion);
            this.quaternion.multiply(_rotationQuaternion$1);
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
        this.matrixWorld.decompose(_objPosition$1, targetQuaternion, _objScale$1);
        if (ignoreBillboard && beforeBillboard) {
            this.lookAtCamera = true;
            this.updateWorldMatrix(true, false);
        }
        return targetQuaternion;
    }
    safeAttach(object) {
        if (!object || !object.isObject3D) return;
        object.getWorldQuaternion(_worldQuaternion$1);
        object.getWorldScale(_worldScale$1);
        object.getWorldPosition(_worldPosition$1);
        object.removeFromParent();
        object.rotation.copy(_worldRotation.setFromQuaternion(_worldQuaternion$1, undefined, false));
        object.scale.copy(_worldScale$1);
        object.position.copy(_worldPosition$1);
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
            ObjectUtils.clearObject(this.children[0], true );
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
        this.matrixWorldInverse = new THREE$1.Matrix4();
		this.projectionMatrix = new THREE$1.Matrix4();
		this.projectionMatrixInverse = new THREE$1.Matrix4();
		this.coordinateSystem = THREE$1.WebGLCoordinateSystem;
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
        this.target = new THREE$1.Vector3();
        this.setSize(width, height);
    }
    updateMatrix() {
        const superUpdateMatrix = THREE$1.Object3D.prototype.updateMatrix.bind(this);
        superUpdateMatrix();
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

const _directional = new THREE$1.DirectionalLight();
const _point = new THREE$1.PointLight();
const _spot = new THREE$1.SpotLight();
const _loader = new THREE$1.ObjectLoader();
const _matrix$1 = new THREE$1.Matrix4();
class Light3D extends Entity3D {
    constructor({
        name,
        type = 'AmbientLight',
        color = 0xffffff,
        intensity,
        skyColor = 0x80ffff,
        groundColor = 0x806040,
        distance = 0,
        decay = 2,
        angle = Math.PI / 3,
        penumbra = 0,
    } = {}) {
        super(name ?? 'Light');
        this.castShadow = false;
        this.receiveShadow = false;
        type = Light3D.validateType(type);
        this.isLight = true;
        this.isLight3D = true;
        this.type = 'Light3D';
        this.color = new THREE$1.Color((type === 'HemisphereLight') ? skyColor : color);
        this.position.copy(THREE$1.Object3D.DEFAULT_UP);
        this.shadow = undefined;
        this.target = new THREE$1.Object3D();
        this.groundColor = new THREE$1.Color(groundColor);
        this.intensity = isNaN(intensity) ? Light3D.defaultIntensity(type) : intensity;
        this.distance = distance;
		this.decay = decay;
        this.angle = angle;
		this.penumbra = penumbra;
        this.map = null;
        this.changeType(type, false );
        this.updateMatrix();
    }
    changeType(type, returnsNewLight = true) {
        const oldType = this.type;
        type = Light3D.validateType(type);
        this.type = type;
        this.isAmbientLight = (this.type === 'AmbientLight');
        this.isDirectionalLight = (this.type === 'DirectionalLight');
        this.isHemisphereLight = (this.type === 'HemisphereLight');
        this.isPointLight = (this.type === 'PointLight');
        this.isSpotLight = (this.type === 'SpotLight');
        let oldShadow = undefined;
        switch (this.type) {
            case 'DirectionalLight':
            case 'PointLight':
            case 'SpotLight':
                oldShadow = this.shadow;
                this.castShadow = true;
                break;
            default:
                this.castShadow = false;
        }
        this.shadow = undefined;
        let light = this;
        if (returnsNewLight) {
            light = new this.constructor().copyEntity(this, true );
            light.uuid = this.uuid;
        }
        light.intensity = Light3D.mapIntensity(light.intensity, oldType, light.type);
        switch (this.type) {
            case 'DirectionalLight': light.shadow = new _directional.shadow.constructor(); break;
            case 'PointLight': light.shadow = new _point.shadow.constructor(); break;
            case 'SpotLight': light.shadow = new _spot.shadow.constructor(); break;
        }
        if (light.shadow) {
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            if (light.shadow.camera.isOthographicCamera) {
                light.shadow.camera.left = -10;
                light.shadow.camera.right = 10;
                light.shadow.camera.top = 10;
                light.shadow.camera.bottom = -10;
                light.shadow.camera.near = -500;
                light.shadow.camera.far = 500;
            }
            light.shadow.camera.updateProjectionMatrix();
        }
        if (oldShadow) {
            light.shadow.copy(oldShadow);
            ObjectUtils.clearObject(oldShadow);
        }
        return light;
    }
    static defaultIntensity(type) {
        type = Light3D.validateType(type);
        switch (type) {
            case 'AmbientLight': return 1.5;
            case 'DirectionalLight': return 1.5;
            case 'HemisphereLight': return 3.0;
            case 'PointLight': return 10;
            case 'SpotLight': return 10;
        }
    }
    static mapIntensity(intensity, oldType, newType) {
        if (isNaN(intensity)) return intensity;
        switch (oldType) {
            case 'AmbientLight':
            case 'HemisphereLight':
                if (newType === 'DirectionalLight') return intensity * 2;
                if (newType === 'PointLight' || newType === 'SpotLight') return intensity * 6.6666666;
                break;
            case 'HemisphereLight':
                if (newType === 'AmbientLight' || newType === 'HemisphereLight') return intensity / 2;
                if (newType === 'PointLight' || newType === 'SpotLight') return intensity * 3.3333333;
                break;
            case 'PointLight':
            case 'SpotLight':
                if (newType === 'AmbientLight' || newType === 'HemisphereLight') return intensity / 6.6666666;
                if (newType === 'DirectionalLight') return intensity / 3.3333333;
        }
        return intensity;
    }
    static validateType(type) {
        switch (type) {
            case 'AmbientLight':
            case 'DirectionalLight':
            case 'HemisphereLight':
            case 'PointLight':
            case 'SpotLight': return type;
            default: return 'AmbientLight';
        }
    }
    get power() {
		switch (this.type) {
            case 'PointLight': return this.intensity * 4 * Math.PI;
            case 'SpotLight': return this.intensity * Math.PI;
        }
		return this.intensity;
	}
	set power(power) {
		switch (this.type) {
            case 'PointLight': this.intensity = power / ( 4 * Math.PI ); return;
            case 'SpotLight': this.intensity = power / Math.PI; return;
        }
        this.intensity = power;
        return;
	}
    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        this.changeType(source.type, false );
        this.color.copy(source.color);
        this.intensity = source.intensity;
        if (source.target !== undefined) {
            if (this.target) ObjectUtils.clearObject(this.target);
            this.target = source.target.clone();
        }
        if (source.groundColor !== undefined) this.groundColor.copy(source.groundColor);
        if (source.distance !== undefined) this.distance = source.distance;
        if (source.decay !== undefined) this.decay = source.decay;
        if (source.angle !== undefined) this.angle = source.angle;
        if (source.penumbra !== undefined) this.penumbra = source.penumbra;
        if (source.shadow !== undefined) {
            if (this.shadow) ObjectUtils.clearObject(this.shadow);
            this.shadow = source.shadow.clone();
        }
        return this;
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        super.copyEntity(source, recursive);
        return this;
    }
    dispose() {
        if (this.shadow) ObjectUtils.clearObject(this.shadow);
        if (this.target) ObjectUtils.clearObject(this.target);
        super.dispose();
    }
    fromJSON(json) {
        const data = json.object;
        super.fromJSON(json, this);
        if (data.lightType !== undefined) {
            this.type = data.lightType;
            this.changeType(this.type, false );
        }
        if (data.color !== undefined) this.color.set(data.color);
        if (data.intensity !== undefined) this.intensity = data.intensity;
        if (data.target !== undefined) this.target.applyMatrix4(_matrix$1.fromArray(data.target));
        if (data.groundColor !== undefined) this.groundColor.set(data.groundColor);
        if (data.distance !== undefined) this.distance = data.distance;
        if (data.decay !== undefined) this.decay = data.decay;
        if (data.angle !== undefined) this.angle = data.angle;
        if (data.penumbra !== undefined) this.penumbra = data.penumbra;
        if (data.shadow !== undefined && this.shadow !== undefined) {
            if (data.shadow.bias !== undefined) this.shadow.bias = data.shadow.bias;
            if (data.shadow.normalBias !== undefined) this.shadow.normalBias = data.shadow.normalBias;
            if (data.shadow.radius !== undefined) this.shadow.radius = data.shadow.radius;
            if (data.shadow.mapSize !== undefined) this.shadow.mapSize.fromArray(data.shadow.mapSize);
            if (data.shadow.camera !== undefined) this.shadow.camera = _loader.parseObject(data.shadow.camera);
        }
        return this;
    }
    toJSON() {
        const json = super.toJSON();
        json.object.lightType = this.type;
        json.object.type = 'Light3D';
        json.object.color = this.color.getHex();
        json.object.intensity = this.intensity;
        if (this.target !== undefined) json.object.target = this.target.matrix.toArray();
        if (this.groundColor !== undefined) json.object.groundColor = this.groundColor.getHex();
        if (this.distance !== undefined) json.object.distance = this.distance;
        if (this.decay !== undefined) json.object.decay = this.decay;
        if (this.angle !== undefined) json.object.angle = this.angle;
        if (this.penumbra !== undefined) json.object.penumbra = this.penumbra;
        if (this.shadow !== undefined) json.object.shadow = this.shadow.toJSON();
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
        this.beginPosition = new THREE$1.Matrix4().setPosition(-2, 0, 0);
        this.endPosition = new THREE$1.Matrix4().setPosition(2, 0, 0);
    }
    componentGroup() {
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
        this.loadPosition = new THREE$1.Matrix4();
        this.loadDistance = 0;
        this.shadowPlane = new THREE$1.Mesh(
            new THREE$1.PlaneGeometry(100000, 100000),
            new THREE$1.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
        );
        this.shadowPlane.name = 'Shadow Plane';
        this.shadowPlane.userData.flagIgnore = true;
        this.shadowPlane.rotation.x = - Math.PI / 2;
        this.shadowPlane.castShadow = false;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.visible = false;
        this.add(this.shadowPlane);
    }
    componentGroup() {
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
        if (this.shadowPlane) ObjectUtils.clearObject(this.shadowPlane);
    }
    fromJSON(json) {
        const data = json.object;
        super.fromJSON(json);
        if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
                this.background = new THREE$1.Color(data.background);
            } else {
                this.background = data.background;
            }
        }
        if (data.environment !== undefined) {
            const environmentTexture = AssetManager.getAsset(data.background);
            if (environmentTexture && environmentTexture.isTexture) this.environment = environmentTexture;
        }
        if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
                this.fog = new THREE$1.Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
                this.fog = new THREE$1.FogExp2(data.fog.color, data.fog.density);
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
            if (g || b) console.warn(`Iris: Passed some valid arguments, however 'r' was ${r}`);
        } else if (g === undefined && b === undefined) {
            let value = r;
            if (typeof value === 'number' || value === 0) { return this.setHex(value);
            } else if (value && isRGB(value)) { return this.setRGBF(value.r, value.g, value.b);
            } else if (value && isHSL(value)) { return this.setHSL(value.h * 360, value.s, value.l);
            } else if (value && isRYB(value)) { return this.setRYB(value.r * 255, value.y * 255, value.b * 255);
            } else if (Array.isArray(value) && value.length > 2) {
                let offset = (g != null && ! Number.isNaN(g) && g > 0) ? g : 0;
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
        const hex = COLOR_KEYWORDS[ style.toLowerCase() ];
        if (hex) return this.setHex(hex);
        console.warn(`Iris: Unknown color ${style}`);
        return this;
    }
    setHex(hexColor) {
        hexColor = Math.floor(hexColor);
        if (hexColor > 0xffffff || hexColor < 0) {
            console.warn(`Iris: Given decimal outside of range, value was ${hexColor}`);
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
        _temp$1.set(inputColorData);
        return '#' + ('000000' + ((_temp$1.hex()) >>> 0).toString(16)).slice(-6);
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
        if (! color.isColor) console.warn(`Iris: add() was not called with a 'Color' object`);
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
        if (! color.isColor) console.warn(`Iris: mix() was not called with a 'Color' object`);
        percent = clamp(percent, 0, 1);
        const r = (this.r * (1.0 - percent)) + (percent * color.r);
        const g = (this.g * (1.0 - percent)) + (percent * color.g);
        const b = (this.b * (1.0 - percent)) + (percent * color.b);
        return this.setRGBF(r, g, b);
    }
    multiply(color) {
        if (! color.isColor) console.warn(`Iris: multiply() was not called with a 'Color' object`);
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
        if (! color.isColor) console.warn(`Iris: subtract() was not called with a 'Color' object`);
        return this.setRGBF(this.r - color.r, this.g - color.g, this.b - color.b);
    }
    equals(color) {
        if (! color.isColor) console.warn(`Iris: equals() was not called with a 'Color' object`);
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
        return (! this.isDark());
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
        default: console.warn(`Iris: Unknown channel (${channel}) requested in hsl()`);
    }
    return 0;
}
const _interpolate = new Iris();
const _mix1 = new Iris();
const _mix2 = new Iris();
const _random = new Iris();
const _temp$1 = new Iris();
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

class Script$1 {
    constructor(format = SCRIPT_FORMAT.JAVASCRIPT, variables = false) {
        this.isScript = true;
        this.type = 'Script';
        this.name ='New Script';
        this.uuid = Maths.uuid();
        this.format = format;
        this.category = null;
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
}
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

const _assets = {};
const _textureCache = {};
const _textureLoader = new THREE$1.TextureLoader();
const _types = {
    'Camera3D': Camera3D,
    'Entity3D': Entity3D,
    'Light3D': Light3D,
    'Stage3D': Stage3D,
    'World3D': World3D,
};
class AssetManager$1 {
    static clear() {
        for (const uuid in _assets) {
            const asset = _assets[uuid];
            if (asset.isBuiltIn) continue;
            AssetManager$1.removeAsset(_assets[uuid], true);
        }
    }
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
    static addAsset(asset) {
        const assets = Array.isArray(asset) ? asset : [...arguments];
        let returnAsset = undefined;
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i];
            if (!asset || !asset.uuid) continue;
            const type = AssetManager$1.checkType(asset);
            if (type === undefined) continue;
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;
            if (type === 'geometry' && asset.constructor.name !== 'BufferGeometry') {
                const bufferGeometry = mergeGeometries([ asset ]);
                bufferGeometry.name = asset.name;
                bufferGeometry.uuid = asset.uuid;
                if (typeof asset.dispose === 'function') asset.dispose();
                asset = bufferGeometry;
            }
            if (asset.isEntity) {
                asset.isPrefab = true;
            }
            if (type === 'script' || type === 'prefab') {
                if (!asset.category || asset.category === '') asset.category = 'unknown';
            }
            _assets[asset.uuid] = asset;
            if (returnAsset === undefined) returnAsset = asset;
        }
        return returnAsset;
    }
    static getAsset(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }
    static getLibrary(type, category) {
        const library = [];
        for (const [uuid, asset] of Object.entries(_assets)) {
            if (type && AssetManager$1.checkType(asset) !== type) continue;
            if (category == undefined || (asset.category && asset.category === category)) {
                library.push(asset);
            }
        }
        return library;
    }
    static removeAsset(asset, dispose = true) {
        const assets = Array.isArray(asset) ? asset : [ asset ];
        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;
            if (_assets[asset.uuid]) {
                if (asset.isTexture) {
                    for (const url in _textureCache) {
                        if (_textureCache[url].uuid === asset.uuid) delete _textureCache[url];
                    }
                }
                if (dispose && typeof asset.dispose === 'function') asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }
    static loadTexture(url, onLoad = undefined) {
        if (!url || url === '') return null;
        const resolvedUrl = THREE$1.DefaultLoadingManager.resolveURL(url);
        if (_textureCache[resolvedUrl]) {
            console.log(`AssetManager.loadTexture: Duplicate image!`);
            return _textureCache[resolvedUrl];
        }
        const texture = _textureLoader.load(url, onTextureLoaded, onTextureLoadError);
        _textureCache[resolvedUrl] = texture;
        function onTextureLoaded(newTexture) {
            newTexture.name = Strings.nameFromUrl(newTexture.image.src);
            newTexture.premultiplyAlpha = true;
            newTexture.wrapS = THREE$1.RepeatWrapping;
            newTexture.wrapT = THREE$1.RepeatWrapping;
            newTexture.needsUpdate = true;
            if (onLoad && typeof onLoad === 'function') onLoad(newTexture);
            AssetManager$1.addAsset(newTexture);
            if (window.signals && signals.assetChanged) signals.assetChanged.dispatch('texture', newTexture);
        }
        function onTextureLoadError() {
            if (_textureCache[resolvedUrl] && _textureCache[resolvedUrl].isTexture) {
                _textureCache[resolvedUrl].dispose();
            }
            delete _textureCache[resolvedUrl];
        }
        return texture;
    }
    static fromJSON(json, onLoad = () => {}) {
        AssetManager$1.clear();
        function addLibraryToAssets(library) {
            for (const [uuid, asset] of Object.entries(library)) {
                AssetManager$1.addAsset(asset);
            }
        }
        const palettes = {};
        if (json.palettes) {
            for (const paletteData of json.palettes) {
                const palette = new Palette().fromJSON(paletteData);
                palettes[palette.uuid] = palette;
            }
            addLibraryToAssets(palettes);
        }
        const prefabs = {};
        if (json.prefabs) {
            for (const prefabData of json.prefabs) {
                const Constructor = _types[prefabData.object.type];
                const prefab = new Constructor();
                prefab.fromJSON(prefabData);
                prefabs[prefab.uuid] = prefab;
            }
            addLibraryToAssets(prefabs);
        }
        const scripts = {};
        if (json.scripts) {
            for (const scriptData of json.scripts) {
                const script = new Script$1().fromJSON(scriptData);
                scripts[script.uuid] = script;
            }
            addLibraryToAssets(scripts);
        }
        const manager = new THREE$1.LoadingManager(onLoad);
        const objectLoader = new THREE$1.ObjectLoader(manager);
        const animations = objectLoader.parseAnimations(json.animations);
        const shapes = objectLoader.parseShapes(json.shapes);
        const geometries = objectLoader.parseGeometries(json.geometries, {});
        const images = objectLoader.parseImages(json.images);
        const textures = objectLoader.parseTextures(json.textures, images);
        const materials = objectLoader.parseMaterials(json.materials, textures);
        addLibraryToAssets(animations);
        addLibraryToAssets(shapes);
        addLibraryToAssets(geometries);
        addLibraryToAssets(images);
        addLibraryToAssets(textures);
        addLibraryToAssets(materials);
    }
    static toJSON(meta) {
        const json = {};
        if (!meta) meta = {};
        if (!meta.palettes) meta.palettes = {};
        if (!meta.prefabs) meta.prefabs = {};
        if (!meta.scripts) meta.scripts = {};
        if (!meta.shapes) meta.shapes = {};
        if (!meta.geometries) meta.geometries = {};
        if (!meta.images) meta.images = {};
        if (!meta.textures) meta.textures = {};
        if (!meta.materials) meta.materials = {};
        if (!meta.animations) meta.animations = {};
        if (!meta.skeletons) meta.skeletons = {};
        const stopRoot = {
            images: {},
            textures: {},
            materials: {},
        };
        const palettes = AssetManager$1.getLibrary('palette');
        for (const palette of palettes) {
            if (!palette.uuid || meta.palettes[palette.uuid]) continue;
            meta.palettes[palette.uuid] = palette.toJSON();
        }
        const prefabs = AssetManager$1.getLibrary('prefab');
        for (const prefab of prefabs) {
            if (!prefab.uuid || meta.prefabs[prefab.uuid]) continue;
            if (prefab.isBuiltIn) continue;
            meta.prefabs[prefab.uuid] = prefab.toJSON();
        }
        const scripts = AssetManager$1.getLibrary('script');
        for (const script of scripts) {
            if (!script.uuid || meta.scripts[script.uuid]) continue;
            meta.scripts[script.uuid] = script.toJSON();
        }
        const geometries = AssetManager$1.getLibrary('geometry');
        for (const geometry of geometries) {
            if (!geometry.uuid || meta.geometries[geometry.uuid]) continue;
            meta.geometries[geometry.uuid] = geometry.toJSON(meta);
        }
        const materials = AssetManager$1.getLibrary('material');
        for (const material of materials) {
            if (!material.uuid || meta.materials[material.uuid]) continue;
            meta.materials[material.uuid] = material.toJSON(stopRoot);
        }
        const shapes = AssetManager$1.getLibrary('shape');
        for (const shape of shapes) {
            if (!shape.uuid || meta.shapes[shape.uuid]) continue;
            meta.shapes[shape.uuid] = shape.toJSON(stopRoot);
        }
        const textures = AssetManager$1.getLibrary('texture');
        for (const texture of textures) {
            if (!texture.uuid || meta.textures[texture.uuid]) continue
            meta.textures[texture.uuid] = texture.toJSON(meta);
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
}

const _camPosition$1 = new THREE$1.Vector3();
const _camQuaternion = new THREE$1.Quaternion();
const _camScale = new THREE$1.Vector3();
const _rotationQuaternion = new THREE$1.Quaternion();
const _raycaster$1 = new THREE$1.Raycaster();
class CameraUtils {
    static fitCameraToObject(camera, object, controls = null, offset = 1.25, tilt = false) {
        const boundingBox = new THREE$1.Box3();
        boundingBox.setFromObject(object);
        const center = boundingBox.getCenter(new THREE$1.Vector3());
        const size = boundingBox.getSize(new THREE$1.Vector3());
        const fitDepthDistance = size.z / (2.0 * Math.atan(Math.PI * camera.fov / 360));
        const fitHeightDistance = Math.max(fitDepthDistance, size.y / (2.0 * Math.atan(Math.PI * camera.fov / 360)));
        const fitWidthDistance = (size.x / (2.5 * Math.atan(Math.PI * camera.fov / 360))) / camera.aspect;
        const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);
        camera.near = distance / 100;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();
        camera.position.copy(center);
        if (tilt) {
            camera.position.x += distance / 6;
            camera.position.y += distance / 6;
        }
        camera.position.z += distance;
        camera.lookAt(center);
        if (controls) {
            controls.maxDistance = distance * 10;
            controls.target.copy(center);
            controls.update();
        }
    }
    static screenPoint(pointInWorld, camera) {
        if (!camera || !camera.isCamera) {
            console.warn(`CameraUtils.screenPoint: No camera provided!`);
            return new THREE$1.Vector3();
        }
        return new THREE$1.Vector3.copy(pointInWorld).project(camera);
    }
    static worldPoint(pointOnScreen, camera, lookTarget = new THREE$1.Vector3(), facingPlane = 'none') {
        if (!camera || !camera.isCamera) {
            console.warn(`CameraUtils.worldPoint: No camera provided!`);
            return false;
        }
        facingPlane = (typeof facingPlane === 'string') ? facingPlane.toLowerCase() : 'none';
        const planeGeometry = new THREE$1.PlaneGeometry(100000000, 100000000, 2, 2);
        switch (facingPlane) {
            case 'xy': break;
            case 'yz': planeGeometry.rotateY(Math.PI / 2); break;
            case 'xz': planeGeometry.rotateX(Math.PI / 2); break;
            default:
                camera.matrixWorld.decompose(_camPosition$1, _camQuaternion, _camScale);
                planeGeometry.applyQuaternion(_camQuaternion);
        }
        planeGeometry.translate(lookTarget.x, lookTarget.y, lookTarget.z);
        const planeMaterial = new THREE$1.MeshBasicMaterial({ side: THREE$1.DoubleSide });
        const plane = new THREE$1.Mesh(planeGeometry, planeMaterial);
        _raycaster$1.setFromCamera(pointOnScreen, camera);
        if (camera.isOrthographicCamera) {
            _raycaster$1.ray.origin.set(pointOnScreen.x, pointOnScreen.y, - camera.far).unproject(camera);
        }
        const planeIntersects = _raycaster$1.intersectObject(plane, true);
        planeGeometry.dispose();
        planeMaterial.dispose();
        return (planeIntersects.length > 0) ? planeIntersects[0].point.clone() : false;
    }
}

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
    static containsMesh(entity, recursive = true) {
        if (!entity || !entity.isEntity) {
            console.warn(`EntityUtils.containsMesh: Object was not an Entity!`);
            return false;
        }
        let hasMesh = false;
        entity.traverseEntities((child) => {
            if (hasMesh) return true;
            let hasGeometry = false;
            let hasMaterial = false;
            child.traverseComponents((component) => {
                const object = component.backend;
                if (object) {
                    hasGeometry = hasGeometry || (component.type === 'geometry' && object.isBufferGeometry);
                    hasMaterial = hasMaterial || (component.type === 'material' && object.isMaterial);
                    hasMesh = hasMesh || (component.type === 'mesh' && object.isMesh);
                }
            });
            hasMesh = hasMesh || (hasGeometry && hasMaterial);
        }, recursive);
        return hasMesh;
    }
    static findCamera(entity) {
        if (!entity || !entity.isEntity) return undefined;
        let camera = undefined;
        entity.traverseEntities((child) => {
            if (camera) return true;
            if (child.isCamera) {
                camera = child;
                return true;
            }
        });
        return camera;
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
            console.error(`Project.addWorld: World type (${world.type}) not a valid world type`, world);
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
        const activeWorld = editor.viewport.world;
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
            console.error(`Project.fromJSON: Unknown project type ('${metaType}'), expected 'Salinity'`);
            return;
        }
        const metaVersion = json.metadata.version;
        if (metaVersion !== VERSION) {
            console.warn(`Project.fromJSON: Project saved in 'v${metaVersion}', attempting to load with 'v${VERSION}'`);
        }
        if (!json.object || json.object.type !== this.type) {
            console.error(`Project.fromJSON: Save file corrupt, no 'Project' object found!`);
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

class Renderer3D extends THREE$1.WebGLRenderer {
    constructor(parameters = {}) {
        super(parameters);
        const threeRender = this.render.bind(this);
        this.render = function(scene, camera) {
            window.activeCamera = camera;
            threeRender(scene, camera);
        };
    }
}

const OpaqueShader = {
    name: 'OpaqueShader',
    uniforms: {
        'tDiffuse': { value: null },
        'opacity': { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            gl_FragColor = vec4(texel.rgb, 1.0);
        }`
};

const scriptFunctions = APP_EVENTS.toString();
const scriptReturnObject = {};
for (const event of APP_EVENTS) scriptReturnObject[event] = event;
const scriptParameters = 'app,' + scriptFunctions;
const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');
const _invQuaternion = new THREE$1.Quaternion();
const _tempRotation = new THREE$1.Quaternion();
const _beginPosition = new THREE$1.Vector3();
const _beginScale = new THREE$1.Vector3(1, 1, 1);
const _beginQuaternion = new THREE$1.Quaternion();
const _endPosition = new THREE$1.Vector3();
const _endScale = new THREE$1.Vector3(1, 1, 1);
const _endQuaternion = new THREE$1.Quaternion();
const _worldPosition = new THREE$1.Vector3();
const _worldScale = new THREE$1.Vector3(1, 1, 1);
const _worldQuaternion = new THREE$1.Quaternion();
const _composers = {};
class SceneManager {
    static app = undefined;
    static findCamera(entity) {
        let camera;
        camera = EntityUtils.findCamera(entity);
        if (camera) return camera;
        camera = new Camera3D({ width: 1000, height: 1000 });
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        return camera;
    }
    static cloneChildren(toEntity, fromEntity) {
        for (const entity of fromEntity.getEntities()) {
            const clone = entity.cloneEntity(false );
            SceneManager.loadScriptsFromComponents(clone, entity);
            if (!entity.isStage) SceneManager.cloneChildren(clone, entity);
            if (clone.bloom) {
                clone.traverse((child) => {
                    child.layers.disable(LAYERS.BASE);
                    child.layers.enable(LAYERS.BLOOM);
                });
            }
            if (fromEntity.isStage) {
                fromEntity.beginPosition.decompose(_beginPosition, _beginQuaternion, _beginScale);
                clone.position.sub(_beginPosition);
                clone.position.applyQuaternion(_invQuaternion.copy(_beginQuaternion).invert());
                clone.position.multiply(_beginScale);
                clone.position.multiply(_worldScale);
                clone.rotation.setFromQuaternion(_tempRotation.setFromEuler(clone.rotation).premultiply(_beginQuaternion));
                clone.scale.multiply(_beginScale);
                if (toEntity.isWorld) {
                    const loadedDistance = toEntity.loadDistance + Math.abs(clone.position.length());
                    clone.traverse((child) => { child.userData.loadedDistance = loadedDistance; });
                }
                clone.scale.multiply(_worldScale);
                clone.rotation.setFromQuaternion(_tempRotation.setFromEuler(clone.rotation).premultiply(_worldQuaternion));
                clone.position.applyQuaternion(_worldQuaternion);
                clone.position.add(_worldPosition);
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
            const script = AssetManager$1.getAsset(scriptUUID);
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
        toScene.loadPosition.decompose(_worldPosition, _worldQuaternion, _worldScale);
        SceneManager.cloneChildren(toScene, fromStage);
        if (updateLoadPosition) {
            fromStage.beginPosition.decompose(_beginPosition, _beginQuaternion, _beginScale);
            fromStage.endPosition.decompose(_endPosition, _endQuaternion, _endScale);
            _endPosition.sub(_beginPosition);
            _endPosition.applyQuaternion(_invQuaternion.copy(_beginQuaternion).invert());
            _endPosition.multiply(_beginScale);
            _endPosition.multiply(_worldScale);
            _endPosition.applyQuaternion(_worldQuaternion);
            _endQuaternion.premultiply(_beginQuaternion);
            _endScale.multiply(_beginScale);
            _worldScale.multiply(_endScale);
            _worldQuaternion.premultiply(_endQuaternion);
            _worldPosition.add(_endPosition);
            toScene.loadPosition.compose(_worldPosition, _worldQuaternion, _worldScale);
            toScene.loadDistance += Math.abs(_endPosition.length());
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
                const texture = AssetManager$1.getAsset(fromWorld.background);
                if (texture && texture.isTexture) toScene.background = texture.clone();
            }
        }
		if (fromWorld.environment != null) toScene.environment = fromWorld.environment.clone();
		if (fromWorld.fog != null) toScene.fog = fromWorld.fog.clone();
		toScene.backgroundBlurriness = fromWorld.backgroundBlurriness;
		toScene.backgroundIntensity = fromWorld.backgroundIntensity;
		if (fromWorld.overrideMaterial != null) toScene.overrideMaterial = fromWorld.overrideMaterial.clone();
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
        if (!_composers[world.uuid]) {
            const composer = new EffectComposer(SceneManager.app.renderer);
            composer.renderToScreen = true;
            const clearPass = new ClearPass(new THREE$1.Color(0x000000), 0.0);
            composer.addPass(clearPass);
            const renderPass = new RenderPass(SceneManager.app.scene, SceneManager.app.camera);
            renderPass.clear = false;
            composer.addPass(renderPass);
            const components = world.getComponentsWithProperties('type', 'post');
            for (const component of components) {
                const pass = component.backend;
                if (pass) {
                    pass.scene = SceneManager.app.scene;
                    pass.camera = SceneManager.app.camera;
                    composer.addPass(pass);
                }
            }
            const copyPass = new ShaderPass(OpaqueShader);
            composer.addPass(copyPass);
            _composers[world.uuid] = composer;
        }
        const composer = _composers[world.uuid];
        if (composer) composer.render();
    }
    static setCamera(world, camera) {
        SceneManager.app.camera = camera;
        const components = world.getComponentsWithProperties('type', 'post');
        for (const component of components) {
            const pass = component.backend;
            if (pass) {
                pass.camera = camera;
            }
        }
    }
    static setSize(width, height) {
        const fit = SceneManager.app?.project?.settings?.orientation;
        const ratio = APP_SIZE / ((fit === 'portrait') ? height : width);
        const fixedWidth = width * ratio;
        const fixedHeight = height * ratio;
        for (const uuid in _composers) {
            const composer = _composers[uuid];
            composer.setSize(width, height);
            for (const pass of composer.passes) {
                if (typeof pass.setFixedSize === 'function') pass.setFixedSize(fixedWidth, fixedHeight);
            }
        }
    }
    static dispose() {
        for (const uuid in _composers) {
            const composer = _composers[uuid];
            if (composer) {
                for (const pass of composer.passes) {
                    if (typeof pass.dispose === 'function') pass.dispose();
                }
                if (typeof composer.dispose === 'function') composer.dispose();
            }
            delete _composers[uuid];
        }
    }
}

const _position$2 = new THREE$1.Vector3();
const _raycaster = new THREE$1.Raycaster();
let _animationID = null;
class App {
    constructor() {
        this.project = new Project();
        this.renderer = new Renderer3D({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.dom = document.createElement('div');
        this.dom.appendChild(this.renderer.domElement);
        this.events = {};
        this.world = null;
        this.scene = null;
        this.camera = new Camera3D();
        this.gameClock = new Clock(false );
        this.keys = {};
        this.pointer = new THREE$1.Vector2();
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
        this.camera = SceneManager.findCamera(this.scene);
        this.camera.changeFit(this.project.setting('orientation'));
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
                if (this.scene && this.scene.isWorld3D) {
                    const preload = this.project.setting('preload');
                    const unload = this.project.setting('unload');
                    _position$2.set(0, 0, 0).applyMatrix4(this.scene.loadPosition);
                    const distanceFromEnd = this.camera.target.distanceTo(_position$2);
                    const playerDistance = this.scene.loadDistance - distanceFromEnd;
                    if (preload >= 0 && distanceFromEnd < preload) {
                        SceneManager.loadStages(this.scene, this.world, Math.max(preload - distanceFromEnd, 0.01));
                    } else if (unload >= 0) {
                        for (const child of this.scene.children) {
                            if (isNaN(child.userData.loadedDistance)) continue;
                            if (playerDistance < child.userData.loadedDistance) continue;
                            if (this.camera.target.distanceTo(child.position) < unload) continue;
                            SceneManager.removeEntity(this.scene, child);
                        }
                    }
                }
            }
        }
        SceneManager.renderWorld(this.world);
        if (this.isPlaying) _animationID = requestAnimationFrame(function() { this.animate(); }.bind(this));
    }
    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this._onKeyDown = onKeyDown.bind(this);
        this._onKeyUp = onKeyUp.bind(this);
        this._onPointerDown = onPointerDown.bind(this);
        this._onPointerUp = onPointerUp.bind(this);
        this._onPointerMove = onPointerMove.bind(this);
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('pointerdown', this._onPointerDown);
        document.addEventListener('pointerup', this._onPointerUp);
        document.addEventListener('pointermove', this._onPointerMove);
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
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('pointerdown', this._onPointerDown);
        document.removeEventListener('pointerup', this._onPointerUp);
        document.removeEventListener('pointermove', this._onPointerMove);
        cancelAnimationFrame(_animationID);
        _animationID = null;
        if (this.renderer) this.renderer.clear();
        this.gameClock.stop();
        SceneManager.dispose();
        ObjectUtils.clearObject(this.camera);
        ObjectUtils.clearObject(this.scene);
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
        const worldPoint = CameraUtils.worldPoint(
            { x: this.pointer.x, y: this.pointer.y }, this.camera, this.camera.target, 'none');
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
function onKeyDown(event) {
    if (this.isPlaying) {
        this.keys[event.key] = true;
        this.dispatch('keydown', event);
    }
}
function onKeyUp(event) {
    if (this.isPlaying) {
        this.keys[event.key] = false;
        this.dispatch('keyup', event);
    }
}
function onPointerDown(event) {
    if (this.isPlaying) {
        this.updatePointer(event);
        _raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = _raycaster.intersectObjects(this.scene.children, true);
        event.entity = undefined;
        for (let i = 0; i < intersects.length; i++) {
            event.entity = EntityUtils.parentEntity(intersects[i].object);
            if (event.entity && event.entity.isEntity) break;
        }
        this.dispatch('pointerdown', event);
    }
}
function onPointerUp(event) {
    if (this.isPlaying) {
        this.dispatch('pointerup', event);
    }
}
function onPointerMove(event) {
    if (this.isPlaying) {
        this.dispatch('pointermove', event);
    }
}

class EntityPool {
    constructor() {
        this.entities = [];
        this.expand();
    }
    getEntities(n) {
        if (n > this.entities.length) this.expand(n - this.entities.length);
        return this.entities.splice(0, n);
    }
    getEntity() {
        if (!this.entities.length) this.expand();
        return this.entities.pop();
    }
    recycle(entity) {
        entity.dispose();
        this.entities.push(entity);
    }
    expand(n = 10) {
        for (let i = 0; i < n; i++) {
            this.entities.push(new Entity3D());
        }
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
    controls = new ONE.OrbitControls(app.camera, app.renderer.domElement, this);
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

const _uv = [ new THREE$1.Vector2(), new THREE$1.Vector2(), new THREE$1.Vector2() ];
const _vertex = [ new THREE$1.Vector3(), new THREE$1.Vector3(), new THREE$1.Vector3() ];
const _temp = new THREE$1.Vector3();
class GeometryUtils {
    static addAttribute(geometry, attributeName = 'color', stride = 3, fill = 0) {
        if (!geometry.getAttribute(attributeName)) {
            let array = new Float32Array(geometry.attributes.position.count * stride).fill(fill);
            const attribute = new THREE$1.BufferAttribute(array, stride, true).setUsage(THREE$1.DynamicDrawUsage);
            geometry.setAttribute(attributeName, attribute);
        }
        return geometry;
    }
    static coloredMesh(mesh) {
        if (!mesh.geometry) return mesh;
        if (!mesh.material) return mesh;
        let material = mesh.material;
        if (Array.isArray(material) !== true) material = [ mesh.material ];
        for (let i = 0; i < material.length; i++) {
            if (material[i].vertexColors !== true) {
                material[i].vertexColors = true;
                material[i].needsUpdate = true;
            }
        }
        GeometryUtils.addAttribute(mesh.geometry, 'color', 3, 1.0);
        return mesh;
    }
    static modelSize(geometry, type = 'max') {
        let boxSize = new THREE$1.Vector3();
        geometry.computeBoundingBox();
        geometry.boundingBox.getSize(boxSize);
        if (type === 'max') {
            return Math.max(boxSize.x, boxSize.y, boxSize.z);
        } else  {
            return Math.min(boxSize.x, boxSize.y, boxSize.z);
        }
    }
    static repeatTexture(geometry, s, t) {
        if (!geometry) return;
        if (geometry.attributes && geometry.attributes.uv && geometry.attributes.uv.array) {
            for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
                geometry.attributes.uv.array[i + 0] *= s;
                geometry.attributes.uv.array[i + 1] *= t;
            }
            geometry.attributes.uv.needsUpdate = true;
        }
    }
    static uvFlip(geometry, x = true, y = true) {
        if (!geometry || !geometry.isBufferGeometry) return;
        if (geometry.attributes.uv === undefined) return;
        for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
            let u = geometry.attributes.uv.array[i + 0];
            let v = geometry.attributes.uv.array[i + 1];
            if (x) u = 1.0 - u;
            if (y) v = 1.0 - v;
            geometry.attributes.uv.array[i + 0] = u;
            geometry.attributes.uv.array[i + 1] = v;
        }
    }
    static uvMapCube(geometry, transformMatrix, frontFaceOnly = false) {
        if (frontFaceOnly) {
            if (geometry.index !== null) {
                const nonIndexed = geometry.toNonIndexed();
                geometry.dispose();
                geometry = nonIndexed;
            }
        }
        if (transformMatrix === undefined) transformMatrix = new THREE$1.Matrix4();
        const geometrySize = GeometryUtils.modelSize(geometry);
        const size = (geometrySize / 2);
        const bbox = new THREE$1.Box3(new THREE$1.Vector3(-size, -size, -size), new THREE$1.Vector3(size, size, size));
        const boxCenter = new THREE$1.Vector3();
        geometry.boundingBox.getCenter(boxCenter);
        const centerMatrix = new THREE$1.Matrix4().makeTranslation(-boxCenter.x, -boxCenter.y, -boxCenter.z);
        const coords = [];
        coords.length = 2 * geometry.attributes.position.array.length / 3;
        const pos = geometry.attributes.position.array;
        if (geometry.index) {
            for (let vi = 0; vi < geometry.index.array.length; vi += 3) {
                const idx0 = geometry.index.array[vi + 0];
                const idx1 = geometry.index.array[vi + 1];
                const idx2 = geometry.index.array[vi + 2];
                const v0 = new THREE$1.Vector3(pos[(3 * idx0) + 0], pos[(3 * idx0) + 1], pos[(3 * idx0) + 2]);
                const v1 = new THREE$1.Vector3(pos[(3 * idx1) + 0], pos[(3 * idx1) + 1], pos[(3 * idx1) + 2]);
                const v2 = new THREE$1.Vector3(pos[(3 * idx2) + 0], pos[(3 * idx2) + 1], pos[(3 * idx2) + 2]);
                calculateUVs(v0, v1, v2);
                coords[2 * idx0 + 0] = _uv[0].x;
                coords[2 * idx0 + 1] = _uv[0].y;
                coords[2 * idx1 + 0] = _uv[1].x;
                coords[2 * idx1 + 1] = _uv[1].y;
                coords[2 * idx2 + 0] = _uv[2].x;
                coords[2 * idx2 + 1] = _uv[2].y;
            }
        } else {
            for (let vi = 0; vi < geometry.attributes.position.array.length; vi += 9) {
                const v0 = new THREE$1.Vector3(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
                const v1 = new THREE$1.Vector3(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
                const v2 = new THREE$1.Vector3(pos[vi + 6], pos[vi + 7], pos[vi + 8]);
                calculateUVs(v0, v1, v2);
                const idx0 = vi / 3;
                const idx1 = idx0 + 1;
                const idx2 = idx0 + 2;
                coords[2 * idx0 + 0] = _uv[0].x;
                coords[2 * idx0 + 1] = _uv[0].y;
                coords[2 * idx1 + 0] = _uv[1].x;
                coords[2 * idx1 + 1] = _uv[1].y;
                coords[2 * idx2 + 0] = _uv[2].x;
                coords[2 * idx2 + 1] = _uv[2].y;
            }
        }
        if (geometry.attributes.uv === undefined) {
            geometry.addAttribute('uv', new THREE$1.Float32BufferAttribute(coords, 2));
        }
        geometry.attributes.uv.array = new Float32Array(coords);
        geometry.attributes.uv.needsUpdate = true;
        return geometry;
        function calcNormal(target, vec1, vec2, vec3) {
            _temp.subVectors(vec1, vec2);
            target.subVectors(vec2, vec3);
            target.cross(_temp).normalize();
            Vectors.round(target, 5);
        }
        function calculateUVs(v0, v1, v2) {
            v0.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
            v1.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
            v2.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
            const n = new THREE$1.Vector3();
            calcNormal(n, v0, v1, v2);
            _uv[0].set(0, 0, 0);
            _uv[1].set(0, 0, 0);
            _uv[2].set(0, 0, 0);
            if (frontFaceOnly) {
                let frontFace = (n.z < 0);
                frontFace = frontFace && (Math.abs(n.y) < 0.866);
                frontFace = frontFace && (Math.abs(n.x) < 0.866);
                if (frontFace) {
                    _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                    _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                    _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                }
            } else {
                n.x = Math.abs(n.x);
                n.y = Math.abs(n.y);
                n.z = Math.abs(n.z);
                if (n.y > n.x && n.y > n.z) {
                    _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (bbox.max.z - v0.z) / geometrySize;
                    _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (bbox.max.z - v1.z) / geometrySize;
                    _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (bbox.max.z - v2.z) / geometrySize;
                } else if (n.x > n.y && n.x > n.z) {
                    _uv[0].x = (v0.z - bbox.min.z) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                    _uv[1].x = (v1.z - bbox.min.z) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                    _uv[2].x = (v2.z - bbox.min.z) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                } else if (n.z > n.y && n.z > n.x) {
                    _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                    _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                    _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                }
            }
        }
    }
    static uvMapSphere(geometry, setCoords = 'uv') {
        if (geometry.index !== null) {
            const nonIndexed = geometry.toNonIndexed();
            nonIndexed.uuid = geometry.uuid;
            nonIndexed.name = geometry.name;
            geometry.dispose();
            geometry = nonIndexed;
        }
        const coords = [];
        coords.length = 2 * geometry.attributes.position.array.length / 3;
        const hasUV = !(geometry.attributes.uv === undefined);
        if (!hasUV) geometry.addAttribute('uv', new THREE$1.Float32BufferAttribute(coords, 2));
        const setU = (!hasUV || setCoords === 'u' || setCoords === 'uv');
        const setV = (!hasUV || setCoords === 'v' || setCoords === 'uv');
        const pos = geometry.attributes.position.array;
        for (let vi = 0; vi < geometry.attributes.position.array.length; vi += 9) {
            _vertex[0].set(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
            _vertex[1].set(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
            _vertex[2].set(pos[vi + 6], pos[vi + 7], pos[vi + 8]);
            let index = vi / 3;
            for (let i = 0; i < 3; i++) {
                const polar = cartesian2polar(_vertex[i]);
                if (polar.theta === 0 && (polar.phi === 0 || polar.phi === Math.PI)) {
                    const alignedVertex = (polar.phi === 0) ? '1' : '0';
                    polar.theta = cartesian2polar(_vertex[alignedVertex]).theta;
                }
                setUV(polar, index, i);
                index++;
            }
            let overwrap = false;
            if (Math.abs(_uv[0].x - _uv[1].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[0].x - _uv[2].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[1].x - _uv[0].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[1].x - _uv[2].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[2].x - _uv[0].x) > 0.75) overwrap = true;
            if (Math.abs(_uv[2].x - _uv[1].x) > 0.75) overwrap = true;
            if (overwrap) {
                let index = vi / 3;
                for (let i = 0; i < 3; i++) {
                    const x = coords[2 * index];
                    if (x > 0.75) coords[2 * index] = 0;
                    index++;
                }
            }
        }
        geometry.attributes.uv.array = new Float32Array(coords);
        geometry.attributes.uv.needsUpdate = true;
        return geometry;
        function setUV(polarVertex, index, i) {
            const canvasPoint = polar2canvas(polarVertex);
            const uv = new THREE$1.Vector2(1 - canvasPoint.x, 1 - canvasPoint.y);
            const indexU = 2 * index + 0;
            const indexV = 2 * index + 1;
            coords[indexU] = (setU) ? uv.x : geometry.attributes.uv.array[indexU];
            coords[indexV] = (setV) ? uv.y : geometry.attributes.uv.array[indexV];
            _uv[i].x = coords[indexU];
            _uv[i].y = coords[indexV];
        }
        function cartesian2polar(position) {
            let sqrd = (position.x * position.x) + (position.y * position.y) + (position.z * position.z);
            let radius = Math.sqrt(sqrd);
            return({
                r: radius,
                theta: Math.atan2(position.z, position.x),
                phi: Math.acos(position.y / radius)
            });
        }
        function polar2canvas(polarPoint) {
            return({
                x: (polarPoint.theta + Math.PI) / (2 * Math.PI),
                y: (polarPoint.phi / Math.PI)
            });
        }
    }
}

const _color = new THREE$1.Color();
const _position$1 = new THREE$1.Vector3();
class SVGBuilder {
    static createFromPaths(target, paths, onLoad, name = '') {
        const drawFills = true;
        const drawStrokes = true;
        let startZ = 0, zStep = 0.001;
        let fillNumber = 0, strokeNumber = 0;
        paths.forEach((path) => {
            let fillColor = path.userData.style.fill;
            let fillOpacity = path.userData.style.fillOpacity;
            if (!fillOpacity && fillOpacity !== 0) fillOpacity = 1;
            if (drawFills && fillColor !== undefined && fillColor !== 'none') {
                const shapes = SVGLoader.createShapes(path);
                shapes.forEach((shape) => {
                    let entityName = `Fill ${fillNumber}`;
                    if (name !== '') entityName = name + ' ' + entityName;
                    const entity = new Entity3D(entityName);
                    const depth = 0.256;
                    const scaleDown = 0.001;
                    function scaleCurve(curve) {
                        if (curve.aX) curve.aX *= scaleDown;
                        if (curve.aY) curve.aY *= scaleDown;
                        if (curve.xRadius) curve.xRadius *= scaleDown;
                        if (curve.yRadius) curve.yRadius *= scaleDown;
                        if (curve.v0) curve.v0.multiplyScalar(scaleDown);
                        if (curve.v1) curve.v1.multiplyScalar(scaleDown);
                        if (curve.v2) curve.v2.multiplyScalar(scaleDown);
                        if (curve.v3) curve.v3.multiplyScalar(scaleDown);
                    }
                    for (let c = 0; c < shape.curves.length; c++) scaleCurve(shape.curves[c]);
                    for (let h = 0; h < shape.holes.length; h++) {
                        for (let c = 0; c < shape.holes[h].curves.length; c++) {
                            scaleCurve(shape.holes[h].curves[c]);
                        }
                    }
                    const geometry = new THREE$1.ExtrudeGeometry(shape, {
                        depth: depth,
                        bevelEnabled: false,
                        bevelThickness: 0.25,
                        bevelSegments: 8,
                        curveSegments: 16,
                        steps: 4,
                    });
                    geometry.name = entityName;
                    geometry.translate(0, 0, depth / -2);
                    geometry.scale(1, -1, -1);
                    geometry.computeBoundingBox();
                    geometry.boundingBox.getCenter(_position$1);
                    geometry.center();
                    entity.position.copy(_position$1);
                    GeometryUtils.uvFlip(geometry, false , true );
                    entity.addComponent('geometry', geometry);
                    entity.addComponent('material', {
                        style: 'standard',
                        side: 'FrontSide',
                        color: _color.setStyle(fillColor).getHex(),
                        opacity: fillOpacity,
                    });
                    entity.position.z = startZ;
                    target.add(entity);
                    startZ += zStep;
                    fillNumber++;
                });
            }
        });
        if (target.children && target.children.length > 0) {
            const center = new THREE$1.Vector3();
            ObjectUtils.computeCenter(target.children, center);
            for (let child of target.children) {
                child.position.x -= (center.x - target.position.x);
                child.position.y -= (center.y - target.position.y);
            }
        }
        target.name = name;
        if (onLoad && typeof onLoad === 'function') onLoad(target);
    }
    static createFromFile(url, onLoad) {
        const svgGroup = new Entity3D();
        const loader = new SVGLoader();
        loader.load(url, function(data) {
            SVGBuilder.createFromPaths(svgGroup, data.paths, onLoad, Strings.nameFromUrl(url));
        });
        return svgGroup;
    }
}

let _renderer$1;
class RenderUtils {
    static offscreenRenderer(width, height) {
        if (_renderer$1 === undefined) {
            _renderer$1 = new Renderer3D({ alpha: true });
            _renderer$1.setSize(512, 512, false);
            _renderer$1.outputColorSpace = THREE$1.LinearSRGBColorSpace;
        }
        if (Maths.isNumber(width) && Maths.isNumber(height)) {
            _renderer$1.setSize(width, height, false);
        }
        return _renderer$1;
    }
    static renderGeometryToCanvas(canvas, geometry, material, color = 0xffffff) {
        const mat = material ?? new THREE$1.MeshStandardMaterial({ color: color });
        const geo = geometry ?? new THREE$1.SphereGeometry();
        const mesh = new THREE$1.Mesh(geo, mat);
        RenderUtils.renderMeshToCanvas(canvas, mesh);
        if (mesh && typeof mesh.dispose === 'function') mesh.dispose();
        if (!material) mat.dispose();
        if (!geometry) geo.dispose();
    }
    static renderMeshToCanvas(canvas, mesh) {
        const scene = new THREE$1.Scene();
        const light = new THREE$1.HemisphereLight(0xffffff, 0x202020, 7.5);
        scene.add(light);
        const camera = new THREE$1.PerspectiveCamera(50, canvas.width / canvas.height);
        camera.position.set(0, 0, 1);
        CameraUtils.fitCameraToObject(camera, mesh);
        const exsistingParent = mesh.parent;
        scene.add(mesh);
        const renderer = RenderUtils.offscreenRenderer(canvas.width, canvas.height);
        renderer.render(scene, camera);
        scene.remove(mesh);
        if (exsistingParent) exsistingParent.add(mesh);
        if (typeof light.dispose === 'function') light.dispose();
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
        }
    }
    static renderTextureToCanvas(canvas, texture) {
        const scene = new THREE$1.Scene();
        let sAspect = 1;
        let camera, material, geometry, mesh;
        if (!texture.isCubeTexture) {
            const image = texture.image;
            if (!image || !image.complete) return;
            sAspect = image.width / image.height;
            camera = new THREE$1.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            material = new THREE$1.MeshBasicMaterial({ map: texture, alphaTest: true });
            geometry = new THREE$1.PlaneGeometry(2, 2);
            mesh = new THREE$1.Mesh(geometry, material);
            scene.add(mesh);
        } else if (texture.isCubeTexture) {
            camera = new THREE$1.PerspectiveCamera(50, canvas.width / canvas.height);
            camera.position.set(0, 0, -3);
            camera.lookAt(new THREE$1.Vector3(0, 0, 0));
            const shader = THREE$1.ShaderLib.cube;
            material = new THREE$1.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: THREE$1.UniformsUtils.clone(shader.uniforms),
                depthWrite: false,
                side: THREE$1.BackSide,
            });
            material.uniforms.tCube.value = texture;
            material.needsUpdate = true;
            geometry = new THREE$1.BoxGeometry(2, 2, 2);
            mesh = new THREE$1.Mesh(geometry, material);
            scene.add(mesh);
        }
        const renderWidth = canvas.width;
        const renderHeight = canvas.height;
        const renderer = RenderUtils.offscreenRenderer(renderWidth, renderHeight);
        renderer.render(scene, camera);
        if (material && typeof material.dispose === 'function') material.dispose();
        if (geometry && typeof geometry.dispose === 'function') geometry.dispose();
        if (mesh && typeof mesh.dispose === 'function') mesh.dispose();
        const context = canvas.getContext('2d');
        if (context) {
            const dAspect = canvas.width / canvas.height;
            let dx, dy, dw, dh, shrink;
            if (sAspect < dAspect) {
                dh = canvas.height;
                shrink = sAspect / dAspect;
                dw = canvas.width * shrink;
            } else {
                dw = canvas.width;
                shrink = dAspect / sAspect;
                dh = canvas.height * shrink;
            }
            dx = (canvas.width - dw) / 2;
            dy = (canvas.height - dh) / 2;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, renderWidth, renderHeight, dx, dy, dw, dh);
        }
    }
}

const MOUSE_MODES = {
    SELECT:             'select',
    LOOK:               'look',
    MOVE:               'move',
    ZOOM:               'zoom',
};
const ORBIT_STATES = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
};
const ORBIT_ANIMATION = {
    NONE: 0,
    START: 1,
    ZOOMING: 2,
};
const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };
class OrbitControls extends THREE$1.EventDispatcher {
    constructor(camera, domElement, target) {
        super();
        const self = this;
        if (domElement == undefined) console.warn('OrbitControls: The second parameter "domElement" is now mandatory.');
        if (domElement === document) console.error('OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');
        this.camera = camera;
        this.domElement = domElement;
        this.domElement.style.touchAction = 'none';
        this.animating = ORBIT_ANIMATION.NONE;
        this.forceEndAnimation = false;
        this.enabled = true;
        this.signals = false;
        this.target = new THREE$1.Vector3();
        if (target && target.isObject3D) {
            target.getWorldPosition(this.target);
        } else {
            this.target.set(0, 0, 0);
        }
        this.minDistance = 0.2;
        this.maxDistance = 250;
        this.minZoom = 0.021;
        this.maxZoom = 25.0;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minAzimuthAngle = - Infinity;
        this.maxAzimuthAngle =   Infinity;
        this.smoothAnimate = true;
        this.enableSmooth = true;
        this.dampSmooth = 15;
        this.enableDamping = true;
        this.dampingFactor = 0.2;
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
        this.enablePan = true;
        this.panSpeed = 1.0;
        this.screenSpacePanning = true;
        this.keyPanSpeed = 20.0;
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0;
        let state = ORBIT_STATES.NONE;
        const spherical = new THREE$1.Spherical();
        const sphericalDelta = new THREE$1.Spherical();
        let scale = 1;
        const panOffset = new THREE$1.Vector3();
        let zoomChanged = false;
        let lastDelta = 0;
        const rotateStart = new THREE$1.Vector2();
        const rotateEnd = new THREE$1.Vector2();
        const rotateDelta = new THREE$1.Vector2();
        const panStart = new THREE$1.Vector2();
        const panEnd = new THREE$1.Vector2();
        const panDelta = new THREE$1.Vector2();
        const dollyStart = new THREE$1.Vector2();
        const dollyEnd = new THREE$1.Vector2();
        const dollyDelta = new THREE$1.Vector2();
        const dollyPosition = new THREE$1.Vector3();
        const pointers = [];
        const pointerPositions = {};
        const newPosition = new THREE$1.Vector3();
        const newTarget = new THREE$1.Vector3();
        let newZoom = 0;
        const tempBox = new THREE$1.Box3();
        const tempDelta = new THREE$1.Vector3();
        const tempSphere = new THREE$1.Sphere();
        const tempVector = new THREE$1.Vector3();
        this.keys = {
            LEFT: 'ArrowLeft',
            UP: 'ArrowUp',
            RIGHT: 'ArrowRight',
            BOTTOM: 'ArrowDown'
        };
        this.target0 = this.target.clone();
        this.position0 = this.camera.position.clone();
        this.zoom0 = this.camera.zoom;
        this._domElementKeyEvents = null;
        this.getPolarAngle = function() {
            return spherical.phi;
        };
        this.getAzimuthalAngle = function() {
            return spherical.theta;
        };
        this.getDistance = function() {
            return this.camera.position.distanceTo(this.target);
        };
        this.listenToKeyEvents = function(domElement) {
            domElement.addEventListener('keydown', onKeyDown);
            domElement.addEventListener('keyup', onKeyUp);
            this._domElementKeyEvents = domElement;
        };
        this.saveState = function() {
            this.target0.copy(this.target);
            this.position0.copy(this.camera.position);
            this.zoom0 = this.camera.zoom;
        };
        this.reset = function() {
            if (state !== ORBIT_STATES.NONE) return;
            newPosition.copy(this.position0);
            newTarget.copy(this.target0);
            newZoom = this.zoom0;
            this.animating = ORBIT_ANIMATION.START;
        };
        this.changeCamera = function(newCamera) {
            if (self.animating !== ORBIT_ANIMATION.NONE) {
                self.forceEndAnimation = true;
                self.update();
            }
            self.camera = newCamera;
        };
        this.centerOnTarget = function(target) {
            if (!target || !target.isObject3D) return;
            if (state !== ORBIT_STATES.NONE) return;
            const targetPosition = target.target ?? target.position ?? target;
            newPosition.copy(this.camera.position).add(targetPosition).sub(this.target);
            newTarget.copy(targetPosition);
            newZoom = this.camera.zoom;
            this.animating = ORBIT_ANIMATION.START;
        };
        this.focusOnTarget = function(target) {
            if (!target || !target.isObject3D) return;
            if (state !== ORBIT_STATES.NONE) return;
            const boundingBox = new THREE$1.Box3();
            target.traverseVisible((child) => {
                if (!child || !child.isObject3D) return;
                if (child.isWorld) return;
                if (child.isStage) return;
                if (child.userData.flagIgnore) return;
                const geometry = child.geometry;
                if (!geometry || !geometry.isBufferGeometry) return;
                if (!geometry.boundingBox) geometry.computeBoundingBox();
                child.updateWorldMatrix(false, false);
                tempBox.copy(geometry.boundingBox).applyMatrix4(child.matrixWorld);
                boundingBox.union(tempBox);
            });
            let distance = 0.1;
            if (boundingBox.isEmpty() === false) {
                boundingBox.getBoundingSphere(tempSphere);
                distance = tempSphere.radius;
                distance = Math.pow(distance, 0.7);
            }
            distance *= 5;
            tempDelta.set(0, 0, distance);
            tempDelta.applyQuaternion(this.camera.quaternion);
            newPosition.copy(target.position).add(tempDelta);
            newTarget.copy(target.position);
            newZoom = this.camera.zoom;
            this.animating = ORBIT_ANIMATION.START;
        };
        this.getCameraZoom = function(optionalTarget = undefined) {
            const originalDistance = this.position0.distanceTo(this.target0);
            const newDistance = this.distanceToTarget(optionalTarget);
            return (originalDistance / newDistance);
        };
        this.distanceToTarget = function(optionalTarget = undefined) {
            if (optionalTarget && optionalTarget.isObject3D) optionalTarget = optionalTarget.position;
            return this.camera.position.distanceTo(optionalTarget ?? this.target);
        };
        this.applyRotation = function(angle) {
            rotateLeft(angle);
        };
        this.update = function(deltaTime) {
            const offset = new THREE$1.Vector3();
            const quat = new THREE$1.Quaternion().setFromUnitVectors(self.camera.up, new THREE$1.Vector3(0, 1, 0));
            const quatInverse = quat.clone().invert();
            const lastPosition = new THREE$1.Vector3();
            const lastQuaternion = new THREE$1.Quaternion();
            const twoPI = 2 * Math.PI;
            function getAutoRotationAngle() {
                return 2 * Math.PI / 60 / 60 * self.autoRotateSpeed;
            }
            return function update(deltaTime) {
                if (self.enabled === false) return false;
                if (!deltaTime) deltaTime = lastDelta;
                lastDelta = deltaTime;
                let endAnimation = false;
                if (self.animating !== ORBIT_ANIMATION.NONE) {
                    if (!self.smoothAnimate || zoomChanged || state !== ORBIT_STATES.NONE) {
                        self.forceEndAnimation = true;
                    }
                    let lambda, dt;
                    if (self.animating === ORBIT_ANIMATION.ZOOMING) {
                        lambda = self.dampSmooth / 2;
                        dt = deltaTime * 2;
                    } else {
                        lambda = self.dampSmooth;
                        dt = deltaTime;
                    }
                    self.camera.position.x = Maths.damp(self.camera.position.x, newPosition.x, lambda, dt);
                    self.camera.position.y = Maths.damp(self.camera.position.y, newPosition.y, lambda, dt);
                    self.camera.position.z = Maths.damp(self.camera.position.z, newPosition.z, lambda, dt);
                    self.target.x = Maths.damp(self.target.x, newTarget.x, lambda, dt);
                    self.target.y = Maths.damp(self.target.y, newTarget.y, lambda, dt);
                    self.target.z = Maths.damp(self.target.z, newTarget.z, lambda, dt);
                    self.camera.zoom = Maths.damp(self.camera.zoom, newZoom, lambda, dt);
                    const donePosition = Maths.fuzzyVector(self.camera.position, newPosition, 0.001);
                    const doneZooming = true;
                    endAnimation = (donePosition && doneZooming) || self.forceEndAnimation;
                    if (endAnimation) {
                        self.camera.position.copy(newPosition);
                        self.target.copy(newTarget);
                        self.camera.zoom = newZoom;
                    }
                    self.camera.updateWorldMatrix(true);
                    self.camera.updateProjectionMatrix(self.target);
                    self.camera.lookAt(self.target);
                    if (endAnimation) {
                        if (self.animating === ORBIT_ANIMATION.ZOOMING) zoomChanged = true;
                        self.animating = ORBIT_ANIMATION.NONE;
                        self.forceEndAnimation = false;
                    }
                    self.dispatchEvent(_changeEvent);
                }
                if (this.signals && window.signals) {
                    if (zoomChanged) {
                        signals.showInfo.dispatch(`${(this.getCameraZoom() * 100).toFixed(0)}%`);
                    } else if (self.animating !== ORBIT_ANIMATION.NONE) {
                        signals.showInfo.dispatch(`${(this.getCameraZoom(newTarget) * 100).toFixed(0)}%`);
                    }
                }
                const position = self.camera.position;
                offset.copy(position).sub(self.target);
                offset.applyQuaternion(quat);
                spherical.setFromVector3(offset);
                if (self.autoRotate && state === ORBIT_STATES.NONE) {
                    rotateLeft(getAutoRotationAngle());
                }
                if (self.enableSmooth && self.smoothAnimate) {
                    let targetTheta = spherical.theta + sphericalDelta.theta;
                    let targetPhi = spherical.phi + sphericalDelta.phi;
                    let dampTheta = Maths.damp(spherical.theta, targetTheta, self.dampSmooth, deltaTime);
                    let dampPhi = Maths.damp(spherical.phi, targetPhi, self.dampSmooth, deltaTime);
                    if (Number.isNaN(dampTheta)) dampTheta = spherical.theta;
                    if (Number.isNaN(dampPhi)) dampPhi = spherical.phi;
                    sphericalDelta.theta -= (dampTheta - spherical.theta);
                    sphericalDelta.phi -= (dampPhi - spherical.phi);
                    spherical.theta = dampTheta;
                    spherical.phi = dampPhi;
                    let targetX = self.target.x + panOffset.x;
                    let targetY = self.target.y + panOffset.y;
                    let targetZ = self.target.z + panOffset.z;
                    let dampX = Maths.damp(self.target.x, targetX, self.dampSmooth * 2, deltaTime);
                    let dampY = Maths.damp(self.target.y, targetY, self.dampSmooth * 2, deltaTime);
                    let dampZ = Maths.damp(self.target.z, targetZ, self.dampSmooth * 2, deltaTime);
                    if (Number.isNaN(dampX)) dampX = self.target.x;
                    if (Number.isNaN(dampY)) dampY = self.target.y;
                    if (Number.isNaN(dampZ)) dampZ = self.target.z;
                    panOffset.x -= (dampX - self.target.x);
                    panOffset.y -= (dampY - self.target.y);
                    panOffset.z -= (dampZ - self.target.z);
                    self.target.x = dampX;
                    self.target.y = dampY;
                    self.target.z = dampZ;
                } else if (self.enableDamping && self.smoothAnimate) {
                    spherical.theta += sphericalDelta.theta * self.dampingFactor;
                    spherical.phi += sphericalDelta.phi * self.dampingFactor;
                    sphericalDelta.theta *= (1 - self.dampingFactor);
                    sphericalDelta.phi *= (1 - self.dampingFactor);
                    self.target.addScaledVector(panOffset, self.dampingFactor);
                    panOffset.multiplyScalar(1 - self.dampingFactor);
                } else {
                    spherical.theta += sphericalDelta.theta;
                    spherical.phi += sphericalDelta.phi;
                    sphericalDelta.set(0, 0, 0);
                    self.target.add(panOffset);
                    panOffset.set(0, 0, 0);
                }
                let min = self.minAzimuthAngle;
                let max = self.maxAzimuthAngle;
                if (isFinite(min) && isFinite(max)) {
                    if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;
                    if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;
                    if (min <= max) {
                        spherical.theta = Math.max(min, Math.min(max, spherical.theta));
                    } else {
                        spherical.theta = (spherical.theta > (min + max) / 2) ?
                            Math.max(min, spherical.theta) :
                            Math.min(max, spherical.theta);
                    }
                }
                spherical.phi = Math.max(self.minPolarAngle, Math.min(self.maxPolarAngle, spherical.phi));
                spherical.makeSafe();
                spherical.radius *= scale;
                spherical.radius = Math.max(self.minDistance, Math.min(self.maxDistance, spherical.radius));
                offset.setFromSpherical(spherical);
                offset.applyQuaternion(quatInverse);
                position.copy(self.target).add(offset);
                self.camera.lookAt(self.target);
                scale = 1;
                if (zoomChanged ||
                    lastPosition.distanceToSquared(self.camera.position) > 0.001 ||
                    8 * (1 - lastQuaternion.dot(self.camera.quaternion)) > 0.001) {
                    self.dispatchEvent(_changeEvent);
                    lastPosition.copy(self.camera.position);
                    lastQuaternion.copy(self.camera.quaternion);
                    zoomChanged = false;
                    return true;
                }
                return false;
            };
        }();
        this.dispose = function() {
            this.domElement.removeEventListener('contextmenu', onContextMenu);
            this.domElement.removeEventListener('pointerdown', onPointerDown);
            this.domElement.removeEventListener('pointercancel', onPointerCancel);
            this.domElement.removeEventListener('wheel', onMouseWheel);
            this.domElement.removeEventListener('pointermove', onPointerMove);
            this.domElement.removeEventListener('pointerup', onPointerUp);
            if (this._domElementKeyEvents) {
                this._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
                this._domElementKeyEvents.removeEventListener('keyup', onKeyUp);
            }
        };
        function rotateLeft(angle) {
            sphericalDelta.theta -= angle;
        }
        function rotateUp(angle) {
            sphericalDelta.phi -= angle;
        }
        const panLeft = function() {
            const v = new THREE$1.Vector3();
            return function panLeft(distance, cameraMatrix) {
                v.setFromMatrixColumn(cameraMatrix, 0);
                v.multiplyScalar(- distance);
                panOffset.add(v);
            };
        }();
        const panUp = function() {
            const v = new THREE$1.Vector3();
            return function panUp(distance, cameraMatrix) {
                if (self.screenSpacePanning === true) {
                    v.setFromMatrixColumn(cameraMatrix, 1);
                } else {
                    v.setFromMatrixColumn(cameraMatrix, 0);
                    v.crossVectors(self.camera.up, v);
                }
                v.multiplyScalar(distance);
                panOffset.add(v);
            };
        }();
        const pan = function() {
            const offset = new THREE$1.Vector3();
            return function pan(deltaX, deltaY) {
                const element = self.domElement;
                if (self.camera.isPerspectiveCamera || self.camera.isOrthographicCamera) {
                    const position = self.camera.position;
                    offset.copy(position).sub(self.target);
                    let targetDistance = offset.length();
                    targetDistance *= Math.tan((self.camera.fov / 2) * Math.PI / 180.0);
                    panLeft(2 * deltaX * targetDistance / element.clientHeight, self.camera.matrix);
                    panUp(2 * deltaY * targetDistance / element.clientHeight, self.camera.matrix);
                } else {
                    console.warn('OrbitControls.pan: Unknown camera type, pan disabled');
                    self.enablePan = false;
                }
            };
        }();
        function getZoomScale() {
            return Math.pow(0.95, self.zoomSpeed);
        }
        function dollyOut(dollyScale) {
            if (self.camera.isPerspectiveCamera || self.camera.isOrthographicCamera) {
                scale /= dollyScale;
                zoomChanged = true;
            } else {
                console.warn('OrbitControls.dollyOut: Unknown camera type, dolly / zoom disabled');
                self.enableZoom = false;
            }
        }
        function dollyIn(dollyScale) {
            if (self.camera.isPerspectiveCamera || self.camera.isOrthographicCamera) {
                scale *= dollyScale;
                zoomChanged = true;
            } else {
                console.warn('OrbitControls.dollyIn: Unknown camera type, dolly / zoom disabled');
                self.enableZoom = false;
            }
        }
        function wheelScale(dollyScale, direction = 1 ) {
            if (state !== ORBIT_STATES.NONE) return;
            newTarget.copy(self.target);
            if (self.camera.isPerspectiveCamera || self.camera.isOrthographicCamera) {
                if (self.animating === ORBIT_ANIMATION.NONE) {
                    dollyPosition.copy(self.camera.position);
                } else {
                    dollyPosition.copy(newPosition);
                }
                let originalDistance = self.position0.distanceTo(self.target0);
                let currentDistance = dollyPosition.distanceTo(self.target);
                let adjustDistance;
                if (direction === 1) {
                    adjustDistance = (currentDistance * dollyScale) - currentDistance;
                    if (currentDistance + adjustDistance < self.minDistance) return;
                } else {
                    adjustDistance = (currentDistance / dollyScale) - currentDistance;
                    if (currentDistance + adjustDistance > self.maxDistance) return;
                }
                tempDelta.set(0, 0, adjustDistance).applyQuaternion(self.camera.quaternion);
                newPosition.copy(dollyPosition).add(tempDelta);
                newZoom = self.camera.zoom;
            }
            if (isNaN(newPosition.x) || !isFinite(newPosition.x)) newPosition.x = 0;
            if (isNaN(newPosition.y) || !isFinite(newPosition.y)) newPosition.y = 0;
            if (isNaN(newPosition.z) || !isFinite(newPosition.z)) newPosition.z = 5;
            if (isNaN(newZoom) || !isFinite(newZoom)) newZoom = 1;
            self.animating = ORBIT_ANIMATION.ZOOMING;
        }
        function handleMouseDownRotate(event) {
            rotateStart.set(event.clientX, event.clientY);
        }
        function handleMouseDownDolly(event) {
            dollyStart.set(event.clientX, event.clientY);
        }
        function handleMouseDownPan(event) {
            panStart.set(event.clientX, event.clientY);
        }
        function handleMouseMoveRotate(event) {
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(self.rotateSpeed);
            const element = self.domElement;
            rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
            rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
            rotateStart.copy(rotateEnd);
            self.update();
        }
        function handleMouseMoveDolly(event) {
            dollyEnd.set(event.clientX, event.clientY);
            dollyDelta.subVectors(dollyEnd, dollyStart);
            if (dollyDelta.y > 0) {
                dollyOut(getZoomScale());
            } else if (dollyDelta.y < 0) {
                dollyIn(getZoomScale());
            }
            dollyStart.copy(dollyEnd);
            self.update();
        }
        function handleMouseMovePan(event) {
            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart).multiplyScalar(self.panSpeed);
            pan(panDelta.x, panDelta.y);
            panStart.copy(panEnd);
            self.update();
        }
        function handleMouseWheel(event) {
            wheelScale(getZoomScale(), (event.deltaY < 0) ? 1 : -1);
            self.update();
        }
        function handleKeyDown(event) {
            let needsUpdate = false;
            switch (event.key) {
                case ' ':
                    self.spaceKey = true;
                    break;
            }
            if (needsUpdate) {
                event.preventDefault();
                self.update();
            }
        }
        function handleKeyUp(event) {
            switch (event.key) {
                case ' ':
                    self.spaceKey = false;
                    break;
            }
        }
        function handleTouchStartRotate() {
            if (pointers.length === 1) {
                rotateStart.set(pointers[0].pageX, pointers[0].pageY);
            } else {
                const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
                const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);
                rotateStart.set(x, y);
            }
        }
        function handleTouchStartPan() {
            if (pointers.length === 1) {
                panStart.set(pointers[0].pageX, pointers[0].pageY);
            } else {
                const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
                const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);
                panStart.set(x, y);
            }
        }
        function handleTouchStartDolly() {
            const dx = pointers[0].pageX - pointers[1].pageX;
            const dy = pointers[0].pageY - pointers[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            dollyStart.set(0, distance);
        }
        function handleTouchStartDollyPan() {
            if (self.enableZoom) handleTouchStartDolly();
            if (self.enablePan) handleTouchStartPan();
        }
        function handleTouchMoveRotate(event) {
            if (pointers.length == 1) {
                rotateEnd.set(event.pageX, event.pageY);
            } else {
                const position = getSecondPointerPosition(event);
                const x = 0.5 * (event.pageX + position.x);
                const y = 0.5 * (event.pageY + position.y);
                rotateEnd.set(x, y);
            }
            rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(self.rotateSpeed);
            const element = self.domElement;
            rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
            rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
            rotateStart.copy(rotateEnd);
        }
        function handleTouchMovePan(event) {
            if (pointers.length === 1) {
                panEnd.set(event.pageX, event.pageY);
            } else {
                const position = getSecondPointerPosition(event);
                const x = 0.5 * (event.pageX + position.x);
                const y = 0.5 * (event.pageY + position.y);
                panEnd.set(x, y);
            }
            panDelta.subVectors(panEnd, panStart).multiplyScalar(self.panSpeed);
            pan(panDelta.x, panDelta.y);
            panStart.copy(panEnd);
        }
        function handleTouchMoveDolly(event) {
            const position = getSecondPointerPosition(event);
            const dx = event.pageX - position.x;
            const dy = event.pageY - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            dollyEnd.set(0, distance);
            dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, self.zoomSpeed));
            dollyOut(dollyDelta.y);
            dollyStart.copy(dollyEnd);
        }
        function handleTouchMoveDollyPan(event) {
            if (self.enableZoom) handleTouchMoveDolly(event);
            if (self.enablePan) handleTouchMovePan(event);
        }
        function handleTouchMoveDollyRotate(event) {
            if (self.enableZoom) handleTouchMoveDolly(event);
            if (self.enableRotate) handleTouchMoveRotate(event);
        }
        function onPointerDown(event) {
            if (self.enabled === false) return;
            if (self.animating !== ORBIT_ANIMATION.NONE) {
                self.forceEndAnimation = true;
                self.update();
            }
            if (pointers.length === 0) {
                self.domElement.setPointerCapture(event.pointerId);
                self.domElement.addEventListener('pointermove', onPointerMove);
                self.domElement.addEventListener('pointerup', onPointerUp);
            }
            addPointer(event);
            if (event.pointerType === 'touch') {
                onTouchStart(event);
            } else {
                onMouseDown(event);
            }
        }
        function onPointerMove(event) {
            if (self.enabled === false) return;
            if (!document.activeElement.contains(self.domElement)) return;
            if (event.pointerType === 'touch') {
                onTouchMove(event);
            } else {
                onMouseMove(event);
            }
        }
        function onPointerUp(event) {
            removePointer(event);
            if (pointers.length === 0) {
                self.domElement.releasePointerCapture(event.pointerId);
                self.domElement.removeEventListener('pointermove', onPointerMove);
                self.domElement.removeEventListener('pointerup', onPointerUp);
            }
            self.dispatchEvent(_endEvent);
            state = ORBIT_STATES.NONE;
        }
        function onPointerCancel(event) {
            removePointer(event);
        }
        function onMouseDown(event) {
            let mouseAction = THREE$1.MOUSE.ROTATE;
            if (self.domElement && self.domElement.classList.contains('one-viewport')) {
                if (event.button === 0  && !self.spaceKey) {
                    switch (editor.viewport.mouseMode) {
                        case MOUSE_MODES.SELECT:   mouseAction = THREE$1.MOUSE.PAN; break;
                        case MOUSE_MODES.LOOK:     mouseAction = THREE$1.MOUSE.ROTATE; break;
                        case MOUSE_MODES.MOVE:     mouseAction = THREE$1.MOUSE.PAN; break;
                        case MOUSE_MODES.ZOOM:     mouseAction = THREE$1.MOUSE.DOLLY; break;
                        default: mouseAction = -1;
                    }
                } else if (event.button === 2  || (event.button === 0 && self.spaceKey)) {
                    if (self.camera.isOrthographicCamera) {
                        if (editor.viewport.mouseMode === MOUSE_MODES.MOVE) {
                            mouseAction = (self.spaceKey) ? THREE$1.MOUSE.PAN : THREE$1.MOUSE.ROTATE;
                        } else {
                            mouseAction = (self.spaceKey) ? THREE$1.MOUSE.ROTATE : THREE$1.MOUSE.PAN;
                        }
                    } else {
                        if (editor.viewport.mouseMode === MOUSE_MODES.LOOK) {
                            mouseAction = (self.spaceKey) ? THREE$1.MOUSE.ROTATE : THREE$1.MOUSE.PAN;
                        } else {
                            mouseAction = (self.spaceKey) ? THREE$1.MOUSE.PAN : THREE$1.MOUSE.ROTATE;
                        }
                        if (self.camera.rotateLock) mouseAction = THREE$1.MOUSE.PAN;
                    }
                } else {
                    mouseAction = -1;
                }
            } else {
                if (event.button === 0) {
                    mouseAction = THREE$1.MOUSE.PAN;
                } else if (event.button === 2) {
                    mouseAction = THREE$1.MOUSE.ROTATE;
                } else {
                    mouseAction = -1;
                }
            }
            switch (mouseAction) {
                case THREE$1.MOUSE.DOLLY:
                    if (self.enableZoom === false) return;
                    handleMouseDownDolly(event);
                    state = ORBIT_STATES.DOLLY;
                    break;
                case THREE$1.MOUSE.ROTATE:
                    if (self.enableRotate === false) return;
                    if (self.camera.rotateLock === true) return;
                    handleMouseDownRotate(event);
                    state = ORBIT_STATES.ROTATE;
                    break;
                case THREE$1.MOUSE.PAN:
                    if (self.enablePan === false) return;
                    handleMouseDownPan(event);
                    state = ORBIT_STATES.PAN;
                    break;
                default:
                    state = ORBIT_STATES.NONE;
            }
            if (state !== ORBIT_STATES.NONE) {
                _startEvent.value = state;
                self.dispatchEvent(_startEvent);
            }
        }
        function onMouseMove(event) {
            if (self.enabled === false) return;
            switch (state) {
                case ORBIT_STATES.ROTATE:
                    if (self.enableRotate === false) return;
                    handleMouseMoveRotate(event);
                    break;
                case ORBIT_STATES.DOLLY:
                    if (self.enableZoom === false) return;
                    handleMouseMoveDolly(event);
                    break;
                case ORBIT_STATES.PAN:
                    if (self.enablePan === false) return;
                    handleMouseMovePan(event);
                    break;
            }
        }
        function onMouseWheel(event) {
            if (self.enabled === false || self.enableZoom === false || state !== ORBIT_STATES.NONE) return;
            event.preventDefault();
            _startEvent.value = ORBIT_STATES.DOLLY;
            self.dispatchEvent(_startEvent);
            handleMouseWheel(event);
            self.dispatchEvent(_endEvent);
        }
        function onKeyDown(event) {
            if (self.enabled === false || self.enablePan === false) return;
            handleKeyDown(event);
        }
        function onKeyUp(event) {
            if (self.enabled === false || self.enablePan === false) return;
            handleKeyUp(event);
        }
        function onTouchStart(event) {
            trackPointer(event);
            switch (pointers.length) {
                case 1:
                    if (self.enableRotate === false) return;
                    if (self.camera.rotateLock === true) return;
                    handleTouchStartRotate();
                    state = ORBIT_STATES.TOUCH_ROTATE;
                    break;
                case 2:
                    if (self.enableZoom === false && self.enablePan === false) return;
                    handleTouchStartDollyPan();
                    state = ORBIT_STATES.TOUCH_DOLLY_PAN;
                    break;
                default:
                    state = ORBIT_STATES.NONE;
            }
            if (state !== ORBIT_STATES.NONE) {
                _startEvent.value = state;
                self.dispatchEvent(_startEvent);
            }
        }
        function onTouchMove(event) {
            trackPointer(event);
            switch (state) {
                case ORBIT_STATES.TOUCH_ROTATE:
                    if (self.enableRotate === false) return;
                    handleTouchMoveRotate(event);
                    self.update();
                    break;
                case ORBIT_STATES.TOUCH_PAN:
                    if (self.enablePan === false) return;
                    handleTouchMovePan(event);
                    self.update();
                    break;
                case ORBIT_STATES.TOUCH_DOLLY_PAN:
                    if (self.enableZoom === false && self.enablePan === false) return;
                    handleTouchMoveDollyPan(event);
                    self.update();
                    break;
                case ORBIT_STATES.TOUCH_DOLLY_ROTATE:
                    if (self.enableZoom === false && self.enableRotate === false) return;
                    handleTouchMoveDollyRotate(event);
                    self.update();
                    break;
                default:
                    state = ORBIT_STATES.NONE;
            }
        }
        function onContextMenu(event) {
            if (self.enabled === false) return;
            event.preventDefault();
        }
        function addPointer(event) {
            pointers.push(event);
        }
        function removePointer(event) {
            delete pointerPositions[event.pointerId];
            for (let i = 0; i < pointers.length; i++) {
                if (pointers[i].pointerId == event.pointerId) {
                    pointers.splice(i, 1);
                    return;
                }
            }
        }
        function trackPointer(event) {
            let position = pointerPositions[event.pointerId];
            if (position == undefined) {
                position = new THREE$1.Vector2();
                pointerPositions[event.pointerId] = position;
            }
            position.set(event.pageX, event.pageY);
        }
        function getSecondPointerPosition(event) {
            const pointer = (event.pointerId === pointers[0].pointerId ) ? pointers[1] : pointers[0];
            return pointerPositions[pointer.pointerId];
        }
        this.domElement.addEventListener('contextmenu', onContextMenu);
        this.domElement.addEventListener('pointerdown', onPointerDown);
        this.domElement.addEventListener('pointercancel', onPointerCancel);
        this.domElement.addEventListener('wheel', onMouseWheel, { passive: false });
        this.update();
    }
}

class CapsuleGeometry extends THREE$1.BufferGeometry {
    constructor(radiusTop = 1, radiusBottom = 1, height = 2, radialSegments = 12, heightSegments = 1,
                capsTopSegments = 5, capsBottomSegments = 5, thetaStart, thetaLength) {
        super();
        this.type = 'CapsuleGeometry';
        this.parameters = {
            radiusTop: radiusTop,
            radiusBottom: radiusBottom,
            height: height,
            radialSegments: radialSegments,
            heightSegments: heightSegments,
            thetaStart: thetaStart,
            thetaLength: thetaLength,
        };
        radiusTop = radiusTop !== undefined ? radiusTop : 1;
        radiusBottom = radiusBottom !== undefined ? radiusBottom : 1;
        height = height !== undefined ? height : 2;
        radiusTop = Maths.clamp(radiusTop, 0.001, height);
        radiusBottom = Maths.clamp(radiusBottom, 0.001, height);
        if (height < 0.001) height = 0.001;
        radialSegments = Math.floor(radialSegments) || 12;
        heightSegments = Math.floor(heightSegments) || 1;
        capsTopSegments = Math.floor(capsTopSegments) || 5;
        capsBottomSegments = Math.floor(capsBottomSegments) || 5;
        thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
        thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI;
        let alpha = Math.acos((radiusBottom-radiusTop) / height);
        let eqRadii = (radiusTop-radiusBottom === 0);
        let vertexCount = calculateVertexCount();
        let indexCount = calculateIndexCount();
        let indices = new THREE$1.BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount), 1);
        let vertices = new THREE$1.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        let normals = new THREE$1.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        let uvs = new THREE$1.BufferAttribute(new Float32Array(vertexCount * 2), 2);
        let index = 0;
        let indexOffset = 0;
        let indexArray = [];
        let halfHeight = height / 2;
        generateTorso();
        this.setIndex(indices);
        this.setAttribute('position', vertices);
        this.setAttribute('normal', normals);
        this.setAttribute('uv', uvs);
        function calculateVertexCount(){
            let count = (radialSegments + 1) * (heightSegments + 1 + capsBottomSegments + capsTopSegments);
            return count;
        }
        function calculateIndexCount() {
            let count = radialSegments * (heightSegments + capsBottomSegments + capsTopSegments) * 2 * 3;
            return count;
        }
        function generateTorso() {
            let x, y;
            let normal = new THREE$1.Vector3();
            let vertex = new THREE$1.Vector3();
            let cosAlpha = Math.cos(alpha);
            let sinAlpha = Math.sin(alpha);
            let cone_length =
                new THREE$1.Vector2(radiusTop * sinAlpha, halfHeight + radiusTop * cosAlpha)
                    .sub(new THREE$1.Vector2(radiusBottom * sinAlpha, -halfHeight + radiusBottom * cosAlpha))
                    .length();
            let vl = radiusTop * alpha
                    + cone_length
                    + radiusBottom * ((Math.PI / 2) - alpha);
            let groupCount = 0;
            let v = 0;
            for (y = 0; y <= capsTopSegments; y++) {
                let indexRow = [];
                let a = (Math.PI / 2) - alpha * (y / capsTopSegments);
                v += radiusTop * alpha / capsTopSegments;
                let cosA = Math.cos(a);
                let sinA = Math.sin(a);
                let radius = cosA * radiusTop;
                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);
                    vertex.x = radius * sinTheta;
                    vertex.y = halfHeight + sinA * radiusTop;
                    vertex.z = radius * cosTheta;
                    vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
                    normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
                    normals.setXYZ(index, normal.x, normal.y, normal.z);
                    uvs.setXY(index, u, 1 - v/vl);
                    indexRow.push(index);
                    index ++;
                }
                indexArray.push(indexRow);
            }
            let cone_height = height + cosAlpha * radiusTop - cosAlpha * radiusBottom;
            let slope = sinAlpha * (radiusBottom - radiusTop) / cone_height;
            for (y = 1; y <= heightSegments; y++) {
                let indexRow = [];
                v += cone_length / heightSegments;
                let radius = sinAlpha * (y * (radiusBottom - radiusTop) / heightSegments + radiusTop);
                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);
                    vertex.x = radius * sinTheta;
                    vertex.y = halfHeight + cosAlpha * radiusTop - y * cone_height / heightSegments;
                    vertex.z = radius * cosTheta;
                    vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
                    normal.set(sinTheta, slope, cosTheta).normalize();
                    normals.setXYZ(index, normal.x, normal.y, normal.z);
                    uvs.setXY(index, u, 1 - v / vl);
                    indexRow.push(index);
                    index ++;
                }
                indexArray.push(indexRow);
            }
            for (y = 1; y <= capsBottomSegments; y++) {
                let indexRow = [];
                let a = ((Math.PI / 2) - alpha) - (Math.PI - alpha) * (y / capsBottomSegments);
                v += radiusBottom * alpha / capsBottomSegments;
                let cosA = Math.cos(a);
                let sinA = Math.sin(a);
                let radius = cosA * radiusBottom;
                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);
                    vertex.x = radius * sinTheta;
                    vertex.y = -halfHeight + sinA * radiusBottom;;
                    vertex.z = radius * cosTheta;
                    vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
                    normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
                    normals.setXYZ(index, normal.x, normal.y, normal.z);
                    uvs.setXY(index, u, 1 - v / vl);
                    indexRow.push(index);
                    index++;
                }
                indexArray.push( indexRow );
            }
            for (x = 0; x < radialSegments; x++) {
                for (y = 0; y < capsTopSegments + heightSegments + capsBottomSegments; y++) {
                    let i1 = indexArray[y][x];
                    let i2 = indexArray[y + 1][x];
                    let i3 = indexArray[y + 1][x + 1];
                    let i4 = indexArray[y][x + 1];
                    indices.setX(indexOffset, i1); indexOffset++;
                    indices.setX(indexOffset, i2); indexOffset++;
                    indices.setX(indexOffset, i4); indexOffset++;
                    indices.setX(indexOffset, i2); indexOffset++;
                    indices.setX(indexOffset, i3); indexOffset++;
                    indices.setX(indexOffset, i4); indexOffset++;
                }
            }
        }
    }
    static fromPoints(pointA, pointB, radiusA, radiusB, radialSegments, heightSegments,
            capsTopSegments, capsBottomSegments, thetaStart, thetaLength) {
        let cmin = null;
        let cmax = null;
        let rmin = null;
        let rmax = null;
        if(radiusA > radiusB){
            cmax = pointA;
            cmin = pointB;
            rmax = radiusA;
            rmin = radiusB;
        }else {
            cmax = pointA;
            cmin = pointB;
            rmax = radiusA;
            rmin = radiusB;
        }
        const c0 = cmin;
        const c1 = cmax;
        const r0 = rmin;
        const r1 = rmax;
        const sphereCenterTop = new THREE$1.Vector3(c0.x, c0.y, c0.z);
        const sphereCenterBottom = new THREE$1.Vector3(c1.x, c1.y, c1.z);
        const radiusTop = r0;
        const radiusBottom = r1;
        let height = sphereCenterTop.distanceTo(sphereCenterBottom);
        if (height < Math.abs(r0 - r1)){
            let g = new THREE$1.SphereGeometry(r1, radialSegments, capsBottomSegments, thetaStart, thetaLength);
            g.translate(r1.x, r1.y, r1.z);
            return g;
        }
        const alpha = Math.acos((radiusBottom - radiusTop) / height);
        const cosAlpha = Math.cos(alpha);
        const rotationMatrix = new THREE$1.Matrix4();
        const quaternion = new THREE$1.Quaternion();
        const capsuleModelUnitVector = new THREE$1.Vector3(0, 1, 0);
        const capsuleUnitVector = new THREE$1.Vector3();
        capsuleUnitVector.subVectors(sphereCenterTop, sphereCenterBottom);
        capsuleUnitVector.normalize();
        quaternion.setFromUnitVectors(capsuleModelUnitVector, capsuleUnitVector);
        rotationMatrix.makeRotationFromQuaternion(quaternion);
        const translationMatrix = new THREE$1.Matrix4();
        const cylVec = new THREE$1.Vector3();
        cylVec.subVectors(sphereCenterTop, sphereCenterBottom);
        cylVec.normalize();
        let cylTopPoint = new THREE$1.Vector3();
        cylTopPoint = sphereCenterTop;
        cylTopPoint.addScaledVector(cylVec, cosAlpha * radiusTop);
        let cylBottomPoint = new THREE$1.Vector3();
        cylBottomPoint = sphereCenterBottom;
        cylBottomPoint.addScaledVector(cylVec, cosAlpha * radiusBottom);
        const dir = new THREE$1.Vector3();
        dir.subVectors(cylBottomPoint, cylTopPoint);
        dir.normalize();
        const middlePoint = new THREE$1.Vector3();
        middlePoint.lerpVectors(cylBottomPoint, cylTopPoint, 0.5);
        translationMatrix.makeTranslation(middlePoint.x, middlePoint.y, middlePoint.z);
        let g = new CapsuleGeometry(radiusBottom, radiusTop, height, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength);
        g.applyMatrix(rotationMatrix);
        g.applyMatrix(translationMatrix);
        return g;
    }
}

class CylinderGeometry extends THREE$1.BufferGeometry {
    constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
        super();
        this.type = 'CylinderGeometry';
        this.parameters = {
            radiusTop: radiusTop,
            radiusBottom: radiusBottom,
            height: height,
            radialSegments: radialSegments,
            heightSegments: heightSegments,
            openEnded: openEnded,
            thetaStart: thetaStart,
            thetaLength: thetaLength
        };
        const scope = this;
        radialSegments = Math.floor(radialSegments);
        heightSegments = Math.floor(heightSegments);
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        let index = 0;
        const indexArray = [];
        const halfHeight = height / 2;
        let groupStart = 0;
        generateTorso();
        if (!openEnded) {
            if (radiusTop > 0) generateCap(true);
            if (radiusBottom > 0) generateCap(false);
        }
        this.setIndex(indices);
        this.setAttribute('position', new THREE$1.Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new THREE$1.Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new THREE$1.Float32BufferAttribute(uvs, 2));
        function generateTorso() {
            const normal = new THREE$1.Vector3();
            const vertex = new THREE$1.Vector3();
            let groupCount = 0;
            const slope = (radiusBottom - radiusTop) / height;
            for (let y = 0; y <= heightSegments; y++) {
                const indexRow = [];
                const v = y / heightSegments;
                const radius = v * (radiusBottom - radiusTop) + radiusTop;
                for (let x = 0; x <= radialSegments; x++) {
                    const u = x / radialSegments;
                    const theta = u * thetaLength + thetaStart;
                    const sinTheta = Math.sin(theta);
                    const cosTheta = Math.cos(theta);
                    vertex.x = radius * sinTheta;
                    vertex.y = -v * height + halfHeight;
                    vertex.z = radius * cosTheta;
                    vertices.push(vertex.x, vertex.y, vertex.z);
                    normal.set(sinTheta, slope, cosTheta).normalize();
                    normals.push(normal.x, normal.y, normal.z);
                    uvs.push(u, 1 - v);
                    indexRow.push(index++);
                }
                indexArray.push(indexRow);
            }
            for (let x = 0; x < radialSegments; x++) {
                for (let y = 0; y < heightSegments; y++) {
                    const a = indexArray[y    ][x    ];
                    const b = indexArray[y + 1][x    ];
                    const c = indexArray[y + 1][x + 1];
                    const d = indexArray[y    ][x + 1];
                    const vecA = new THREE$1.Vector3(vertices[(a * 3) + 0], vertices[(a * 3) + 1], vertices[(a * 3) + 2]);
                    const vecB = new THREE$1.Vector3(vertices[(b * 3) + 0], vertices[(b * 3) + 1], vertices[(b * 3) + 2]);
                    const vecC = new THREE$1.Vector3(vertices[(c * 3) + 0], vertices[(c * 3) + 1], vertices[(c * 3) + 2]);
                    const vecD = new THREE$1.Vector3(vertices[(d * 3) + 0], vertices[(d * 3) + 1], vertices[(d * 3) + 2]);
                    const triangleABD = new THREE$1.Triangle(vecA, vecB, vecD);
                    const triangleBCD = new THREE$1.Triangle(vecB, vecC, vecD);
                    if (triangleABD.getArea() > 0.0001) { indices.push(a, b, d); groupCount += 3; }
                    if (triangleBCD.getArea() > 0.0001) { indices.push(b, c, d); groupCount += 3; }
                }
            }
            scope.addGroup(groupStart, groupCount, 0);
            groupStart += groupCount;
        }
        function generateCap(top) {
            const centerIndexStart = index;
            const uv = new THREE$1.Vector2();
            const vertex = new THREE$1.Vector3();
            let groupCount = 0;
            const radius = (top === true) ? radiusTop : radiusBottom;
            const sign = (top === true) ? 1 : -1;
            for (let x = 1; x <= radialSegments; x++) {
                vertices.push(0, halfHeight * sign, 0);
                normals.push(0, sign, 0);
                uvs.push(0.5, 0.5);
                index++;
            }
            const centerIndexEnd = index;
            for ( let x = 0; x <= radialSegments; x ++ ) {
                const u = x / radialSegments;
                const theta = u * thetaLength + thetaStart;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                vertex.x = radius * sinTheta;
                vertex.y = halfHeight * sign;
                vertex.z = radius * cosTheta;
                vertices.push(vertex.x, vertex.y, vertex.z);
                normals.push(0, sign, 0);
                uv.x = (cosTheta * 0.5) + 0.5;
                uv.y = (sinTheta * 0.5 * sign) + 0.5;
                uvs.push(uv.x, uv.y);
                index++;
            }
            for (let x = 0; x < radialSegments; x++) {
                const c = centerIndexStart + x;
                const i = centerIndexEnd + x;
                if (top === true) {
                    indices.push(i, i + 1, c);
                } else {
                    indices.push(i + 1, i, c);
                }
                groupCount += 3;
            }
            scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);
            groupStart += groupCount;
        }
    }
    static fromJSON(data) {
        return new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
    }
}

class PrismGeometry extends THREE$1.ExtrudeGeometry {
    constructor(vertices, height) {
        const shape = new THREE$1.Shape();
        shape.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            shape.lineTo(vertices[i].x, vertices[i].y);
        }
        shape.lineTo(vertices[0].x, vertices[0].y);
        const extrudeSettings = {
            steps: 2,
            depth: height,
            bevelEnabled: false,
        };
        super(shape, extrudeSettings);
        this.vertices = vertices;
        this.height = height;
    }
    clone() {
        return new this.constructor(this.vertices, this.height).copy(this);
    }
}

class BasicLine extends THREE$1.LineSegments {
    constructor(x1, y1, z1, x2, y2, z2, boxColor = 0xffffff) {
        const vertices = [
            x1, y1, z1,
            x2, y2, z2,
        ];
        const indices = [ 0, 1 ];
        const lineGeometry = new THREE$1.BufferGeometry();
        lineGeometry.setIndex(indices);
        lineGeometry.setAttribute('position', new THREE$1.Float32BufferAttribute(vertices, 3 ));
        const lineMaterial = new THREE$1.LineBasicMaterial({
            color: boxColor,
            alphaToCoverage: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            side: THREE$1.DoubleSide,
            transparent: true,
        });
        super(lineGeometry, lineMaterial);
    }
    clone() {
        const array = this.geometry.attributes.position.array;
        array[0] = point1.x; array[1] = point1.y; array[2] = point1.z;
        array[3] = point2.x; array[4] = point2.y; array[5] = point2.z;
        return new this.constructor(array[0], array[1], array[2], array[3], array[4], array[5]).copy(this, true);
    }
    setPoints(point1, point2) {
        Vectors.sanity(point1);
        Vectors.sanity(point2);
        const array = this.geometry.attributes.position.array;
        array[0] = point1.x; array[1] = point1.y; array[2] = point1.z;
        array[3] = point2.x; array[4] = point2.y; array[5] = point2.z;
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingSphere();
    }
}

const _box$2 = new THREE$1.Box3();
const _objQuaternion = new THREE$1.Quaternion();
const _objScale = new THREE$1.Vector3();
const _objPosition = new THREE$1.Vector3();
const _indices$1 = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);
class BasicWireBox extends THREE$1.LineSegments {
    constructor(object, color = 0xffffff, opacity = 1.0) {
        const lineGeometry = new THREE$1.WireframeGeometry();
        const lineMaterial = new THREE$1.LineBasicMaterial({
            color: color,
            opacity: opacity,
            alphaToCoverage: true,
            depthTest: false,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            side: THREE$1.DoubleSide,
            transparent: true,
        });
        super(lineGeometry, lineMaterial);
        this.positions = new Float32Array(8 * 3);
        if (object && object.isObject3D) {
            const updateObject = object.clone();
            updateObject.lookAtCamera = false;
            updateObject.position.set(0, 0, 0);
            updateObject.rotation.set(0, 0, 0);
            updateObject.quaternion.set(0, 0, 0, 1);
            updateObject.scale.set(1, 1, 1);
            updateObject.matrix.compose(updateObject.position, updateObject.quaternion, updateObject.scale);
            updateObject.matrixWorld.copy(updateObject.matrix);
            updateObject.matrixAutoUpdate = false;
            _box$2.setFromObject(updateObject, true );
            ObjectUtils.clearObject(updateObject);
            Vectors.sanity(_box$2.min);
            Vectors.sanity(_box$2.max);
        } else {
            _box$2.set(new THREE$1.Vector3(-0.5, -0.5, -0.5), new THREE$1.Vector3(0.5, 0.5, 0.5));
        }
        const min = _box$2.min;
        const max = _box$2.max;
        const array = this.positions;
        array[ 0] = max.x; array[ 1] = max.y; array[ 2] = max.z;
        array[ 3] = min.x; array[ 4] = max.y; array[ 5] = max.z;
        array[ 6] = min.x; array[ 7] = min.y; array[ 8] = max.z;
        array[ 9] = max.x; array[10] = min.y; array[11] = max.z;
        array[12] = max.x; array[13] = max.y; array[14] = min.z;
        array[15] = min.x; array[16] = max.y; array[17] = min.z;
        array[18] = min.x; array[19] = min.y; array[20] = min.z;
        array[21] = max.x; array[22] = min.y; array[23] = min.z;
        const positions = [];
        for (let i = _indices$1.length - 1; i > 0; i -= 2) {
            const index1 = (_indices$1[i - 0]) * 3;
            const index2 = (_indices$1[i - 1]) * 3;
            positions.push(array[index1 + 0], array[index1 + 1], array[index1 + 2]);
            positions.push(array[index2 + 0], array[index2 + 1], array[index2 + 2]);
        }
        this.geometry.setAttribute('position', new THREE$1.Float32BufferAttribute(positions, 3));
        this.clone = function() {
            const clone = new this.constructor(object, color, opacity);
            ObjectUtils.copyTransform(this, clone);
            return clone;
        };
    }
    getLocalPoints() {
        const points = [];
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            const point = new THREE$1.Vector3();
            point.x = this.positions[index + 0];
            point.y = this.positions[index + 1];
            point.z = this.positions[index + 2];
            points[i] = point;
        }
        return points;
    }
    getBox3(targetBox3) {
        targetBox3 = targetBox3 ?? new THREE$1.Box3();
        targetBox3.min.x = this.positions[(6 * 3)  + 0];
        targetBox3.min.y = this.positions[(6 * 3)  + 1];
        targetBox3.min.z = this.positions[(6 * 3)  + 2];
        targetBox3.max.x = this.positions[(0 * 3)  + 0];
        targetBox3.max.y = this.positions[(0 * 3)  + 1];
        targetBox3.max.z = this.positions[(0 * 3)  + 2];
    }
}

function setWireframeMaterialDefaults(material) {
    material.transparent = true;
    material.depthTest = true;
    material.depthWrite = false;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.side = THREE$1.DoubleSide;
    material.alphaToCoverage = true;
}
class BasicWireframe extends THREE$1.LineSegments {
    constructor(object, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
        const wireframeGeometry = new THREE$1.WireframeGeometry(object.geometry);
        const lineMaterial = new THREE$1.LineBasicMaterial({
            color: wireframeColor,
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        super(wireframeGeometry, lineMaterial);
        if (copyObjectTransform) {
            this.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
            this.scale.set(object.scale.x, object.scale.y, object.scale.z);
            this.position.set(object.position.x, object.position.y, object.position.z);
        }
        this.clone = function() {
            return new this.constructor(object, wireframeColor, opacity, copyObjectTransform).copy(this, true);
        };
    }
}
class FatWireframe extends Wireframe {
    constructor(object, lineWidth, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
        const wireframeGeometry = new WireframeGeometry2(object.geometry);
        const lineMaterial = new LineMaterial({
            color: wireframeColor,
            linewidth: lineWidth,
            resolution: new THREE$1.Vector2(500, 500),
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.depthTest = false;
        material.resolution = new THREE$1.Vector2(1024, 1024);
        super(wireframeGeometry, lineMaterial);
        if (copyObjectTransform) {
            this.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
            this.scale.set(object.scale.x, object.scale.y, object.scale.z);
            this.position.set(object.position.x, object.position.y, object.position.z);
        }
        this.clone = function() {
            return new this.constructor(object, lineWidth, wireframeColor, opacity, copyObjectTransform).copy(this, true);
        };
    }
}

class FatLine extends Line2 {
    constructor(x1, y1, z1, x2, y2, z2, lineWidth = 1, boxColor = 0xffffff) {
        const positions = [ x1, y1, z1, x2, y2, z2 ];
        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(positions);
        const lineMaterial = new LineMaterial({
            color: boxColor,
            linewidth: lineWidth,
            alphaToCoverage: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            side: THREE$1.DoubleSide,
            transparent: true,
        });
        lineMaterial.resolution = new THREE$1.Vector2(1024, 1024);
        super(lineGeometry, lineMaterial);
        this.computeLineDistances();
        this.scale.set(1, 1, 1);
        this.point1 = new THREE$1.Vector3(x1, y1, z1);
        this.point2 = new THREE$1.Vector3(x2, y2, z2);
    }
    clone() {
        return new this.constructor(
            this.point1.x, this.point1.y, this.point1.z,
            this.point2.x, this.point2.y, this.point2.z,
            this.material.linewidth, this.material.color).copy(this, true);
    }
    setPoints(point1, point2) {
        Vectors.sanity(point1);
        Vectors.sanity(point2);
        this.point1.copy(point1);
        this.point2.copy(point2);
        const positions = [ point1.x, point1.y, point1.z, point2.x, point2.y, point2.z ];
        this.geometry.setPositions(positions);
        this.computeLineDistances();
    }
}

const _box$1 = new THREE$1.Box3();
const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);
const _tempScale = new THREE$1.Vector3();
const _tempSize = new THREE$1.Vector3();
class FatWireBox extends Line2 {
    constructor(object, linewidth = 1, color = 0xffffff, opacity = 1.0) {
        const lineGeometry = new LineSegmentsGeometry();
        const lineMaterial = new LineMaterial({
            color: color,
            linewidth: linewidth,
            opacity: opacity,
            alphaToCoverage: true,
            depthTest: false,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            side: THREE$1.DoubleSide,
            transparent: true,
        });
        lineMaterial.resolution = new THREE$1.Vector2(1024, 1024);
        super(lineGeometry, lineMaterial);
        this.positions = new Float32Array(8 * 3);
        if (object && object.isObject3D) {
            const updateObject = object.clone();
            updateObject.lookAtCamera = false;
            updateObject.position.set(0, 0, 0);
            updateObject.rotation.set(0, 0, 0);
            updateObject.quaternion.set(0, 0, 0, 1);
            updateObject.scale.set(1, 1, 1);
            updateObject.matrix.compose(updateObject.position, updateObject.quaternion, updateObject.scale);
            updateObject.matrixWorld.copy(updateObject.matrix);
            updateObject.matrixAutoUpdate = false;
            _box$1.setFromObject(updateObject, true );
            ObjectUtils.clearObject(updateObject);
            Vectors.sanity(_box$1.min);
            Vectors.sanity(_box$1.max);
        } else {
            _box$1.set(new THREE$1.Vector3(-0.5, -0.5, -0.5), new THREE$1.Vector3(0.5, 0.5, 0.5));
        }
        const min = _box$1.min;
        const max = _box$1.max;
        const array = this.positions;
        array[ 0] = max.x; array[ 1] = max.y; array[ 2] = max.z;
        array[ 3] = min.x; array[ 4] = max.y; array[ 5] = max.z;
        array[ 6] = min.x; array[ 7] = min.y; array[ 8] = max.z;
        array[ 9] = max.x; array[10] = min.y; array[11] = max.z;
        array[12] = max.x; array[13] = max.y; array[14] = min.z;
        array[15] = min.x; array[16] = max.y; array[17] = min.z;
        array[18] = min.x; array[19] = min.y; array[20] = min.z;
        array[21] = max.x; array[22] = min.y; array[23] = min.z;
        const positions = [];
        for (let i = _indices.length - 1; i > 0; i -= 2) {
            const index1 = (_indices[i - 0]) * 3;
            const index2 = (_indices[i - 1]) * 3;
            positions.push(array[index1 + 0], array[index1 + 1], array[index1 + 2]);
            positions.push(array[index2 + 0], array[index2 + 1], array[index2 + 2]);
        }
        this.geometry.setPositions(positions);
        this.clone = function() {
            const clone = new this.constructor(object, linewidth, color, opacity);
            ObjectUtils.copyTransform(this, clone);
            return clone;
        };
    }
    getLocalPoints() {
        const points = [];
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            const point = new THREE$1.Vector3();
            point.x = this.positions[index + 0];
            point.y = this.positions[index + 1];
            point.z = this.positions[index + 2];
            points[i] = point;
        }
        return points;
    }
    getAbsoluteSize(target) {
        this.getSize(target);
        target.x = Math.abs(target.x);
        target.y = Math.abs(target.y);
        target.z = Math.abs(target.z);
    }
    getAverageSize() {
        this.getSize(_tempSize);
        return ((_tempSize.x + _tempSize.y + _tempSize.z) / 3.0);
    }
    getBox3(targetBox3) {
        targetBox3 = targetBox3 ?? new THREE$1.Box3();
        targetBox3.min.x = this.positions[(6 * 3)  + 0];
        targetBox3.min.y = this.positions[(6 * 3)  + 1];
        targetBox3.min.z = this.positions[(6 * 3)  + 2];
        targetBox3.max.x = this.positions[(0 * 3)  + 0];
        targetBox3.max.y = this.positions[(0 * 3)  + 1];
        targetBox3.max.z = this.positions[(0 * 3)  + 2];
    }
    getSize(target) {
        this.getBox3(_box$1);
        this.getWorldScale(_tempScale);
        target.x = (_box$1.max.x - _box$1.min.x) * Math.abs(_tempScale.x);
        target.y = (_box$1.max.y - _box$1.min.y) * Math.abs(_tempScale.y);
        target.z = (_box$1.max.z - _box$1.min.z) * Math.abs(_tempScale.z);
    }
    getMaxSize() {
        this.getSize(_tempSize);
        return Math.max(Math.max(_tempSize.x, _tempSize.y), _tempSize.z);
    }
}

const SCALE = 500;
const SkyShader = {
    uniforms: {
        'uSky':     { value: new THREE$1.Color(0.00, 0.85, 0.80) },
        'uHorizon': { value: new THREE$1.Color(1.00, 0.75, 0.50) },
        'uGround':  { value: new THREE$1.Color(0.90, 0.70, 0.50) },
        'uScale':   { value: SCALE },
    },
    vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform vec3    uSky;
        uniform vec3    uHorizon;
        uniform vec3    uGround;
        uniform float   uScale;
        varying vec3    vWorldPosition;

        void main() {
            float lowerGround =         0.0;
            float h = normalize(vWorldPosition + lowerGround).y;

            // Sky fade (brighten at horizon)
            float skyFade = pow(vWorldPosition.y / (uScale * 0.25), 0.4);
            skyFade = clamp(skyFade, 0.0, 1.0);
            vec3 sky = mix(uHorizon, uSky, skyFade);

            // Seperates ground and sky, solid horizon: clamp(h * uScale, 0.0, 1.0)
            float blurHorizon =         0.05;
            float compressHorizon =     5.0;
            float skyMix = max(pow(max(h, 0.0), blurHorizon) * compressHorizon, 0.0);
            skyMix = clamp(skyMix, 0.0, 1.0);
            vec3 outColor = mix(uGround, sky, skyMix);

            // Output Color
            gl_FragColor = vec4(outColor, 1.0);
        }`,
};
class SkyObject extends THREE$1.Mesh {
    constructor() {
        super(new THREE$1.SphereGeometry(1), new THREE$1.ShaderMaterial({
            name:           'SkyShader',
            fragmentShader: SkyShader.fragmentShader,
            vertexShader:   SkyShader.vertexShader,
            uniforms:       THREE$1.UniformsUtils.clone(SkyShader.uniforms),
            side:           THREE$1.BackSide,
            depthTest:      false,
            depthWrite:     false,
        }));
        this.isSky = true;
        this.baseScale = SCALE;
        this.scale.setScalar(this.baseScale);
    }
    copy(source, recursive) {
        super.copy(source, recursive);
        this.baseScale = source.baseScale;
        this.scale.setScalar(this.baseScale);
        return this;
    }
}

const _clearColor = new THREE$1.Color(0xffffff);
const _materialCache = [];
const _currClearColor = new THREE$1.Color();
let _emptyScene;
let _renderer;
class GpuPickerPass extends Pass {
    constructor(scene, camera) {
        super();
        const self = this;
        this.scene = scene;
        this.camera = camera;
        this.overrideMaterial = undefined;
        this.clearColor = undefined;
        this.clearAlpha = 0;
        this.clear = false;
        this.clearDepth = false;
        this.needsSwap = false;
        this.renderDebugView = false;
        this.needPick = false;
        this.x = 0;
        this.y = 0;
        this.pickedId = -1;
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = 64;
        spriteCanvas.height = 64;
        const ctx = spriteCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        const spriteMap = new THREE$1.CanvasTexture(spriteCanvas);
        this.spriteMap = spriteMap;
        _emptyScene = new THREE$1.Scene();
        _emptyScene.onAfterRender = renderList;
        this.pickingTarget = new THREE$1.WebGLRenderTarget(1, 1, {
            minFilter: THREE$1.NearestFilter,
            magFilter: THREE$1.NearestFilter,
            format: THREE$1.RGBAFormat,
            colorSpace: THREE$1.LinearSRGBColorSpace
        });
        this.pixelBuffer = new Uint8Array(4 * this.pickingTarget.width * this.pickingTarget.height);
        function renderList() {
            const renderList = _renderer.renderLists.get(self.scene, 0);
            renderList.opaque.forEach(processItem);
            renderList.transmissive.forEach(processItem);
            renderList.transparent.forEach(processItem);
        }
        function processItem(renderItem) {
            const object = renderItem.object;
            if (!object || !object.isObject3D) return;
            if (!object.visible) return;
            if (object.locked) return;
            if (object.userData.flagIgnore) return;
            const objID = object.id;
            const material = object.material;
            const geometry = object.geometry;
            let useMorphing = 0;
            if (material.morphTargets && geometry.isBufferGeometry) {
                useMorphing = (geometry.morphAttributes.position.length > 0) ? 1 : 0;
            }
            const useSkinning = (object.isSkinnedMesh) ? 1 : 0;
            const useInstancing = (object.isInstancedMesh === true) ? 1 : 0;
            const frontSide = (material.side === THREE$1.FrontSide) ? 1 : 0;
            const backSide = (material.side === THREE$1.BackSide) ? 1 : 0;
            const doubleSide = (material.side === THREE$1.DoubleSide) ? 1 : 0;
            const sprite = (material.isSpriteMaterial) ? 1 : 0;
            const index =
                (useMorphing << 0) |
                (useSkinning << 1) |
                (useInstancing << 2) |
                (frontSide << 3) |
                (backSide << 4) |
                (doubleSide << 5) |
                (sprite << 6);
            let renderMaterial = _materialCache[index];
            if (!renderMaterial) {
                renderMaterial = new THREE$1.ShaderMaterial({
                    defines: { USE_UV: '', USE_LOGDEPTHBUF: '' },
                    vertexShader: THREE$1.ShaderChunk.meshbasic_vert,
                    fragmentShader: `
                        #include <common>

                        varying vec2 vUv;

                        uniform float opacity;
                        uniform sampler2D map;
                        uniform vec4 objectId;
                        uniform float useMap;

                        #include <logdepthbuf_pars_fragment>

                        void main() {
                            #include <logdepthbuf_fragment>

                            gl_FragColor = objectId;

                            if (opacity < 0.05) discard;
                            if (useMap > 0.0) {
                                vec4 texelColor = texture2D(map, vUv);
                                if (texelColor.a < 0.05) discard;
                            }
                        }
                    `,
                    fog: false,
                    lights: false,
                    side: (object.isSprite) ? THREE$1.DoubleSide : THREE$1.FrontSide,
                });
                renderMaterial.uniforms = {
                    opacity: { value: 1.0 },
                    map: { value: undefined },
                    uvTransform: { value: new THREE$1.Matrix3() },
                    objectId: { value: [ 1.0, 1.0, 1.0, 1.0 ] },
                    useMap: { value: 0.0 },
                };
                renderMaterial.side = material.side;
                renderMaterial.skinning = (useSkinning > 0);
                renderMaterial.morphTargets = (useMorphing > 0);
                _materialCache[index] = renderMaterial;
            }
            renderMaterial.uniforms.objectId.value = [
                (objID >> 0 & 255) / 255,
                (objID >> 8 & 255) / 255,
                (objID >> 16 & 255) / 255,
                (objID >> 24 & 255) / 255,
            ];
            renderMaterial.uniforms.useMap.value = (material.map) ? 1.0 : 0.0;
            if (material.map) {
                renderMaterial.uniforms.map.value = (object.isSpriteHelper) ? spriteMap : material.map;
            }
            renderMaterial.uniformsNeedUpdate = true;
            _renderer.renderBufferDirect(self.camera, self.scene, geometry, renderMaterial, object, null);
        }
    }
    dispose() {
        if (this.pickingTarget && this.pickingTarget.dispose) this.pickingTarget.dispose();
        if (this.spriteMap && this.spriteMap.dispose) this.spriteMap.dispose();
        console.warn('GpuPickerPass: Instance was disposed!');
    }
    render(renderer, writeBuffer, readBuffer ) {
        if (this.needPick === false && this.renderDebugView === false) return;
        _renderer = renderer;
        const camWidth = renderer.domElement.width;
        const camHeight = renderer.domElement.height;
        this.camera.setViewOffset(camWidth, camHeight, this.x, this.y, 1, 1);
        const currRenderTarget = renderer.getRenderTarget();
        const currAlpha = renderer.getClearAlpha();
        renderer.getClearColor(_currClearColor);
        renderer.setRenderTarget(this.pickingTarget);
        renderer.setClearColor(_clearColor);
        renderer.clear();
        renderer.render(_emptyScene, this.camera);
        renderer.readRenderTargetPixels(this.pickingTarget, 0, 0, this.pickingTarget.width, this.pickingTarget.height, this.pixelBuffer);
        renderer.setRenderTarget(currRenderTarget);
        this.camera.clearViewOffset();
        if (this.renderDebugView) renderer.render(_emptyScene, this.camera);
        renderer.setClearColor(_currClearColor, currAlpha);
        if (this.needPick) {
            this.pickedId = this.pixelBuffer[0] + (this.pixelBuffer[1] << 8) + (this.pixelBuffer[2] << 16) + (this.pixelBuffer[3] << 24);
            this.needPick = false;
        }
    }
    renderPickScene(renderer, camera) {
        _renderer = renderer;
        const currAlpha = renderer.getClearAlpha();
        renderer.getClearColor(_currClearColor);
        renderer.setClearColor(_clearColor);
        renderer.clear();
        renderer.render(_emptyScene, camera);
        renderer.setClearColor(_currClearColor, currAlpha);
    }
}

const boxGeometry = new THREE$1.BoxGeometry(0.5, 0.5, 0.5);
const circleShape = new THREE$1.Shape().absarc(0, 0, 0.5 );
const wedgeShape = new THREE$1.Shape([
    new THREE$1.Vector2(-0.5,  0.5),
    new THREE$1.Vector2(-0.5, -0.5),
    new THREE$1.Vector2( 0.5, -0.5),
]);
class Geometry {
    init(data = {}) {
        if (data.isBufferGeometry) {
            const assetUUID = data.uuid;
            AssetManager$1.addAsset(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        }
        let geometry = undefined;
        switch (data.style) {
            case 'asset':
                const assetGeometry = AssetManager$1.getAsset(data.asset);
                if (assetGeometry && assetGeometry.isBufferGeometry) {
                    geometry = assetGeometry;
                }
                break;
            case 'box':
                geometry = new THREE$1.BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
                break;
            case 'capsule':
                const capRadiusTop = Maths.clamp(data.radiusTop, 0.1, data.height) / 1.5;
                const capRadiusBottom = Maths.clamp(data.radiusBottom, 0.1, data.height) / 1.5;
                const capHeight = data.height / 1.5;
                geometry = new CapsuleGeometry(
                    capRadiusTop, capRadiusBottom, capHeight,
                    data.radialSegments, data.heightSegments,
                    data.capSegments, data.capSegments,
                    data.thetaStart, data.thetaLength);
                geometry = GeometryUtils.uvMapSphere(geometry, 'v');
                break;
            case 'circle':
                geometry = new THREE$1.CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);
                break;
            case 'cone':
                geometry = new CylinderGeometry(0, data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                break;
            case 'cylinder':
                geometry = new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                break;
            case 'lathe':
                const points = [];
                let latheShape = AssetManager$1.getAsset(data.shape);
                if (!latheShape || latheShape.type !== 'Shape') {
                    for (let i = 0; i < 2.5; i += 0.1) {
                        points.push(new THREE$1.Vector2(Math.abs(Math.cos(i) * 0.4) + 0.2, i * 0.4));
                    }
                } else {
                    const shapePoints = latheShape.getPoints(data.segments);
                    for (let i = 0; i < shapePoints.length; i++) {
                        points.push(new THREE$1.Vector2(shapePoints[i].x, shapePoints[i].y));
                    }
                }
                geometry = new THREE$1.LatheGeometry(points, data.segments, 0, data.phiLength);
                geometry.center();
                break;
            case 'plane':
                geometry = new THREE$1.PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
                break;
            case 'platonicSolid':
                switch (data.polyhedron) {
                    case 'dodecahedron': geometry = new THREE$1.DodecahedronGeometry(data.radius, data.detail); break;
                    case 'icosahedron': geometry = new THREE$1.IcosahedronGeometry(data.radius, data.detail); break;
                    case 'octahedron': geometry = new THREE$1.OctahedronGeometry(data.radius, data.detail); break;
                    case 'tetrahedron': geometry = new THREE$1.TetrahedronGeometry(data.radius, data.detail); break;
                    default: geometry = new THREE$1.DodecahedronGeometry(data.radius, data.detail); break;
                }
                break;
            case 'ring':
                geometry = new THREE$1.RingGeometry(data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength);
                break;
            case 'roundedBox':
                geometry = new RoundedBoxGeometry(data.width, data.height, data.depth, data.segments, data.radius);
                break;
            case 'shape':
                let shape = AssetManager$1.getAsset(data.shape);
                if (!shape || shape.type !== 'Shape') {
                    shape = wedgeShape;
                }
                const options = {
                    depth: data.depth,
                    curveSegments: data.curveSegments,
                    steps: data.steps,
                    bevelEnabled: data.bevelEnabled,
                    bevelThickness: data.bevelThickness,
                    bevelSize: data.bevelSize,
                    bevelSegments: data.bevelSegments,
                };
                geometry = new THREE$1.ExtrudeGeometry(shape, options);
                geometry.center();
                break;
            case 'sphere':
                geometry = new THREE$1.SphereGeometry(data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength);
                break;
            case 'torus':
                geometry = new THREE$1.TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc);
                break;
            case 'torusKnot':
                geometry = new THREE$1.TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q);
                break;
            case 'tube':
                let tubeShape = AssetManager$1.getAsset(data.shape);
                if (!tubeShape || tubeShape.type !== 'Shape') {
                    tubeShape = circleShape;
                }
                const path3D = new THREE$1.CurvePath();
                const arcPoints = tubeShape.getPoints(Math.max(256, data.tubularSegments * 4));
                for (let i = 0; i < arcPoints.length - 1; i++) {
                    const pointA = arcPoints[i];
                    const pointB = arcPoints[i + 1];
                    path3D.curves.push(
                        new THREE$1.LineCurve3(
                            new THREE$1.Vector3(pointA.x, pointA.y, 0),
                            new THREE$1.Vector3(pointB.x, pointB.y, 0),
                        ),
                    );
                }
                geometry = new THREE$1.TubeGeometry(path3D, data.tubularSegments, data.radius, data.radialSegments, data.closed);
                geometry.center();
                break;
            default:
                console.error('Geometry Component: Invalid style ' + data.style);
        }
        if (geometry && geometry.isBufferGeometry) {
            const geometryName = geometry.constructor.name;
            if (data.simplify < 1) {
                const simplifyModifier = new SimplifyModifier();
                const count = Math.max(3.0, Math.floor(geometry.attributes.position.count * (1.0 - data.simplify)));
                let simplifiedGeometry = simplifyModifier.modify(geometry, count);
                if (simplifiedGeometry) {
                    geometry.dispose();
                    geometry = simplifiedGeometry;
                }
            }
            const subdivideParams = {
                split: data.edgeSplit ?? false,
                uvSmooth: data.uvSmooth ?? false,
                flatOnly: data.flatOnly ?? false,
                preserveEdges: false,
                maxTriangles: 25000,
            };
            if (subdivideParams.split || data.subdivide > 0) {
                let subdividedGeometry = LoopSubdivision.modify(geometry, data.subdivide, subdivideParams);
                if (subdividedGeometry) {
                    geometry.dispose();
                    geometry = subdividedGeometry;
                }
            }
            if (data.textureMapping === 'cube') {
                geometry = GeometryUtils.uvMapCube(geometry);
            } else if (data.textureMapping === 'sphere') {
                geometry = GeometryUtils.uvMapSphere(geometry);
            }
            if (Array.isArray(data.textureWrap)) {
                if (data.textureWrap[0] !== 1 || data.textureWrap[1] !== 1) {
                    const s = Math.max(data.textureWrap[0], 0);
                    const t = Math.max(data.textureWrap[1], 0);
                    GeometryUtils.repeatTexture(geometry, s, t);
                }
            }
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
        modifierDivider: { type: 'divider' },
        simplify: { type: 'slider', default: 1, min: 0, max: 1 },
        subdivide: { type: 'slider', default: 0, min: 0, max: 3, step: 1, precision: 0, rebuild: true },
        edgeSplit: { type: 'boolean', default: false, hide: { subdivide: [ 0 ] } },
        uvSmooth: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        flatOnly: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        textureDivider: { type: 'divider' },
        textureMapping: [
            { type: 'select', default: 'cube', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'shape' ] } },
            { type: 'select', default: 'none', select: [ 'none', 'cube', 'sphere' ], not: { style: [ 'shape' ] } },
        ],
        textureWrap: { type: 'vector', size: 2, tint: false, default: [ 1, 1 ], min: 0, step: 0.2, precision: 2, label: [ 'X', 'Y' ] },
    },
    icon: ``,
    color: 'rgb(255, 113, 0)',
    multiple: false,
    dependencies: [ 'material' ],
    group: [ 'Entity3D' ],
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
            AssetManager$1.addAsset(data);
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
                        AssetManager$1.addAsset(value);
                    } else {
                        const textureCheck = AssetManager$1.getAsset(value);
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
            if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE$1.BasicDepthPacking;
            if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE$1.RGBADepthPacking;
        }
        let material = undefined;
        switch (data.style) {
            case 'asset':
                const assetMaterial = AssetManager$1.getAsset(data.asset);
                if (assetMaterial && assetMaterial.isMaterial) {
                    material = assetMaterial.clone();
                }
                break;
            case 'basic': material = new THREE$1.MeshBasicMaterial(parameters); break;
            case 'depth': material = new THREE$1.MeshDepthMaterial(parameters); break;
            case 'lambert': material = new THREE$1.MeshLambertMaterial(parameters); break;
            case 'matcap': material = new THREE$1.MeshMatcapMaterial(parameters); break;
            case 'normal': material = new THREE$1.MeshNormalMaterial(parameters); break;
            case 'phong': material = new THREE$1.MeshPhongMaterial(parameters); break;
            case 'physical': material = new THREE$1.MeshPhysicalMaterial(parameters); break;
            case 'points': material = new THREE$1.PointsMaterial(parameters); break;
            case 'shader': material = new THREE$1.ShaderMaterial(parameters); break;
            case 'standard': material = new THREE$1.MeshStandardMaterial(parameters); break;
            default:
                console.error(`Material Component: Invalid style '${data.style}'`);
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
    group: [ 'Entity3D' ],
};
ComponentManager.register('material', Material);
function extendMaterial(material, data = { style: 'basic', premultiplyAlpha: true }) {
    if (!material || !material.isMaterial) return;
    const wantsOpaque = (data && data.opacity === 1.0 && data.map === undefined);
    material.transparent = !wantsOpaque;
    material.alphaTest = 0.01;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.onBeforeCompile = function(shader) {
        if (data.premultiplyAlpha && shader.fragmentShader) {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <premultiplied_alpha_fragment>',
                'gl_FragColor.rgba *= gl_FragColor.a;'
            );
        }
    };
    if (data.premultiplyAlpha) {
        material.blending = THREE$1.CustomBlending;
        material.blendEquation = THREE$1.AddEquation;
        material.blendSrc = THREE$1.OneFactor;
        material.blendDst = THREE$1.OneMinusSrcAlphaFactor;
        material.blendEquationAlpha = THREE$1.AddEquation;
        material.blendSrcAlpha = THREE$1.OneFactor;
        material.blendDstAlpha = THREE$1.OneMinusSrcAlphaFactor;
    }
    material.needsUpdate = true;
    return material;
}
function refreshMesh(component) {
    if (component.entity && component.mesh) {
        component.entity.remove(component.mesh);
        ObjectUtils.clearObject(component.mesh);
        component.mesh = undefined;
    }
    if (!component.attached) return;
    if (!component.backend || !component.backend.isMaterial) return;
    const material = component.backend.clone();
    extendMaterial(material, component.toJSON());
    const geometryComponent = component.entity.getComponent('geometry');
    if (!geometryComponent) return;
    if (!geometryComponent.attached) return;
    const geometry = geometryComponent.backend;
    if (!geometry) return;
    if (component.data && component.data.style === 'points') {
        const pointGeometry = geometry.clone();
        if (!component.data.useUv) pointGeometry.deleteAttribute('uv');
        component.mesh = new THREE$1.Points(pointGeometry, material);
        pointGeometry.dispose();
    } else {
        component.mesh = new THREE$1.Mesh(geometry, material);
        component.mesh.castShadow = component.entity.castShadow;
        component.mesh.receiveShadow = component.entity.receiveShadow;
    }
    component.mesh.name = `Backend Object3D for ${component.entity.name}`;
    const isGlass = component.backend.isMeshPhysicalMaterial === true && component.backend.transmission > 0;
    if (isGlass) component.backend.envMap = hdrEquirect;
    if (component.backend.opacity < 0.05) {
        if (!SceneManager.app || !SceneManager.app.isPlaying) {
            material.map = null;
            material.opacity = 0.25;
            material.wireframe = true;
            component.mesh.castShadow = false;
        }
    }
    if (component.entity && component.mesh) component.entity.add(component.mesh);
}

class Mesh {
    init(data = {}) {
        const mesh = (data.isObject3D) ? data : new THREE$1.Object3D();
        mesh.traverse((child) => { child.castShadow = this.entity.castShadow; });
        mesh.traverse((child) => { child.receiveShadow = this.entity.receiveShadow; });
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
    group: [ 'Entity3D' ],
};
ComponentManager.register('mesh', Mesh);

const styles = [ 'fixed', 'dynamic', 'kinematic' ];
const colliders = [ 'auto', 'ball', 'capsule', 'cone', 'cuboid', 'cylinder' ];
const automatic = [ 'box', 'sphere', 'hull', 'mesh' ];
const _box = new THREE$1.Box3();
const _center = new THREE$1.Vector3();
const _quaternion = new THREE$1.Quaternion();
const _matrix = new THREE$1.Matrix4();
const _position = new THREE$1.Vector3();
const _scale = new THREE$1.Vector3();
const _size = new THREE$1.Vector3();
const _zero = new THREE$1.Vector3();
class Rigidbody {
    init(data = {}) {
        let rigidbody = undefined;
        this.backend = rigidbody;
        this.data = data;
    }
    onLoad() {
        const world = SceneManager.app?.scene?.physics?.backend;
        const entity = this.entity;
        const data = this.data ?? {};
        if (!world || !entity) return;
        let rigidbodyDesc = undefined;
        switch (data.style) {
            case 'dynamic':
                rigidbodyDesc = RAPIER.RigidBodyDesc.dynamic();
                break;
            case 'kinematic':
                rigidbodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
                break;
            case 'fixed':
            default:
                rigidbodyDesc = RAPIER.RigidBodyDesc.fixed();
        }
        rigidbodyDesc.setTranslation(...entity.position);
        rigidbodyDesc.setRotation(entity.quaternion);
        if (data.style === 'dynamic' || data.style === 'kinematic') {
            if (data.ccdEnabled != undefined) rigidbodyDesc.setCcdEnabled(Boolean(data.ccdEnabled));
            const velocity = data.linearVelocity;
            const angular = data.angularVelocity;
            if (Array.isArray(velocity) && velocity.length > 2) rigidbodyDesc.setLinvel(velocity[0], velocity[1], velocity[2]);
            if (Array.isArray(angular) && angular.length > 2) rigidbodyDesc.setAngvel({ x: angular[0], y: angular[1], z: angular[2] });
        }
        if (data.style === 'dynamic') {
            if (data.canSleep != undefined) rigidbodyDesc.setCanSleep(Boolean(data.canSleep));
            if (data.addMass != undefined) rigidbodyDesc.setAdditionalMass(parseFloat(data.addMass));
            if (data.gravityScale != undefined) rigidbodyDesc.setGravityScale(parseFloat(data.gravityScale));
            const linear = data.linearEnabled;
            const rotate = data.rotateEnabled;
            if (Array.isArray(linear) && linear.length > 2) rigidbodyDesc.enabledTranslations(linear[0], linear[1], linear[2]);
            if (Array.isArray(rotate) && rotate.length > 2) rigidbodyDesc.enabledRotations(rotate[0], rotate[1], rotate[2]);
            if (data.linearDamping != undefined) rigidbodyDesc.setLinearDamping(parseFloat(data.linearDamping));
            if (data.angularDamping != undefined) rigidbodyDesc.setAngularDamping(parseFloat(data.angularDamping));
        }
        const rigidbody = world.createRigidBody(rigidbodyDesc);
        this.backend = rigidbody;
        function addColliderToRigidBody(colliderDesc) {
            colliderDesc.setDensity((data.density != undefined) ? data.density : 1.0);
            colliderDesc.setFriction(data.friction);
            colliderDesc.setRestitution(data.bounce ?? 0);
            const collider = world.createCollider(colliderDesc, rigidbody);
            if (data.style === 'dynamic' || data.style === 'kinematic') {
                collider.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT | RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED);
                collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
            }
        }
        if (data.collider === 'auto') {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent.backend;
            if (geometry && geometry.isBufferGeometry) {
                switch (data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getCenter(_center);
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs((_size.x * entity.scale.x) / 2);
                        const sy = Math.abs((_size.y * entity.scale.y) / 2);
                        const sz = Math.abs((_size.z * entity.scale.z) / 2);
                        const cuboid = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
                        cuboid.setTranslation(_center.x * entity.scale.x, _center.y * entity.scale.y, _center.z * entity.scale.z);
                        addColliderToRigidBody(cuboid);
                        break;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        _center.copy(geometry.boundingSphere.center);
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        const maxSize = Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
                        const ball = RAPIER.ColliderDesc.ball(radius * maxSize);
                        ball.setTranslation(_center.x * entity.scale.x, _center.y * entity.scale.y, _center.z * entity.scale.z);
                        addColliderToRigidBody(ball);
                        break;
                    case 'hull':
                        const points = new Float32Array(geometry.attributes.position.array);
                        addColliderToRigidBody(RAPIER.ColliderDesc.convexHull(points));
                        break;
                    case 'mesh':
                        const vertices = new Float32Array(geometry.attributes.position.array);
                        const indices = (geometry.index)
                            ? new Uint32Array(geometry.index.array)
                            : new Uint32Array([...Array(vertices.length / 3).keys()]);
                        addColliderToRigidBody(RAPIER.ColliderDesc.trimesh(vertices, indices));
                        break;
                }
            }
        } else if (data.collider === 'ball') {
            const radius = (0.5) * Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
            addColliderToRigidBody(RAPIER.ColliderDesc.ball(radius));
        } else if (data.collider === 'capsule') {
        } else if (data.collider === 'cone') {
        } else if (data.collider === 'cuboid') {
            const sx = (0.5) * entity.scale.x;
            const sy = (0.5) * entity.scale.y;
            const sz = (0.5) * entity.scale.z;
            addColliderToRigidBody(RAPIER.ColliderDesc.cuboid(sx, sy, sz));
        } else if (data.collider === 'cylinder') {
            const sy = (0.5) * entity.scale.y;
            const radius = (0.5) * Math.max(entity.scale.x, entity.scale.z);
            addColliderToRigidBody(RAPIER.ColliderDesc.cylinder(sy, radius));
        }
    }
    onUpdate(delta = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        const data = this.data ?? {};
        if (!rigidbody || !entity) return;
        if (data.style === 'fixed') {
            rigidbody.setTranslation(entity.position);
            rigidbody.setRotation(entity.quaternion);
        } else {
            entity.position.copy(rigidbody.translation());
            entity.rotation.setFromQuaternion(_quaternion.copy(rigidbody.rotation()), undefined, false);
        }
    }
    onRemove() {
    }
    setLinvel(x = 0, y = 0, z = 0, wakeUp = true) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;
        rigidbody.setLinvel({ x, y, z }, wakeUp);
    }
    setAngvel(x = 0, y = 0, z = 0, wakeUp = true) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;
        rigidbody.setAngvel({ x, y, z }, wakeUp);
    }
    colliderGeometry() {
        const entity = this.entity;
        const data = this.data ?? {};
        if (!data || !entity) return undefined;
        if (data.collider && data.collider === 'auto' && entity.isEntity) {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent ? geometryComponent.backend : undefined;
            if (geometry && geometry.isBufferGeometry) {
                switch (data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getCenter(_center);
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs(_size.x);
                        const sy = Math.abs(_size.y);
                        const sz = Math.abs(_size.z);
                        const boxGeometry = new THREE$1.BoxGeometry(sx, sy, sz);
                        boxGeometry.translate(_center.x, _center.y, _center.z);
                        return boxGeometry;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        _center.copy(geometry.boundingSphere.center);
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        const sphereGeometry = new THREE$1.SphereGeometry(radius, 32);
                        sphereGeometry.translate(_center.x, _center.y, _center.z);
                        return sphereGeometry;
                    case 'hull':
                        const vertices = [];
                        const positionAttribute = geometry.getAttribute('position');
                        for (let i = 0; i < positionAttribute.count; i++) {
                            const vertex = new THREE$1.Vector3();
                            vertex.fromBufferAttribute(positionAttribute, i);
                            vertices.push(vertex);
                        }
                        return new ConvexGeometry(vertices);
                    case 'mesh':
                        return geometry.clone();
                }
            }
        }
        switch (data.collider) {
            case 'ball':
                return new THREE$1.SphereGeometry(0.5, 32);
            case 'capsule':
                return undefined;
            case 'cone':
                return undefined;
            case 'cuboid':
                return new THREE$1.BoxGeometry(1, 1, 1);
            case 'cylinder':
                return new THREE$1.CylinderGeometry(0.5, 0.5, 1);
        }
        return undefined;
    }
    colliderShape() {
        return (this.data.collider === 'auto') ? this.data.generate : this.data.collider;
    }
    colliderStyle() {
        return this.data.style ?? 'fixed';
    }
}
Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },
        styleDivider: { type: 'divider' },
        collider: { type: 'select', default: 'auto', select: colliders, rebuild: true },
        generate: { type: 'select', default: 'box', select: automatic, if: { collider: [ 'auto' ] } },
        shapeDivider: { type: 'divider' },
        ccdEnabled: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },
        canSleep: { type: 'boolean', default: true, if: { style: [ 'dynamic' ] }, },
        gravityScale: { type: 'number', default: 1.0, if: { style: [ 'dynamic' ] }, },
        addMass: { type: 'number', default: 0, min: 0, if: { style: [ 'dynamic' ] }, },
        density: { type: 'number', default: 1.0, min: 0, step: 0.1, precision: 2, promode: true },
        bounce: { type: 'slider', default: 0, min: 0, max: 1, precision: 2 },
        friction: { type: 'slider', default: 0.5, min: 0, max: 10, precision: 2 },
        moveDivider: { type: 'divider', if: { style: [ 'dynamic', 'kinematic' ] }, },
        linearVelocity: { type: 'vector', size: 3, tint: true, default: [ 0, 0, 0 ], step: 1.0, precision: 2, if: { style: [ 'dynamic', 'kinematic' ] } },
        angularVelocity: { type: 'vector', size: 3, tint: true, default: [ 0, 0, 0 ], step: 1.0, precision: 2, if: { style: [ 'dynamic', 'kinematic' ] } },
        linearEnabled: { type: 'option', size: 3, tint: true, default: [ true, true, true ], if: { style: [ 'dynamic' ] } },
        rotateEnabled: { type: 'option', size: 3, tint: true, default: [ true, true, true ], if: { style: [ 'dynamic' ] } },
        linearDamping: { type: 'number', default: 0.0, min: 0, step: 1.0, precision: 2, if: { style: [ 'dynamic' ] } },
        angularDamping: { type: 'number', default: 0.0, min: 0, step: 1.0, precision: 2, if: { style: [ 'dynamic' ] } },
    },
    icon: ``,
    color: '#0F4F94',
    multiple: false,
    group: [ 'Entity3D' ],
};
ComponentManager.register('rigidbody', Rigidbody);

class Script {
    init(data = {}) {
        if (data.isScript) {
            const assetUUID = data.uuid;
            AssetManager$1.addAsset(data);
            data = this.defaultData();
            data.script = assetUUID;
        }
        const script = AssetManager$1.getAsset(data.script);
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
    group: [ 'Entity3D' ],
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
    group: [ 'Entity3D' ],
};
ComponentManager.register('test', Test);

await RAPIER.init();
const _gravity = new THREE$1.Vector3();
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
        const world = new RAPIER.World(_gravity);
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
    group: [ 'World3D' ],
};
ComponentManager.register('physics', Physics);

const _camPosition = new THREE$1.Vector3();
const _camRotation = new THREE$1.Quaternion();
const _camRight = new THREE$1.Vector3();
const _camUp = new THREE$1.Vector3();
class PixelPerfectPass extends Pass {
    constructor(shader, pixelX = 1, pixelY = 1) {
        super();
        this.uniforms = THREE$1.UniformsUtils.clone(shader.uniforms);
        this.material = new THREE$1.ShaderMaterial({
            name: shader.name ?? 'NamelessShader',
            defines: Object.assign({}, shader.defines),
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        });
        this.pixelQuad = new FullScreenQuad(this.material);
        this.pixelSize = new THREE$1.Vector2();
        this.setPixelSize(pixelX, pixelY);
    }
    render(renderer, writeBuffer, readBuffer, ) {
        const camera = this.camera;
        if (!camera) return;
        camera.getWorldPosition(_camPosition);
        camera.getWorldQuaternion(_camRotation);
        _camRight.set(1.0, 0.0, 0.0).applyQuaternion(_camRotation);
        _camUp.set(0.0, 1.0, 0.0).applyQuaternion(_camRotation);
        const camPosX = _camPosition.dot(_camRight) * camera.zoom;
        const camPosY = _camPosition.dot(_camUp) * camera.zoom;
        this.uniforms['uCamera'].value.x = camPosX;
        this.uniforms['uCamera'].value.y = camPosY;
        this.uniforms['tDiffuse'].value = readBuffer.texture;
        renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.pixelQuad.render(renderer);
    }
    dispose() {
        this.material.dispose();
        this.pixelQuad.dispose();
    }
    setPixelSize(x = 1, y = 1) {
        if (y == undefined) y = x;
        x = Math.min(1024, Math.max(1, parseInt(x)));
        y = Math.min(1024, Math.max(1, parseInt(y)));
        this.pixelSize.set(x, y);
        this.uniforms['uCellSize'].value = this.pixelSize;
    }
    setFixedSize(width, height) {
        this.uniforms['fixedsize'].value.x = width;
        this.uniforms['fixedsize'].value.y = height;
    }
    setSize(width, height) {
        this.uniforms['resolution'].value.x = width;
        this.uniforms['resolution'].value.y = height;
    };
}

const MixShader = {
    uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);
        }
    `,
};
class SelectiveBloomPass extends Pass {
    constructor(strength, radius, threshold) {
        super();
        const self = this;
        this.copyPass = new ShaderPass(CopyShader);
        this.copyPass.material.blending = THREE$1.NoBlending;
        this.renderPass = new RenderPass(null, null);
        this.renderPass.clear = false;
        this.bloomPass = new UnrealBloomPass(new THREE$1.Vector2(), strength, radius, threshold);
        this.mixPass = new ShaderPass(new THREE$1.ShaderMaterial({
            name: 'MixShader',
            uniforms: THREE$1.UniformsUtils.clone(MixShader.uniforms),
            vertexShader: MixShader.vertexShader,
            fragmentShader: MixShader.fragmentShader,
        }));
        Object.defineProperties(self, {
            'scene': {
                get: function() { return self.renderPass.scene; },
                set: function(scene) { self.renderPass.scene = scene; }
            },
            'camera': {
                get: function() { return self.renderPass.camera; },
                set: function(camera) { self.renderPass.camera = camera; }
            }
        });
        this.needsSwap = true;
    }
    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        if (!this.bufferTarget) {
            this._pixelRatio = renderer.getPixelRatio();
            const size = renderer.getSize(new THREE$1.Vector2());
			const effectiveWidth = size.width * this._pixelRatio;
		    const effectiveHeight = size.height * this._pixelRatio;
			this.bufferTarget = new THREE$1.WebGLRenderTarget(effectiveWidth, effectiveHeight, { type: THREE$1.HalfFloatType });
			this.bufferTarget.texture.name = 'BufferTarget';
        }
        const camera = this.renderPass.camera;
        if (!camera) return;
        this.copyPass.render(renderer, this.bufferTarget, readBuffer, deltaTime);
        renderer.setRenderTarget(readBuffer);
        renderer.clearColor();
        camera.layers.disable(LAYERS.BASE);
        camera.layers.enable(LAYERS.BLOOM);
        this.renderPass.render(renderer, writeBuffer, readBuffer);
        camera.layers.disable(LAYERS.BLOOM);
        camera.layers.enable(LAYERS.BASE);
        this.bloomPass.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
        this.mixPass.material.uniforms['baseTexture'].value = this.bufferTarget.texture;
        this.mixPass.material.uniforms['bloomTexture'].value = readBuffer.texture;
        this.mixPass.render(renderer, writeBuffer, readBuffer);
    }
    setSize(width, height) {
        const effectiveWidth = width * (this._pixelRatio ?? window.devicePixelRatio);
		const effectiveHeight = height * (this._pixelRatio ?? window.devicePixelRatio);
		if (this.bufferTarget) this.bufferTarget.setSize(effectiveWidth, effectiveHeight);
        if (this.copyPass) this.copyPass.setSize(width, height);
        if (this.renderPass) this.renderPass.setSize(width, height);
        if (this.bloomPass) this.bloomPass.setSize(width, height);
        if (this.mixPass) this.mixPass.setSize(width, height);
    }
    dispose() {
        if (this.bufferTarget) this.bufferTarget.dispose();
        if (this.copyPass) this.copyPass.dispose();
        if (this.renderPass) this.renderPass.dispose();
        if (this.bloomPass) this.bloomPass.dispose();
        if (this.mixPass) this.mixPass.dispose();
    }
}

const CHARACTERS_PER_ROW = 16;
const AsciiShader = {
    name: 'AsciiShader',
    uniforms: {
        'resolution': { value: new THREE$1.Vector2() },
        'fixedsize': { value: new THREE$1.Vector2() },
        'uCamera': { value: new THREE$1.Vector2() },
        'uCellSize': { value: 16 },
        'tDiffuse': { value: null },
        'tCharacters': { value: null },
        'uCharacterCount': { value: 0 },
        'uColor': { value: new THREE$1.Color() },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        #include <common>

        uniform vec2 resolution;
        uniform vec2 fixedsize;
        uniform vec2 uCamera;
        uniform vec2 uCellSize;
        uniform sampler2D tDiffuse;
        uniform sampler2D tCharacters;
        uniform float uCharacterCount;
        uniform vec3 uColor;

        varying vec2 vUv;

        const vec2 SIZE = vec2(${CHARACTERS_PER_ROW});

        void main() {
            vec2 cell = fixedsize / uCellSize;
            vec2 grid = 1.0 / cell;
            vec2 pixel = 1.0 / fixedsize;
            vec2 actual = 1.0 / resolution;

            // Camera Offset
            vec2 fract = pixel * mod(uCamera, uCellSize);

            // Image Color
            vec2 pixelUV = grid * (0.5 + floor((vUv + fract) / grid));
            pixelUV -= fract;
            vec4 pixelized = texture2D(tDiffuse, pixelUV);

            // Character
            float greyscale = luminance(pixelized.rgb);
            float characterIndex = floor((uCharacterCount - 1.0) * greyscale);
            vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
            vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
            vec2 charUV = mod((vUv + fract) * (cell / SIZE), 1.0 / SIZE) - vec2(0.0, 1.0 / SIZE) + offset;
            vec4 asciiCharacter = texture2D(tCharacters, charUV);

            gl_FragColor = vec4(uColor * asciiCharacter.rgb, pixelized.a);
        }`,
    createCharactersTexture: function(characters) {
            const canvas = document.createElement('canvas');
            const FONT_SIZE = 54;
            const SIZE = 1024;
            const CELL = SIZE / CHARACTERS_PER_ROW;
            canvas.width = canvas.height = SIZE;
            const texture = new THREE$1.CanvasTexture(
                canvas, undefined,
                THREE$1.RepeatWrapping,
                THREE$1.RepeatWrapping,
                THREE$1.LinearFilter,
                THREE$1.LinearFilter,
            );
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, SIZE, SIZE);
            ctx.font = `${FONT_SIZE}px arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                const x = i % CHARACTERS_PER_ROW;
                const y = Math.floor(i / CHARACTERS_PER_ROW);
                ctx.fillStyle = '#fff';
                ctx.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
            }
            texture.needsUpdate = true;
            return texture;
        }
};

const CartoonShader = {
    name: 'CartoonShader',
    uniforms: {
        'resolution': { value: new THREE$1.Vector2() },
        'tDiffuse': { value: null },
        'uEdgeColor': { value: new THREE$1.Color(0x000000) },
        'uEdgeStrength': { value: 2.0 },
        'uGradient': { value: 8.0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        #include <common>

        uniform vec2 resolution;
        uniform sampler2D tDiffuse;
        uniform vec3 uEdgeColor;
        uniform float uEdgeStrength;
        uniform float uGradient;

        varying vec2 vUv;

        //***** Fast Rgb / Hsv Conversion Functions *****/

        vec3 rgbToHsv(vec3 c) {
            vec4  K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4  p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4  q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsvToRgb(vec3 c) {
            vec4  K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3  p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        //***** Cartoon Filter Functions *****/

        // Averaged pixel intensity from 3 color channels
        float avgIntensity(vec4 pix) {
            return (pix.r + pix.g + pix.b) / 3.0;
        }

        // Returns pixel color
        float isEdge(in vec2 coords) {
            float dxtex = 1.0 / float(resolution.x); // textureSize(tDiffuse, 0));
            float dytex = 1.0 / float(resolution.y); // textureSize(tDiffuse, 0));
            float pix[9];
            int   k = -1;
            float delta;

            // Read neighboring pixel intensities
            for (int i = -1; i < 2; i++) {
                for (int j = -1; j < 2; j++) {
                    k++;
                    pix[k] = avgIntensity(texture2D(tDiffuse, coords + vec2(float(i) * dxtex, float(j) * dytex)));
                }
            }

            // Average color differences around neighboring pixels
            delta = (abs(pix[1] - pix[7]) + abs(pix[5] - pix[3]) + abs(pix[0] - pix[8]) + abs(pix[2] - pix[6]) ) / 4.0;
            return clamp((uEdgeStrength * 10.0) * delta, 0.0, 1.0);
        }

        void main() {
            // Start
            vec4 texel = texture2D(tDiffuse, vUv);

            // Color Gradient
            float clrs = 1.0 / uGradient;

            // Toon
            vec3 hsv = rgbToHsv(texel.rgb);
            hsv.x = clamp(0.01 * (floor(hsv.x / 0.01)), 0.0, 1.0);
            hsv.y = clamp(0.01 * (floor(hsv.y / 0.01)), 0.0, 1.0);
            hsv.z = clamp(clrs * floor(hsv.z / clrs), 0.0, 1.0);
            // hsv.z = clamp(clrs * (floor(hsv.z / clrs) + (1.0 * texel.a)), 0.0, 1.0);

            vec3 rgb = hsvToRgb(hsv.xyz);

            // Edge
            float edge = (uEdgeStrength > 0.0) ? isEdge(vUv) : 0.0;
            if (edge >= 0.1) { // edge threshold
                rgb = mix(rgb, uEdgeColor, clamp(edge * 3.0, 0.0, 1.0));
            }

            // Final
            texel.rgb = vec3(rgb.x, rgb.y, rgb.z);
            gl_FragColor = texel;
        }`
};

const empty256 = [];
for (let i = 0; i < 256; i++) empty256.push(new THREE$1.Vector3());
const DitherShader = {
    name: 'DitherShader',
    uniforms: {
        'resolution': { value: new THREE$1.Vector2() },
        'fixedsize': { value: new THREE$1.Vector2() },
        'uCamera': { value: new THREE$1.Vector2() },
        'uCellSize': { value: new THREE$1.Vector2() },
        'tDiffuse': { value: null },
        'uPaletteRgb': { value: [
            new THREE$1.Vector3(0.00, 0.00, 0.00),
            new THREE$1.Vector3(1.00, 1.00, 1.00),
            ...empty256,
        ]},
        'uPaletteSize': { value: 2 },
        'uBias': { value: 0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        #include <common>

        uniform vec2 resolution;
        uniform vec2 fixedsize;
        uniform vec2 uCamera;
        uniform vec2 uCellSize;
        uniform sampler2D tDiffuse;
        uniform vec3[256] uPaletteRgb;
        uniform int uPaletteSize;
        uniform float uBias;

        varying vec2 vUv;

        const int[64] ditherTable = int[](
            0,  32, 8,  40, 2,  34, 10, 42,
            48, 16, 56, 24, 50, 18, 58, 26,
            12, 44, 4,  36, 14, 46, 6,  38,
            60, 28, 52, 20, 62, 30, 54, 22,
            3,  35, 11, 43, 1,  33, 9,  41,
            51, 19, 59, 27, 49, 17, 57, 25,
            15, 47, 7,  39, 13, 45, 5,  37,
            63, 31, 55, 23, 61, 29, 53, 21
        );

        float euclideanDistance(vec3 clr1, vec3 clr2) {
            vec3 diff = abs(clr1 - clr2);
            vec3 sqrd = diff * diff;
            return sqrt(diff.x + diff.y + diff.z);
        }

        float lumDistance(vec3 clr1, vec3 clr2) {
            float l1 = luminance(clr1);
            float l2 = luminance(clr2);
            return abs(l1 - l2);
        }

        float colorDistance(vec3 clr1, vec3 clr2) {
            float ld = lumDistance(clr1, clr2);
            float ed = euclideanDistance(clr1, clr2);
            return ((ld * 1.0) + (ed * 3.0)) / 4.0;
        }

        vec3[2] closestColors(vec3 color) {
            vec3 closest = vec3(-10.0, -10.0, -10.0);
            vec3 second = vec3(-10.0, -10.0, -10.0);
            vec3 temp;
            for (int i = 0; i < uPaletteSize; i++) {
                temp = uPaletteRgb[i];
                float distance = colorDistance(uPaletteRgb[i], color);
                if (distance < colorDistance(closest, color)) {
                    second = closest;
                    closest = temp;
                } else if (distance < colorDistance(second, color)) {
                    second = temp;
                }
            }
            return vec3[](closest, second);
        }

        vec3 stepColor(vec3 v) {
            return floor(0.5 + (v * 4.0)) / 4.0;
        }

        vec3 dither(vec2 pos, vec3 color) {
            int x = int(pos.x);
            int y = int(pos.y);
            float limit = (float(ditherTable[x + y * 8] + 1) / 64.0) + uBias;

            vec3 cs[2] = closestColors(color);
            float diff = colorDistance(color, cs[0]) / colorDistance(color, cs[1]);
            vec3 resultColor = (diff < limit) ? cs[0] : cs[1];
            return resultColor;
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);

            // // Simple
            // vec2 pos = gl_FragCoord.xy / uCellSize;

            // // Camera Align
            vec2 cell = resolution / (uCellSize * 8.0);
            vec2 pixel = 1.0 / resolution;
            vec2 ratio = resolution / fixedsize;
            vec2 fract = pixel * mod(uCamera * ratio, (uCellSize * 8.0));
            vec2 pos = mod((vUv + fract) * cell, 1.0) * 8.0;

            texel.rgb = dither(pos, texel.rgb);
            gl_FragColor = texel;
        }
        `
};

const LevelsShader = {
    name: 'LevelsShader',
    uniforms: {
        'tDiffuse': { value: null },
        'hue': { value: 0 },
        'saturation': { value: 0 },
        'brightness': { value: 0 },
        'contrast': { value: 0 },
        'grayscale': { value: 0.0 },
        'negative': { value: false },
        'bitrate': { value: 1.0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        #include <common>
        uniform sampler2D tDiffuse;

        uniform float hue;
        uniform float saturation;
        uniform float brightness;
        uniform float contrast;
        uniform float grayscale;
        uniform float negative;
        uniform float bitrate;

        varying vec2 vUv;

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);

            // Hue
            float angle = hue * 3.14159265;
            float s = sin(angle), c = cos(angle);
            vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
            float len = length(texel.rgb);
            texel.rgb = vec3(
                dot(texel.rgb, weights.xyz),
                dot(texel.rgb, weights.zxy),
                dot(texel.rgb, weights.yzx)
            );

            // Saturation
            float average = (texel.r + texel.g + texel.b) / 3.0;
            if (saturation > 0.0) {
                texel.rgb += (average - texel.rgb) * (1.0 - 1.0 / (1.001 - saturation));
            } else {
                texel.rgb += (average - texel.rgb) * (- saturation);
            }

            // Brightness
            float bright = brightness * texel.a;
            texel.rgb += bright;

            // Contrast
            float clarity = min(contrast * texel.a, 0.9999);
            if (clarity > 0.0) {
                texel.rgb = (texel.rgb - 0.5) / (1.0 - clarity) + 0.5;
            } else {
                texel.rgb = (texel.rgb - 0.5) * (1.0 + clarity) + 0.5;
            }

            // Grayscale
            float l = luminance(texel.rgb);
            texel = mix(texel, vec4(l, l, l, texel.a), grayscale);

            // Negative
            texel.rgb = mix(texel.rgb, (1.0 - texel.rgb) * texel.a, negative);

            // Bitrate (0 to 256)
            texel.rgb = floor(texel.rgb * bitrate) / bitrate;

            // Final
            gl_FragColor = texel;
        }`
};

const TEXTURE_SIZE = 64;
const _sources = {};
_sources['brick'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAEyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgdGlmZjpJbWFnZUxlbmd0aD0iNjQiCiAgIHRpZmY6SW1hZ2VXaWR0aD0iNjQiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSI2NCIKICAgZXhpZjpQaXhlbFlEaW1lbnNpb249IjY0IgogICBleGlmOkNvbG9yU3BhY2U9IjEiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAg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';
_sources['cross'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFy2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iNjQiCiAgIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI2NCIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIgogICB0aWZmOkltYWdlTGVuZ3RoPSI2NCIKICAgdGlmZjpJbWFnZVdpZHRoPSI2NCIKICAgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iNzIvMSIKICAgdGlmZjpZUmVzb2x1dGlvbj0iNzIvMSIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0w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';
_sources['knit'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAAEsWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjMyIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMjEiCiAgIGV4aWY6Q29sb3JTcGFjZT0iMSIKICAgdGlmZjpJbWFnZVdpZHRoPSIzMiIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMjEiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDct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';
_sources['tile'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAEsWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjMyIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMzIiCiAgIGV4aWY6Q29sb3JTcGFjZT0iMSIKICAgdGlmZjpJbWFnZVdpZHRoPSIzMiIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMzIiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDctMjBUMTM6NDg6MzctMDc6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDctMjBUMTM6NDg6MzctMDc6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgUGhvdG8gMiAyLjAuMCIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wNy0yMFQxMzo0ODozNy0wNzowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+CBb9VgAAAYFpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZHLS0JBFIc/tTDKKMhFiyAJa2VhBlGbICUqiBAz6LXR6ytQu9yrhLQN2goFUZtei/oLahu0DoKiCKJtrYvaVNzOVUGJPMOZ881v5hxmzoA1nFYyeoMXMtmcFpr0uxYWl1z2F+w46cBBd0TR1fFgcIa69nmPxYy3/Wat+uf+tZZYXFfA0iQ8pqhaTnhKeGY9p5q8I+xUUpGY8JmwR5MLCt+ZerTMryYny/xtshYOBcDaLuxK1nC0hpWUlhGWl+POpPNK5T7mSxzx7PycxB7xLnRCTOLHxTQTBBhmkFGZh+nHx4CsqJPvLeXPsia5iswqBTRWSZIih0fUvFSPS0yIHpeRpmD2/29f9cSQr1zd4YfGZ8N47wX7NvwUDePryDB+jsH2BJfZav7aIYx8iF6sau4DaNuE86uqFt2Fiy3ofFQjWqQk2cStiQS8nULrInTcQPNyuWeVfU4eILwhX3UNe/vQJ+fbVn4BPf5n0/P+XOAAAAAJcEhZcwAACxMAAAsTAQCanBgAAAJaSURBVEiJhZZBbhsxDEWfOEoMZNFNT9Ib5go9Ute9SLYFWhSJMWIXtuhPSkEFYyBLJP8nRVJq319fn+CEBs59NBjQoAGyHsN3f1tefIYP6M/wbf4JiZaV206/zS0VaGDQ4AWu8AP6FZ7gK/zZSSuGwmwpGxzQocEXeIMrdIMP+A1/wcSiTy7/dUKdvgF0OOAdGvTYtqxvk3WxvmIYDPHApq7NxRR6z8oxAmbMr8/JEJl10tWEZwzPsT7nfGRJ5XTmwAJ9y1qDozAuW8VLzQhNis4S3HKwiEKoWQZuWYxZRoCF2hCjJZrtk5+SKEiRkN3ztgZ9W65jKg/ZikgWvx9IbabXWI5EdYLEkMw2MeeZPnHIvuPeBGMF063b1zIYAn/3t3Bfa6rEUGtim7UpROvwHOg1Z1ZfQyAMdl90ioJOfCbolpMmZMxNaycmpQ+zbG1Hk8OIYaWSS0CADgZnTo9tJ/cdSwtD0T6PzDpMt50fisRM9PaJN7XKNRSRf2M5Ks39kbs30U3XTlvAhvhUwlicOMsZFC6qoI2+XKXbNIt2kM4AEXIxFxH03S7ZtJZLkTEEMHSK1y6TWI9eVCyonfvZFCtt97UlJg7nvOZW60gMHqyLv5bL6ph3eiFYriM15XqjMavcRCLqWR03gTThHk8KLZoexWXQwRv4A19fSgVVnQiKNh095uLdgwOebgpeW1OpybU5NimuY7664m7oDhd4ycmjZNvOqGXhGDZfdi/w63YGHd7hTZ495cx1lMVtud24X+ADnqG/w8/5fCcHl7yygrlolfY+4AJX+AddcvRRAxRgJAAAAABJRU5ErkJggg==';
_sources['woven'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFX2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iNjQiCiAgIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI2NCIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIgogICB0aWZmOkltYWdlTGVuZ3RoPSI2NCIKICAgdGlmZjpJbWFnZVdpZHRoPSI2NCIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iNzIvMSIKICAgdGlmZjpZUmVzb2x1dGlvbj0iNzIvMSIKICAg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';
const PixelatedShader = {
    name: 'PixelatedShader',
    uniforms: {
        'resolution': { value: new THREE$1.Vector2() },
        'fixedsize': { value: new THREE$1.Vector2() },
        'uCamera': { value: new THREE$1.Vector2() },
        'uCellSize': { value: new THREE$1.Vector2() },
        'tDiffuse': { value: null },
        'tPixel': { value: null },
        'uDiscard': { value: 0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        #include <common>

        uniform vec2 resolution;
        uniform vec2 fixedsize;
        uniform vec2 uCamera;
        uniform vec2 uCellSize;
        uniform sampler2D tDiffuse;
        uniform sampler2D tPixel;
        uniform float uDiscard;

        varying vec2 vUv;

        void main() {
            vec2 cell = fixedsize / uCellSize;
            vec2 grid = 1.0 / cell;
            vec2 pixel = 1.0 / fixedsize;

            // Camera Offset
            vec2 fract = pixel * mod(uCamera, uCellSize);

            // Pattern Pixel
            //
            //  +1.0┏━━━━━━━━━━┓
            //      ┃       255┃        Blue Layer, Y Offset
            //      ┃     192  ┃
            //  +0.0┃   128    ┃
            //      ┃ 64       ┃
            //      ┃0         ┃        Green Layer, X Offset
            //  -1.0┗━━ +0.0 ━━┛+1.0
            //
            // NOTE: 128 != 255/2.0, so apply adjustment (i.e. 128 * 0.99609375 == 127.5)
            //
            vec2 patternUV = mod((vUv + fract) * cell, 1.0);
            vec4 pattern = texture2D(tPixel, patternUV);
            vec2 offset;
            float l = luminance(vec3(pattern.r));                           // r, grayscale
            offset.x = grid.x * ((pattern.g * 0.99609375 * 2.0) - 1.0);     // g, x offset
            offset.y = grid.y * ((pattern.b * 0.99609375 * 2.0) - 1.0);     // b, y offset

            // Image Pixel
            vec2 pixelUV = grid * (0.5 + floor((vUv + fract) / grid));
            pixelUV -= fract;
            pixelUV += offset;
            vec4 pixelized = texture2D(tDiffuse, pixelUV);

            // Too Dark?
            float darkness = luminance(pixelized.rgb);
            if (darkness < uDiscard) discard;

            gl_FragColor = vec4(l * pixelized.rgb * pattern.a, pattern.a);
        }`,
    createStyleTexture: function(style) {
            const canvas = document.createElement('canvas');
            canvas.width = TEXTURE_SIZE;
            canvas.height = TEXTURE_SIZE;
            const texture = new THREE$1.CanvasTexture(
                canvas, undefined,
                THREE$1.RepeatWrapping,
                THREE$1.RepeatWrapping,
                THREE$1.NearestFilter,
                THREE$1.NearestFilter,
            );
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
            if (!_sources[style]) {
                ctx.fillStyle = '#ff8080';
                ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
                texture.needsUpdate = true;
            } else {
                const image = document.createElement('img');
                image.onload = () => {
                    ctx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
                    ctx.drawImage(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
                    texture.needsUpdate = true;
                };
                image.src = _sources[style];
            }
            return texture;
        }
};

class Post {
    init(data = {}) {
        let pass = undefined;
        switch (data.style) {
            case 'ascii':
                pass = new PixelPerfectPass(AsciiShader, data.textSize, data.textSize);
                pass.uniforms['tCharacters'].value = AsciiShader.createCharactersTexture(data.characters);
                pass.uniforms['uCharacterCount'].value = data.characters.length;
                pass.uniforms['uColor'].value.set(data.textColor);
                break;
            case 'bloom':
                pass = new SelectiveBloomPass(data.strength, data.radius, data.threshold);
                break;
            case 'cartoon':
                pass = new ShaderPass(CartoonShader);
                pass.uniforms['uEdgeColor'].value.set(data.edgeColor);
                pass.uniforms['uEdgeStrength'].value = data.edgeStrength;
                pass.uniforms['uGradient'].value = data.gradient;
                pass.setSize = function(width, height) {
                    pass.uniforms['resolution'].value.x = width;
                    pass.uniforms['resolution'].value.y = height;
                };
                break;
            case 'dither':
                pass = new PixelPerfectPass(DitherShader, data.scale, data.scale);
                const palette = AssetManager$1.getAsset(data.palette);
                if (palette && palette.isPalette) {
                    const colors = palette.colors;
                    if (colors && colors.length > 0) {
                        const numColors = Math.min(colors.length, 256);
                        const colorArray = [];
                        for (let i = 0; i < 256; i++) {
                            colorArray.push(new THREE.Color((i < numColors) ? colors[i] : 0));
                        }
                        pass.uniforms['uPaletteRgb'].value = colorArray;
                        pass.uniforms['uPaletteSize'].value = numColors;
                    }
                }
                pass.uniforms['uBias'].value = data.bias;
                break;
            case 'edge':
                pass = new ShaderPass(SobelOperatorShader);
                pass.setFixedSize = function(width, height) {
                    pass.uniforms['resolution'].value.x = width;
                    pass.uniforms['resolution'].value.y = height;
                };
                break;
            case 'levels':
                pass = new ShaderPass(LevelsShader);
                pass.uniforms['brightness'].value = data.brightness;
                pass.uniforms['contrast'].value = data.contrast;
                pass.uniforms['saturation'].value = data.saturation;
                pass.uniforms['hue'].value = data.hue;
                pass.uniforms['grayscale'].value = data.grayscale;
                pass.uniforms['negative'].value = data.negative;
                pass.uniforms['bitrate'].value = Math.pow(2, data.bitrate);
                break;
            case 'pixel':
                pass = new PixelPerfectPass(PixelatedShader, data.cellSize[0], data.cellSize[1]);
                pass.uniforms['tPixel'].value = PixelatedShader.createStyleTexture(data.cellStyle);
                pass.uniforms['uDiscard'].value = data.cutOff;
                break;
            case 'tint':
                pass = new ShaderPass(ColorifyShader);
                pass.uniforms['color'].value.set(data.color);
                break;
            default:
                console.error(`Post Component: Invalid style '${data.style}'`);
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
    group: [ 'World3D' ],
};
ComponentManager.register('post', Post);

export { App, AssetManager$1 as AssetManager, BasicLine, BasicWireBox, BasicWireframe, Camera3D, CameraUtils, CapsuleGeometry, Clock, ColorChange, ComponentManager, CylinderGeometry, DragControls, DrivingControls, Entity3D, EntityPool, EntityUtils, FatLine, FatWireBox, FatWireframe, FollowCamera, GeometryUtils, GpuPickerPass, Iris, KeyControls, Light3D, Maths, MoveCamera, ObjectUtils, OrbitControls, OrbitEntity, Palette, PrismGeometry, Project, RenderUtils, Renderer3D, RotateEntity, SVGBuilder, SceneManager, Script$1 as Script, SkyObject, Stage3D, Strings, System, Vectors, World3D, ZigZagControls };
