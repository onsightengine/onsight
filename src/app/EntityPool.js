/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/rare-earth/Square/blob/main/src/EntityPool.js
//
/////////////////////////////////////////////////////////////////////////////////////

import { Entity3D } from '../project/scene3d/Entity3D.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Entity Pool
/////////////////////////////////////////////////////////////////////////////////////

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
        if(! this.entities.length) this.expand();
        return this.entities.pop();
    }

    recycle(entity) {
        entity.destroy();
        this.entities.push(entity);
    }

    expand(n = 10) {
        for(let i = 0; i < n; i++) {
            this.entities.push(new Entity3D());
        }
    }

}

export { EntityPool };