import * as THREE from 'three';
// import { Body, Material } from '../../../libs/cannon-es.js';
import { ComponentManager } from '../../ComponentManager.js';

// https://github.com/Cloud9c/taro/blob/main/src/components/physics/Rigidbody.js

const styles = [ 'dynamic', 'static', 'kinematic' ];
const indexedTypes = [ undefined, 'dynamic', 'static', undefined, 'kinematic' ];

class Rigidbody {

    init(data) {

    }

    dispose() {

    }

    attach() {

    }

    detach() {

    }

    onMaterialLoad(key, json) {
        // // NOTE: Currently, 'extends THREE.EventDispatcher' is removed from 'Component' in ComponentManager.js
        // this.dispatchEvent({ type: 'load', material });
    }

    onProgress(event) {
        // // NOTE: Currently, 'extends THREE.EventDispatcher' is removed from 'Component' in ComponentManager.js
        // this.dispatchEvent({ type: 'progress', event });
    }

    onError(event) {
        // // NOTE: Currently, 'extends THREE.EventDispatcher' is removed from 'Component' in ComponentManager.js
        // this.dispatchEvent({ type: 'error', event });
    }

}

Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },
        mass: { type: 'number', default: 1, if: { style: [ 'dynamic' ] } },
        velocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },
        angularVelocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },

        linearDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        angularDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        fixedRotation: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },
        linearFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        angularFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        sleepSpeedLimit: { type: 'number', default: 0.1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },
        sleepTimeLimit: { type: 'number', default: 1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },

        material: { type: 'asset' },
        collisionResponse: { type: 'boolean', default: true },
        collisionFilterGroup: { type: 'int', default: 1 },
        collisionFilterMask: { type: 'int', default: - 1 },
    },
    icon: ``,
    color: '#1365C2',
};

ComponentManager.register('rigidbody', Rigidbody);
