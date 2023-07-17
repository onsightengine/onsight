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
    updateSpeed: { type: 'slider', default: 10, min: 0, max: 60 },
};

// Locals
let downOnEntity = false;
let position, pointer;

function init() {
	// Starting Position
	position = new THREE.Vector3(); position.copy(this.position);
    pointer = new THREE.Vector3(); pointer.copy(this.position);
}

function pointerdown(event) {
    if (event.entity === this) {
        const coords = app.gameCoordinates(event);
        pointer.copy(coords ? coords : this.position);
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
    // Update Pointer
    if (downOnEntity) position.lerp(pointer, event.delta * updateSpeed);

	// Update Position
	this.position.lerp(position, event.delta * updateSpeed);
}

`;

    }

}

export { DragControls };
