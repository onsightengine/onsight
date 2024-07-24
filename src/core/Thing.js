import {
    VERSION,
} from '../constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { SysUtils } from '../utils/SysUtils.js';

const _types = new Map();

/**
 * Base class for a serializable object with a unique identifier
 */
class Thing {

    constructor(name = 'Thing') {
        // Prototype
        this.isThing = true;
        this.type = 'Thing';

        // Properties
        this.name = name;
        this.uuid = MathUtils.randomUUID();
    }

    /******************** COPY / CLONE */

    clone(recursive = false) {
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {
        // Clear Existing Properites
        this.dispose();

        // Copy Properties
        this.name = source.name;
        /* DON'T COPY UUID: this.uuid = source.uuid; */
        return this;
    }

    /******************** JSON */

    toJSON() {
        const data = {};
        data.meta = {
            type: this.type,
            version: VERSION,
        };
        data.name = this.name;
        data.uuid = this.uuid;
        return data;
    }

    fromJSON(data) {
        if (!SysUtils.isObject(data)) {
            console.warn(`Thing.fromJSON(): No json data provided for ${this.constructor.name}`);
            return this;
        }
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        return this;
    }

    /******************** TYPES */

    static register(type, ThingClass) {
	    _types.set(type, ThingClass);
    }

    static type(type) {
        return _types.get(type);
    }

}

Thing.register('Thing', Thing);

export { Thing };
