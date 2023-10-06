// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js

import * as THREE from 'three';
import RAPIER from 'rapier';

const _matrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _vector = new THREE.Vector3();
const _zero = new THREE.Vector3();

function getCollider(geometry) {
    const parameters = geometry.parameters;
    //
    // TODO change type to isBoxGeometry, isSphereGeometry, etc
    //
    if (geometry.type === 'BoxGeometry') {
        const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
        const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
        const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
        return RAPIER.ColliderDesc.cuboid(sx, sy, sz);

    } else if (geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry') {
        const radius = parameters.radius !== undefined ? parameters.radius : 1;
        return RAPIER.ColliderDesc.ball(radius);
    }
    return null;
}

function RapierPhysics(gravityX = 0, gravityY = -9.81, gravityZ = 0) {
    const gravity = new THREE.Vector3(gravityX, gravityY, gravityZ);
    const world = new RAPIER.World(gravity);

    const meshes = [];
    const meshMap = new WeakMap();

    function addMesh(mesh, mass = 0, restitution = 0) {
        const shape = getCollider(mesh.geometry);
        if (!shape) return;

        shape.setMass(mass);
        shape.setRestitution(restitution);

        const body = mesh.isInstancedMesh
            ? createInstancedBody(mesh, mass, shape)
            : createBody(mesh.position, mesh.quaternion, mass, shape);

        if (mass > 0) {
            meshes.push(mesh);
            meshMap.set(mesh, body);
        }
    }

    function createInstancedBody(mesh, mass, shape) {
        const array = mesh.instanceMatrix.array;
        const bodies = [];

        for (let i = 0; i < mesh.count; i++) {
            const position = _vector.fromArray(array, i * 16 + 12);
            bodies.push( createBody(position, null, mass, shape));

        }
        return bodies;
    }

    function createBody(position, quaternion, mass, shape) {
        const desc = (mass > 0) ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
        desc.setTranslation(...position);
        if (quaternion) desc.setRotation(quaternion);
        const body = world.createRigidBody(desc);
        world.createCollider(shape, body);
        return body;
    }

    function setMeshPosition(mesh, position, index = 0) {
        let body = meshMap.get(mesh);
        if (mesh.isInstancedMesh) body = body[index];
        body.setAngvel(_zero);
        body.setLinvel(_zero);
        body.setTranslation(position);
    }

    function setMeshVelocity(mesh, velocity, index = 0) {
        let body = meshMap.get(mesh);
        if (mesh.isInstancedMesh) body = body[index];
        body.setLinvel(velocity);
    }

    /***** STEP *****/

    function step(dt) {
        world.timestep = dt;
        world.step();

        for (let i = 0, l = meshes.length; i < l; i++) {
            const mesh = meshes[i];

            if (mesh.isInstancedMesh) {
                const array = mesh.instanceMatrix.array;
                const bodies = meshMap.get(mesh);

                for (let j = 0; j < bodies.length; j++) {
                    const body = bodies[j];
                    const position = body.translation();
                    _quaternion.copy(body.rotation());
                    _matrix.compose(position, _quaternion, _scale).toArray(array, j * 16);
                }
                mesh.instanceMatrix.needsUpdate = true;
                mesh.computeBoundingSphere();

            } else {
                const body = meshMap.get(mesh);
                mesh.position.copy(body.translation());
                mesh.quaternion.copy(body.rotation());
            }
        }
    }

    return {
        addMesh: addMesh,
        setMeshPosition: setMeshPosition,
        setMeshVelocity: setMeshVelocity,
        step: step,
        world: world,
    };

}

export { RapierPhysics };
