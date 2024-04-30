import { Uuid } from '../utils/Uuid.js';

class Asset {

    constructor(name = '') {
        // Prototype
        this.isAsset = true;
        this.type = 'Asset';

        // Properties
        this.name = name ?? '';
        this.uuid = Uuid.generate();
        this.category = 'unknown';
    }

    /******************** SERIALIZE */

    serialize() {
        const data = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
            category: this.category,
        };
        return data;
    }

    parse(data) {
        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        if (data.category !== undefined) this.category = data.category;
        return this;
    }

}

export { Asset };
