import { Maths } from './Maths.js';
import { Vectors } from './Vectors.js';

// childByProperty()        Retrieves a child by property
// clearObject()            Completely deletes object (including geomtries/materials), and all of it's children
// compareQuaternions()     Compares objects to see if quaternions are all the same
// computeCenter()          Finds center point of an object or array of objects
// containsObject()         Checks array to see if it has an object (by Object3D.uuid)
// copyTransform()          Copies transform from one object to another
// copyWorldTransform()     Copies world transform from one object to another
// resetTransform()         Normalize / zero / reset object 3D transform
// uuidArray()              Converts object array to UUID array

class ObjectUtils {

    /** Retrieves a child by property */
    static childByProperty(object, property, value) {
        for (const child of object.children) {
            if (child[property] === value) return child;
        }
    }

    /** Completely deletes 'object' (including geomtries and materials), and all of it's children */
    static clearObject(object, removeFromParent = true) {
        // if (!object || !object.isObject3D) return;

        // if (object.geometry && typeof object.geometry.dispose === 'function') object.geometry.dispose();
        // if (object.material) ObjectUtils.clearMaterial(object.material);
        // if (object.dispose && typeof object.dispose === 'function') object.dispose();

        // while (object.children.length > 0) {
        //     ObjectUtils.clearObject(object.children[0], true /* removeFromParent */);
        // }

        // ObjectUtils.resetTransform(object);
        // if (removeFromParent) object.removeFromParent();
        // object = null;
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

    /** Finds center point of an object or array of objects (recursively adding children meshes) */
    static computeCenter(objects, targetVec3) {

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
