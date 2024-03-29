// combineEntityArrays()        Adds entities from 'entityArrayToAdd' into 'intoEntityArray'
// commonEntity()               Checks two arrays to see if they have any common entites
// compareArrayOfEntities()     Checks if two entity arrays hold the same entities (i.e. are the same collections)
// containsEntity()             Checks array to see if it has an entity (by entity.uuid)
// containsMesh()               Checks if entity contains Mesh
// findCamera()                 Attempts to find a camera within an entity
// parentEntity()               Returns top level entity that is not a world or stage
// removeEntityFromArray()      Removes all instances of an entity (by uuid) from an array of entities

class EntityUtils {

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

    /** Checks if entity contains Mesh */
    static containsMesh(entity, recursive = true) {
        if (!entity || !entity.isEntity) {
            console.warn(`EntityUtils.containsMesh: Object was not an Entity!`);
            return false;
        }

        let hasMesh = false;
        entity.traverseEntities((child) => {
            if (hasMesh) return true; /* cancels recursion */
            let hasGeometry = false;
            let hasMaterial = false;
            child.traverseComponents((component) => {
                const object = component.backend;
                if (object) {
                    hasGeometry = hasGeometry || (component.type === 'geometry' && object.isBufferGeometry);
                    hasMaterial = hasMaterial || (component.type === 'material' && object.isMaterial);
                    hasMesh = hasMesh || (component.type === 'mesh' && object.isMesh);
                    // hasMesh = hasMesh || (component.type === 'sprite');
                    // hasMesh = hasMesh || (component.mesh && component.mesh.isMesh);
                    // hasMesh = hasMesh || (component.mesh && component.mesh.isPoints);
                }
            });
            hasMesh = hasMesh || (hasGeometry && hasMaterial);
        }, recursive);
        return hasMesh;
    }

    /** Attempts to find a camera component within an entity */
    static findCamera(entity) {
        if (!entity || !entity.isEntity) return undefined;
        let camera = undefined;
        entity.traverseEntities((child) => {
            if (camera) return true;
            if (child.isCamera) {
                camera = child;
                return true; /* cancels recursion */
            }
        });
        return camera;
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

}

export { EntityUtils };
