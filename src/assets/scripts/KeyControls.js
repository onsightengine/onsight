import { Script } from '../Script.js';

class KeyControls extends Script {

    constructor() {
        super();

        this.name = 'Key Controls';
        this.category = 'controls';
        this.source =
`
// Properties
let variables = {
    moveSpeed: { type: 'number', default: 5 },
    keyLeft: { type: 'key', default: 'ArrowLeft' },
    keyRight: { type: 'key', default: 'ArrowRight' },
    keyUp: { type: 'key', default: 'ArrowUp' },
    keyDown: { type: 'key', default: 'ArrowDown' },
};

// Locals
let position;

function init() {
    // Starting Position
    position = new THREE.Vector3().copy(this.position);

    // "Actual" Position (for smooth scrolling OrbitControls)
    this.actual = new THREE.Vector3().copy(position);
}

function update(event) {
    // Movement
    if (app.keys[keyLeft] || app.keys[keyRight] || app.keys[keyUp] || app.keys[keyDown]) {
        if (app.keys[keyLeft]) position.x -= moveSpeed / 100;
        if (app.keys[keyRight]) position.x += moveSpeed / 100;
        if (app.keys[keyUp]) position.y += moveSpeed / 100;
        if (app.keys[keyDown]) position.y -= moveSpeed / 100;
    } else {
        // Dissipate Movement
        position.lerp(this.position, event.delta * moveSpeed);
    }

    this.actual.lerp(position, event.delta * moveSpeed);

    // Update Position
    this.position.x = ((this.actual.x * 100) - (this.actual.x * 100) % pixels) / 100;
    this.position.y = ((this.actual.y * 100) - (this.actual.y * 100) % pixels) / 100;
    this.position.z = ((this.actual.z * 100) - (this.actual.z * 100) % pixels) / 100;
}
`;

    }

}

export { KeyControls };
