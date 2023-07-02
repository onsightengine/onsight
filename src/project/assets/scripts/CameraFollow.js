import { Script } from '../Script.js';

class CameraFollow extends Script {

    constructor() {
		super();

		this.name = 'Camera Follow';

        this.source =
`
let controls;

function update(event) {

    if (!controls) {
        controls = new ONE.OrbitControls(camera, renderer.domElement);
    }

    controls.target.set(this.position.x, this.position.y, this.position.z);
    controls.update();

	// camera.position.x = this.position.x;
    // camera.position.y = this.position.y;
    // camera.position.z = this.position.z + 6;

}
`;

    }

}

export { CameraFollow };
