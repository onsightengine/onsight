import { Entity } from '../Entity.js';

class Entity2D extends Entity {

    constructor(name = 'Entity') {
        // Entity
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
        // Entity
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

    toJSON(recursive = true) {
        // Entity
        const data = super.toJSON(recursive);

        // Entity2D
        data.lookAtCamera = this.lookAtCamera;
        data.bloom = this.bloom;
        // data.position  = JSON.stringify(this.position.toArray());
        // data.rotation = JSON.stringify(this.rotation.toArray());
        // data.scale = JSON.stringify(this.scale.toArray());

        return data;
    }

    fromJSON(data) {
        // Entity
        super.fromJSON(data);

        // Entity2D
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.bloom !== undefined) this.bloom = data.bloom;
        // if (data.position !== undefined) this.position.copy(JSON.parse(data.position));
        // if (data.rotation !== undefined) this.rotation.copy(JSON.parse(data.rotation));
        // if (data.scale !== undefined) this.scale.copy(JSON.parse(data.scale));

        return this;
    }

}

Entity.register('Entity2D', Entity2D);

export { Entity2D };
