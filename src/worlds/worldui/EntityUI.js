import { Entity } from '../Entity.js';

class EntityUI extends Entity {

    constructor(name = 'Entity') {
        // Entity
        super(name);

        // Prototype
        this.isEntityUI = true;
        this.type = 'EntityUI';
    }

    componentFamily() {
        return [ 'EntityUI' ];
    }

    /******************** COPY */

    copy(source, recursive = true) {
        // Entity
        super.copy(source, recursive);

        // EntityUI
        // EMPTY

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        super.dispose();
    }

    /******************** SERIALIZE */

    serialize(recursive = true) {
        // Entity
        const data = super.serialize(recursive);

        // EntityUI
        // EMPTY

        return data;
    }

    parse(data) {
        // Entity
        super.parse(data);

        // EntityUI
        // EMPTY

        return this;
    }

}

Entity.register('EntityUI', EntityUI);

export { EntityUI };
