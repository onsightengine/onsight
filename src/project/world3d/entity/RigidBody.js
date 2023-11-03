// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js
// https://github.com/pmndrs/react-three-rapier

import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

const styles = [ 'dynamic', 'fixed' ]; // 'static', 'kinematic'
const colliders = [ 'auto', 'ball', 'capsule', 'cone', 'cuboid', 'cylinder' ];
const automatic = [ 'box', 'sphere', 'hull', 'mesh' ];

const _center = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _size = new THREE.Vector3();
const _zero = new THREE.Vector3();

class Rigidbody {

    init(data = {}) {
        // Generate Backend
        let collider = undefined;
        let rigidbody = undefined;
        let shape = undefined;

        // Save Backend / Data
        this.backend = {
            collider,
            rigidbody,
            shape,
        };
        this.data = data;
    }

    /********** APP EVENTS */

    onLoad() {
        const world = SceneManager.app?.scene?.physics?.backend;
        const entity = this.entity;
        if (!world || !entity) return;

        // Shape
        let shape = undefined;
        if (this.data.collider === 'auto') {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent.backend;
            if (geometry && geometry.isBufferGeometry) {
                switch (this.data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs(_size.x / 2);
                        const sy = Math.abs(_size.y / 2);
                        const sz = Math.abs(_size.z / 2);
                        shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
                        break;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        shape = RAPIER.ColliderDesc.ball(radius);
                        break;
                    case 'hull':
                        //
                        // TODO
                        //

                        // clonedGeometry.attributes.position.array as Float32Array,
                        // clonedGeometry.index?.array as Uint32Array

                        shape = RAPIER.ColliderDesc.convexHull(geometry.attributes.position.array);

                        break;
                    case 'mesh':
                        //
                        // TODO
                        //
                        break;
                }
            }

        } else if (this.data.collider === 'ball') {
            const radius = (0.5) * Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
            shape = RAPIER.ColliderDesc.ball(radius);

        } else if (this.data.collider === 'capsule') {
            //
            // TODO
            //
        } else if (this.data.collider === 'cone') {
            //
            // TODO
            //
        } else if (this.data.collider === 'cuboid') {
            const sx = (0.5) * entity.scale.x; /* radius, i.e. "width / 2" */
            const sy = (0.5) * entity.scale.y;
            const sz = (0.5) * entity.scale.z;
            shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);

        } else if (this.data.collider === 'cylinder') {
            const sy = (0.5) * entity.scale.y;
            const radius = (0.5) * Math.max(entity.scale.x, entity.scale.z);
            shape = RAPIER.ColliderDesc.cylinder(sy, radius);

        }
        // ADDITIONAL COLLIDERS:
        // - 'heightField'
        // - 'polyline'
        if (!shape) {
            return;
        } else {
            // Restitution (Bounce)
            shape.setRestitution(this.data.bounce ?? 0);
            // Mass, Auto
            // ... OR ...
            // shape.setMass(this.data.mass);
        }

        // Rigidbody
        let description = undefined;
        if (this.data.style === 'fixed') {
            description = RAPIER.RigidBodyDesc.fixed();
        } else /* 'dynamic' */ {
            description = RAPIER.RigidBodyDesc.dynamic();
        }
        description.setTranslation(...entity.position);
        description.setRotation(entity.quaternion);
        const rigidbody = world.createRigidBody(description);

        // Collider
        const collider = world.createCollider(shape, rigidbody);

        // Save to Backend
        this.backend.collider = collider;
        this.backend.rigidbody = rigidbody;
        this.backend.shape = shape;
    }

    onUpdate(delta = 0) {
        const rigidbody = this.backend?.rigidbody;
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
        let visualGeometry = undefined;

        if (this.data.collider && this.data.collider === 'auto' && this.entity && this.entity.isEntity) {
            const geometryComponent = this.entity.getComponent('geometry');
            const geometry = geometryComponent ? geometryComponent.backend : undefined;
            if (geometry && geometry.isBufferGeometry) {
                //
                // TODO: Compute bounding box / bounding sphere of Entity + all children (
                //       (not just single geometry component)
                let needsCenter = false;
                switch (this.data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs(_size.x);
                        const sy = Math.abs(_size.y);
                        const sz = Math.abs(_size.z);
                        visualGeometry = new THREE.BoxGeometry(sx, sy, sz);
                        needsCenter = true;
                        break;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        visualGeometry = new THREE.SphereGeometry(radius, 32);
                        needsCenter = true;
                        break;
                    case 'hull':

                        const vertices = [];
				        const positionAttribute = geometry.getAttribute('position');
                        for (let i = 0; i < positionAttribute.count; i++) {
					        const vertex = new THREE.Vector3();
					        vertex.fromBufferAttribute(positionAttribute, i);
					        vertices.push(vertex);
				        }
                        visualGeometry = new ConvexGeometry(vertices);

                        break;
                    case 'mesh':
                        //
                        // TODO
                        //
                        visualGeometry = geometry.clone();
                        break;
                }
                if (needsCenter) {
                    geometry.computeBoundingBox();
                    geometry.boundingBox.getCenter(_center);
                    visualGeometry.translate(_center.x, _center.y, _center.z);
                }
            }
        }

        switch (this.data.collider) {
            case 'ball':
                visualGeometry = new THREE.SphereGeometry(0.5, 32);
                break;
            case 'capsule':
                //
                // TODO
                //
                break;
            case 'cone':
                //
                // TODO
                //
                break;
            case 'cuboid':
                visualGeometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'cylinder':
                visualGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1);
                break;
        }

        return visualGeometry;
    }

    colliderShape() {
        return this.data.collider ?? 'auto';
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
        collider: { type: 'select', default: 'auto', select: colliders, rebuild: true },
        generate: { type: 'select', default: 'box', select: automatic, if: { collider: [ 'auto' ] } },

        // DIVIDER
        shapeDivider: { type: 'divider' },

        // Mass / Restitution (Bounciness)
        // mass: { type: 'number', default: 1 },
        bounce: { type: 'slider', default: 0.5, min: 0, max: 1, precision: 2 },

        // Friction
        // friction: { type: 'slider', default: 0.5 },

        // Velocity
        // velocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularVelocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },

        // MORE //

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
