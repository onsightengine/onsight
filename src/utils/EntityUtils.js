// clearObject()                Completely deletes object (including geomtries/materials), and all of it's children
// combineEntityArrays()        Adds entities from 'entityArrayToAdd' into 'intoEntityArray'
// commonEntity()               Checks two arrays to see if they have any common entites
// compareArrayOfEntities()     Checks if two entity arrays hold the same entities (i.e. are the same collections)
// containsEntity()             Checks array to see if it has an entity (by entity.uuid)
// copyTransform()              Copies transform from one object to another
// parentEntity()               Returns top level entity that is not a world or stage
// removeEntityFromArray()      Removes all instances of an entity (by uuid) from an array of entities
// uuidArray()                  Converts object array to UUID array

class EntityUtils {

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

    /** Adds entities from 'entityArrayToAdd' into 'intoEntityArray' */
    static combineEntityArrays(intoEntityArray, entityArrayToAdd) {
        for (const entity of entityArrayToAdd) {
            if (EntityUtils.containsEntity(intoEntityArray, entity) === false) {
                intoEntityArray.push(entity);
            }
        }
    }

    /** Checks two arrays to see if they have any common entites */
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

    /** Checks if two entity arrays hold the same entities (i.e. are the same collections) */
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

    /** Checks array to see if it has an entity (compare by entity.uuid) */
    static containsEntity(arrayOfEntities, entity) {
        if (!Array.isArray(arrayOfEntities)) return false;
        if (!entity || !entity.isEntity) return false;
        for (const checkEntity of arrayOfEntities) {
            if (checkEntity.isEntity && checkEntity.uuid === entity.uuid) return true;
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

    /** Returns top level entity that is not a world or stage */
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

    /** Removes all instances of an entity (by uuid) from an array of entities */
    static removeEntityFromArray(entityArray, entity) {
        if (!entity || !entity.isEntity || !Array.isArray(entityArray)) return;
        for (let i = entityArray.length - 1; i >= 0; --i) {
            if (entityArray[i].uuid === entity.uuid) entityArray.splice(i, 1);
        }
        return entityArray;
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

export { EntityUtils };
