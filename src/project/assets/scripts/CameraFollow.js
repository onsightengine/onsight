import { Script } from '../Script.js';

class CameraFollow extends Script {

    constructor() {
		super();

		this.name = 'Camera Follow';

        this.source =
`
let controls;

function update(delta) {

    if (!controls) {
        camera.position.x = this.position.x;
        camera.position.y = this.position.y;
        camera.position.z = this.position.z + 6;
        controls = new ONE.OrbitControls(camera, renderer.domElement, this);
    }

    // controls.target.set(this.position.x, this.position.y, this.position.z);
    controls.centerOnTarget(this);

    controls.update(delta);

}
`;

    }

}

export { CameraFollow };
