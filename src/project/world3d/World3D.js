import { AbstractWorld } from '../AbstractWorld.js';
import { Camera3D } from './Camera3D.js';
import { Entity3D } from './Entity3D.js';
import { Stage3D } from './Stage3D.js';

class World3D extends AbstractWorld {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld3D = true;
        this.type = 'World3D';
    }

    componentFamily() {
        return [ 'World3D' ];
    }

    /******************** JSON */

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'Camera3D': return new Camera3D();
            case 'Entity3D': return new Entity3D();
            case 'Stage3D': return new Stage3D();
        }
        return undefined;
    }

}

export { World3D };
