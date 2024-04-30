import { Entity } from '../Entity.js';
import { Stage } from '../Stage.js';

class Stage2D extends Stage {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage2D = true;
        this.type = 'Stage2D';
    }

    componentFamily() {
        return [ 'Stage2D' ];
    }

}

Entity.register('Stage2D', Stage2D);

export { Stage2D };
