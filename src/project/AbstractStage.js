import { AbstractEntity } from './AbstractEntity.js';
import { Vec3 } from '../math/Vec3.js';

class AbstractStage extends AbstractEntity {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage = true;
        this.type = 'Stage';

        // Properties, Display
        this.enabled = true;
        this.start = 0;
        this.finish = -1;
        this.beginPosition = new Vec3();
        this.endPosition = new Vec3();
    }

    componentFamily() {
        return [ /* 'Stage' */ ];
    }

    /******************** COPY / CLONE */

    copy(source, recursive = true) {
        // AbstractEntity
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

    fromJSON(json) {
        const data = json.object;

        // AbstractEntity
        super.fromJSON(json);

        // Stage
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.start !== undefined) this.start = data.start;
        if (data.finish !== undefined) this.finish = data.finish;
        if (data.beginPosition !== undefined) this.beginPosition.copy(JSON.parse(data.beginPosition));
        if (data.endPosition !== undefined) this.endPosition.copy(JSON.parse(data.endPosition));

        return this;
    }

    toJSON() {
        // AbstractEntity
        const json = super.toJSON();

        // Stage
        json.object.enabled = this.enabled;
        json.object.start = this.start;
        json.object.finish = this.finish;
        json.object.beginPosition = JSON.stringify(this.beginPosition);
        json.object.endPosition = JSON.stringify(this.endPosition);

        return json;
    }

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'AbstractEntity': return new AbstractEntity();
        }
        return undefined;
    }

}

export { AbstractStage };
