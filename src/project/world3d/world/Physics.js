// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js

import * as THREE from 'three';
import RAPIER from 'rapier';

import { AssetManager } from '../../../app/AssetManager.js';
import { ComponentManager } from '../../../app/ComponentManager.js';

await RAPIER.init(); /* init engine, docs: https://rapier.rs/docs/api/javascript/JavaScript3D */

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _vector = new THREE.Vector3();
const _zero = new THREE.Vector3();

let boxes, balls;

class Physics {

    init(data = {}) {
        // Generate Backend
        let physics = undefined;

        // Initialize
        if (data.active) {
            physics = new RapierWorld();
        }

        // Save Backend / Data
        this.backend = physics;
        this.data = data;
    }

    attach() {
        if (this.data.active && !this.backend) this.backend = new RapierWorld();
        const physics = this.backend;
        if (physics) {
            buildWorld(this);
        }
    }

    detach() {
        const physics = this.backend;
        if (physics) {
            physics.clear();
        }
    }

    step(delta = 0) {
        const physics = this.backend;
        if (!physics) return;

        // Physics Update
        const boxIndex = Math.floor(Math.random() * boxes.count);
        const ballIndex = Math.floor(Math.random() * balls.count);
        physics.setMeshPosition(boxes, _position.set(0, Math.random() + 1, 0), boxIndex);
        physics.setMeshPosition(balls, _position.set(0, Math.random() + 1, 0), ballIndex);

        // Step
        if (delta > 0.01) physics.step(delta);
    }

}

Physics.config = {
    schema: {

        active: { type: 'hidden', default: false },

    },
    icon: ``,
    color: '#202020',
    multiple: false,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('physics', Physics);

/******************** INTERNAL ********************/

function buildWorld(component) {
    const physics = component.backend;
    const scene = component.entity;
    if (!physics || !scene || !scene.isScene) return;

    const material = new THREE.MeshLambertMaterial();
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    // FLOOR
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 10),
        new THREE.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false }),
    );
    floor.position.y = - 2.5;
    floor.receiveShadow = true;
    scene.add(floor);
    physics.addMesh(floor);

    // BOXES
    const geometryBox = new THREE.BoxGeometry(0.075, 0.075, 0.075);
    boxes = new THREE.InstancedMesh(geometryBox, material, 400);
    boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    boxes.castShadow = true;
    boxes.receiveShadow = true;
    scene.add(boxes);

    for (let i = 0; i < boxes.count; i++) {
        matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
        boxes.setMatrixAt(i, matrix );
        boxes.setColorAt(i, color.setHex(0xffffff * Math.random()));
    }
    physics.addMesh(boxes, 1);

    // SPHERES
    const geometrySphere = new THREE.IcosahedronGeometry(0.05, 4);
    balls = new THREE.InstancedMesh(geometrySphere, material, 400);
    balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    balls.castShadow = true;
    balls.receiveShadow = true;
    scene.add(balls);

    for (let i = 0; i < balls.count; i++) {
        matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
        balls.setMatrixAt(i, matrix);
        balls.setColorAt(i, color.setHex( 0xffffff * Math.random()));
    }
    physics.addMesh(balls, 1);
}

class RapierWorld {
    #gravity;
    #world = null;
    #meshes = [];
    #meshMap = new WeakMap();

    constructor(gravityX = 0, gravityY = -9.81, gravityZ = 0) {
        this.#gravity = new THREE.Vector3(gravityX, gravityY, gravityZ);
        this.#world = new RAPIER.World(this.#gravity);
    }

    clear() {
        if (this.#world) this.#world.free();
        this.#meshes.length = 0;
        this.#meshMap = new WeakMap();
    }

    addMesh(mesh, mass = 0, restitution = 0) {
        let shape = undefined;
        const parameters = mesh.geometry.parameters;
        //
        // TODO change type to isBoxGeometry, isSphereGeometry, etc
        //
        if (mesh.geometry.type === 'BoxGeometry') {
            const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
            const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
            const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
            shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
        } else if (mesh.geometry.type === 'SphereGeometry' || mesh.geometry.type === 'IcosahedronGeometry') {
            const radius = parameters.radius !== undefined ? parameters.radius : 1;
            shape = RAPIER.ColliderDesc.ball(radius);
        }
        if (shape) {
            shape.setMass(mass);
            shape.setRestitution(restitution);
            const body = mesh.isInstancedMesh
                ? this.createInstancedBody(mesh, mass, shape)
                : this.createBody(mesh.position, mesh.quaternion, mass, shape);
            if (mass > 0) {
                this.#meshes.push(mesh);
                this.#meshMap.set(mesh, body);
            }
        }
    }

    createInstancedBody(mesh, mass, shape) {
        const array = mesh.instanceMatrix.array;
        const bodies = [];
        for (let i = 0; i < mesh.count; i++) {
            const position = _vector.fromArray(array, i * 16 + 12);
            bodies.push(this.createBody(position, null, mass, shape));
        }
        return bodies;
    }

    createBody(position, quaternion, mass, shape) {
        const desc = (mass > 0) ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
        desc.setTranslation(...position);
        if (quaternion) desc.setRotation(quaternion);
        const body = this.#world.createRigidBody(desc);
        this.#world.createCollider(shape, body);
        return body;
    }

    setMeshPosition(mesh, position, index = 0) {
        let body = this.#meshMap.get(mesh);
        if (mesh.isInstancedMesh) body = body[index];
        body.setAngvel(_zero);
        body.setLinvel(_zero);
        body.setTranslation(position);
    }

    setMeshVelocity(mesh, velocity, index = 0) {
        let body = this.#meshMap.get(mesh);
        if (mesh.isInstancedMesh) body = body[index];
        body.setLinvel(velocity);
    }

    step(dt) {
        this.#world.timestep = dt;
        this.#world.step();

        for (const mesh of this.#meshes) {
            if (mesh.isInstancedMesh) {
                const array = mesh.instanceMatrix.array;
                const bodies = this.#meshMap.get(mesh);
                for (let j = 0; j < bodies.length; j++) {
                    const body = bodies[j];
                    const position = body.translation();
                    _quaternion.copy(body.rotation());
                    _matrix.compose(position, _quaternion, _scale).toArray(array, j * 16);
                }
                mesh.instanceMatrix.needsUpdate = true;
                mesh.computeBoundingSphere();
            } else {
                const body = this.#meshMap.get(mesh);
                mesh.position.copy(body.translation());
                mesh.quaternion.copy(body.rotation());
            }
        }
    }
}
