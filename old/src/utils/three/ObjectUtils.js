import * as THREE from 'three';
import { Maths } from '../Maths.js';
import { Vectors } from '../Vectors.js';

// childByProperty()        Retrieves a child by property
// clearObject()            Completely deletes object (including geomtries/materials), and all of it's children
// clearMaterial()          Disposes of a material
// compareQuaternions()     Compares objects to see if quaternions are all the same
// computeBounds()          Finds bounding box of an object or array of objects
// computeCenter()          Finds center point of an object or array of objects
// containsObject()         Checks array to see if it has an object (by Object3D.uuid)
// copyTransform()          Copies transform from one object to another
// copyWorldTransform()     Copies world transform from one object to another
// countGeometry()          Counts total geometris in an object or array of objects
// flattenGroup()           Puts an object's children into parent, deletes original containing object
// resetTransform()         Normalize / zero / reset object 3D transform
// uuidArray()              Converts object array to UUID array

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
const _tempBounds = new THREE.Box3();
const _tempScale = new THREE.Vector3();

class ObjectUtils {

    /** Retrieves a child by property */
    static childByProperty(object, property, value) {
        for (const child of object.children) {
            if (child[property] === value) return child;
        }
    }

    /** Completely deletes 'object' (including geomtries and materials), and all of it's children */
    static clearObject(object, removeFromParent = true) {
        if (!object || !object.isObject3D) return;

        if (object.geometry && typeof object.geometry.dispose === 'function') object.geometry.dispose();
        if (object.material) ObjectUtils.clearMaterial(object.material);
        if (object.dispose && typeof object.dispose === 'function') object.dispose();

        while (object.children.length > 0) {
            ObjectUtils.clearObject(object.children[0], true /* removeFromParent */);
        }

        ObjectUtils.resetTransform(object);
        if (removeFromParent) object.removeFromParent();
        object = null;
    }

    /** Disposes of a material */
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

    /** Compares array of objects to see if quaternions are all the same */
    static compareQuaternions(objects) {
        objects = Array.isArray(objects) ? objects : [...arguments];
        objects[0].getWorldQuaternion(_startQuaternion);
        for (let i = 1; i < objects.length; i++) {
            objects[i].getWorldQuaternion(_testQuaternion);
            if (Maths.fuzzyQuaternion(_startQuaternion, _testQuaternion) === false) return false;
        }
        return true;
    }

    /** Finds bounding box of an object or array of objects (recursively adding children meshes) */
    static computeBounds(objects, targetBox, checkIfSingleGeometry = false) {
        if (!targetBox || targetBox.isBox3 !== true) targetBox = new THREE.Box3();
        targetBox.makeEmpty();
        objects = Array.isArray(objects) ? objects : [ objects ];

        // If object contains single geometry, we might want un-rotated box
        if (checkIfSingleGeometry && ObjectUtils.countGeometry(objects) === 1) {
            let geomObject = undefined;
            for (const object of objects) {
                object.traverse((child) => {
                    if (child.geometry) geomObject = child;
                });
            }

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
        for (const object of objects) {
            targetBox.expandByObject(object);
        }
        return targetBox;
    }

    /** Finds center point of an object or array of objects (recursively adding children meshes) */
    static computeCenter(objects, targetVec3) {
        objects = Array.isArray(objects) ? objects : [ objects ];

        // Get Bounds
        ObjectUtils.computeBounds(objects, _boxCenter);

        // If still empty, no geometries were found, use object locations
        if (_boxCenter.isEmpty()) {
            for (const object of objects) {
                object.getWorldPosition(_tempVector);
                _boxCenter.expandByPoint(_tempVector);
            }
        }

        _boxCenter.getCenter(targetVec3);
        return targetVec3;
    }

    /** Checks array to see if it has an object (by Object3D.uuid) */
    static containsObject(objectArray, object) {
        if (object && object.uuid && Array.isArray(objectArray)) {
            for (const arrayObject of objectArray) {
                if (arrayObject.uuid && arrayObject.uuid === object.uuid) return true;
            }
        }
        return false;
    }

    /** Copies transform from one object to another */
    static copyTransform(source, target) {
        target.position.copy(source.position);
        target.rotation.order = source.rotation.order;
        target.quaternion.copy(source.quaternion);
        target.scale.copy(source.scale);
        target.matrix.copy(source.matrix);
        target.matrixWorld.copy(source.matrixWorld);
    }

    /** Copies world transform from one object to another */
    static copyWorldTransform(source, target, updateMatrix = true) {
        source.updateWorldMatrix(true, false);
        source.matrixWorld.decompose(target.position, _tempQuaternion, target.scale);
        Vectors.sanity(_tempQuaternion);
        target.rotation.setFromQuaternion(_tempQuaternion, undefined, false);
        target.quaternion.setFromEuler(target.rotation, false);
        if (updateMatrix) {
            target.updateMatrix();
            target.updateMatrixWorld(true /* force */);
        }
    }

    /** Counts total geometries in an object or array of objects */
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

    /** Puts 'group' (object with children) children back into parent (usually a scene), deletes 'group' */
    static flattenGroup(group) {
        if (!group) return;
        if (!group.parent) return;
        while (group.children) group.parent.attach(group.children[0]);
        ObjectUtils.clearObject(group, true);
    }

    /** Calculate identity size (scale 1, 1, 1), stores result in 'target' (THREE.Vector3) */
    static identityBoundsCalculate(object, target) {
        target = target ?? new THREE.Vector3();
        _tempScale.copy(object.scale);
        object.scale.set(1, 1, 1);
        object.updateMatrixWorld(true /* force */);
        ONE.ObjectUtils.computeBounds(object, _tempBounds, true /* checkForSingleGeometry */);
        _tempBounds.getSize(target);
        object.scale.copy(_tempScale);
        object.updateMatrixWorld(true /* force */);
        return target;
    }

    /** Normalize / zero / reset object 3D transform */
    static resetTransform(object) {
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.quaternion.set(0, 0, 0, 1);
        object.scale.set(1, 1, 1);
        object.updateMatrix();
        object.updateMatrixWorld(true /* force */);
    }

    /** Converts object array to UUID array */
    static uuidArray(objects) {
        objects = Array.isArray(objects) ? objects : [...arguments];
        const uuids = [];
        for (const object of objects) {
            if (typeof object === 'object' && object.uuid) uuids.push(object.uuid);
        }
        return uuids;
    }

}

export { ObjectUtils };
