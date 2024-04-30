import { Entity } from '../Entity.js';
import { Stage } from '../Stage.js';

class Stage3D extends Stage {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage3D = true;
        this.type = 'Stage3D';
    }

    componentFamily() {
        return [ 'Stage3D' ];
    }

}

Entity.register('Stage3D', Stage3D);

export { Stage3D };
