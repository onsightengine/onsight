import { Entity } from '../Entity.js';

class Entity3D extends Entity {

    constructor(name = 'Entity') {
        // Entity
        super(name);

        // Prototype
        this.isEntity3D = true;
        this.type = 'Entity3D';

        // Properties, Basic
        this.lookAtCamera = false;              // implemented in Entity3D.updateMatrix() overload
        this.lookAtYOnly = false;               // implemented in Entity3D.updateMatrix() overload

        // Properties, Lighting
        this.bloom = false;
    }

    componentFamily() {
        return [ 'Entity', 'Entity3D' ];
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

    fromJSON(json) {
        const data = json.object;

        // Entity
        super.fromJSON(json);

        // Entity3D
        if (data.lookAtCamera !== undefined) this.lookAtCamera = data.lookAtCamera;
        if (data.lookAtYOnly !== undefined) this.lookAtYOnly = data.lookAtYOnly;
        if (data.bloom !== undefined) this.bloom = data.bloom;
        // if (data.position !== undefined) this.position.fromArray(data.position);
        // if (data.rotation !== undefined) this.rotation.fromArray(data.rotation);
        // if (data.scale !== undefined) this.scale.fromArray(data.scale);
        // this.updateMatrix();

        return this;
    }

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        const constructor = _types[json.object.type];
        if (constructor) return new constructor().fromJSON(json);
        return undefined;
    }

    toJSON() {
        // Entity
        const json = super.toJSON();

        // Entity3D
        json.object.lookAtCamera = this.lookAtCamera;
        json.object.lookAtYOnly = this.lookAtYOnly;
        json.object.bloom = this.bloom;
        // json.object.position  = this.position.toArray();
        // json.object.rotation = this.rotation.toArray();
        // json.object.scale = this.scale.toArray();

        return json;
    }

}

const _types = {
    'Entity3D':     Entity3D,
}

export { Entity3D };
