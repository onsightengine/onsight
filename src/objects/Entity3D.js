import { Entity } from '../core/Entity.js';

class Entity3D extends Entity {

    constructor(name = 'Entity') {
        // Entity
        super(name);

        // Prototype
        this.isEntity3D = true;
        this.type = 'Entity3D';

        // Properties, Basic
        this.lookAtCamera = false;              // implemented in Entity3D.updateMatrix()
        this.lookAtYOnly = false;               // implemented in Entity3D.updateMatrix()

        // Properties, Lighting
        this.bloom = false;
    }

    componentFamily() {
        return [ 'Entity3D' ];
    }

    /******************** COPY */

    copy(source, recursive = true) {
        // Entity
        super.copy(source, recursive);

        // Entity3D
        this.lookAtCamera = source.lookAtCamera;
        this.lookAtYOnly = source.lookAtYOnly;
        this.bloom = source.bloom;

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        super.dispose();
    }

    /******************** JSON */

    toJSON(recursive = true) {
        const data = super.toJSON(recursive);

        // Position
        // data.position  = JSON.stringify(this.position.toArray());
        // data.rotation = JSON.stringify(this.rotation.toArray());
        // data.scale = JSON.stringify(this.scale.toArray());

        // Basic
        data.lookAtCamera = this.lookAtCamera;
        data.lookAtYOnly = this.lookAtYOnly;

        // Lighting
        data.bloom = this.bloom;
        return data;
    }

    fromJSON(data) {
        // Entity
        super.fromJSON(data);

        // Position
        // if (data.position !== undefined) this.position.copy(JSON.parse(data.position));
        // if (data.rotation !== undefined) this.rotation.copy(JSON.parse(data.rotation));
        // if (data.scale !== undefined) this.scale.copy(JSON.parse(data.scale));

        // Basic
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.lookAtYOnly !== undefined) this.lookAtYOnly = data.lookAtYOnly;

        // Lighting
        if (data.bloom !== undefined) this.bloom = data.bloom;
        return this;
    }

}

Entity.register('Entity3D', Entity3D);

export { Entity3D };
