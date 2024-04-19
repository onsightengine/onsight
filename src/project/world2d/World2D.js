import { AbstractWorld } from '../AbstractWorld.js';
import { Entity2D } from './Entity2D.js';
import { Stage2D } from './Stage2D.js';

class World2D extends AbstractWorld {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld2D = true;
        this.type = 'World2D';
    }

    componentFamily() {
        return [ 'World2D' ];
    }

    /******************** JSON */

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'Entity2D': return new Entity2D();
            case 'Stage2D': return new Stage2D();
        }
        return undefined;
    }

}

export { World2D };
