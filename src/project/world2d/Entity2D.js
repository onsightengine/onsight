import { AbstractEntity } from '../AbstractEntity.js';

class Entity2D extends AbstractEntity {

    constructor(name = 'Entity') {
        // AbstractEntity
        super(name);

        // Prototype
        this.isEntity2D = true;
        this.type = 'Entity2D';

        // Properties, Basic
        this.lookAtCamera = false;

        // Properties, Lighting
        this.bloom = false;
    }

    componentFamily() {
        return [ 'Entity2D' ];
    }

    /******************** COPY */

    copy(source, recursive = true) {
        // AbstractEntity
        super.copy(source, recursive);

        // Entity2D
        this.lookAtCamera = source.lookAtCamera;
        this.bloom = source.bloom;

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

        // Entity2D
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.bloom !== undefined) this.bloom = data.bloom;
        // if (data.position !== undefined) this.position.fromArray(data.position);
        // if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        // if (data.scale !== undefined) this.scale.fromArray(data.scale);

        return this;
    }

    toJSON() {
        // AbstractEntity
        const json = super.toJSON();

        // Entity2D
        json.object.lookAtCamera = this.lookAtCamera;
        json.object.bloom = this.bloom;
        // json.object.position  = this.position.toArray();
        // json.object.rotation = this.rotation.toArray();
        // json.object.scale = this.scale.toArray();

        return json;
    }

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'Entity2D': return new Entity2D();
        }
        return undefined;
    }

}

export { Entity2D };
