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
        const world = this.backend;
        if (world) world.free();
    }

    attach() {

    }

    detach() {

    }

    /********** APP EVENTS */

    onLoad() {
        _gravity.set(0, 0, 0);
        if (this.data.gravity) _gravity.fromArray(this.data.gravity);
        const world = new RAPIER.World(_gravity);
        this.backend = world;
    }

    onUpdate(delta = 0) {
        const world = this.backend;
        if (!world) return;
        if (delta > 0.01) {
            world.timestep = delta;
            world.step();
        }
    }

}

Physics.config = {
    schema: {

        gravity: { type: 'vector', default: [ 0, - 9.807, 0 ], size: 3, tint: true, step: 0.1, precision: 2 },

    },
    icon: ``,
    color: '#0F4F94',
    multiple: false,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('physics', Physics);
