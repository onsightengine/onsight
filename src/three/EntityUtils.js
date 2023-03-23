// combineEntityArrays()        Adds entities from 'entityArrayToAdd' into 'intoEntityArray'
// commonEntity()               Checks two arrays to see if they have any common entites
// compareArrayOfEntities()     Checks if two entity arrays hold the same entities (i.e. are the same collections)
// containsEntity()             Checks array to see if it has an entity (by entity.uuid)
// containsMesh()               Checks if entity contains Mesh
// isImportant()                Checks if entity is important and should be protected
// parentEntity()               Returns parent most entity that is not a Scene
// parentScene()                Returns parent scene of an entity
// removeEntityFromArray()      Removes all instances of an entity (by uuid) from an array of entities
// uuidArray()                  Converts entity array to UUID array

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

    /** Checks if entity contains Mesh */
    static containsMesh(entity, recursive = true) {
        if (!entity.isEntity) {
            console.warn(`EntityUtils.containsMesh: Object was not an Entity!`);
            return false;
        }

        let hasMesh = false;
        entity.traverseEntities((child) => {
            child.traverseComponents((component) => {
                hasMesh = hasMesh || (component.type === 'geometry');
                hasMesh = hasMesh || (component.type === 'mesh');
                hasMesh = hasMesh || (component.type === 'sprite');
                // hasMesh = hasMesh || (component.mesh && component.mesh.isMesh);
                // hasMesh = hasMesh || (component.mesh && component.mesh.isPoints);
            });
        }, recursive);
        return hasMesh;
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

export { EntityUtils };
