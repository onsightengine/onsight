import { Script } from '../Script.js';

class DrivingControls extends Script {

    constructor() {
        super();

        this.name = 'Driving Controls';
        this.category = 'controls';
        this.source =
`
// Properties
let variables = {
    axis: { type: 'select', default: 'XY (2D)', select: [ 'XY (2D)', 'XZ (3D)' ] },
    moveSpeed: { type: 'number', default: 5 },
    turnSpeed: { type: 'number', default: 5 },
    keyLeft: { type: 'key', default: 'ArrowLeft' },
    keyRight: { type: 'key', default: 'ArrowRight' },
    keyUp: { type: 'key', default: 'ArrowUp' },
    keyDown: { type: 'key', default: 'ArrowDown' },
};

// Locals
let position, rotation;
let direction;
let quaternion;
let up;
let spin;

function init() {
    // Prep Variables
    moveSpeed /= 100;
    turnSpeed /= 100;

    // Initialize Temp Variables
    position = new THREE.Vector3();
    rotation = new THREE.Vector3();
    direction = new THREE.Vector3();
    quaternion = new THREE.Quaternion();
    up = new THREE.Vector3();
    spin = new THREE.Vector3();

    // Movement Type
    if (axis === 'XY (2D)') {
        spin.z = turnSpeed;
        up.y = 1;
    }
    if (axis === 'XZ (3D)') {
        spin.y = turnSpeed;
        moveSpeed *= -1;
        up.z = 1;
    }

    // Starting Position
    position.copy(this.position);
}

function update(event) {
    // Rotate
    if (app.keys[keyLeft] || app.keys[keyRight]) {
        rotation.setFromEuler(this.rotation);
        if (app.keys[keyLeft]) rotation.add(spin);
        if (app.keys[keyRight]) rotation.sub(spin);
        this.rotation.setFromVector3(rotation);
    }

    // Movement
    if (app.keys[keyUp] || app.keys[keyDown]) {
        this.getWorldQuaternion(quaternion);
        direction.copy(up).applyQuaternion(quaternion);
        direction.multiplyScalar(moveSpeed);
        if (app.keys[keyUp]) position.add(direction);
        if (app.keys[keyDown]) position.sub(direction);
    } else {
        // Dissipate Movement
        position.lerp(this.position, event.delta * 10);
    }

    // Update Position
    this.position.lerp(position, event.delta * 10);
}
`;

    }

}

export { DrivingControls };
