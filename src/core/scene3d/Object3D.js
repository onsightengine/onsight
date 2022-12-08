/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { ObjectUtils } from '../../three/ObjectUtils.js';

///// Local Variables

const _m1 = new THREE.Matrix4();
const _camPosition = new THREE.Vector3();
const _camQuaternion = new THREE.Quaternion();
const _camScale = new THREE.Vector3();
const _lookQuaternion = new THREE.Quaternion();
const _lookUpVector = new THREE.Vector3();
const _objPosition = new THREE.Vector3();
const _objScale = new THREE.Vector3();
const _objQuaternion = new THREE.Quaternion();
const _parentQuaternion = new THREE.Quaternion();
const _parentQuaternionInv = new THREE.Quaternion();
const _rotationDirection = new THREE.Euler();
const _rotationQuaternion = new THREE.Quaternion();
const _worldPosition = new THREE.Vector3();
const _worldQuaternion = new THREE.Quaternion();
const _worldScale = new THREE.Vector3();
const _worldRotation = new THREE.Euler();

/////////////////////////////////////////////////////////////////////////////////////
/////   Object3D.constructor() Overload
/////////////////////////////////////////////////////////////////////////////////////

class Object3D extends THREE.Object3D {

    constructor() {
        super();

        this.isObject3DOverload = true;

        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();

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

    clone(recursive) {
		return new this.constructor().copy(this, recursive);
	}

    copy(source, recursive = true) {
        // Base three.js Object3D.copy()
        super.copy(source, false /* recursive */);

        // Override copy transform, apply new updateMAtrix()
        ObjectUtils.copyLocalTransform(source, this, false /* updateMatrix */);
        this.lookAtCamera = source.lookAtCamera;
        this.updateMatrix();

        // Copy Children
        if (recursive === true) {
			for (let i = 0; i < source.children.length; i++) {
                const clone = source.children[i].clone()
				this.add(clone);
			}
		}

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
        this.matrixWorld.decompose(_objPosition, targetQuaternion, _objScale);
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
            //     // // OPTION 1: Look at Camera
            //     _lookUpVector.copy(camera.up).applyQuaternion(_camQuaternion);  // Rotate up vector by cam rotation
            //     _m1.lookAt(_camPosition, _worldPosition, _lookUpVector);        // Create look at matrix
            //     _lookQuaternion.setFromRotationMatrix(_m1);
            //
            //     // // OPTION 2: Only 'Y' Axis
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

export { Object3D };
