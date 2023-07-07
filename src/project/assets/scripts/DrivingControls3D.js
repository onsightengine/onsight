import { Script } from '../Script.js';

class DrivingControls3D extends Script {

    constructor() {
		super();

		this.name = 'Driving Controls (3D)';
		this.category = 'controls';
        this.source =
`
let variables = {
	speed: { type: 'number', default: 5 },
};

let keys = {};
let target = {};
let direction;
let quaternion;
let up;

function init() {
	speed /= 100;
	keys = { left: false, right: false, up: false, down: false };

	direction = new THREE.Vector3();
	quaternion = new THREE.Quaternion();
	up = new THREE.Vector3(0, 0, 1);

	target = new THREE.Vector3();
	target.copy(this.position);
}

function update(delta, total) {
	if (keys.left) this.rotation.y += speed;
	if (keys.right) this.rotation.y -= speed;

    if (keys.up || keys.down) {
		this.getWorldQuaternion(quaternion);
		direction.copy(up).applyQuaternion(quaternion);
		if (keys.up) target.sub(direction.multiplyScalar(speed));
		if (keys.down) target.add(direction.multiplyScalar(speed));
	}

	this.position.lerp(target, delta * 10);
}

function keydown(event) {
	if (event.key === 'ArrowLeft') keys.left = true;
	if (event.key === 'ArrowRight') keys.right = true;
    if (event.key === 'ArrowUp') keys.up = true;
	if (event.key === 'ArrowDown') keys.down = true;
}

function keyup(event) {
	if (event.key === 'ArrowLeft') keys.left = false;
	if (event.key === 'ArrowRight') keys.right = false;
    if (event.key === 'ArrowUp') keys.up = false;
	if (event.key === 'ArrowDown') keys.down = false;
}
`;

    }

}

export { DrivingControls3D };
