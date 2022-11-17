(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three'), require('three/addons/utils/BufferGeometryUtils.js'), require('three/addons/loaders/SVGLoader.js'), require('three/addons/lines/Line2.js'), require('three/addons/lines/LineGeometry.js'), require('three/addons/lines/LineMaterial.js'), require('three/addons/lines/LineSegmentsGeometry.js'), require('three/addons/lines/Wireframe.js'), require('three/addons/lines/WireframeGeometry2.js'), require('three/addons/shaders/CopyShader.js'), require('three/addons/postprocessing/Pass.js'), require('three/addons/postprocessing/ShaderPass.js'), require('three/addons/geometries/RoundedBoxGeometry.js'), require('three/addons/modifiers/SimplifyModifier.js'), require('three-subdivide')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three', 'three/addons/utils/BufferGeometryUtils.js', 'three/addons/loaders/SVGLoader.js', 'three/addons/lines/Line2.js', 'three/addons/lines/LineGeometry.js', 'three/addons/lines/LineMaterial.js', 'three/addons/lines/LineSegmentsGeometry.js', 'three/addons/lines/Wireframe.js', 'three/addons/lines/WireframeGeometry2.js', 'three/addons/shaders/CopyShader.js', 'three/addons/postprocessing/Pass.js', 'three/addons/postprocessing/ShaderPass.js', 'three/addons/geometries/RoundedBoxGeometry.js', 'three/addons/modifiers/SimplifyModifier.js', 'three-subdivide'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.onsight = global.onsight || {}, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE, global.THREE));
})(this, (function (exports, THREE$1, BufferGeometryUtils_js, SVGLoader_js, Line2_js, LineGeometry_js, LineMaterial_js, LineSegmentsGeometry_js, Wireframe_js, WireframeGeometry2_js, CopyShader_js, Pass_js, ShaderPass_js, RoundedBoxGeometry_js, SimplifyModifier_js, threeSubdivide) { 'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var THREE__namespace = /*#__PURE__*/_interopNamespaceDefault(THREE$1);

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Constants

    const CAMERA_SCALE = 0.01;
    const CAMERA_START_DISTANCE$1 = 5;
    const CAMERA_START_HEIGHT$1 = 0;

    ///// Local Variables

    const _raycaster = new THREE__namespace.Raycaster();

    ///// Class

    class CameraUtils {

        //////////////////// Creation

        /**
         * Create an orthographic camera
         * @param {Number} camWidth DOM element width camera is rendering into
         * @param {Number} camHeight DOM element height camera is rendering into
         * @param {*} fitType Camera should fit pixels to 'none' (no scaling) or 'width' or 'height'
         * @param {*} desiredSize If fitting to width or height, camera will zoom to fit this number of pizels
         * @returns Three.js camera object
         */
        static createOrthographic(camWidth, camHeight, fitType = 'none', desiredSize = 0) {
            // Create camera
            const camera = new THREE__namespace.OrthographicCamera(0, 1, 1, 0, -1000, 1000);

            // Add custom properties
            camera.desiredSize = desiredSize;
            camera.fitType = fitType;

            // Set starting location
            camera.position.set(0, CAMERA_START_HEIGHT$1, CAMERA_START_DISTANCE$1);
            camera.lookAt(0, CAMERA_START_HEIGHT$1, 0);

            CameraUtils.updateOrthographic(camera, camWidth, camHeight);
            return camera;
        }

        /**
         * Create a perspective camera
         * @param {Number} camWidth DOM element width camera is rendering into
         * @param {Number} camHeight DOM element height camera is rendering into
         * @param {Boolean} fixedSize Should camera maintain size no matter the height of the DOM element?
         * @returns Three.js camera object
         */
        static createPerspective(camWidth, camHeight, fixedSize = true) {
            // Create camera
            const camera = new THREE__namespace.PerspectiveCamera(
                58.10,      // fov = Field Of View
                1,          // aspect ratio (dummy value)
                0.01,       // near clipping plane
                1000,       // far clipping plane
            );

            // Remember these initial values
            camera.tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
            camera.windowHeight = (fixedSize) ? 1000 /* i.e. 1000 pixels tall, nice round number */ : 0;
            camera.fixedSize = fixedSize;

            // Move the camera back so we can view the scene
            camera.position.set(0, CAMERA_START_HEIGHT$1, CAMERA_START_DISTANCE$1);
            camera.lookAt(0, CAMERA_START_HEIGHT$1, 0);

            CameraUtils.updatePerspective(camera, camWidth, camHeight);
            return camera;
        }

        //////////////////// Update

        static updateCamera(camera, camWidth, camHeight) {
            if (camera.isPerspectiveCamera) CameraUtils.updatePerspective(camera, camWidth, camHeight);
            if (camera.isOrthographicCamera) CameraUtils.updateOrthographic(camera, camWidth, camHeight);
        }

        /** Updates a perspective camera's frustum */
        static updatePerspective(camera, camWidth, camHeight) {
            if (camera.fixedSize) {
                camera.fov = (360 / Math.PI) * Math.atan(camera.tanFOV * (camHeight / camera.windowHeight));
            }

            camera.aspect = camWidth / camHeight;                               // Set the camera's aspect ratio
            camera.updateProjectionMatrix();                                    // Update the camera's frustum
        }

        /** Updates an orthographic camera's frustum */
        static updateOrthographic(camera, camWidth, camHeight) {
            // Check for added camera properties
            let fit = camera.fitType;
            let size = 0;
            if (camera.desiredSize) {
                size = camera.desiredSize;
            } else {
                fit = 'none';
            }

            // Figure out target camera width / height
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

            // Calculate new frustum, update camera
            camera.left =    - width / aspectWidth / 2;
            camera.right =     width / aspectWidth / 2;
            camera.top =       height * aspectHeight / 2;
            camera.bottom =  - height * aspectHeight / 2;
            camera.updateProjectionMatrix();
        }

        //////////////////// Space

        /** Projects a point from 3D world space coordinates to 2D screen coordinates */
        static screenPoint(pointInWorld, camera) {
            if (! camera || ! camera.isCamera) {
                console.warn(`CameraUtils.screenPoint: No camera provided!`);
                return new THREE__namespace.Vector3();
            }
            return new THREE__namespace.Vector3.copy(pointInWorld).project(camera);
        }

        /** Unprojects a point from 2D screen coordinates to 3D world space coordinates */
        static worldPoint(pointOnScreen, camera, lookTarget = new THREE__namespace.Vector3(), facingPlane = 'xy') {
            if (! camera || ! camera.isCamera) {
                console.warn(`CameraUtils.worldPoint: No camera provided!`);
                return new THREE__namespace.Vector3();
            }

            ///// Distance to Z (as a percentage, interpolate between the near and far plane points)

            // let z = pointOnScreen.z ?? 0;
            // const nearVector = new THREE.Vector3(pointOnScreen.x, pointOnScreen.y, 0).unproject(camera);
            // const farVector = new THREE.Vector3(pointOnScreen.x, pointOnScreen.y, 1.0).unproject(camera);
            // const zTotal = Math.abs(nearVector.z) + Math.abs(farVector.z);
            // const zPercent = Math.abs(nearVector.z / zTotal);
            // const nx = nearVector.x + (zPercent * (farVector.x - nearVector.x));
            // const ny = nearVector.y + (zPercent * (farVector.y - nearVector.y));
            // const nz = nearVector.z + (zPercent * (farVector.z - nearVector.z));
            // return new THREE.Vector3(nx, ny, 0);//nz);

            ///// Raycaster Method

            // Rotate to 'facingPlane'
            const planeGeometry = new THREE__namespace.PlaneGeometry(100000000, 100000000, 2, 2);
            switch (facingPlane.toLowerCase()) {
                case 'yz': planeGeometry.rotateY(Math.PI / 2); break;
                case 'xz': planeGeometry.rotateX(Math.PI / 2); break;
            }
            planeGeometry.translate(lookTarget.x, lookTarget.y, lookTarget.z);

            // Mesh
            const planeMaterial = new THREE__namespace.MeshBasicMaterial({ side: THREE__namespace.DoubleSide });
            const plane = new THREE__namespace.Mesh(planeGeometry, planeMaterial);

            // Cast ray from camera
            _raycaster.setFromCamera(pointOnScreen, camera);
            if (camera.isOrthographicCamera) {
                _raycaster.ray.origin.set(pointOnScreen.x, pointOnScreen.y, - camera.far).unproject(camera);
            }
            const planeIntersects = _raycaster.intersectObject(plane, true);

            // Clean up
            planeGeometry.dispose();
            planeMaterial.dispose();

            return (planeIntersects.length > 0) ? planeIntersects[0].point : false;
        }

        //////////////////// Utils

        static distanceToFitObject(camera, object, offset = 1.25) {

        }

        /* Fits camera to object */
        static fitCameraToObject(camera, object, controls = null, offset = 1.25) {
            const boundingBox = new THREE__namespace.Box3();
            boundingBox.setFromObject(object);
            const center = boundingBox.getCenter(new THREE__namespace.Vector3());
            const size = boundingBox.getSize(new THREE__namespace.Vector3());

            // // #OPTION 0
            const fitDepthDistance = size.z / (2.0 * Math.atan(Math.PI * camera.fov / 360));
            const fitHeightDistance = Math.max(fitDepthDistance, size.y / (2.0 * Math.atan(Math.PI * camera.fov / 360)));
            const fitWidthDistance = (size.x / (2.7 * Math.atan(Math.PI * camera.fov / 360))) / camera.aspect;
            const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

            // // #OPTION 1
            // const maxSize = Math.max(size.x, size.y, size.z);
            // const fitHeightDistance = maxSize / (2.0 * Math.atan(Math.PI * camera.fov / 360));
            // const fitWidthDistance = fitHeightDistance / camera.aspect;
            // const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

            // // #OPTION 2
            // const fov = camera.fov * (Math.PI / 180);
            // const distance = offset * Math.abs(maxSize / 4 * Math.tan(fov * 2));

            camera.near = distance / 100;
            camera.far = distance * 100;
            camera.updateProjectionMatrix();

            camera.position.copy(center);
            // camera.position.y += distance / 2;
            camera.position.z += distance;
            camera.lookAt(center);

            if (controls) {
                controls.maxDistance = distance * 10;
                controls.target.copy(center);
                controls.update();
            }
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  Additional Source(s)
    //      MIT     https://github.com/mrdoob/three.js/blob/dev/src/math/MathUtils.js
    //
    /////////////////////////////////////////////////////////////////////////////////////
    //
    //  Angles
    //      radiansToDegrees        Converts radians to degrees
    //      degreesToRadians        Converts degrees to radians
    //  Common
    //      clamp                   Clamps a number between min and max
    //      damp                    Time based linear interpolation
    //      lerp                    Linear interpolation
    //      roundTo                 Returns a number rounded to 'decimalPlaces'
    //  Fuzzy Comparison
    //      fuzzyFloat              Compare two floats
    //      fuzzyVector             Compare two Vector3
    //      fuzzyQuaternion         Compare two Quaternion
    //  Geometry
    //      isPowerOfTwo            Checks if a number is power of 2
    //  Number Functions
    //      addCommas               Formats a number into a string with commas added for large numbers
    //      countDecimals           Counts significant decimal places
    //      isNumber                Checks if 'number' is a valid number
    //  Polygon
    //      lineCollision           Check if two lines are intersecting
    //      lineRectCollision       Checks if a line is intersecting a rectangle
    //  Random
    //      randomFloat             Random float from min (inclusive) to max (exclusive)
    //      randomInt               Random integer from min (inclusive) to max (exclusive)
    //
    /////////////////////////////////////////////////////////////////////////////////////

    class Maths {

        //////////////////// Angles

        static radiansToDegrees(radians) {
            return radians * (180 / Math.PI);
        }

        static degreesToRadians(degrees) {
            return (Math.PI / 180) * degrees;
        }

        //////////////////// Fuzzy Compare

        /** Compares two floats to see if they're almost the same */
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

        //////////////////// Common

        /** Clamps a number between min and max */
        static clamp(number, min, max) {
            number = Number(number);
            if (number < min) number = min;
            if (number > max) number = max;
            return number;
        }

        /** http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/ */
        static damp(x, y, lambda, dt) {
    	    return Maths.lerp(x, y, 1 - Math.exp(- lambda * dt));
        }

        /** https://en.wikipedia.org/wiki/Linear_interpolation */
        static lerp(x, y, t) {
    	    return (1 - t) * x + t * y;
        }

        /** Returns a number rounded to 'decimalPlaces' */
        static roundTo(number, decimalPlaces = 0) {
            const shift = Math.pow(10, decimalPlaces);
            return Math.round(number * shift) / shift;
        }

        ///// Geometry

        /** Checks if a number is power of 2 */
        static isPowerOfTwo(value) {
            return (value & (value - 1)) === 0 && value !== 0;
        }

        //////////////////// Numbers

        /** Formats a number into a string with commas added for large numbers (i.e. 12000 => 12,000) */
        static addCommas(number) {
            return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }

        /** Counts significant decimal places */
        static countDecimals(number) {
            if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
            return number.toString().split('.')[1].length || 0;
        }

        /** Checks if 'number' is a valid number */
        static isNumber(number) {
            return (typeof number === 'number' && ! Number.isNaN(number) && Number.isFinite(number));
        }

        //////////////////// Polygon

        /** Check if two lines are intersecting */
        static lineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
            // Calculate the direction of the lines
            let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
            if (Maths.fuzzyFloat(denom, 0, 0.0000001)) return false;
            let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
            let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

            if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1)) {
                // If intersecting, the intersection points are
                // 		crossX = x1 + (uA * (x2 - x1));
                // 		crossY = y1 + (uA * (y2 - y1));
                return true;
            }
            return false;
        }

        /** Checks if a line is intersecting a rectangle */
        static lineRectCollision(x1, y1, x2, y2, left, top, right, down) {
            const rectLeft =    Maths.lineCollision(x1, y1, x2, y2, left, top, left, down);
            const rectRight =   Maths.lineCollision(x1, y1, x2, y2, right, top, right, down);
            const rectTop =     Maths.lineCollision(x1, y1, x2, y2, left, top, right, top);
            const rectDown =    Maths.lineCollision(x1, y1, x2, y2, left, down, right, down);
            return (rectLeft || rectRight || rectTop || rectDown);
        }

        //////////////////// Random

        /** Random float from min (inclusive) to max (exclusive) */
        static randomFloat(min, max) {
    	    return min + Math.random() * (max - min);
        }

        /** Random integer from min (inclusive) to max (exclusive), randomInt(0, 3) => expected output: 0, 1 or 2 */
        static randomInt(min = 0, max = 1) {
            return min + Math.floor(Math.random() * (max - min));
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  Array Functions
    //      arrayFromArguments      Converts argument list to Array
    //      isIterable              Checks if a javascript object is iterable
    //      isObject                Checks if a variable is an object (and not null / array / function)
    //
    //  File System Functions
    //      save                    Saves an URL object to the host system
    //
    //  OS Functions
    //      detectOS                Attempts to detect current operating system
    //      fullscreen              Go fullscreen on DOM 'element'
    //      metaKeyOS               Returns character string of shortcut key depending on OS
    //
    //  System Functions
    //      sleep                   Pauses app for specified milliseconds
    //      waitForObject           Wait for getter to return an object that exists, then call a function
    //
    //  ------------------------------------------------------
    //
    //  Unicode Symbols
    //      Alt (Option)    ⌥ OR ⎇     Apple       
    //      Ctrl (Control)  ⌃
    //      Cmd (Command)   ⌘
    //      Shift           ⇧           Space      ' '  &nbsp;
    //      Caps Lock       ⇪           Degrees     °   &deg;
    //      Fn                          Search      ⌕
    //      Escape          ⎋           Target      ⌖
    //      Delete          ⌦           Touch       ⍝
    //      Backspace       ⌫
    //      Enter           ↵
    //
    /////////////////////////////////////////////////////////////////////////////////////

    class System {

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Array Functions
        ///////////////

        /** Returns argument list as array, or if array was passed as argument, returns array */
        static arrayFromArguments() {
            if (arguments.length === 1 && Array.isArray(arguments[0])) {
                return arguments[0];
            } else {
    		    return Array.from(arguments);
            }
        }

        /** Checks if a javascript object is iterable */
        static isIterable(obj) {
            if (obj == null) return false;
            return typeof obj[Symbol.iterator] === 'function';
        }

        /** Checks if a variable is an object (and not null / array / function) */
        static isObject(variable) {
            return (typeof variable === 'object' && ! Array.isArray(variable) && variable !== null);
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   File System
        ///////////////

        static save(url, filename) {
            try {
                const link = document.createElement('a');
                document.body.appendChild(link);                    // Firefox requires link to be in body
                link.href = url;
                link.download = filename || 'data.json';
                link.click(); // link.dispatchEvent(new MouseEvent('click'));
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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   OS (Operating System)
        ///////////////

        /** Attempts to detect current operating system */
        static detectOS() {
            let systems = {
                Android:    [ 'android' ],
                iOS:        [ 'iphone', 'ipad', 'ipod', 'ios' ],
                Linux:      [ 'linux', 'x11', 'wayland' ],
                Mac:        [ 'mac', 'darwin', 'osx', 'os x' ],
                Win:        [ 'win' ],
            };

            let userAgent = window.navigator.userAgent;                 // String
            let userAgentData = window.navigator.userAgentData;         // Object, not implemented in Safari (3/11/22)

            let platform = (userAgentData) ? userAgentData.platform : userAgent;
            platform = platform.toLowerCase();

            for (let key in systems) {
                for (let os of systems[key]) {
                    if (platform.indexOf(os) !== -1) return key;
                }
            }

            return 'Unknown OS';
        }

        /** Go fullscreen on DOM 'element' */
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

        /** Returns character string of shortcut key depending on OS */
        static metaKeyOS() {
            let system = System.detectOS();
            if (system === 'Mac') {
                return '⌘';
            } else {
                return '⌃'; /* 'Ctrl' */
            }
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   System
        ///////////////

        /** Pauses app for specified milliseconds */
        static sleep(ms) {
        }

        /** Wait for 'getter' to return an object that exists, then call a function */
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    const _boxCenter = new THREE__namespace.Box3();
    const _tempMatrix = new THREE__namespace.Matrix4();
    const _tempVector = new THREE__namespace.Vector3();
    const _startQuaternion = new THREE__namespace.Quaternion();
    const _tempQuaternion = new THREE__namespace.Quaternion();
    const _testQuaternion = new THREE__namespace.Quaternion();

    const _objPosition$2 = new THREE__namespace.Vector3();
    const _objQuaternion$1 = new THREE__namespace.Quaternion();
    new THREE__namespace.Euler();
    const _objScale$2 = new THREE__namespace.Vector3();

    ///// Class

    class ObjectUtils {

        /** Check if object should be allowed to be interacted with in Editor */
        static allowSelection(object) {
            let allowSelect = true;
            if (object.userData) {
                if (object.userData.flagLocked) allowSelect = false;
                if (object.userData.flagTemp) allowSelect = false;
            }
            return allowSelect;
        }

        /** Compares array of objects to see if transforms are all the same */
        static checkTransforms(array) {
            if (array.length <= 1) return true;
            array[0].getWorldQuaternion(_startQuaternion);
            for (let i = 1; i < array.length; i++) {
                array[i].getWorldQuaternion(_testQuaternion);
                if (Maths.fuzzyQuaternion(_startQuaternion, _testQuaternion) === false) return false;
            }
            return true;
        }

        /** Completely deletes 'object' (including geomtries and materials), and all of it's children */
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

        /** Disposes of a material */
        static clearMaterial(materials) {
            if (System.isIterable(materials) !== true) materials = [ materials ];
            for (let i = 0, il = materials.length; i < il; i++) {
                let material = materials[i];
                Object.keys(material).forEach(prop => { /* in case of map, bumpMap, normalMap, envMap, etc. */
                    if (! material[prop]) return;
                    if (typeof material[prop].dispose === 'function') material[prop].dispose();
                });
                material.dispose();
            }
        }

        /** Finds bounding box of an object or array of objects  (recursively adding children meshes) */
        static computeBounds(groupOrArray, targetBox, checkIfSingleGeometry = false) {
            if (targetBox === undefined || targetBox.isBox3 !== true) targetBox = new THREE__namespace.Box3();
            const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
            targetBox.makeEmpty();

            // If object contains single geometry, we might want un-rotated box
            if (checkIfSingleGeometry && ObjectUtils.countGeometry(groupOrArray) === 1) {
                let geomObject = undefined;
                objects.forEach((object) => { object.traverse((child) => { if (child.geometry) geomObject = child; }); });

                // Use unrotated geometry for box
                if (geomObject && geomObject.geometry) {
                    geomObject.geometry.computeBoundingBox();
                    targetBox.copy(geomObject.geometry.boundingBox);
                    geomObject.matrixWorld.decompose(_objPosition$2, _objQuaternion$1, _objScale$2);
                    _objQuaternion$1.identity();
                    _tempMatrix.compose(_objPosition$2, _objQuaternion$1, _objScale$2);
                    targetBox.applyMatrix4(_tempMatrix);
                    return targetBox;
                }
            }

            // Expand using geometries
            objects.forEach(object => targetBox.expandByObject(object));
            return targetBox;
        }

        /** Finds center point of an object or array of objects (recursively adding children meshes) */
        static computeCenter(groupOrArray, targetVec3) {
            const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];

            // Get Bounds
            ObjectUtils.computeBounds(objects, _boxCenter);

            // If still empty, no geometries were found, use object locations
            if (_boxCenter.isEmpty()) {
                for (let object of objects) {
                    object.getWorldPosition(_tempVector);
                    _boxCenter.expandByPoint(_tempVector);
                }
            }

            _boxCenter.getCenter(targetVec3);
            return targetVec3;
        }

        /** Checks array to see if it has an object (by Object3D.uuid) */
        static containsObject(arrayOfObjects, object) {
            if (object && object.uuid && System.isIterable(arrayOfObjects)) {
                for (let i = 0; i < arrayOfObjects.length; i++) {
                    if (arrayOfObjects[i].uuid === object.uuid) return true;
                }
            }
            return false;
        }

        /** Copies local transform from one object to another */
        static copyLocalTransform(source, target, updateMatrix = true) {
            source.updateMatrix();
            source.matrix.decompose(target.position, _tempQuaternion, target.scale);
            target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
            if (updateMatrix) target.updateMatrix();
        }

        /** Copies world transform from one object to another */
        static copyWorldTransform(source, target, updateMatrix = true) {
            source.updateWorldMatrix(true, true);
            source.matrixWorld.decompose(target.position, _tempQuaternion, target.scale);
            target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
            if (updateMatrix) target.updateMatrix();
        }

        /** Counts total geometris in an object or array of objects */
        static countGeometry(groupOrArray) {
            const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
            let geometryCount = 0;
            objects.forEach((object) => {
                object.traverse((child) => { if (child.geometry) geometryCount++; });
            });
            return geometryCount;
        }

        /** Puts 'group' (object with children) children back into parent (usually a scene), deletes 'group' */
        static flattenGroup(group) {
            if (! group) return;
            if (! group.parent) return;
            while (group.children) group.parent.attach(group.children[0]);
            ObjectUtils.clearObject(group, true);
        }

        /** Normalize / zero / reset object 3D transform */
        static resetTransform(object) {
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
        }

        /** Removes temporary children, returns removed objects as array */
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

        /** Restores temporary children */
        static tempObjectRestore(tempObjectArray) {
            for (let i = 0; i < tempObjectArray.length; i++) {
                let tempObject = tempObjectArray[i];
                tempObject.parent.attach(tempObject.object);
            }
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  String Functions
    //      addSpaces           Adds spaces between 'CamelCaseWords' -> 'Camel Case Words'
    //      capitalize          Capitalizes the first letter of every word in a string
    //      countDigits         Counts number of digits in a number
    //      nameFromUrl         Returns name from file url
    //
    /////////////////////////////////////////////////////////////////////////////////////

    class Strings {

        /** Adds spaces between 'CamelCaseWords' -> 'Camel Case Words' */
        static addSpaces(string) {
            return String(string).replace(/([A-Z])/g, ' $1').trim();
        }

        /** Capitalizes the first letter of every word in a string */
        static capitalize(string) {
            const words = String(string).split(' ');
            for (let i = 0; i < words.length; i++) {
                words[i] = words[i][0].toUpperCase() + words[i].substring(1);
            }
            return words.join(' ');
        }

        /** Counts number of digits in a number */
        static countDigits(number) {
            return parseFloat(number).toString().length;
        }

        /** Returns name from file url */
        static nameFromUrl(url, capitalize = true) {
            let imageName = new String(url.replace(/^.*[\\\/]/, ''));       // Filename only
            imageName = imageName.replace(/\.[^/.]+$/, "");                 // Remove extension
            if (capitalize) imageName = Strings.capitalize(imageName);
            return imageName;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////	Assets
    /////////////////////////////////////////////////////////////////////////////////////

    // Assets, Scripts
    let scripts = {};

    // Assets, Geometry
    let shapes = {};
    let geometries = {};

    // Assets, Material
    let images = {};
    let textures = {};
    let materials = {};

    // Assets, Other
    let animations = {};
    let skeletons = {};

    /////////////////////////////////////////////////////////////////////////////////////
    /////	Asset Manager
    /////////////////////////////////////////////////////////////////////////////////////

    const _textureCache = {};
    const _textureLoader = new THREE__namespace.TextureLoader();

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

        //////////////////// Geometry

        static addGeometry(geometry) {
    		if (geometry && geometry.isBufferGeometry) {
                // Ensure geometry has a name
                if (! geometry.name || geometry.name === '') {
                    geometry.name = geometry.constructor.name;
                }

                // Force 'BufferGeometry' type (strip ExtrudeGeometry, TextGeometry, etc...)
                const bufferGeometry = BufferGeometryUtils_js.mergeBufferGeometries([ geometry ]);
                bufferGeometry.name = geometry.name;
                bufferGeometry.uuid = geometry.uuid;
                geometry.dispose();
                geometry = bufferGeometry;

                // Add to 'geometries'
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

        //////////////////// Material

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

        //////////////////// Texture

        static loadTexture(url, onLoad = undefined) {
            if (! url || url === '') return null;

            // Check if trying to add an Image already in AssetManager
            let resolvedUrl = THREE__namespace.DefaultLoadingManager.resolveURL(url);
            if (_textureCache[resolvedUrl]) {
                console.log(`AssetManager.loadTexture: Duplicate image!`);
                return _textureCache[resolvedUrl];
            }

            // Load Texture
    		const texture = _textureLoader.load(url, onTextureLoaded, onTextureLoadError);
            _textureCache[resolvedUrl] = texture;

            function onTextureLoaded(newTexture) {
                // Name from source filename
                newTexture.name = Strings.nameFromUrl(newTexture.image.src);

                // !!!!! DEBUG: Pixel Access
                // const canvas = document.createElement('canvas');
                // canvas.width = newTexture.image.width;
                // canvas.height = newTexture.image.height;
                // const context = canvas.getContext('2d');
                // context.drawImage(newTexture.image, 0, 0);
                // const data = context.getImageData(0, 0, canvas.width, canvas.height);
                // console.info(data);

                // // Texture Properties
                // newTexture.encoding = THREE.sRGBEncoding;
                // newTexture.magFilter = THREE.NearestFilter;
                // newTexture.minFilter = THREE.NearestFilter;
                newTexture.premultiplyAlpha = true;
                newTexture.wrapS = THREE__namespace.RepeatWrapping;
                newTexture.wrapT = THREE__namespace.RepeatWrapping;

                // System.waitForObject('AssetManager.loadTexture: Waiting on renderer', () => return window.getRenderer, () => {
                //     // Reduces bluriness of mipmaps
                //     const maxAnisotropy = window.getRenderer().capabilities.getMaxAnisotropy(); /* Mac M1 === 16 */
                //     newTexture.anisotropy = maxAnisotropy;
                //     newTexture.mipmaps = [];
                //     newTexture.generateMipmaps = true;
                // });

                // On Load Callback
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

        //////////////////// JSON

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

            // Clear Assets
            AssetManager.clear();

            // Load Assets
    		const objectLoader = new THREE__namespace.ObjectLoader();
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

            // Geometries
            for (let uuid in geometries) {
                const geometry = geometries[uuid];
                if (! meta.geometries[geometry.uuid]) meta.geometries[geometry.uuid] = geometry.toJSON(meta);

                // Shapes
                if (geometry.parameters && geometry.parameters.shapes) {
                    let shapes = geometry.parameters.shapes;
                    if (Array.isArray(shapes) !== true) shapes = [ shapes ];
                    for (let i = 0, l = shapes.length; i < l; i++) {
                        const shape = shapes[i];
                        if (! meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(meta);
                    }
                }
            }

            // Materials
            for (let uuid in materials) {
                const material = materials[uuid];
                if (! meta.materials[material.uuid]) meta.materials[material.uuid] = material.toJSON(stopRoot);
            }

            // Textures
            for (let uuid in textures) {
                const texture = textures[uuid];
                if (! meta.textures[texture.uuid]) meta.textures[texture.uuid] = texture.toJSON(meta);
            }

            // Add 'meta' caches to 'json' as arrays
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Component Manager
    /////////////////////////////////////////////////////////////////////////////////////

    const _registered = {};

    class ComponentManager {

        /** Returns class definition of a registered type */
        static registered(type = '') {
            const ComponentClass = _registered[type];
            if (! ComponentClass) console.warn(`ComponentManager.registered: Component '${type}' not registered'`);
            return ComponentClass;
        }

        /** Returns an array of all types registered with Component Manager */
        static registeredTypes() {
            return Object.keys(_registered);
        }

        /** Registers a component type with the internal Component Manager () */
        static register(type = '', ComponentClass) {

            // Check for Component Type
            type = type.toLowerCase();
            if (_registered[type]) return console.warn(`ComponentManager.register: Component '${type}' already registered`);
            if (! System.isObject(ComponentClass.config)) ComponentClass.config = {};
            if (! System.isObject(ComponentClass.config.schema)) ComponentClass.config.schema = {};

            // Ensure Default Values for Properties
            const schema = ComponentClass.config.schema;
            for (const key in schema) {
                const prop = Array.isArray(schema[key]) ? schema[key] : [ schema[key] ];
                for (let i = 0, l = prop.length; i < l; i++) {
                    let property = prop[i];
                    if (property.type === undefined) {
                        console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                    } else if (property.type === 'divider') ; else if (property.default === undefined) {
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
                            // ------ !!!!! TODO: Below Needs Incorporate Inspector ------
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

            // Add Constructor (sets type)
            class Component extends ComponentClass {
                constructor() {
                    super();

                    // Prototype
                    this.isComponent = true;

                    // Properties
                    this.enabled = true;
                    this.tag = '';
                    this.type = type;

                    // Owner
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

                // Returns stored default schema (saved when Component was registered). Pass in starting data by key, value pair
                defaultData(/* key, value, key, value, etc. */) {
                    let data = {};

                    // Set Schema Defaults
                    for (let i = 0, l = arguments.length; i < l; i += 2) data[arguments[i]] = arguments[i+1];
                    ComponentManager.sanitizeData(data, ComponentClass.config.schema);

                    // Base Properties
                    data.base = {
                        enabled: 	this.enabled,
                        tag:		this.tag,
                        type:		this.type,
                    };
                    return data;
                }
            }

            // Register Component
            _registered[type] = Component;
        }

        static sanitizeData(data, schema) {

            ///// PARSE KEYS
            for (let schemaKey in schema) {

                // Get Value as Array (which is a list of properties with different 'if' conditions)
                let itemArray = schema[schemaKey];
                if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

                // Process each item in property array, check if that we satisfy 'if' condition
                let itemToInclude = undefined;
                for (let i = 0; i < itemArray.length; i++) {
                    let item = itemArray[i];

                    ///// FORMATTING ONLY
                    if (item.type === 'divider') continue;

                    ///// PROCESS 'IF'
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
                            // DO NOT INCLUDE
                            continue;
                        }
                    }

                    itemToInclude = item;
                    break;
                }

                // Make sure we have the property
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

                // Make sure we don't have the property
                } else {
                    delete data[schemaKey];
                }

            } // end for

        } // end function

        /** Removes data from 'newData' if conditions from schema on 'newData' don't match 'oldData' */
        static stripData(oldData, newData, schema) {

            ///// PARSE KEYS
            for (let schemaKey in schema) {
                let matchedConditions = false;

                // Get Value as Array (list of properties with different 'if' conditions)
                let itemArray = schema[schemaKey];
                if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

                // Process each item in property array, check if that we satisfy 'if' condition
                for (let i = 0; i < itemArray.length; i++) {
                    let item = itemArray[i];

                    ///// FORMATTING ONLY
                    if (item.type === 'divider') continue;

                    ///// PROCESS 'IF'
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
                            // DO NOT INCLUDE
                            continue;
                        }
                    }

                    matchedConditions = true;
                    break;
                }

                // Both data sets matched same condition
                if (matchedConditions !== true) {
                    delete newData[schemaKey];
                }

            }	// end for

        } // end function

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    new THREE__namespace.Matrix4();
    const _camPosition = new THREE__namespace.Vector3();
    const _camQuaternion = new THREE__namespace.Quaternion();
    const _camScale = new THREE__namespace.Vector3();
    new THREE__namespace.Quaternion();
    new THREE__namespace.Vector3();
    const _objPosition$1 = new THREE__namespace.Vector3();
    const _objScale$1 = new THREE__namespace.Vector3();
    new THREE__namespace.Quaternion();
    const _parentQuaternion = new THREE__namespace.Quaternion();
    const _parentQuaternionInv = new THREE__namespace.Quaternion();
    new THREE__namespace.Euler();
    const _rotationQuaternion = new THREE__namespace.Quaternion();
    const _worldPosition = new THREE__namespace.Vector3();
    const _worldQuaternion = new THREE__namespace.Quaternion();
    const _worldScale = new THREE__namespace.Vector3();
    const _worldRotation = new THREE__namespace.Euler();

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Object3D.constructor() Overload
    /////////////////////////////////////////////////////////////////////////////////////

    class Object3D extends THREE__namespace.Object3D {

        constructor() {
            super();

            const rotation = new THREE__namespace.Euler();
            const quaternion = new THREE__namespace.Quaternion();

            ///// ORIGINAL from: THREE.Object3D.constructor()
            // function onRotationChange() { quaternion.setFromEuler(rotation, false); }
            // function onQuaternionChange() { rotation.setFromQuaternion(quaternion, undefined, false); }
            ///// NEW
            function onRotationChange() { /* EMPTY, updates in updateMatrix() */ }
            function onQuaternionChange() { /* EMPTY, updates in updateMatrix() */ }
            /////

            rotation._onChange(onRotationChange);
            quaternion._onChange(onQuaternionChange);

            Object.defineProperties(this, {
                rotation: { configurable: true, enumerable: true, value: rotation },
                quaternion: { configurable: true, enumerable: true, value: quaternion },
            });

        } // end ctor

        //////////////////// Copy

        copy(source, recursive = true) {
            // Base three.js Object3D.copy()
            super.copy(source, recursive);

            // Override copy transform, apply new updateMAtrix()
            ObjectUtils.copyLocalTransform(source, this, false /* updateMatrix */);
            this.lookAtCamera = source.lookAtCamera;
            this.updateMatrix();

            return this;
        }

        //////////////////// Get World Quaternion

        /** Extracts World Quaternion without rotating to camera, good for Viewport Transform Group! :) */
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

        //////////////////// Custom Attach

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

        //////////////////// Update Matrix

        updateMatrix() {

            // Should look at camera?
            const camera = window.activeCamera;
            let lookAtCamera = this.lookAtCamera && camera && ! this.isScene;
            if (lookAtCamera && this.parent && this.parent.isObject3D) {
                this.traverseAncestors((parent) => { if (parent.lookAtCamera) lookAtCamera = false; });
            }

            // Look at Camera
            if (lookAtCamera) {

                // Gather Transform Data
                camera.matrixWorld.decompose(_camPosition, _camQuaternion, _camScale);
                this.matrixWorld.decompose(_worldPosition, _worldQuaternion, _worldScale);
                _rotationQuaternion.setFromEuler(this.rotation, false);

                // // Match Camera Plane
                // if (camera.isOrthographicCamera) {

                    // Apply Rotations
                    this.quaternion.copy(_camQuaternion);                           // Start with rotate to camera
                    this.quaternion.multiply(_rotationQuaternion);                  // Add in 'rotation' property

                // // Look Directly at Camera
                // } else if (camera.isPerspectiveCamera) {
                //
                //     // !!!!! OPTION 1: Look at Camera
                //     _lookUpVector.copy(camera.up).applyQuaternion(_camQuaternion);  // Rotate up vector by cam rotation
                //     _m1.lookAt(_camPosition, _worldPosition, _lookUpVector);        // Create look at matrix
                //     _lookQuaternion.setFromRotationMatrix(_m1);
                //
                //     // !!!!! OPTION 2: Only 'Y' Axis
                //     // _rotationDirection.set(0, 0, 0);
                //     // _rotationDirection.y = Math.atan2((_camPosition.x - _worldPosition.x), (_camPosition.z - _worldPosition.z));
                //     // _lookQuaternion.setFromEuler(_rotationDirection, false);
                //
                //     // Apply Rotations
                //     this.quaternion.copy(_lookQuaternion);                          // Start with rotate to camera
                //     this.quaternion.multiply(_rotationQuaternion);                  // Add in 'rotation' property
                //
                // }

                // Subtract parent rotation
                if (this.parent && this.parent.isObject3D) {
                    this.parent.getWorldQuaternion(_parentQuaternion, false);
                    _parentQuaternionInv.copy(_parentQuaternion).invert();
                    this.quaternion.multiply(_parentQuaternionInv);
                }

            // Use 'rotation' Property Only
            } else {
                this.quaternion.setFromEuler(this.rotation, false);
            }

            ///// ORIGINAL from: THREE.Object3D.updateMatrix()

            this.matrix.compose(this.position, this.quaternion, this.scale);
            this.matrixWorldNeedsUpdate = true;

            /////
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Entity3D
    /////////////////////////////////////////////////////////////////////////////////////

    class Entity3D extends Object3D {

        constructor(name = '') {
            super();

            // Prototype
            this.isEntity = true;
            this.isEntity3D = true;

            // Properties, Basic
            this.name = name;
            this.type = 'Entity3D';
            this.project = null;

            // Properties, More
            this.enabled = true;
            this.castShadow = true;                 // inherited from THREE.Object3D
            this.receiveShadow = true;              // inherited from THREE.Object3D
            this.lookAtCamera = false;              // implemented in ONE.Object3D.updateMatrix overload

            // Collections
            this.components = [];                   // Geometry, material, audio, light, etc.

            // Flags
            this.setFlag(ENTITY_FLAGS.LOCKED, false);

        } // end ctor

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Info
        ////////////////////

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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Components
        ////////////////////

        /** Adds component of 'type' using 'data' object */
        addComponent(type, data = {}, includeDependencies = true) {
            const ComponentClass = ComponentManager.registered(type);
            if (ComponentClass === undefined) return undefined;

            // Config
            const config = ComponentClass.config;

            // Create new component if 'multiple' allowed, or doesn't have component
            let component = this.getComponent(type);
            if (ComponentClass.config.multiple || component === undefined) {
                component = new ComponentClass();
                this.components.push(component);

            // Otherwise overwrite existing component of type
            } else {
                component.disable();
            }

            // Check for and add Dependent Components
            if (config.dependencies && includeDependencies) {
                const dependencies = config.dependencies;
                for (let i = 0, len = dependencies.length; i < len; i++) {
                    if (this.getComponent(dependencies[i]) === undefined) {
                        this.addComponent(dependencies[i], {}, false);
                    }
                }
            }

            // Initialize Component
            component.entity = this;
            ComponentManager.sanitizeData(data, config.schema);
            if (component.init) component.init(data);
            if (this.enabled) component.enable();

            // Return reference to newly added component
            return component;
        }

        /** Get component by type (string, required) and tag (string, optional - in case of multiple components with type) */
        getComponent(type, tag /* optional */) {
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

        /** Returns first component found with property === value */
        getComponentByProperty(property, value) {
            for (let i = 0, l = this.components.length; i < l; i++) {
                const component = this.components[i];
                if (component[property] === value) return component;
            }
            return undefined;
        }

        /** Returns all components that match all key, value pairs */
        getComponentsWithProperties(/* key, value, key, value, etc. */) {
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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Children
        ////////////////////

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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Copy / Clone
        ////////////////////

        cloneEntity(recursive = true) {
            return new this.constructor().copyEntity(this, recursive);
        }

        copyEntity(source, recursive = true) {
            // Remove Existing Children / Components
            this.destroy();

            // Backend THREE.Object3D.copy()
            super.copy(source, false);

            // Copy Properties, Basic
            this.name = source.name;

            // Copy Properties, More
            this.enabled = source.enabled;
            this.castShadow = source.castShadow;
            this.receiveShadow = source.receiveShadow;
            this.lookAtCamera = source.lookAtCamera;

            // Copy Flags
            for (let flag in ENTITY_FLAGS) {
                this.setFlag(ENTITY_FLAGS[flag], source.getFlag(ENTITY_FLAGS[flag]));
            }

            // Copy Components
            const components = source.components;
            for (let i = 0; i < components.length; i++) {
                const component = components[i];

                // Add Component Clone
                let clonedComponent = this.addComponent(component.type, component.toJSON(), false);

                // Copy Component Properties
                clonedComponent.tag = component.tag;
                if (component.enabled !== true) clonedComponent.disable();
            }

            // Copy Children
            if (recursive === true) {
                const entities = source.getEntities();
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];
                    this.add(entity.cloneEntity(true));
                }
            }

            return this;
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Destroy
        ////////////////////

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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   JSON
        ////////////////////

        fromJSON(json) {
            const data = json.object;

            ///// Entity3D Properties

            this.uuid = data.uuid;
            if (data.name !== undefined) this.name = data.name;

            if (data.enabled !== undefined) this.enabled = data.enabled;
            if (data.castShadow !== undefined) this.castShadow = data.castShadow;
            if (data.receiveShadow !== undefined) this.receiveShadow = data.receiveShadow;
            if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;

            ///// Object3D Properties

            if (data.position !== undefined) this.position.fromArray(data.position);
            if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
            if (data.scale !== undefined) this.scale.fromArray(data.scale);

            if (data.matrixAutoUpdate !== undefined) this.matrixAutoUpdate = data.matrixAutoUpdate;
            if (data.layers !== undefined) this.layers.mask = data.layers;

            if (data.visible !== undefined) this.visible = data.visible;
            if (data.frustumCulled !== undefined) this.frustumCulled = data.frustumCulled;
            if (data.renderOrder !== undefined) this.renderOrder = data.renderOrder;
            if (data.userData !== undefined) this.userData = data.userData;

            ///// Flags

            for (let key in json.object.flags) {
                this.setFlag(key, json.object.flags[key]);
            }

            ///// Components

            for (let i = 0; i < json.object.components.length; i++) {
                let componentData = json.object.components[i];

                // Add Component
                if (componentData && componentData.base && componentData.base.type) {
                    const component = this.addComponent(componentData.base.type, componentData, false);

                    // Properties
                    if (componentData.enabled === false) component.disable();
                    component.tag = componentData.base.tag;
                }
            }

            ///// Children

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

            // Flags
            for (let key in ENTITY_FLAGS) {
                json.object.flags[key] = this.getFlag(key);
            }

            ///// Components

            for (let i = 0; i < this.components.length; i++) {
                json.object.components.push(this.components[i].toJSON());
            }

            ///// Entity3D Properties

            json.object.enabled = this.enabled;
            json.object.castShadow = this.castShadow;
            json.object.receiveShadow = this.receiveShadow;
            json.object.lookAtCamera = this.lookAtCamera;

            ///// Object3D Properties

            json.object.position  = this.position.toArray();
            json.object.rotation = this.rotation.toArray();
            json.object.scale = this.scale.toArray();

            json.object.matrixAutoUpdate = this.matrixAutoUpdate;
            json.object.layers = this.layers.mask;

            if (this.visible === false) json.object.visible = false;
            if (this.frustumCulled === false) json.object.frustumCulled = false;
            if (this.renderOrder !== 0) json.object.renderOrder = this.renderOrder;
            if (JSON.stringify(this.userData) !== '{}') json.object.userData = this.userData;

            ///// Child Entities

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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Scene3D
    /////////////////////////////////////////////////////////////////////////////////////

    class Scene3D extends Entity3D {

        constructor(name = 'Start Scene') {
            super();

            // Prototype
            this.isScene = true;                // Generic type (Scene), and also for THREE compatibility
            this.isScene3D = true;

            // Properties, Basic
            this.name = name;
            this.type = 'Scene3D';

            // Properties, More (needed by THREE)
            this.background = null;
            this.environment = null;
            this.fog = null;
            this.overrideMaterial = null;
            this.autoUpdate = true;             // checked by the renderer

            // Shadow Plane (temp object)
            this.shadowPlane = new THREE__namespace.Mesh(
                new THREE__namespace.PlaneGeometry(100000, 100000),
                new THREE__namespace.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false })
            );
            this.shadowPlane.name = 'ShadowPlane';
            this.shadowPlane.userData.flagTemp = true;
            this.shadowPlane.rotation.x = - Math.PI / 2;
            this.shadowPlane.castShadow = false;
            this.shadowPlane.receiveShadow = true;
            this.shadowPlane.visible = false;
            this.add(this.shadowPlane);

        } // end ctor

        //////////////////// JSON

        fromJSON(json) {
            const data = json.object;

            // Scene Properties
            if (data.background !== undefined) {
                if (Number.isInteger(data.background)) {
                    this.background = new THREE__namespace.Color(data.background);
                } else {
                    this.background = AssetManager.getTexture(data.background);
                }
            }
            if (data.environment !== undefined) this.environment = AssetManager.getTexture(data.environment);
            if (data.fog !== undefined) {
                if (data.fog.type === 'Fog') {
                    this.fog = new THREE__namespace.Fog(data.fog.color, data.fog.near, data.fog.far);
                } else if (data.fog.type === 'FogExp2') {
                    this.fog = new THREE__namespace.FogExp2(data.fog.color, data.fog.density);
                }
            }

            // Entity3D Properties
            super.fromJSON(json);

            return this;
        }

        toJSON() {
            const json = super.toJSON();

            if (this.fog) json.object.fog = this.fog.toJSON();

            return json;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   World3D
    /////////////////////////////////////////////////////////////////////////////////////

    class World3D {

        constructor(name = 'World 1') {

            // Prototype
            this.isWorld = true;
            this.isWorld3D = true;

            // Properties, Basic
            this.name = name;
            this.type = 'World3D';
            this.uuid = crypto.randomUUID();

            // Properties, More
            this.order = 0;
            this.startScene = null;
            this.lastEditorScene = null;

            // Collections
            this.sceneNodes = {};

        } // end ctor

        //////////////////// Scenes

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

        //////////////////// JSON

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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  Entity Utility Functions
    //      combineEntityArrays         Adds entities from 'entityArrayToAdd' into 'intoEntityArray'
    //      commonEntity                Checks two arrays to see if they have any common entites
    //      compareArrayOfEntities      Checks if two entity arrays hold the same entities (i.e. are the same collections)
    //      containsEntity              Checks array to see if it has an entity (by entity.uuid)
    //      isImportant                 Checks if entity is important and should be protected
    //      parentEntity                Returns parent most entity that is not a Scene
    //      parentScene                 Returns parent scene of an entity
    //      removeEntityFromArray       Removes all instances of an entity (by uuid) from an array of entities
    //      uuidArray                   Converts entity array to UUID array
    //
    /////////////////////////////////////////////////////////////////////////////////////

    class EntityUtils {

        /** Adds entities from 'entityArrayToAdd' into 'intoEntityArray' */
        static combineEntityArrays(intoEntityArray, entityArrayToAdd) {
            for (let i = 0; i < entityArrayToAdd.length; i++) {
                let entity = entityArrayToAdd[i];
                if (EntityUtils.containsEntity(intoEntityArray, entity) === false) {
                    intoEntityArray.push(entity);
                }
            }
        }

        /** Checks two arrays to see if they have any common entites */
        static commonEntity(entityArrayOne, entityArrayTwo) {
            // if (entityArrayOne.isEntity) entityArrayOne = [ entityArrayOne ];
            // if (entityArrayTwo.isEntity) entityArrayTwo = [ entityArrayTwo ];
            for (let i = 0; i < entityArrayOne.length; i++) {
                if (EntityUtils.containsEntity(entityArrayTwo, entityArrayOne[i]) === true) return true;
            }
            for (let i = 0; i < entityArrayTwo.length; i++) {
                if (EntityUtils.containsEntity(entityArrayOne, entityArrayTwo[i]) === true) return true;
            }
            return false;
        }

        /** Checks if two entity arrays hold the same entities (i.e. are the same collections) */
        static compareArrayOfEntities(entityArrayOne, entityArrayTwo) {
            // if (entityArrayOne.isEntity) entityArrayOne = [ entityArrayOne ];
            // if (entityArrayTwo.isEntity) entityArrayTwo = [ entityArrayTwo ];
            for (let i = 0; i < entityArrayOne.length; i++) {
                if (EntityUtils.containsEntity(entityArrayTwo, entityArrayOne[i]) === false) return false;
            }
            for (let i = 0; i < entityArrayTwo.length; i++) {
                if (EntityUtils.containsEntity(entityArrayOne, entityArrayTwo[i]) === false) return false;
            }
            return true;
        }

        /** Checks array to see if it has an entity (by entity.uuid) */
        static containsEntity(arrayOfEntities, entity) {
            if (entity && entity.uuid && Array.isArray(arrayOfEntities)) {
                for (let i = 0; i < arrayOfEntities.length; i++) {
                    if (arrayOfEntities[i].uuid === entity.uuid) return true;
                }
            }
            return false;
        }

        /** Checks if entity is important and should be protected */
        static isImportant(entity) {
            let important = false;
            important = important || entity.parent === null;                // Avoid deleting cameras / scenes
            important = important || entity.isScene;                        // Avoid deleting scenes
            important = important || entity.userData.flagLocked;            // Avoid entities with 'LOCKED' flag
            return important;
        }

        /** Returns parent most entity that is not a Scene */
        static parentEntity(entity, immediateOnly = false) {
            while (entity && entity.parent && (entity.parent.isScene !== true)) {
                entity = entity.parent;
                if (immediateOnly && entity.isEntity) return entity;
            }
            return entity;
        }

        /** Returns parent scene of an entity */
        static parentScene(entity) {
            while (entity && entity.parent) {
                entity = entity.parent;
                if (entity.isScene) return entity;
            }
            return undefined;
        }

        /** Removes all instances of an entity (by uuid) from an array of entities */
        static removeEntityFromArray(entityArray, entity) {
            let length = entityArray.length;
            for (let i = 0; i < length; i++) {
                if (entityArray[i].uuid === entity.uuid) {
                    entityArray.splice(i, 1);
                    length = entityArray.length;
                }
            }
        }

        /** Converts entity array to UUID array */
        static uuidArray(entityArray) {
            let uuidArray = [];
            for (let i = 0; i < entityArray.length; i++) {
                uuidArray.push(entityArray[i].uuid);
            }
            return uuidArray;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Onsight Project
    /////////////////////////////////////////////////////////////////////////////////////

    class Project {

        constructor(name = 'My Project') {

            // Prototype
            this.isProject = true;

            // Members
            this.name = name;
            this.uuid = crypto.randomUUID();
            this.type = 'Project';

            // Collections
            this.scripts = {};
            this.scenes = {};
            this.worlds = {};

        } // end ctor

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Worlds
        ////////////////////

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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Scenes
        ////////////////////

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

            // Clear Entities
            let entities = scene.getEntities();
            for (let i = entities.length - 1; i >= 0; i--) {
                this.removeEntity(entities[i], true);
                entities[i].destroy();
            }

            // Remove from 'scenes'
            delete this.scenes[scene.uuid];
        }

        traverseScenes(callback) {
            for (let uuid in this.scenes) {
                let scene = this.scenes[uuid];
                scene.traverse(callback);
            }
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Entities
        ////////////////////

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

                // Put activeScene at front of sceneList
                const fromIndex = sceneList.indexOf(activeScene);
                const toIndex = 0;
                if (activeScene && fromIndex !== -1) {
                    arr.splice(fromIndex, 1);						// Remove activeScene from sceneList
                    arr.splice(toIndex, 0, activeScene);			// Place at front
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

            // parent.add(entity);
            ///// OR
            // parent.attach(entity);
            ///// OR
            parent.safeAttach(entity);

            // If 'before' was supplied, find index of that entity
            if (before) index = parent.children.indexOf(before);

            // If desired array index was supplied, move entity to that index
            if (index !== -1) {
                parent.children.splice(index, 0, entity);
                parent.children.pop();
            }
        }

        /** Removes entity from Project, does not call 'destroy()' on Entity!! */
        removeEntity(entity, forceDelete = false) {
            if (! entity) return;

            // Check for isScene, flags (BuiltIn, NoSelect, etc.)
            if (! forceDelete && EntityUtils.isImportant(entity)) return;

            // Remove entity from parent (i.e. out of Project)
            if (entity.parent) entity.parent.remove(entity);
        }

        //////////////////// Scripts

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

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Clear
        ////////////////////

        clear() {

            // Remove Scenes
            const sceneIds = Object.keys(this.scenes);
            for (let i = 0; i < sceneIds.length; i++) {
                let scene = this.scenes[sceneIds[i]];
                this.removeScene(scene);
            }

            // Reset Properties
            this.name = 'My Project';
            this.uuid = crypto.randomUUID();

        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   JSON
        ////////////////////

        fromJSON(json, loadAssets = true) {

            // Check proper JSON type
            const metaType = (json.metadata) ? json.metadata.type : 'Undefined';
            if (metaType !== 'Onsight') {
                console.error(`Project.fromJSON: Unknown project type ('${metaType}'), expected 'Onsight'`);
                return;
            }

            // Check project saved with version
            const metaVersion = json.metadata.version;
            if (metaVersion !== REVISION) {
                console.warn(`Project.fromJSON: Project saved in 'v${metaVersion}', attempting to load with 'v${REVISION}'`);
            }

            // Check object type
            if (! json.object || json.object.type !== this.type) {
                console.error(`Project.fromJSON: Save file corrupt, no 'Project' object found!`);
                return;
            }

            // Clear Project
            this.clear();

            // Load Assets into AssetManager
            if (loadAssets) AssetManager.fromJSON(json);

            // Properties
            this.name = json.object.name;
            this.uuid = json.object.uuid;

            // Scripts
            this.scripts = json.scripts;

            // Worlds
            for (let i = 0; i < json.worlds.length; i++) {
                switch (json.worlds[i].object.type) {
                    case 'World3D': this.addWorld(new World3D().fromJSON(json.worlds[i])); break;
                }
            }

            // Scenes
            for (let i = 0; i < json.scenes.length; i++) {
                switch (json.scenes[i].object.type) {
                    case 'Scene3D': this.addScene(new Scene3D().fromJSON(json.scenes[i], this)); break;
                }
            }

            return this;
        }

        toJSON() {

            ///// Assets

            const meta = {};

            const json = AssetManager.toJSON(meta);

            ///// Project Properties

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

            // Add Worlds
            for (const uuid in this.worlds) {
                const world = this.worlds[uuid];
                json.worlds.push(world.toJSON());
            }

            // Add Scenes
            for (const uuid in this.scenes) {
                const scene = this.scenes[uuid];
                json.scenes.push(scene.toJSON());
            }

            return json;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   App
    /////////////////////////////////////////////////////////////////////////////////////

    class App {

        //////////////////// Ctor

        constructor() {
            const self = this;

            // Private Members
            let player = this;
            let project = new Project();
            let renderer;
            let camera;
            let scene;
            let state = APP_STATES.STOPPED;

            // Accessors
            Object.defineProperty(self, 'scene', {
                get: function() { return scene; },
                set: function(value) { scene = value; }
            });

            // Public Memebrs
            this.width = 1;
            this.height = 1;

            this.wantsScreenshot = false;

            // Renderer
            renderer = new THREE__namespace.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(1); //window.devicePixelRatio;
            renderer.shadowMap.enabled = true;
            // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            // renderer.toneMapping = THREE.ReinhardToneMapping;
            // renderer.physicallyCorrectLights = false;

            // DOM
            this.dom = document.createElement('div');
            this.dom.appendChild(renderer.domElement);

            // Local Variables
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

            //////////////////// Load Project

            this.load = function(json, loadAssets = true) {

                // Load Project
                project.fromJSON(json, loadAssets);

                // Set Scene
                this.scene = project.getFirstScene();

                // !!!!! TEMP: Set Camera
                // this.setCamera(loader.parse(json.camera));
                this.setCamera(CameraUtils.createPerspective(500, 500, true));
                camera.position.x = 0;
                camera.position.y = 0;

                // * Add Event Listeners
                document.addEventListener('keydown', onKeyDown);
                document.addEventListener('keyup', onKeyUp);
                document.addEventListener('pointerdown', onPointerDown);
                document.addEventListener('pointerup', onPointerUp);
                document.addEventListener('pointermove', onPointerMove);

                // * Scripts
                let scriptFunctions = '';
                let scriptReturnObject = {};
                for (let eventKey in events) {
                    scriptFunctions += eventKey + ',';
                    scriptReturnObject[eventKey] = eventKey;
                }
                scriptFunctions = scriptFunctions.replace(/.$/, '');								// remove last comma
                let scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');		// remove all qoutes

                function loadScripts(object) {
                    const scripts = project.scripts[object.uuid];
                    if (scripts !== undefined && scripts.length > 0) {
                        for (let i = 0, l = scripts.length; i < l; i++) {
                            let script = scripts[i];

                            if (script.errors) {
                                console.warn(`Entity '${object.name}' has errors in script '${script.name}'. Script will not be loaded!`);

                            } else {
                                // Returns object that has script functions with proper 'this' bound, and access to globals
                                let body = `${script.source} \n return ${scriptReturnString};`;
                                let functions = (new Function(scriptGlobals, scriptFunctions, body).bind(object))(player, renderer, scene, camera);

                                // Add functions to event dispatch handler
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

                // * Call 'init()' functions
                dispatch(events.init, arguments);
            };

            //////////////////// Event Dispatcher

            function dispatch(array, event) {
                for (let i = 0, l = array.length; i < l; i++) {
                    array[i](event);
                }
            }

            //////////////////// Animate / Render

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

                    // Calls 'update()' functions
                    if (state === APP_STATES.PLAYING) {
                        dispatch(events.update, { time: timePassed, delta: delta });
                    }
                } catch (e) {
                    console.error((e.message || e), (e.stack || ''));
                }

                window.activeCamera = camera;
                renderer.render(scene, camera);

                // Screenshot
                if (self.wantsScreenshot === true) {
                    let filename = project.name + ' ' + new Date().toLocaleString() + '.png';
                    let strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
                    let imgData = renderer.domElement.toDataURL(strMime);
                    System.saveImage(imgData, filename);
                    self.wantsScreenshot = false;
                }

                prevTime = time;

                requestId = requestAnimationFrame(animate);
            }

            //////////////////// Game State (Play, Stop, etc.)

            /** Start game loop */
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

            /** Stop game loop */
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

            //////////////////// Events

            function onKeyDown(event) { dispatch(events.keydown, event); }
            function onKeyUp(event) { dispatch(events.keyup, event); }
            function onPointerDown(event) { dispatch(events.pointerdown, event); }
            function onPointerUp(event) { dispatch(events.pointerup, event); }
            function onPointerMove(event) { dispatch(events.pointermove, event); }

            //////////////////// Getters

            this.getRenderer = function() {
                return renderer;
            };

            this.appState = function() {
                return state;
            };

            //////////////////// Setters

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

            //////////////////// Game Helper Functions

            this.gameCoordinates = function(fromEvent) {
                // Get mouse coords
                const rect = this.dom.getBoundingClientRect();
                let eventX = fromEvent.clientX - rect.left;
                let eventY = fromEvent.clientY - rect.top;

                // Relative screen position (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
                let x =  ((eventX / rect.width ) * (rect.width * 2)) - rect.width;
                let y = -((eventY / rect.height) * (rect.height * 2)) + rect.height;

                let vec = new THREE__namespace.Vector3(x, y, 0);
                vec.unproject(camera);
                return vec;
            };

        } // end ctor

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Entity Pool
    /////////////////////////////////////////////////////////////////////////////////////

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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description ColorEye
    // @about       Color library with support for RGB, RYB, HSL color models and RYB hue shifting
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/stevinz/coloreye
    //
    //      See end of file for license details and acknowledgements
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  ColorEye
    //      Color library with support for RGB, RYB, HSL color models and RYB hue shifting
    //
    //  Initialization
    //      let color = new ColorEye();
    //      ...
    //      new ColorEye();                             // Defaults to white, 0xffffff
    //      new ColorEye(0xff0000);                     // Hexadecimal (0xff0000, i.e. 16711680)
    //
    //      new ColorEye(1.0, 0.0, 0.0);                // RGB Values (0.0 to 1.0)
    //
    //      new ColorEye(255,   0,   0, 'rgb');         // RGB Values (0 to 255)
    //      new ColorEye(255,   0,   0, 'ryb');         // RYB Values (0 to 255)
    //      new ColorEye(360, 1.0, 0.5, 'hsl');         // HSL Values (H: 0 to 360, SL: 0.0 to 1.0)
    //
    //      new ColorEye({ r: 1.0, g: 0.0, b: 0.0 });   // Object with RGB Properties (0.0 to 1.0)
    //      new ColorEye({ r: 1.0, y: 0.0, b: 0.0 });   // Object with RYB Properties (0.0 to 1.0)
    //      new ColorEye({ h: 1.0, s: 1.0, l: 0.5 });   // Object with HSL Properties (0.0 to 1.0)
    //
    //      new ColorEye([ 1.0, 0.0, 0.0 ], offset);    // RGB Array (0.0 to 1.0), optional array offset
    //
    //      new ColorEye('#ff0000');                    // Hex String (also 3 digits: #f00)
    //      new ColorEye('rgb(255, 0, 0)');             // CSS Color String
    //      new ColorEye('red');                        // X11 Color Name
    //
    //      new ColorEye(fromColorEye);                 // Copy from ColorEye Object
    //      new ColorEye(fromThreeColor);               // Copy from Three.js Color Object
    //
    //  Properties
    //      color.r                                     // 0.0 to 1.0
    //      color.g                                     // 0.0 to 1.0
    //      color.b                                     // 0.0 to 1.0
    //
    //  Static
    //      ColorEye.hexString(hexColor);               // Converts hex color (i.e. 16711680) into hex string, ex: '#ff0000'
    //      ColorEye.randomHex();                       // Returns number (i.e. 16711680) of a random color
    //
    //  Output
    //      color.cssString();                          // Returns string, ex: 'rgb(255, 0, 0)'
    //      color.hex();                                // Returns number, ex: 16711680 (equivalent to 0xff0000)
    //      color.hexString();                          // Returns string, ex: '#ff0000'
    //      color.rgbString();                          // Returns string, ex: '255, 0, 0'
    //
    //      color.getHSL(target);                       // Copies HSL values into target, values from 0.0 to 1.0
    //      color.getRGB(target);                       // Copies RGB values into target, values from 0.0 to 1.0
    //      color.getRYB(target);                       // Copies RYB values into target, values from 0.0 to 1.0
    //      color.toArray(array);                       // Copies RGB values into array, values from 0.0 to 1.0
    //
    //      color.red();                                // Returns red value of color, 0 to 255
    //      color.green();                              // Returns green value of color, 0 to 255
    //      color.blue();                               // Returns blue value of color, 0 to 255
    //
    //      color.redF();                               // Returns red value of color, 0.0 to 1.0
    //      color.greenF();                             // Returns green value of color, 0.0 to 1.0
    //      color.blueF();                              // Returns blue value of color, 0.0 to 1.0
    //
    //      color.hue();                                // Returns hue value of color, 0 to 360
    //      color.saturation();                         // Returns saturation value of color, 0 to 255
    //      color.lightness();                          // Returns lightness value of color, 0 to 255
    //
    //      color.hueF();                               // Returns hue value of color, 0.0 to 1.0
    //      color.hueRYB();                             // Returns RGB hue mapped to hue in the RYB, 0 to 360
    //
    /////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Color Eye
    /////////////////////////////////////////////////////////////////////////////////////

    /** Color library with support for RGB, RYB, HSL color models and RYB hue shifting */
    class ColorEye {

        //////////////////// Static

        static get NAMES() { return COLOR_KEYWORDS; }

        //////////////////// Ctor

        constructor(r = 0xffffff, g, b, type = '') {
            this.isColor = true;
            this.r = 1;                             // 0.0 to 1.0
            this.g = 1;                             // 0.0 to 1.0
            this.b = 1;                             // 0.0 to 1.0
            this.set(r, g, b, type);
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Assignment
        ////////////////////

        copy(colorObject) {
            return this.set(colorObject);
        }

        set(r = 0, g, b, type = '') {
            // No arguments passed
            if (arguments.length === 0) {
                return this.set(0);
            // No valid arguments passed
            } else if (r === undefined || r === null || Number.isNaN(r)) {
                if (g || b) console.warn(`ColorEye: Passed some valid arguments, however 'r' was ${r}`);
                // nothing to do
            // r is Object, Hexidecimal, or String
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
            // Three arguments were passed
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

        /** 0 to 255 */
        setRGB(r, g, b) {
            return this.setRGBF(r / 255, g / 255, b / 255);
        }

        /** 0.0 to 1.0 */
        setRGBF(r, g, b) {
            this.r = clamp(r, 0, 1);
            this.g = clamp(g, 0, 1);
            this.b = clamp(b, 0, 1);
            return this;
        }

        /** 0 to 255 */
        setRYB(r, y, b) {
            let hexColor = cubicInterpolation(clamp(r, 0, 255), clamp(y, 0, 255), clamp(b, 0, 255), 255, CUBE.RYB_TO_RGB);
            return this.setHex(hexColor);
        }

        /** 0 to 255 */
        setScalar(scalar) {
            return this.setRGB(scalar, scalar, scalar);
        }

        /* 0.0 to 1.0 */
        setScalarF(scalar) {
            return this.setRGBF(scalar, scalar, scalar);
        }

        setStyle(style) {
            // CSS Color: rgb() / rgba() / hsl() / hsla()
            let m;
            if (m = /^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(style)) {
                let color;
                const name = m[1];
                const components = m[2];
                switch (name) {
                    case 'rgb':
                    case 'rgba':
                        if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                            // rgb(255,0,0) rgba(255,0,0,0.5)
                            let r = Math.min(255, parseInt(color[1], 10));
                            let g = Math.min(255, parseInt(color[2], 10));
                            let b = Math.min(255, parseInt(color[3], 10));
                            return this.setRGB(r, g, b);
                        }
                        if ( color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                            // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
                            let r = (Math.min(100, parseInt(color[1], 10)) / 100);
                            let g = (Math.min(100, parseInt(color[2], 10)) / 100);
                            let b = (Math.min(100, parseInt(color[3], 10)) / 100);
                            return this.setRGBF(r, g, b);
                        }
                        break;
                    case 'hsl':
                    case 'hsla':
                        if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                            // hsl(120,50%,50%) hsla(120,50%,50%,0.5)
                            const h = parseFloat(color[1]);
                            const s = parseInt(color[2], 10) / 100;
                            const l = parseInt(color[3], 10) / 100;
                            return this.setHSL(h, s, l);
                        }
                        break;
                }
            // Hex Color, i.e. #FF0000
            } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
                const hex = m[1];
                const size = hex.length;
                // #FF0
                if (size === 3) {
                    let r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
                    let g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
                    let b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
                    return this.setRGB(r, g, b);
                // #FF0000
                } else if (size === 6) {
                    let r = parseInt(hex.charAt(0) + hex.charAt(1), 16);
                    let g = parseInt(hex.charAt(2) + hex.charAt(3), 16);
                    let b = parseInt(hex.charAt(4) + hex.charAt(5), 16);
                    return this.setRGB(r, g, b);
                }
            }
            // X11 Color Name
            if (style && style.length > 0) {
                return this.setColorName(style);
            }
            return this;
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Output
        ////////////////////

        /** Example output: 'rgb(255, 0, 0)' */
        cssString(alpha /* optional */) {
            return ('rgb(' + this.rgbString(alpha) + ')');
        }

        /** Returns decimal, i.e. 16711680 (equivalent to 0xff0000) */
        hex() {
            return ((this.red() << 16) + (this.green() << 8) + this.blue());
        }

        /** Example output: '#ff0000' */
        hexString(hexColor /* optional */){
            if (hexColor === undefined || typeof value !== 'number') hexColor = this.hex();
            return ColorEye.hexString(hexColor);
        }

        /** Example output: '#ff0000' */
        static hexString(hexColor = 0){
            return '#' + ('000000' + ((hexColor) >>> 0).toString(16)).slice(-6);
        }

        /** Returns decimal (hex) of a random color */
        static randomHex() {
            return _random.setRandom().hex();
        }

        /** Example output: '255, 0, 0' */
        rgbString(alpha) {
            let rgb = this.red() + ', ' + this.green() + ', ' + this.blue();
            let rgba = (alpha != undefined) ? rgb + ', ' + alpha : rgb;
            return rgba;
        }

        /** Export to JSON */
        toJSON() {
            return this.hex();
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Retrieving Data
        ////////////////////

        clone() {
            return new this.constructor(this.r, this.g, this.b);
        }

        /** Copies HSL values into optional target, or returns new Object, values range from 0.0 to 1.0 */
        getHSL(target) {
            if (target && isHSL(target)) {
                target.h = hueF(this.hex());
                target.s = saturation(this.hex());
                target.l = lightness(this.hex());
            } else {
                return { h: hueF(this.hex()), s: saturation(this.hex()), l: lightness(this.hex()) };
            }
        }

        /** Copies RGB values into optional target, or returns new Object, values range from 0.0 to 1.0 */
        getRGB(target) {
            if (target && isHSL(target)) {
                target.r = this.r;
                target.g = this.g;
                target.b = this.b;
            } else {
                return { r: this.r, g: this.g, b: this.b };
            }
        }

        /** Copies RYB values into optional target, or returns new Object, values range from 0.0 to 1.0 */
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

        /** Copies RGB values into optional array, or returns a new Array, values range from 0.0 to 1.0 */
        toArray(array = [], offset = 0) {
            array[offset] = this.r;
            array[offset + 1] = this.g;
            array[offset + 2] = this.b;
            return array;
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Spectrum Components
        ////////////////////

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

        /** Map a color's RGB hue to the closest hue in the RYB spectrum */
        hueRYB() {
            for (let i = 1; i < RYB_OFFSET.length; i++) {
                if (RYB_OFFSET[i] > this.hue()) return i - 2;
            }
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Color Functions
        ////////////////////

        /** Adds RGB values from color to this color */
        add(color) {
            if (! color.isColor) console.warn(`ColorEye: add() was not called with a 'Color' object`);
            return this.setRGBF(this.r + color.r, this.g + color.g, this.b + color.b);
        }

        /** Adds scalar value to this colors RGB values, range -255 to 255 */
        addScalar(scalar) {
            return this.setRGB(this.red() + scalar, this.green() + scalar, this.blue() + scalar);
        }

        /** Adds scalar value to this colors RGB values, range -1.0 to 1.0 */
        addScalarF(scalar) {
            return this.setRGBF(this.r + scalar, this.g + scalar, this.b + scalar);
        }

        /**
         * Lightens color by amount
         * @param {Number} [amount] Percentage to lighten (default = 0.5) towards 1.0, possible values are 0.0 to 1.0
         */
        brighten(amount = 0.5 /* percentage from 0 to 1 */ ) {
            let h = hue(this.hex());
            let s = saturation(this.hex());
            let l = lightness(this.hex());
            l = l + ((1.0 - l) * amount);
            this.setHSL(h, s, l);
            return this;
        }

        /**
         * Darkens color by amount
         * @name darken
         * @param {Number} [amount] Percentage to darken (default = 0.5), 0 = fully dark, 1 = no change, 2 = twice as bright
         */
        darken(amount = 0.5 /* percentage from 0 to 1 */ ) {
            let h = hue(this.hex());
            let s = saturation(this.hex());
            let l = lightness(this.hex()) * amount;
            return this.setHSL(h, s, l);
        }

        /** Converts color to grayscale */
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

        /** Mixes in 'color' by percent to this color */
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

        /** Multiplies RGB values from this color with scalar value, -Infinity to Infinity */
        multiplyScalar(scalar) {
            return this.setRGBF(this.r * scalar, this.g * scalar, this.b * scalar);
        }

        rgbComplementary() {
            return this.rgbRotateHue(180);
        }

        /** Rotates the hue of a color in the RGB spectrum by degrees */
        rgbRotateHue(degrees = 90) {
            let newHue = keepInRange(this.hue() + degrees);
            return this.setHSL(newHue, this.saturation(), this.lightness());
        }

        /** Adjusts the RGB values to fit in the RYB spectrum as best as possible */
        rybAdjust() {
            return this.setHSL(hue(matchSpectrum(this.hue(), SPECTRUM.RYB)), this.saturation(), this.lightness());
        }

        rybComplementary() {
            return this.rybRotateHue(180);
        }

        /** Rotates the hue of a color in the RYB spectrum by degrees */
        rybRotateHue(degrees = 90) {
            let newHue = keepInRange(this.hueRYB() + degrees);
            return this.setHSL(hue(matchSpectrum(newHue, SPECTRUM.RYB)), this.saturation(), this.lightness());
        }

        /** Subtract RGB values from color to this color */
        subtract(color) {
            if (! color.isColor) console.warn(`ColorEye: subtract() was not called with a 'Color' object`);
            return this.setRGBF(this.r - color.r, this.g - color.g, this.b - color.b);
        }

        /////////////////////////////////////////////////////////////////////////////////////
        /////   Comparison
        ////////////////////

        /** Returns true if the RGB values of 'color' are the same as those of this object. */
        equals(color) {
            if (! color.isColor) console.warn(`ColorEye: equals() was not called with a 'Color' object`);
            return (fuzzy(this.r, color.r) && fuzzy(this.g, color.g) && fuzzy(this.b, color.b));
        }

        /** Returns true if the RGB values of 'color' are the same as those of this object. */
        isEqual(color) {
            return this.equals(color);
        }

        /** Return true if lightness is < 60% for blue / purple / red, or else < 32% for all other colors */
        isDark() {
            const h = this.hue();
            const l = this.lightness();
            return ((l < 0.60 && (h >= 210 || h <= 27)) || (l <= 0.32));
        }

        /** Returns true if color is generally light-ish, false if dark-ish */
        isLight() {
            return (! this.isDark());
        }

    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Utility Functions
    /////////////////////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Return hue (0 to 360), saturation (0 to 1), and lightness (0 to 1)
    ////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Match to 'matchHue' into 'spectrum'
    ////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Cubic Interpolation
    ////////////////////

    const _interpolate = new ColorEye();

    /**
     * cubicInterpolation
     * @param {*} v1 Input number 1 (probably r of rgb, or r of ryb)
     * @param {*} v2 Input number 2 (probably g of rgb, or y of ryb)
     * @param {*} v3 Input number 3 (probably b of rgb, or b of ryb)
     * @param {*} scale The range of input values, should be either 1 (0 to 1) or 255 (0 to 255)
     * @param {*} table Table to use for cubic interpolation
     * @returns Hexidecimal that has 3 new values embedded
     */
    function cubicInterpolation(v1, v2, v3, scale = 255, table = CUBE.RYB_TO_RGB) {
        v1 = clamp(v1 / scale, 0, 1);
        v2 = clamp(v2 / scale, 0, 1);
        v3 = clamp(v3 / scale, 0, 1);

        // Cube Points
        // f0=000, f1=001, f2=010, f3=011, f4=100, f5=101, f6=110, f7=111
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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Color Data
    /////////////////////////////////////////////////////////////////////////////////////

    const CUBE = {
        RYB_TO_RGB: [
            [ 1.000, 1.000, 1.000 ],    // white
            [ 0.163, 0.373, 0.600 ],    // blue
            [ 1.000, 1.000, 0.000 ],    // yellow
            [ 1.000, 0.000, 0.000 ],    // red
            [ 0.000, 0.660, 0.200 ],    // green
            [ 0.500, 0.000, 0.500 ],    // purple
            [ 1.000, 0.500, 0.000 ],    // orange
            [ 0.000, 0.000, 0.000 ]     // black
        ],

        RGB_TO_RYB: [
            [ 1.000, 1.000, 1.000 ],    // black
            [ 0.000, 0.000, 1.000 ],    // blue
            [ 0.000, 1.000, 0.483 ],    // green
            [ 1.000, 0.000, 0.000 ],    // red
            [ 0.000, 0.053, 0.210 ],    // cyan
            [ 0.309, 0.000, 0.469 ],    // magenta
            [ 0.000, 1.000, 0.000 ],    // yellow
            [ 0.000, 0.000, 0.000 ]     // white
        ]
    };

    // Stop values for RYB color wheel
    const SPECTRUM = {
        RYB: [
            0xFF0000, 0xFF4900, 0xFF7400, 0xFF9200, 0xFFAA00, 0xFFBF00, 0xFFD300, 0xFFE800,
            0xFFFF00, 0xCCF600, 0x9FEE00, 0x67E300, 0x00CC00, 0x00AF64, 0x009999, 0x0B61A4,
            0x1240AB, 0x1B1BB3, 0x3914AF, 0x530FAD, 0x7109AA, 0xA600A6, 0xCD0074, 0xE40045,
            0xFF0000 /* <-- addded first value to end */
        ]
    };

    // Map of the RYB wheel to RGB wheel offset
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

    // X11 Color Names - http://www.w3.org/TR/css3-color/#svg-color
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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Acknowledgements
    /////////////////////////////////////////////////////////////////////////////////////
    //
    // Some portions of this code adapted from:
    //      Description:    Color Schemer
    //      Author:         Scott Kellum <@scottkellum> and Mason Wendell <@canarymason>
    //      License:        Distributed under the MIT License
    //      Source(s):      https://github.com/at-import/color-schemer/blob/master/stylesheets/color-schemer/_ryb.scss
    //
    //      Description:    three.js
    //      Author:         mrdoob and three.js authors
    //      License:        Distributed under the MIT License
    //      Source(s):      https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
    //
    //      Description:    RYB
    //      Author:         Ilya Kolbin
    //      License:        Distributed under the MIT License
    //      Source(s):      https://github.com/iskolbin/lryb/blob/master/ryb.lua
    //
    // Thanks to:
    //      Description:    RYB and RGB Color Space Conversion
    //      Author:         Jean-Olivier Irisson
    //      Source(s):      https://math.stackexchange.com/questions/305395/ryb-and-rgb-color-space-conversion
    //
    //      Description:    Paint Inspired Color Mixing and Compositing for Visualization
    //      Author:         Nathan Gossett & Baoquan Chen
    //      Source(s):      http://vis.computer.org/vis2004/DVD/infovis/papers/gossett.pdf
    //
    /////////////////////////////////////////////////////////////////////////////////////
    /////   License
    /////////////////////////////////////////////////////////////////////////////////////
    //
    // MIT License
    //
    // ColorEye
    //      Copyright (c) 2021-2022 Stephens Nunnally <@stevinz>
    //
    // Some Portions
    //      Copyright (c) 2011 Scott Kellum <@scottkellum> and Mason Wendell <@canarymason>
    //      Copyright (c) 2010-2022 mrdoob and three.js authors
    //      Copyright (c) 2018 Ilya Kolbin
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    class Vectors {

        /** Set x, y, z to positive numbers */
        static absolute(vec3) {
            vec3.x = Math.abs(vec3.x);
            vec3.y = Math.abs(vec3.y);
            vec3.z = Math.abs(vec3.z);
        }

        /** Check if Vector3 is equal to zero ({ x:0, y:0, z:0 }) */
        static noZero(vec3, min = 0.001) {
            if (Maths.fuzzyFloat(vec3.x, 0, min)) vec3.x = (vec3.x < 0) ? (min * -1) : min;
    		if (Maths.fuzzyFloat(vec3.y, 0, min)) vec3.y = (vec3.y < 0) ? (min * -1) : min;
    		if (Maths.fuzzyFloat(vec3.z, 0, min)) vec3.z = (vec3.z < 0) ? (min * -1) : min;
        }

        /** Logs a vector3 to the console */
        static printOut(vec3, name = '') {
            if (name !== '') name += ' - ';
            console.info(`${name}X: ${vec3.x}, Y: ${vec3.y}, Z: ${vec3.z}`);
        }

        /** Rounds vector3 values to 'decimalPlaces' */
        static round(vec3, decimalPlaces = 0) {
            const shift = Math.pow(10, decimalPlaces);
            vec3.x = Math.round(vec3.x * shift) / shift;
            vec3.y = Math.round(vec3.y * shift) / shift;
            vec3.z = Math.round(vec3.z * shift) / shift;
        }

        /** Makes sure Vector3 values are real numbers */
        static sanity(vec3) {
            if (isNaN(vec3.x)) vec3.x = 0;
            if (isNaN(vec3.y)) vec3.y = 0;
            if (isNaN(vec3.z)) vec3.z = 0;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    const _color = new THREE__namespace.Color();
    const _position = new THREE__namespace.Vector3();

    /////////////////////////////////////////////////////////////////////////////////////
    /////   SVGBuilder
    /////////////////////////////////////////////////////////////////////////////////////

    class SVGBuilder {

        static buildFromPaths(target, paths, onLoad, name = '') {

            let startZ = 0, zStep = 0.001;
            let fillNumber = 0;

            ///// Process Paths
            paths.forEach((path) => {
                let fillColor = path.userData.style.fill;
                let fillOpacity = path.userData.style.fillOpacity;
                if (! fillOpacity && fillOpacity !== 0) fillOpacity = 1;

                ///// Fills
                if (fillColor !== undefined && fillColor !== 'none') {
                    const shapes = SVGLoader_js.SVGLoader.createShapes(path);
                    shapes.forEach((shape) => {

                        let entityName = `Fill ${fillNumber}`;
                        if (name !== '') entityName = name + ' ' + entityName;

                        const entity = new Entity3D(entityName);
                        const depth = 0.256;
                        const scaleDown = 0.001; /* 1 unit === 1000 pixels */

                        // Scale Down Curves
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

                            // TODO: Scale down CatmullRomCurve3 points?
                        }

                        // // OPTION: Shape
                        // const geometry = new THREE.ShapeGeometry(shape);

                        // // OPTION: Extruded
                        const geometry = new THREE__namespace.ExtrudeGeometry(shape, {
                            depth: depth,
                            bevelEnabled: false,
                            bevelThickness: 0.25,
                            bevelSegments: 8,
                            curveSegments: 16,
                            steps: 4,
                        });

                        // Set Name
                        geometry.name = entityName;

                        // Adjust Depth
                        geometry.translate(0, 0, depth / -2);

                        // Center Geometry
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getCenter(_position);
                        geometry.center();
                        geometry.scale(1, -1, -1);
                        entity.position.copy(_position);

                        // Geometry Component
                        entity.addComponent('geometry', geometry);

                        // Material Component
    	                entity.addComponent('material', {
                            style: 'standard',
                            side: 'FrontSide', // 'DoubleSide',
                            color: _color.setStyle(fillColor).getHex(),
                            opacity: fillOpacity,
                        });

                        entity.position.z = startZ;
                        target.add(entity);

                        startZ += zStep;
                        fillNumber++;
                    });
                }

                // ///// TODO: SVG Strokes
                //
                // const strokeColor = path.userData.style.stroke;
                // const strokeOpacity = path.userData.style.strokeOpacity;
                // if (! strokeOpacity && strokeOpacity !== 0) strokeOpacity = 1;

                // if (drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
                //     for (let j = 0; j < path.subPaths.length; j++) {
                //         const geometry = SVGLoader.pointsToStroke(path.subPaths[j].getPoints(), path.userData.style);
                //         if (geometry) {

                //             const entity = new Entity3D(`Stroke ${strokeNumber}`);
                //             entity.addComponent('geometry', new THREE.ShapeGeometry(shape));
                //             entity.addComponent('material', {
                //                 style: 'standard',
                //                 side: 'DoubleSide',
                //                 // color: _color.setStyle(fillColor).convertSRGBToLinear().getHex(),
                //                 color: _color.setStyle(strokeColor).getHex(),
                //                 opacity: strokeOpacity,
                //             });

                //             // // Alternate (Edge Geometry)
                //             // const stokeMaterial = new THREE.LineBasicMaterial({ color: "#00A5E6" });
                //             // const lines = new THREE.LineSegments(new THREE.EdgesGeometry(meshGeometry), stokeMaterial);
                //             // target.add(lines);

                //             entity.position.z = startZ;
                //             target.add(entity);

                //             startZ += zStep;
                //             strokeNumber++;
                //         }
                //     }
                // }

            });

            // Center elements, Flip x, y axis for gpu space
            if (target.children && target.children.length > 0) {
                const center = new THREE__namespace.Vector3();
                ObjectUtils.computeCenter(target.children, center);
                for (let child of target.children) {
                    child.position.x -= center.x;
                    child.position.y -= center.y;
                }
            }

            // Call 'onLoad'
            if (onLoad && typeof onLoad === 'function') onLoad();

        }

        static fromFile(url, onLoad) {
            const svgGroup = new Entity3D();
            const loader = new SVGLoader_js.SVGLoader();
            loader.load(url, function(data) {
                SVGBuilder.buildFromPaths(svgGroup, data.paths, onLoad, Strings.nameFromUrl(url));
            });
            return svgGroup;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description CapsuleGeometry
    // @about       CapsuleGeometry as a new geometry primitive for Three.js
    // @author      maximequiblier <maximeq>
    // @license     MIT - Copyright (c) 2019 maximequiblier
    // @source      https://github.com/maximeq/three-js-capsule-geometry
    // @version     Aug 6, 2021
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   CapsuleGeometry
    /////////////////////////////////////////////////////////////////////////////////////

    class CapsuleGeometry extends THREE__namespace.BufferGeometry {

        constructor(radiusTop = 1, radiusBottom = 1, height = 2, radialSegments = 12, heightSegments = 1,
                    capsTopSegments = 5, capsBottomSegments = 5, thetaStart, thetaLength) {
            super();

            this.type = 'CapsuleGeometry';

            this.parameters = {
                radiusTop: radiusTop,               //
                radiusBottom: radiusBottom,         //
                height: height,                     //
                radialSegments: radialSegments,     //
                heightSegments: heightSegments,     //
                thetaStart: thetaStart,             //
                thetaLength: thetaLength,           //
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

            // Alpha is the angle such that Math.PI/2 - alpha is the cone part angle.
            let alpha = Math.acos((radiusBottom-radiusTop) / height);

            let vertexCount = calculateVertexCount();
            let indexCount = calculateIndexCount();

            // buffers
            let indices = new THREE__namespace.BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount), 1);
            let vertices = new THREE__namespace.BufferAttribute(new Float32Array(vertexCount * 3), 3);
            let normals = new THREE__namespace.BufferAttribute(new Float32Array(vertexCount * 3), 3);
            let uvs = new THREE__namespace.BufferAttribute(new Float32Array(vertexCount * 2), 2);

            // helper variables
            let index = 0;
            let indexOffset = 0;
            let indexArray = [];
            let halfHeight = height / 2;

            // generate geometry
            generateTorso();

            // build geometry
            this.setIndex(indices);
            this.setAttribute('position', vertices);
            this.setAttribute('normal', normals);
            this.setAttribute('uv', uvs);

            // helper functions

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
                let normal = new THREE__namespace.Vector3();
                let vertex = new THREE__namespace.Vector3();

                let cosAlpha = Math.cos(alpha);
                let sinAlpha = Math.sin(alpha);

                let cone_length =
                    new THREE__namespace.Vector2(radiusTop * sinAlpha, halfHeight + radiusTop * cosAlpha)
                        .sub(new THREE__namespace.Vector2(radiusBottom * sinAlpha, -halfHeight + radiusBottom * cosAlpha))
                        .length();

                // Total length for v texture coord
                let vl = radiusTop * alpha
                        + cone_length
                        + radiusBottom * ((Math.PI / 2) - alpha);

                // generate vertices, normals and uvs

                let v = 0;
                for (y = 0; y <= capsTopSegments; y++) {
                    let indexRow = [];
                    let a = (Math.PI / 2) - alpha * (y / capsTopSegments);
                    v += radiusTop * alpha / capsTopSegments;

                    let cosA = Math.cos(a);
                    let sinA = Math.sin(a);

                    // calculate the radius of the current row
                    let radius = cosA * radiusTop;

                    for (x = 0; x <= radialSegments; x++) {
                        let u = x / radialSegments;
                        let theta = u * thetaLength + thetaStart;
                        let sinTheta = Math.sin(theta);
                        let cosTheta = Math.cos(theta);

                        // vertex
                        vertex.x = radius * sinTheta;
                        vertex.y = halfHeight + sinA * radiusTop;
                        vertex.z = radius * cosTheta;
                        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

                        // normal
                        normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
                        normals.setXYZ(index, normal.x, normal.y, normal.z);

                        // uv
                        uvs.setXY(index, u, 1 - v/vl);

                        // save index of vertex in respective row
                        indexRow.push(index);

                        // increase index
                        index ++;
                    }

                    // now save vertices of the row in our index array
                    indexArray.push(indexRow);
                }

                let cone_height = height + cosAlpha * radiusTop - cosAlpha * radiusBottom;
                let slope = sinAlpha * (radiusBottom - radiusTop) / cone_height;
                for (y = 1; y <= heightSegments; y++) {
                    let indexRow = [];

                    v += cone_length / heightSegments;

                    // calculate the radius of the current row
                    let radius = sinAlpha * (y * (radiusBottom - radiusTop) / heightSegments + radiusTop);

                    for (x = 0; x <= radialSegments; x++) {
                        let u = x / radialSegments;
                        let theta = u * thetaLength + thetaStart;
                        let sinTheta = Math.sin(theta);
                        let cosTheta = Math.cos(theta);

                        // vertex
                        vertex.x = radius * sinTheta;
                        vertex.y = halfHeight + cosAlpha * radiusTop - y * cone_height / heightSegments;
                        vertex.z = radius * cosTheta;
                        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

                        // normal
                        normal.set(sinTheta, slope, cosTheta).normalize();
                        normals.setXYZ(index, normal.x, normal.y, normal.z);

                        // uv
                        uvs.setXY(index, u, 1 - v / vl);

                        // save index of vertex in respective row
                        indexRow.push(index);

                        // increase index
                        index ++;
                    }

                    // now save vertices of the row in our index array
                    indexArray.push(indexRow);
                }

                for (y = 1; y <= capsBottomSegments; y++) {
                    let indexRow = [];
                    let a = ((Math.PI / 2) - alpha) - (Math.PI - alpha) * (y / capsBottomSegments);
                    v += radiusBottom * alpha / capsBottomSegments;
                    let cosA = Math.cos(a);
                    let sinA = Math.sin(a);

                    // calculate the radius of the current row
                    let radius = cosA * radiusBottom;

                    for (x = 0; x <= radialSegments; x++) {
                        let u = x / radialSegments;
                        let theta = u * thetaLength + thetaStart;
                        let sinTheta = Math.sin(theta);
                        let cosTheta = Math.cos(theta);

                        // vertex
                        vertex.x = radius * sinTheta;
                        vertex.y = -halfHeight + sinA * radiusBottom;                    vertex.z = radius * cosTheta;
                        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

                        // normal
                        normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
                        normals.setXYZ(index, normal.x, normal.y, normal.z);

                        // uv
                        uvs.setXY(index, u, 1 - v / vl);

                        // save index of vertex in respective row
                        indexRow.push(index);

                        // increase index
                        index++;
                    }

                    // now save vertices of the row in our index array
                    indexArray.push( indexRow );
                }

                // generate indices
                for (x = 0; x < radialSegments; x++) {
                    for (y = 0; y < capsTopSegments + heightSegments + capsBottomSegments; y++) {

                        // we use the index array to access the correct indices
                        let i1 = indexArray[y][x];
                        let i2 = indexArray[y + 1][x];
                        let i3 = indexArray[y + 1][x + 1];
                        let i4 = indexArray[y][x + 1];

                        // face one
                        indices.setX(indexOffset, i1); indexOffset++;
                        indices.setX(indexOffset, i2); indexOffset++;
                        indices.setX(indexOffset, i4); indexOffset++;

                        // face two
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

            const sphereCenterTop = new THREE__namespace.Vector3(c0.x, c0.y, c0.z);
            const sphereCenterBottom = new THREE__namespace.Vector3(c1.x, c1.y, c1.z);

            const radiusTop = r0;
            const radiusBottom = r1;
            let height = sphereCenterTop.distanceTo(sphereCenterBottom);

            // If the big sphere contains the small one, return a SphereGeometry
            if (height < Math.abs(r0 - r1)){
                let g = new THREE__namespace.SphereGeometry(r1, radialSegments, capsBottomSegments, thetaStart, thetaLength);
                g.translate(r1.x, r1.y, r1.z);
                return g;
            }

            // useful values
            const alpha = Math.acos((radiusBottom - radiusTop) / height);
            const cosAlpha = Math.cos(alpha);

            // compute rotation matrix
            const rotationMatrix = new THREE__namespace.Matrix4();
            const quaternion = new THREE__namespace.Quaternion();
            const capsuleModelUnitVector = new THREE__namespace.Vector3(0, 1, 0);
            const capsuleUnitVector = new THREE__namespace.Vector3();
            capsuleUnitVector.subVectors(sphereCenterTop, sphereCenterBottom);
            capsuleUnitVector.normalize();
            quaternion.setFromUnitVectors(capsuleModelUnitVector, capsuleUnitVector);
            rotationMatrix.makeRotationFromQuaternion(quaternion);

            // compute translation matrix from center point
            const translationMatrix = new THREE__namespace.Matrix4();
            const cylVec = new THREE__namespace.Vector3();
            cylVec.subVectors(sphereCenterTop, sphereCenterBottom);
            cylVec.normalize();
            let cylTopPoint = new THREE__namespace.Vector3();
            cylTopPoint = sphereCenterTop;
            cylTopPoint.addScaledVector(cylVec, cosAlpha * radiusTop);
            let cylBottomPoint = new THREE__namespace.Vector3();
            cylBottomPoint = sphereCenterBottom;
            cylBottomPoint.addScaledVector(cylVec, cosAlpha * radiusBottom);

            // computing lerp for color
            const dir = new THREE__namespace.Vector3();
            dir.subVectors(cylBottomPoint, cylTopPoint);
            dir.normalize();

            const middlePoint = new THREE__namespace.Vector3();
            middlePoint.lerpVectors(cylBottomPoint, cylTopPoint, 0.5);
            translationMatrix.makeTranslation(middlePoint.x, middlePoint.y, middlePoint.z);

            // Instanciate a CylinderGeometry from three.js
            let g = new CapsuleGeometry(radiusBottom, radiusTop, height, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength);

            // applying transformations
            g.applyMatrix(rotationMatrix);
            g.applyMatrix(translationMatrix);

            return g;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description CylinderGeometry
    // @about       CylinderGeometry
    // @license     MIT - Copyright (c) 2010-2022 mrdoob and three.js authors
    // @source      https://github.com/mrdoob/three.js/blob/master/src/geometries/CylinderGeometry.js
    // @version     Jun 24, 2021
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    class CylinderGeometry extends THREE__namespace.BufferGeometry {

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

            // buffers
            const indices = [];
            const vertices = [];
            const normals = [];
            const uvs = [];

            // helper variables
            let index = 0;
            const indexArray = [];
            const halfHeight = height / 2;
            let groupStart = 0;

            // generate geometry
            generateTorso();

            if (! openEnded) {
                if (radiusTop > 0) generateCap(true);
                if (radiusBottom > 0) generateCap(false);
            }

            // build geometry
            this.setIndex(indices);
            this.setAttribute('position', new THREE__namespace.Float32BufferAttribute(vertices, 3));
            this.setAttribute('normal', new THREE__namespace.Float32BufferAttribute(normals, 3));
            this.setAttribute('uv', new THREE__namespace.Float32BufferAttribute(uvs, 2));

            function generateTorso() {
                const normal = new THREE__namespace.Vector3();
                const vertex = new THREE__namespace.Vector3();

                let groupCount = 0;

                // this will be used to calculate the normal
                const slope = (radiusBottom - radiusTop) / height;

                // generate vertices, normals and uvs
                for (let y = 0; y <= heightSegments; y++) {
                    const indexRow = [];
                    const v = y / heightSegments;

                    // calculate the radius of the current row
                    const radius = v * (radiusBottom - radiusTop) + radiusTop;

                    for (let x = 0; x <= radialSegments; x++) {
                        const u = x / radialSegments;

                        const theta = u * thetaLength + thetaStart;

                        const sinTheta = Math.sin(theta);
                        const cosTheta = Math.cos(theta);

                        // vertex
                        vertex.x = radius * sinTheta;
                        vertex.y = -v * height + halfHeight;
                        vertex.z = radius * cosTheta;
                        vertices.push(vertex.x, vertex.y, vertex.z);

                        // normal
                        normal.set(sinTheta, slope, cosTheta).normalize();
                        normals.push(normal.x, normal.y, normal.z);

                        // uv
                        uvs.push(u, 1 - v);

                        // save index of vertex in respective row
                        indexRow.push(index++);
                    }

                    // now save vertices of the row in our index array
                    indexArray.push(indexRow);
                }

                // generate indices
                for (let x = 0; x < radialSegments; x++) {
                    for (let y = 0; y < heightSegments; y++) {
                        // we use the index array to access the correct indices
                        const a = indexArray[y    ][x    ];
                        const b = indexArray[y + 1][x    ];
                        const c = indexArray[y + 1][x + 1];
                        const d = indexArray[y    ][x + 1];

                        const vecA = new THREE__namespace.Vector3(vertices[(a * 3) + 0], vertices[(a * 3) + 1], vertices[(a * 3) + 2]);
                        const vecB = new THREE__namespace.Vector3(vertices[(b * 3) + 0], vertices[(b * 3) + 1], vertices[(b * 3) + 2]);
                        const vecC = new THREE__namespace.Vector3(vertices[(c * 3) + 0], vertices[(c * 3) + 1], vertices[(c * 3) + 2]);
                        const vecD = new THREE__namespace.Vector3(vertices[(d * 3) + 0], vertices[(d * 3) + 1], vertices[(d * 3) + 2]);
                        const triangleABD = new THREE__namespace.Triangle(vecA, vecB, vecD);
                        const triangleBCD = new THREE__namespace.Triangle(vecB, vecC, vecD);

                        // faces
                        if (triangleABD.getArea() > 0.0001) { indices.push(a, b, d); groupCount += 3; }
                        if (triangleBCD.getArea() > 0.0001) { indices.push(b, c, d); groupCount += 3; }
                    }
                }

                // add a group to the geometry. this will ensure multi material support
                scope.addGroup(groupStart, groupCount, 0);

                // calculate new start value for groups
                groupStart += groupCount;
            }

            function generateCap(top) {
                // save the index of the first center vertex
                const centerIndexStart = index;

                const uv = new THREE__namespace.Vector2();
                const vertex = new THREE__namespace.Vector3();

                let groupCount = 0;

                const radius = (top === true) ? radiusTop : radiusBottom;
                const sign = (top === true) ? 1 : -1;

                // first we generate the center vertex data of the cap.
                // because the geometry needs one set of uvs per face,
                // we must generate a center vertex per face/segment
                for (let x = 1; x <= radialSegments; x++) {
                    // vertex
                    vertices.push(0, halfHeight * sign, 0);

                    // normal
                    normals.push(0, sign, 0);

                    // uv
                    uvs.push(0.5, 0.5);

                    // increase index
                    index++;
                }

                // save the index of the last center vertex
                const centerIndexEnd = index;

                // now we generate the surrounding vertices, normals and uvs
                for ( let x = 0; x <= radialSegments; x ++ ) {
                    const u = x / radialSegments;
                    const theta = u * thetaLength + thetaStart;
                    const cosTheta = Math.cos(theta);
                    const sinTheta = Math.sin(theta);

                    // vertex
                    vertex.x = radius * sinTheta;
                    vertex.y = halfHeight * sign;
                    vertex.z = radius * cosTheta;
                    vertices.push(vertex.x, vertex.y, vertex.z);

                    // normal
                    normals.push(0, sign, 0);

                    // uv
                    uv.x = (cosTheta * 0.5) + 0.5;
                    uv.y = (sinTheta * 0.5 * sign) + 0.5;
                    uvs.push(uv.x, uv.y);

                    // increase index
                    index++;
                }

                // generate indices
                for (let x = 0; x < radialSegments; x++) {
                    const c = centerIndexStart + x;
                    const i = centerIndexEnd + x;

                    if (top === true) {
                        // face top
                        indices.push(i, i + 1, c);
                    } else {
                        // face bottom
                        indices.push(i + 1, i, c);
                    }

                    groupCount += 3;
                }

                // add a group to the geometry. this will ensure multi material support
                scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

                // calculate new start value for groups
                groupStart += groupCount;
            }
        }

        static fromJSON(data) {
            return new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   PrismGeometry
    /////////////////////////////////////////////////////////////////////////////////////

    /** Extrudes polygon 'vertices' into 3D by 'height' amount */
    class PrismGeometry extends THREE__namespace.ExtrudeGeometry {

        constructor(vertices, height) {

            let shape = new THREE__namespace.Shape();

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

        } // end ctor

        clone() {
            return new this.constructor(this.vertices, this.height).copy(this);
        }
    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Functions

    function setWireframeMaterialDefaults(material) {
        material.transparent = true;
        // material.vertexColors = false;
        // material.dashed = false;

        material.resolution = new THREE__namespace.Vector2(1024, 1024);

        material.depthTest = true;
        material.depthWrite = false;
        material.polygonOffset = true;
        material.polygonOffsetFactor = 1; // positive value pushes polygon further away

        material.side = THREE__namespace.DoubleSide;

        material.alphaToCoverage = true;
        //material.depthFunc = THREE.AlwaysDepth;
    }

    ///// Local Variables

    const _objQuaternion = new THREE__namespace.Quaternion();
    const _objScale = new THREE__namespace.Vector3();
    const _objPosition = new THREE__namespace.Vector3();
    const _tempScale = new THREE__namespace.Vector3();
    const _tempSize = new THREE__namespace.Vector3();
    const _box = new THREE__namespace.Box3();

    const _indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Simple Lines
    /////////////////////////////////////////////////////////////////////////////////////

    /** Basic single pixel width line between two points */
    class BasicLine extends THREE__namespace.LineSegments {
        constructor(x1, y1, z1, x2, y2, z2, boxColor = 0xffffff) {
            // Geometry
            const vertices = [
                x1, y1, z1,
                x2, y2, z2,
            ];
            const indices = [0, 1];
            const lineGeometry = new THREE__namespace.BufferGeometry();
            lineGeometry.setIndex(indices);
            lineGeometry.setAttribute('position', new THREE__namespace.Float32BufferAttribute(vertices, 3));   // '3' is stride

            // Material
            const lineMaterial = new THREE__namespace.LineBasicMaterial({ color: boxColor });
            setWireframeMaterialDefaults(lineMaterial);
            lineMaterial.wireframe = true;

            // Build Line
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

    /** Variable width line object between two points */
    class FatLine extends Line2_js.Line2 {
        constructor(x1, y1, z1, x2, y2, z2, lineWidth = 1, boxColor = 0xffffff) {
            const lineGeometry = new LineGeometry_js.LineGeometry();

            const lineMaterial = new LineMaterial_js.LineMaterial({
                color: boxColor,
                linewidth: lineWidth,       // in world units with size attenuation, pixels otherwise
            });
            setWireframeMaterialDefaults(lineMaterial);

            const positions = [x1, y1, z1, x2, y2, z2];
            lineGeometry.setPositions(positions);

            super(lineGeometry, lineMaterial);

            this.computeLineDistances();
            this.scale.set(1, 1, 1);

            this.point1 = new THREE__namespace.Vector3(x1, y1, z1);
            this.point2 = new THREE__namespace.Vector3(x2, y2, z2);
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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Wireframe Boxes (cubes with no cross lines)
    /////////////////////////////////////////////////////////////////////////////////////

    /** Single pixel width wireframe cube (used for 3d bounding box when calculating rubber band selection */
    class BasicWireBox extends THREE__namespace.LineSegments {
        constructor(object, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
            // Create new geomtry from lines
            const lineGeometry = new THREE__namespace.WireframeGeometry();

            // Material
            const lineMaterial = new THREE__namespace.LineBasicMaterial({
                color: boxColor,
                opacity: opacity,
            });
            setWireframeMaterialDefaults(lineMaterial);

            // Build line box
            super(lineGeometry, lineMaterial);

            // Members
            this._positions = new Float32Array(8 * 3);      // Box data
            this.points = [];                               // To store points
            for (let i = 0; i < 8; i++) this.points.push(new THREE__namespace.Vector3());

            // Apply geometry
            if (object) this.updateFromObject(object, matchTransform);

            // Clone function
            this.clone = function() {
                return new this.constructor(object, boxColor, opacity, matchTransform).copy(this, true);
            };
        }

        disableDepthTest() {
            this.material.depthTest = false;
        }

        updateFromObject(object, matchTransform) {
            let updateObject = object.clone();

            // Get object transform info, clear info to compute box
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

            // Set points from Box3 bounding box
            _box.setFromObject(updateObject);
            const min = _box.min;
            const max = _box.max;
            Vectors.sanity(_box.min);
            Vectors.sanity(_box.max);

            // Assign points
            let array = this._positions;
            array[ 0] = max.x; array[ 1] = max.y; array[ 2] = max.z;
            array[ 3] = min.x; array[ 4] = max.y; array[ 5] = max.z;
            array[ 6] = min.x; array[ 7] = min.y; array[ 8] = max.z;
            array[ 9] = max.x; array[10] = min.y; array[11] = max.z;
            array[12] = max.x; array[13] = max.y; array[14] = min.z;
            array[15] = min.x; array[16] = max.y; array[17] = min.z;
            array[18] = min.x; array[19] = min.y; array[20] = min.z;
            array[21] = max.x; array[22] = min.y; array[23] = min.z;

            // * Copy lines from indices
            const positions = [];
            for (let i = _indices.length - 1; i > 0; i -= 2) {
                const index1 = (_indices[i - 0]) * 3;
                const index2 = (_indices[i - 1]) * 3;
                positions.push(array[index1 + 0], array[index1 + 1], array[index1 + 2]);
                positions.push(array[index2 + 0], array[index2 + 1], array[index2 + 2]);
            }
            this.geometry.setAttribute('position', new THREE__namespace.Float32BufferAttribute(positions, 3));

            // Match box transform to object
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
            //      Point 0: Right  Top     Front (z positive)
            //      Point 1: Left   Top     Front
            //      Point 2: Left   Down    Front
            //      Point 3: Right  Down    Front
            //      Point 4: Right  Top     Back (z negative)
            //      Point 5: Left   Top     Back
            //      Point 6: Left   Down    Back
            //      Point 7: Right  Down    Back
            const points = this.getLocalPoints();
            targetBox3 = targetBox3 ?? new THREE__namespace.Box3();
            targetBox3.min.x = points[6].x;
            targetBox3.min.y = points[6].y;
            targetBox3.min.z = points[6].z;
            targetBox3.max.x = points[0].x;
            targetBox3.max.y = points[0].y;
            targetBox3.max.z = points[0].z;
        }
    }

    /** Variable line width wireframe cube */
    class FatWireBox extends Line2_js.Line2 {
        constructor(object, lineWidth = 1, boxColor = 0xffffff, opacity = 1.0, matchTransform = false) {
            // Create new geomtry from lines
            const lineGeometry = new LineSegmentsGeometry_js.LineSegmentsGeometry();

            // Material
            const lineMaterial = new LineMaterial_js.LineMaterial({
                color: boxColor,
                linewidth: lineWidth,       // in world units with size attenuation, pixels otherwise
                opacity: opacity,
            });
            setWireframeMaterialDefaults(lineMaterial);
            lineMaterial.depthTest = false;

            // Build line box
            super(lineGeometry, lineMaterial);

            // Members
            this._positions = new Float32Array(8 * 3);      // Box data
            this.points = [];                               // To store points
            for (let i = 0; i <  8; i++) this.points.push(new THREE__namespace.Vector3());

            // Apply geometry
            if (object) this.updateFromObject(object, matchTransform);

            // Clone function
            this.clone = function() {
                return new this.constructor(object, lineWidth, boxColor, opacity, matchTransform).copy(this, true);
            };
        }

        disableDepthTest() {
            this.material.depthTest = false;
        }

        updateFromObject(object, matchTransform) {
            let updateObject = object.clone();

            // Get object transform info, clear info to compute box
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

            // Set points from Box3 bounding box
            _box.setFromObject(updateObject);
            const min = _box.min;
            const max = _box.max;
            Vectors.sanity(_box.min);
            Vectors.sanity(_box.max);

            // Assign points
            let array = this._positions;
            array[ 0] = max.x; array[ 1] = max.y; array[ 2] = max.z;
            array[ 3] = min.x; array[ 4] = max.y; array[ 5] = max.z;
            array[ 6] = min.x; array[ 7] = min.y; array[ 8] = max.z;
            array[ 9] = max.x; array[10] = min.y; array[11] = max.z;
            array[12] = max.x; array[13] = max.y; array[14] = min.z;
            array[15] = min.x; array[16] = max.y; array[17] = min.z;
            array[18] = min.x; array[19] = min.y; array[20] = min.z;
            array[21] = max.x; array[22] = min.y; array[23] = min.z;

            // * Copy lines from indices
            const positions = [];
            for (let i = _indices.length - 1; i > 0; i -= 2) {
                const index1 = (_indices[i - 0]) * 3;
                const index2 = (_indices[i - 1]) * 3;
                positions.push(array[index1 + 0], array[index1 + 1], array[index1 + 2]);
                positions.push(array[index2 + 0], array[index2 + 1], array[index2 + 2]);
            }
            this.geometry.setPositions(positions);

            // Match box transform to object
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
            //		Point 0: Right	Top		Front (z positive)
            //		Point 1: Left	Top		Front
            //		Point 2: Left	Down	Front
            //		Point 3: Right	Down	Front
            //		Point 4: Right	Top		Back (z negative)
            //		Point 5: Left	Top		Back
            //		Point 6: Left	Down	Back
            //		Point 7: Right	Down	Back
            const points = this.getLocalPoints();
            targetBox3 = targetBox3 ?? new THREE__namespace.Box3();
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
            target.x = (points[0].x - points[6].x) * Math.abs(_tempScale.x);    // Width
            target.y = (points[0].y - points[6].y) * Math.abs(_tempScale.y);    // Height
            target.z = (points[0].z - points[6].z) * Math.abs(_tempScale.z);    // Depth
            // console.info(`Width: ${target.x}, Height: ${target.y}, Depth: ${target.z}`);
        }

        getMaxSize() {
            this.getSize(_tempSize);
            return Math.max(Math.max(_tempSize.x, _tempSize.y), _tempSize.z);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Wireframes - clone of object geometry
    /////////////////////////////////////////////////////////////////////////////////////

    /** Basic (single pixel) wireframe */
    class BasicWireframe extends THREE__namespace.LineSegments {
        constructor(object, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
            // Using standard wireframe function
            const wireframeGeometry = new THREE__namespace.WireframeGeometry(object.geometry);
            const lineMaterial = new THREE__namespace.LineBasicMaterial({
                color: wireframeColor,
                opacity: opacity,
            });
            setWireframeMaterialDefaults(lineMaterial);

            // Mesh
            super(wireframeGeometry, lineMaterial);
            if (copyObjectTransform) {
                this.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
                this.scale.set(object.scale.x, object.scale.y, object.scale.z);
                this.position.set(object.position.x, object.position.y, object.position.z);
            }

            // Clone function
            this.clone = function() {
                return new this.constructor(object, wireframeColor, opacity, copyObjectTransform).copy(this, true);
            };
        }
    }

    /** Variable line width wireframe */
    class FatWireframe extends Wireframe_js.Wireframe {
        constructor(object, lineWidth, wireframeColor, opacity = 1.0, copyObjectTransform = false) {
            // Geometry - Using fat line functions
            const wireframeGeometry = new WireframeGeometry2_js.WireframeGeometry2(object.geometry);
            const lineMaterial = new LineMaterial_js.LineMaterial({
                color: wireframeColor,
                linewidth: lineWidth,           // in world units with size attenuation, pixels otherwise
                resolution: new THREE__namespace.Vector2(500, 500),
                opacity: opacity,
            });
            setWireframeMaterialDefaults(lineMaterial);
            lineMaterial.depthTest = false;

            // Mesh
            super(wireframeGeometry, lineMaterial);
            if (copyObjectTransform) {
                this.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
                this.scale.set(object.scale.x, object.scale.y, object.scale.z);
                this.position.set(object.position.x, object.position.y, object.position.z);
            }

            // Clone function
            this.clone = function() {
                return new this.constructor(object, lineWidth, wireframeColor, opacity, copyObjectTransform).copy(this, true);
            };
        }
    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   HelperObject
    /////////////////////////////////////////////////////////////////////////////////////

    /** Returns proper helper object for given Object3D */
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
                // no helper for this object type
                return undefined;
            }

            const picker = new THREE.Mesh(geometry, material);
            picker.name = 'picker';
            picker.userData.object = object;
            helper.add(picker);

            return helper;
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Constants

    const SCALE = 500;

    /////////////////////////////////////////////////////////////////////////////////////
    /////   SkyObject
    /////////////////////////////////////////////////////////////////////////////////////

    class SkyObject extends THREE__namespace.Mesh {

        constructor() {
            const shader = SkyObject.SkyShader;

            super(new THREE__namespace.SphereGeometry(1), new THREE__namespace.ShaderMaterial({
                name:           'SkyShader',
                fragmentShader: shader.fragmentShader,
                vertexShader:   shader.vertexShader,
                uniforms:       THREE__namespace.UniformsUtils.clone(shader.uniforms),
                side:           THREE__namespace.BackSide,
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

    //////////////////// Shader

    SkyObject.SkyShader = {

        uniforms: {
            //'uSky':   { value: new THREE.Color(0.32, 0.51, 0.74) },   // sky blue
            'uSky':     { value: new THREE__namespace.Color(0.00, 0.85, 0.80) },   // icon
            //'uHorizon': { value: new THREE.Color(1.00, 1.00, 1.00) }, // white
            'uHorizon': { value: new THREE__namespace.Color(1.00, 0.75, 0.50) },   // bright yellow
            'uGround':  { value: new THREE__namespace.Color(0.90, 0.70, 0.50) },   // tan 230, 179, 128
            'uScale':   { value: SCALE },
        },

        vertexShader: /* glsl */`
        varying vec3 	vWorldPosition;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

        fragmentShader: /* glsl */`
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  DepthShader
    //      Depth texture visualization shader
    //
    //  Additional Source(s)
    //      MIT     https://github.com/mrdoob/three.js/blob/master/examples/webgl_depth_texture.html
    //
    /////////////////////////////////////////////////////////////////////////////////////

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

        vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

        //
        // Alternatively, look into depth packing functions:
        //      https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/packing.glsl.js
        //
        // Starting Camera Properties
        //      Perspective:    Near:  0.01, Far: 1000
        //      Orthographic:   Near: -1000, Far: 1000
        //
        fragmentShader: /* glsl */`
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Depth Pass
    /////////////////////////////////////////////////////////////////////////////////////

    /** Depth texture visualization render pass */
    class DepthPass extends Pass_js.Pass {

        constructor(camera) {
            super();
            this.camera = camera;
            this.needsSwap = false;

            this.copyPass = new ShaderPass_js.ShaderPass(CopyShader_js.CopyShader);
            this.copyPass.clear = true;
            this.copyPass.clearDepth = false;
            this.copyPass.renderToScreen = false;
            this.copyPass.material.depthWrite = false;

            this.depthMaterial = new THREE__namespace.ShaderMaterial(DepthShader);

            this.fsQuad = new Pass_js.FullScreenQuad(this.depthMaterial);
        }

        dispose() {
            this.depthMaterial.dispose();
        }

        render(renderer, writeBuffer, readBuffer, deltaTime,/* maskActive*/) {
            // Save renderer values
            const oldAutoClear = renderer.autoClear;
            const oldAutoClearColor = renderer.autoClearColor;
            const oldAutoClearDepth = renderer.autoClearDepth;
            const oldAutoClearStencil = renderer.autoClearStencil;
            renderer.autoClear = false;
            renderer.autoClearColor = true;
            renderer.autoClearDepth = false; // don't clear depth buffer!
            renderer.autoClearStencil = false;

            // Use current renderTarget info to draw with (we have been drawing on the readBuffer)
            const uniforms = this.fsQuad.material.uniforms;
            uniforms.tDiffuse.value = readBuffer.texture;
            uniforms.tDepth.value = readBuffer.depthTexture;
            uniforms.cameraNear.value = this.camera.near;
            uniforms.cameraFar.value = this.camera.far;
            uniforms.weight.value = (this.camera.isPerspectiveCamera) ? 1.0 : 7.0;

            // Render to writeBuffer
            renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
            this.fsQuad.render(renderer);

            // Copy writeBuffer back to readBuffer (keep original depth buffer)
            this.copyPass.render(renderer, readBuffer, writeBuffer, deltaTime);

            // Restore renderer values
            renderer.autoClear = oldAutoClear;
            renderer.autoClearColor = oldAutoClearColor;
            renderer.autoClearDepth = oldAutoClearDepth;
            renderer.autoClearStencil = oldAutoClearStencil;
        }
    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    const _clearColor = new THREE__namespace.Color(0xffffff);
    const _materialCache = [];
    const _currClearColor = new THREE__namespace.Color();

    let _emptyScene;
    let _renderer$1;

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Gpu Picker Pass
    /////////////////////////////////////////////////////////////////////////////////////

    /** For performing gpu picking */
    class GpuPickerPass extends Pass_js.Pass {

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

            this.renderDebugView = false;               // Set to true to render gpu picker scene for debugging
            this.needPick = false;                      // Set this to true when we need to perform a gpu mouse pick
            this.x = 0;                                 // Mouse x location to perform pick
            this.y = 0;                                 // Mouse y location to perform pick
            this.pickedId = -1;                         // Returns object id

            // We need to be inside of .render in order to call renderBufferDirect in renderList() so,
            // create empty scene and use the onAfterRender callback to actually render geometry for picking
            _emptyScene = new THREE__namespace.Scene();
            _emptyScene.onAfterRender = renderList;

            // This is the 1x1 pixel render target we use to do the picking
            this.pickingTarget = new THREE__namespace.WebGLRenderTarget(1, 1, {
                minFilter: THREE__namespace.NearestFilter, magFilter: THREE__namespace.NearestFilter,
                format: THREE__namespace.RGBAFormat, encoding: THREE__namespace.LinearEncoding
            });
            this.pixelBuffer = new Uint8Array(4 * this.pickingTarget.width * this.pickingTarget.height); // RGBA is 4 channels

            // This is the magic, these render lists are still filled with valid data. Because of this
            // we can submit them again for picking and save lots of work!
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
                let material = object.material; // renderItem.material;
                let geometry = object.geometry; // renderItem.geometry;

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
                let frontSide = material.side === THREE__namespace.FrontSide ? 1 : 0;
                let backSide = material.side === THREE__namespace.BackSide ? 1 : 0;
                let doubleSide = material.side === THREE__namespace.DoubleSide ? 1 : 0;
                let index = (useMorphing << 0) |
                    (useSkinning << 1) |
                    (useInstancing << 2) |
                    (frontSide << 3) |
                    (backSide << 4) |
                    (doubleSide << 5);
                let renderMaterial = _materialCache[index];
                if (! renderMaterial) {
                    renderMaterial = new THREE__namespace.ShaderMaterial({
                        defines: { USE_MAP: '', USE_UV: '', USE_LOGDEPTHBUF: '', },

                        // For common Three.js shader uniforms, see:
                        //      https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js

                        vertexShader: THREE__namespace.ShaderChunk.meshbasic_vert,

                        //
                        // * Alternative: Basic Vertex Shader
                        //
                        // vertexShader: `
                        //  varying vec2 vUv;
                        //  void main() {
                        //      vUv = uv;
                        //      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        //      gl_Position = projectionMatrix * mvPosition;
                        //  }
                        // `,

                        // shader reference
                        // 		https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshbasic.glsl.js

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

                    // Material Settings
                    renderMaterial.side = material.side;
                    renderMaterial.skinning = useSkinning > 0;
                    renderMaterial.morphTargets = useMorphing > 0;

                    renderMaterial.uniforms = {
                        opacity: { value: 1.0 },
                        map: { value: undefined },
                        uvTransform: { value: new THREE__namespace.Matrix3() },
                        objectId: { value: [1.0, 1.0, 1.0, 1.0] },
                        useMap: { value: 0.0 },
                    };
                    _materialCache[index] = renderMaterial;
                }

                // Uniforms
                renderMaterial.uniforms.objectId.value = [
                    (objId >> 24 & 255) / 255,
                    (objId >> 16 & 255) / 255,
                    (objId >> 8 & 255) / 255,
                    (objId & 255) / 255,
                ];
                // // Render fully transparent objects to gpu picker
                // renderMaterial.uniforms.opacity.value = (material.opacity) ? material.opacity : 1.0;
                renderMaterial.uniforms.useMap.value = 0.0;
                if (material.map) {
                    renderMaterial.uniforms.useMap.value = 1.0;
                    renderMaterial.uniforms.map.value = material.map;
                }
                renderMaterial.uniformsNeedUpdate = true;

                // Render Object
                _renderer$1.renderBufferDirect(self.camera, null, geometry, renderMaterial, object, null);
            }

        } // end ctor

        dispose() {
            this.pickingTarget.dispose();
        }

        render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
            if (this.needPick === false && this.renderDebugView === false) return;

            _renderer$1 = renderer;

            const camWidth = renderer.domElement.width;
            const camHeight = renderer.domElement.height;

            // Set the projection matrix to only look at the pixel we are interested in.
            this.camera.setViewOffset(camWidth, camHeight, this.x, this.y, 1, 1);

            // Store current renderer state info
            const currRenderTarget = renderer.getRenderTarget();
            const currAlpha = renderer.getClearAlpha();
            renderer.getClearColor(_currClearColor);

            // Render, get pixel from target
            renderer.setRenderTarget(this.pickingTarget);
            renderer.setClearColor(_clearColor);
            renderer.clear();
            renderer.render(_emptyScene, this.camera);
            renderer.readRenderTargetPixels(this.pickingTarget, 0, 0, this.pickingTarget.width, this.pickingTarget.height, this.pixelBuffer);

            // Restore renderer state info
            renderer.setRenderTarget(currRenderTarget);
            this.camera.clearViewOffset();
            if (this.renderDebugView) renderer.render(_emptyScene, this.camera);
            renderer.setClearColor(_currClearColor, currAlpha);

            // Store picked ID
            if (this.needPick) {
                this.pickedId = (this.pixelBuffer[0] << 24) + (this.pixelBuffer[1] << 16) + (this.pixelBuffer[2] << 8) + this.pixelBuffer[3];
                this.needPick = false;
            }
        }

        // !!!!! DEBUG: For debugging, render picker scene
        renderPickScene(renderer, camera) {
            _renderer$1 = renderer;

            // Store current renderer state info
            const currAlpha = renderer.getClearAlpha();
            renderer.getClearColor(_currClearColor);

            // Render, get pixel from target
            renderer.setClearColor(_clearColor);
            renderer.clear();
            renderer.render(_emptyScene, camera);

            // Restore renderer state info
            renderer.setClearColor(_currClearColor, currAlpha);
        }

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Outline Pass
    /////////////////////////////////////////////////////////////////////////////////////

    /** For drawing glowing outlines around selected objects */
    class OutlinePass extends Pass_js.Pass {

        constructor(resolution, scene, camera, selectedObjects) {

            super();

            this.renderScene = scene;
            this.renderCamera = camera;
            this.selectedObjects = selectedObjects !== undefined ? selectedObjects : [];
            this.visibleEdgeColor = new THREE__namespace.Color( 1, 1, 1 );
            this.hiddenEdgeColor = new THREE__namespace.Color( 0.1, 0.04, 0.02 );
            this.edgeGlow = 0.0;
            this.usePatternTexture = false;
            this.edgeThickness = 1.0;
            this.edgeStrength = 3.0;
            this.downSampleRatio = 2;
            this.pulsePeriod = 0;

            this._visibilityCache = new Map();

            ///// added by stevinz
            this._materialCache = new Map();
            this._castShadowCache = new Map();
            this._receiveShadowCache = new Map();
            /////

            this.resolution = (resolution !== undefined) ? new THREE__namespace.Vector2(resolution.x, resolution.y) : new THREE__namespace.Vector2(256, 256);

            const resx = Math.round(this.resolution.x / this.downSampleRatio);
            const resy = Math.round(this.resolution.y / this.downSampleRatio);

            this.renderTargetMaskBuffer = new THREE__namespace.WebGLRenderTarget( this.resolution.x, this.resolution.y );
            this.renderTargetMaskBuffer.texture.name = 'OutlinePass.mask';
            this.renderTargetMaskBuffer.texture.generateMipmaps = false;

            this.depthMaterial = new THREE__namespace.MeshDepthMaterial();
            this.depthMaterial.side = THREE__namespace.DoubleSide;
            this.depthMaterial.depthPacking = THREE__namespace.RGBADepthPacking;
            this.depthMaterial.blending = THREE__namespace.NoBlending;

            ///// added by stevinz
            this.invisibleMaterial = new THREE__namespace.MeshBasicMaterial({ visible: false });
            /////

            this.prepareMaskMaterial = this.getPrepareMaskMaterial();
            this.prepareMaskMaterial.side = THREE__namespace.DoubleSide;
            this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ( this.prepareMaskMaterial.fragmentShader, this.renderCamera );

            this.renderTargetDepthBuffer = new THREE__namespace.WebGLRenderTarget( this.resolution.x, this.resolution.y );
            this.renderTargetDepthBuffer.texture.name = 'OutlinePass.depth';
            this.renderTargetDepthBuffer.texture.generateMipmaps = false;

            this.renderTargetMaskDownSampleBuffer = new THREE__namespace.WebGLRenderTarget( resx, resy );
            this.renderTargetMaskDownSampleBuffer.texture.name = 'OutlinePass.depthDownSample';
            this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;

            this.renderTargetBlurBuffer1 = new THREE__namespace.WebGLRenderTarget( resx, resy );
            this.renderTargetBlurBuffer1.texture.name = 'OutlinePass.blur1';
            this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
            this.renderTargetBlurBuffer2 = new THREE__namespace.WebGLRenderTarget( Math.round( resx / 2 ), Math.round( resy / 2 ) );
            this.renderTargetBlurBuffer2.texture.name = 'OutlinePass.blur2';
            this.renderTargetBlurBuffer2.texture.generateMipmaps = false;

            this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
            this.renderTargetEdgeBuffer1 = new THREE__namespace.WebGLRenderTarget( resx, resy );
            this.renderTargetEdgeBuffer1.texture.name = 'OutlinePass.edge1';
            this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
            this.renderTargetEdgeBuffer2 = new THREE__namespace.WebGLRenderTarget( Math.round( resx / 2 ), Math.round( resy / 2 ) );
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

            // Overlay material
            this.overlayMaterial = this.getOverlayMaterial();

            // copy material
            if ( CopyShader_js.CopyShader === undefined ) console.error( 'THREE.OutlinePass relies on CopyShader' );

            const copyShader = CopyShader_js.CopyShader;

            this.copyUniforms = THREE__namespace.UniformsUtils.clone(copyShader.uniforms);
            this.copyUniforms[ 'opacity' ].value = 1.0;

            this.materialCopy = new THREE__namespace.ShaderMaterial( {
                uniforms: this.copyUniforms,
                vertexShader: copyShader.vertexShader,
                fragmentShader: copyShader.fragmentShader,
                blending: THREE__namespace.NoBlending,
                depthTest: false,
                depthWrite: false,
                transparent: true
            } );

            this.enabled = true;
            this.needsSwap = false;

            this._oldClearColor = new THREE__namespace.Color();
            this.oldClearAlpha = 1;

            this.fsQuad = new Pass_js.FullScreenQuad( null );

            this.tempPulseColor1 = new THREE__namespace.Color();
            this.tempPulseColor2 = new THREE__namespace.Color();
            this.textureMatrix = new THREE__namespace.Matrix4();

            function replaceDepthToViewZ( string, camera ) {

                const type = camera.isPerspectiveCamera ? 'perspective' : 'orthographic';

                return string.replace( /DEPTH_TO_VIEW_Z/g, type + 'DepthToViewZ' );

            }

        } // end ctor

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

        /////////////////////////////////////////////////////////////////////////////////////
        /////
        /////   !!!!! NOTE: Added support to allow children to stay visible, Apr 7, 20222
        /////
        ////////////////////

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

            // Gather Selected Meshes
            for (let i = 0; i < this.selectedObjects.length; i++) {
                this.selectedObjects[i].traverse((object) => {
                    if (object.isMesh) selectedMeshes.push(object);
                });
            }

            // Change Visibility
            this.renderScene.traverse((object) => {

                // Object is not selected
                let isSelected = ObjectUtils.containsObject(selectedMeshes, object);
                if (! isSelected) {

                    if (isVisible === true) {

                        if (object.isMesh) object.material = materialCache.get(object.id);
                        object.visible = visibilityCache.get(object.id);

                    } else {

                        // If holds a selected object, want to keep visible (with invisible Material)
                        let holdsSelected = false;
                        object.traverse((child) => {
                            if (ObjectUtils.containsObject(selectedMeshes, child)) {
                                holdsSelected = true;
                            }
                        });

                        // Save material / visibility
                        if (object.isMesh) materialCache.set(object.id, object.material);
                        visibilityCache.set(object.id, object.visible);

                        // Set non-visible / invisibleMaterial
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

        /////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////

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

                /////
                this.disableShadows();
                /////

                renderer.getClearColor( this._oldClearColor );
                this.oldClearAlpha = renderer.getClearAlpha();
                const oldAutoClear = renderer.autoClear;
                const oldOverrideMaterial = this.renderScene.overrideMaterial;

                renderer.autoClear = false;

                if ( maskActive ) renderer.state.buffers.stencil.setTest( false );

                renderer.setClearColor( 0xffffff, 1 );

                // Make selected objects invisible
                this.changeVisibilityOfSelectedObjects( false );

                const currentBackground = this.renderScene.background;
                this.renderScene.background = null;

                // 1. Draw Non Selected objects in the depth buffer
                this.renderScene.overrideMaterial = this.depthMaterial;
                renderer.setRenderTarget( this.renderTargetDepthBuffer );
                renderer.clear();
                renderer.render( this.renderScene, this.renderCamera );

                // Make selected objects visible
                this.changeVisibilityOfSelectedObjects( true );

                // Update Texture Matrix for Depth compare
                this.updateTextureMatrix();

                // Make non selected objects invisible, and draw only the selected objects, by comparing the depth buffer of non selected objects
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

                // 2. Downsample to Half resolution
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

                // 3. Apply Edge Detection Pass
                this.fsQuad.material = this.edgeDetectionMaterial;
                this.edgeDetectionMaterial.uniforms[ 'maskTexture' ].value = this.renderTargetMaskDownSampleBuffer.texture;
                this.edgeDetectionMaterial.uniforms[ 'texSize' ].value.set( this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height );
                this.edgeDetectionMaterial.uniforms[ 'visibleEdgeColor' ].value = this.tempPulseColor1;
                this.edgeDetectionMaterial.uniforms[ 'hiddenEdgeColor' ].value = this.tempPulseColor2;
                renderer.setRenderTarget( this.renderTargetEdgeBuffer1 );
                renderer.clear();
                this.fsQuad.render( renderer );

                // 4. Apply Blur on Half res
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

                // Apply Blur on quarter res
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

                // Blend it additively over the input texture
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

                /////

                this.enableShadows();

                this._materialCache.clear();
                this._castShadowCache.clear();
                this._receiveShadowCache.clear();
                this._visibilityCache.clear();

                /////

            }

            if ( this.renderToScreen ) {

                this.fsQuad.material = this.materialCopy;
                this.copyUniforms[ 'tDiffuse' ].value = readBuffer.texture;
                renderer.setRenderTarget( null );
                this.fsQuad.render( renderer );

            }

        }

        getPrepareMaskMaterial() {

            return new THREE__namespace.ShaderMaterial( {

                uniforms: {
                    'depthTexture': { value: null },
                    'cameraNearFar': { value: new THREE__namespace.Vector2( 0.5, 0.5 ) },
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

            return new THREE__namespace.ShaderMaterial( {

                uniforms: {
                    'maskTexture': { value: null },
                    'texSize': { value: new THREE__namespace.Vector2( 0.5, 0.5 ) },
                    'visibleEdgeColor': { value: new THREE__namespace.Vector3( 1.0, 1.0, 1.0 ) },
                    'hiddenEdgeColor': { value: new THREE__namespace.Vector3( 1.0, 1.0, 1.0 ) },
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

            return new THREE__namespace.ShaderMaterial( {

                defines: {
                    'MAX_RADIUS': maxRadius,
                },

                uniforms: {
                    'colorTexture': { value: null },
                    'texSize': { value: new THREE__namespace.Vector2( 0.5, 0.5 ) },
                    'direction': { value: new THREE__namespace.Vector2( 0.5, 0.5 ) },
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

            return new THREE__namespace.ShaderMaterial( {

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
                blending: THREE__namespace.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                transparent: true
            } );

        }

    }

    OutlinePass.BlurDirectionX = new THREE__namespace.Vector2(1.0, 0.0);
    OutlinePass.BlurDirectionY = new THREE__namespace.Vector2(0.0, 1.0);

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    const _oldClearColor = new THREE__namespace.Color();

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Wireframe Pass
    /////////////////////////////////////////////////////////////////////////////////////

    /** For drawing selected scene items as wireframe */
    class WireframePass extends Pass_js.Pass {

        constructor(scene, camera, wireColor = 0xffffff, opacity = 0.25) {
            super();

            // Public Properties
            this.scene = scene;
            this.camera = camera;
            this.selectedObjects = [];

            // Local Properties
            this.clearColor = undefined;
            this.clearAlpha = 0.0;
            this.clear = false;
            this.clearDepth = false;
            this.needsSwap = false;
            this.enabled = true;

            // Local variables
            this._visibilityCache = new Map();
            this._materialMap = new Map();

            this.overrideMaterial = new THREE__namespace.MeshBasicMaterial({
                color: 0xff0000, //wireColor,
                wireframe: true,
                opacity: opacity,
                transparent: true,
                vertexColors: false,

                depthTest: true,
                depthWrite: false,

                polygonOffset: true,
                polygonOffsetFactor: 1, // positive value pushes polygon further away

                alphaToCoverage: false,
            });

            this.invisibleMaterial = new THREE__namespace.MeshBasicMaterial({ visible: false });

        } // end ctor

        dispose() {
            this.overrideMaterial.dispose();
            this.invisibleMaterial.dispose();
        }

        render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
            if (this.selectedObjects.length < 1) return;

            // Store current renderer state info
            renderer.getClearColor(_oldClearColor);
            const oldClearAlpha = renderer.getClearAlpha();
            const oldAutoClear = renderer.autoClear;
            const oldOverrideMaterial = this.scene.overrideMaterial;
            const oldSceneBackground = this.scene.background;

            // Set renderer state info
            renderer.setClearColor(0x000000, 0);
            renderer.autoClear = false;
            this.scene.overrideMaterial = this.overrideMaterial;
            this.scene.background = null;

            // Make non selected objects invisible
            this.changeVisibilityOfNonSelectedObjects(false);

            // Render
            if (this.clearDepth) renderer.clearDepth();
            renderer.setRenderTarget((this.renderToScreen || (! readBuffer)) ? null : readBuffer);
            renderer.render(this.scene, this.camera);

            // Restore object visibility
            this.changeVisibilityOfNonSelectedObjects(true);
            this._visibilityCache.clear();

            // Restore state info
            renderer.setClearColor(_oldClearColor, oldClearAlpha);
            renderer.autoClear = oldAutoClear;
            this.scene.overrideMaterial = oldOverrideMaterial;
            this.scene.background = oldSceneBackground;
        }

        //

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

        //

        changeVisibilityOfNonSelectedObjects(isVisible) {
            const self = this;
            this._visibilityCache;
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

                // Only meshes are supported by WireframePass
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/
    //
    //  TexturedShader
    //      Super basic texture map material shader
    //
    /////////////////////////////////////////////////////////////////////////////////////

    const TexturedShader = {

        defines: { USE_LOGDEPTHBUF: '' },

        transparent: true,

        uniforms: {
            'map': { value: null },
            'opacity': { value: 1.0 },
        },

        vertexShader: /* glsl */`
        #include <common>
        #include <logdepthbuf_pars_vertex>

        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            #include <logdepthbuf_vertex>
        }`,

        fragmentShader: /* glsl */`
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    const XRayShader = {

        defines: { USE_LOGDEPTHBUF: '' },

        side: THREE__namespace.DoubleSide,
        blending: THREE__namespace.AdditiveBlending,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away

        uniforms: {
            'xrayColor': { value: new THREE__namespace.Color(0x88ccff) },
        },

        vertexShader: /* glsl */`
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

        fragmentShader: /* glsl */`
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    const _uv = [ new THREE__namespace.Vector2(), new THREE__namespace.Vector2(), new THREE__namespace.Vector2() ];
    const _vertex = [ new THREE__namespace.Vector3(), new THREE__namespace.Vector3(), new THREE__namespace.Vector3() ];
    const _temp = new THREE__namespace.Vector3();

    //////////////////// Class

    class GeometryUtils {

        static addAttribute(geometry, attributeName = 'color', stride = 3, fill = 0) {
            if (! geometry.getAttribute(attributeName)) {
                let array = new Float32Array(geometry.attributes.position.count * stride).fill(fill);
    	        const attribute = new THREE__namespace.BufferAttribute(array, stride, true).setUsage(THREE__namespace.DynamicDrawUsage);
    	        geometry.setAttribute(attributeName, attribute);
            }
            return geometry;
        }

        /** Converts mesh to be able to used custom colored triangles (painting) */
        static coloredMesh(mesh) {
            if (! mesh.geometry) return mesh;
            if (! mesh.material) return mesh;

            ///// MATERIAL

            // Enable Vertex Colors
            let material = mesh.material;
            if (Array.isArray(material) !== true) material = [ mesh.material ];
            for (let i = 0; i < material.length; i++) {
                if (material[i].vertexColors !== true) {
                    material[i].vertexColors = true;
                    material[i].needsUpdate = true;
                }
            }

            ///// GEOMETRY

            // Add Color Attribute (if not already)
            GeometryUtils.addAttribute(mesh.geometry, 'color', 3, 1.0);

            // Return Altered Mesh
            return mesh;
        }

        /** Finds max / min geometry Size */
        static modelSize(geometry, type = 'max') {
            let boxSize = new THREE__namespace.Vector3();
            geometry.computeBoundingBox();
            geometry.boundingBox.getSize(boxSize);
            // !!!!! OPTION: Maximum size
            if (type === 'max') {
                return Math.max(boxSize.x, boxSize.y, boxSize.z);
            } else /* 'min' */ {
                return Math.min(boxSize.x, boxSize.y, boxSize.z);
            }
        }

        /** Multiplies uv coordinates in geometry to repeat texture */
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

        /** Maps UV coordinates onto an object that fits inside a cube */
        static uvMapCube(geometry, transformMatrix, frontFaceOnly = false) {

            // Ensure non-indexed geometry for front face only
            if (frontFaceOnly) {
                if (geometry.index !== null) {
                    const nonIndexed = geometry.toNonIndexed();
                    geometry.dispose();
                    geometry = nonIndexed;
                }
            }

            // Make sure we have a transform matrix
            if (transformMatrix === undefined) transformMatrix = new THREE__namespace.Matrix4();

            // Find Geometry Size
            let geometrySize = GeometryUtils.modelSize(geometry);

            // Create Cube based on Geometry Size
            let size = (geometrySize / 2);
            let bbox = new THREE__namespace.Box3(new THREE__namespace.Vector3(- size, - size, - size), new THREE__namespace.Vector3(size, size, size));
            let boxCenter = new THREE__namespace.Vector3();
            geometry.boundingBox.getCenter(boxCenter);

            // Align cube center with geometry center
            const centerMatrix = new THREE__namespace.Matrix4().makeTranslation(- boxCenter.x, - boxCenter.y, - boxCenter.z);

            // Prepare UV Coordinates
            const coords = [];
            coords.length = 2 * geometry.attributes.position.array.length / 3;

            // Vertex Positions
            const pos = geometry.attributes.position.array;

            // Indexed BufferGeometry
            if (geometry.index) {
                for (let vi = 0; vi < geometry.index.array.length; vi += 3) {
                    const idx0 = geometry.index.array[vi + 0];
                    const idx1 = geometry.index.array[vi + 1];
                    const idx2 = geometry.index.array[vi + 2];
                    const v0 = new THREE__namespace.Vector3(pos[(3 * idx0) + 0], pos[(3 * idx0) + 1], pos[(3 * idx0) + 2]);
                    const v1 = new THREE__namespace.Vector3(pos[(3 * idx1) + 0], pos[(3 * idx1) + 1], pos[(3 * idx1) + 2]);
                    const v2 = new THREE__namespace.Vector3(pos[(3 * idx2) + 0], pos[(3 * idx2) + 1], pos[(3 * idx2) + 2]);
                    calculateUVs(v0, v1, v2);
                    coords[2 * idx0 + 0] = _uv[0].x;
                    coords[2 * idx0 + 1] = _uv[0].y;
                    coords[2 * idx1 + 0] = _uv[1].x;
                    coords[2 * idx1 + 1] = _uv[1].y;
                    coords[2 * idx2 + 0] = _uv[2].x;
                    coords[2 * idx2 + 1] = _uv[2].y;
                }

            // Non-Indexed Geometry
            } else {
                for (let vi = 0; vi < geometry.attributes.position.array.length; vi += 9) {
                    const v0 = new THREE__namespace.Vector3(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
                    const v1 = new THREE__namespace.Vector3(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
                    const v2 = new THREE__namespace.Vector3(pos[vi + 6], pos[vi + 7], pos[vi + 8]);
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

            // Assign Coordinates
            if (geometry.attributes.uv === undefined) {
                geometry.addAttribute('uv', new THREE__namespace.Float32BufferAttribute(coords, 2));
            }
            geometry.attributes.uv.array = new Float32Array(coords);
            geometry.attributes.uv.needsUpdate = true;
            return geometry;

            /////

            function calcNormal(target, vec1, vec2, vec3) {
                _temp.subVectors(vec1, vec2);
                target.subVectors(vec2, vec3);
                target.cross(_temp).normalize();
                Vectors.round(target, 5);
            }

            // Maps 3 vertices of 1 triangle on the better side of the cube, sides of the cube can be XY, XZ or YZ
            function calculateUVs(v0, v1, v2) {

                // Pre-rotate the model so that cube sides match world axis
                v0.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
                v1.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);
                v2.applyMatrix4(centerMatrix).applyMatrix4(transformMatrix);

                // Get normal of the triangle, to know into which cube side it maps better
                const n = new THREE__namespace.Vector3();
                calcNormal(n, v0, v1, v2);

                _uv[0].set(0, 0, 0);
                _uv[1].set(0, 0, 0);
                _uv[2].set(0, 0, 0);

                // Front Face Only
                if (frontFaceOnly) {
                    let frontFace = (n.z < 0);
                    frontFace = frontFace && (Math.abs(n.y) < 0.866); // i.e. ~30°
                    frontFace = frontFace && (Math.abs(n.x) < 0.866); // i.e. ~30°

                    if (frontFace) {
                        _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                        _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                        _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                    }

                // All Six Sides
                } else {
                    n.x = Math.abs(n.x);
                    n.y = Math.abs(n.y);
                    n.z = Math.abs(n.z);

                    // XZ mapping
                    if (n.y > n.x && n.y > n.z) {
                        _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (bbox.max.z - v0.z) / geometrySize;
                        _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (bbox.max.z - v1.z) / geometrySize;
                        _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (bbox.max.z - v2.z) / geometrySize;

                    // XY Mapping
                    } else if (n.x > n.y && n.x > n.z) {
                        _uv[0].x = (v0.z - bbox.min.z) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                        _uv[1].x = (v1.z - bbox.min.z) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                        _uv[2].x = (v2.z - bbox.min.z) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;

                    // XZ Mapping
                    } else if (n.z > n.y && n.z > n.x) {
                        _uv[0].x = (v0.x - bbox.min.x) / geometrySize; _uv[0].y = (v0.y - bbox.min.y) / geometrySize;
                        _uv[1].x = (v1.x - bbox.min.x) / geometrySize; _uv[1].y = (v1.y - bbox.min.y) / geometrySize;
                        _uv[2].x = (v2.x - bbox.min.x) / geometrySize; _uv[2].y = (v2.y - bbox.min.y) / geometrySize;
                    }
                }
            }

        } // end uvMapCube

        /** Maps UV coordinates onto an object that fits inside a sphere */
        static uvMapSphere(geometry, setCoords = 'uv') {

            // Convert to Non-Indexed
            if (geometry.index !== null) {
                const nonIndexed = geometry.toNonIndexed();
                nonIndexed.uuid = geometry.uuid;
                nonIndexed.name = geometry.name;
                geometry.dispose();
                geometry = nonIndexed;
            }

            // UV Coordinate Array
            const coords = [];
            coords.length = 2 * geometry.attributes.position.array.length / 3;

            // Check for Existing UV Array
            const hasUV = ! (geometry.attributes.uv === undefined);
            if (! hasUV) geometry.addAttribute('uv', new THREE__namespace.Float32BufferAttribute(coords, 2));

            // Should we set, u, v, or both
            const setU = (! hasUV || setCoords === 'u' || setCoords === 'uv');
            const setV = (! hasUV || setCoords === 'v' || setCoords === 'uv');

            // Vertex Positions
            const pos = geometry.attributes.position.array;

            // Non-Indexed Geometry
            for (let vi = 0; vi < geometry.attributes.position.array.length; vi += 9) {
                _vertex[0].set(pos[vi + 0], pos[vi + 1], pos[vi + 2]);
                _vertex[1].set(pos[vi + 3], pos[vi + 4], pos[vi + 5]);
                _vertex[2].set(pos[vi + 6], pos[vi + 7], pos[vi + 8]);

                let index = vi / 3;
                for (let i = 0; i < 3; i++) {
                    const polar = cartesian2polar(_vertex[i]);

                    // Top / Bottom Vertex.x Coordinate is 0, points are alligned a little differently on top / bottom.
                    if (polar.theta === 0 && (polar.phi === 0 || polar.phi === Math.PI)) {
                        const alignedVertex = (polar.phi === 0) ? '1' : '0';
                        polar.theta = cartesian2polar(_vertex[alignedVertex]).theta;
                    }

                    setUV(polar, index, i);
                    index++;
                }

                // To check for overwrap, compare x values
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

            // Assign Coordinates
            geometry.attributes.uv.array = new Float32Array(coords);
            geometry.attributes.uv.needsUpdate = true;
            return geometry;

            //////////

            function setUV(polarVertex, index, i) {
                const canvasPoint = polar2canvas(polarVertex);
                const uv = new THREE__namespace.Vector2(1 - canvasPoint.x, 1 - canvasPoint.y);
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
                    theta: Math.atan2(position.z, position.x),          // x
                    phi: Math.acos(position.y / radius)                 // y
                });
            }

            function polar2canvas(polarPoint) {
                return({
                    x: (polarPoint.theta + Math.PI) / (2 * Math.PI),    // theta
                    y: (polarPoint.phi / Math.PI)                       // phi
                });
            }

        } // end uvMapShere

    }

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    let _renderer;

    ///// Class

    class RenderUtils {

        static offscreenRenderer(width = 512, height = 512) {
            if (_renderer === undefined) {
                _renderer = new THREE__namespace.WebGLRenderer({ alpha: true /* transparent background */});
            }
            _renderer.setClearColor(0xffffff, 0);
            _renderer.setSize(width, height, false);
            return _renderer;
        }

        /** Render geometry, camera centered on geometry */
        static renderGeometryToCanvas(canvas, geometry, geometryColor = 0xffffff) {
            const scene = new THREE__namespace.Scene();
            scene.add(new THREE__namespace.HemisphereLight(0xffffff, 0x202020, 1.5));
            const camera = new THREE__namespace.PerspectiveCamera(50, canvas.width / canvas.height);
            camera.position.set(0, 0, 1);

            // Mesh
            const material = new THREE__namespace.MeshLambertMaterial({ color: geometryColor });
            const mesh = new THREE__namespace.Mesh(geometry, material);
            scene.add(mesh);

            // Fit Camera
            CameraUtils.fitCameraToObject(camera, mesh);

            // Render
            const renderer = RenderUtils.offscreenRenderer(canvas.width, canvas.height);
            renderer.render(scene, camera);

            // Cleanup
            material.dispose();

            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
            }
        }

        /** Render texture to canvas */
        static renderTextureToCanvas(canvas, texture) {
            const scene = new THREE__namespace.Scene();
            const camera = new THREE__namespace.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const material = new THREE__namespace.MeshBasicMaterial({ map: texture, alphaTest: true });
            const quad = new THREE__namespace.PlaneGeometry(2, 2);
            const mesh = new THREE__namespace.Mesh(quad, material);
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    const CAMERA_START_DISTANCE = 5;
    const CAMERA_START_HEIGHT = 0;

    ///// Local Variables

    const _renderSize = new THREE__namespace.Vector2(1, 1);

    ///// Component

    class Camera {

        init(data) {

            ///// Generate Backend

            let camera = undefined;

            switch (data.style) {
                case 'perspective':
                    // Private Properties
                    this._tanFOV = Math.tan(((Math.PI / 180) * data.fov / 2));
                    this._windowHeight = (data.fixedSize) ? 1000 : 0;

                    camera = new THREE__namespace.PerspectiveCamera(data.fov, 1 /* data.aspect */, data.nearPersp, data.farPersp);
                    break;

                case 'orthographic':
                    camera = new THREE__namespace.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.nearOrtho, data.farOrtho);
                    break;

                default:
                    console.error(`Camera.init: Invalid camera type '${data.style}'`);
            }

            ///// Modifiy Camera

            if (camera && camera.isCamera) {

                // Set Starting Location
                camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
                camera.lookAt(0, CAMERA_START_HEIGHT, 0);

            } else {
                console.log('Error with camera!');
            }

            ///// Save Data / Backend

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

                    // Calculate new frustum, update camera
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

            // Copy Existing 'data' Properties
            for (let key in data) {
                if (this.data[key] !== undefined) {
                    data[key] = this.data[key];
                }
            }

            // Copy values from THREE.Camera
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
            // aspect: { type: 'number', default: 1, if: { style: [ 'perspective' ], fixedSize: [ false ] } },

            left: { type: 'number', default: -1, if: { style: [ 'orthographic' ] } },
            right: { type: 'number', default: 1, if: { style: [ 'orthographic' ] } },
            top: { type: 'number', default: 1, if: { style: [ 'orthographic' ] } },
            bottom: { type: 'number', default: -1, if: { style: [ 'orthographic' ] } },
        },
        icon: ``,
        color: '#4B4886',
    };

    ComponentManager.register('camera', Camera);

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Local Variables

    let _x = 0;
    let _y = 0;

    ///// Component

    class Geometry {

        init(data) {

            // Copy / Clear Backend
            if (this.backend && this.backend.isBufferGeometry) {
                this.backend.dispose();
                this.backend = undefined;
            }

            // Passed in Geometry
            if (data.isBufferGeometry) {
                const assetUUID = data.uuid;
                AssetManager.addGeometry(data);

                // Build 'data'
                data = this.defaultData('style', 'asset');
                data.asset = assetUUID;
            }

            ///// Generate Backend

            let geometry = undefined;

            switch (data.style) {
                case 'asset':
                    let assetGeometry = AssetManager.getGeometry(data.asset);
                    if (assetGeometry && assetGeometry.isBufferGeometry) {
                        geometry = assetGeometry.clone();
                    }
                    break;

                case 'box':
                    geometry = new THREE__namespace.BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
                    break;

                case 'capsule':
                    // // THREE.CapsuleGeometry
                    // let capHeight = data.height / 2;
                    // let capRadius = data.radius / 1.5;
                    // geometry = new THREE.CapsuleGeometry(capRadius, capHeight, data.capSegments, data.radialSegments);

                    // Custom CapsuleGeometry
                    let capRadiusTop = Maths.clamp(data.radiusTop, 0.1, data.height) / 1.5;
                    let capRadiusBottom = Maths.clamp(data.radiusBottom, 0.1, data.height) / 1.5;
                    let capHeight = data.height / 1.5;
                    geometry = new CapsuleGeometry(
                        capRadiusTop, capRadiusBottom, capHeight,
                        data.radialSegments, data.heightSegments,
                        data.capSegments, data.capSegments,
                        data.thetaStart, data.thetaLength);

                    // Texture Mapping
                    geometry = GeometryUtils.uvMapSphere(geometry, 'v');
                    break;

                case 'circle':
                    geometry = new THREE__namespace.CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);
                    break;

                case 'cone':
                    geometry = new CylinderGeometry(0, data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                    break;

                case 'cylinder':
                    geometry = new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
                    break;

                case 'lathe':
                    //
                    // !!!!! TODO: CUSTOM LINE
                    //
                    //const points = data.points;

                    /// SVG
                    let svgLoader = new SVGLoader_js.SVGLoader();
                    // Create Paths
                    let svgData = svgLoader.parse(`
                    <g transform="matrix(1,0,0,1,-62,77.5)">
                        <path d="M125,59C151.284,141.301 106.947,164.354 84,158L83,263C100.017,285.361 110.282,295.752 143,298" style="fill:none;stroke:black;stroke-width:1px;"/>
                    </g>
                `);
                    // Create Shapes
                    let path = svgData.paths[Object.keys(svgData.paths)[0]];
                    let svgShapes = SVGLoader_js.SVGLoader.createShapes(path);
                    let svgPoints = svgShapes[0].extractPoints(30);

                    // Flip Y from SVG (and reverse point CW --> CCW)
                    const points = [];
                    for (let i = svgPoints.shape.length - 1; i >= 0; i--) {
                        points.push(new THREE__namespace.Vector2(svgPoints.shape[i].x * 0.005, svgPoints.shape[i].y * -0.005));
                    }

                    // Create Lathe
                    geometry = new THREE__namespace.LatheGeometry(points, data.segments, 0, data.phiLength);
                    geometry.center();
                    break;

                case 'plane':
                    geometry = new THREE__namespace.PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
                    break;

                case 'platonicSolid':
                    switch (data.polyhedron) {
                        case 'dodecahedron': geometry = new THREE__namespace.DodecahedronGeometry(data.radius, data.detail); break;
                        case 'icosahedron': geometry = new THREE__namespace.IcosahedronGeometry(data.radius, data.detail); break;
                        case 'octahedron': geometry = new THREE__namespace.OctahedronGeometry(data.radius, data.detail); break;
                        case 'tetrahedron': geometry = new THREE__namespace.TetrahedronGeometry(data.radius, data.detail); break;
                        default: geometry = new THREE__namespace.DodecahedronGeometry(data.radius, data.detail); break;
                    }
                    break;

                case 'ring':
                    geometry = new THREE__namespace.RingGeometry(data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength);
                    break;

                case 'roundedBox':
                    geometry = new RoundedBoxGeometry_js.RoundedBoxGeometry(data.width, data.height, data.depth, data.segments, data.radius);
                    break;

                case 'shape':
                    // PENTAGON
                    data.shapes ?? new THREE__namespace.Shape([
                        new THREE__namespace.Vector2( 64,   8),
                        new THREE__namespace.Vector2(  0,  64),
                        new THREE__namespace.Vector2(-64,   8),
                        new THREE__namespace.Vector2(-32, -64),
                        new THREE__namespace.Vector2( 32, -64)
                    ]);

                    // CALIFORNIA
                    const californiaPts = [];
                    californiaPts.push(new THREE__namespace.Vector2(610, 320));
                    californiaPts.push(new THREE__namespace.Vector2(450, 300));
                    californiaPts.push(new THREE__namespace.Vector2(392, 392));
                    californiaPts.push(new THREE__namespace.Vector2(266, 438));
                    californiaPts.push(new THREE__namespace.Vector2(190, 570));
                    californiaPts.push(new THREE__namespace.Vector2(190, 600));
                    californiaPts.push(new THREE__namespace.Vector2(160, 620));
                    californiaPts.push(new THREE__namespace.Vector2(160, 650));
                    californiaPts.push(new THREE__namespace.Vector2(180, 640));
                    californiaPts.push(new THREE__namespace.Vector2(165, 680));
                    californiaPts.push(new THREE__namespace.Vector2(150, 670));
                    californiaPts.push(new THREE__namespace.Vector2( 90, 737));
                    californiaPts.push(new THREE__namespace.Vector2( 80, 795));
                    californiaPts.push(new THREE__namespace.Vector2( 50, 835));
                    californiaPts.push(new THREE__namespace.Vector2( 64, 870));
                    californiaPts.push(new THREE__namespace.Vector2( 60, 945));
                    californiaPts.push(new THREE__namespace.Vector2(300, 945));
                    californiaPts.push(new THREE__namespace.Vector2(300, 743));
                    californiaPts.push(new THREE__namespace.Vector2(600, 473));
                    californiaPts.push(new THREE__namespace.Vector2(626, 425));
                    californiaPts.push(new THREE__namespace.Vector2(600, 370));
                    californiaPts.push(new THREE__namespace.Vector2(610, 320));
                    for (let i = 0; i < californiaPts.length; i++) californiaPts[i].multiplyScalar(0.001);
                    new THREE__namespace.Shape(californiaPts);

                    const circleShape = new THREE__namespace.Shape();
                    circleShape.absarc(0, 0, 1 /* radius */);

                    // Set Options
                    let options = {
                        depth: data.depth,
                        curveSegments: data.curveSegments,
                        steps: data.steps,
                        bevelEnabled: data.bevelEnabled,
                        bevelThickness: data.bevelThickness,
                        bevelSize: data.bevelSize,
                        bevelSegments: data.bevelSegments,
                    };

                    ///// Create Geometry
                    // geometry = new TeapotGeometry(15, 18).scale(5, 5, 5);
                    // geometry = new THREE.SphereGeometry(128, 32, 32);
                    geometry = new THREE__namespace.ExtrudeGeometry(circleShape, options);
                    // geometry.translate(0, 0, data.depth / -2);
                    geometry.center();
                    break;

                case 'sphere':
                    geometry = new THREE__namespace.SphereGeometry(data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength);
                    break;

                case 'torus':
                    geometry = new THREE__namespace.TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc);
                    break;

                case 'torusKnot':
                    geometry = new THREE__namespace.TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q);
                    break;

                case 'tube':
                    // HEART
                    const heartShape = new THREE__namespace.Shape()
                        .moveTo(_x + 25, _y + 25)
                        .bezierCurveTo(_x + 25, _y + 25, _x + 20, _y, _x, _y)
                        .bezierCurveTo(_x - 30, _y, _x - 30, _y + 35, _x - 30, _y + 35)
                        .bezierCurveTo(_x - 30, _y + 55, _x - 10, _y + 77, _x + 25, _y + 95)
                        .bezierCurveTo(_x + 60, _y + 77, _x + 80, _y + 55, _x + 80, _y + 35)
                        .bezierCurveTo(_x + 80, _y + 35, _x + 80, _y, _x + 50, _y)
                        .bezierCurveTo(_x + 35, _y, _x + 25, _y + 25, _x + 25, _y + 25);

                    // Convert 2D Lines to 3D Lines
                    const arcPoints = heartShape.getPoints(256);
                    const lines = [];
                    for (let i = 0; i < arcPoints.length; i += 2) {
                        const pointA = arcPoints[i];
                        const pointB = arcPoints[i + 1] || pointA;
                        lines.push(
                            new THREE__namespace.LineCurve3(
                                new THREE__namespace.Vector3(pointA.x * 0.01, pointA.y * -0.01, 0),
                                new THREE__namespace.Vector3(pointB.x * 0.01, pointB.y * -0.01, 0),
                            ),
                        );
                    }
                    const path3D = new THREE__namespace.CurvePath();
                    path3D.curves.push(...lines);

                    // Create Geometry
                    geometry = new THREE__namespace.TubeGeometry(path3D, data.tubularSegments, data.radius, data.radialSegments, data.closed);
                    geometry.center();
                    break;

                default:
                    console.error('Geometry: Invalid geometry type ' + data.style);
            }

            ///// Modifiy Geometry

            if (geometry && geometry.isBufferGeometry) {

                // Saved geometry type as Name
                const geometryName = geometry.constructor.name;

                // // Simplify, TODO: Three.js/Addon is Buggy
                // if (data.simplify < 1) {
                //     const simplifyModifier = new SimplifyModifier()
                //     const count = Math.max(3.0, Math.floor(geometry.attributes.position.count * data.simplify));
    			//     let simplifiedGeometry = simplifyModifier.modify(geometry, count);
                //     if (simplifiedGeometry) {
                //         geometry.dispose();
                //         geometry = simplifiedGeometry;
                //     }
                // }

                // Subdivision
                const subdivideParams = {
                    split: data.edgeSplit ?? false,
                    uvSmooth: data.uvSmooth ?? false,
                    flatOnly: data.flatOnly ?? false,
                    preserveEdges: false,
                    maxTriangles: 50000,
                };

                if (subdivideParams.split || data.subdivide > 0) {
                    let subdividedGeometry = threeSubdivide.LoopSubdivision.modify(geometry, data.subdivide, subdivideParams);
                    if (subdividedGeometry) {
                        geometry.dispose();
                        geometry = subdividedGeometry;
                    }
                }

                // Map UV Coordinates
                if (data.textureMapping === 'cube') {
                    geometry = GeometryUtils.uvMapCube(geometry);
                } else if (data.textureMapping === 'sphere') {
                    geometry = GeometryUtils.uvMapSphere(geometry);
                }

                // Texture Wrapping Performed on Geometry
                if (data.wrapS !== 1 || data.wrapT !== 1) {
                    const s = Math.max(data.wrapS, 0);
                    const t = Math.max(data.wrapT, 0);
                    GeometryUtils.repeatTexture(geometry, s, t);
                }

                // Set Name to Modified Geometry
                geometry.name = geometryName;

            }

            ///// Save Data / Backend

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

            // Copy Existing 'data' Properties
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

            // Asset UUID
            asset: { type: 'asset', if: { style: [ 'asset' ] } },

            ///// DIVIDER
            styleDivider: { type: 'divider' },
            /////

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

            // Ring
            innerRadius: { type: 'number', default: 0.25, min: 0, step: 0.01, if: { style: [ 'ring' ] } },
            outerRadius: { type: 'number', default: 0.50, min: 0, step: 0.01, if: { style: [ 'ring' ] } },
            phiSegments: { type: 'int', default: 10, min: 1, max: 64, promode: true, if: { style: [ 'ring' ] } },
            thetaSegments: { type: 'int', default: 36, min: 3, max: 128, if: { style: [ 'ring' ] } },

            // Shape (Extrude)
            steps: { type: 'int', alias: 'Depth Segments', default: 8, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
            bevelEnabled: { type: 'boolean', alias: 'bevel', default: true, if: { style: [ 'shape' ] } },
            bevelThickness: { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
            bevelSize: { type: 'number', default: 0.2, min: 0, step: 0.01, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
            bevelSegments: { type: 'int', default: 4, min: 0, max: 64, promode: true, if: { style: [ 'shape' ], bevelEnabled: [ true ] } },
            curveSegments: { type: 'int', default: 16, min: 1, max: 128, promode: true, if: { style: [ 'shape' ] } },
            // ... more
            // extrudePath — THREE.Curve - 3D spline path along which the shape should be extruded. Bevels not supported for path extrusion
            // UVGenerator — Object. object that provides UV generator functions

            // Torus / Torus Knot
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

            // Tube
            closed: { type: 'boolean', default: true, if: { style: [ 'tube' ] } },

            ///// DIVIDER
            modifierDivider: { type: 'divider' },
            /////

            // // Simplify
            // simplify: { type: 'slider', default: 1, min: 0, max: 1 },

            // Subdivision
            subdivide: { type: 'slider', default: 0, min: 0, max: 5, step: 1, precision: 0 },
            edgeSplit: { type: 'boolean', default: false, hide: { subdivide: [ 0 ] } },
            uvSmooth: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
            flatOnly: { type: 'boolean', default: false, promode: true, hide: { subdivide: [ 0 ] } },
            // maxTriangles: { type: 'number', default: 25000, min: 1, promode: true },

            ///// DIVIDER
            textureDivider: { type: 'divider' },
            /////

            // Texture Mapping
            textureMapping: [
                { type: 'select', default: 'cube', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'shape' ] } },
                { type: 'select', default: 'none', select: [ 'none', 'cube', 'sphere' ], if: { style: [ 'asset', 'box', 'capsule', 'circle', 'cone', 'cylinder', 'lathe', 'plane', 'platonicSolid', 'ring', 'roundedBox', 'sphere', 'torus', 'torusKnot', 'tube' ] } },
            ],

            // Texture Wrapping
            wrapS: { type: 'number', alias: 'wrapX', default: 1, min: 0, step: 0.2, precision: 2 },
            wrapT: { type: 'number', alias: 'wrapY', default: 1, min: 0, step: 0.2, precision: 2 },

        },
        ///// EXAMPLE: Svg Icon for Inspector Tab (built in components have images built into Editor)
        // icon: `<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>`,
        icon: ``,
        color: 'rgb(255, 113, 0)',
        dependencies: [ 'material' ],
    };

    ComponentManager.register('geometry', Geometry);

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    class Light {

        init(data) {

            ///// Generate Backend

            let light = undefined;

            switch (data.style) {
                case 'ambient':
                    light = new THREE__namespace.AmbientLight(data.color, data.intensity);
                    // NO SHADOWS
                    break;

                case 'directional':
                    light = new THREE__namespace.DirectionalLight(data.color, data.intensity);
                    light.castShadow = true;
                    light.shadow.mapSize.width = 2048;      // default:     512
                    light.shadow.mapSize.height = 2048;     // default:     512

                    const SD = 5;

                    light.shadow.camera.near = 1;           // default:     0.5
                    light.shadow.camera.far = 500;          // default:     500
                    light.shadow.camera.left = -SD;         // default:     -5
                    light.shadow.camera.right = SD;         // default:     5
                    light.shadow.camera.top = SD;           // default:     5
                    light.shadow.camera.bottom = -SD;       // default:     -5

                    light.shadow.camera.updateProjectionMatrix();
                    light.shadow.bias = data.shadowBias;
                    break;

                case 'hemisphere':
                    light = new THREE__namespace.HemisphereLight(data.color, data.groundColor, data.intensity);
                    // NO SHADOWS
                    break;

                case 'point':
                    light = new THREE__namespace.PointLight(data.color, data.intensity, data.distance, data.decay);
                    light.castShadow = true;
                    light.shadow.bias = data.shadowBias;
                    break;

                case 'spot':
                    light = new THREE__namespace.SpotLight(data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay);
                    light.castShadow = true;
                    light.shadow.bias = data.shadowBias;
                    break;

                default:
                    console.error(`Light: Invalid light type '${data.style}'`);
            }

            ///// Modify Light

            if (light && light.isLight) ; else {
                console.log('Error with light!');
            }

            ///// Save Data / Backend

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

            // Copy Existing 'data' Properties
            for (let key in data) {
                if (this.data[key] !== undefined) {
                    data[key] = this.data[key];
                }
            }

            // Copy values from THREE.Light
            if (this.backend) {
                for (let key in data) {
                    let value = this.backend[key];
                    if (value !== undefined) {
                        if (value && value.isColor) data[key] = value.getHex();
                        else data[key] = value;
                    }
                }

                // Manually include shadow properties
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

            ///// DIVIDER
            styleDivider: { type: 'divider' },
            /////

            color: [
                { type: 'color', default: 0xffffff, if: { style: [ 'ambient', 'directional', 'point', 'spot' ] } },
                { type: 'color', alias: 'skyColor', default: 0x80ffff, if: { style: [ 'hemisphere' ] } },
            ],
            groundColor: { type: 'color', default: 0x806040, if: { style: [ 'hemisphere' ] } },
            intensity: [
                { type: 'slider', default: 0.25 /* 0.5 */, step: 0.1, min: 0, max: 2, if: { style: [ 'ambient' ] } },
                { type: 'slider', default: 0.50 /* 0.5 */, step: 0.1, min: 0, max: 2, if: { style: [ 'hemisphere' ] } },
                { type: 'slider', default: 1.00 /* 0.5 */, step: 0.1, min: 0, max: 2, if: { style: [ 'directional' ] } },
                { type: 'slider', default: 1.00 /* 1.0 */, step: 0.1, min: 0, max: 2, if: { style: [ 'point', 'spot' ] } },
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Types

    const blendingModes = [ 'NoBlending', 'NormalBlending', 'AdditiveBlending', 'SubstractiveBlending', 'MultiplyBlending', 'CustomBlending' ];
    const sides = [ 'FrontSide', 'BackSide', 'DoubleSide' ];
    const depthPacking = [ 'BasicDepthPacking', 'RGBADepthPacking' ];

    // const hdrEquirect = new RGBELoader().setPath('../scene3d/components/textures/')
    // .load('royal_esplanade_1k.hdr', () => hdrEquirect.mapping = THREE.EquirectangularReflectionMapping);

    ///// Component

    class Material {

        init(data) {

            // Copy / Clear Backend
            if (this.backend && this.backend.isMaterial) {
                this.backend.dispose();
                this.backend = undefined;
            }

            const parameters = {};

            // Passed in Material
            if (data.isMaterial) {
                const assetUUID = data.uuid;
                AssetManager.addMaterial(data);

                // Build 'data'
                data = this.defaultData('style', 'asset');
                data.asset = assetUUID;

            // Need to Build Material from data
            } else {

                // Copy data to THREE material 'parameters'
                for (const key in data) {
                    const value = data[key];
                    parameters[key] = value;

                    // Check if wants map (texture)
                    let checkType = Material.config.schema[key];
                    if (System.isIterable(checkType) && checkType.length > 0) checkType = checkType[0];
                    if (value && checkType && checkType.type === 'image') {

                        // Make sure texture is in AssetManager
                        if (value.isTexture) {
                            AssetManager.addTexture(value);

                        // If no texture was provided, could be UUID
                        } else {

                            // Check AssetManager for Texture
                            const textureCheck = AssetManager.getTexture(value);
                            if (textureCheck && textureCheck.isTexture === true) {
                                parameters[key] = textureCheck;

                            // No such texture found, set to null
                            } else {
                                parameters[key] = null;
                            }

                        }

                    }
                }

                // Remove data not used in THREE materials
                delete parameters['base'];
                delete parameters['style'];
                delete parameters['edgeSize'];
                delete parameters['gradientSize'];
                delete parameters['premultiplyAlpha'];

                // Convert 'string' data to 'int'
                if (typeof parameters.blending === 'string') parameters.blending = blendingModes.indexOf(parameters.blending);
                if (typeof parameters.side === 'string') parameters.side = sides.indexOf(parameters.side);
                if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE__namespace.BasicDepthPacking;
                if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE__namespace.RGBADepthPacking;
            }

            ///// Generate Backend

            let material = undefined;

            switch (data.style) {
                case 'asset':
                    let assetMaterial = AssetManager.getMaterial(data.asset);
                    if (assetMaterial && assetMaterial.isMaterial) {
                        material = assetMaterial.clone();
                    }
                    break;
                case 'basic': material = new THREE__namespace.MeshBasicMaterial(parameters); break;
                case 'depth': material = new THREE__namespace.MeshDepthMaterial(parameters); break;
                case 'lambert': material = new THREE__namespace.MeshLambertMaterial(parameters); break;
                case 'matcap': material = new THREE__namespace.MeshMatcapMaterial(parameters); break;
                case 'normal': material = new THREE__namespace.MeshNormalMaterial(parameters); break;
                case 'phong': material = new THREE__namespace.MeshPhongMaterial(parameters); break;
                case 'physical': material = new THREE__namespace.MeshPhysicalMaterial(parameters); break;
                case 'points': material = new THREE__namespace.PointsMaterial(parameters); break;
                case 'shader': material = new THREE__namespace.ShaderMaterial(parameters); break;
                case 'standard': material = new THREE__namespace.MeshStandardMaterial(parameters); break;
                case 'toon':
                    material = new THREE__namespace.MeshToonMaterial(parameters);
                    data.gradientSize = Math.min(Math.max(data.gradientSize, 1), 16);
                    const format = (getRenderer().capabilities.isWebGL2) ? THREE__namespace.RedFormat : THREE__namespace.LuminanceFormat;
                    const colors = new Uint8Array(data.gradientSize + 2);
                    for (let c = 0; c <= colors.length; c++) colors[c] = (c / colors.length) * 256;
                    material.gradientMap = new THREE__namespace.DataTexture(colors, colors.length, 1, format);
                    material.gradientMap.needsUpdate = true;
                    break;
                default:
                    console.error(`Material: Invalid material type '${data.style}'`);
            }

            ///// Modifiy Material

            if (material && material.isMaterial) ; else {
                console.log('Error with material!');
            }

            ///// Save Data / Backend

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
            // Remove current Mesh
            if (this.entity && this.mesh) this.entity.remove(this.mesh);
            if (this.enabled !== true) return;

            // Get material and geometry (if present)
            if (! this.backend || ! this.backend.isMaterial) return;
            const material = this.backend.clone();
            extendMaterial(material, this.toJSON());

            const geometryComponent = this.entity.getComponent('geometry');
            if (! geometryComponent) return;
            if (! geometryComponent.enabled) return;
            const geometry = geometryComponent.backend;
            if (! geometry) return;

            // Create mesh
            if (this.style === 'points') {
                this.mesh = new THREE__namespace.Points(geometry, material);
            } else {
                // Create Mesh
                this.mesh = new THREE__namespace.Mesh(geometry, material);
                this.mesh.castShadow = this.entity.castShadow;
                this.mesh.receiveShadow = this.entity.receiveShadow;
            }
            this.mesh.name = `Backend Object3D for ${this.entity.name}`;

            // Glass
            const isGlass = this.backend.isMeshPhysicalMaterial === true && this.backend.transmission > 0;
            if (isGlass) this.backend.envMap = hdrEquirect;

            // Show invisible objects as wireframe
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

            // !!!!! NOTE:  Adding backend mesh into Project as Object3D only.
            //              Mesh will not be exported, shown in SceneTree, etc.
            if (this.entity && this.mesh) this.entity.add(this.mesh);
        }

        toJSON() {
            let data = this.defaultData('style', this.style);

            // Copy Existing 'data' Properties
            for (let key in data) {
                if (this.data[key] !== undefined) {
                    // Save 'map' types (textures) as uuid only
                    if (this.data[key] && this.data[key].isTexture) {
                        data[key] = this.data[key].uuid;

                    // Normal Data
                    } else {
                        data[key] = this.data[key];
                    }
                }
            }

            return data;
        }

    }

    //////////////////// Extend Material

    function extendMaterial(material, data = { style: 'basic', premultiplyAlpha: true }) {
        if (! material || ! material.isMaterial) return;

        let wantsOpaque = (data && data.opacity === 1.0 && data.map === undefined);

        // Standard Values
        material.transparent = ! wantsOpaque;               // Opaque? Auto adjust 'transparent' (speeds rendering)
        material.alphaTest = 0.01;                          // Save time rendering transparent pixels
        material.polygonOffset = true;                      // Helps Z-Fighting
        material.polygonOffsetFactor = 1;                   // Positive value pushes polygon further away

        // On Before Compile
        material.onBeforeCompile = function(shader) {

            // Toon Bit Depth / Rounding Improvements
            if (data.style === 'toon') {
                shader.uniforms = THREE__namespace.UniformsUtils.merge([
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
                        // ---------- Adding Below ----------
                        // Convert red/green/blue to hue/saturation/vibrance
                        'vec3 rgbToHsv(vec3 c) {',
                        '   vec4  K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',
                        '   vec4  p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',
                        '   vec4  q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',
                        '   float d = q.x - min(q.w, q.y);',
                        '   float e = 1.0e-10;',
                        '   return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',
                        '}',
                        // Convert hue/saturation/vibrance to red/green/blue'
                        'vec3 hsvToRgb(vec3 c) {',
                        '   vec4  K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
                        '   vec3  p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
                        '   return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
                        '}',
                        '',
                        // Averaged pixel intensity from 3 color channels
                        'float avgIntensity(vec4 pix) {',
                        '   return (pix.r + pix.g + pix.b) / 3.0;',
                        '}',
                    ].join('\n')
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <color_fragment>',
                    [	'#include <color_fragment>',
                        // ---------- Adding Below ----------
                        // Cartoon RgbToHsv
                        'vec3 original_color = diffuseColor.rgb;',
                        'vec3 v_hsv = rgbToHsv(original_color.rgb);',
                        'float amt = 1.0 / (uBitDepth + 8.0);',
                        'float hueIncrease = 1.05;',
                        'float satIncrease = 1.10;',
                        'float vibIncrease = 1.75;',
                        'v_hsv.x = clamp(amt * (floor(v_hsv.x / amt) * hueIncrease), 0.0, 1.0);',
                        'v_hsv.y = clamp(amt * (floor(v_hsv.y / amt) * satIncrease), 0.0, 1.0);',
                        'v_hsv.z = clamp(amt * (floor(v_hsv.z / amt) * vibIncrease), 0.0, 1.0);',

                        // Check for Edge
                        '#ifdef USE_MAP',
                        '   vec2 coords = vUv;',
                        '   float dxtex = 1.0 / uTextureWidth;',
                        '   float dytex = 1.0 / uTextureHeight;',
                        '   float edge_thres  = 0.15;',
                        '   float edge_thres2 = uEdgeSize;',
                        '   float pix[9];',
                        '   int   k = -1;',
                        '   float delta;',
                            // Read neighboring pixel intensities
                        '   for (int i = -1; i < 2; i++) {',
                        '       for (int j = -1; j < 2; j++) {',
                        '           k++;',
                        '           vec2 sampleCoords = vec2(coords.x + (float(i) * dxtex), coords.y + (float(j) * dytex));',
                        '           vec4 texSample = texture2D(map, sampleCoords);',
                        '           pix[k] = avgIntensity(texSample);',
                        '       }',
                        '   }',
                            // Average color differences around neighboring pixels
                        '   delta = (abs(pix[1] - pix[7]) + abs(pix[5] - pix[3]) + abs(pix[0] - pix[8]) + abs(pix[2] - pix[6]) ) / 4.0;',
                        '   float edg = clamp(edge_thres2 * delta, 0.0, 1.0);',
                        '   vec3 v_rgb = (edg >= edge_thres) ? vec3(0.0) : hsvToRgb(v_hsv.xyz);',
                        '#else',
                        '   vec3 v_rgb = hsvToRgb(v_hsv.xyz);',
                        '#endif',

                        // Hsv Color
                        'diffuseColor.rgb = vec3(v_rgb.x, v_rgb.y, v_rgb.z);',

                        // Bit Depth
                        'float bit_depth = uBitDepth;',
                        'float bitR = floor(diffuseColor.r * bit_depth);',
                        'float bitG = floor(diffuseColor.g * bit_depth);',
                        'float bitB = floor(diffuseColor.b * bit_depth);',
                        'diffuseColor.rgb = vec3(bitR, bitG, bitB) / bit_depth;',
                    ].join('\n')
                );
            }

            // Premuliply / Premultiplied Alphas Shader Fix, replaces code from:
            // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/premultiplied_alpha_fragment.glsl.js
            //
            // Replaces     "gl_FragColor.rgb *= gl_FragColor.a;"
            // With         "gl_FragColor.rgba *= gl_FragColor.a;"
            //
            if (data.premultiplyAlpha && shader.fragmentShader) {
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <premultiplied_alpha_fragment>',
                    'gl_FragColor.rgba *= gl_FragColor.a;'
                );
            }
        };

        // Premuliply / Premultiplied Alphas Blend Equations
        if (data.premultiplyAlpha) {
            material.blending = THREE__namespace.CustomBlending;
            material.blendEquation = THREE__namespace.AddEquation;
            material.blendSrc = THREE__namespace.OneFactor;
            material.blendDst = THREE__namespace.OneMinusSrcAlphaFactor;
            material.blendEquationAlpha = THREE__namespace.AddEquation;
            material.blendSrcAlpha = THREE__namespace.OneFactor;
            material.blendDstAlpha = THREE__namespace.OneMinusSrcAlphaFactor;
        }

        // Needs Update
        material.needsUpdate = true;
        return material;
    }

    //////////////////// Schema

    Material.config = {
        schema: {

            style: [
                { type: 'select', default: 'standard', promode: true, select: [ 'asset', 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'shader', 'standard', 'toon' ] },
                { type: 'select', default: 'standard', select: [ 'basic', 'points', 'standard', 'toon' ] },
            ],

            ///// DIVIDER
            styleDivider: { type: 'divider' },
            /////

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
            // gradientMap: { type: 'image', if: { style: [ 'toon' ] } },

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

            ///// Standard Maps
            map: [
                { type: 'image', if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'standard', 'toon' ] } },
                { type: 'image', if: { style: [ 'points' ] } },
            ],

            matcap: { type: 'image', if: { style: [ 'matcap' ] } },

            ///// Surface Maps (see: https://market.pmnd.rs/material/stylized-crystal)
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

            ///// Light Maps
            aoMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
            // aoMapIntensity: { type: 'slider', promode: true, default: 1, min: 0, max: 100, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
            envMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
            // envMapIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'physical', 'standard' ] } },
            lightMap: { type: 'image', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
            // lightMapIntensity: { type: 'number', default: 1, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
            normalMap: { type: 'image', if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
            // normalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },

            ///// Front / Back / Double
            side: { type: 'select', default: 'FrontSide', select: sides, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },

            ////////// The following Material parameters are handled internally
            // transparent: { type: 'boolean', promode: true, default: true },
            // blending: { type: 'select', default: 'NormalBlending', select: blendingModes, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
            // alphaTest: { type: 'number', default: 0.05, min: 0, max: 1, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        },
        icon: ``,
        color: 'rgb(165, 243, 0)',
        dependencies: [ 'geometry' ],
    };

    ComponentManager.register('material', Material);

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// Component

    class Mesh {

        //
        //
        //          NEEDS WORK!!!!
        //
        //

        init(data) {
            // Reference to Backend
            this.backend = (data.isObject3D) ? data : new THREE__namespace.Object3D();
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

    /** /////////////////////////////////////////////////////////////////////////////////
    //
    // @description Onsight Engine
    // @about       Powerful, easy-to-use JavaScript video game and application creation engine.
    // @author      Stephens Nunnally <@stevinz>
    // @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
    // @source      https://github.com/onsightengine/onsight
    //
    ///////////////////////////////////////////////////////////////////////////////////*/

    ///// General

    const NAME = 'Onsight';
    const REVISION = '0.0.1';
    const BACKEND3D = 'THREE';

    ///// Project Types

    const ENTITY_TYPES = {
        Entity3D:       'Entity3D',
    };

    const SCENE_TYPES = {
        Scene3D:        'Scene3D',
    };

    const WORLD_TYPES = {
        World3D:        'World3D',
    };

    ///// Flags

    const ENTITY_FLAGS = {
        LOCKED:         'flagLocked',
        TEMP:           'flagTemp',
    };

    ///// App States

    const APP_STATES = {
        PLAYING:        'playing',
        PAUSED:         'paused',
        STOPPED:        'stopped',
    };

    ///// Single Import

    if (typeof window !== 'undefined') {
        if (window.__ONSIGHT__) {
            console.warn('Multiple instances of Onsight being imported');
        } else {
            window.__ONSIGHT__ = REVISION;
        }
    }

    exports.APP_STATES = APP_STATES;
    exports.App = App;
    exports.AssetManager = AssetManager;
    exports.BACKEND3D = BACKEND3D;
    exports.BasicLine = BasicLine;
    exports.BasicWireBox = BasicWireBox;
    exports.BasicWireframe = BasicWireframe;
    exports.CAMERA_SCALE = CAMERA_SCALE;
    exports.CAMERA_START_DISTANCE = CAMERA_START_DISTANCE$1;
    exports.CAMERA_START_HEIGHT = CAMERA_START_HEIGHT$1;
    exports.CameraUtils = CameraUtils;
    exports.CapsuleGeometry = CapsuleGeometry;
    exports.ColorEye = ColorEye;
    exports.ComponentManager = ComponentManager;
    exports.CylinderGeometry = CylinderGeometry;
    exports.DepthPass = DepthPass;
    exports.DepthShader = DepthShader;
    exports.ENTITY_FLAGS = ENTITY_FLAGS;
    exports.ENTITY_TYPES = ENTITY_TYPES;
    exports.Entity3D = Entity3D;
    exports.EntityPool = EntityPool;
    exports.EntityUtils = EntityUtils;
    exports.FatLine = FatLine;
    exports.FatWireBox = FatWireBox;
    exports.FatWireframe = FatWireframe;
    exports.GeometryUtils = GeometryUtils;
    exports.GpuPickerPass = GpuPickerPass;
    exports.HelperObject = HelperObject;
    exports.Maths = Maths;
    exports.NAME = NAME;
    exports.Object3D = Object3D;
    exports.ObjectUtils = ObjectUtils;
    exports.OutlinePass = OutlinePass;
    exports.PrismGeometry = PrismGeometry;
    exports.Project = Project;
    exports.REVISION = REVISION;
    exports.RenderUtils = RenderUtils;
    exports.SCENE_TYPES = SCENE_TYPES;
    exports.SVGBuilder = SVGBuilder;
    exports.Scene3D = Scene3D;
    exports.SkyObject = SkyObject;
    exports.Strings = Strings;
    exports.System = System;
    exports.TexturedShader = TexturedShader;
    exports.Vectors = Vectors;
    exports.WORLD_TYPES = WORLD_TYPES;
    exports.WireframePass = WireframePass;
    exports.World3D = World3D;
    exports.XRayShader = XRayShader;

}));
//# sourceMappingURL=onsight.umd.cjs.map
