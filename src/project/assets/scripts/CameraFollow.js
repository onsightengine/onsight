import { Script } from '../Script.js';

class CameraFollow extends Script {

    constructor() {
		super();

		this.name = 'Camera Follow';
        this.category = 'camera';
        this.source =
`
// Properties
let variables = {
    distance: { type: 'number', default: 10 },
    rotate: { type: 'boolean', default: false },
};

// Locals
let controls;
let direction;
let quaternion;
let up;
let rotation;

function init() {
    // Init Orbit Controls
    app.camera.position.x = this.position.x;
    app.camera.position.y = this.position.y;
    app.camera.position.z = this.position.z + distance;
    controls = new ONE.OrbitControls(app.camera, app.renderer.domElement, this);

    // Initialize Temp Variables
    direction = new THREE.Vector3();
	quaternion = new THREE.Quaternion();
	up = new THREE.Vector3(0, 1, 0);
    rotation = new THREE.Vector3().copy(this.rotation)
}

function update(event) {
    if (rotate) {
        // Maintain World Up
        this.getWorldQuaternion(quaternion);
        direction.copy(up).applyQuaternion(quaternion);
        app.camera.up.lerp(direction, event.delta * 10);

        // Rotate to Match Entity
        const angleDiff = (rotation.y - this.rotation.y);
        controls.applyRotation(angleDiff);
        rotation.copy(this.rotation);
    }

    // Update Orbit Controls
    controls.centerOnTarget(this);
    controls.update(event.delta);
}
`;

    }

}

export { CameraFollow };
