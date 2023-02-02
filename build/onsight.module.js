/**
 * @description Onsight Engine
 * @about       Easy to use 2D / 3D JavaScript game engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.4
 * @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
 * @source      https://github.com/onsightengine
 */
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { LoopSubdivision } from 'three-subdivide';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const VERSION = '0.0.4';
const BACKENDS = {
    RENDERER_3D: {
        PIXI:       'PIXI',
    },
    PHYSICS_2D: {
        MATTER:     'MATTER',
    },
    RENDERER_3D: {
        THREE:      'THREE',
    },
    PHYSICS_3D: {
        CANNON:     'CANNON',
        RAPIER:     'RAPIER',
    },
};
const ENTITY_TYPES = {
    Entity2D:       'Entity2D',
    Entity3D:       'Entity3D',
};
const SCENE_TYPES = {
    Scene2D:        'Scene2D',
    Scene3D:        'Scene3D',
};
const WORLD_TYPES = {
    World2D:        'World2D',
    World3D:        'World3D',
};
const ENTITY_FLAGS = {
    IGNORE:         'flagIgnore',
    LOCKED:         'flagLocked',
};
const APP_STATES = {
    PLAYING:        'playing',
    PAUSED:         'paused',
    STOPPED:        'stopped',
};

const CAMERA_SCALE = 0.01;
const CAMERA_START_DISTANCE = 5;
const CAMERA_START_HEIGHT = 0;
const _raycaster = new THREE.Raycaster();
class CameraUtils {
    static createOrthographic(camWidth, camHeight, fitType = 'none', desiredSize = 0) {
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
        camera.desiredSize = desiredSize;
        camera.fitType = fitType;
        camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
        camera.lookAt(0, CAMERA_START_HEIGHT, 0);
        CameraUtils.updateOrthographic(camera, camWidth, camHeight);
        return camera;
    }
    static createPerspective(camWidth, camHeight, fixedSize = true) {
        const camera = new THREE.PerspectiveCamera(
            58.10,
            1,
            0.01,
            1000,
        );
        camera.tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
        camera.windowHeight = (fixedSize) ? 1000  : 0;
        camera.fixedSize = fixedSize;
        camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
        camera.lookAt(0, CAMERA_START_HEIGHT, 0);
        CameraUtils.updatePerspective(camera, camWidth, camHeight);
        return camera;
    }
    static updateCamera(camera, camWidth, camHeight) {
        if (camera.isPerspectiveCamera) CameraUtils.updatePerspective(camera, camWidth, camHeight);
        if (camera.isOrthographicCamera) CameraUtils.updateOrthographic(camera, camWidth, camHeight);
    }
    static updatePerspective(camera, camWidth, camHeight) {
        if (camera.fixedSize) {
            camera.fov = (360 / Math.PI) * Math.atan(camera.tanFOV * (camHeight / camera.windowHeight));
        }
        camera.aspect = camWidth / camHeight;
        camera.updateProjectionMatrix();
    }
    static updateOrthographic(camera, camWidth, camHeight) {
        let fit = camera.fitType;
        let size = 0;
        if (camera.desiredSize) {
            size = camera.desiredSize;
        } else {
            fit = 'none';
        }
        let aspectWidth = 1.0;
        let aspectHeight = 1.0;
        let width = size;
        let height = size;
        if (fit === 'none') {
            width = camWidth * CAMERA_SCALE * 0.5;
            height = camHeight * CAMERA_SCALE * 0.5;
        } else if (fit === 'width') {
            aspectHeight = camHeight / camWidth;
        } else if (fit === 'height') {
            aspectWidth = camWidth / camHeight;
        }
        camera.left =    - width / aspectWidth / 2;
        camera.right =     width / aspectWidth / 2;
        camera.top =       height * aspectHeight / 2;
        camera.bottom =  - height * aspectHeight / 2;
        camera.updateProjectionMatrix();
    }
    static screenPoint(pointInWorld, camera) {
        if (! camera || ! camera.isCamera) {
            console.warn(`CameraUtils.screenPoint: No camera provided!`);
            return new THREE.Vector3();
        }
        return new THREE.Vector3.copy(pointInWorld).project(camera);
    }
    static worldPoint(pointOnScreen, camera, lookTarget = new THREE.Vector3(), facingPlane = 'xy') {
        if (! camera || ! camera.isCamera) {
            console.warn(`CameraUtils.worldPoint: No camera provided!`);
            return new THREE.Vector3();
        }
        const planeGeometry = new THREE.PlaneGeometry(100000000, 100000000, 2, 2);
        switch (facingPlane.toLowerCase()) {
            case 'yz': planeGeometry.rotateY(Math.PI / 2); break;
            case 'xz': planeGeometry.rotateX(Math.PI / 2); break;
            default:  ;
        }
        planeGeometry.translate(lookTarget.x, lookTarget.y, lookTarget.z);
        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        _raycaster.setFromCamera(pointOnScreen, camera);
        if (camera.isOrthographicCamera) {
            _raycaster.ray.origin.set(pointOnScreen.x, pointOnScreen.y, - camera.far).unproject(camera);
        }
        const planeIntersects = _raycaster.intersectObject(plane, true);
        planeGeometry.dispose();
        planeMaterial.dispose();
        return (planeIntersects.length > 0) ? planeIntersects[0].point.clone() : false;
    }
    static distanceToFitObject(camera, object, offset = 1.25) {
    }
    static fitCameraToObject(camera, object, controls = null, offset = 1.25, tilt = false) {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(object);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
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
}

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];
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
        return (number !== undefined && number !== null && typeof number === 'number' && ! Number.isNaN(number) && Number.isFinite(number));
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

class System {
    static arrayFromArguments() {
        if (arguments.length === 1 && Array.isArray(arguments[0])) {
            return arguments[0];
        } else {
		    return Array.from(arguments);
        }
    }
    static isIterable(obj) {
        if (obj == null) return false;
        return typeof obj[Symbol.iterator] === 'function';
    }
    static isObject(variable) {
        return (typeof variable === 'object' && ! Array.isArray(variable) && variable !== null);
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
        } catch (e) {
            console.warn(e);
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
    static waitForObject(operationName, getter, callback, checkFrequencyMs = 1000, timeoutMs = false, alertMs = 5000) {
        let startTimeMs = Date.now();
        let alertTimeMs = Date.now();
        (function loopSearch() {
            if (alertMs && Date.now() - alertTimeMs > alertMs) {
                console.info(`Still waiting on operation: ${operationName}`);
                alertTimeMs = Date.now();
            }
            if (getter() !== undefined && getter() !== null) {
                callback();
                return;
            } else {
                setTimeout(function() {
                    if (timeoutMs && Date.now() - startTimeMs > timeoutMs) return;
                    loopSearch();
                }, checkFrequencyMs);
            }
        })();
    }
}

const _boxCenter = new THREE.Box3();
const _tempMatrix = new THREE.Matrix4();
const _tempVector = new THREE.Vector3();
const _startQuaternion = new THREE.Quaternion();
const _tempQuaternion = new THREE.Quaternion();
const _testQuaternion = new THREE.Quaternion();
const _objPosition$2 = new THREE.Vector3();
const _objQuaternion$2 = new THREE.Quaternion();
const _objRotation = new THREE.Euler();
const _objScale$2 = new THREE.Vector3();
class ObjectUtils {
    static allowSelection(object) {
        let allowSelect = true;
        if (object.userData) {
            if (object.userData.flagIgnore) allowSelect = false;
            if (object.userData.flagLocked) allowSelect = false;
        }
        return allowSelect;
    }
    static checkTransforms(array) {
        if (array.length <= 1) return true;
        array[0].getWorldQuaternion(_startQuaternion);
        for (let i = 1; i < array.length; i++) {
            array[i].getWorldQuaternion(_testQuaternion);
            if (MathUtils.fuzzyQuaternion(_startQuaternion, _testQuaternion) === false) return false;
        }
        return true;
    }
    static clearObject(object, removeFromParent = true) {
        if (! object) return;
        if (! object.isObject3D) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) ObjectUtils.clearMaterial(object.material);
        if (object.dispose) object.dispose();
        while (object.children.length > 0) {
            ObjectUtils.clearObject(object.children[0], true);
        }
        ObjectUtils.resetTransform(object);
        if (removeFromParent) object.removeFromParent();
        object = null;
    }
    static clearMaterial(materials) {
        if (System.isIterable(materials) !== true) materials = [ materials ];
        for (let i = 0, il = materials.length; i < il; i++) {
            const material = materials[i];
            Object.keys(material).forEach((prop) => {
                if (! material[prop]) return;
                if (typeof material[prop].dispose === 'function') material[prop].dispose();
            });
            if (material.dispose) material.dispose();
        }
    }
    static computeBounds(groupOrArray, targetBox, checkIfSingleGeometry = false) {
        if (targetBox === undefined || targetBox.isBox3 !== true) targetBox = new THREE.Box3();
        const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
        targetBox.makeEmpty();
        if (checkIfSingleGeometry && ObjectUtils.countGeometry(groupOrArray) === 1) {
            let geomObject = undefined;
            objects.forEach((object) => {
                object.traverse((child) => {
                    if (child.geometry) geomObject = child;
                });
            });
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
        objects.forEach(object => targetBox.expandByObject(object));
        return targetBox;
    }
    static computeCenter(groupOrArray, targetVec3) {
        const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
        ObjectUtils.computeBounds(objects, _boxCenter);
        if (_boxCenter.isEmpty()) {
            for (let object of objects) {
                object.getWorldPosition(_tempVector);
                _boxCenter.expandByPoint(_tempVector);
            }
        }
        _boxCenter.getCenter(targetVec3);
        return targetVec3;
    }
    static containsObject(arrayOfObjects, object) {
        if (object && object.uuid && System.isIterable(arrayOfObjects)) {
            for (let i = 0; i < arrayOfObjects.length; i++) {
                if (arrayOfObjects[i].uuid === object.uuid) return true;
            }
        }
        return false;
    }
    static copyLocalTransform(source, target, updateMatrix = true) {
        source.updateMatrix();
        source.matrix.decompose(target.position, _tempQuaternion, target.scale);
        target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
        if (updateMatrix) target.updateMatrix();
    }
    static copyWorldTransform(source, target, updateMatrix = true) {
        source.updateWorldMatrix(true, false);
        source.matrixWorld.decompose(target.position, _tempQuaternion, target.scale);
        target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
        target.quaternion.setFromEuler(target.rotation, false);
        if (updateMatrix) target.updateMatrix();
    }
    static countGeometry(groupOrArray) {
        const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
        let geometryCount = 0;
        objects.forEach((object) => {
            object.traverse((child) => {
                if (child.geometry) geometryCount++;
            });
        });
        return geometryCount;
    }
    static flattenGroup(group) {
        if (! group) return;
        if (! group.parent) return;
        while (group.children) group.parent.attach(group.children[0]);
        ObjectUtils.clearObject(group, true);
    }
    static resetTransform(object) {
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
    }
}

class Strings {
    static addSpaces(string) {
        return String(string).replace(/([A-Z])/g, ' $1').trim();
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
    static nameFromUrl(url, capitalize = true) {
        let imageName = new String(url.replace(/^.*[\\\/]/, ''));
        imageName = imageName.replace(/\.[^/.]+$/, "");
        if (capitalize) imageName = Strings.capitalize(imageName);
        return imageName;
    }
}

const _assets = {};
const _scripts = {};
const _textureCache = {};
const _textureLoader = new THREE.TextureLoader();
class AssetManager {
    static assetType(asset) {
        if (asset.isBufferGeometry) return 'geometry';
        if (asset.type === 'Shape') return 'shape';
        if (asset.isMaterial) return 'material';
        if (asset.isTexture) return 'texture';
        return 'asset';
    }
    static getLibrary(type) {
        const library = [];
        for (const [uuid, asset] of Object.entries(_assets)) {
            if (AssetManager.assetType(asset) === type) library.push(asset);
        }
        return library;
    }
    static addAsset(assetOrArray) {
        if (! assetOrArray) return;
        const assetArray = (Array.isArray(assetOrArray)) ? assetOrArray : [ assetOrArray ];
        for (let i = 0; i < assetArray.length; i++) {
            let asset = assetArray[i];
            if (! asset.name || asset.name === '') asset.name = asset.constructor.name;
            if (asset.isBufferGeometry && asset.constructor.name !== 'BufferGeometry') {
                const bufferGeometry = mergeBufferGeometries([ asset ]);
                bufferGeometry.name = asset.name;
                bufferGeometry.uuid = asset.uuid;
                if (asset.dispose) asset.dispose();
                asset = bufferGeometry;
            }
            _assets[asset.uuid] = asset;
        }
        return assetOrArray;
    }
    static getAsset(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }
    static removeAsset(assetOrArray, dispose = true) {
        if (! assetOrArray) return;
        const assetArray = (Array.isArray(assetOrArray)) ? assetOrArray : [ assetOrArray ];
        for (let i = 0; i < assetArray.length; i++) {
            const asset = assetArray[i];
            if (_assets[asset.uuid]) {
                if (asset.isTexture) {
                    for (let url in _textureCache) {
                        if (_textureCache[url].uuid === asset.uuid) delete _textureCache[url];
                    }
                }
                if (dispose && asset.dispose) asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }
    static loadTexture(url, onLoad = undefined) {
        if (! url || url === '') return null;
        const resolvedUrl = THREE.DefaultLoadingManager.resolveURL(url);
        if (_textureCache[resolvedUrl]) {
            console.log(`AssetManager.loadTexture: Duplicate image!`);
            return _textureCache[resolvedUrl];
        }
		const texture = _textureLoader.load(url, onTextureLoaded, onTextureLoadError);
        _textureCache[resolvedUrl] = texture;
        function onTextureLoaded(newTexture) {
            newTexture.name = Strings.nameFromUrl(newTexture.image.src);
            newTexture.premultiplyAlpha = true;
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.wrapT = THREE.RepeatWrapping;
            if (onLoad && typeof onLoad === 'function') onLoad(newTexture);
        }
        function onTextureLoadError() {
            if (_textureCache[resolvedUrl] && _textureCache[resolvedUrl].isTexture) {
                _textureCache[resolvedUrl].dispose();
            }
            delete _textureCache[resolvedUrl];
        }
		return texture;
    }
    static clear() {
        for (let uuid in _assets) {
            AssetManager.removeAsset(_assets[uuid], true);
        }
    }
    static fromJSON(json) {
        AssetManager.clear();
        function addLibraryToAssets(library) {
            for (const [uuid, asset] of Object.entries(library)) {
                AssetManager.addAsset(asset);
            }
        }
		const objectLoader = new THREE.ObjectLoader();
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
        if (! meta) meta = {};
        if (! meta.shapes) meta.shapes = {};
        if (! meta.geometries) meta.geometries = {};
        if (! meta.images) meta.images = {};
        if (! meta.textures) meta.textures = {};
        if (! meta.materials) meta.materials = {};
        if (! meta.animations) meta.animations = {};
        if (! meta.skeletons) meta.skeletons = {};
        const stopRoot = {
            images: {},
            textures: {},
            materials: {},
        };
        const geometries = AssetManager.getLibrary('geometry');
        for (let i = 0; i < geometries.length; i++) {
            const geometry = geometries[i];
            if (! meta.geometries[geometry.uuid]) meta.geometries[geometry.uuid] = geometry.toJSON(meta);
        }
        const materials = AssetManager.getLibrary('material');
        for (let i = 0; i < materials.length; i++) {
            const material = materials[i];
            if (! meta.materials[material.uuid]) meta.materials[material.uuid] = material.toJSON(stopRoot);
        }
        const shapes = AssetManager.getLibrary('shape');
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (! meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(stopRoot);
        }
        const textures = AssetManager.getLibrary('texture');
        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            if (! meta.textures[texture.uuid]) meta.textures[texture.uuid] = texture.toJSON(meta);
        }
        for (const library in meta) {
            const valueArray = [];
            for (const key in meta[library]) {
                const data = meta[library][key];
                delete data.metadata;
                valueArray.push(data);
            }
            if (valueArray.length > 0) json[library] = valueArray;
        }
        return json;
    }
}

const _registered = {};
class ComponentManager {
    static registered(type = '') {
        const ComponentClass = _registered[type];
        if (! ComponentClass) console.warn(`ComponentManager.registered: Component '${type}' not registered'`);
        return ComponentClass;
    }
    static registeredTypes() {
        return Object.keys(_registered);
    }
    static register(type = '', ComponentClass) {
        type = type.toLowerCase();
        if (_registered[type]) return console.warn(`ComponentManager.register: Component '${type}' already registered`);
        if (! System.isObject(ComponentClass.config)) ComponentClass.config = {};
        if (! System.isObject(ComponentClass.config.schema)) ComponentClass.config.schema = {};
        const schema = ComponentClass.config.schema;
        for (const key in schema) {
            const prop = Array.isArray(schema[key]) ? schema[key] : [ schema[key] ];
            for (let i = 0, l = prop.length; i < l; i++) {
                const property = prop[i];
                if (property.type === undefined) {
                    console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                } else if (property.type === 'divider') {
                    continue;
                }
                if (property.default === undefined) {
                    switch (property.type) {
                        case 'select':      property.default = null;            break;
                        case 'number':      property.default = 0;               break;
                        case 'int':         property.default = 0;               break;
                        case 'angle':       property.default = 0;               break;
                        case 'slider':      property.default = 0;               break;
                        case 'boolean':     property.default = false;           break;
                        case 'color':       property.default = 0xffffff;        break;
                        case 'asset':       property.default = null;            break;
                        case 'map':         property.default = null;            break;
                        case 'scroller':    property.default = 0;               break;
                        case 'variable':    property.default = [ 0, 0 ];        break;
                        case 'array':       property.default = [];              break;
                        case 'vector2':     property.default = [ 0, 0 ];        break;
                        case 'vector3':     property.default = [ 0, 0, 0 ];     break;
                        case 'vector4':     property.default = [ 0, 0, 0, 0 ];  break;
                        case 'string':      property.default = '';              break;
                        case 'shape':       property.default = null;            break;
                        case 'script':      property.default = '';              break;
                        default:
                            console.warn(`ComponentManager.register(): Unknown property type: '${property.type}'`);
                            property.default = null;
                    }
                }
                if (property.proMode !== undefined) {
                    property.promode = property.proMode;
                }
            }
        }
        class Component extends ComponentClass {
            constructor() {
                super();
                this.isComponent = true;
                this.enabled = true;
                this.tag = '';
                this.type = type;
                this.entity = null;
                this.data = {};
            }
            init(data) {
                super.init(data);
            }
            dispose() {
                super.dispose();
            }
            disable() {
                this.enabled = false;
                super.disable();
            }
            enable() {
                this.enabled = true;
                super.enable();
            }
            defaultData() {
                const data = {};
                for (let i = 0, l = arguments.length; i < l; i += 2) {
                    data[arguments[i]] = arguments[i+1];
                }
                ComponentManager.sanitizeData(this.type, data);
                data.base = {
                    enabled: 	this.enabled,
                    tag:		this.tag,
                    type:		this.type,
                };
                return data;
            }
        }
        _registered[type] = Component;
    }
    static includeData(item, data1, data2 = undefined) {
        for (let key in item.if) {
            let conditions = item.if[key];
            if (System.isIterable(conditions) !== true) conditions = [ conditions ];
            let check1 = false, check2 = false;
            for (let j = 0; j < conditions.length; j++) {
                check1 = check1 || (data1[key] === conditions[j]);
                check2 = check2 || (data2 === undefined) ? true : (data2[key] === conditions[j]);
            }
            if (! check1 || ! check2) return false;
        }
        for (let key in item.not) {
            let conditions = item.not[key];
            if (System.isIterable(conditions) !== true) conditions = [ conditions ];
            let check1 = false, check2 = false;
            for (let j = 0; j < conditions.length; j++) {
                check1 = check1 || (data1[key] === conditions[j]);
                check2 = check2 || (data2 === undefined) ? false : (data2[key] === conditions[j]);
            }
            if (check1 || check2) return false;
        }
        return true;
    }
    static sanitizeData(type, data) {
        const ComponentClass = ComponentManager.registered(type);
        const schema = (ComponentClass && ComponentClass.config) ? ComponentClass.config.schema : {};
        for (let schemaKey in schema) {
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];
            let itemToInclude = undefined;
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];
                if (item.type === 'divider') continue;
                if (! ComponentManager.includeData(item, data)) continue;
                itemToInclude = item;
                break;
            }
            if (itemToInclude !== undefined) {
                if (data[schemaKey] === undefined) {
                    data[schemaKey] = itemToInclude.default;
                }
                if (MathUtils.isNumber(data[schemaKey])) {
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
        const schema = (ComponentClass && ComponentClass.config) ? ComponentClass.config.schema : {};
        for (let schemaKey in schema) {
            let matchedConditions = false;
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];
                if (item.type === 'divider') continue;
                if (! ComponentManager.includeData(item, oldData, newData)) continue;
                matchedConditions = true;
                break;
            }
            if (matchedConditions !== true) {
                delete newData[schemaKey];
            }
        }
    }
}

class EntityUtils {
    static combineEntityArrays(intoEntityArray, entityArrayToAdd) {
        for (let i = 0; i < entityArrayToAdd.length; i++) {
            let entity = entityArrayToAdd[i];
            if (EntityUtils.containsEntity(intoEntityArray, entity) === false) {
                intoEntityArray.push(entity);
            }
        }
    }
    static commonEntity(entityArrayOne, entityArrayTwo) {
        for (let i = 0; i < entityArrayOne.length; i++) {
            if (EntityUtils.containsEntity(entityArrayTwo, entityArrayOne[i]) === true) return true;
        }
        for (let i = 0; i < entityArrayTwo.length; i++) {
            if (EntityUtils.containsEntity(entityArrayOne, entityArrayTwo[i]) === true) return true;
        }
        return false;
    }
    static compareArrayOfEntities(entityArrayOne, entityArrayTwo) {
        for (let i = 0; i < entityArrayOne.length; i++) {
            if (EntityUtils.containsEntity(entityArrayTwo, entityArrayOne[i]) === false) return false;
        }
        for (let i = 0; i < entityArrayTwo.length; i++) {
            if (EntityUtils.containsEntity(entityArrayOne, entityArrayTwo[i]) === false) return false;
        }
        return true;
    }
    static containsEntity(arrayOfEntities, entity) {
        if (entity && entity.uuid && Array.isArray(arrayOfEntities)) {
            for (let i = 0; i < arrayOfEntities.length; i++) {
                if (arrayOfEntities[i].uuid === entity.uuid) return true;
            }
        }
        return false;
    }
    static containsMesh(entity, recursive = true) {
        if (! entity.isEntity) {
            console.warn(`EntityUtils.containsMesh: Object was not an Entity!`);
            return false;
        }
        let hasMesh = false;
        entity.traverseEntities((child) => {
            child.traverseComponents((component) => {
                hasMesh = hasMesh || (component.type === 'geometry');
                hasMesh = hasMesh || (component.type === 'mesh');
                hasMesh = hasMesh || (component.type === 'sprite');
            });
        }, recursive);
        return hasMesh;
    }
    static isImportant(entity) {
        let important = false;
        important = important || entity.parent === null;
        important = important || entity.isScene;
        important = important || entity.userData.flagLocked;
        return important;
    }
    static parentEntity(entity, immediateOnly = false) {
        while (entity && entity.parent && (entity.parent.isScene !== true)) {
            entity = entity.parent;
            if (immediateOnly && entity.isEntity) return entity;
        }
        return entity;
    }
    static parentScene(entity) {
        while (entity && entity.parent) {
            entity = entity.parent;
            if (entity.isScene) return entity;
        }
        return undefined;
    }
    static removeEntityFromArray(entityArray, entity) {
        let length = entityArray.length;
        for (let i = 0; i < length; i++) {
            if (entityArray[i].uuid === entity.uuid) {
                entityArray.splice(i, 1);
                length = entityArray.length;
            }
        }
    }
    static uuidArray(entityArray) {
        let uuidArray = [];
        for (let i = 0; i < entityArray.length; i++) {
            uuidArray.push(entityArray[i].uuid);
        }
        return uuidArray;
    }
}

const _m1 = new THREE.Matrix4();
const _camPosition = new THREE.Vector3();
const _camQuaternion = new THREE.Quaternion();
const _camScale = new THREE.Vector3();
const _lookQuaternion = new THREE.Quaternion();
const _lookUpVector = new THREE.Vector3();
const _objPosition$1 = new THREE.Vector3();
const _objScale$1 = new THREE.Vector3();
const _objQuaternion$1 = new THREE.Quaternion();
const _parentQuaternion = new THREE.Quaternion();
const _parentQuaternionInv = new THREE.Quaternion();
const _rotationDirection = new THREE.Euler();
const _rotationQuaternion = new THREE.Quaternion();
const _rotationQuaternionInv = new THREE.Quaternion();
const _worldPosition = new THREE.Vector3();
const _worldQuaternion = new THREE.Quaternion();
const _worldScale = new THREE.Vector3();
const _worldRotation = new THREE.Euler();
class Object3D extends THREE.Object3D {
    constructor() {
        super();
        this.isObject3DOverload = true;
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        function onRotationChange() {  }
        function onQuaternionChange() {  }
        rotation._onChange(onRotationChange);
        quaternion._onChange(onQuaternionChange);
        Object.defineProperties(this, {
            rotation: { configurable: true, enumerable: true, value: rotation },
            quaternion: { configurable: true, enumerable: true, value: quaternion },
        });
    }
    clone(recursive) {
		return new this.constructor().copy(this, recursive);
	}
    copy(source, recursive = true) {
        super.copy(source, false );
        ObjectUtils.copyLocalTransform(source, this, false );
        this.lookAtCamera = source.lookAtCamera;
        this.updateMatrix();
        if (recursive === true) {
			for (let i = 0; i < source.children.length; i++) {
                const clone = source.children[i].clone();
				this.add(clone);
			}
		}
        return this;
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
        if (! object || ! object.isObject3D) return;
        object.getWorldQuaternion(_worldQuaternion);
        object.getWorldScale(_worldScale);
        object.getWorldPosition(_worldPosition);
        object.removeFromParent();
        object.rotation.copy(_worldRotation.setFromQuaternion(_worldQuaternion, undefined, false));
        object.scale.copy(_worldScale);
        object.position.copy(_worldPosition);
        this.attach(object);
    }
    updateMatrix() {
        const camera = window.activeCamera;
        let lookAtCamera = this.lookAtCamera && camera && ! this.isScene;
        if (lookAtCamera && this.parent && this.parent.isObject3D) {
            this.traverseAncestors((parent) => {
                if (parent.lookAtCamera) lookAtCamera = false;
            });
        }
        if (lookAtCamera) {
            if (this.parent && this.parent.isObject3D) {
                this.parent.getWorldQuaternion(_parentQuaternion, false );
                _parentQuaternionInv.copy(_parentQuaternion).invert();
                this.quaternion.copy(_parentQuaternionInv);
            } else {
                this.quaternion.identity();
            }
                camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);
                _rotationQuaternion.setFromEuler(this.rotation, false);
                this.quaternion.multiply(_camQuaternion);
                this.quaternion.multiply(_rotationQuaternion);
        } else {
            this.quaternion.setFromEuler(this.rotation, false);
        }
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
    }
}

class Entity3D extends Object3D {
    constructor(name = '') {
        super();
        this.isEntity = true;
        this.isEntity3D = true;
        this.name = name;
        this.type = 'Entity3D';
        this.enabled = true;
        this.castShadow = true;
        this.receiveShadow = true;
        this.lookAtCamera = false;
        this.components = [];
        this.setFlag(ENTITY_FLAGS.LOCKED, false);
    }
    getReducedType() {
        if (this.isScene) return 'Scene';
        return (this.components.length === 1) ? Strings.capitalize(this.components[0].type.toLowerCase()) : 'Entity3D';
    }
    getFlag(flag) {
        return Boolean(this.userData[flag]);
    }
    setFlag(flag, value) {
        this.userData[flag] = value;
        return this;
    }
    addComponent(type, data = {}, includeDependencies = true) {
        const ComponentClass = ComponentManager.registered(type);
        if (ComponentClass === undefined) return undefined;
        const config = ComponentClass.config;
        let component = this.getComponent(type);
        if (ComponentClass.config.multiple || component === undefined) {
            component = new ComponentClass();
            this.components.push(component);
        } else {
            component.disable();
        }
        if (config.dependencies && includeDependencies) {
            const dependencies = config.dependencies;
            for (let i = 0, len = dependencies.length; i < len; i++) {
                if (this.getComponent(dependencies[i]) === undefined) {
                    this.addComponent(dependencies[i], {}, false);
                }
            }
        }
        component.entity = this;
        ComponentManager.sanitizeData(type, data);
        if (component.init) component.init(data);
        if (this.enabled) component.enable();
        return component;
    }
    getComponent(type, tag ) {
        if (tag === undefined) return this.getComponentByProperty('type', type);
        let components = this.getComponentsWithProperties('type', type, 'tag', tag);
        if (components.length > 0) return components[0];
        return undefined;
    }
    getComponentByTag(tag) {
        return this.getComponentByProperty('tag', tag);
    }
    getComponentByType(type) {
        return this.getComponentByProperty('type', type);
    }
    getComponentByProperty(property, value) {
        for (let i = 0, l = this.components.length; i < l; i++) {
            const component = this.components[i];
            if (component[property] === value) return component;
        }
        return undefined;
    }
    getComponentsWithProperties() {
        let components = [];
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            let hasProperties = true;
            for (let j = 0; j < arguments.length; j += 2) {
                if (component[arguments[j]] !== arguments[j+1]) {
                    hasProperties = false;
                    break;
                }
            }
            if (hasProperties) components.push(component);
        }
        return components;
    }
    removeComponent(component) {
        let index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.disable();
            component.dispose();
        } else {
            console.warn(`Entity3D.removeComponent: Component ${component.uuid}, type '${component.type}' not found`);
        }
        return component;
    }
    rebuildComponents() {
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            component.disable();
            component.init(component.toJSON());
            component.enable();
        }
    }
    traverseComponents(callback) {
        for (let i = 0; i < this.components.length; i++) {
            callback(this.components[i]);
        }
    }
    changeParent(newParent = undefined, newIndex = -1) {
        if (! newParent) newParent = this.parent;
        if (! newParent || ! newParent.isObject3D) return;
        const oldParent = this.parent;
        if (newIndex === -1 && oldParent) newIndex = oldParent.children.indexOf(this);
        newParent.safeAttach(this);
        if (newIndex !== -1) {
            newParent.children.splice(newIndex, 0, this);
            newParent.children.pop();
        }
    }
    addEntity(entity, index = -1, maintainWorldTransform = false) {
        if (! entity || ! entity.isObject3D) return this;
        if (index === undefined || index === null) index = -1;
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
        const filteredChildren = [];
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].isEntity3D) filteredChildren.push(children[i]);
        }
        return filteredChildren;
    }
    getEntityById(id) {
        return this.getEntityByProperty('id', id);
    }
    getEntityByName(name) {
        return this.getEntityByProperty('name', name);
    }
    getEntityByUuid(uuid) {
        return this.getEntityByProperty('uuid', uuid);
    }
    getEntityByProperty(name, value) {
        if (this[name] === value) return this;
        const entities = this.getEntities();
        for (let i = 0, l = entities.length; i < l; i++) {
            const child = entities[i];
            const entity = child.getEntityByProperty(name, value);
            if (entity) return entity;
        }
        return undefined;
    }
    removeEntity(entity, forceDelete = false) {
        if (! entity) return;
        if (! forceDelete && EntityUtils.isImportant(entity)) return;
        this.remove(entity);
    }
    traverseEntities(callback, recursive = true) {
        callback(this);
        if (recursive) {
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                if (child.isEntity3D) child.traverseEntities(callback);
            }
        }
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        this.dispose();
        super.copy(source, false );
        this.name = source.name;
        this.enabled = source.enabled;
        this.castShadow = source.castShadow;
        this.receiveShadow = source.receiveShadow;
        this.lookAtCamera = source.lookAtCamera;
        for (let flag in ENTITY_FLAGS) {
            this.setFlag(ENTITY_FLAGS[flag], source.getFlag(ENTITY_FLAGS[flag]));
        }
        const components = source.components;
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const clonedComponent = this.addComponent(component.type, component.toJSON(), false);
            clonedComponent.tag = component.tag;
            if (component.enabled !== true) clonedComponent.disable();
        }
        if (recursive === true) {
            const entities = source.getEntities();
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                this.add(entity.cloneEntity(recursive));
            }
        }
        return this;
    }
    dispose() {
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this.removeEntity(child, true );
            if (child.dispose) child.dispose();
        }
        while (this.components.length > 0) {
            const component = this.components[0];
            this.removeComponent(component);
        }
    }
    fromJSON(json) {
        const data = json.object;
        this.uuid = data.uuid;
        if (data.name !== undefined) this.name = data.name;
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.castShadow !== undefined) this.castShadow = data.castShadow;
        if (data.receiveShadow !== undefined) this.receiveShadow = data.receiveShadow;
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.position !== undefined) this.position.fromArray(data.position);
        if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        if (data.scale !== undefined) this.scale.fromArray(data.scale);
        if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;
        if (data.layers !== undefined) this.layers.mask = data.layers;
        if (data.visible !== undefined) this.visible = data.visible;
        if (data.frustumCulled !== undefined) this.frustumCulled = data.frustumCulled;
        if (data.renderOrder !== undefined) this.renderOrder = data.renderOrder;
        if (data.userData !== undefined) this.userData = data.userData;
        for (let key in json.object.flags) {
            this.setFlag(key, json.object.flags[key]);
        }
        for (let i = 0; i < json.object.components.length; i++) {
            const componentData = json.object.components[i];
            if (componentData && componentData.base && componentData.base.type) {
                const component = this.addComponent(componentData.base.type, componentData, false);
                if (componentData.enabled === false) component.disable();
                component.tag = componentData.base.tag;
            }
        }
        if (data.entities !== undefined) {
            for (let i = 0; i < json.object.entities.length; i++) {
                const entity = new Entity3D().fromJSON(json.object.entities[i]);
                this.add(entity);
            }
        }
        this.updateMatrix();
        return this;
    }
    toJSON() {
        const json = {
            object: {
                name: this.name,
                type: this.type,
                uuid: this.uuid,
                components: [],
                flags: {},
            }
        };
        for (let key in ENTITY_FLAGS) {
            json.object.flags[key] = this.getFlag(key);
        }
        for (let i = 0; i < this.components.length; i++) {
            json.object.components.push(this.components[i].toJSON());
        }
        json.object.enabled = this.enabled;
        json.object.castShadow = this.castShadow;
        json.object.receiveShadow = this.receiveShadow;
        json.object.lookAtCamera = this.lookAtCamera;
        json.object.position  = this.position.toArray();
        json.object.rotation = this.rotation.toArray();
        json.object.scale = this.scale.toArray();
        json.object.matrixAutoUpdate = this.matrixAutoUpdate;
        json.object.layers = this.layers.mask;
        if (this.visible === false) json.object.visible = false;
        if (this.frustumCulled === false) json.object.frustumCulled = false;
        if (this.renderOrder !== 0) json.object.renderOrder = this.renderOrder;
        if (JSON.stringify(this.userData) !== '{}') json.object.userData = this.userData;
        const childEntities = this.getEntities();
        if (childEntities.length > 0) {
            json.object.entities = [];
            for (let i = 0; i < childEntities.length; i++) {
                json.object.entities.push(childEntities[i].toJSON());
            }
        }
        return json;
    }
}

class Scene3D extends Entity3D {
    constructor(name = 'Start Scene') {
        super();
        this.isScene = true;
        this.isScene3D = true;
        this.name = name;
        this.type = 'Scene3D';
        this.background = null;
        this.environment = null;
        this.fog = null;
        this.overrideMaterial = null;
        this.autoUpdate = true;
        this.shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(100000, 100000),
            new THREE.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
        );
        this.shadowPlane.name = 'ShadowPlane';
        this.shadowPlane.userData.flagIgnore = true;
        this.shadowPlane.userData.flagLocked = true;
        this.shadowPlane.rotation.x = - Math.PI / 2;
        this.shadowPlane.castShadow = false;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.visible = false;
        this.add(this.shadowPlane);
    }
    fromJSON(json) {
        const data = json.object;
        if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
                this.background = new THREE.Color(data.background);
            } else {
                const backgroundTexture = AssetManager.getAsset(data.background);
                if (backgroundTexture && backgroundTexture.isTexture) this.background = backgroundTexture;
            }
        }
        if (data.environment !== undefined) {
            const environmentTexture = AssetManager.getAsset(data.background);
            if (environmentTexture && environmentTexture.isTexture) this.environment = environmentTexture;
        }
        if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
                this.fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
                this.fog = new THREE.FogExp2(data.fog.color, data.fog.density);
            }
        }
        super.fromJSON(json);
        return this;
    }
    toJSON() {
        const json = super.toJSON();
        if (this.fog) json.object.fog = this.fog.toJSON();
        return json;
    }
}

class World3D {
    constructor(name = 'World 1') {
        this.isWorld = true;
        this.isWorld3D = true;
        this.name = name;
        this.type = 'World3D';
        this.uuid = MathUtils.uuid();
        this.order = 0;
        this.startScene = null;
        this.lastEditorScene = null;
        this.sceneNodes = {};
    }
    addScene(scene) {
        if (scene && scene.type === 'Scene3D') {
            if (this.sceneNodes[scene.uuid]) {
                console.warn(`World3D.addScene: Scene ('${scene.name}') already added`, scene);
            } else {
                this.sceneNodes[scene.uuid] = {
                    uuid: scene.uuid,
                    order: this.order ++,
                };
                if (! this.startScene) this.startScene = scene.uuid;
                if (! this.lastEditorScene) this.lastEditorScene = scene.uuid;
            }
        } else {
            console.error(`'World3D.addScene: Scene not of type 'Scene3D'`, scene);
        }
        return this;
    }
    fromJSON(json) {
        const data = json.object;
        this.name = data.name;
        this.uuid = data.uuid;
        this.order = data.order;
        this.startScene = data.startScene;
        this.lastEditorScene = data.lastEditorScene;
        this.sceneNodes = data.sceneNodes;
        return this;
    }
    toJSON() {
        const json = {
            object: {
                name: this.name,
                type: this.type,
                uuid: this.uuid,
                order: this.order,
                startScene: this.startScene,
                lastEditorScene: this.lastEditorScene,
                sceneNodes: this.sceneNodes,
            }
        };
        return json;
    }
}

class Project {
    constructor(name = 'My Project') {
        this.isProject = true;
        this.name = name;
        this.uuid = MathUtils.uuid();
        this.type = 'Project';
        this.scripts = {};
        this.scenes = {};
        this.worlds = {};
    }
    addWorld(world) {
        if (world && WORLD_TYPES[world.type]) {
            this.worlds[world.uuid] = world;
            if (this.activeWorldUuid == null) this.activeWorldUuid = world.uuid;
        } else {
            console.error(`Project.addWorld: World type (${world.type}) not a valid world type`, world);
        }
        return this;
    }
    getWorldByName(name) {
        return this.getWorldByProperty('name', name);
    }
    getWorldByUuid(uuid) {
        return this.worlds[uuid];
    }
    getWorldByProperty(property, value) {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (world[property] === value) return world;
        }
    }
    addScene(scene) {
        if (scene && SCENE_TYPES[scene.type]) {
            if (this.scenes[scene.uuid]) {
                console.warn(`Project.addScene: Scene ('${scene.name}') already added`, scene);
            } else {
                this.scenes[scene.uuid] = scene;
            }
        } else {
            console.error(`Project.addScene: Scene type (${scene.type}) not a valid scene type`, scene);
        }
        return this;
    }
    getFirstScene() {
        const sceneList = Object.keys(this.scenes);
        return (sceneList.length > 0) ? this.scenes[sceneList[0]] : null;
    }
    getSceneByName(name) {
        return this.getSceneByProperty('name', name);
    }
    getSceneByUuid(uuid) {
        return this.scenes[uuid];
    }
    getSceneByProperty(property, value) {
        for (const uuid in this.scenes) {
            const scene = this.scenes[uuid];
            if (scene[property] === value) return scene;
        }
    }
    removeScene(scene) {
        if (scene.isScene !== true) return;
        const entities = scene.getEntities();
        for (let i = entities.length - 1; i >= 0; i--) {
            scene.removeEntity(entities[i], true);
            entities[i].dispose();
        }
        delete this.scenes[scene.uuid];
    }
    traverseScenes(callback) {
        for (let uuid in this.scenes) {
            const scene = this.scenes[uuid];
            scene.traverseEntities(callback);
        }
    }
    findEntityByUuid(uuid, searchAllScenes = false) {
        let sceneList = [];
        let activeScene = null;
        if (window.editor) activeScene = window.editor.viewport.scene;
        if (searchAllScenes) {
            sceneList = Array.from(this.scenes);
            const fromIndex = sceneList.indexOf(activeScene);
            const toIndex = 0;
            if (activeScene && fromIndex !== -1) {
                arr.splice(fromIndex, 1);
                arr.splice(toIndex, 0, activeScene);
            }
        } else if (activeScene) {
            sceneList.push(activeScene);
        }
        for (let i = 0; i < sceneList.length; i++) {
            const entity = sceneList[i].getEntityByProperty('uuid', uuid);
            if (entity) return entity;
        }
        return undefined;
    }
    addScript(entity, script) {
        const key = entity.uuid;
        if (! this.scripts[key]) this.scripts[key] = [];
        this.scripts[key].push(script);
        return this;
    }
    removeScript(entity, script) {
        const key = entity.uuid;
        if (! this.scripts[key]) return;
        const index = this.scripts[key].indexOf(script);
        if (index !== -1) this.scripts[key].splice(index, 1);
    }
    clear() {
        const sceneIds = Object.keys(this.scenes);
        for (let i = 0; i < sceneIds.length; i++) {
            let scene = this.scenes[sceneIds[i]];
            this.removeScene(scene);
        }
        this.name = 'My Project';
        this.uuid = MathUtils.uuid();
    }
    fromJSON(json, loadAssets = true) {
        const metaType = (json.metadata) ? json.metadata.type : 'Undefined';
        if (metaType !== 'Onsight') {
            console.error(`Project.fromJSON: Unknown project type ('${metaType}'), expected 'Onsight'`);
            return;
        }
        const metaVersion = json.metadata.version;
        if (metaVersion !== VERSION) {
            console.warn(`Project.fromJSON: Project saved in 'v${metaVersion}', attempting to load with 'v${VERSION}'`);
        }
        if (! json.object || json.object.type !== this.type) {
            console.error(`Project.fromJSON: Save file corrupt, no 'Project' object found!`);
            return;
        }
        this.clear();
        if (loadAssets) AssetManager.fromJSON(json);
        this.name = json.object.name;
        this.uuid = json.object.uuid;
        this.scripts = json.scripts;
        for (let i = 0; i < json.worlds.length; i++) {
            switch (json.worlds[i].object.type) {
                case 'World3D': this.addWorld(new World3D().fromJSON(json.worlds[i])); break;
            }
        }
        for (let i = 0; i < json.scenes.length; i++) {
            switch (json.scenes[i].object.type) {
                case 'Scene3D': this.addScene(new Scene3D().fromJSON(json.scenes[i])); break;
            }
        }
        return this;
    }
    toJSON() {
        const meta = {};
        const json = AssetManager.toJSON(meta);
        json.metadata = {
            type: 'Onsight',
            version: VERSION,
            generator: 'Onsight.Project.toJSON',
        };
        json.object = {
            name: this.name,
            type: this.type,
            uuid: this.uuid,
        };
        json.scripts = this.scripts;
        json.scenes = [];
        json.worlds = [];
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            json.worlds.push(world.toJSON());
        }
        for (const uuid in this.scenes) {
            const scene = this.scenes[uuid];
            json.scenes.push(scene.toJSON());
        }
        return json;
    }
}

class App {
    constructor() {
        const self = this;
        this.backend = {};
        this.backend.renderer = BACKENDS.RENDERER_3D.THREE;
        this.backend.physics = BACKENDS.PHYSICS_3D.RAPIER;
        let player = this;
        let project = new Project();
        let renderer;
        let camera;
        let scene;
        let state = APP_STATES.STOPPED;
        Object.defineProperty(self, 'scene', {
            get: function() { return scene; },
            set: function(value) { scene = value; }
        });
        this.width = 1;
        this.height = 1;
        this.wantsScreenshot = false;
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = true;
        this.dom = document.createElement('div');
        this.dom.appendChild(renderer.domElement);
        let scriptGlobals = 'player,renderer,scene,camera';
        let events = {
            init: [],
            update: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
        };
        this.load = function(json, loadAssets = true) {
            project.fromJSON(json, loadAssets);
            this.scene = project.getFirstScene();
            this.setCamera(CameraUtils.createPerspective(500, 500, true));
            camera.position.x = 0;
            camera.position.y = 0;
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            document.addEventListener('pointerdown', onPointerDown);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointermove', onPointerMove);
            let scriptFunctions = '';
            let scriptReturnObject = {};
            for (let eventKey in events) {
                scriptFunctions += eventKey + ',';
                scriptReturnObject[eventKey] = eventKey;
            }
            scriptFunctions = scriptFunctions.replace(/.$/, '');
            let scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');
            function loadScripts(object) {
                const scripts = project.scripts[object.uuid];
                if (scripts !== undefined && scripts.length > 0) {
                    for (let i = 0, l = scripts.length; i < l; i++) {
                        let script = scripts[i];
                        if (script.errors) {
                            console.warn(`Entity '${object.name}' has errors in script '${script.name}'. Script will not be loaded!`);
                        } else {
                            let body = `${script.source} \n return ${scriptReturnString};`;
                            let functions = (new Function(scriptGlobals, scriptFunctions, body).bind(object))(player, renderer, scene, camera);
                            for (let name in functions) {
                                if (! functions[name]) continue;
                                if (events[name] === undefined) {
                                    console.warn(`App: Event type not supported ('${name}')`);
                                    continue;
                                }
                                events[name].push(functions[name].bind(object));
                            }
                        }
                    }
                }
            }
            scene.traverse(loadScripts);
            dispatch(events.init, arguments);
        };
        function dispatch(array, event) {
            for (let i = 0, l = array.length; i < l; i++) {
                array[i](event);
            }
        }
        let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        let requestId = null;
        let time, startTime, prevTime;
        function animate() {
            time = performance.now();
            try {
                let timePassed = time - startTime;
                let delta = time - prevTime;
                if (state === APP_STATES.PLAYING) {
                    dispatch(events.update, { time: timePassed, delta: delta });
                }
            } catch (e) {
                console.error((e.message || e), (e.stack || ''));
            }
            window.activeCamera = camera;
            renderer.render(scene, camera);
            if (self.wantsScreenshot === true) {
                let filename = project.name + ' ' + new Date().toLocaleString() + '.png';
                let strMime = 'image/png';
                let imgData = renderer.domElement.toDataURL(strMime);
                System.saveImage(imgData, filename);
                self.wantsScreenshot = false;
            }
            prevTime = time;
            requestId = requestAnimationFrame(animate);
        }
        this.play = function() {
            startTime = prevTime = performance.now();
            state = APP_STATES.PLAYING;
            requestId = requestAnimationFrame(animate);
        };
        this.pause = function() {
            if (state === APP_STATES.PLAYING) {
                state = APP_STATES.PAUSED;
            } else if (state === APP_STATES.PAUSED) {
                state = APP_STATES.PLAYING;
            }
        };
        this.stop = function() {
            state = APP_STATES.STOPPED;
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointermove', onPointerMove);
            ObjectUtils.clearObject(camera);
            ObjectUtils.clearObject(scene);
            for (let key in events) {
                events[key].length = 0;
            }
            if (requestId) {
                cancelAnimationFrame(requestId);
                requestId = null;
            }
        };
        function onKeyDown(event) { dispatch(events.keydown, event); }
        function onKeyUp(event) { dispatch(events.keyup, event); }
        function onPointerDown(event) { dispatch(events.pointerdown, event); }
        function onPointerUp(event) { dispatch(events.pointerup, event); }
        function onPointerMove(event) { dispatch(events.pointermove, event); }
        this.getRenderer = function() {
            return renderer;
        };
        this.appState = function() {
            return state;
        };
        this.setCamera = function(value) {
            camera = value;
        };
        this.setPixelRatio = function(pixelRatio) {
            renderer.setPixelRatio(pixelRatio);
        };
        this.setSize = function(width, height) {
            this.width = width;
            this.height = height;
            if (camera) CameraUtils.updateCamera(camera, width, height);
            if (renderer) renderer.setSize(width, height);
        };
        this.gameCoordinates = function(fromEvent) {
            const rect = this.dom.getBoundingClientRect();
            let eventX = fromEvent.clientX - rect.left;
            let eventY = fromEvent.clientY - rect.top;
            let x =  ((eventX / rect.width ) * (rect.width * 2)) - rect.width;
            let y = -((eventY / rect.height) * (rect.height * 2)) + rect.height;
            let vec = new THREE.Vector3(x, y, 0);
            vec.unproject(camera);
            return vec;
        };
    }
}

class EntityPool {
    constructor() {
        this.entities = [];
        this.expand();
    }
    getEntities(n) {
        if(n > this.entities.length) this.expand(n - this.entities.length);
        return this.entities.splice(0, n);
    }
    getEntity() {
        if(! this.entities.length) this.expand();
        return this.entities.pop();
    }
    recycle(entity) {
        entity.dispose();
        this.entities.push(entity);
    }
    expand(n = 10) {
        for(let i = 0; i < n; i++) {
            this.entities.push(new Entity3D());
        }
    }
}

class Script {
    constructor() {
        this.isScript = true;
        this.type = 'Script';
        this.name ='New Script';
        this.errors = false;
        this.source =
            '// Code outside of lifecycle and event listeners is immediately executed when the script is loaded\n\n' +
            '// Events - The following events are supported:\n' +
            '//\t\tkeydown, keyup, pointerdown, pointerup, pointermove\n\n' +
            '// Variables - The following globals are accessible to scripts:\n' +
            '//\t\tthis (entity which owns the script), player, renderer, scene, camera'+
            '\n\n\n' +
            '// Executed when the entity is loaded\n' +
            'function init() {\n\t\n}' +
            '\n\n\n' +
            '// Executed right before a frame is going to be rendered\n' +
            '// - event.time: total elapsed time, in milliseconds\n' +
            '// - event.delta: time since last frame, in milliseconds\n' +
            'function update(event) {\n\t\n}' +
            '\n\n\n' +
            '// Example pointer event\n' +
            'function pointermove(event) {\n\t\n}';
    }
}

class Vectors {
    static absolute(vec3) {
        vec3.x = Math.abs(vec3.x);
        vec3.y = Math.abs(vec3.y);
        vec3.z = Math.abs(vec3.z);
    }
    static noZero(vec3, min = 0.001) {
        if (MathUtils.fuzzyFloat(vec3.x, 0, min)) vec3.x = (vec3.x < 0) ? (min * -1) : min;
		if (MathUtils.fuzzyFloat(vec3.y, 0, min)) vec3.y = (vec3.y < 0) ? (min * -1) : min;
		if (MathUtils.fuzzyFloat(vec3.z, 0, min)) vec3.z = (vec3.z < 0) ? (min * -1) : min;
    }
    static printOut(vec3, name = '') {
        if (name !== '') name += ' - ';
        console.info(`${name}X: ${vec3.x}, Y: ${vec3.y}, Z: ${vec3.z}`);
    }
    static round(vec3, decimalPlaces = 0) {
        const shift = Math.pow(10, decimalPlaces);
        vec3.x = Math.round(vec3.x * shift) / shift;
        vec3.y = Math.round(vec3.y * shift) / shift;
        vec3.z = Math.round(vec3.z * shift) / shift;
    }
    static sanity(vec3) {
        if (isNaN(vec3.x)) vec3.x = 0;
        if (isNaN(vec3.y)) vec3.y = 0;
        if (isNaN(vec3.z)) vec3.z = 0;
    }
}

const _uv = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];
const _vertex = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
const _temp = new THREE.Vector3();
class GeometryUtils {
    static addAttribute(geometry, attributeName = 'color', stride = 3, fill = 0) {
        if (! geometry.getAttribute(attributeName)) {
            let array = new Float32Array(geometry.attributes.position.count * stride).fill(fill);
	        const attribute = new THREE.BufferAttribute(array, stride, true).setUsage(THREE.DynamicDrawUsage);
	        geometry.setAttribute(attributeName, attribute);
        }
        return geometry;
    }
    static coloredMesh(mesh) {
        if (! mesh.geometry) return mesh;
        if (! mesh.material) return mesh;
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
        let boxSize = new THREE.Vector3();
        geometry.computeBoundingBox();
        geometry.boundingBox.getSize(boxSize);
        if (type === 'max') {
            return Math.max(boxSize.x, boxSize.y, boxSize.z);
        } else  {
            return Math.min(boxSize.x, boxSize.y, boxSize.z);
        }
    }
    static repeatTexture(geometry, s, t) {
        if (! geometry) return;
        if (geometry.attributes && geometry.attributes.uv && geometry.attributes.uv.array) {
            for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
                geometry.attributes.uv.array[i + 0] *= s;
                geometry.attributes.uv.array[i + 1] *= t;
            }
            geometry.attributes.uv.needsUpdate = true;
        }
    }
    static uvFlip(geometry, x = true, y = true) {
        if (! geometry || ! geometry.isBufferGeometry) return;
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
        if (transformMatrix === undefined) transformMatrix = new THREE.Matrix4();
        let geometrySize = GeometryUtils.modelSize(geometry);
        let size = (geometrySize / 2);
        let bbox = new THREE.Box3(new THREE.Vector3(-size, -size, -size), new THREE.Vector3(size, size, size));
        let boxCenter = new THREE.Vector3();
        geometry.boundingBox.getCenter(boxCenter);
        const centerMatrix = new THREE.Matrix4().makeTranslation(-boxCenter.x, -boxCenter.y, -boxCenter.z);
        const coords = [];
        coords.length = 2 * geometry.attributes.position.array.length / 3;
        const pos = geometry.attributes.position.array;
        if (geometry.index) {
            for (let vi = 0; vi < geometry.index.array.length; vi += 3) {
                const idx0 = geometry.index.array[vi + 0];
                const idx1 = geometry.index.array[vi + 1];
                const idx2 = geometry.index.array[vi + 2];
                const v0 = new THREE.Vector3(pos[(3 * idx0) + 0], pos[(3 * idx0) + 1], pos[(3 * idx0) + 2]);
                const v1 = new THREE.Vector3(pos[(3 * idx1) + 0], pos[(3 * idx1) + 1], pos[(3 * idx1) + 2]);
                const v2 = new THREE.Vector3(pos[(3 * idx2) + 0], pos[(3 * idx2) + 1], pos[(3 * idx2) + 2]);
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
                const v0 = new THREE.Vector3(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
                const v1 = new THREE.Vector3(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
                const v2 = new THREE.Vector3(pos[vi + 6], pos[vi + 7], pos[vi + 8]);
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
            geometry.addAttribute('uv', new THREE.Float32BufferAttribute(coords, 2));
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
            const n = new THREE.Vector3();
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
        const hasUV = ! (geometry.attributes.uv === undefined);
        if (! hasUV) geometry.addAttribute('uv', new THREE.Float32BufferAttribute(coords, 2));
        const setU = (! hasUV || setCoords === 'u' || setCoords === 'uv');
        const setV = (! hasUV || setCoords === 'v' || setCoords === 'uv');
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
            const uv = new THREE.Vector2(1 - canvasPoint.x, 1 - canvasPoint.y);
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

const _color = new THREE.Color();
const _position = new THREE.Vector3();
class SVGBuilder {
    static createFromPaths(target, paths, onLoad, name = '') {
        const drawFills = true;
        const drawStrokes = true;
        let startZ = 0, zStep = 0.001;
        let fillNumber = 0, strokeNumber = 0;
        paths.forEach((path) => {
            let fillColor = path.userData.style.fill;
            let fillOpacity = path.userData.style.fillOpacity;
            if (! fillOpacity && fillOpacity !== 0) fillOpacity = 1;
            if (drawFills && fillColor !== undefined && fillColor !== 'none') {
                const shapes = SVGLoader.createShapes(path);
                shapes.forEach((shape) => {
                    let entityName = `Fill ${fillNumber}`;
                    if (name !== '') entityName = name + ' ' + entityName;
                    const entity = new Entity3D(entityName);
                    const depth = 0.256;
                    const scaleDown = 0.001;
                    function scaleCurve(curve) {
                        if (curve.v0) curve.v0.multiplyScalar(scaleDown);
                        if (curve.v1) curve.v1.multiplyScalar(scaleDown);
                        if (curve.v2) curve.v2.multiplyScalar(scaleDown);
                        if (curve.v3) curve.v3.multiplyScalar(scaleDown);
                        if (curve.aX) curve.aX *= scaleDown;
                        if (curve.aY) curve.aY *= scaleDown;
                        if (curve.xRadius) curve.xRadius *= scaleDown;
                        if (curve.yRadius) curve.yRadius *= scaleDown;
                    }
                    for (let c = 0; c < shape.curves.length; c++) scaleCurve(shape.curves[c]);
                    for (let h = 0; h < shape.holes.length; h++) {
                        for (let c = 0; c < shape.holes[h].curves.length; c++) {
                            scaleCurve(shape.holes[h].curves[c]);
                        }
                    }
                    const geometry = new THREE.ExtrudeGeometry(shape, {
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
                    geometry.boundingBox.getCenter(_position);
                    geometry.center();
                    entity.position.copy(_position);
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
            const center = new THREE.Vector3();
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
            _renderer$1 = new THREE.WebGLRenderer({ alpha: true });
            _renderer$1.setClearColor(0xffffff, 0);
            _renderer$1.setSize(512, 512, false);
        }
        if (MathUtils.isNumber(width) && MathUtils.isNumber(height)) {
            _renderer$1.setSize(width, height, false);
        }
        return _renderer$1;
    }
    static renderGeometryToCanvas(canvas, geometry, geometryColor = 0xffffff) {
        const scene = new THREE.Scene();
        scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 1.5));
        const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height);
        camera.position.set(0, 0, 1);
        const material = new THREE.MeshStandardMaterial({ color: geometryColor });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        CameraUtils.fitCameraToObject(camera, mesh);
        const renderer = RenderUtils.offscreenRenderer(canvas.width, canvas.height);
        renderer.render(scene, camera);
        material.dispose();
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
        }
    }
    static renderTextureToCanvas(canvas, texture) {
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: true });
        const quad = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(quad, material);
        scene.add(mesh);
        const image = texture.image;
        const renderer = RenderUtils.offscreenRenderer(image.width, image.height);
        renderer.render(scene, camera);
        quad.dispose();
        material.dispose();
        const context = canvas.getContext('2d');
        if (context) {
            const sAspect = image.width / image.height;
            const dAspect = canvas.width / canvas.height;
            let dx, dy, dw, dh, shrink;
            if (sAspect < dAspect) {
                dh = (image.height > canvas.height) ? canvas.height : image.height;
                shrink = Math.min(1, canvas.height / image.height);
                dw = image.width * shrink;
            } else {
                dw = (image.width > canvas.width) ? canvas.width : image.width;
                shrink = Math.min(1, canvas.width / image.width);
                dh = image.height * shrink;
            }
            dx = (canvas.width - dw) / 2;
            dy = (canvas.height - dh) / 2;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(renderer.domElement, 0, 0, image.width, image.height, dx, dy, dw, dh);
        }
    }
}

class CapsuleGeometry extends THREE.BufferGeometry {
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
        radiusTop = MathUtils.clamp(radiusTop, 0.001, height);
        radiusBottom = MathUtils.clamp(radiusBottom, 0.001, height);
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
        let indices = new THREE.BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount), 1);
        let vertices = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        let normals = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        let uvs = new THREE.BufferAttribute(new Float32Array(vertexCount * 2), 2);
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
            let normal = new THREE.Vector3();
            let vertex = new THREE.Vector3();
            let cosAlpha = Math.cos(alpha);
            let sinAlpha = Math.sin(alpha);
            let cone_length =
                new THREE.Vector2(radiusTop * sinAlpha, halfHeight + radiusTop * cosAlpha)
                    .sub(new THREE.Vector2(radiusBottom * sinAlpha, -halfHeight + radiusBottom * cosAlpha))
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
        const sphereCenterTop = new THREE.Vector3(c0.x, c0.y, c0.z);
        const sphereCenterBottom = new THREE.Vector3(c1.x, c1.y, c1.z);
        const radiusTop = r0;
        const radiusBottom = r1;
        let height = sphereCenterTop.distanceTo(sphereCenterBottom);
        if (height < Math.abs(r0 - r1)){
            let g = new THREE.SphereGeometry(r1, radialSegments, capsBottomSegments, thetaStart, thetaLength);
            g.translate(r1.x, r1.y, r1.z);
            return g;
        }
        const alpha = Math.acos((radiusBottom - radiusTop) / height);
        const cosAlpha = Math.cos(alpha);
        const rotationMatrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const capsuleModelUnitVector = new THREE.Vector3(0, 1, 0);
        const capsuleUnitVector = new THREE.Vector3();
        capsuleUnitVector.subVectors(sphereCenterTop, sphereCenterBottom);
        capsuleUnitVector.normalize();
        quaternion.setFromUnitVectors(capsuleModelUnitVector, capsuleUnitVector);
        rotationMatrix.makeRotationFromQuaternion(quaternion);
        const translationMatrix = new THREE.Matrix4();
        const cylVec = new THREE.Vector3();
        cylVec.subVectors(sphereCenterTop, sphereCenterBottom);
        cylVec.normalize();
        let cylTopPoint = new THREE.Vector3();
        cylTopPoint = sphereCenterTop;
        cylTopPoint.addScaledVector(cylVec, cosAlpha * radiusTop);
        let cylBottomPoint = new THREE.Vector3();
        cylBottomPoint = sphereCenterBottom;
        cylBottomPoint.addScaledVector(cylVec, cosAlpha * radiusBottom);
        const dir = new THREE.Vector3();
        dir.subVectors(cylBottomPoint, cylTopPoint);
        dir.normalize();
        const middlePoint = new THREE.Vector3();
        middlePoint.lerpVectors(cylBottomPoint, cylTopPoint, 0.5);
        translationMatrix.makeTranslation(middlePoint.x, middlePoint.y, middlePoint.z);
        let g = new CapsuleGeometry(radiusBottom, radiusTop, height, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength);
        g.applyMatrix(rotationMatrix);
        g.applyMatrix(translationMatrix);
        return g;
    }
}

class CylinderGeometry extends THREE.BufferGeometry {
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
        if (! openEnded) {
            if (radiusTop > 0) generateCap(true);
            if (radiusBottom > 0) generateCap(false);
        }
        this.setIndex(indices);
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        function generateTorso() {
            const normal = new THREE.Vector3();
            const vertex = new THREE.Vector3();
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
                    const vecA = new THREE.Vector3(vertices[(a * 3) + 0], vertices[(a * 3) + 1], vertices[(a * 3) + 2]);
                    const vecB = new THREE.Vector3(vertices[(b * 3) + 0], vertices[(b * 3) + 1], vertices[(b * 3) + 2]);
                    const vecC = new THREE.Vector3(vertices[(c * 3) + 0], vertices[(c * 3) + 1], vertices[(c * 3) + 2]);
                    const vecD = new THREE.Vector3(vertices[(d * 3) + 0], vertices[(d * 3) + 1], vertices[(d * 3) + 2]);
                    const triangleABD = new THREE.Triangle(vecA, vecB, vecD);
                    const triangleBCD = new THREE.Triangle(vecB, vecC, vecD);
                    if (triangleABD.getArea() > 0.0001) { indices.push(a, b, d); groupCount += 3; }
                    if (triangleBCD.getArea() > 0.0001) { indices.push(b, c, d); groupCount += 3; }
                }
            }
            scope.addGroup(groupStart, groupCount, 0);
            groupStart += groupCount;
        }
        function generateCap(top) {
            const centerIndexStart = index;
            const uv = new THREE.Vector2();
            const vertex = new THREE.Vector3();
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

class PrismGeometry extends THREE.ExtrudeGeometry {
    constructor(vertices, height) {
        const shape = new THREE.Shape();
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

function setWireframeMaterialDefaults(material) {
    material.transparent = true;
    material.resolution = new THREE.Vector2(1024, 1024);
    material.depthTest = true;
    material.depthWrite = false;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.side = THREE.DoubleSide;
    material.alphaToCoverage = true;
}
const _objQuaternion = new THREE.Quaternion();
const _objScale = new THREE.Vector3();
const _objPosition = new THREE.Vector3();
const _tempScale = new THREE.Vector3();
const _tempSize = new THREE.Vector3();
const _box = new THREE.Box3();
const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);
class BasicLine extends THREE.LineSegments {
    constructor(x1, y1, z1, x2, y2, z2, boxColor = 0xffffff) {
        const vertices = [
            x1, y1, z1,
            x2, y2, z2,
        ];
        const indices = [0, 1];
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setIndex(indices);
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color: boxColor });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.wireframe = true;
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
class FatLine extends Line2 {
    constructor(x1, y1, z1, x2, y2, z2, lineWidth = 1, boxColor = 0xffffff) {
        const lineGeometry = new LineGeometry();
        const lineMaterial = new LineMaterial({
            color: boxColor,
            linewidth: lineWidth,
        });
        setWireframeMaterialDefaults(lineMaterial);
        const positions = [x1, y1, z1, x2, y2, z2];
        lineGeometry.setPositions(positions);
        super(lineGeometry, lineMaterial);
        this.computeLineDistances();
        this.scale.set(1, 1, 1);
        this.point1 = new THREE.Vector3(x1, y1, z1);
        this.point2 = new THREE.Vector3(x2, y2, z2);
    }
    clone() {
        return new this.constructor(this.point1.x, this.point1.y, this.point1.z,
            this.point2.x, this.point2.y, this.point2.z).copy(this, true);
    }
    setPoints(point1, point2) {
        Vectors.sanity(point1);
        Vectors.sanity(point2);
        this.point1.copy(point1);
        this.point2.copy(point2);
        const positions = [point1.x, point1.y, point1.z, point2.x, point2.y, point2.z];
        this.geometry.setPositions(positions);
        this.computeLineDistances();
    }
}
class BasicWireBox extends THREE.LineSegments {
    constructor(object, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
        const lineGeometry = new THREE.WireframeGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: boxColor,
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        super(lineGeometry, lineMaterial);
        this._positions = new Float32Array(8 * 3);
        this.points = [];
        for (let i = 0; i < 8; i++) {
            this.points.push(new THREE.Vector3());
        }
        if (object) this.updateFromObject(object, matchTransform);
        this.clone = function() {
            return new this.constructor(object, boxColor, opacity, matchTransform).copy(this, true);
        };
    }
    disableDepthTest() {
        this.material.depthTest = false;
    }
    updateFromObject(object, matchTransform) {
        const updateObject = object.clone();
        if (matchTransform) {
            object.getWorldPosition(_objPosition);
            object.getWorldQuaternion(_objQuaternion);
            object.getWorldScale(_objScale);
            updateObject.lookAtCamera = false;
            updateObject.position.set(0, 0, 0);
            updateObject.rotation.set(0, 0, 0);
            updateObject.scale.set(1, 1, 1);
            updateObject.updateMatrixWorld(true);
        }
        _box.setFromObject(updateObject);
        const min = _box.min;
        const max = _box.max;
        Vectors.sanity(_box.min);
        Vectors.sanity(_box.max);
        const array = this._positions;
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
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (matchTransform) {
            this.setRotationFromQuaternion(_objQuaternion);
            this.scale.set(_objScale.x, _objScale.y, _objScale.z);
            this.position.set(_objPosition.x, _objPosition.y, _objPosition.z);
            this.updateMatrix();
        }
        this.updateMatrixWorld(true);
        ObjectUtils.clearObject(updateObject);
    }
    getPoints() {
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            this.points[i].x = this.geometry.attributes.position.array[index + 0];
            this.points[i].y = this.geometry.attributes.position.array[index + 1];
            this.points[i].z = this.geometry.attributes.position.array[index + 2];
            this.localToWorld(this.points[i]);
        }
        return this.points;
    }
    getLocalPoints() {
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            this.points[i].x = this._positions[index + 0];
            this.points[i].y = this._positions[index + 1];
            this.points[i].z = this._positions[index + 2];
        }
        return this.points;
    }
    getBox3(targetBox3) {
        const points = this.getLocalPoints();
        targetBox3 = targetBox3 ?? new THREE.Box3();
        targetBox3.min.x = points[6].x;
        targetBox3.min.y = points[6].y;
        targetBox3.min.z = points[6].z;
        targetBox3.max.x = points[0].x;
        targetBox3.max.y = points[0].y;
        targetBox3.max.z = points[0].z;
    }
}
class FatWireBox extends Line2 {
    constructor(object, lineWidth = 1, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
        const lineGeometry = new LineSegmentsGeometry();
        const lineMaterial = new LineMaterial({
            color: boxColor,
            linewidth: lineWidth,
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.depthTest = false;
        super(lineGeometry, lineMaterial);
        this._positions = new Float32Array(8 * 3);
        this.points = [];
        for (let i = 0; i <  8; i++) {
            this.points.push(new THREE.Vector3());
        }
        if (object) this.updateFromObject(object, matchTransform);
        this.clone = function() {
            return new this.constructor(object, lineWidth, boxColor, opacity, matchTransform).copy(this, true);
        };
    }
    disableDepthTest() {
        this.material.depthTest = false;
    }
    updateFromObject(object, matchTransform) {
        const updateObject = object.clone();
        if (matchTransform) {
            object.getWorldPosition(_objPosition);
            object.getWorldQuaternion(_objQuaternion);
            object.getWorldScale(_objScale);
            updateObject.lookAtCamera = false;
            updateObject.position.set(0, 0, 0);
            updateObject.rotation.set(0, 0, 0);
            updateObject.scale.set(1, 1, 1);
            updateObject.updateMatrixWorld(true);
        }
        _box.setFromObject(updateObject);
        const min = _box.min;
        const max = _box.max;
        Vectors.sanity(_box.min);
        Vectors.sanity(_box.max);
        const array = this._positions;
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
        if (matchTransform) {
            this.setRotationFromQuaternion(_objQuaternion);
            this.scale.set(_objScale.x, _objScale.y, _objScale.z);
            this.position.set(_objPosition.x, _objPosition.y, _objPosition.z);
            this.updateMatrix();
        }
        this.updateMatrixWorld(true);
        ObjectUtils.clearObject(updateObject);
    }
    getPoints() {
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            this.points[i].x = this.geometry.attributes.position.array[index + 0];
            this.points[i].y = this.geometry.attributes.position.array[index + 1];
            this.points[i].z = this.geometry.attributes.position.array[index + 2];
            this.localToWorld(this.points[i]);
        }
        return this.points;
    }
    getLocalPoints() {
        for (let i = 0; i < 8; i++) {
            const index = (i * 3);
            this.points[i].x = this._positions[index + 0];
            this.points[i].y = this._positions[index + 1];
            this.points[i].z = this._positions[index + 2];
        }
        return this.points;
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
        const points = this.getLocalPoints();
        targetBox3 = targetBox3 ?? new THREE.Box3();
        targetBox3.min.x = points[6].x;
        targetBox3.min.y = points[6].y;
        targetBox3.min.z = points[6].z;
        targetBox3.max.x = points[0].x;
        targetBox3.max.y = points[0].y;
        targetBox3.max.z = points[0].z;
    }
    getSize(target) {
        this.getWorldScale(_tempScale);
        const points = this.getLocalPoints();
        target.x = (points[0].x - points[6].x) * Math.abs(_tempScale.x);
        target.y = (points[0].y - points[6].y) * Math.abs(_tempScale.y);
        target.z = (points[0].z - points[6].z) * Math.abs(_tempScale.z);
    }
    getMaxSize() {
        this.getSize(_tempSize);
        return Math.max(Math.max(_tempSize.x, _tempSize.y), _tempSize.z);
    }
}
class BasicWireframe extends THREE.LineSegments {
    constructor(object, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
        const wireframeGeometry = new THREE.WireframeGeometry(object.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
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
            resolution: new THREE.Vector2(500, 500),
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        lineMaterial.depthTest = false;
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

const SCALE = 500;
class SkyObject extends THREE.Mesh {
    constructor() {
        const shader = SkyObject.SkyShader;
        super(new THREE.SphereGeometry(1), new THREE.ShaderMaterial({
            name:           'SkyShader',
            fragmentShader: shader.fragmentShader,
            vertexShader:   shader.vertexShader,
            uniforms:       THREE.UniformsUtils.clone(shader.uniforms),
            side:           THREE.BackSide,
            depthTest:      false,
            depthWrite:     false
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
SkyObject.SkyShader = {
    uniforms: {
        'uSky':     { value: new THREE.Color(0.00, 0.85, 0.80) },
        'uHorizon': { value: new THREE.Color(1.00, 0.75, 0.50) },
        'uGround':  { value: new THREE.Color(0.90, 0.70, 0.50) },
        'uScale':   { value: SCALE },
    },
    vertexShader: `
        varying vec3 	vWorldPosition;

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
        }`
};

const _clearColor = new THREE.Color(0xffffff);
const _materialCache = [];
const _currClearColor = new THREE.Color();
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
        this.spriteMap = new THREE.CanvasTexture(spriteCanvas);
        _emptyScene = new THREE.Scene();
        _emptyScene.onAfterRender = renderList;
        this.pickingTarget = new THREE.WebGLRenderTarget(1, 1, {
            minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat, encoding: THREE.LinearEncoding
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
            if (! object || ! object.isObject3D) return;
            if (! object.visible) return;
            if (! ObjectUtils.allowSelection(object)) return;
            const objId = object.id;
            const material = object.material;
            const geometry = object.geometry;
            let useMorphing = 0;
            if (material.morphTargets && geometry.isBufferGeometry) {
                useMorphing = (geometry.morphAttributes.position.length > 0) ? 1 : 0;
            }
            const useSkinning = (object.isSkinnedMesh) ? 1 : 0;
            const useInstancing = (object.isInstancedMesh === true) ? 1 : 0;
            const frontSide = (material.side === THREE.FrontSide) ? 1 : 0;
            const backSide = (material.side === THREE.BackSide) ? 1 : 0;
            const doubleSide = (material.side === THREE.DoubleSide) ? 1 : 0;
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
            if (! renderMaterial) {
                renderMaterial = new THREE.ShaderMaterial({
                    defines: { USE_MAP: '', USE_UV: '', USE_LOGDEPTHBUF: '', },
                    vertexShader: THREE.ShaderChunk.meshbasic_vert,
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
                    side: (object.isSprite) ? THREE.DoubleSide : THREE.FrontSide,
                });
                renderMaterial.uniforms = {
                    opacity: { value: 1.0 },
                    map: { value: undefined },
                    uvTransform: { value: new THREE.Matrix3() },
                    objectId: { value: [ 1.0, 1.0, 1.0, 1.0 ] },
                    useMap: { value: 0.0 },
                };
                renderMaterial.side = material.side;
                renderMaterial.skinning = (useSkinning > 0);
                renderMaterial.morphTargets = (useMorphing > 0);
                _materialCache[index] = renderMaterial;
            }
            renderMaterial.uniforms.objectId.value = [
                (objId >> 0 & 255) / 255,
                (objId >> 8 & 255) / 255,
                (objId >> 16 & 255) / 255,
                (objId >> 24 & 255) / 255,
            ];
            renderMaterial.uniforms.useMap.value = (material.map) ? 1.0 : 0.0;
            if (material.map) {
                if (object.isSpriteHelper) {
                    renderMaterial.uniforms.map.value = self.spriteMap;
                } else {
                    renderMaterial.uniforms.map.value = material.map;
                }
            }
            renderMaterial.uniformsNeedUpdate = true;
            _renderer.renderBufferDirect(self.camera, self.scene, geometry, renderMaterial, object, null);
        }
    }
    dispose() {
        this.pickingTarget.dispose();
        this.spriteMap.dispose();
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

const _renderSize = new THREE.Vector2(1, 1);
class Camera {
    init(data) {
        let camera = undefined;
        switch (data.style) {
            case 'perspective':
                this._tanFOV = Math.tan(((Math.PI / 180) * data.fov / 2));
                this._windowHeight = (data.fixedSize) ? 1000 : 0;
                let nearPersp = (data.nearPersp <= 0) ? 0.00001 : data.nearPersp;
                let farPersp = (data.farPersp == 0) ? 0.00001 : data.farPersp;
                if (farPersp === nearPersp) farPersp += 0.001;
                camera = new THREE.PerspectiveCamera(data.fov, 1 , nearPersp, farPersp);
                break;
            case 'orthographic':
                let nearOrtho = data.nearOrtho;
                let farOrtho = data.farOrtho;
                let leftOrtho = data.left;
                let rightOrtho = data.right;
                let topOrtho = data.top;
                let bottomOrtho = data.bottom;
                if (farOrtho === farOrtho) farOrtho += 0.001;
                if (rightOrtho === leftOrtho) rightOrtho += 0.001;
                if (topOrtho === bottomOrtho) topOrtho += 0.001;
                camera = new THREE.OrthographicCamera(leftOrtho, rightOrtho, topOrtho, bottomOrtho, nearOrtho, farOrtho);
                break;
            default:
                console.error(`Camera.init: Invalid camera type '${data.style}'`);
        }
        if (camera && camera.isCamera) {
            camera.position.set(0, 0, 0);
            camera.lookAt(0, 0, 0);
        } else {
            console.log('Error with camera!');
        }
        this.backend = camera;
        this.data = data;
        this.style = data.style;
    }
    dispose() {
    }
    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }
    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }
    updateProjectionMatrix() {
        if (! window.getRenderer()) return;
        if (this.backend && this.backend.isCamera) {
            window.getRenderer().getSize(_renderSize);
            let width = _renderSize.x;
            let height = _renderSize.y;
            if (this.backend.isPerspectiveCamera) {
                if (this.data.fixedSize) this.backend.fov = (360 / Math.PI) * Math.atan(this._tanFOV * (height / this._windowHeight));
                this.backend.aspect = width / height;
            } else if (this.backend.isOrthographicCamera) {
                let aspectWidth = 1.0;
                let aspectHeight = 1.0;
                this.backend.left = - width / aspectWidth / 2;
                this.backend.right = width / aspectWidth / 2;
                this.backend.top = height * aspectHeight / 2;
                this.backend.bottom = - height * aspectHeight / 2;
            }
            this.backend.updateProjectionMatrix();
        }
    }
    toJSON() {
        const data = this.defaultData('style', this.style);
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        return data;
    }
}
Camera.config = {
    schema: {
        style: { type: 'select', default: 'perspective', select: [ 'perspective', 'orthographic' ] },
        nearPersp: { type: 'number', default: 1, min: 0, step: 0.1, if: { style: [ 'perspective' ] } },
        farPersp: { type: 'number', default: 500, min: 0, step: 1, if: { style: [ 'perspective' ] } },
        nearOrtho: { type: 'number', default: -500, step: 1,  if: { style: [ 'orthographic' ] } },
        farOrtho: { type: 'number', default: 500, step: 1,  if: { style: [ 'orthographic' ] } },
        fov: { type: 'number', default: 58.10, if: { style: [ 'perspective' ] } },
        fixedSize: { type: 'boolean', default: true, if: { style: [ 'perspective' ] } },
        left: { type: 'number', default: -1, if: { style: [ 'orthographic' ] } },
        right: { type: 'number', default: 1, if: { style: [ 'orthographic' ] } },
        top: { type: 'number', default: 1, if: { style: [ 'orthographic' ] } },
        bottom: { type: 'number', default: -1, if: { style: [ 'orthographic' ] } },
    },
    icon: ``,
    color: '#4B4886',
};
ComponentManager.register('camera', Camera);

const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const circleShape = new THREE.Shape().absarc(0, 0, 0.5 );
const wedgeShape = new THREE.Shape([
    new THREE.Vector2(-0.5,  0.5),
    new THREE.Vector2(-0.5, -0.5),
    new THREE.Vector2( 0.5, -0.5),
]);
class Geometry {
    init(data) {
        this.dispose();
        if (data.isBufferGeometry) {
            const assetUUID = data.uuid;
            AssetManager.addAsset(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        }
        let geometry = undefined;
        switch (data.style) {
            case 'asset':
                const assetGeometry = AssetManager.getAsset(data.asset);
                if (assetGeometry && assetGeometry.isBufferGeometry) {
                    geometry = assetGeometry;
                }
                break;
            case 'box':
                geometry = new THREE.BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
                break;
            case 'capsule':
                const capRadiusTop = MathUtils.clamp(data.radiusTop, 0.1, data.height) / 1.5;
                const capRadiusBottom = MathUtils.clamp(data.radiusBottom, 0.1, data.height) / 1.5;
                const capHeight = data.height / 1.5;
                geometry = new CapsuleGeometry(
                    capRadiusTop, capRadiusBottom, capHeight,
                    data.radialSegments, data.heightSegments,
                    data.capSegments, data.capSegments,
                    data.thetaStart, data.thetaLength);
                geometry = GeometryUtils.uvMapSphere(geometry, 'v');
                break;
            case 'circle':
                geometry = new THREE.CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);
                break;
            case 'cone':
                geometry = new CylinderGeometry(0, data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                break;
            case 'cylinder':
                geometry = new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                break;
            case 'lathe':
                const points = [];
                let latheShape = AssetManager.getAsset(data.shape);
                if (! latheShape || latheShape.type !== 'Shape') {
                    for (let i = 0; i < 2.5; i += 0.1) {
                        points.push(new THREE.Vector2(Math.abs(Math.cos(i) * 0.4) + 0.2, i * 0.4));
                    }
                } else {
                    const shapePoints = latheShape.getPoints(data.segments);
                    for (let i = 0; i < shapePoints.length; i++) {
                        points.push(new THREE.Vector2(shapePoints[i].x, shapePoints[i].y));
                    }
                }
                geometry = new THREE.LatheGeometry(points, data.segments, 0, data.phiLength);
                geometry.center();
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
                break;
            case 'platonicSolid':
                switch (data.polyhedron) {
                    case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(data.radius, data.detail); break;
                    case 'icosahedron': geometry = new THREE.IcosahedronGeometry(data.radius, data.detail); break;
                    case 'octahedron': geometry = new THREE.OctahedronGeometry(data.radius, data.detail); break;
                    case 'tetrahedron': geometry = new THREE.TetrahedronGeometry(data.radius, data.detail); break;
                    default: geometry = new THREE.DodecahedronGeometry(data.radius, data.detail); break;
                }
                break;
            case 'ring':
                geometry = new THREE.RingGeometry(data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength);
                break;
            case 'roundedBox':
                geometry = new RoundedBoxGeometry(data.width, data.height, data.depth, data.segments, data.radius);
                break;
            case 'shape':
                let shape = AssetManager.getAsset(data.shape);
                if (! shape || shape.type !== 'Shape') {
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
                geometry = new THREE.ExtrudeGeometry(shape, options);
                geometry.center();
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc);
                break;
            case 'torusKnot':
                geometry = new THREE.TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q);
                break;
            case 'tube':
                let tubeShape = AssetManager.getAsset(data.shape);
                if (! tubeShape || tubeShape.type !== 'Shape') {
                    tubeShape = circleShape;
                }
                const path3D = new THREE.CurvePath();
                const arcPoints = tubeShape.getPoints(Math.max(256, data.tubularSegments * 4));
                for (let i = 0; i < arcPoints.length - 1; i++) {
                    const pointA = arcPoints[i];
                    const pointB = arcPoints[i + 1];
                    path3D.curves.push(
                        new THREE.LineCurve3(
                            new THREE.Vector3(pointA.x, pointA.y, 0),
                            new THREE.Vector3(pointB.x, pointB.y, 0),
                        ),
                    );
                }
                geometry = new THREE.TubeGeometry(path3D, data.tubularSegments, data.radius, data.radialSegments, data.closed);
                geometry.center();
                break;
            default:
                console.error('Geometry: Invalid geometry type ' + data.style);
        }
        if (geometry && geometry.isBufferGeometry) {
            const geometryName = geometry.constructor.name;
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
            if (data.wrapS !== 1 || data.wrapT !== 1) {
                const s = Math.max(data.wrapS, 0);
                const t = Math.max(data.wrapT, 0);
                GeometryUtils.repeatTexture(geometry, s, t);
            }
            geometry.name = geometryName;
        } else {
        }
        this.backend = geometry;
        this.data = data;
        this.style = data.style;
    }
    dispose() {
        const geometry = this.backend;
        if (geometry && geometry.isBufferGeometry) {
            this.backend.dispose();
        }
        this.backend = undefined;
    }
    enable() {
        if (! this.entity) return;
        const materialComponent = this.entity.getComponent('material');
        if (materialComponent !== undefined) materialComponent.refreshMesh();
    }
    disable() {
        if (! this.entity) return;
        const materialComponent = this.entity.getComponent('material');
        if (materialComponent !== undefined) materialComponent.refreshMesh();
    }
    toJSON() {
        const data = this.defaultData('style', this.style);
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        return data;
    }
}
Geometry.config = {
    schema: {
        style: [ { type: 'select', default: 'box', select: [ 'asset', 'box', 'capsule', 'circle', 'cone', 'cylinder', 'lathe', 'plane', 'platonicSolid', 'ring', 'roundedBox', 'shape', 'sphere', 'torus', 'torusKnot', 'tube' ] } ],
        asset: { type: 'asset', class: 'BufferGeometry', if: { style: [ 'asset' ] } },
        shape: { type: 'asset', class: 'Shape', if: { style: [ 'lathe', 'shape', 'tube' ] } },
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
        subdivide: { type: 'slider', default: 0, min: 0, max: 3, step: 1, precision: 0, rebuild: true },
        edgeSplit: { type: 'boolean', default: false, hide: { subdivide: [ 0 ] } },
        uvSmooth: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        flatOnly: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        textureDivider: { type: 'divider' },
        textureMapping: [
            { type: 'select', default: 'cube', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'shape' ] } },
            { type: 'select', default: 'none', select: [ 'none', 'cube', 'sphere' ], not: { style: [ 'shape' ] } },
        ],
        wrapS: { type: 'number', alias: 'wrapX', default: 1, min: 0, step: 0.2, precision: 2 },
        wrapT: { type: 'number', alias: 'wrapY', default: 1, min: 0, step: 0.2, precision: 2 },
    },
    icon: ``,
    color: 'rgb(255, 113, 0)',
    dependencies: [ 'material' ],
};
ComponentManager.register('geometry', Geometry);

class Light {
    init(data) {
        this.dispose();
        let light = undefined;
        let shadows = false;
        switch (data.style) {
            case 'ambient':
                light = new THREE.AmbientLight(data.color, data.intensity);
                break;
            case 'directional':
                light = new THREE.DirectionalLight(data.color, data.intensity);
                shadows = true;
                break;
            case 'hemisphere':
                light = new THREE.HemisphereLight(data.color, data.groundColor, data.intensity);
                break;
            case 'point':
                light = new THREE.PointLight(data.color, data.intensity, data.distance, data.decay);
                shadows = true;
                break;
            case 'spot':
                const angle = (Math.PI / 180) * data.angle;
                light = new THREE.SpotLight(data.color, data.intensity, data.distance, angle, data.penumbra, data.decay);
                shadows = true;
                break;
            default:
                console.error(`Light: Invalid light type '${data.style}'`);
        }
        if (light && light.isLight) {
            light.position.set(0, 0, 0);
            if (shadows) {
                const SD = 10;
                light.castShadow = true;
                light.shadow.bias = data.shadowBias;
                light.shadow.mapSize.width = 2048;
                light.shadow.mapSize.height = 2048;
                light.shadow.camera.near = -500;
                light.shadow.camera.far = 500;
                light.shadow.camera.left = -SD;
                light.shadow.camera.right = SD;
                light.shadow.camera.top = SD;
                light.shadow.camera.bottom = -SD;
                light.shadow.camera.updateProjectionMatrix();
            }
        } else {
            console.log('Error with light!');
        }
        this.backend = light;
        this.data = data;
        this.style = data.style;
    }
    dispose() {
        const light = this.backend;
        if (light && light.isLight) {
            if (light.shadow && light.shadow.map) light.shadow.map.dispose();
            light.dispose();
        }
        this.backend = undefined;
    }
    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }
    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }
    toJSON() {
        const data = this.defaultData('style', this.style);
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        return data;
    }
}
Light.config = {
    schema: {
        style: { type: 'select', default: 'ambient', select: [ 'ambient', 'directional', 'hemisphere', 'point', 'spot' ] },
        styleDivider: { type: 'divider' },
        color: [
            { type: 'color', default: 0xffffff, if: { style: [ 'ambient', 'directional', 'point', 'spot' ] } },
            { type: 'color', alias: 'skyColor', default: 0x80ffff, if: { style: [ 'hemisphere' ] } },
        ],
        groundColor: { type: 'color', default: 0x806040, if: { style: [ 'hemisphere' ] } },
        intensity: [
            { type: 'slider', default: 0.25 , step: 0.05, min: 0, max: 2, if: { style: [ 'ambient' ] } },
            { type: 'slider', default: 0.50 , step: 0.05, min: 0, max: 2, if: { style: [ 'hemisphere' ] } },
            { type: 'slider', default: 1.00 , step: 0.05, min: 0, max: 2, if: { style: [ 'directional' ] } },
            { type: 'slider', default: 1.00 , step: 0.05, min: 0, max: 2, if: { style: [ 'point', 'spot' ] } },
        ],
        distance: { type: 'number', default: 0, if: { style: [ 'point', 'spot' ] } },
        decay: { type: 'number', default: 1, if: { style: [ 'point', 'spot' ] } },
        angle: { type: 'number', default: 45, unit: '°', if: { style: [ 'spot' ] } },
        penumbra: { type: 'number', default: 0, min: 0, max: 1, if: { style: [ 'spot' ] } },
        shadowBias: { type: 'number', default: 0, precision: 6, promode: true, if: { style: [ 'directional', 'point', 'spot' ] } }
    },
    icon: ``,
    color: '#222222',
};
ComponentManager.register('light', Light);

const blendingModes = [ 'NoBlending', 'NormalBlending', 'AdditiveBlending', 'SubstractiveBlending', 'MultiplyBlending', 'CustomBlending' ];
const sides = [ 'FrontSide', 'BackSide', 'DoubleSide' ];
const depthPacking = [ 'BasicDepthPacking', 'RGBADepthPacking' ];
class Material {
    init(data) {
        this.dispose();
        const parameters = {};
        if (data.isMaterial) {
            const assetUUID = data.uuid;
            AssetManager.addAsset(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        } else {
            for (const key in data) {
                const value = data[key];
                parameters[key] = value;
                let checkType = Material.config.schema[key];
                if (System.isIterable(checkType) && checkType.length > 0) checkType = checkType[0];
                if (value && checkType && checkType.type === 'map') {
                    if (value.isTexture) {
                        AssetManager.addAsset(value);
                    } else {
                        const textureCheck = AssetManager.getAsset(value);
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
            if (typeof parameters.blending === 'string') parameters.blending = blendingModes.indexOf(parameters.blending);
            if (typeof parameters.side === 'string') parameters.side = sides.indexOf(parameters.side);
            if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE.BasicDepthPacking;
            if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE.RGBADepthPacking;
        }
        let material = undefined;
        switch (data.style) {
            case 'asset':
                const assetMaterial = AssetManager.getAsset(data.asset);
                if (assetMaterial && assetMaterial.isMaterial) {
                    material = assetMaterial.clone();
                }
                break;
            case 'basic': material = new THREE.MeshBasicMaterial(parameters); break;
            case 'depth': material = new THREE.MeshDepthMaterial(parameters); break;
            case 'lambert': material = new THREE.MeshLambertMaterial(parameters); break;
            case 'matcap': material = new THREE.MeshMatcapMaterial(parameters); break;
            case 'normal': material = new THREE.MeshNormalMaterial(parameters); break;
            case 'phong': material = new THREE.MeshPhongMaterial(parameters); break;
            case 'physical': material = new THREE.MeshPhysicalMaterial(parameters); break;
            case 'points': material = new THREE.PointsMaterial(parameters); break;
            case 'shader': material = new THREE.ShaderMaterial(parameters); break;
            case 'standard': material = new THREE.MeshStandardMaterial(parameters); break;
            case 'toon':
                material = new THREE.MeshToonMaterial(parameters);
                data.gradientSize = Math.min(Math.max(data.gradientSize, 1), 16);
                const format = (getRenderer().capabilities.isWebGL2) ? THREE.RedFormat : THREE.LuminanceFormat;
                const colors = new Uint8Array(data.gradientSize + 2);
                for (let c = 0; c <= colors.length; c++) colors[c] = (c / colors.length) * 256;
                material.gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
                material.gradientMap.needsUpdate = true;
                break;
            default:
                console.error(`Material: Invalid material type '${data.style}'`);
        }
        if (material && material.isMaterial) {
        } else {
            console.log('Error with material!');
        }
        this.backend = material;
        this.data = data;
        this.style = data.style;
    }
    dispose() {
        const material = this.backend;
        if (material && material.isMaterial) {
            material.dispose();
        }
        this.backend = undefined;
    }
    enable() {
        this.refreshMesh();
    }
    disable() {
        this.refreshMesh();
    }
    refreshMesh() {
        if (this.entity && this.mesh) {
            this.entity.remove(this.mesh);
            ObjectUtils.clearObject(this.mesh);
            this.mesh = undefined;
        }
        if (this.enabled !== true) return;
        if (! this.backend || ! this.backend.isMaterial) return;
        const material = this.backend.clone();
        extendMaterial(material, this.toJSON());
        const geometryComponent = this.entity.getComponent('geometry');
        if (! geometryComponent) return;
        if (! geometryComponent.enabled) return;
        const geometry = geometryComponent.backend;
        if (! geometry) return;
        if (this.style === 'points') {
            this.mesh = new THREE.Points(geometry, material);
        } else {
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = this.entity.castShadow;
            this.mesh.receiveShadow = this.entity.receiveShadow;
        }
        this.mesh.name = `Backend Object3D for ${this.entity.name}`;
        const isGlass = this.backend.isMeshPhysicalMaterial === true && this.backend.transmission > 0;
        if (isGlass) this.backend.envMap = hdrEquirect;
        if (this.backend.opacity < 0.05) {
            if (window.activeCamera && window.editor && window.editor.viewport) {
                if (activeCamera.uuid === editor.viewport.camera.uuid) {
                    material.map = null;
                    material.opacity = 0.25;
                    material.wireframe = true;
                    this.mesh.castShadow = false;
                }
            }
        }
        if (this.entity && this.mesh) this.entity.add(this.mesh);
    }
    toJSON() {
        const data = this.defaultData('style', this.style);
        for (let key in data) {
            if (this.data[key] !== undefined) {
                if (this.data[key] && this.data[key].isTexture) {
                    data[key] = this.data[key].uuid;
                } else {
                    data[key] = this.data[key];
                }
            }
        }
        return data;
    }
}
function extendMaterial(material, data = { style: 'basic', premultiplyAlpha: true }) {
    if (! material || ! material.isMaterial) return;
    let wantsOpaque = (data && data.opacity === 1.0 && data.map === undefined);
    material.transparent = ! wantsOpaque;
    material.alphaTest = 0.01;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.onBeforeCompile = function(shader) {
        if (data.style === 'toon') {
            shader.uniforms = THREE.UniformsUtils.merge([
                shader.uniforms, {
                    uBitDepth: { value: data.gradientSize ?? 4},
                    uEdgeSize: { value: data.edgeSize ?? 6 },
                    uTextureWidth: { value: 100.0 },
                    uTextureHeight: { value: 100.0 },
                },
            ]);
            if (material.map && material.map.isTexture) {
                shader.uniforms.uTextureWidth.value = material.map.image.width;
                shader.uniforms.uTextureHeight.value = material.map.image.height;
            }
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                [ 	'#include <common>',
                    '',
                    'uniform float uBitDepth;',
                    'uniform float uEdgeSize;',
                    'uniform float uTextureWidth;',
                    'uniform float uTextureHeight;',
                    '',
                    'vec3 rgbToHsv(vec3 c) {',
                    '   vec4  K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',
                    '   vec4  p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',
                    '   vec4  q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',
                    '   float d = q.x - min(q.w, q.y);',
                    '   float e = 1.0e-10;',
                    '   return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',
                    '}',
                    'vec3 hsvToRgb(vec3 c) {',
                    '   vec4  K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
                    '   vec3  p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
                    '   return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
                    '}',
                    '',
                    'float avgIntensity(vec4 pix) {',
                    '   return (pix.r + pix.g + pix.b) / 3.0;',
                    '}',
                ].join('\n')
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                [	'#include <color_fragment>',
                    'vec3 original_color = diffuseColor.rgb;',
                    'vec3 v_hsv = rgbToHsv(original_color.rgb);',
                    'float amt = 1.0 / (uBitDepth + 8.0);',
                    'float hueIncrease = 1.05;',
                    'float satIncrease = 1.10;',
                    'float vibIncrease = 1.75;',
                    'v_hsv.x = clamp(amt * (floor(v_hsv.x / amt) * hueIncrease), 0.0, 1.0);',
                    'v_hsv.y = clamp(amt * (floor(v_hsv.y / amt) * satIncrease), 0.0, 1.0);',
                    'v_hsv.z = clamp(amt * (floor(v_hsv.z / amt) * vibIncrease), 0.0, 1.0);',
                    '#ifdef USE_MAP',
                    '   vec2 coords = vUv;',
                    '   float dxtex = 1.0 / uTextureWidth;',
                    '   float dytex = 1.0 / uTextureHeight;',
                    '   float edge_thres  = 0.15;',
                    '   float edge_thres2 = uEdgeSize;',
                    '   float pix[9];',
                    '   int   k = -1;',
                    '   float delta;',
                    '   for (int i = -1; i < 2; i++) {',
                    '       for (int j = -1; j < 2; j++) {',
                    '           k++;',
                    '           vec2 sampleCoords = vec2(coords.x + (float(i) * dxtex), coords.y + (float(j) * dytex));',
                    '           vec4 texSample = texture2D(map, sampleCoords);',
                    '           pix[k] = avgIntensity(texSample);',
                    '       }',
                    '   }',
                    '   delta = (abs(pix[1] - pix[7]) + abs(pix[5] - pix[3]) + abs(pix[0] - pix[8]) + abs(pix[2] - pix[6]) ) / 4.0;',
                    '   float edg = clamp(edge_thres2 * delta, 0.0, 1.0);',
                    '   vec3 v_rgb = (edg >= edge_thres) ? vec3(0.0) : hsvToRgb(v_hsv.xyz);',
                    '#else',
                    '   vec3 v_rgb = hsvToRgb(v_hsv.xyz);',
                    '#endif',
                    'diffuseColor.rgb = vec3(v_rgb.x, v_rgb.y, v_rgb.z);',
                    'float bit_depth = uBitDepth;',
                    'float bitR = floor(diffuseColor.r * bit_depth);',
                    'float bitG = floor(diffuseColor.g * bit_depth);',
                    'float bitB = floor(diffuseColor.b * bit_depth);',
                    'diffuseColor.rgb = vec3(bitR, bitG, bitB) / bit_depth;',
                ].join('\n')
            );
        }
        if (data.premultiplyAlpha && shader.fragmentShader) {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <premultiplied_alpha_fragment>',
                'gl_FragColor.rgba *= gl_FragColor.a;'
            );
        }
    };
    if (data.premultiplyAlpha) {
        material.blending = THREE.CustomBlending;
        material.blendEquation = THREE.AddEquation;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;
        material.blendEquationAlpha = THREE.AddEquation;
        material.blendSrcAlpha = THREE.OneFactor;
        material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    }
    material.needsUpdate = true;
    return material;
}
Material.config = {
    schema: {
        style: [
            { type: 'select', default: 'standard', promode: true, select: [ 'asset', 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'shader', 'standard', 'toon' ] },
            { type: 'select', default: 'standard', select: [ 'basic', 'points', 'standard', 'toon' ] },
        ],
        styleDivider: { type: 'divider' },
        asset: { type: 'asset', class: 'Material', if: { style: [ 'asset' ] } },
        color: { type: 'color', if: { style: [ 'basic', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        emissive: { type: 'color', default: 0x000000, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        emissiveIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        opacity: { type: 'slider', default: 1.0, min: 0.0, max: 1.0, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        depthTest: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        depthWrite: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        flatShading: { type: 'boolean', default: false, if: { style: [ 'phong', 'physical', 'standard', 'normal', 'matcap' ] } },
        premultiplyAlpha: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        wireframe: { type: 'boolean', default: false, if: { style: [ 'basic', 'depth', 'lambert', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        vertexColors: { type: 'boolean', default: false, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        size: { type: 'slider', default: 0.05, min: 0, max: 1, if: { style: [ 'points' ] } },
        sizeAttenuation: { type: 'boolean', default: true, if: { style: [ 'points' ] } },
        edgeSize: { type: 'slider', default: 6, min: 0, max: 10, step: 1, precision: 0, if: { style: [ 'toon' ] } },
        gradientSize: { type: 'slider', default: 4, min: 1, max: 16, step: 1, precision: 0, if: { style: [ 'toon' ] } },
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
            { type: 'map', if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'points', 'physical', 'standard', 'toon' ] } },
        ],
        matcap: { type: 'map', if: { style: [ 'matcap' ] } },
        alphaMap: { type: 'map', promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        bumpMap: { type: 'map', promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        bumpScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        clearcoatNormalMap: { type: 'map', promode: true, if: { style: [ 'physical' ] } },
        clearcoatNormalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'physical' ] } },
        displacementMap: { type: 'map', promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        displacementScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        emissiveMap: { type: 'map', promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        metalnessMap: { type: 'map', promode: true, if: { style: [ 'physical', 'standard' ] } },
        roughnessMap: { type: 'map', promode: true, if: { style: [ 'physical', 'standard' ] } },
        specularMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong' ] } },
        thicknessMap: { type: 'map', promode: true, if: { style: [ 'physical' ] } },
        transmissionMap: { type: 'map', promode: true, if: { style: [ 'physical' ] } },
        aoMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        envMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        lightMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        normalMap: { type: 'map', if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        side: { type: 'select', default: 'FrontSide', select: sides, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
    },
    icon: ``,
    color: 'rgb(165, 243, 0)',
    dependencies: [ 'geometry' ],
};
ComponentManager.register('material', Material);

class Mesh {
    init(data) {
        this.backend = (data.isObject3D) ? data : new THREE.Object3D();
        this.backend.traverse((child) => { child.castShadow = this.entity.castShadow; });
        this.backend.traverse((child) => { child.receiveShadow = this.entity.receiveShadow; });
    }
    dispose() {
    }
    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }
    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }
    toJSON() {
    }
}
Mesh.config = {
    multiple: true,
    icon: ``,
    color: '#F7DB63',
};
ComponentManager.register('mesh', Mesh);

if (typeof window !== 'undefined') {
    if (window.__ONSIGHT__) console.warn(`Onsight v${window.__ONSIGHT__} already imported! Now importing v${VERSION}!`);
    else window.__ONSIGHT__ = VERSION;
}

export { APP_STATES, App, AssetManager, BACKENDS, BasicLine, BasicWireBox, BasicWireframe, CAMERA_SCALE, CAMERA_START_DISTANCE, CAMERA_START_HEIGHT, CameraUtils, CapsuleGeometry, ComponentManager, CylinderGeometry, ENTITY_FLAGS, ENTITY_TYPES, Entity3D, EntityPool, EntityUtils, FatLine, FatWireBox, FatWireframe, GeometryUtils, GpuPickerPass, MathUtils, Object3D, ObjectUtils, PrismGeometry, Project, RenderUtils, SCENE_TYPES, SVGBuilder, Scene3D, Script, SkyObject, Strings, System, VERSION, Vectors, WORLD_TYPES, World3D };
