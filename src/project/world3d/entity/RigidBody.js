import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';

const styles = [ 'dynamic', 'static', 'kinematic' ];
const shapes = [ 'ball', 'cuboid' ];

const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();

class Rigidbody {

    init(data = {}) {
        // Generate Backend
        let body = undefined;


        // Save Backend / Data
        this.backend = body;
        this.data = data;
    }

    dispose() {

    }

    attach() {

        let mass = 1; // 0 == infinite, i.e. stationary?
        let restitution = 0;

        // if (mesh.geometry.type === 'BoxGeometry') {
        //     const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
        //     const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
        //     const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
        //     shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
        // } else if (mesh.geometry.type === 'SphereGeometry' || mesh.geometry.type === 'IcosahedronGeometry') {
        //     const radius = parameters.radius !== undefined ? parameters.radius : 1;
        //     shape = RAPIER.ColliderDesc.ball(radius);
        // }

        const shape = RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1);
        shape.setMass(mass);
        shape.setRestitution(restitution);

        function createBody(position, quaternion, mass, shape) {
            const desc = (mass > 0) ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
            desc.setTranslation(...position);
            if (quaternion) desc.setRotation(quaternion);
            let world = {};
            const body = world.createRigidBody(desc);
            world.createCollider(shape, body);
            return body;
        }

        const body = createBody(_position, _quaternion, mass, shape);

    }

    detach() {

    }

    update(delta = 0) {
        // mesh.position.copy(body.translation());
        // mesh.quaternion.copy(body.rotation());
    }

    setPosition(position /* Vector3 */) {
        body.setAngvel(_zero);
        body.setLinvel(_zero);
        body.setTranslation(position);
    }

    setVelocity(velocity) {
        body.setLinvel(velocity);
    }

}

Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },

        // DIVIDER
        styleDivider: { type: 'divider' },

        // Shape
        shape: { type: 'select', default: 'cuboid', select: shapes },

        // mass: { type: 'number', default: 1, if: { style: [ 'dynamic' ] } },
        // velocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularVelocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },

        // linearDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // fixedRotation: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },
        // linearFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // sleepSpeedLimit: { type: 'number', default: 0.1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },
        // sleepTimeLimit: { type: 'number', default: 1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },

        // material: { type: 'asset' },
        // collisionResponse: { type: 'boolean', default: true },
        // collisionFilterGroup: { type: 'int', default: 1 },
        // collisionFilterMask: { type: 'int', default: - 1 },
    },
    icon: ``,
    color: '#1365C2',
    group: [ 'Entity3D' ],
};

ComponentManager.register('rigidbody', Rigidbody);
