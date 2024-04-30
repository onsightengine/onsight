import { Entity } from '../Entity.js';
import { World } from '../World.js';

class World2D extends World {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld2D = true;
        this.type = 'World2D';
    }

    componentFamily() {
        return [ 'World2D' ];
    }

}

Entity.register('World2D', World2D);

export { World2D };
