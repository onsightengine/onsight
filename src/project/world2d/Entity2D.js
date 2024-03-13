import { Entity } from '../Entity.js';

class Entity2D extends Entity {

    constructor(name = 'Entity2D') {
        // Entity
        super(name);

        // Prototype
        this.isEntity2D = true;
        this.type = 'Entity2D';
    }

}

export { Entity2D };
