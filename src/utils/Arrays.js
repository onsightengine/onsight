// ARRAYS
//  isIterable()                Checks if a JavaScript object is iterable (i.e. Array.isArray())
//  swapItems()                 Swaps two items in an array
// ENTITY
//  combineEntityArrays()       Combines two entity arrays into one
//  compareEntityArrays()       Checks if two entity arrays include the same entities (by UUID)
//  includesEntity()            Checks an array to see if it includes an entity (by UUID)
//  removeEntityFromArray()     Removes all instances of an entity (by UUID) from an array

class Arrays {

    /******************** ARRAYS ********************/


    /** Checks if a JavaScript object is iterable (i.e. Array.isArray()) */
    static isIterable(obj) {
        return (obj && typeof obj[Symbol.iterator] === 'function');
    }

    /** Swaps two items in an array */
    static swapItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }

    /******************** ENTITY ********************/

    /** Combines two entity arrays into one */
    static combineEntityArrays(arrayOne, arrayTwo) {
        const entities = [...arrayOne];
        for (const entity of arrayTwo) if (Arrays.includesEntity(entity, arrayOne) === false) entities.push(entity);
        return entities;
    }

    /** Checks if two entity arrays include the same entities (by UUID) */
    static compareEntityArrays(arrayOne, arrayTwo) {
        arrayOne = Array.isArray(arrayOne) ? arrayOne : [ arrayOne ];
        arrayTwo = Array.isArray(arrayTwo) ? arrayTwo : [ arrayTwo ];
        for (const entity of arrayOne) if (Arrays.includesEntity(entity, arrayTwo) === false) return false;
        for (const entity of arrayTwo) if (Arrays.includesEntity(entity, arrayOne) === false) return false;
        return true;
    }

    /** Checks an array to see if it includes an entity (by entity.uuid) */
    static includesEntity(findEntity, ...entities) {
        if (!findEntity || !findEntity.isEntity) return false;
        if (entities.length === 0) return false;
        if (entities.length > 0 && Array.isArray(entities[0])) entities = entities[0];
        for (const entity of entities) if (entity.isEntity && entity.uuid === findEntity.uuid) return true;
        return false;
    }

    /** Removes all instances of an entity (by UUID) from an array */
    static removeEntityFromArray(removeEntity, ...entities) {
        if (entities.length > 0 && Array.isArray(entities[0])) entities = entities[0];
        if (!removeEntity || !removeEntity.isEntity) return [...entities];
        const newArray = [];
        for (const entity of entities) if (entity.uuid !== removeEntity.uuid) newArray.push(entity);
        return newArray;
    }

}

export { Arrays };
