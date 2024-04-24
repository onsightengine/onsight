import { AbstractWorld } from '../AbstractWorld.js';
import { EntityUI } from './EntityUI.js';
import { StageUI } from './StageUI.js';

class WorldUI extends AbstractWorld {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorldUI = true;
        this.type = 'WorldUI';
    }

    componentFamily() {
        return [ 'WorldUI' ];
    }

    /******************** JSON */

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'EntityUI': return new EntityUI();
            case 'StageUI': return new StageUI();
        }
        return undefined;
    }

}

export { WorldUI };
