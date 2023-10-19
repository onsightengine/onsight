import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

const styles = [ 'dynamic', 'fixed' ]; // 'static', 'kinematic'
const colliders = [ 'geometry', 'shape' ];
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
        const world = SceneManager.app?.scene?.physics?.backend;
        const entity = this.entity;
        if (!world || !entity) return;

        // Shape
        let shape = undefined;
        if (this.data.collider === 'geometry') {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent ? geometryComponent.backend : undefined;
            const parameters = geometry ? geometry.parameters : undefined;
            if (geometry && parameters) {
                if (geometry.type === 'BoxGeometry') {
                    const sx = (parameters.width / 2) * entity.scale.x;
                    const sy = (parameters.height / 2) * entity.scale.y;
                    const sz = (parameters.depth / 2) * entity.scale.z;
                    shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);

                } else if (geometry.type === 'SphereGeometry') {
                    const radius = (parameters.radius) * Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
                    shape = RAPIER.ColliderDesc.ball(radius);

                } else {

                    // MESH COLLIDER

                }
            }

        } else if (this.data.collider === 'shape') {
            if (this.data.shape === 'ball') {
                const radius = (0.5) * Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
                shape = RAPIER.ColliderDesc.ball(radius);

            } else if (this.data.shape === 'cuboid') {
                const sx = (0.5) * entity.scale.x; /* radius, i.e. "width / 2" */
                const sy = (0.5) * entity.scale.y;
                const sz = (0.5) * entity.scale.z;
                shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);

            }
        }
        if (!shape) return;

        // Mass & Restitution (Bounce)
        // AUTO ... OR ... shape.setMass(this.data.mass);
        shape.setRestitution(this.data.bounce ?? 0);

        // Body
        let description = undefined;
        if (this.data.style === 'fixed') { description = RAPIER.RigidBodyDesc.fixed(); }
        else /* 'dynamic' */ { description = RAPIER.RigidBodyDesc.dynamic(); }
        description.setTranslation(...entity.position);
        description.setRotation(entity.quaternion);
        const rigidbody = world.createRigidBody(description);
        this.backend = rigidbody;

        // Collider
        world.createCollider(shape, rigidbody);
    }

    onUpdate(delta = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;

        if (this.data.style === 'fixed') {
            rigidbody.setTranslation(entity.position);
            rigidbody.setRotation(entity.quaternion);
            // rigidbody.setAngvel(_zero);
            // rigidbody.setLinvel(_zero);

        } else {
            entity.position.copy(rigidbody.translation());
            _quaternion.copy(rigidbody.rotation());
            entity.rotation.setFromQuaternion(_quaternion, undefined, false);
        }
    }

    onRemove() {
        //
        // TODO: Removed from Scene
        //
    }

    /********** CUSTOM */

    colliderGeometry() {
        const data = this.data;
        if (this.data.collider === 'geometry') {
            const entity = this.entity;
            if (entity) {
                const geometryComponent = entity.getComponent('geometry');
                const geometry = geometryComponent ? geometryComponent.backend : undefined;
                return (geometry && typeof geometry.clone === 'function') ? geometry.clone() : undefined;
            }
        } else if (data.collider === 'shape') {
            if (data.shape === 'ball') {
                // shape = RAPIER.ColliderDesc.ball(0.5);
                return new THREE.SphereGeometry(0.5, 32);
            } else if (data.shape === 'cuboid') {
                // shape = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5); /* radius, i.e. "width / 2" */
                return new THREE.BoxGeometry(1, 1, 1);
            }
        }
        return undefined;
    }

    colliderStyle() {
        return this.data.style ?? 'fixed';
    }

}

Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },

        // DIVIDER
        styleDivider: { type: 'divider' },

        // Shape
        collider: { type: 'select', default: 'shape', select: colliders, rebuild: true },
        shape: { type: 'select', default: 'cuboid', select: shapes, if: { collider: [ 'shape' ] } },

        // DIVIDER
        shapeDivider: { type: 'divider' },

        // Mass / Restitution (Bounciness) / Velocity
        // mass: { type: 'number', default: 1 },
        bounce: { type: 'slider', default: 0.5, min: 0, max: 1, precision: 2 },
        // velocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularVelocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },

        // linearDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // fixedRotation: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },
        // linearFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // sleepSpeedLimit: { type: 'number', default: 0.1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },
        // sleepTimeLimit: { type: 'number', default: 1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },

        // collisionResponse: { type: 'boolean', default: true },
        // collisionFilterGroup: { type: 'int', default: 1 },
        // collisionFilterMask: { type: 'int', default: - 1 },
    },
    icon: ``,
    color: '#0F4F94',
    multiple: false,
    group: [ 'Entity3D' ],
};

ComponentManager.register('rigidbody', Rigidbody);
