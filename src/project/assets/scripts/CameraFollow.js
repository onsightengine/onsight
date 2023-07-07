import { Script } from '../Script.js';

class CameraFollow extends Script {

    constructor() {
		super();

		this.name = 'Camera Follow';
        this.category = 'camera';
        this.source =
`
let variables = {
    distance: { type: 'number', default: 10 },
    rotate: { type: 'boolean', default: false },
    maintainUp: { type: 'boolean', default: false },
};

let controls;
let direction;
let quaternion;
let up;
let rotation;

function init() {
    camera.position.x = this.position.x;
    camera.position.y = this.position.y;
    camera.position.z = this.position.z + distance;
    controls = new ONE.OrbitControls(camera, renderer.domElement, this);

    direction = new THREE.Vector3();
	quaternion = new THREE.Quaternion();
	up = new THREE.Vector3(0, 1, 0);

    rotation = new THREE.Vector3();
    rotation.copy(this.rotation);
}

function update(delta) {
    if (maintainUp) {
        this.getWorldQuaternion(quaternion);
        direction.copy(up).applyQuaternion(quaternion);
        camera.up.lerp(direction, delta * 10);
    }

    if (rotate) {
        const angleDiff = rotation.y - this.rotation.y;
        controls.applyRotation(angleDiff);
        rotation.copy(this.rotation);
    }

    controls.centerOnTarget(this);
    controls.update(delta);
}
`;

    }

}

export { CameraFollow };
