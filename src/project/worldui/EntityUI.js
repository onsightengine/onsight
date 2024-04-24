import { AbstractEntity } from '../AbstractEntity.js';

class EntityUI extends AbstractEntity {

    constructor(name = 'Entity') {
        // AbstractEntity
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
        // AbstractEntity
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

    fromJSON(json) {
        const data = json.object;

        // AbstractEntity
        super.fromJSON(json);

        // EntityUI
        // EMPTY

        return this;
    }

    toJSON() {
        // AbstractEntity
        const json = super.toJSON();

        // EntityUI
        // EMPTY

        return json;
    }

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'EntityUI': return new EntityUI();
        }
        return undefined;
    }

}

export { EntityUI };
