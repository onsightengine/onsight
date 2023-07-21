import { Script } from '../Script.js';

class DragControls extends Script {

    constructor() {
        super();

        this.name = 'Drag Controls';
        this.category = 'controls';
        this.source =
`
// Properties
let variables = {
    updateSpeed: { type: 'slider', default: 10, min: 0, max: 50 },
};

// Locals
let downOnEntity = false;
let position;
let pointer;
let camera;

function init() {
    position = new THREE.Vector3();
    pointer = new THREE.Vector3();
    camera = new THREE.Vector3();

    // Starting Position
    position.copy(this.position);
}

function pointerdown(event) {
    if (event.entity === this && event.button !== 2) {
        const coords = app.gameCoordinates(event);
        pointer.copy(coords ? coords : this.position);
        camera.copy(app.camera.position);
        downOnEntity = true;
    }
}

function pointermove(event) {
    if (downOnEntity) {
        const coords = app.gameCoordinates(event);
        if (coords) pointer.copy(coords);
    }
}

function pointerup(event) {
    downOnEntity = false;
}

function update(event) {
    if (downOnEntity) {
        // Update Pointer
        if (downOnEntity) position.lerp(pointer, event.delta * updateSpeed);

        // Camera Moved?
        pointer.x += app.camera.position.x - camera.x;
        pointer.y += app.camera.position.y - camera.y;
        pointer.z += app.camera.position.z - camera.z;
        camera.copy(app.camera.position);
    } else {
        // Dissipate Target
        position.lerp(this.position, event.delta * updateSpeed);
    }

    // Update Position
    this.position.lerp(position, event.delta * updateSpeed);
}

`;

    }

}

export { DragControls };
