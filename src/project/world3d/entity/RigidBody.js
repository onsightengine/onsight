// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js
// https://github.com/pmndrs/react-three-rapier

// RIGIDBODY DESCRIPTION
// rigidbodyDesc = RAPIER.RigidBodyDesc.fixed();
// rigidbodyDesc = RAPIER.RigidBodyDesc.dynamic();
// rigidbodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
// rigidbodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
// rigidbodyDesc.setTranslation(x, y, z);
// rigidbodyDesc.setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0});
// rigidbodyDesc.setLinvel(x, y, z);
// rigidbodyDesc.setAngvel({ x, y, z });
// rigidbodyDesc.setGravityScale(1.0);
// rigidbodyDesc.setCanSleep(true);
// rigidbodyDesc.setCcdEnabled(false);
// rigidbodyDesc.setAdditionalMass(0.0);
// rigidbodyDesc.enabledTranslations(x, y, z);
// rigidbodyDesc.enabledRotations(x, y, z);
// rigidbodyDesc.setLinearDamping(0.0)
// rigidbodyDesc.setAngularDamping(0.0);

// RIGIDBODY
// rigidBody = world.createRigidBody(rigidBodyDesc);
// rigidbody.setTranslation({ x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.setLinvel({ x, y, z }, wakeUp);
// rigidbody.setAngvel({ x, y, z }, wakeUp);
// rigidbody.setGravityScale(1.0, wakeUp);

// FORCES
// rigidbody.resetForces(true);
// rigidbody.resetTorques(true);
// rigidbody.addForce({ x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.addTorque({ x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.addForceAtPoint({ x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.applyImpulse({ x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.applyTorqueImpulse({ x: 0.0, y: 0.0, z: 0.0 }, wakeUp);
// rigidbody.applyImpulseAtPoint({ x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.0 }, wakeUp);

// LOCKING
// rigidbody.lockTranslations(true, wakeUp);
// rigidbody.lockRotations(true, wakeUp);
// rigidbody.setEnabledRotations(true, false, false, true /* x, y, z, wakeUp */);
// rigidbody.setEnabledTranslations(true, false, false, true /* x, y, z, wakeUp */);

// DAMPING
// rigidbody.setLinearDamping(0.0);
// rigidbody.setAngularDamping(0.0);

// DOMINANCE
// rigidbody.setDominanceGroup(0); /* higher group number ignores mass of lower number, range: -127 to 127 */

// COLLIDER DESCRIPTION
// colliderDesc.setDensity(data.density ?? 1.0);
// colliderDesc.setMass(data.mass); /* default: auto based on collider shape */
// colliderDesc.setFriction(data.friction ?? 0.5);
// colliderDesc.setRestitution(data.bounce ?? 0);

import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

const styles = [ 'fixed', 'dynamic', 'kinematic' ];
const colliders = [ 'auto', 'ball', 'capsule', 'cone', 'cuboid', 'cylinder' ];
const automatic = [ 'box', 'sphere', 'hull', 'mesh' ];

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _size = new THREE.Vector3();
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
        const data = this.data ?? {};
        if (!world || !entity) return;

        // Rigidbody Description
        let rigidbodyDesc = undefined;
        switch (data.style) {
            case 'dynamic':
                rigidbodyDesc = RAPIER.RigidBodyDesc.dynamic();
                break;
            case 'kinematic':
                // rigidbodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
                rigidbodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
                break;
            case 'fixed':
            default:
                rigidbodyDesc = RAPIER.RigidBodyDesc.fixed();
        }

        // Position
        rigidbodyDesc.setTranslation(...entity.position);
        rigidbodyDesc.setRotation(entity.quaternion);

        // Movement
        if (data.style === 'dynamic' || data.style === 'kinematic') {
            if (data.ccdEnabled != undefined) rigidbodyDesc.setCcdEnabled(Boolean(data.ccdEnabled));
            const velocity = data.linearVelocity;
            const angular = data.angularVelocity;
            if (Array.isArray(velocity) && velocity.length > 2) rigidbodyDesc.setLinvel(velocity[0], velocity[1], velocity[2]);
            if (Array.isArray(angular) && angular.length > 2) rigidbodyDesc.setAngvel({ x: angular[0], y: angular[1], z: angular[2] });
        }
        if (data.style === 'dynamic') {
            if (data.canSleep != undefined) rigidbodyDesc.setCanSleep(Boolean(data.canSleep));
            if (data.addMass != undefined) rigidbodyDesc.setAdditionalMass(parseFloat(data.addMass));
            if (data.gravityScale != undefined) rigidbodyDesc.setGravityScale(parseFloat(data.gravityScale));
            const linear = data.linearEnabled;
            const rotate = data.rotateEnabled;
            if (Array.isArray(linear) && linear.length > 2) rigidbodyDesc.enabledTranslations(linear[0], linear[1], linear[2]);
            if (Array.isArray(rotate) && rotate.length > 2) rigidbodyDesc.enabledRotations(rotate[0], rotate[1], rotate[2]);
            if (data.linearDamping != undefined) rigidbodyDesc.setLinearDamping(parseFloat(data.linearDamping));
            if (data.angularDamping != undefined) rigidbodyDesc.setAngularDamping(parseFloat(data.angularDamping));
        }

        // Rigidbody
        const rigidbody = world.createRigidBody(rigidbodyDesc);
        this.backend = rigidbody; /* save to backend */

        // Shape Properties
        function addColliderToRigidBody(colliderDesc) {
            ///// Mass (Auto)
            // colliderDesc.setMass(data.mass);                 /* default: auto based on collider shape */
            ///// Density
            colliderDesc.setDensity((data.density != undefined) ? data.density : 1.0);  /* default: 1.0 */
            ///// Friction
            colliderDesc.setFriction(data.friction);                                    /* default: 0.5 */
            ///// Restitution / Bounce
            colliderDesc.setRestitution(data.bounce ?? 0);                              /* default: 0.0 */
            ///// Add Collider to Rigidbody
            const collider = world.createCollider(colliderDesc, rigidbody);
            if (data.style === 'dynamic' || data.style === 'kinematic') {
                collider.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT | RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED);
                collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
            }
        }

        // Collider Description
        if (data.collider === 'auto') {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent.backend;
            if (geometry && geometry.isBufferGeometry) {
                switch (data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getCenter(_center);
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs((_size.x * entity.scale.x) / 2);
                        const sy = Math.abs((_size.y * entity.scale.y) / 2);
                        const sz = Math.abs((_size.z * entity.scale.z) / 2);
                        const cuboid = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
                        cuboid.setTranslation(_center.x * entity.scale.x, _center.y * entity.scale.y, _center.z * entity.scale.z);
                        addColliderToRigidBody(cuboid);
                        break;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        _center.copy(geometry.boundingSphere.center);
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        const maxSize = Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
                        const ball = RAPIER.ColliderDesc.ball(radius * maxSize);
                        ball.setTranslation(_center.x * entity.scale.x, _center.y * entity.scale.y, _center.z * entity.scale.z);
                        addColliderToRigidBody(ball);
                        break;
                    case 'hull':
                        const points = new Float32Array(geometry.attributes.position.array);
                        addColliderToRigidBody(RAPIER.ColliderDesc.convexHull(points));
                        break;
                    case 'mesh':
                        const vertices = new Float32Array(geometry.attributes.position.array);
                        const indices = (geometry.index)
                            ? new Uint32Array(geometry.index.array)
                            : new Uint32Array([...Array(vertices.length / 3).keys()]);
                        addColliderToRigidBody(RAPIER.ColliderDesc.trimesh(vertices, indices));
                        break;
                }
            }

        } else if (data.collider === 'ball') {
            const radius = (0.5) * Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
            addColliderToRigidBody(RAPIER.ColliderDesc.ball(radius));
        } else if (data.collider === 'capsule') {

            // TODO

        } else if (data.collider === 'cone') {

            // TODO

        } else if (data.collider === 'cuboid') {
            const sx = (0.5) * entity.scale.x; /* radius, i.e. "width / 2" */
            const sy = (0.5) * entity.scale.y;
            const sz = (0.5) * entity.scale.z;
            addColliderToRigidBody(RAPIER.ColliderDesc.cuboid(sx, sy, sz));
        } else if (data.collider === 'cylinder') {
            const sy = (0.5) * entity.scale.y;
            const radius = (0.5) * Math.max(entity.scale.x, entity.scale.z);
            addColliderToRigidBody(RAPIER.ColliderDesc.cylinder(sy, radius));
        }

        // MORE COLLIDER TYPES:
        // - 'heightField'
        // - 'polyline'
    }

    onUpdate(delta = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        const data = this.data ?? {};
        if (!rigidbody || !entity) return;

        if (data.style === 'fixed') {
            rigidbody.setTranslation(entity.position);
            rigidbody.setRotation(entity.quaternion);
        } else {
            entity.position.copy(rigidbody.translation());
            entity.rotation.setFromQuaternion(_quaternion.copy(rigidbody.rotation()), undefined, false);
        }
    }

    onRemove() {
        //
        // TODO: Removed from Scene
        //
    }

    /********** CUSTOM */

    setLinvel(x = 0, y = 0, z = 0, wakeUp = true) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;
        rigidbody.setLinvel({ x, y, z }, wakeUp);
    }

    setAngvel(x = 0, y = 0, z = 0, wakeUp = true) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;
        rigidbody.setAngvel({ x, y, z }, wakeUp);
    }

    colliderGeometry() {
        const entity = this.entity;
        const data = this.data ?? {};
        if (!data || !entity) return undefined;

        if (data.collider && data.collider === 'auto' && entity.isEntity) {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent ? geometryComponent.backend : undefined;
            if (geometry && geometry.isBufferGeometry) {
                switch (data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getCenter(_center);
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs(_size.x);
                        const sy = Math.abs(_size.y);
                        const sz = Math.abs(_size.z);
                        const boxGeometry = new THREE.BoxGeometry(sx, sy, sz);
                        boxGeometry.translate(_center.x, _center.y, _center.z);
                        return boxGeometry;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        _center.copy(geometry.boundingSphere.center);
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        const sphereGeometry = new THREE.SphereGeometry(radius, 32);
                        sphereGeometry.translate(_center.x, _center.y, _center.z);
                        return sphereGeometry;
                    case 'hull':
                        const vertices = [];
                        const positionAttribute = geometry.getAttribute('position');
                        for (let i = 0; i < positionAttribute.count; i++) {
                            const vertex = new THREE.Vector3();
                            vertex.fromBufferAttribute(positionAttribute, i);
                            vertices.push(vertex);
                        }
                        return new ConvexGeometry(vertices);
                    case 'mesh':
                        return geometry.clone();
                }
            }
        }

        switch (data.collider) {
            case 'ball':
                return new THREE.SphereGeometry(0.5, 32);
            case 'capsule':

                // TODO

                return undefined;
            case 'cone':

                // TODO

                return undefined;
            case 'cuboid':
                return new THREE.BoxGeometry(1, 1, 1);
            case 'cylinder':
                return new THREE.CylinderGeometry(0.5, 0.5, 1);
        }

        return undefined;
    }

    colliderShape() {
        return (this.data.collider === 'auto') ? this.data.generate : this.data.collider;
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

        // Options
        ccdEnabled: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },
        canSleep: { type: 'boolean', default: true, if: { style: [ 'dynamic' ] }, },
        gravityScale: { type: 'number', default: 1.0, if: { style: [ 'dynamic' ] }, },

        // Collider Properties (Mass, Restitution / Bounce, Friction)
        addMass: { type: 'number', default: 0, min: 0, if: { style: [ 'dynamic' ] }, },
        density: { type: 'number', default: 1.0, min: 0, step: 0.1, precision: 2, promode: true },
        bounce: { type: 'slider', default: 0, min: 0, max: 1, precision: 2 },
        friction: { type: 'slider', default: 0.5, min: 0, max: 10, precision: 2 },

        // DIVIDER
        moveDivider: { type: 'divider', if: { style: [ 'dynamic', 'kinematic' ] }, },

        // Movement
        linearVelocity: { type: 'vector', size: 3, tint: true, default: [ 0, 0, 0 ], step: 1.0, precision: 2, if: { style: [ 'dynamic', 'kinematic' ] } },
        angularVelocity: { type: 'vector', size: 3, tint: true, default: [ 0, 0, 0 ], step: 1.0, precision: 2, if: { style: [ 'dynamic', 'kinematic' ] } },
        linearEnabled: { type: 'option', size: 3, tint: true, default: [ true, true, true ], if: { style: [ 'dynamic' ] } },
        rotateEnabled: { type: 'option', size: 3, tint: true, default: [ true, true, true ], if: { style: [ 'dynamic' ] } },
        linearDamping: { type: 'number', default: 0.0, min: 0, step: 1.0, precision: 2, if: { style: [ 'dynamic' ] } },
        angularDamping: { type: 'number', default: 0.0, min: 0, step: 1.0, precision: 2, if: { style: [ 'dynamic' ] } },

        ///// POSSIBLE?? /////

        // collisionResponse: { type: 'boolean', default: true },
        // collisionFilterGroup: { type: 'int', default: 1 },
        // collisionFilterMask: { type: 'int', default: - 1 },

        /////
    },
    icon: ``,
    color: '#0F4F94',
    multiple: false,
    group: [ 'Entity3D' ],
};

ComponentManager.register('rigidbody', Rigidbody);
