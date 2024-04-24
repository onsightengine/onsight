import { AbstractStage } from '../AbstractStage.js';
import { EntityUI } from './EntityUI.js';

class StageUI extends AbstractStage {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStageUI = true;
        this.type = 'StageUI';
    }

    componentFamily() {
        return [ 'StageUI' ];
    }

    /******************** JSON */

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'EntityUI': return new EntityUI();
        }
        return undefined;
    }

}

export { StageUI };
