/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/rare-earth/Square/blob/main/src/EntityPool.js
//
/////////////////////////////////////////////////////////////////////////////////////

import { Entity3D } from '../core/scene3d/Entity3D.js';

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
