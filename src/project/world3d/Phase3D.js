import * as THREE from 'three';
import { Entity3D } from './Entity3D.js';

class Phase3D extends Entity3D {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isScene = true;
        this.isPhase = true;
        this.isPhase3D = true;
        this.type = 'Phase3D';

        // Properties, Display
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
        // Entity3D.copy()
        super.copyEntity(source, recursive);

        // Phase3D Properties
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

        // Phase3D Properties
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.fromArray(data.beginPosition);
        if (data.endPosition !== undefined) this.endPosition.fromArray(data.endPosition);

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // Phase3D Properties
        json.object.start = this.start;
        json.object.finish = this.finish;
        json.object.beginPosition = this.beginPosition.toArray();
        json.object.endPosition = this.endPosition.toArray();

        return json;
    }

}

export { Phase3D };
