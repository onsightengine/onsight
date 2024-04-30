import { Entity } from '../Entity.js';
import { World } from '../World.js';

class World3D extends World {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld3D = true;
        this.type = 'World3D';
    }

    componentFamily() {
        return [ 'World3D' ];
    }

}

Entity.register('World3D', World3D);

export { World3D };
