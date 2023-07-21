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
    // Prep Variables
    moveSpeed /= 100;

    // Starting Position
    position = new THREE.Vector3();
    position.copy(this.position);
}

function update(event) {
    // Movement
    if (app.keys[keyLeft] || app.keys[keyRight] || app.keys[keyUp] || app.keys[keyDown]) {
        if (app.keys[keyLeft]) position.x -= moveSpeed;
        if (app.keys[keyRight]) position.x += moveSpeed;
        if (app.keys[keyUp]) position.y += moveSpeed;
        if (app.keys[keyDown]) position.y -= moveSpeed;
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

export { KeyControls };
