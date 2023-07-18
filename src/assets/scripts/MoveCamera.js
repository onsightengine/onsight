import { Script } from '../Script.js';

class MoveCamera extends Script {

    constructor() {
		super();

		this.name = 'Move Camera';
        this.category = 'camera';
        this.source =
`
// Properties
let variables = {
    // Rotation in degress per second
    moveX: { type: 'number', default: 0 },
    moveY: { type: 'number', default: 1 },
    moveZ: { type: 'number', default: 0 },
};

function update(event) {
	app.camera.position.x += moveX * event.delta;
    app.camera.position.y += moveY * event.delta;
    app.camera.position.z += moveZ * event.delta;
}
`;

    }

}

export { MoveCamera };
