// https://github.com/mrdoob/three.js/blob/dev/src/loaders/Cache.js

class Cache {

    constructor() {
        this.items = {};
    }

    add(key, item) {
        this.items[key] = item;
    }

    get(key) {
        return this.items[key];
    }

    /** For example: Cache.getByProperty('uuid', 'xxxx-xxxx-xxxx') */
    getByProperty(property, value) {
        for (const key in this.items) {
            if (this.items[key][property] === value) {
                return this.items[key];
            }
        }
    }

    remove(key) {
        delete this.items[key];
    }

    /** For example: Cache.removeByProperty('uuid', 'xxxx-xxxx-xxxx') */
    removeByProperty(property, value) {
        for (const key in this.items) {
            if (this.items[key][property] === value) {
                delete this.items[key];
            }
        }
    }

    clear() {
        this.items = {};
    }

}

export { Cache };
