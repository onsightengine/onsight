import { AbstractStage } from '../AbstractStage.js';
import { Camera3D } from './Camera3D.js';
import { Entity3D } from './Entity3D.js';

class Stage3D extends AbstractStage {

    constructor(name = 'Start') {
        super(name);

        // Prototype
        this.isStage3D = true;
        this.type = 'Stage3D';
    }

    componentFamily() {
        return [ 'Stage3D' ];
    }

    /******************** JSON */

    /** Include in child classes to add access to additional Entity types */
    createChild(json) {
        switch (json.object.type) {
            case 'Camera3D': return new Camera3D();
            case 'Entity3D': return new Entity3D();
        }
        return undefined;
    }

}

export { Stage3D };
