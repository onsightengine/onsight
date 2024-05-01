import { Entity } from '../core/Entity.js';
import { STAGE_TYPES } from '../constants.js';
import { Vec3 } from '../math/Vec3.js';

class Stage extends Entity {

    constructor(type = STAGE_TYPES.STAGE_2D, name = 'Start') {
        super(name);

        // Check
        if (Object.values(STAGE_TYPES).indexOf(type) === -1) {
            console.warn(`Stage: Invalid stage type '${type}', using 'Stage2D`);
            type = STAGE_TYPES.STAGE_2D;
        }

        // Prototype
        this.isStage = true;
        this.type = type;

        // Properties, Display
        this.enabled = true;
        this.start = 0;
        this.finish = -1;
        this.beginPosition = new Vec3();
        this.endPosition = new Vec3();
    }

    componentFamily() {
        return [ 'Stage', this.type ];
    }

    /******************** COPY / CLONE */

    copy(source, recursive = true) {
        // Entity
        super.copy(source, recursive);

        // Stage
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

    toJSON(recursive = true) {
        // Entity
        const data = super.toJSON(recursive);

        // Stage
        data.enabled = this.enabled;
        data.start = this.start;
        data.finish = this.finish;
        data.beginPosition = JSON.stringify(this.beginPosition.toArray());
        data.endPosition = JSON.stringify(this.endPosition.toArray());

        return data;
    }

    fromJSON(data) {
        // Entity
        super.fromJSON(data);

        // Stage
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.copy(JSON.parse(data.beginPosition));
        if (data.endPosition !== undefined) this.endPosition.copy(JSON.parse(data.endPosition));

        return this;
    }

}

Entity.register('Stage2D', Stage);
Entity.register('Stage3D', Stage);
Entity.register('StageUI', Stage);

export { Stage };
