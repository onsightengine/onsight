import RAPIER from 'rapier';

import { AssetManager } from '../../../app/AssetManager.js';
import { ComponentManager } from '../../../app/ComponentManager.js';

await RAPIER.init(); /* init engine, docs: https://rapier.rs/docs/api/javascript/JavaScript3D */

class Physics {

    init(data = {}) {
        // Generate Backend
        let world = undefined;

        // Save Backend / Data
        this.backend = world;
        this.data = data;
    }

    dispose() {

    }

}

Physics.config = {
    schema: {

    },
    icon: ``,
    color: '#202020',
    multiple: false,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('physics', Physics);
