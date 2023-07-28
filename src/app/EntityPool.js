// https://github.com/rare-earth/Square/blob/main/src/EntityPool.js

import { Entity3D } from '../project/world3d/Entity3D.js';

class EntityPool {

    constructor() {
        this.entities = [];
        this.expand();
    }

    getEntities(n) {
        if(n > this.entities.length) this.expand(n - this.entities.length);
        return this.entities.splice(0, n);
    }

    getEntity() {
        if(!this.entities.length) this.expand();
        return this.entities.pop();
    }

    recycle(entity) {
        entity.dispose();
        this.entities.push(entity);
    }

    expand(n = 10) {
        for(let i = 0; i < n; i++) {
            this.entities.push(new Entity3D());
        }
    }

}

export { EntityPool };
