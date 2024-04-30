import { Entity } from '../Entity.js';
import { Stage } from '../Stage.js';

class StageUI extends Stage {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStageUI = true;
        this.type = 'StageUI';
    }

    componentFamily() {
        return [ 'StageUI' ];
    }

}

Entity.register('StageUI', StageUI);

export { StageUI };
