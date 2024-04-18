// ASSIGN
//  random()                    Returns randomized UUID
// ARRAY
//  arrayFromObjects()          Converts object list or object array to UUID array

class Uuid {

    /******************** ASSIGN ********************/

    /** Returns randomized UUID */
    static random() {
        if (window.crypto && window.crypto.randomUUID) return crypto.randomUUID();

        // https://github.com/mrdoob/three.js/blob/dev/src/math/MathUtils.js
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
            _lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
            _lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
            _lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];
        return uuid.toLowerCase(); // .toLowerCase() flattens concatenated strings to save heap memory space
    }

    /******************** ARRAY ********************/

    /** Converts object list or object array to UUID array */
    static arrayFromObjects(...objects) {
        // Arguments Array
        if (objects.length > 0 && Array.isArray(objects[0])) objects = objects[0];
        // Create UUID Array
        const uuids = [];
        for (const object of objects) {
            if (typeof object === 'object' && object.uuid) uuids.push(object.uuid);
        }
        return uuids;
    }

}

export { Uuid };
