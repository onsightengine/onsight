import { AbstractStage } from '../AbstractStage.js';
import { Entity2D } from './Entity2D.js';

class Stage2D extends AbstractStage {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage2D = true;
        this.type = 'Stage2D';
    }

    componentFamily() {
        return [ 'Stage2D' ];
    }

    /******************** JSON */

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'Entity2D': return new Entity2D();
        }
        return undefined;
    }

}

export { Stage2D };
