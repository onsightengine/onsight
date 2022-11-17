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
//      MIT     https://github.com/Cloud9c/taro/blob/main/src/components/physics/Rigidbody.js
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { Body, Material } from '../../../../libs/cannon-es.js';

import { ComponentManager } from '../../../ComponentManager.js';

const styles = [ 'dynamic', 'static', 'kinematic' ];
const indexedTypes = [ undefined, 'dynamic', 'static', undefined, 'kinematic' ];
const fileLoader = new THREE.FileLoader();

///// Component

class Rigidbody {

    init(data) {
        data.style = indexedTypes.indexOf(data.style);

        this.backend = new Body(data);
        this.cachedScale = this.entity.getWorldScale(new THREE.Vector3());

        this.style = data.style = indexedTypes[data.style];

        if (data.material.length > 0) {
            this.backend.material = this.app.assets.get(data.material);
            if (this.backend.material === undefined) {
                fileLoader.load(data.material, json => this.onMaterialLoad(data.material, json), p => this.onProgress(p), e => this.onError(e));
            }
        }
    }

    dispose() {

    }

    enable() {
        this.app.physics.addBody(this.backend);
    }

    disable() {
        this.app.physics.removeBody(this.backend);
    }

    /////

    onMaterialLoad(key, json) {
        const material = new Material(json);
        this.backend.material = material;
        this.app.assets.add(key, material);
        // // NOTE: Currently, 'extends THREE.EventDispatcher' is removed from 'Component' in ComponentManager.js
        // this.dispatchEvent({ type: 'load', material });
    }

    onProgress(event) {
        // // NOTE: Currently, 'extends THREE.EventDispatcher' is removed from 'Component' in ComponentManager.js
        // this.dispatchEvent({ type: 'progress', event });
    }

    onError(event) {
        console.error('Rigidbody: failed retrieving asset');
        // // NOTE: Currently, 'extends THREE.EventDispatcher' is removed from 'Component' in ComponentManager.js
        // this.dispatchEvent({ type: 'error', event });
    }

    /////

    toJSON() {

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
