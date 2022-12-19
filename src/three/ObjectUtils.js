/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Object3D Utility Functions
//      allowSelection              Check if object should be allowed to be interacted with in Editor
//      checkTransforms             Compares array of objects to see if transforms are all the same
//      clearObject                 Completely deletes object (including geomtries/materials), and all of it's children
//      clearMaterial               Disposes of a material
//      computeBounds               Finds bounding box of an object or array of objects
//      computeCenter               Finds center point of an object or array of objects
//      containsObject              Checks array to see if it has an object (by Object3D.uuid)
//      copyLocalTransform          Copies local transform from one object to another
//      copyWorldTransform          Copies world transform from one object to another
//      countGeometry               Counts total geometris in an object or array of objects
//      flattenGroup                Puts an object's children into parent, deletes original containing object
//      resetTransform              Normalize / zero / reset object 3D transform
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { MathUtils } from '../math/MathUtils.js';
import { System } from '../sys/System.js';

///// Local Variables

const _boxCenter = new THREE.Box3();
const _tempMatrix = new THREE.Matrix4();
const _tempVector = new THREE.Vector3();
const _startQuaternion = new THREE.Quaternion();
const _tempQuaternion = new THREE.Quaternion();
const _testQuaternion = new THREE.Quaternion();

const _objPosition = new THREE.Vector3();
const _objQuaternion = new THREE.Quaternion();
const _objRotation = new THREE.Euler();
const _objScale = new THREE.Vector3();

///// Class

class ObjectUtils {

    /** Check if object should be allowed to be interacted with in Editor */
    static allowSelection(object) {
        let allowSelect = true;
        if (object.userData) {
            if (object.userData.flagIgnore) allowSelect = false;
            if (object.userData.flagLocked) allowSelect = false;
        }
        return allowSelect;
    }

    /** Compares array of objects to see if transforms are all the same */
    static checkTransforms(array) {
        if (array.length <= 1) return true;
        array[0].getWorldQuaternion(_startQuaternion);
        for (let i = 1; i < array.length; i++) {
            array[i].getWorldQuaternion(_testQuaternion);
            if (MathUtils.fuzzyQuaternion(_startQuaternion, _testQuaternion) === false) return false;
        }
        return true;
    }

    /** Completely deletes 'object' (including geomtries and materials), and all of it's children */
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

    /** Disposes of a material */
    static clearMaterial(materials) {
        if (System.isIterable(materials) !== true) materials = [ materials ];
        for (let i = 0, il = materials.length; i < il; i++) {
            const material = materials[i];
            Object.keys(material).forEach((prop) => { /* in case of map, bumpMap, normalMap, envMap, etc. */
                if (! material[prop]) return;
                if (typeof material[prop].dispose === 'function') material[prop].dispose();
            });
            if (material.dispose) material.dispose();
        }
    }

    /** Finds bounding box of an object or array of objects  (recursively adding children meshes) */
    static computeBounds(groupOrArray, targetBox, checkIfSingleGeometry = false) {
        if (targetBox === undefined || targetBox.isBox3 !== true) targetBox = new THREE.Box3();
        const objects = (System.isIterable(groupOrArray)) ? groupOrArray : [ groupOrArray ];
        targetBox.makeEmpty();

        // If object contains single geometry, we might want un-rotated box
        if (checkIfSingleGeometry && ObjectUtils.countGeometry(groupOrArray) === 1) {
            let geomObject = undefined;
            objects.forEach((object) => {
                object.traverse((child) => {
                    if (child.geometry) geomObject = child;
                });
            });

            // Use unrotated geometry for box
            if (geomObject && geomObject.geometry) {
                geomObject.geometry.computeBoundingBox();
                targetBox.copy(geomObject.geometry.boundingBox);
                geomObject.matrixWorld.decompose(_objPosition, _objQuaternion, _objScale);
                _objQuaternion.identity();
                _tempMatrix.compose(_objPosition, _objQuaternion, _objScale);
                targetBox.applyMatrix4(_tempMatrix);
                return targetBox;
            }
        }

        // Expand from geometries
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
        source.updateWorldMatrix(true, false);
        source.matrixWorld.decompose(target.position, _tempQuaternion, target.scale);
        target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
        target.quaternion.setFromEuler(target.rotation, false);
        if (updateMatrix) target.updateMatrix();
    }

    /** Counts total geometries in an object or array of objects */
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

}

export { ObjectUtils };