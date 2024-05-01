import { Thing } from '../core/Thing.js';

class Asset extends Thing {

    constructor(name = '') {
        super(name);

        // Prototype
        this.isAsset = true;
        this.type = 'Asset';

        // Properties
        this.category = 'unknown';
    }

    /******************** JSON */

    toJSON() {
        const data = super.toJSON();
        data.category = this.category;
        return data;
    }

    fromJSON(data) {
        super.fromJSON(data);
        if (data.category !== undefined) this.category = data.category;
        return this;
    }

}

export { Asset };
