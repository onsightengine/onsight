// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js
// https://github.com/pmndrs/react-three-rapier

import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const styles = [ 'dynamic', 'fixed' ]; // 'static', 'kinematic'
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
        const data = this.data;
        if (!world || !entity) return;

        // Rigidbody
        const description = (data.style === 'fixed')
            ? RAPIER.RigidBodyDesc.fixed()
            : RAPIER.RigidBodyDesc.dynamic();
        description.setTranslation(...entity.position);
        description.setRotation(entity.quaternion);
        const rigidbody = world.createRigidBody(description);
        this.backend = rigidbody; /* save to backend */

        // Shape Properties
        function addColliderToRigidBody(colliderDescription) {
            // Mass (Auto)
            // MANUAL: colliderDescription.setMass(data.mass);
            // Restitution (Bounce)
            colliderDescription.setRestitution(data.bounce ?? 0);
            // Add to Rigidbody
            world.createCollider(colliderDescription, rigidbody);
        }

        // Collider Description
        if (data.collider === 'auto') {
            entity.traverseEntities((child) => {
                const geometryComponent = child.getComponent('geometry');
                const geometry = geometryComponent.backend;
                if (geometry && geometry.isBufferGeometry) {
                    let colliderDescription = undefined;
                    switch (data.generate) {
                        case 'box':
                            geometry.computeBoundingBox();
                            geometry.boundingBox.getSize(_size);
                            const sx = Math.abs(_size.x / 2);
                            const sy = Math.abs(_size.y / 2);
                            const sz = Math.abs(_size.z / 2);
                            colliderDescription = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
                            break;

                        case 'sphere':
                            geometry.computeBoundingSphere();
                            const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                            colliderDescription = RAPIER.ColliderDesc.ball(radius);
                            break;

                        case 'hull':
                            const points = new Float32Array(geometry.attributes.position.array);
                            colliderDescription = RAPIER.ColliderDesc.convexHull(points);
                            break;

                        case 'mesh':
                            const vertices = new Float32Array(geometry.attributes.position.array);
                            const indices = (geometry.index)
                                ? new Uint32Array(geometry.index.array)
                                : new Uint32Array([...Array(vertices.length / 3).keys()]);
                            colliderDescription = RAPIER.ColliderDesc.trimesh(vertices, indices);
                            break;
                    }
                    if (colliderDescription) {
                        if (child !== entity) {
                            _matrix.copy(child.matrix);
                            let parent = child.parent;
                            while (parent !== entity) {
                                _matrix.multiply(parent.matrix);
                                parent = parent.parent;
                            }
                            _matrix.decompose(_position, _quaternion, _scale);
                            colliderDescription.setRotation(_quaternion);
                            colliderDescription.setTranslation(..._position);
                        }
                        addColliderToRigidBody(colliderDescription);
                    }
                }
            });

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
        //
    }

    onUpdate(delta = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        const data = this.data;
        if (!rigidbody || !entity) return;

        if (data.style === 'fixed') {
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
        const entity = this.entity;
        const data = this.data;
        if (!data || !entity) return undefined;

        if (data.collider && data.collider === 'auto' && entity.isEntity) {
            const geometries = [];
            entity.traverseEntities((child) => {
                let childGeometry = undefined;
                const geometryComponent = child.getComponent('geometry');
                const geometry = geometryComponent ? geometryComponent.backend : undefined;
                if (geometry && geometry.isBufferGeometry) {
                    switch (data.generate) {
                        case 'box':
                            geometry.computeBoundingBox();
                            geometry.boundingBox.getSize(_size);
                            const sx = Math.abs(_size.x);
                            const sy = Math.abs(_size.y);
                            const sz = Math.abs(_size.z);
                            childGeometry = new THREE.BoxGeometry(sx, sy, sz);
                            geometry.boundingBox.getCenter(_center);
                            childGeometry.translate(_center.x, _center.y, _center.z);
                            break;
                        case 'sphere':
                            geometry.computeBoundingSphere();
                            const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                            childGeometry = new THREE.SphereGeometry(radius, 32);
                            _center.copy(geometry.boundingSphere.center);
                            childGeometry.translate(_center.x, _center.y, _center.z);
                            break;
                        case 'hull':
                            const vertices = [];
                            const positionAttribute = geometry.getAttribute('position');
                            for (let i = 0; i < positionAttribute.count; i++) {
                                const vertex = new THREE.Vector3();
                                vertex.fromBufferAttribute(positionAttribute, i);
                                vertices.push(vertex);
                            }
                            childGeometry = new ConvexGeometry(vertices);
                            break;
                        case 'mesh':
                            childGeometry = geometry.clone();
                            break;
                    }
                }
                if (childGeometry) {
                    if (child !== entity) {
                        _matrix.copy(child.matrix);
                        let parent = child.parent;
                        while (parent !== entity) {
                            _matrix.multiply(parent.matrix);
                            parent = parent.parent;
                        }
                        _matrix.decompose(_position, _quaternion, _scale);
                        childGeometry.scale(_scale.x, _scale.y, _scale.z);
                        childGeometry.applyQuaternion(_quaternion);
                        childGeometry.translate(_position.x, _position.y, _position.z);
                    }
                    geometries.push(childGeometry);
                }
            });
            if (geometries.length > 0) {
                const visualGeometry = mergeGeometries(geometries);
                for (const geometry of geometries) geometry.dispose();
                return visualGeometry;
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
