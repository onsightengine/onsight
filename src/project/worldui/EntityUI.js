import { Entity } from '../../core/Entity.js';

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

    /******************** JSON */

    toJSON(recursive = true) {
        // Entity
        const data = super.toJSON(recursive);

        // EntityUI
        // EMPTY

        return data;
    }

    fromJSON(data) {
        // Entity
        super.fromJSON(data);

        // EntityUI
        // EMPTY

        return this;
    }

}

Entity.register('EntityUI', EntityUI);

export { EntityUI };
