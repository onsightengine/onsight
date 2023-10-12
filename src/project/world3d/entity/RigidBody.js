import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

const styles = [ 'dynamic', 'fixed' ]; // 'static', 'kinematic'
const shapes = [ 'ball', 'cuboid' ];

const _quaternion = new THREE.Quaternion();
const _zero = new THREE.Vector3();

class Rigidbody {

    init(data = {}) {
        // Generate Backend
        let rigidbody = undefined;

        // Save Backend / Data
        this.backend = rigidbody;
        this.data = data;
    }

    /********** APP EVENTS */

    onLoad() {
        // if (mesh.geometry.type === 'BoxGeometry') {
        //     const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
        //     const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
        //     const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
        //     shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
        // } else if (mesh.geometry.type === 'SphereGeometry' || mesh.geometry.type === 'IcosahedronGeometry') {
        //     const radius = parameters.radius !== undefined ? parameters.radius : 1;
        //     shape = RAPIER.ColliderDesc.ball(radius);
        // }

        const mass = 1; // 0 == fixed
        const restitution = 0;
        const shape = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
        shape.setMass(mass);
        shape.setRestitution(restitution);

        const world = SceneManager.app?.scene?.physics?.backend;
        const entity = this.entity;
        if (world && entity) {
            // Body
            let description;
            if (this.data.style === 'fixed' /* || this.data.mass <= 0 */) {
                description = RAPIER.RigidBodyDesc.fixed();
            } else /* if this.data.style === 'dynamic') */ {
                description = RAPIER.RigidBodyDesc.dynamic();
            }
            description.setTranslation(...entity.position);
            description.setRotation(entity.quaternion);
            const rigidbody = world.createRigidBody(description);
            this.backend = rigidbody;

            // Collider
            world.createCollider(shape, rigidbody);
        }

    }

    onUpdate(delta = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;

        if (this.data.style === 'fixed') {
            rigidbody.setTranslation(entity.position);
            // rigidbody.setAngvel(_zero);
            // rigidbody.setLinvel(_zero);
            // rigidbody.setTranslation(position);
        } else {
            entity.position.copy(rigidbody.translation());
            _quaternion.copy(rigidbody.rotation());
            entity.rotation.setFromQuaternion(_quaternion, undefined, false);
        }
    }

}

Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },

        // DIVIDER
        styleDivider: { type: 'divider' },

        // Shape
        shape: { type: 'select', default: 'cuboid', select: shapes },

        // DIVIDER
        shapeDivider: { type: 'divider' },

        // Mass / Velocity
        mass: { type: 'number', default: 1 },
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
    multiple: false,
    group: [ 'Entity3D' ],
};

ComponentManager.register('rigidbody', Rigidbody);
