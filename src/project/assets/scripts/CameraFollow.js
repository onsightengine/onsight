import { Script } from '../Script.js';

class CameraFollow extends Script {

    constructor() {
		super();

		this.name = 'Camera Follow';
        this.category = 'camera';

        this.source =
`
let distance = 6;
let controls;

function init() {
    camera.position.x = this.position.x;
    camera.position.y = this.position.y;
    camera.position.z = this.position.z + distance;
    controls = new ONE.OrbitControls(camera, renderer.domElement, this);
}

function update(delta) {
    // controls.target.set(this.position.x, this.position.y, this.position.z);
    controls.centerOnTarget(this);

    controls.update(delta);
}
`;

    }

}

export { CameraFollow };
