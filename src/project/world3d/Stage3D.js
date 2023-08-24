import * as THREE from 'three';
import { Camera3D } from './Camera3D.js';
import { Entity3D } from './Entity3D.js';
import { Light3D } from './Light3D.js';

class Stage3D extends Entity3D {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage = true;
        this.isStage3D = true;
        this.type = 'Stage3D';

        // Properties, Display
        this.enabled = true;
        this.start = 0;
        this.finish = -1;
        this.beginPosition = new THREE.Matrix4().setPosition(-2, 0, 0);
        this.endPosition = new THREE.Matrix4().setPosition(2, 0, 0);
    }

    /******************** COPY / CLONE */

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {
        // Entity3D.copyEntity()
        super.copyEntity(source, recursive);

        // Stage3D Properties
        this.enabled = source.enabled;
        this.start = source.start;
        this.finish = source.finish;
        this.beginPosition.copy(source.beginPosition);
        this.endPosition.copy(source.endPosition);

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        super.dispose();
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Entity3D Properties
        super.fromJSON(json);

        // Stage3D Properties
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.fromArray(data.beginPosition);
        if (data.endPosition !== undefined) this.endPosition.fromArray(data.endPosition);

        return this;
    }

    /** Overloaded to add access to additional Entity3D types */
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const entity = new (eval(entityData.object.type))();
            this.add(entity.fromJSON(entityData));
        }
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // Stage3D Properties
        json.object.enabled = this.enabled;
        json.object.start = this.start;
        json.object.finish = this.finish;
        json.object.beginPosition = this.beginPosition.toArray();
        json.object.endPosition = this.endPosition.toArray();

        return json;
    }

}

export { Stage3D };
