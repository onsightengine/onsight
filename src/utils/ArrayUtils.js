// ARRAYS
//  isIterable()                Checks if a JavaScript object is iterable (i.e. Array.isArray())
//  swapItems()                 Swaps two items in an array
// THING
//  combineThingArrays()        Combines two thing arrays into one
//  compareThingArrays()        Checks if two thing arrays include the same things (by UUID)
//  includesThing()             Checks an array to see if it includes an thing (by UUID)
//  removeThingFromArray()      Removes all instances of an thing (by UUID) from an array
//  shareValues()               Checks if two arrays share any values at all

class ArrayUtils {

    /******************** ARRAYS ********************/

    /** Checks if a JavaScript object is iterable (i.e. Array.isArray()) */
    static isIterable(array) {
        return (array && (typeof array[Symbol.iterator] === 'function') || Array.isArray(array));
    }

    /** Swaps two items in an array */
    static swapItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }

    /******************** THING ********************/

    /** Combines two thing arrays into one */
    static combineThingArrays(arrayOne, arrayTwo) {
        const things = [ ...arrayOne ];
        for (const thing of arrayTwo) {
            if (ArrayUtils.includesThing(thing, arrayOne) === false) things.push(thing);
        }
        return things;
    }

    /** Checks if two thing arrays include the same things (by UUID) */
    static compareThingArrays(arrayOne, arrayTwo) {
        arrayOne = Array.isArray(arrayOne) ? arrayOne : [ arrayOne ];
        arrayTwo = Array.isArray(arrayTwo) ? arrayTwo : [ arrayTwo ];
        for (const thing of arrayOne) if (ArrayUtils.includesThing(thing, arrayTwo) === false) return false;
        for (const thing of arrayTwo) if (ArrayUtils.includesThing(thing, arrayOne) === false) return false;
        return true;
    }

    /** Checks an array to see if it includes an thing (by thing.uuid) */
    static includesThing(findThing, ...things) {
        if (!findThing || !findThing.isThing) return false;
        if (things.length === 0) return false;
        if (things.length > 0 && Array.isArray(things[0])) things = things[0];
        for (const thing of things) if (thing.isThing && thing.uuid === findThing.uuid) return true;
        return false;
    }

    /** Removes all instances of an thing (by UUID) from an array */
    static removeThingFromArray(removeThing, ...things) {
        if (things.length > 0 && Array.isArray(things[0])) things = things[0];
        if (!removeThing || !removeThing.isThing) return [ ...things ];
        const newArray = [];
        for (const thing of things) if (thing.uuid !== removeThing.uuid) newArray.push(thing);
        return newArray;
    }

    /** Checks if two arrays share any values at all */
    static shareValues(arrayOne, arrayTwo) {
        for (let i = 0; i < arrayOne.length; i++) {
            if (arrayTwo.includes(arrayOne[i])) return true;
        }
        return false;
    }

}

export { ArrayUtils };
