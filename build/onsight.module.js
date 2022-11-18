/**
 * @description Onsight Engine
 * @about       Powerful, easy-to-use JavaScript video game and application creation engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v0.0.2
 * @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
 * @source      https://github.com/onsightengine/onsight
 */
import * as THREE$1 from 'three';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { LoopSubdivision } from 'three-subdivide';

const NAME = 'Onsight';
const REVISION = '0.0.2';
const BACKEND3D = 'THREE';
const ENTITY_TYPES = {
    Entity3D:       'Entity3D',
};
const SCENE_TYPES = {
    Scene3D:        'Scene3D',
};
const WORLD_TYPES = {
    World3D:        'World3D',
};
const ENTITY_FLAGS = {
    LOCKED:         'flagLocked',
    TEMP:           'flagTemp',
};
const APP_STATES = {
    PLAYING:        'playing',
    PAUSED:         'paused',
    STOPPED:        'stopped',
};

const CAMERA_SCALE = 0.01;
const CAMERA_START_DISTANCE$1 = 5;
const CAMERA_START_HEIGHT$1 = 0;
const _raycaster = new THREE$1.Raycaster();
class CameraUtils {
    static createOrthographic(camWidth, camHeight, fitType = 'none', desiredSize = 0) {
        const camera = new THREE$1.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
        camera.desiredSize = desiredSize;
        camera.fitType = fitType;
        camera.position.set(0, CAMERA_START_HEIGHT$1, CAMERA_START_DISTANCE$1);
        camera.lookAt(0, CAMERA_START_HEIGHT$1, 0);
        CameraUtils.updateOrthographic(camera, camWidth, camHeight);
        return camera;
    }
    static createPerspective(camWidth, camHeight, fixedSize = true) {
        const camera = new THREE$1.PerspectiveCamera(
            58.10,
            1,
            0.01,
            1000,
        );
        camera.tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
        camera.windowHeight = (fixedSize) ? 1000  : 0;
        camera.fixedSize = fixedSize;
        camera.position.set(0, CAMERA_START_HEIGHT$1, CAMERA_START_DISTANCE$1);
        camera.lookAt(0, CAMERA_START_HEIGHT$1, 0);
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
            return new THREE$1.Vector3();
        }
        return new THREE$1.Vector3.copy(pointInWorld).project(camera);
    }
    static worldPoint(pointOnScreen, camera, lookTarget = new THREE$1.Vector3(), facingPlane = 'xy') {
        if (! camera || ! camera.isCamera) {
            console.warn(`CameraUtils.worldPoint: No camera provided!`);
            return new THREE$1.Vector3();
        }
        const planeGeometry = new THREE$1.PlaneGeometry(100000000, 100000000, 2, 2);
        switch (facingPlane.toLowerCase()) {
            case 'yz': planeGeometry.rotateY(Math.PI / 2); break;
            case 'xz': planeGeometry.rotateX(Math.PI / 2); break;
            default:  ;
        }
        planeGeometry.translate(lookTarget.x, lookTarget.y, lookTarget.z);
        const planeMaterial = new THREE$1.MeshBasicMaterial({ side: THREE$1.DoubleSide });
        const plane = new THREE$1.Mesh(planeGeometry, planeMaterial);
        _raycaster.setFromCamera(pointOnScreen, camera);
        if (camera.isOrthographicCamera) {
            _raycaster.ray.origin.set(pointOnScreen.x, pointOnScreen.y, - camera.far).unproject(camera);
        }
        const planeIntersects = _raycaster.intersectObject(plane, true);
        planeGeometry.dispose();
        planeMaterial.dispose();
        return (planeIntersects.length > 0) ? planeIntersects[0].point : false;
    }
    static distanceToFitObject(camera, object, offset = 1.25) {
    }
    static fitCameraToObject(camera, object, controls = null, offset = 1.25) {
        const boundingBox = new THREE$1.Box3();
        boundingBox.setFromObject(object);
        const center = boundingBox.getCenter(new THREE$1.Vector3());
        const size = boundingBox.getSize(new THREE$1.Vector3());
        const fitDepthDistance = size.z / (2.0 * Math.atan(Math.PI * camera.fov / 360));
        const fitHeightDistance = Math.max(fitDepthDistance, size.y / (2.0 * Math.atan(Math.PI * camera.fov / 360)));
        const fitWidthDistance = (size.x / (2.7 * Math.atan(Math.PI * camera.fov / 360))) / camera.aspect;
        const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);
        camera.near = distance / 100;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();
        camera.position.copy(center);
        camera.position.z += distance;
        camera.lookAt(center);
        if (controls) {
            controls.maxDistance = distance * 10;
            controls.target.copy(center);
            controls.update();
        }
    }
}

class Maths {
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    static degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees;
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
        return (typeof number === 'number' && ! Number.isNaN(number) && Number.isFinite(number));
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
class ObjectUtils {
    static allowSelection(object) {
        let allowSelect = true;
        if (object.userData) {
            if (object.userData.flagLocked) allowSelect = false;
            if (object.userData.flagTemp) allowSelect = false;
        }
        return allowSelect;
    }
    static checkTransforms(array) {
        if (array.length <= 1) return true;
        array[0].getWorldQuaternion(_startQuaternion);
        for (let i = 1; i < array.length; i++) {
            array[i].getWorldQuaternion(_testQuaternion);
            if (Maths.fuzzyQuaternion(_startQuaternion, _testQuaternion) === false) return false;
        }
        return true;
    }
    static clearObject(object, removeFromParent = true) {
        if (! object) return;
        while (object.children.length > 0) {
            ObjectUtils.clearObject(object.children[0], true);
        }
        if (object.geometry) object.geometry.dispose();
        if (object.material) ObjectUtils.clearMaterial(object.material);
        ObjectUtils.resetTransform(object);
        if (removeFromParent) object.removeFromParent();
    }
    static clearMaterial(materials) {
        if (System.isIterable(materials) !== true) materials = [ materials ];
        for (let i = 0, il = materials.length; i < il; i++) {
            let material = materials[i];
            Object.keys(material).forEach(prop => {
                if (! material[prop]) return;
                if (typeof material[prop].dispose === 'function') material[prop].dispose();
            });
            material.dispose();
        }
    }
    static computeBounds(groupOrArray, targetBox, checkIfSingleGeometry = false) {
        if (targetBox === undefined || targetBox.isBox3 !== true) targetBox = new THREE$1.Box3();
        const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
        targetBox.makeEmpty();
        if (checkIfSingleGeometry && ObjectUtils.countGeometry(groupOrArray) === 1) {
            let geomObject = undefined;
            objects.forEach((object) => { object.traverse((child) => { if (child.geometry) geomObject = child; }); });
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
        source.updateWorldMatrix(true, true);
        source.matrixWorld.decompose(target.position, _tempQuaternion, target.scale);
        target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
        if (updateMatrix) target.updateMatrix();
    }
    static countGeometry(groupOrArray) {
        const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
        let geometryCount = 0;
        objects.forEach((object) => {
            object.traverse((child) => { if (child.geometry) geometryCount++; });
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
    static tempObjectRemoval(object) {
        const tempObjectArray = [];
        object.traverse((child) => {
            if (child.userData && child.userData.flagTemp) {
                tempObjectArray.push({ object: child, parent: child.parent });
            }
        });
        for (let i = 0; i < tempObjectArray.length; i++) {
            tempObjectArray[i].object.removeFromParent();
        }
        return tempObjectArray;
    }
    static tempObjectRestore(tempObjectArray) {
        for (let i = 0; i < tempObjectArray.length; i++) {
            let tempObject = tempObjectArray[i];
            tempObject.parent.attach(tempObject.object);
        }
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

let scripts = {};
let shapes = {};
let geometries = {};
let images = {};
let textures = {};
let materials = {};
let animations = {};
let skeletons = {};
const _textureCache = {};
const _textureLoader = new THREE$1.TextureLoader();
class AssetManager {
    static getLibrary(name) {
        switch (name) {
            case 'scripts': return scripts;
            case 'shapes': return shapes;
            case 'geometries': return geometries;
            case 'images': return images;
            case 'textures': return textures;
            case 'materials': return materials;
            case 'animations': return animations;
            case 'skeletons': return skeletons;
        }
        return null;
    }
    static addGeometry(geometry) {
		if (geometry && geometry.isBufferGeometry) {
            if (! geometry.name || geometry.name === '') {
                geometry.name = geometry.constructor.name;
            }
            const bufferGeometry = mergeBufferGeometries([ geometry ]);
            bufferGeometry.name = geometry.name;
            bufferGeometry.uuid = geometry.uuid;
            geometry.dispose();
            geometry = bufferGeometry;
            geometries[geometry.uuid] = geometry;
        }
		return geometry;
	}
	static getGeometry(uuid) {
        if (uuid && uuid.isBufferGeometry) uuid = uuid.uuid;
		return geometries[uuid];
	}
	static removeGeometry(geometry, dispose = true) {
		if (geometries[geometry.uuid]) {
			if (dispose) geometries[geometry.uuid].dispose();
			delete geometries[geometry.uuid];
		}
	}
	static addMaterial(material) {
		if (material && material.isMaterial) {
		    let materialArray = (Array.isArray(material)) ? material : [ material ];
            for (let i = 0; i < materialArray.length; i++) {
                materials[material.uuid] = materialArray[i];
            }
        }
		return material;
	}
	static getMaterial(uuid) {
        if (uuid && uuid.isMaterial) uuid = uuid.uuid;
		return materials[uuid];
	}
	static removeMaterial(material, dispose = true) {
		if (materials[material.uuid]) {
			if (dispose) materials[material.uuid].dispose();
			delete materials[material.uuid];
		}
	}
    static loadTexture(url, onLoad = undefined) {
        if (! url || url === '') return null;
        let resolvedUrl = THREE$1.DefaultLoadingManager.resolveURL(url);
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
	static addTexture(texture) {
        if (texture && texture.isTexture) {
            textures[texture.uuid] = texture;
        }
		return texture;
	}
	static getTexture(uuid) {
        if (uuid && uuid.isTexture) uuid = uuid.uuid;
		return textures[uuid];
	}
	static removeTexture(texture, dispose = true) {
		if (textures[texture.uuid]) {
            for (let url in _textureCache) {
                if (_textureCache[url] && _textureCache[url].isTexture && _textureCache[url].uuid === texture.uuid) {
                    delete _textureCache[url];
                }
            }
			if (dispose) textures[texture.uuid].dispose();
			delete textures[texture.uuid];
		}
	}
    static clear() {
        function clearLibrary(library) {
            for (let uuid in library) {
                const element = library[uuid];
                if (element && element.dispose && typeof element.dispose === 'function') element.dispose();
                delete library[uuid];
            }
        }
        clearLibrary(materials);
        clearLibrary(textures);
        clearLibrary(images);
        clearLibrary(geometries);
        clearLibrary(shapes);
        clearLibrary(animations);
    }
    static fromJSON(json) {
        AssetManager.clear();
		const objectLoader = new THREE$1.ObjectLoader();
		animations = objectLoader.parseAnimations(json.animations);
		shapes = objectLoader.parseShapes(json.shapes);
		geometries = objectLoader.parseGeometries(json.geometries, shapes);
		images = objectLoader.parseImages(json.images);
		textures = objectLoader.parseTextures(json.textures, images);
		materials = objectLoader.parseMaterials(json.materials, textures);
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
        for (let uuid in geometries) {
            const geometry = geometries[uuid];
            if (! meta.geometries[geometry.uuid]) meta.geometries[geometry.uuid] = geometry.toJSON(meta);
            if (geometry.parameters && geometry.parameters.shapes) {
                let shapes = geometry.parameters.shapes;
                if (Array.isArray(shapes) !== true) shapes = [ shapes ];
                for (let i = 0, l = shapes.length; i < l; i++) {
                    const shape = shapes[i];
                    if (! meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(meta);
                }
            }
        }
        for (let uuid in materials) {
            const material = materials[uuid];
            if (! meta.materials[material.uuid]) meta.materials[material.uuid] = material.toJSON(stopRoot);
        }
        for (let uuid in textures) {
            const texture = textures[uuid];
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
                let property = prop[i];
                if (property.type === undefined) {
                    console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                } else if (property.type === 'divider') {
                } else if (property.default === undefined) {
                    switch (property.type) {
                        case 'select':      property.default = null;            break;
                        case 'number':      property.default = 0;               break;
                        case 'int':         property.default = 0;               break;
                        case 'angle':       property.default = 0;               break;
                        case 'slider':      property.default = 0;               break;
                        case 'boolean':     property.default = false;           break;
                        case 'color':       property.default = 0xffffff;        break;
                        case 'asset':       property.default = null;            break;
                        case 'image':       property.default = null;            break;
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
                    }
                } else if (property.proMode !== undefined) {
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
                let data = {};
                for (let i = 0, l = arguments.length; i < l; i += 2) data[arguments[i]] = arguments[i+1];
                ComponentManager.sanitizeData(data, ComponentClass.config.schema);
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
    static sanitizeData(data, schema) {
        for (let schemaKey in schema) {
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];
            let itemToInclude = undefined;
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];
                if (item.type === 'divider') continue;
                if (item.if !== undefined) {
                    let allConditions = true;
                    for (let ifKey in item.if) {
                        let ifArray = Array.isArray(item.if[ifKey]) ? item.if[ifKey] : [];
                        let eachCondition = false;
                        for (let j = 0; j < ifArray.length; j++) {
                            if (data[ifKey] === ifArray[j]) {
                                eachCondition = true;
                                break;
                            }
                        }
                        if (eachCondition !== true) {
                            allConditions = false;
                            break;
                        }
                    }
                    if (allConditions !== true) {
                        continue;
                    }
                }
                itemToInclude = item;
                break;
            }
            if (itemToInclude !== undefined) {
                if (data[schemaKey] === undefined) {
                    data[schemaKey] = itemToInclude.default;
                }
                if (Maths.isNumber(data[schemaKey])) {
                    let min = itemToInclude['min'] ?? -Infinity;
                    let max = itemToInclude['max'] ??  Infinity;
                    if (data[schemaKey] < min) data[schemaKey] = min;
                    if (data[schemaKey] > max) data[schemaKey] = max;
                }
            } else {
                delete data[schemaKey];
            }
        }
    }
    static stripData(oldData, newData, schema) {
        for (let schemaKey in schema) {
            let matchedConditions = false;
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];
                if (item.type === 'divider') continue;
                if (item.if !== undefined) {
                    let allConditions = true;
                    for (let ifKey in item.if) {
                        let ifArray = Array.isArray(item.if[ifKey]) ? item.if[ifKey] : [];
                        let eachCondition = false;
                        let conditionOne = false, conditionTwo = false;
                        for (let j = 0; j < ifArray.length; j++) {
                            if (oldData[ifKey] === ifArray[j]) conditionOne = true;
                            if (newData[ifKey] === ifArray[j]) conditionTwo = true;
                            if (conditionOne && conditionTwo) {
                                eachCondition = true;
                                break;
                            }
                        }
                        if (eachCondition !== true) {
                            allConditions = false;
                            break;
                        }
                    }
                    if (allConditions !== true) {
                        continue;
                    }
                }
                matchedConditions = true;
                break;
            }
            if (matchedConditions !== true) {
                delete newData[schemaKey];
            }
        }
    }
}

const _m1 = new THREE$1.Matrix4();
const _camPosition = new THREE$1.Vector3();
const _camQuaternion = new THREE$1.Quaternion();
const _camScale = new THREE$1.Vector3();
const _lookQuaternion = new THREE$1.Quaternion();
const _lookUpVector = new THREE$1.Vector3();
const _objPosition$1 = new THREE$1.Vector3();
const _objScale$1 = new THREE$1.Vector3();
const _objQuaternion$1 = new THREE$1.Quaternion();
const _parentQuaternion = new THREE$1.Quaternion();
const _parentQuaternionInv = new THREE$1.Quaternion();
const _rotationDirection = new THREE$1.Euler();
const _rotationQuaternion = new THREE$1.Quaternion();
const _worldPosition = new THREE$1.Vector3();
const _worldQuaternion = new THREE$1.Quaternion();
const _worldScale = new THREE$1.Vector3();
const _worldRotation = new THREE$1.Euler();
class Object3D extends THREE$1.Object3D {
    constructor() {
        super();
        const rotation = new THREE$1.Euler();
        const quaternion = new THREE$1.Quaternion();
        function onRotationChange() {  }
        function onQuaternionChange() {  }
        rotation._onChange(onRotationChange);
        quaternion._onChange(onQuaternionChange);
        Object.defineProperties(this, {
            rotation: { configurable: true, enumerable: true, value: rotation },
            quaternion: { configurable: true, enumerable: true, value: quaternion },
        });
    }
    copy(source, recursive = true) {
        super.copy(source, recursive);
        ObjectUtils.copyLocalTransform(source, this, false );
        this.lookAtCamera = source.lookAtCamera;
        this.updateMatrix();
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
            this.traverseAncestors((parent) => { if (parent.lookAtCamera) lookAtCamera = false; });
        }
        if (lookAtCamera) {
            camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);
            this.matrixWorld.decompose(_worldPosition, _worldQuaternion, _worldScale);
            _rotationQuaternion.setFromEuler(this.rotation, false);
                this.quaternion.copy(_camQuaternion);
                this.quaternion.multiply(_rotationQuaternion);
            if (this.parent && this.parent.isObject3D) {
                this.parent.getWorldQuaternion(_parentQuaternion, false);
                _parentQuaternionInv.copy(_parentQuaternion).invert();
                this.quaternion.multiply(_parentQuaternionInv);
            }
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
        this.project = null;
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
        ComponentManager.sanitizeData(data, config.schema);
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
        for (let i = 0, il = this.components.length; i < il; i++) {
            const component = this.components[i];
            let hasProperties = true;
            for (let j = 0, jl = arguments.length; j < jl; j += 2) {
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
    traverseEntities(callback) {
        this.traverse(child => { if (child.isEntity3D) callback(child); });
    }
    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }
    copyEntity(source, recursive = true) {
        this.destroy();
        super.copy(source, false);
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
            let clonedComponent = this.addComponent(component.type, component.toJSON(), false);
            clonedComponent.tag = component.tag;
            if (component.enabled !== true) clonedComponent.disable();
        }
        if (recursive === true) {
            const entities = source.getEntities();
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                this.add(entity.cloneEntity(true));
            }
        }
        return this;
    }
    destroy() {
        let children = this.getEntities();
        for (let i = 0; i < children.length; i++) {
            if (this.project) this.project.removeEntity(children[i]);
            children[i].destroy();
        }
        while (this.components.length > 0) {
            let component = this.components[0];
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
            let componentData = json.object.components[i];
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
        let children = this.getEntities();
        if (children.length > 0) {
            json.object.entities = [];
            for (let i = 0; i < children.length; i++) {
                json.object.entities.push(children[i].toJSON());
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
        this.shadowPlane = new THREE$1.Mesh(
            new THREE$1.PlaneGeometry(100000, 100000),
            new THREE$1.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
        );
        this.shadowPlane.name = 'ShadowPlane';
        this.shadowPlane.userData.flagTemp = true;
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
                this.background = new THREE$1.Color(data.background);
            } else {
                this.background = AssetManager.getTexture(data.background);
            }
        }
        if (data.environment !== undefined) this.environment = AssetManager.getTexture(data.environment);
        if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
                this.fog = new THREE$1.Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
                this.fog = new THREE$1.FogExp2(data.fog.color, data.fog.density);
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
        this.uuid = crypto.randomUUID();
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

class Project {
    constructor(name = 'My Project') {
        this.isProject = true;
        this.name = name;
        this.uuid = crypto.randomUUID();
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
        let sceneList = Object.keys(this.scenes);
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
        let entities = scene.getEntities();
        for (let i = entities.length - 1; i >= 0; i--) {
            this.removeEntity(entities[i], true);
            entities[i].destroy();
        }
        delete this.scenes[scene.uuid];
    }
    traverseScenes(callback) {
        for (let uuid in this.scenes) {
            let scene = this.scenes[uuid];
            scene.traverse(callback);
        }
    }
    addEntity(entity, parent = undefined, index = -1, maintainWorldTransform = false) {
        if (! entity) return;
        if (index === undefined || index === null) index = -1;
        if (entity.isObject3D) {
            if (parent && parent.children && index !== -1) {
                parent.children.splice(index, 0, entity);
                entity.parent = parent;
            } else {
                let newParent = parent;
                if (! newParent || ! newParent.isObject3D) {
                    if (window.editor) newParent = window.editor.viewport.scene;
                }
                if (newParent && newParent.isObject3D) {
                    if (maintainWorldTransform) {
                        newParent.attach(entity);
                    } else {
                        newParent.add(entity);
                    }
                }
            }
        }
        return this;
    }
    getEntityByUuid(uuid, searchAllScenes = false) {
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
    moveEntity(entity, parent = undefined, before = undefined, index = -1) {
        if (! entity) return;
        parent = parent;
        if ((! parent || ! parent.isObject3D) && window.editor) parent = window.editor.viewport.scene;
        if (! parent || ! parent.isObject3D) return;
        parent.safeAttach(entity);
        if (before) index = parent.children.indexOf(before);
        if (index !== -1) {
            parent.children.splice(index, 0, entity);
            parent.children.pop();
        }
    }
    removeEntity(entity, forceDelete = false) {
        if (! entity) return;
        if (! forceDelete && EntityUtils.isImportant(entity)) return;
        if (entity.parent) entity.parent.remove(entity);
    }
    addScript(entity, script) {
        let key = entity.uuid;
        if (! this.scripts[key]) this.scripts[key] = [];
        this.scripts[key].push(script);
        return this;
    }
    removeScript(entity, script) {
        let key = entity.uuid;
        if (! this.scripts[key]) return;
        let index = this.scripts[key].indexOf(script);
        if (index !== -1) this.scripts[key].splice(index, 1);
    }
    clear() {
        const sceneIds = Object.keys(this.scenes);
        for (let i = 0; i < sceneIds.length; i++) {
            let scene = this.scenes[sceneIds[i]];
            this.removeScene(scene);
        }
        this.name = 'My Project';
        this.uuid = crypto.randomUUID();
    }
    fromJSON(json, loadAssets = true) {
        const metaType = (json.metadata) ? json.metadata.type : 'Undefined';
        if (metaType !== 'Onsight') {
            console.error(`Project.fromJSON: Unknown project type ('${metaType}'), expected 'Onsight'`);
            return;
        }
        const metaVersion = json.metadata.version;
        if (metaVersion !== REVISION) {
            console.warn(`Project.fromJSON: Project saved in 'v${metaVersion}', attempting to load with 'v${REVISION}'`);
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
                case 'Scene3D': this.addScene(new Scene3D().fromJSON(json.scenes[i], this)); break;
            }
        }
        return this;
    }
    toJSON() {
        const meta = {};
        const json = AssetManager.toJSON(meta);
        json.metadata = {
            type: 'Onsight',
            version: REVISION,
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
        renderer = new THREE$1.WebGLRenderer({ antialias: true });
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
                                    console.warn(`Player: Event type not supported ('${name}')`);
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
            let vec = new THREE$1.Vector3(x, y, 0);
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
        entity.destroy();
        this.entities.push(entity);
    }
    expand(n = 10) {
        for(let i = 0; i < n; i++) {
            this.entities.push(new Entity3D());
        }
    }
}

class ColorEye {
    static get NAMES() { return COLOR_KEYWORDS; }
    constructor(r = 0xffffff, g, b, type = '') {
        this.isColor = true;
        this.r = 1;
        this.g = 1;
        this.b = 1;
        this.set(r, g, b, type);
    }
    copy(colorObject) {
        return this.set(colorObject);
    }
    set(r = 0, g, b, type = '') {
        if (arguments.length === 0) {
            return this.set(0);
        } else if (r === undefined || r === null || Number.isNaN(r)) {
            if (g || b) console.warn(`ColorEye: Passed some valid arguments, however 'r' was ${r}`);
        } else if (g === undefined && b === undefined) {
            let value = r;
            if (typeof value === 'number' || value === 0) { return this.setHex(value);
            } else if (value && isRGB(value)) { return this.setRGBF(value.r, value.g, value.b);
            } else if (value && isHSL(value)) { return this.setHSL(value.h * 360, value.s, value.l);
            } else if (value && isRYB(value)) { return this.setRYB(value.r * 255, value.y * 255, value.b * 255);
            } else if (Array.isArray(value) && value.length > 2) {
                let offset = (typeof g === number && g > 0) ? g : 0;
                return this.setRGBF(value[offset], value[offset + 1], value[offset + 2])
            } else if (typeof value === 'string') {
                return this.setStyle(value);
            }
        } else {
            switch (type) {
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
        console.warn(`ColorEye: Unknown color ${style}`);
        return this;
    }
    setHex(hexColor) {
        hexColor = Math.floor(hexColor);
        if (hexColor > 0xffffff || hexColor < 0) {
            console.warn(`ColorEye: Given decimal outside of range, value was ${hexColor}`);
            hexColor = clamp(hexColor, 0, 0xffffff);
        }
        let r = (hexColor & 0xff0000) >> 16;
        let g = (hexColor & 0x00ff00) >>  8;
        let b = (hexColor & 0x0000ff);
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
        let hexColor = cubicInterpolation(clamp(r, 0, 255), clamp(y, 0, 255), clamp(b, 0, 255), 255, CUBE.RYB_TO_RGB);
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
                        let r = Math.min(255, parseInt(color[1], 10));
                        let g = Math.min(255, parseInt(color[2], 10));
                        let b = Math.min(255, parseInt(color[3], 10));
                        return this.setRGB(r, g, b);
                    }
                    if ( color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                        let r = (Math.min(100, parseInt(color[1], 10)) / 100);
                        let g = (Math.min(100, parseInt(color[2], 10)) / 100);
                        let b = (Math.min(100, parseInt(color[3], 10)) / 100);
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
                let r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
                let g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
                let b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
                return this.setRGB(r, g, b);
            } else if (size === 6) {
                let r = parseInt(hex.charAt(0) + hex.charAt(1), 16);
                let g = parseInt(hex.charAt(2) + hex.charAt(3), 16);
                let b = parseInt(hex.charAt(4) + hex.charAt(5), 16);
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
    hexString(hexColor ){
        if (hexColor === undefined || typeof value !== 'number') hexColor = this.hex();
        return ColorEye.hexString(hexColor);
    }
    static hexString(hexColor = 0){
        return '#' + ('000000' + ((hexColor) >>> 0).toString(16)).slice(-6);
    }
    static randomHex() {
        return _random.setRandom().hex();
    }
    rgbString(alpha) {
        let rgb = this.red() + ', ' + this.green() + ', ' + this.blue();
        let rgba = (alpha != undefined) ? rgb + ', ' + alpha : rgb;
        return rgba;
    }
    toJSON() {
        return this.hex();
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b);
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
        } else {
            return { r: redF(rybAsHex), y: greenF(rybAsHex), b: blueF(rybAsHex) };
        }
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
        if (! color.isColor) console.warn(`ColorEye: add() was not called with a 'Color' object`);
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
    greyscale(percent = 1.0, type = 'luminosity') { return this.grayscale(percent, type) }
    grayscale(percent = 1.0, type = 'luminosity') {
        let gray = 0;
        switch (type) {
            case 'luminosity':
                gray = (this.r * 0.21) + (this.g * 0.72) + (this.b * 0.07);
            case 'average':
            default:
                gray = (this.r + this.g + this.b) / 3;
        }
        percent = clamp(percent, 0, 1);
        let r = (this.r * (1.0 - percent)) + (percent * gray);
        let g = (this.g * (1.0 - percent)) + (percent * gray);
        let b = (this.b * (1.0 - percent)) + (percent * gray);
        return this.setRGBF(r, g, b);
    }
    hslOffset(h, s, l) {
        return this.setHSL(this.hue() + h, this.saturation() + s, this.lightness() + l);
    }
    mix(color, percent = 0.5) {
        if (! color.isColor) console.warn(`ColorEye: mix() was not called with a 'Color' object`);
        percent = clamp(percent, 0, 1);
        let r = (this.r * (1.0 - percent)) + (percent * color.r);
        let g = (this.g * (1.0 - percent)) + (percent * color.g);
        let b = (this.b * (1.0 - percent)) + (percent * color.b);
        return this.setRGBF(r, g, b);
    }
    multiply(color) {
        if (! color.isColor) console.warn(`ColorEye: multiply() was not called with a 'Color' object`);
        return this.setRGBF(this.r * color.r, this.g * color.g, this.b * color.b);
    }
    multiplyScalar(scalar) {
        return this.setRGBF(this.r * scalar, this.g * scalar, this.b * scalar);
    }
    rgbComplementary() {
        return this.rgbRotateHue(180);
    }
    rgbRotateHue(degrees = 90) {
        let newHue = keepInRange(this.hue() + degrees);
        return this.setHSL(newHue, this.saturation(), this.lightness());
    }
    rybAdjust() {
        return this.setHSL(hue(matchSpectrum(this.hue(), SPECTRUM.RYB)), this.saturation(), this.lightness());
    }
    rybComplementary() {
        return this.rybRotateHue(180);
    }
    rybRotateHue(degrees = 90) {
        let newHue = keepInRange(this.hueRYB() + degrees);
        return this.setHSL(hue(matchSpectrum(newHue, SPECTRUM.RYB)), this.saturation(), this.lightness());
    }
    subtract(color) {
        if (! color.isColor) console.warn(`ColorEye: subtract() was not called with a 'Color' object`);
        return this.setRGBF(this.r - color.r, this.g - color.g, this.b - color.b);
    }
    equals(color) {
        if (! color.isColor) console.warn(`ColorEye: equals() was not called with a 'Color' object`);
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
let _hslHex;
let _hslH;
let _hslS;
let _hslL;
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
        default: console.warn(`ColorEye: Unknown channel (${channel}) requested in hsl()`);
    }
    return 0;
}
const _mix1 = new ColorEye();
const _mix2 = new ColorEye();
const _random = new ColorEye();
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
const _interpolate = new ColorEye();
function cubicInterpolation(v1, v2, v3, scale = 255, table = CUBE.RYB_TO_RGB) {
    v1 = clamp(v1 / scale, 0, 1);
    v2 = clamp(v2 / scale, 0, 1);
    v3 = clamp(v3 / scale, 0, 1);
    let f0 = table[0], f1 = table[1], f2 = table[2], f3 = table[3];
    let f4 = table[4], f5 = table[5], f6 = table[6], f7 = table[7];
    let i1 = 1.0 - v1;
    let i2 = 1.0 - v2;
    let i3 = 1.0 - v3;
    let c0 = i1 * i2 * i3;
    let c1 = i1 * i2 * v3;
    let c2 = i1 * v2 * i3;
    let c3 = v1 * i2 * i3;
    let c4 = i1 * v2 * v3;
    let c5 = v1 * i2 * v3;
    let c6 = v1 * v2 * i3;
    let v7 = v1 * v2 * v3;
    let o1 = c0*f0[0] + c1*f1[0] + c2*f2[0] + c3*f3[0] + c4*f4[0] + c5*f5[0] + c6*f6[0] + v7*f7[0];
    let o2 = c0*f0[1] + c1*f1[1] + c2*f2[1] + c3*f3[1] + c4*f4[1] + c5*f5[1] + c6*f6[1] + v7*f7[1];
    let o3 = c0*f0[2] + c1*f1[2] + c2*f2[2] + c3*f3[2] + c4*f4[2] + c5*f5[2] + c6*f6[2] + v7*f7[2];
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

class Vectors {
    static absolute(vec3) {
        vec3.x = Math.abs(vec3.x);
        vec3.y = Math.abs(vec3.y);
        vec3.z = Math.abs(vec3.z);
    }
    static noZero(vec3, min = 0.001) {
        if (Maths.fuzzyFloat(vec3.x, 0, min)) vec3.x = (vec3.x < 0) ? (min * -1) : min;
		if (Maths.fuzzyFloat(vec3.y, 0, min)) vec3.y = (vec3.y < 0) ? (min * -1) : min;
		if (Maths.fuzzyFloat(vec3.z, 0, min)) vec3.z = (vec3.z < 0) ? (min * -1) : min;
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

const _color = new THREE$1.Color();
const _position = new THREE$1.Vector3();
class SVGBuilder {
    static buildFromPaths(target, paths, onLoad, name = '') {
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
                    for (let c = 0; c < shape.curves.length; c++) {
                        const curve = shape.curves[c];
                        if (curve.v0) curve.v0.multiplyScalar(scaleDown);
                        if (curve.v1) curve.v1.multiplyScalar(scaleDown);
                        if (curve.v2) curve.v2.multiplyScalar(scaleDown);
                        if (curve.v3) curve.v3.multiplyScalar(scaleDown);
                        if (curve.aX) curve.aX *= scaleDown;
                        if (curve.aY) curve.aY *= scaleDown;
                        if (curve.xRadius) curve.xRadius *= scaleDown;
                        if (curve.yRadius) curve.yRadius *= scaleDown;
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
                    geometry.computeBoundingBox();
                    geometry.boundingBox.getCenter(_position);
                    geometry.center();
                    geometry.scale(1, -1, -1);
                    entity.position.copy(_position);
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
                child.position.x -= center.x;
                child.position.y -= center.y;
            }
        }
        if (onLoad && typeof onLoad === 'function') onLoad();
    }
    static fromFile(url, onLoad) {
        const svgGroup = new Entity3D();
        const loader = new SVGLoader();
        loader.load(url, function(data) {
            SVGBuilder.buildFromPaths(svgGroup, data.paths, onLoad, Strings.nameFromUrl(url));
        });
        return svgGroup;
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
        if (! openEnded) {
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
        let shape = new THREE$1.Shape();
        (function makeShapeFromVertices(s) {
            s.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                s.lineTo(vertices[i].x, vertices[i].y);
            }
            s.lineTo(vertices[0].x, vertices[0].y);
        })(shape);
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
    material.resolution = new THREE$1.Vector2(1024, 1024);
    material.depthTest = true;
    material.depthWrite = false;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.side = THREE$1.DoubleSide;
    material.alphaToCoverage = true;
}
const _objQuaternion = new THREE$1.Quaternion();
const _objScale = new THREE$1.Vector3();
const _objPosition = new THREE$1.Vector3();
const _tempScale = new THREE$1.Vector3();
const _tempSize = new THREE$1.Vector3();
const _box = new THREE$1.Box3();
const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);
class BasicLine extends THREE$1.LineSegments {
    constructor(x1, y1, z1, x2, y2, z2, boxColor = 0xffffff) {
        const vertices = [
            x1, y1, z1,
            x2, y2, z2,
        ];
        const indices = [0, 1];
        const lineGeometry = new THREE$1.BufferGeometry();
        lineGeometry.setIndex(indices);
        lineGeometry.setAttribute('position', new THREE$1.Float32BufferAttribute(vertices, 3));
        const lineMaterial = new THREE$1.LineBasicMaterial({ color: boxColor });
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
        this.point1 = new THREE$1.Vector3(x1, y1, z1);
        this.point2 = new THREE$1.Vector3(x2, y2, z2);
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
class BasicWireBox extends THREE$1.LineSegments {
    constructor(object, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
        const lineGeometry = new THREE$1.WireframeGeometry();
        const lineMaterial = new THREE$1.LineBasicMaterial({
            color: boxColor,
            opacity: opacity,
        });
        setWireframeMaterialDefaults(lineMaterial);
        super(lineGeometry, lineMaterial);
        this._positions = new Float32Array(8 * 3);
        this.points = [];
        for (let i = 0; i < 8; i++) this.points.push(new THREE$1.Vector3());
        if (object) this.updateFromObject(object, matchTransform);
        this.clone = function() {
            return new this.constructor(object, boxColor, opacity, matchTransform).copy(this, true);
        };
    }
    disableDepthTest() {
        this.material.depthTest = false;
    }
    updateFromObject(object, matchTransform) {
        let updateObject = object.clone();
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
        let array = this._positions;
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
        this.geometry.setAttribute('position', new THREE$1.Float32BufferAttribute(positions, 3));
        if (matchTransform) {
            this.setRotationFromQuaternion(_objQuaternion);
            this.scale.set(_objScale.x, _objScale.y, _objScale.z);
            this.position.set(_objPosition.x, _objPosition.y, _objPosition.z);
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
        targetBox3 = targetBox3 ?? new THREE$1.Box3();
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
        for (let i = 0; i <  8; i++) this.points.push(new THREE$1.Vector3());
        if (object) this.updateFromObject(object, matchTransform);
        this.clone = function() {
            return new this.constructor(object, lineWidth, boxColor, opacity, matchTransform).copy(this, true);
        };
    }
    disableDepthTest() {
        this.material.depthTest = false;
    }
    updateFromObject(object, matchTransform) {
        let updateObject = object.clone();
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
        let array = this._positions;
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
        targetBox3 = targetBox3 ?? new THREE$1.Box3();
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

class HelperObject {
    fromObject(object) {
        let geometry = new THREE.SphereGeometry(2, 4, 2);
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });
        let helper;
        if (object.isCamera) {
            helper = new THREE.CameraHelper(object);
        } else if (object.isPointLight) {
            helper = new THREE.PointLightHelper(object, 1);
        } else if (object.isDirectionalLight) {
            helper = new THREE.DirectionalLightHelper(object, 1);
        } else if (object.isSpotLight) {
            helper = new THREE.SpotLightHelper(object);
        } else if (object.isHemisphereLight) {
            helper = new THREE.HemisphereLightHelper(object, 1);
        } else if (object.isSkinnedMesh) {
            helper = new THREE.SkeletonHelper(object.skeleton.bones[0]);
        } else {
            return undefined;
        }
        const picker = new THREE.Mesh(geometry, material);
        picker.name = 'picker';
        picker.userData.object = object;
        helper.add(picker);
        return helper;
    }
}

const SCALE = 500;
class SkyObject extends THREE$1.Mesh {
    constructor() {
        const shader = SkyObject.SkyShader;
        super(new THREE$1.SphereGeometry(1), new THREE$1.ShaderMaterial({
            name:           'SkyShader',
            fragmentShader: shader.fragmentShader,
            vertexShader:   shader.vertexShader,
            uniforms:       THREE$1.UniformsUtils.clone(shader.uniforms),
            side:           THREE$1.BackSide,
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
        'uSky':     { value: new THREE$1.Color(0.00, 0.85, 0.80) },
        'uHorizon': { value: new THREE$1.Color(1.00, 0.75, 0.50) },
        'uGround':  { value: new THREE$1.Color(0.90, 0.70, 0.50) },
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

            ///// Sky fade (brighten at horizon)
            float skyFade = pow(vWorldPosition.y / (uScale * 0.25), 0.4);
            skyFade = clamp(skyFade, 0.0, 1.0);
            vec3 sky = mix(uHorizon, uSky, skyFade);

            ///// Seperates ground and sky, solid horizon: clamp(h * uScale, 0.0, 1.0)
            float blurHorizon =         0.05;
            float compressHorizon =     5.0;
            float skyMix = max(pow(max(h, 0.0), blurHorizon) * compressHorizon, 0.0);
            skyMix = clamp(skyMix, 0.0, 1.0);
            vec3 outColor = mix(uGround, sky, skyMix);

            ///// Output Color
            gl_FragColor = vec4(outColor, 1.0);
        }`
};

const DepthShader = {
    defines: {},
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
        'tDiffuse': { value: null },
        'tDepth': { value: null },
        'cameraNear': { value: 0.01 },
        'cameraFar': { value: 1000 },
        'weight': { value: 2.0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float weight;

        void main() {
            vec4  diffuse   = texture2D(tDiffuse, vUv);
            float depth     = texture2D(tDepth, vUv).x;

            if (depth >= 0.999) {
                gl_FragColor = texture2D(tDiffuse, vUv);        // discard unwritten depth
            } else {
                depth = ((depth - 0.5) * weight) + 0.5;         // add weight to objects in middle of camera range
                gl_FragColor = vec4(vec3(1.0 - depth), 1.0);
            }
        }
    `
};

class DepthPass extends Pass {
    constructor(camera) {
        super();
        this.camera = camera;
        this.needsSwap = false;
        this.copyPass = new ShaderPass(CopyShader);
        this.copyPass.clear = true;
        this.copyPass.clearDepth = false;
        this.copyPass.renderToScreen = false;
        this.copyPass.material.depthWrite = false;
        this.depthMaterial = new THREE$1.ShaderMaterial(DepthShader);
        this.fsQuad = new FullScreenQuad(this.depthMaterial);
    }
    dispose() {
        this.depthMaterial.dispose();
    }
    render(renderer, writeBuffer, readBuffer, deltaTime,) {
        const oldAutoClear = renderer.autoClear;
        const oldAutoClearColor = renderer.autoClearColor;
        const oldAutoClearDepth = renderer.autoClearDepth;
        const oldAutoClearStencil = renderer.autoClearStencil;
        renderer.autoClear = false;
        renderer.autoClearColor = true;
        renderer.autoClearDepth = false;
        renderer.autoClearStencil = false;
        const uniforms = this.fsQuad.material.uniforms;
        uniforms.tDiffuse.value = readBuffer.texture;
        uniforms.tDepth.value = readBuffer.depthTexture;
        uniforms.cameraNear.value = this.camera.near;
        uniforms.cameraFar.value = this.camera.far;
        uniforms.weight.value = (this.camera.isPerspectiveCamera) ? 1.0 : 7.0;
        renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.fsQuad.render(renderer);
        this.copyPass.render(renderer, readBuffer, writeBuffer, deltaTime);
        renderer.autoClear = oldAutoClear;
        renderer.autoClearColor = oldAutoClearColor;
        renderer.autoClearDepth = oldAutoClearDepth;
        renderer.autoClearStencil = oldAutoClearStencil;
    }
}

const _clearColor = new THREE$1.Color(0xffffff);
const _materialCache = [];
const _currClearColor = new THREE$1.Color();
let _emptyScene;
let _renderer$1;
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
        _emptyScene = new THREE$1.Scene();
        _emptyScene.onAfterRender = renderList;
        this.pickingTarget = new THREE$1.WebGLRenderTarget(1, 1, {
            minFilter: THREE$1.NearestFilter, magFilter: THREE$1.NearestFilter,
            format: THREE$1.RGBAFormat, encoding: THREE$1.LinearEncoding
        });
        this.pixelBuffer = new Uint8Array(4 * this.pickingTarget.width * this.pickingTarget.height);
        function renderList() {
            const renderList = _renderer$1.renderLists.get(self.scene, 0);
            renderList.opaque.forEach(processItem);
            renderList.transmissive.forEach(processItem);
            renderList.transparent.forEach(processItem);
        }
        function processItem(renderItem) {
            let object = renderItem.object;
            if (! object || ! object.isObject3D) return;
            if (! object.visible) return;
            if (! ObjectUtils.allowSelection(object)) return;
            let objId = object.id;
            let material = object.material;
            let geometry = object.geometry;
            let useMorphing = 0;
            if (material.morphTargets === true) {
                if (geometry.isBufferGeometry === true) {
                    useMorphing = (geometry.morphAttributes?.position?.length > 0) ? 1 : 0;
                } else if (geometry.isGeometry === true) {
                    useMorphing = (geometry.morphTargets?.length > 0) ? 1 : 0;
                }
            }
            let useSkinning = object.isSkinnedMesh ? 1 : 0;
            let useInstancing = object.isInstancedMesh === true ? 1 : 0;
            let frontSide = material.side === THREE$1.FrontSide ? 1 : 0;
            let backSide = material.side === THREE$1.BackSide ? 1 : 0;
            let doubleSide = material.side === THREE$1.DoubleSide ? 1 : 0;
            let index = (useMorphing << 0) |
                (useSkinning << 1) |
                (useInstancing << 2) |
                (frontSide << 3) |
                (backSide << 4) |
                (doubleSide << 5);
            let renderMaterial = _materialCache[index];
            if (! renderMaterial) {
                renderMaterial = new THREE$1.ShaderMaterial({
                    defines: { USE_MAP: '', USE_UV: '', USE_LOGDEPTHBUF: '', },
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

                                ///// To just render normal texture color:
                                // gl_FragColor = texelColor;
                            }
                        }
                    `,
                    fog: false,
                    lights: false,
                });
                renderMaterial.side = material.side;
                renderMaterial.skinning = useSkinning > 0;
                renderMaterial.morphTargets = useMorphing > 0;
                renderMaterial.uniforms = {
                    opacity: { value: 1.0 },
                    map: { value: undefined },
                    uvTransform: { value: new THREE$1.Matrix3() },
                    objectId: { value: [1.0, 1.0, 1.0, 1.0] },
                    useMap: { value: 0.0 },
                };
                _materialCache[index] = renderMaterial;
            }
            renderMaterial.uniforms.objectId.value = [
                (objId >> 24 & 255) / 255,
                (objId >> 16 & 255) / 255,
                (objId >> 8 & 255) / 255,
                (objId & 255) / 255,
            ];
            renderMaterial.uniforms.useMap.value = 0.0;
            if (material.map) {
                renderMaterial.uniforms.useMap.value = 1.0;
                renderMaterial.uniforms.map.value = material.map;
            }
            renderMaterial.uniformsNeedUpdate = true;
            _renderer$1.renderBufferDirect(self.camera, null, geometry, renderMaterial, object, null);
        }
    }
    dispose() {
        this.pickingTarget.dispose();
    }
    render(renderer, writeBuffer, readBuffer ) {
        if (this.needPick === false && this.renderDebugView === false) return;
        _renderer$1 = renderer;
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
            this.pickedId = (this.pixelBuffer[0] << 24) + (this.pixelBuffer[1] << 16) + (this.pixelBuffer[2] << 8) + this.pixelBuffer[3];
            this.needPick = false;
        }
    }
    renderPickScene(renderer, camera) {
        _renderer$1 = renderer;
        const currAlpha = renderer.getClearAlpha();
        renderer.getClearColor(_currClearColor);
        renderer.setClearColor(_clearColor);
        renderer.clear();
        renderer.render(_emptyScene, camera);
        renderer.setClearColor(_currClearColor, currAlpha);
    }
}

class OutlinePass extends Pass {
    constructor(resolution, scene, camera, selectedObjects) {
        super();
        this.renderScene = scene;
        this.renderCamera = camera;
        this.selectedObjects = selectedObjects !== undefined ? selectedObjects : [];
        this.visibleEdgeColor = new THREE$1.Color( 1, 1, 1 );
        this.hiddenEdgeColor = new THREE$1.Color( 0.1, 0.04, 0.02 );
        this.edgeGlow = 0.0;
        this.usePatternTexture = false;
        this.edgeThickness = 1.0;
        this.edgeStrength = 3.0;
        this.downSampleRatio = 2;
        this.pulsePeriod = 0;
        this._visibilityCache = new Map();
        this._materialCache = new Map();
        this._castShadowCache = new Map();
        this._receiveShadowCache = new Map();
        this.resolution = (resolution !== undefined) ? new THREE$1.Vector2(resolution.x, resolution.y) : new THREE$1.Vector2(256, 256);
        const resx = Math.round(this.resolution.x / this.downSampleRatio);
        const resy = Math.round(this.resolution.y / this.downSampleRatio);
        this.renderTargetMaskBuffer = new THREE$1.WebGLRenderTarget( this.resolution.x, this.resolution.y );
        this.renderTargetMaskBuffer.texture.name = 'OutlinePass.mask';
        this.renderTargetMaskBuffer.texture.generateMipmaps = false;
        this.depthMaterial = new THREE$1.MeshDepthMaterial();
        this.depthMaterial.side = THREE$1.DoubleSide;
        this.depthMaterial.depthPacking = THREE$1.RGBADepthPacking;
        this.depthMaterial.blending = THREE$1.NoBlending;
        this.invisibleMaterial = new THREE$1.MeshBasicMaterial({ visible: false });
        this.prepareMaskMaterial = this.getPrepareMaskMaterial();
        this.prepareMaskMaterial.side = THREE$1.DoubleSide;
        this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ( this.prepareMaskMaterial.fragmentShader, this.renderCamera );
        this.renderTargetDepthBuffer = new THREE$1.WebGLRenderTarget( this.resolution.x, this.resolution.y );
        this.renderTargetDepthBuffer.texture.name = 'OutlinePass.depth';
        this.renderTargetDepthBuffer.texture.generateMipmaps = false;
        this.renderTargetMaskDownSampleBuffer = new THREE$1.WebGLRenderTarget( resx, resy );
        this.renderTargetMaskDownSampleBuffer.texture.name = 'OutlinePass.depthDownSample';
        this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;
        this.renderTargetBlurBuffer1 = new THREE$1.WebGLRenderTarget( resx, resy );
        this.renderTargetBlurBuffer1.texture.name = 'OutlinePass.blur1';
        this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
        this.renderTargetBlurBuffer2 = new THREE$1.WebGLRenderTarget( Math.round( resx / 2 ), Math.round( resy / 2 ) );
        this.renderTargetBlurBuffer2.texture.name = 'OutlinePass.blur2';
        this.renderTargetBlurBuffer2.texture.generateMipmaps = false;
        this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
        this.renderTargetEdgeBuffer1 = new THREE$1.WebGLRenderTarget( resx, resy );
        this.renderTargetEdgeBuffer1.texture.name = 'OutlinePass.edge1';
        this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
        this.renderTargetEdgeBuffer2 = new THREE$1.WebGLRenderTarget( Math.round( resx / 2 ), Math.round( resy / 2 ) );
        this.renderTargetEdgeBuffer2.texture.name = 'OutlinePass.edge2';
        this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;
        const MAX_EDGE_THICKNESS = 4;
        const MAX_EDGE_GLOW = 4;
        this.separableBlurMaterial1 = this.getSeperableBlurMaterial( MAX_EDGE_THICKNESS );
        this.separableBlurMaterial1.uniforms[ 'texSize' ].value.set( resx, resy );
        this.separableBlurMaterial1.uniforms[ 'kernelRadius' ].value = 1;
        this.separableBlurMaterial2 = this.getSeperableBlurMaterial( MAX_EDGE_GLOW );
        this.separableBlurMaterial2.uniforms[ 'texSize' ].value.set( Math.round( resx / 2 ), Math.round( resy / 2 ) );
        this.separableBlurMaterial2.uniforms[ 'kernelRadius' ].value = MAX_EDGE_GLOW;
        this.overlayMaterial = this.getOverlayMaterial();
        if ( CopyShader === undefined ) console.error( 'THREE.OutlinePass relies on CopyShader' );
        const copyShader = CopyShader;
        this.copyUniforms = THREE$1.UniformsUtils.clone(copyShader.uniforms);
        this.copyUniforms[ 'opacity' ].value = 1.0;
        this.materialCopy = new THREE$1.ShaderMaterial( {
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE$1.NoBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
        } );
        this.enabled = true;
        this.needsSwap = false;
        this._oldClearColor = new THREE$1.Color();
        this.oldClearAlpha = 1;
        this.fsQuad = new FullScreenQuad( null );
        this.tempPulseColor1 = new THREE$1.Color();
        this.tempPulseColor2 = new THREE$1.Color();
        this.textureMatrix = new THREE$1.Matrix4();
        function replaceDepthToViewZ( string, camera ) {
            const type = camera.isPerspectiveCamera ? 'perspective' : 'orthographic';
            return string.replace( /DEPTH_TO_VIEW_Z/g, type + 'DepthToViewZ' );
        }
    }
    dispose() {
        this.renderTargetMaskBuffer.dispose();
        this.renderTargetDepthBuffer.dispose();
        this.renderTargetMaskDownSampleBuffer.dispose();
        this.renderTargetBlurBuffer1.dispose();
        this.renderTargetBlurBuffer2.dispose();
        this.renderTargetEdgeBuffer1.dispose();
        this.renderTargetEdgeBuffer2.dispose();
        this.invisibleMaterial.dispose();
        this.depthMaterial.dispose();
        this.prepareMaskMaterial.dispose();
        this.edgeDetectionMaterial.dispose();
        this.separableBlurMaterial1.dispose();
        this.separableBlurMaterial2.dispose();
        this.overlayMaterial.dispose();
        this.materialCopy.dispose();
        this.fsQuad.dispose();
    }
    setSize( width, height ) {
        this.renderTargetMaskBuffer.setSize( width, height );
        this.renderTargetDepthBuffer.setSize( width, height );
        let resx = Math.round( width / this.downSampleRatio );
        let resy = Math.round( height / this.downSampleRatio );
        this.renderTargetMaskDownSampleBuffer.setSize( resx, resy );
        this.renderTargetBlurBuffer1.setSize( resx, resy );
        this.renderTargetEdgeBuffer1.setSize( resx, resy );
        this.separableBlurMaterial1.uniforms[ 'texSize' ].value.set( resx, resy );
        resx = Math.round( resx / 2 );
        resy = Math.round( resy / 2 );
        this.renderTargetBlurBuffer2.setSize( resx, resy );
        this.renderTargetEdgeBuffer2.setSize( resx, resy );
        this.separableBlurMaterial2.uniforms[ 'texSize' ].value.set( resx, resy );
    }
    changeVisibilityOfSelectedObjects(isVisible) {
        const visibilityCache = this._visibilityCache;
        function gatherSelectedMeshesCallBack(object) {
            if (object.isMesh) {
                if (isVisible === true) {
                    object.visible = visibilityCache.get(object.id);
                } else {
                    visibilityCache.set(object.id, object.visible);
                    object.visible = isVisible;
                }
            }
        }
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const selectedObject = this.selectedObjects[i];
            selectedObject.traverse(gatherSelectedMeshesCallBack);
        }
    }
    changeVisibilityOfNonSelectedObjects(isVisible) {
        const self = this;
        const materialCache = this._materialCache;
        const visibilityCache = this._visibilityCache;
        const selectedMeshes = [];
        for (let i = 0; i < this.selectedObjects.length; i++) {
            this.selectedObjects[i].traverse((object) => {
                if (object.isMesh) selectedMeshes.push(object);
            });
        }
        this.renderScene.traverse((object) => {
            let isSelected = ObjectUtils.containsObject(selectedMeshes, object);
            if (! isSelected) {
                if (isVisible === true) {
                    if (object.isMesh) object.material = materialCache.get(object.id);
                    object.visible = visibilityCache.get(object.id);
                } else {
                    let holdsSelected = false;
                    object.traverse((child) => {
                        if (ObjectUtils.containsObject(selectedMeshes, child)) {
                            holdsSelected = true;
                        }
                    });
                    if (object.isMesh) materialCache.set(object.id, object.material);
                    visibilityCache.set(object.id, object.visible);
                    if (holdsSelected) {
                        if (object.isMesh) object.material = self.invisibleMaterial;
                    } else {
                        object.visible = false;
                    }
                }
            }
        });
    }
    disableShadows() {
        const castCache = this._castShadowCache;
        const receiveCache = this._receiveShadowCache;
        this.renderScene.traverse((object) => {
            castCache.set(object.id, object.castShadow);
            receiveCache.set(object.id, object.receiveShadow);
            object.castShadow = false;
            object.receiveShadow = false;
        });
    }
    enableShadows() {
        const castCache = this._castShadowCache;
        const receiveCache = this._receiveShadowCache;
        this.renderScene.traverse((object) => {
            object.castShadow = castCache.get(object.id);
            object.receiveShadow = receiveCache.get(object.id);
        });
    }
    updateTextureMatrix() {
        this.textureMatrix.set(
            0.5, 0.0, 0.0, 0.5,
            0.0, 0.5, 0.0, 0.5,
            0.0, 0.0, 0.5, 0.5,
            0.0, 0.0, 0.0, 1.0
        );
        this.textureMatrix.multiply( this.renderCamera.projectionMatrix );
        this.textureMatrix.multiply( this.renderCamera.matrixWorldInverse );
    }
    render( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {
        if ( this.selectedObjects.length > 0 ) {
            this.disableShadows();
            renderer.getClearColor( this._oldClearColor );
            this.oldClearAlpha = renderer.getClearAlpha();
            const oldAutoClear = renderer.autoClear;
            const oldOverrideMaterial = this.renderScene.overrideMaterial;
            renderer.autoClear = false;
            if ( maskActive ) renderer.state.buffers.stencil.setTest( false );
            renderer.setClearColor( 0xffffff, 1 );
            this.changeVisibilityOfSelectedObjects( false );
            const currentBackground = this.renderScene.background;
            this.renderScene.background = null;
            this.renderScene.overrideMaterial = this.depthMaterial;
            renderer.setRenderTarget( this.renderTargetDepthBuffer );
            renderer.clear();
            renderer.render( this.renderScene, this.renderCamera );
            this.changeVisibilityOfSelectedObjects( true );
            this.updateTextureMatrix();
            this.changeVisibilityOfNonSelectedObjects( false );
            this.renderScene.overrideMaterial = this.prepareMaskMaterial;
            this.prepareMaskMaterial.uniforms[ 'cameraNearFar' ].value.set( this.renderCamera.near, this.renderCamera.far );
            this.prepareMaskMaterial.uniforms[ 'depthTexture' ].value = this.renderTargetDepthBuffer.texture;
            this.prepareMaskMaterial.uniforms[ 'textureMatrix' ].value = this.textureMatrix;
            renderer.setRenderTarget( this.renderTargetMaskBuffer );
            renderer.clear();
            renderer.render( this.renderScene, this.renderCamera );
            this.renderScene.overrideMaterial = oldOverrideMaterial;
            this.changeVisibilityOfNonSelectedObjects( true );
            this.renderScene.background = currentBackground;
            this.fsQuad.material = this.materialCopy;
            this.copyUniforms[ 'tDiffuse' ].value = this.renderTargetMaskBuffer.texture;
            renderer.setRenderTarget( this.renderTargetMaskDownSampleBuffer );
            renderer.clear();
            this.fsQuad.render( renderer );
            this.tempPulseColor1.copy( this.visibleEdgeColor );
            this.tempPulseColor2.copy( this.hiddenEdgeColor );
            if ( this.pulsePeriod > 0 ) {
                const scalar = ( 1 + 0.25 ) / 2 + Math.cos( performance.now() * 0.01 / this.pulsePeriod ) * ( 1.0 - 0.25 ) / 2;
                this.tempPulseColor1.multiplyScalar( scalar );
                this.tempPulseColor2.multiplyScalar( scalar );
            }
            this.fsQuad.material = this.edgeDetectionMaterial;
            this.edgeDetectionMaterial.uniforms[ 'maskTexture' ].value = this.renderTargetMaskDownSampleBuffer.texture;
            this.edgeDetectionMaterial.uniforms[ 'texSize' ].value.set( this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height );
            this.edgeDetectionMaterial.uniforms[ 'visibleEdgeColor' ].value = this.tempPulseColor1;
            this.edgeDetectionMaterial.uniforms[ 'hiddenEdgeColor' ].value = this.tempPulseColor2;
            renderer.setRenderTarget( this.renderTargetEdgeBuffer1 );
            renderer.clear();
            this.fsQuad.render( renderer );
            this.fsQuad.material = this.separableBlurMaterial1;
            this.separableBlurMaterial1.uniforms[ 'colorTexture' ].value = this.renderTargetEdgeBuffer1.texture;
            this.separableBlurMaterial1.uniforms[ 'direction' ].value = OutlinePass.BlurDirectionX;
            this.separableBlurMaterial1.uniforms[ 'kernelRadius' ].value = this.edgeThickness;
            renderer.setRenderTarget( this.renderTargetBlurBuffer1 );
            renderer.clear();
            this.fsQuad.render( renderer );
            this.separableBlurMaterial1.uniforms[ 'colorTexture' ].value = this.renderTargetBlurBuffer1.texture;
            this.separableBlurMaterial1.uniforms[ 'direction' ].value = OutlinePass.BlurDirectionY;
            renderer.setRenderTarget( this.renderTargetEdgeBuffer1 );
            renderer.clear();
            this.fsQuad.render( renderer );
            this.fsQuad.material = this.separableBlurMaterial2;
            this.separableBlurMaterial2.uniforms[ 'colorTexture' ].value = this.renderTargetEdgeBuffer1.texture;
            this.separableBlurMaterial2.uniforms[ 'direction' ].value = OutlinePass.BlurDirectionX;
            renderer.setRenderTarget( this.renderTargetBlurBuffer2 );
            renderer.clear();
            this.fsQuad.render( renderer );
            this.separableBlurMaterial2.uniforms[ 'colorTexture' ].value = this.renderTargetBlurBuffer2.texture;
            this.separableBlurMaterial2.uniforms[ 'direction' ].value = OutlinePass.BlurDirectionY;
            renderer.setRenderTarget( this.renderTargetEdgeBuffer2 );
            renderer.clear();
            this.fsQuad.render( renderer );
            this.fsQuad.material = this.overlayMaterial;
            this.overlayMaterial.uniforms[ 'maskTexture' ].value = this.renderTargetMaskBuffer.texture;
            this.overlayMaterial.uniforms[ 'edgeTexture1' ].value = this.renderTargetEdgeBuffer1.texture;
            this.overlayMaterial.uniforms[ 'edgeTexture2' ].value = this.renderTargetEdgeBuffer2.texture;
            this.overlayMaterial.uniforms[ 'patternTexture' ].value = this.patternTexture;
            this.overlayMaterial.uniforms[ 'edgeStrength' ].value = this.edgeStrength;
            this.overlayMaterial.uniforms[ 'edgeGlow' ].value = this.edgeGlow;
            this.overlayMaterial.uniforms[ 'usePatternTexture' ].value = this.usePatternTexture;
            if ( maskActive ) renderer.state.buffers.stencil.setTest( true );
            renderer.setRenderTarget( readBuffer );
            this.fsQuad.render( renderer );
            renderer.setClearColor( this._oldClearColor, this.oldClearAlpha );
            renderer.autoClear = oldAutoClear;
            this.enableShadows();
            this._materialCache.clear();
            this._castShadowCache.clear();
            this._receiveShadowCache.clear();
            this._visibilityCache.clear();
        }
        if ( this.renderToScreen ) {
            this.fsQuad.material = this.materialCopy;
            this.copyUniforms[ 'tDiffuse' ].value = readBuffer.texture;
            renderer.setRenderTarget( null );
            this.fsQuad.render( renderer );
        }
    }
    getPrepareMaskMaterial() {
        return new THREE$1.ShaderMaterial( {
            uniforms: {
                'depthTexture': { value: null },
                'cameraNearFar': { value: new THREE$1.Vector2( 0.5, 0.5 ) },
                'textureMatrix': { value: null }
            },
            vertexShader:
                `
                #include <morphtarget_pars_vertex>
                #include <skinning_pars_vertex>
                varying vec4 projTexCoord;
                varying vec4 vPosition;
                uniform mat4 textureMatrix;
                void main() {
                    #include <skinbase_vertex>
                    #include <begin_vertex>
                    #include <morphtarget_vertex>
                    #include <skinning_vertex>
                    #include <project_vertex>

                    vPosition = mvPosition;

                    vec4 worldPosition = vec4( transformed, 1.0 );
                    #ifdef USE_INSTANCING
                        worldPosition = instanceMatrix * worldPosition;
                    #endif
                    worldPosition = modelMatrix * worldPosition;

                    projTexCoord = textureMatrix * worldPosition;
                }`,
            fragmentShader:
                `
                #include <packing>
                varying vec4 vPosition;
                varying vec4 projTexCoord;
                uniform sampler2D depthTexture;
                uniform vec2 cameraNearFar;
                void main() {
                    float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));
                    float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );
                    float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
                    gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);
                }`
        } );
    }
    getEdgeDetectionMaterial() {
        return new THREE$1.ShaderMaterial( {
            uniforms: {
                'maskTexture': { value: null },
                'texSize': { value: new THREE$1.Vector2( 0.5, 0.5 ) },
                'visibleEdgeColor': { value: new THREE$1.Vector3( 1.0, 1.0, 1.0 ) },
                'hiddenEdgeColor': { value: new THREE$1.Vector3( 1.0, 1.0, 1.0 ) },
            },
            vertexShader:
                `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader:
                `varying vec2 vUv;
                uniform sampler2D maskTexture;
                uniform vec2 texSize;
                uniform vec3 visibleEdgeColor;
                uniform vec3 hiddenEdgeColor;
                void main() {
                    vec2 invSize = 1.0 / texSize;
                    vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
                    vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
                    vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
                    vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
                    vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
                    float diff1 = (c1.r - c2.r)*0.5;
                    float diff2 = (c3.r - c4.r)*0.5;
                    float d = length( vec2(diff1, diff2) );
                    float a1 = min(c1.g, c2.g);
                    float a2 = min(c3.g, c4.g);
                    float visibilityFactor = min(a1, a2);
                    vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
                    gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
                }`
        } );
    }
    getSeperableBlurMaterial( maxRadius ) {
        return new THREE$1.ShaderMaterial( {
            defines: {
                'MAX_RADIUS': maxRadius,
            },
            uniforms: {
                'colorTexture': { value: null },
                'texSize': { value: new THREE$1.Vector2( 0.5, 0.5 ) },
                'direction': { value: new THREE$1.Vector2( 0.5, 0.5 ) },
                'kernelRadius': { value: 1.0 }
            },
            vertexShader:
                `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader:
                `#include <common>
                varying vec2 vUv;
                uniform sampler2D colorTexture;
                uniform vec2 texSize;
                uniform vec2 direction;
                uniform float kernelRadius;
                float gaussianPdf(in float x, in float sigma) {
                    return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
                }
                void main() {
                    vec2 invSize = 1.0 / texSize;
                    float weightSum = gaussianPdf(0.0, kernelRadius);
                    vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
                    vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
                    vec2 uvOffset = delta;
                    for( int i = 1; i <= MAX_RADIUS; i ++ ) {
                        float w = gaussianPdf(uvOffset.x, kernelRadius);
                        vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
                        vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
                        diffuseSum += ((sample1 + sample2) * w);
                        weightSum += (2.0 * w);
                        uvOffset += delta;
                    }
                    gl_FragColor = diffuseSum/weightSum;
                }`
        } );
    }
    getOverlayMaterial() {
        return new THREE$1.ShaderMaterial( {
            uniforms: {
                'maskTexture': { value: null },
                'edgeTexture1': { value: null },
                'edgeTexture2': { value: null },
                'patternTexture': { value: null },
                'edgeStrength': { value: 1.0 },
                'edgeGlow': { value: 1.0 },
                'usePatternTexture': { value: 0.0 }
            },
            vertexShader:
                `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader:
                `varying vec2 vUv;
                uniform sampler2D maskTexture;
                uniform sampler2D edgeTexture1;
                uniform sampler2D edgeTexture2;
                uniform sampler2D patternTexture;
                uniform float edgeStrength;
                uniform float edgeGlow;
                uniform bool usePatternTexture;
                void main() {
                    vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
                    vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
                    vec4 maskColor = texture2D(maskTexture, vUv);
                    vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
                    float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
                    vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
                    vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
                    if(usePatternTexture)
                        finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
                    gl_FragColor = finalColor;
                }`,
            blending: THREE$1.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
        } );
    }
}
OutlinePass.BlurDirectionX = new THREE$1.Vector2(1.0, 0.0);
OutlinePass.BlurDirectionY = new THREE$1.Vector2(0.0, 1.0);

const _oldClearColor = new THREE$1.Color();
class WireframePass extends Pass {
    constructor(scene, camera, wireColor = 0xffffff, opacity = 0.25) {
        super();
        this.scene = scene;
        this.camera = camera;
        this.selectedObjects = [];
        this.clearColor = undefined;
        this.clearAlpha = 0.0;
        this.clear = false;
        this.clearDepth = false;
        this.needsSwap = false;
        this.enabled = true;
        this._visibilityCache = new Map();
        this._materialMap = new Map();
        this.overrideMaterial = new THREE$1.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
            opacity: opacity,
            transparent: true,
            vertexColors: false,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            alphaToCoverage: false,
        });
        this.invisibleMaterial = new THREE$1.MeshBasicMaterial({ visible: false });
    }
    dispose() {
        this.overrideMaterial.dispose();
        this.invisibleMaterial.dispose();
    }
    render(renderer, writeBuffer, readBuffer ) {
        if (this.selectedObjects.length < 1) return;
        renderer.getClearColor(_oldClearColor);
        const oldClearAlpha = renderer.getClearAlpha();
        const oldAutoClear = renderer.autoClear;
        const oldOverrideMaterial = this.scene.overrideMaterial;
        const oldSceneBackground = this.scene.background;
        renderer.setClearColor(0x000000, 0);
        renderer.autoClear = false;
        this.scene.overrideMaterial = this.overrideMaterial;
        this.scene.background = null;
        this.changeVisibilityOfNonSelectedObjects(false);
        if (this.clearDepth) renderer.clearDepth();
        renderer.setRenderTarget((this.renderToScreen || (! readBuffer)) ? null : readBuffer);
        renderer.render(this.scene, this.camera);
        this.changeVisibilityOfNonSelectedObjects(true);
        this._visibilityCache.clear();
        renderer.setClearColor(_oldClearColor, oldClearAlpha);
        renderer.autoClear = oldAutoClear;
        this.scene.overrideMaterial = oldOverrideMaterial;
        this.scene.background = oldSceneBackground;
    }
    setObjects(objects) {
        if (Array.isArray(objects)) {
            this.selectedObjects = objects;
        } else {
            this.selectedObjects = [ objects ];
        }
    }
    setWireColor(wireColor) {
        this.overrideMaterial.color.setHex(wireColor);
    }
    changeVisibilityOfNonSelectedObjects(isVisible) {
        const self = this;
        const cache = this._visibilityCache;
        const materials = this._materialMap;
        const selectedMeshes = [];
        function gatherSelectedMeshesCallBack(object) {
            if (object.isMesh) selectedMeshes.push(object);
        }
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const selectedObject = this.selectedObjects[i];
            selectedObject.traverse(gatherSelectedMeshesCallBack);
        }
        function VisibilityChangeCallBack(object) {
            if (object.isMesh) {
                if (ObjectUtils.containsObject(selectedMeshes, object) === false) {
                    if (isVisible === true) {
                        object.material = materials.get(object.id);
                    } else {
                        materials.set(object.id, object.material);
                        object.material = self.invisibleMaterial;
                    }
                }
            }
        }
        this.scene.traverse(VisibilityChangeCallBack);
    }
}

const TexturedShader = {
    defines: { USE_LOGDEPTHBUF: '' },
    transparent: true,
    uniforms: {
        'map': { value: null },
        'opacity': { value: 1.0 },
    },
    vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>

        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            #include <logdepthbuf_vertex>
        }`,
    fragmentShader: `
        #include <common>

        uniform sampler2D map;
        uniform float opacity;
        varying vec2 vUv;

        #include <logdepthbuf_pars_fragment>

        void main() {
            #include <logdepthbuf_fragment>

            vec4 texel = texture2D(map, vUv);
            if (texel.a < 0.01) discard;

            gl_FragColor = opacity * texel;
        }`
};

const XRayShader = {
    defines: { USE_LOGDEPTHBUF: '' },
    side: THREE$1.DoubleSide,
    blending: THREE$1.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    uniforms: {
        'xrayColor': { value: new THREE$1.Color(0x88ccff) },
    },
    vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>

        varying float intensity;

        void main() {
            // Normal calculation
            vec3  norm      = normalize(normalMatrix * normal);
            vec3  cam       = normalize(normalMatrix * cameraPosition);     // vec3(0.0, 0.0, 1.0);
            float angle     = dot(norm, cam);                               // brighter from the front
            float inverse   = 1.0 - abs(angle);                             // brighter from the sides

            float scaled    = 0.5 + (inverse * 0.5);                        // scaled from 0.5 to 1.0

            intensity       = mix(inverse, scaled, 1.0 - inverse);
            intensity       = clamp(intensity, 0.5, 1.0);

            // Shader chunk: #include <project_vertex>
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            #include <logdepthbuf_vertex>
        }`,
    fragmentShader: `
        #include <common>

        uniform vec3 xrayColor;
        varying float intensity;

        #include <logdepthbuf_pars_fragment>

        void main() {
            #include <logdepthbuf_fragment>

            float inverse   = 1.0 - intensity;
            float opacity   = intensity * sqrt(intensity);

            gl_FragColor = vec4(opacity * xrayColor, opacity);
        }`
};

const _uv = [ new THREE$1.Vector2(), new THREE$1.Vector2(), new THREE$1.Vector2() ];
const _vertex = [ new THREE$1.Vector3(), new THREE$1.Vector3(), new THREE$1.Vector3() ];
const _temp = new THREE$1.Vector3();
class GeometryUtils {
    static addAttribute(geometry, attributeName = 'color', stride = 3, fill = 0) {
        if (! geometry.getAttribute(attributeName)) {
            let array = new Float32Array(geometry.attributes.position.count * stride).fill(fill);
	        const attribute = new THREE$1.BufferAttribute(array, stride, true).setUsage(THREE$1.DynamicDrawUsage);
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
        if (! geometry) return;
        if (geometry.attributes && geometry.attributes.uv && geometry.attributes.uv.array) {
            for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
                geometry.attributes.uv.array[i + 0] *= s;
                geometry.attributes.uv.array[i + 1] *= t;
            }
            geometry.attributes.uv.needsUpdate = true;
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
        let geometrySize = GeometryUtils.modelSize(geometry);
        let size = (geometrySize / 2);
        let bbox = new THREE$1.Box3(new THREE$1.Vector3(- size, - size, - size), new THREE$1.Vector3(size, size, size));
        let boxCenter = new THREE$1.Vector3();
        geometry.boundingBox.getCenter(boxCenter);
        const centerMatrix = new THREE$1.Matrix4().makeTranslation(- boxCenter.x, - boxCenter.y, - boxCenter.z);
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
        const hasUV = ! (geometry.attributes.uv === undefined);
        if (! hasUV) geometry.addAttribute('uv', new THREE$1.Float32BufferAttribute(coords, 2));
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

let _renderer;
class RenderUtils {
    static offscreenRenderer(width = 512, height = 512) {
        if (_renderer === undefined) {
            _renderer = new THREE$1.WebGLRenderer({ alpha: true });
        }
        _renderer.setClearColor(0xffffff, 0);
        _renderer.setSize(width, height, false);
        return _renderer;
    }
    static renderGeometryToCanvas(canvas, geometry, geometryColor = 0xffffff) {
        const scene = new THREE$1.Scene();
        scene.add(new THREE$1.HemisphereLight(0xffffff, 0x202020, 1.5));
        const camera = new THREE$1.PerspectiveCamera(50, canvas.width / canvas.height);
        camera.position.set(0, 0, 1);
        const material = new THREE$1.MeshLambertMaterial({ color: geometryColor });
        const mesh = new THREE$1.Mesh(geometry, material);
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
        const scene = new THREE$1.Scene();
        const camera = new THREE$1.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const material = new THREE$1.MeshBasicMaterial({ map: texture, alphaTest: true });
        const quad = new THREE$1.PlaneGeometry(2, 2);
        const mesh = new THREE$1.Mesh(quad, material);
        scene.add(mesh);
        const image = texture.image;
        const renderer = RenderUtils.offscreenRenderer(image.width, image.height);
        renderer.render(scene, camera);
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

const CAMERA_START_DISTANCE = 5;
const CAMERA_START_HEIGHT = 0;
const _renderSize = new THREE$1.Vector2(1, 1);
class Camera {
    init(data) {
        let camera = undefined;
        switch (data.style) {
            case 'perspective':
                this._tanFOV = Math.tan(((Math.PI / 180) * data.fov / 2));
                this._windowHeight = (data.fixedSize) ? 1000 : 0;
                camera = new THREE$1.PerspectiveCamera(data.fov, 1 , data.nearPersp, data.farPersp);
                break;
            case 'orthographic':
                camera = new THREE$1.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.nearOrtho, data.farOrtho);
                break;
            default:
                console.error(`Camera.init: Invalid camera type '${data.style}'`);
        }
        if (camera && camera.isCamera) {
            camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
            camera.lookAt(0, CAMERA_START_HEIGHT, 0);
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
                this.backend.left =   - width / aspectWidth / 2;
                this.backend.right =    width / aspectWidth / 2;
                this.backend.top =      height * aspectHeight / 2;
                this.backend.bottom = - height * aspectHeight / 2;
            }
            this.backend.updateProjectionMatrix();
        }
    }
    toJSON() {
        let data = this.defaultData('style', this.style);
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        if (this.backend) {
            for (let key in data) {
                let value = this.backend[key];
                if (value !== undefined) {
                    data[key] = value;
                }
            }
        }
        return data;
    }
}
Camera.config = {
    schema: {
        style: { type: 'select', default: 'perspective', select: [ 'perspective', 'orthographic' ] },
        nearPersp: { type: 'number', default: 1, if: { style: [ 'perspective' ] } },
        farPersp: { type: 'number', default: 100000, if: { style: [ 'perspective' ] } },
        nearOrtho: { type: 'number', default: -50000, if: { style: [ 'orthographic' ] } },
        farOrtho: { type: 'number', default: 50000, if: { style: [ 'orthographic' ] } },
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

let _x = 0;
let _y = 0;
class Geometry {
    init(data) {
        if (this.backend && this.backend.isBufferGeometry) {
            this.backend.dispose();
            this.backend = undefined;
        }
        if (data.isBufferGeometry) {
            const assetUUID = data.uuid;
            AssetManager.addGeometry(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        }
        let geometry = undefined;
        switch (data.style) {
            case 'asset':
                let assetGeometry = AssetManager.getGeometry(data.asset);
                if (assetGeometry && assetGeometry.isBufferGeometry) {
                    geometry = assetGeometry.clone();
                }
                break;
            case 'box':
                geometry = new THREE$1.BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
                break;
            case 'capsule':
                let capRadiusTop = Maths.clamp(data.radiusTop, 0.1, data.height) / 1.5;
                let capRadiusBottom = Maths.clamp(data.radiusBottom, 0.1, data.height) / 1.5;
                let capHeight = data.height / 1.5;
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
                let svgLoader = new SVGLoader();
                let svgData = svgLoader.parse(`
                    <g transform="matrix(1,0,0,1,-62,77.5)">
                        <path d="M125,59C151.284,141.301 106.947,164.354 84,158L83,263C100.017,285.361 110.282,295.752 143,298" style="fill:none;stroke:black;stroke-width:1px;"/>
                    </g>
                `);
                let path = svgData.paths[Object.keys(svgData.paths)[0]];
                let svgShapes = SVGLoader.createShapes(path);
                let svgPoints = svgShapes[0].extractPoints(30);
                const points = [];
                for (let i = svgPoints.shape.length - 1; i >= 0; i--) {
                    points.push(new THREE$1.Vector2(svgPoints.shape[i].x * 0.005, svgPoints.shape[i].y * -0.005));
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
                let shape = data.shapes ?? new THREE$1.Shape([
                    new THREE$1.Vector2( 64,   8),
                    new THREE$1.Vector2(  0,  64),
                    new THREE$1.Vector2(-64,   8),
                    new THREE$1.Vector2(-32, -64),
                    new THREE$1.Vector2( 32, -64)
                ]);
                const californiaPts = [];
                californiaPts.push(new THREE$1.Vector2(610, 320));
                californiaPts.push(new THREE$1.Vector2(450, 300));
                californiaPts.push(new THREE$1.Vector2(392, 392));
                californiaPts.push(new THREE$1.Vector2(266, 438));
                californiaPts.push(new THREE$1.Vector2(190, 570));
                californiaPts.push(new THREE$1.Vector2(190, 600));
                californiaPts.push(new THREE$1.Vector2(160, 620));
                californiaPts.push(new THREE$1.Vector2(160, 650));
                californiaPts.push(new THREE$1.Vector2(180, 640));
                californiaPts.push(new THREE$1.Vector2(165, 680));
                californiaPts.push(new THREE$1.Vector2(150, 670));
                californiaPts.push(new THREE$1.Vector2( 90, 737));
                californiaPts.push(new THREE$1.Vector2( 80, 795));
                californiaPts.push(new THREE$1.Vector2( 50, 835));
                californiaPts.push(new THREE$1.Vector2( 64, 870));
                californiaPts.push(new THREE$1.Vector2( 60, 945));
                californiaPts.push(new THREE$1.Vector2(300, 945));
                californiaPts.push(new THREE$1.Vector2(300, 743));
                californiaPts.push(new THREE$1.Vector2(600, 473));
                californiaPts.push(new THREE$1.Vector2(626, 425));
                californiaPts.push(new THREE$1.Vector2(600, 370));
                californiaPts.push(new THREE$1.Vector2(610, 320));
                for (let i = 0; i < californiaPts.length; i++) californiaPts[i].multiplyScalar(0.001);
                const californiaShape = new THREE$1.Shape(californiaPts);
                const circleShape = new THREE$1.Shape();
                circleShape.absarc(0, 0, 1 );
                let options = {
                    depth: data.depth,
                    curveSegments: data.curveSegments,
                    steps: data.steps,
                    bevelEnabled: data.bevelEnabled,
                    bevelThickness: data.bevelThickness,
                    bevelSize: data.bevelSize,
                    bevelSegments: data.bevelSegments,
                };
                geometry = new THREE$1.ExtrudeGeometry(circleShape, options);
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
                const heartShape = new THREE$1.Shape()
                    .moveTo(_x + 25, _y + 25)
                    .bezierCurveTo(_x + 25, _y + 25, _x + 20, _y, _x, _y)
                    .bezierCurveTo(_x - 30, _y, _x - 30, _y + 35, _x - 30, _y + 35)
                    .bezierCurveTo(_x - 30, _y + 55, _x - 10, _y + 77, _x + 25, _y + 95)
                    .bezierCurveTo(_x + 60, _y + 77, _x + 80, _y + 55, _x + 80, _y + 35)
                    .bezierCurveTo(_x + 80, _y + 35, _x + 80, _y, _x + 50, _y)
                    .bezierCurveTo(_x + 35, _y, _x + 25, _y + 25, _x + 25, _y + 25);
                const arcPoints = heartShape.getPoints(256);
                const lines = [];
                for (let i = 0; i < arcPoints.length; i += 2) {
                    const pointA = arcPoints[i];
                    const pointB = arcPoints[i + 1] || pointA;
                    lines.push(
                        new THREE$1.LineCurve3(
                            new THREE$1.Vector3(pointA.x * 0.01, pointA.y * -0.01, 0),
                            new THREE$1.Vector3(pointB.x * 0.01, pointB.y * -0.01, 0),
                        ),
                    );
                }
                const path3D = new THREE$1.CurvePath();
                path3D.curves.push(...lines);
                geometry = new THREE$1.TubeGeometry(path3D, data.tubularSegments, data.radius, data.radialSegments, data.closed);
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
                maxTriangles: 50000,
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
        if (this.backend && this.backend.dispose) this.backend.dispose();
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
        let data = this.defaultData('style', this.style);
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
        asset: { type: 'asset', if: { style: [ 'asset' ] } },
        styleDivider: { type: 'divider' },
        polyhedron: [ { type: 'select', default: 'dodecahedron', select: [ 'dodecahedron', 'icosahedron', 'octahedron', 'tetrahedron' ], if: { style: [ 'platonicSolid' ] } } ],
        points: { type: 'shape', alias: 'points', default: null, if: { style: [ 'lathe' ] } },
        shapes: { type: 'shape', alias: 'shape', default: null, if: { style: [ 'shape' ] } },
        path: { type: 'shape', alias: 'curve', default: null, if: { style: [ 'tube' ] } },
        depth: [
            { type: 'number', default: 1.0, min: 0, step: 'grid', if: { style: [ 'box', 'roundedBox' ] } },
            { type: 'number', default: 0.4, min: 0, step: 'grid', if: { style: [ 'shape' ] } },
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
            { type: 'number', default: 0.20, min: 0, step: 0.01, if: { style: [ 'tube' ] } },
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
        steps: { type: 'int', alias: 'Depth Segments', default: 8, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
        bevelEnabled: { type: 'boolean', alias: 'bevel', default: true, if: { style: [ 'shape' ] } },
        bevelThickness: { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        bevelSize: { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        bevelSegments: { type: 'int', default: 4, min: 0, max: 64, promode: true, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
        curveSegments: { type: 'int', default: 16, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
        tube: [
            { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'torus' ] } },
            { type: 'number', default: 0.1, min: 0, step: 0.01, if: { style: [ 'torusKnot' ] } },
        ],
        tubularSegments: [
            { type: 'int', default: 32, min: 3, max: 128, if: { style: [ 'torus' ] } },
            { type: 'int', default: 64, min: 3, max: 128, if: { style: [ 'torusKnot' ] } },
            { type: 'int', default: 64, min: 2, if: { style: [ 'tube' ] } },
        ],
        arc: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'torus' ] } },
        p: { type: 'number', default: 2, min: 1, max: 128, if: { style: [ 'torusKnot' ] } },
        q: { type: 'number', default: 3, min: 1, max: 128, if: { style: [ 'torusKnot' ] } },
        closed: { type: 'boolean', default: true, if: { style: [ 'tube' ] } },
        modifierDivider: { type: 'divider' },
        subdivide: { type: 'slider', default: 0, min: 0, max: 5, step: 1, precision: 0 },
        edgeSplit: { type: 'boolean', default: false, hide: { subdivide: [ 0 ] } },
        uvSmooth: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        flatOnly: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
        textureDivider: { type: 'divider' },
        textureMapping: [
            { type: 'select', default: 'cube', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'shape' ] } },
            { type: 'select', default: 'none', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'asset', 'box', 'capsule', 'circle', 'cone', 'cylinder', 'lathe', 'plane', 'platonicSolid', 'ring', 'roundedBox', 'sphere', 'torus', 'torusKnot', 'tube' ] } },
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
        let light = undefined;
        switch (data.style) {
            case 'ambient':
                light = new THREE$1.AmbientLight(data.color, data.intensity);
                break;
            case 'directional':
                light = new THREE$1.DirectionalLight(data.color, data.intensity);
                light.castShadow = true;
                light.shadow.mapSize.width = 2048;
                light.shadow.mapSize.height = 2048;
                const SD = 5;
                light.shadow.camera.near = 1;
                light.shadow.camera.far = 500;
                light.shadow.camera.left = -SD;
                light.shadow.camera.right = SD;
                light.shadow.camera.top = SD;
                light.shadow.camera.bottom = -SD;
                light.shadow.camera.updateProjectionMatrix();
                light.shadow.bias = data.shadowBias;
                break;
            case 'hemisphere':
                light = new THREE$1.HemisphereLight(data.color, data.groundColor, data.intensity);
                break;
            case 'point':
                light = new THREE$1.PointLight(data.color, data.intensity, data.distance, data.decay);
                light.castShadow = true;
                light.shadow.bias = data.shadowBias;
                break;
            case 'spot':
                light = new THREE$1.SpotLight(data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay);
                light.castShadow = true;
                light.shadow.bias = data.shadowBias;
                break;
            default:
                console.error(`Light: Invalid light type '${data.style}'`);
        }
        if (light && light.isLight) {
        } else {
            console.log('Error with light!');
        }
        this.backend = light;
        this.data = data;
        this.style = data.style;
    }
    dispose() {
        if (this.backend && this.backend.isLight) this.backend.dispose();
    }
    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }
    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }
    toJSON() {
        let data = this.defaultData('style', this.style);
        for (let key in data) {
            if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        if (this.backend) {
            for (let key in data) {
                let value = this.backend[key];
                if (value !== undefined) {
                    if (value && value.isColor) data[key] = value.getHex();
                    else data[key] = value;
                }
            }
            if (this.backend.shadow) {
                data['shadowBias'] = this.backend.shadow.bias;
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
            { type: 'slider', default: 0.25 , step: 0.1, min: 0, max: 2, if: { style: [ 'ambient' ] } },
            { type: 'slider', default: 0.50 , step: 0.1, min: 0, max: 2, if: { style: [ 'hemisphere' ] } },
            { type: 'slider', default: 1.00 , step: 0.1, min: 0, max: 2, if: { style: [ 'directional' ] } },
            { type: 'slider', default: 1.00 , step: 0.1, min: 0, max: 2, if: { style: [ 'point', 'spot' ] } },
        ],
        distance: { type: 'number', default: 0, if: { style: [ 'point', 'spot' ] } },
        decay: { type: 'number', default: 1, if: { style: [ 'point', 'spot' ] } },
        angle: { type: 'number', default: Math.PI / 3, unit: '°', if: { style: [ 'spot' ] } },
        penumbra: { type: 'number', default: 0, if: { style: [ 'spot' ] } },
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
        if (this.backend && this.backend.isMaterial) {
            this.backend.dispose();
            this.backend = undefined;
        }
        const parameters = {};
        if (data.isMaterial) {
            const assetUUID = data.uuid;
            AssetManager.addMaterial(data);
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;
        } else {
            for (const key in data) {
                const value = data[key];
                parameters[key] = value;
                let checkType = Material.config.schema[key];
                if (System.isIterable(checkType) && checkType.length > 0) checkType = checkType[0];
                if (value && checkType && checkType.type === 'image') {
                    if (value.isTexture) {
                        AssetManager.addTexture(value);
                    } else {
                        const textureCheck = AssetManager.getTexture(value);
                        if (textureCheck && textureCheck.isTexture === true) {
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
            if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE$1.BasicDepthPacking;
            if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE$1.RGBADepthPacking;
        }
        let material = undefined;
        switch (data.style) {
            case 'asset':
                let assetMaterial = AssetManager.getMaterial(data.asset);
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
            case 'toon':
                material = new THREE$1.MeshToonMaterial(parameters);
                data.gradientSize = Math.min(Math.max(data.gradientSize, 1), 16);
                const format = (getRenderer().capabilities.isWebGL2) ? THREE$1.RedFormat : THREE$1.LuminanceFormat;
                const colors = new Uint8Array(data.gradientSize + 2);
                for (let c = 0; c <= colors.length; c++) colors[c] = (c / colors.length) * 256;
                material.gradientMap = new THREE$1.DataTexture(colors, colors.length, 1, format);
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
        if (this.backend && this.backend.dispose) this.backend.dispose();
    }
    enable() {
        this.refreshMesh();
    }
    disable() {
        this.refreshMesh();
    }
    refreshMesh() {
        if (this.entity && this.mesh) this.entity.remove(this.mesh);
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
            this.mesh = new THREE$1.Points(geometry, material);
        } else {
            this.mesh = new THREE$1.Mesh(geometry, material);
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
        let data = this.defaultData('style', this.style);
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
            shader.uniforms = THREE$1.UniformsUtils.merge([
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
Material.config = {
    schema: {
        style: [
            { type: 'select', default: 'standard', promode: true, select: [ 'asset', 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'shader', 'standard', 'toon' ] },
            { type: 'select', default: 'standard', select: [ 'basic', 'points', 'standard', 'toon' ] },
        ],
        styleDivider: { type: 'divider' },
        asset: { type: 'asset', if: { style: [ 'asset' ] } },
        color: { type: 'color', if: { style: [ 'basic', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        emissive: { type: 'color', default: 0x000000, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
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
            { type: 'image', if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'standard', 'toon' ] } },
            { type: 'image', if: { style: [ 'points' ] } },
        ],
        matcap: { type: 'image', if: { style: [ 'matcap' ] } },
        alphaMap: { type: 'image', promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        bumpMap: { type: 'image', promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        bumpScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        clearcoatNormalMap: { type: 'image', promode: true, if: { style: [ 'physical' ] } },
        clearcoatNormalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'physical' ] } },
        displacementMap: { type: 'image', promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        displacementScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        emissiveMap: { type: 'image', promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        metalnessMap: { type: 'image', promode: true, if: { style: [ 'physical', 'standard' ] } },
        roughnessMap: { type: 'image', promode: true, if: { style: [ 'physical', 'standard' ] } },
        specularMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong' ] } },
        thicknessMap: { type: 'image', promode: true, if: { style: [ 'physical' ] } },
        transmissionMap: { type: 'image', promode: true, if: { style: [ 'physical' ] } },
        aoMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        envMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        lightMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        normalMap: { type: 'image', if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        side: { type: 'select', default: 'FrontSide', select: sides, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
    },
    icon: ``,
    color: 'rgb(165, 243, 0)',
    dependencies: [ 'geometry' ],
};
ComponentManager.register('material', Material);

class Mesh {
    init(data) {
        this.backend = (data.isObject3D) ? data : new THREE$1.Object3D();
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
    if (window.__ONSIGHT__) {
        console.warn('Multiple instances of Onsight being imported');
    } else {
        window.__ONSIGHT__ = REVISION;
    }
}

export { APP_STATES, App, AssetManager, BACKEND3D, BasicLine, BasicWireBox, BasicWireframe, CAMERA_SCALE, CAMERA_START_DISTANCE$1 as CAMERA_START_DISTANCE, CAMERA_START_HEIGHT$1 as CAMERA_START_HEIGHT, CameraUtils, CapsuleGeometry, ColorEye, ComponentManager, CylinderGeometry, DepthPass, DepthShader, ENTITY_FLAGS, ENTITY_TYPES, Entity3D, EntityPool, EntityUtils, FatLine, FatWireBox, FatWireframe, GeometryUtils, GpuPickerPass, HelperObject, Maths, NAME, Object3D, ObjectUtils, OutlinePass, PrismGeometry, Project, REVISION, RenderUtils, SCENE_TYPES, SVGBuilder, Scene3D, SkyObject, Strings, System, TexturedShader, Vectors, WORLD_TYPES, WireframePass, World3D, XRayShader };
