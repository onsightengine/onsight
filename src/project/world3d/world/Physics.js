// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js

import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';

await RAPIER.init(); /* init engine, docs: https://rapier.rs/docs/api/javascript/JavaScript3D */

const _gravity = new THREE.Vector3();

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

    attach() {
        let world = this.backend;
        const data = this.data;
        if (data.active && !world) {
            if (data.gravity) _gravity.fromArray(data.gravity); else _gravity.set(0, 0, 0);
            world = new RAPIER.World(_gravity);
            this.backend = world;
        }
    }

    detach() {
        const world = this.backend;
        if (world) world.free();
    }

    /********** CUSTOM */

    update(delta = 0) {
        const world = this.backend;
        if (!world) return;

        // Step
        if (delta > 0.01) {
            world.timestep = delta;
            world.step();
        }
    }

}

Physics.config = {
    schema: {

        active: { type: 'hidden', default: false },

        gravity: { type: 'vector', size: 3, tint: true, step: 0.1, precision: 2 },

    },
    icon: ``,
    color: '#202020',
    multiple: false,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('physics', Physics);
