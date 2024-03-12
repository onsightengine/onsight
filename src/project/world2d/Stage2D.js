import { Camera2D } from './Camera2D.js';
import { Entity2D } from './Entity2D.js';

const _types = {
    'Camera2D': Camera2D,
    'Entity2D': Entity2D,
};

class Stage2D extends Entity2D {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage = true;
        this.isStage2D = true;
        this.type = 'Stage2D';

        // Properties, Display
        this.enabled = true;
        this.start = 0;
        this.finish = -1;
        // this.beginPosition = new THREE.Matrix4().setPosition(-2, 0, 0);
        // this.endPosition = new THREE.Matrix4().setPosition(2, 0, 0);
    }

    /******************** COPY / CLONE */

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {
        // Entity2D.copyEntity()
        super.copyEntity(source, recursive);

        // Stage2D Properties
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

        // Entity2D Properties
        super.fromJSON(json);

        // Stage2D Properties
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.fromArray(data.beginPosition);
        if (data.endPosition !== undefined) this.endPosition.fromArray(data.endPosition);

        return this;
    }

    /** Overloaded to add access to additional Entity2D types */
    loadChildren(jsonEntities = []) {
        for (const entityData of jsonEntities) {
            const Constructor = _types[entityData.object.type];
            if (Constructor) {
                const entity = new Constructor();
                this.add(entity.fromJSON(entityData));
            } else {
                console.warn(`Stage2D.loadChildren: Unknown type '${entityData.object.type}'`);
            }
        }
    }

    toJSON() {
        // Entity2D Properties
        const json = super.toJSON();

        // Stage2D Properties
        json.object.enabled = this.enabled;
        json.object.start = this.start;
        json.object.finish = this.finish;
        json.object.beginPosition = this.beginPosition.toArray();
        json.object.endPosition = this.endPosition.toArray();

        return json;
    }

}

export { Stage2D };
