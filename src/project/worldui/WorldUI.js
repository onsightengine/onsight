import { Entity } from '../Entity.js';
import { World } from '../World.js';

class WorldUI extends World {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorldUI = true;
        this.type = 'WorldUI';
    }

    componentFamily() {
        return [ 'WorldUI' ];
    }

}

Entity.register('WorldUI', WorldUI);

export { WorldUI };
