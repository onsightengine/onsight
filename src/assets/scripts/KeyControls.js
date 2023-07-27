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
    pixels: { type: 'number', default: 1 },
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

    // "Target" Position (for smooth scrolling OrbitControls)
    this.target = new THREE.Vector3().copy(position);
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
        position.lerp(this.target, event.delta * moveSpeed);
    }

    this.target.lerp(position, event.delta * moveSpeed);

    // Update Position
    this.position.x = ((this.target.x * 100) - (this.target.x * 100) % pixels) / 100;
    this.position.y = ((this.target.y * 100) - (this.target.y * 100) % pixels) / 100;
    this.position.z = ((this.target.z * 100) - (this.target.z * 100) % pixels) / 100;
}
`;

    }

}

export { KeyControls };
