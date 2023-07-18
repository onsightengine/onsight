/**
 * @description Onsight Editor
 * @about       Easy to use 2D / 3D JavaScript game engine.
 * @author      Written by Stephens Nunnally <@stevinz>
 * @license     None - Copyright (C) 2021-2023 Scidian Studios - All Rights Reserved
 *              Unauthorized Copying of these Files, via Any Medium is Strictly Prohibited
 *              Proprietary and Confidential, No Public License
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the 'up' direction of camera.up (+Y by default).
//
// Orbit - left mouse / touch: one-finger move
// Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
// Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
//
// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/interactive/OrbitControls.js

import * as THREE from 'three';
import * as ONE from 'onsight';
import * as VIEWPORT from 'viewport';

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
}

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class OrbitControls extends THREE.EventDispatcher {

    constructor(camera, domElement, target) {
        super();
        const self = this;

        if (domElement == undefined) console.warn('OrbitControls: The second parameter "domElement" is now mandatory.');
        if (domElement === document) console.error('OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');

        this.camera = camera;
        this.domElement = domElement;
        this.domElement.style.touchAction = 'none';     // Disable touch scroll

        // True when animating to new position
        this.animating = ORBIT_ANIMATION.NONE;			// When larger than 0, we are animating
        this.forceEndAnimation = false;					// Set to true to have update end animation early

        // Set to false to disable this control
        this.enabled = true;

        // Set to true to enable 'Zoom' signal dispatch
        this.signals = false;

        // The Vector3 position to orbit around
        this.target = new THREE.Vector3();
        if (target && target.isObject3D) {
            target.getWorldPosition(this.target);
        } else {
            this.target.set(0, 0, 0);
        }

        // Zoom / Dolly
        this.minDistance = 0.2;                         // Zoom in,  PerspectiveCamera only
        this.maxDistance = 250;                         // Zoom out, PerspectiveCamera only
        this.minZoom = 0.021;                           // Zoom out, OrthographicCamera only
        this.maxZoom = 25.0;                            // Zoom in,  OrthographicCamera only

        // How far you can orbit vertically
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; 						// In radians, range is 0 to Math.PI
        this.maxPolarAngle = Math.PI;					// In radians, range is 0 to Math.PI

        // How far you can orbit horizontally
        // 		If set, the interval [min, max] must
        // 		be a sub-interval of [- 2 PI, 2 PI],
        // 		with ( max - min < 2 PI )
        this.minAzimuthAngle = - Infinity; 				// In radians
        this.maxAzimuthAngle =   Infinity; 				// In radians

        // Movement Lerping
        this.enableSmooth = true;						// If enabled, overrides 'enableDamping'
        this.dampSmooth = 15;			                // Higher is faster / tighter, lower is slower / smoother

        // Movement Damping
        this.enableDamping = true;						// If enabled, must call controls.update() in animation loop
        this.dampingFactor = 0.2;						// Higher is faster / tighter, lower is slower / smoother

        // Zoom / Dolly
        this.enableZoom = true;							// Set to false to disable zooming
        this.zoomSpeed = 1.0;							// Zoom speed

        // Rotate
        this.enableRotate = true;						// Set to false to disable rotating
        this.rotateSpeed = 1.0;							// Rotate speed

        // Panning
        this.enablePan = true;							// Set to false to disable panning
        this.panSpeed = 1.0;							// Pan speed
        this.screenSpacePanning = true; 				// If false, pan orthogonal to world-space direction camera.up
        this.keyPanSpeed = 20.0;						// Pixels moved per arrow key push

        // Auto Rotate
        this.autoRotate = false;						// If true, must call controls.update() in animation loop
        this.autoRotateSpeed = 2.0; 					// Speed of 2.0 is 30 seconds per orbit when fps is 60

        /***** LOCALS *****/

        let state = ORBIT_STATES.NONE;

        // Current position in spherical coordinates
        const spherical = new THREE.Spherical();
        const sphericalDelta = new THREE.Spherical();

        let scale = 1;
        const panOffset = new THREE.Vector3();
        let zoomChanged = false;

        let lastDelta = 0;

        const rotateStart = new THREE.Vector2();
        const rotateEnd = new THREE.Vector2();
        const rotateDelta = new THREE.Vector2();

        const panStart = new THREE.Vector2();
        const panEnd = new THREE.Vector2();
        const panDelta = new THREE.Vector2();

        const dollyStart = new THREE.Vector2();
        const dollyEnd = new THREE.Vector2();
        const dollyDelta = new THREE.Vector2();
        const dollyPosition = new THREE.Vector3();

        const pointers = [];
        const pointerPositions = {};

        const newPosition = new THREE.Vector3();
        const newTarget = new THREE.Vector3();
        let newZoom = 0;

        const tempBox = new THREE.Box3();
        const tempDelta = new THREE.Vector3();
        const tempSphere = new THREE.Sphere();
        const tempVector = new THREE.Vector3();

        // The four arrow keys
        this.keys = {
            LEFT: 'ArrowLeft',
            UP: 'ArrowUp',
            RIGHT: 'ArrowRight',
            BOTTOM: 'ArrowDown'
        };

        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.camera.position.clone();
        this.zoom0 = this.camera.zoom;

        // Target dom element for key events
        this._domElementKeyEvents = null;

        /***** METHODS *****/

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

            // reset camera position / target / zoom
            newPosition.copy(this.position0);
            newTarget.copy(this.target0);
            newZoom = this.zoom0;

            // start animation
            this.animating = ORBIT_ANIMATION.START;
        };

        /***** ADDED BY STEVINZ *****/

        this.changeCamera = function(newCamera) {
            // If animating, need to stop animation
            if (self.animating !== ORBIT_ANIMATION.NONE) {
                self.forceEndAnimation = true;
                self.update();
            }

            // Set new camera
            self.camera = newCamera;
        }

        /** Recenter the camera to orbit target, maintains current zoom and rotation */
        this.centerOnTarget = function(target) {
            if (state !== ORBIT_STATES.NONE) return;

            // Update camera position (add in difference between new target and current target)
            newPosition.copy(this.camera.position).add(target.position).sub(this.target);

            // New camera target
            newTarget.copy(target.position);

            // New zoom same as old zoom
            newZoom = this.camera.zoom;

            // Start animation
            this.animating = ORBIT_ANIMATION.START;
        };

        /** Recenter the camera to orbit target, zoom to match target's size */
        this.focusOnTarget = function(target) {
            if (state !== ORBIT_STATES.NONE) return;

            const boundingBox = new THREE.Box3();

            // Custom 'boundingBox.expandByObject' (to ignore Object3D with 'flagIgnore')
            target.traverse((child) => {
                if (child.userData && child.userData.flagIgnore) return;

                const geometry = child.geometry;
                if (!geometry || !geometry.isBufferGeometry) return;
                if (!geometry.boundingBox) geometry.computeBoundingBox();

                child.updateWorldMatrix(false, false);
                tempBox.copy(geometry.boundingBox).applyMatrix4(child.matrixWorld);
                boundingBox.union(tempBox);
            });

            // Calculate desired distance based on target's size
            let distance = 0.1;
            if (boundingBox.isEmpty() === false) {
                boundingBox.getBoundingSphere(tempSphere);
                distance = tempSphere.radius;
                distance = Math.pow(distance, 0.7); /* equalize large / small Object3Ds */
            }
            distance *= 7; /* zoom out */

            // Use distance to calculate new desired camera location
            tempDelta.set(0, 0, distance);
            tempDelta.applyQuaternion(this.camera.quaternion);
            newPosition.copy(target.position).add(tempDelta);

            // New camera target
            newTarget.copy(target.position);

            // For orthographic camera set camera zoom to match perspective distance
            let originalDistance = this.position0.distanceTo(this.target0);
            let newDistance = newPosition.distanceTo(target.position);
            newZoom = (this.camera.isOrthographicCamera) ? (originalDistance / newDistance) : this.camera.zoom;

            // Start animation
            this.animating = ORBIT_ANIMATION.START;
        };

        /** Returns zoom of camera */
        this.getCameraZoom = function(optionalTarget = undefined) {
            const originalDistance = this.position0.distanceTo(this.target0);
            const newDistance = this.distanceToTarget(optionalTarget);
            return (originalDistance / newDistance);
        }

        this.distanceToTarget = function(optionalTarget = undefined) {
            if (optionalTarget && optionalTarget.isObject3D) optionalTarget = optionalTarget.position;
            return this.camera.position.distanceTo(optionalTarget ?? this.target);
        }

        this.applyRotation = function(angle) {
            rotateLeft(angle);
        }

        /***** UPDATE *****/

        this.update = function(deltaTime) {

            // To track current camera position relative to Origin Point
            const offset = new THREE.Vector3();

            // So camera.up is the orbit axis
            const quat = new THREE.Quaternion().setFromUnitVectors(self.camera.up, new THREE.Vector3(0, 1, 0));
            const quatInverse = quat.clone().invert();

            const lastPosition = new THREE.Vector3();
            const lastQuaternion = new THREE.Quaternion();
            const twoPI = 2 * Math.PI;

            function getAutoRotationAngle() {
                return 2 * Math.PI / 60 / 60 * self.autoRotateSpeed;
            }

            return function update(deltaTime) {

                // Disabled, don't perform update
                if (self.enabled === false) return false;

                // Verify 'deltaTime' provided
                if (!deltaTime) deltaTime = lastDelta;
                lastDelta = deltaTime;

                // ANIMATING

                // Animating to new focus target
                let endAnimation = false;
                if (self.animating !== ORBIT_ANIMATION.NONE) {

                    // Check if user input or dolly happened, if so, end animation
                    if ((state !== ORBIT_STATES.NONE) || zoomChanged) {
                        self.forceEndAnimation = true;
                    }

                    let lambda, dt;

                    // Damping for Mouse Wheel Zoom
                    if (self.animating === ORBIT_ANIMATION.ZOOMING) {
                        lambda = self.dampSmooth / 2;
                        dt = deltaTime * 2;
                    } else {
                        lambda = self.dampSmooth;
                        dt = deltaTime;
                    }

                    // // #OPTION: Damp
                    self.camera.position.x = ONE.Maths.damp(self.camera.position.x, newPosition.x, lambda, dt);
                    self.camera.position.y = ONE.Maths.damp(self.camera.position.y, newPosition.y, lambda, dt);
                    self.camera.position.z = ONE.Maths.damp(self.camera.position.z, newPosition.z, lambda, dt);
                    self.target.x = ONE.Maths.damp(self.target.x, newTarget.x, lambda, dt);
                    self.target.y = ONE.Maths.damp(self.target.y, newTarget.y, lambda, dt);
                    self.target.z = ONE.Maths.damp(self.target.z, newTarget.z, lambda, dt);
                    self.camera.zoom = ONE.Maths.damp(self.camera.zoom, newZoom, lambda, dt);

                    // // #OPTION: Lerp
                    // self.camera.position.lerp(newPosition, dt * lambda);
                    // self.target.lerp(newTarget, dt * lambda);
                    // self.camera.zoom = ONE.Maths.lerp(newZoom, dt * lambda);

                    // End Animation?
                    let donePosition = ONE.Maths.fuzzyVector(self.camera.position, newPosition, 0.001);
                    let doneZooming = ONE.Maths.fuzzyFloat(self.camera.zoom, newZoom, 0.001);
                    endAnimation = (donePosition && doneZooming) || self.forceEndAnimation;

                    // Sync new positions
                    if (endAnimation) {
                        self.camera.position.copy(newPosition);
                        self.target.copy(newTarget);
                        self.camera.zoom = newZoom;
                    }

                    // Update camera
                    self.camera.updateWorldMatrix(true);
                    self.camera.updateProjectionMatrix(self.target);
                    self.camera.lookAt(self.target);

                    // End animation, mark as done
                    if (endAnimation) {
                        if (self.animating === ORBIT_ANIMATION.ZOOMING) zoomChanged = true;
                        self.animating = ORBIT_ANIMATION.NONE;
                        self.forceEndAnimation = false;
                    }

                    // Dispatch change event during animation
                    self.dispatchEvent(_changeEvent);
                }

                // INFO BOX

                if (this.signals && window.signals) {
                    if (zoomChanged) {
                        signals.showInfo.dispatch(`${(this.getCameraZoom() * 100).toFixed(0)}%`);
                    } else if (self.animating !== ORBIT_ANIMATION.NONE) {
                        signals.showInfo.dispatch(`${(this.getCameraZoom(newTarget) * 100).toFixed(0)}%`);
                    }
                }

                //

                // Get Position and Rotation
                const position = self.camera.position;
                offset.copy(position).sub(self.target);
                offset.applyQuaternion(quat);						// Rotate offset to 'y-axis-is-up' space
                spherical.setFromVector3(offset);					// Angle from z-axis around y-axis

                // Auto Rotation
                if (self.autoRotate && state === ORBIT_STATES.NONE) {
                    rotateLeft(getAutoRotationAngle());
                }

                // Smooth Enabled
                if (self.enableSmooth) {
                    // Lerp towards new Spherical
                    let targetTheta = spherical.theta + sphericalDelta.theta;
                    let targetPhi = spherical.phi + sphericalDelta.phi;
                    let dampTheta = ONE.Maths.damp(spherical.theta, targetTheta, self.dampSmooth, deltaTime);
                    let dampPhi = ONE.Maths.damp(spherical.phi, targetPhi, self.dampSmooth, deltaTime);

                    // Make sure numbers are legit
                    if (Number.isNaN(dampTheta)) dampTheta = spherical.theta;
                    if (Number.isNaN(dampPhi)) dampPhi = spherical.phi;

                    // Subtract distance moved from distance still needed
                    sphericalDelta.theta -= (dampTheta - spherical.theta);
                    sphericalDelta.phi -= (dampPhi - spherical.phi);
                    spherical.theta = dampTheta;
                    spherical.phi = dampPhi;

                    // Lerp towards new Pan
                    let targetX = self.target.x + panOffset.x;
                    let targetY = self.target.y + panOffset.y;
                    let targetZ = self.target.z + panOffset.z;
                    let dampX = ONE.Maths.damp(self.target.x, targetX, self.dampSmooth * 2, deltaTime);
                    let dampY = ONE.Maths.damp(self.target.y, targetY, self.dampSmooth * 2, deltaTime);
                    let dampZ = ONE.Maths.damp(self.target.z, targetZ, self.dampSmooth * 2, deltaTime);

                    // Make sure numbers are legit
                    if (Number.isNaN(dampX)) dampX = self.target.x;
                    if (Number.isNaN(dampY)) dampY = self.target.y;
                    if (Number.isNaN(dampZ)) dampZ = self.target.z;

                    // Subtract distance moved from distance still needed
                    panOffset.x -= (dampX - self.target.x);
                    panOffset.y -= (dampY - self.target.y);
                    panOffset.z -= (dampZ - self.target.z);
                    self.target.x = dampX;
                    self.target.y = dampY;
                    self.target.z = dampZ;

                // Dampen Enabled
                } else if (self.enableDamping) {
                    spherical.theta += sphericalDelta.theta * self.dampingFactor;
                    spherical.phi += sphericalDelta.phi * self.dampingFactor;

                    sphericalDelta.theta *= (1 - self.dampingFactor);
                    sphericalDelta.phi *= (1 - self.dampingFactor);

                    self.target.addScaledVector(panOffset, self.dampingFactor);
                    panOffset.multiplyScalar(1 - self.dampingFactor);

                // No Smooth, No Dampen
                } else {
                    spherical.theta += sphericalDelta.theta;
                    spherical.phi += sphericalDelta.phi;
                    sphericalDelta.set(0, 0, 0);

                    self.target.add(panOffset);
                    panOffset.set(0, 0, 0);
                }

                // Restrict theta to be between desired limits
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

                // Restrict phi and radius to be between desired limits
                spherical.phi = Math.max(self.minPolarAngle, Math.min(self.maxPolarAngle, spherical.phi));
                spherical.makeSafe();
                spherical.radius *= scale;
                spherical.radius = Math.max(self.minDistance, Math.min(self.maxDistance, spherical.radius));

                // Apply new Position, use lookAt for Rotation
                offset.setFromSpherical(spherical);
                offset.applyQuaternion(quatInverse);				// Rotate back to 'camera-up-vector-is-up'
                position.copy(self.target).add(offset);
                self.camera.lookAt(self.target);

                scale = 1;

                // Performed significant update, condition is one of following:
                //		- Zoom changed
                //		- Camera position changed
                //		- Camera rotation changed (using small-angle approximation cos(x/2) = 1 - x^2 / 8)
                //
                if (zoomChanged ||
                    lastPosition.distanceToSquared(self.camera.position) > 0.001 ||
                    8 * (1 - lastQuaternion.dot(self.camera.quaternion)) > 0.001) {

                    self.dispatchEvent(_changeEvent);
                    lastPosition.copy(self.camera.position);
                    lastQuaternion.copy(self.camera.quaternion);
                    zoomChanged = false;

                    return true;
                }

                // Did not perform significant update
                return false;
            };

        }();

        /***** DISPOSE *****/

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

        /***** ROTATE *****/

        function rotateLeft(angle) {
            sphericalDelta.theta -= angle;
        }

        function rotateUp(angle) {
            sphericalDelta.phi -= angle;
        }

        /***** PAN *****/

        const panLeft = function() {
            const v = new THREE.Vector3();

            return function panLeft(distance, cameraMatrix) {
                v.setFromMatrixColumn(cameraMatrix, 0); /* get X column of cameraMatrix */
                v.multiplyScalar(- distance);
                panOffset.add(v);
            };
        }();

        const panUp = function() {
            const v = new THREE.Vector3();

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

        // deltaX and deltaY are in pixels; right and down are positive
        const pan = function() {
            const offset = new THREE.Vector3();

            return function pan(deltaX, deltaY) {
                const element = self.domElement;

                if (self.camera.isPerspectiveCamera || self.camera.isOrthographicCamera) {
                    const position = self.camera.position;
                    offset.copy(position).sub(self.target);
                    let targetDistance = offset.length();

                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan((self.camera.fov / 2) * Math.PI / 180.0);

                    // we use only clientHeight here so aspect ratio does not distort speed
                    panLeft(2 * deltaX * targetDistance / element.clientHeight, self.camera.matrix);
                    panUp(2 * deltaY * targetDistance / element.clientHeight, self.camera.matrix);

                } else {
                    console.warn('OrbitControls.pan: Unknown camera type, pan disabled');
                    self.enablePan = false;
                }
            };
        }();

        /***** DOLLY / ZOOM *****/

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

        function wheelScale(dollyScale, direction = 1 /* 1 === in, -1 === out */) {
            if (state !== ORBIT_STATES.NONE) return;

            // Target (Keep Same)
            newTarget.copy(self.target);

            // Position / Zoom
            if (self.camera.isPerspectiveCamera || self.camera.isOrthographicCamera) {
                if (self.animating === ORBIT_ANIMATION.NONE) {
                    dollyPosition.copy(self.camera.position);
                } else {
                    dollyPosition.copy(newPosition);
                }

                // Position
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

                // Zoom
                newZoom = self.camera.zoom;
            }

            // Sanity Check
            if (isNaN(newPosition.x) || !isFinite(newPosition.x)) newPosition.x = 0;
            if (isNaN(newPosition.y) || !isFinite(newPosition.y)) newPosition.y = 0;
            if (isNaN(newPosition.z) || !isFinite(newPosition.z)) newPosition.z = 5;
            if (isNaN(newZoom) || !isFinite(newZoom)) newZoom = 1;

            // Start Animation
            self.animating = ORBIT_ANIMATION.ZOOMING;
        }

        /***** EVENTS *****/

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

            rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); 	// yes, height
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
                // // OPTION: Have orbit controls pan on arrow key
                // case self.keys.UP: 		pan(0,   self.keyPanSpeed); needsUpdate = true; break;
                // case self.keys.BOTTOM:	pan(0, - self.keyPanSpeed);	needsUpdate = true; break;
                // case self.keys.LEFT:		pan(  self.keyPanSpeed, 0);	needsUpdate = true;	break;
                // case self.keys.RIGHT:	pan(- self.keyPanSpeed, 0);	needsUpdate = true;	break;
            }

            if (needsUpdate) {
                // prevent the browser from scrolling on cursor keys
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
            rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); 	// yes, height
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

        /***** EVENT HANDLERS *****/

        function onPointerDown(event) {
            // Make sure we are enabled
            if (self.enabled === false) return;

            // Make sure we have focus
            if (!document.activeElement.contains(self.domElement)) return;

            // If animating, need to stop animation
            if (self.animating !== ORBIT_ANIMATION.NONE) {
                self.forceEndAnimation = true;
                self.update();
            }

            // No active pointers being processed, capture mouse and add move / up handlers
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
            let mouseAction = THREE.MOUSE.ROTATE;

            // Editor Viewport?
            if (editor && editor.viewport.hasFocus()) {
                if (event.button === 0 /* left */ && !self.spaceKey) {
                    switch (editor.viewport.mouseMode) {
                        case VIEWPORT.MOUSE_MODES.SELECT:	mouseAction = THREE.MOUSE.PAN; break;
                        case VIEWPORT.MOUSE_MODES.LOOK:		mouseAction = THREE.MOUSE.ROTATE; break;
                        case VIEWPORT.MOUSE_MODES.MOVE:		mouseAction = THREE.MOUSE.PAN; break;
                        case VIEWPORT.MOUSE_MODES.ZOOM:		mouseAction = THREE.MOUSE.DOLLY; break;
                        default: mouseAction = -1;
                    }

                } else if (event.button === 2 /* right */ || (event.button === 0 && self.spaceKey)) {
                    if (self.camera.isOrthographicCamera) {
                        if (editor.viewport.mouseMode === VIEWPORT.MOUSE_MODES.MOVE) {
                            mouseAction = (self.spaceKey) ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
                        } else {
                            mouseAction = (self.spaceKey) ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
                        }

                    } else {
                        if (editor.viewport.mouseMode === VIEWPORT.MOUSE_MODES.LOOK) {
                            mouseAction = (self.spaceKey) ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
                        } else {
                            mouseAction = (self.spaceKey) ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
                        }

                        if (self.camera.rotateLock) mouseAction = THREE.MOUSE.PAN;
                    }
                } else {
                    mouseAction = -1;
                }

            // Not Viewport
            } else {
                if (event.button === 0) {
                    mouseAction = THREE.MOUSE.PAN;
                } else if (event.button === 2) {
                    mouseAction = THREE.MOUSE.ROTATE
                } else {
                    mouseAction = -1;
                }
            }

            switch (mouseAction) {
                case THREE.MOUSE.DOLLY:
                    if (self.enableZoom === false) return;
                    handleMouseDownDolly(event);
                    state = ORBIT_STATES.DOLLY;
                    break;

                case THREE.MOUSE.ROTATE:
                    if (self.enableRotate === false) return;
                    if (self.camera.rotateLock === true) return;
                    handleMouseDownRotate(event);
                    state = ORBIT_STATES.ROTATE;
                    break;

                case THREE.MOUSE.PAN:
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
                // One finger, rotate
                case 1:
                    if (self.enableRotate === false) return;
                    if (self.camera.rotateLock === true) return;
                    handleTouchStartRotate();
                    state = ORBIT_STATES.TOUCH_ROTATE;
                    break;

                // Two finger pan
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
                position = new THREE.Vector2();
                pointerPositions[event.pointerId] = position;
            }
            position.set(event.pageX, event.pageY);
        }

        function getSecondPointerPosition(event) {
            const pointer = (event.pointerId === pointers[0].pointerId ) ? pointers[1] : pointers[0];
            return pointerPositions[pointer.pointerId];
        }


        // Event Listeners
        this.domElement.addEventListener('contextmenu', onContextMenu);
        this.domElement.addEventListener('pointerdown', onPointerDown);
        this.domElement.addEventListener('pointercancel', onPointerCancel);
        this.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

        // Force Update Upon Creation
        this.update();

    } // end ctor

}

export { OrbitControls, ORBIT_STATES };
