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

let keys = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }
let target;
let direction;
let quaternion;
let up;

function init() {
	speed /= 100;
	target = new THREE.Vector3();
	target.copy(this.position);

	direction = new THREE.Vector3();
	quaternion = new THREE.Quaternion();
	up = new THREE.Vector3(0, 0, 1);
}

function update(delta, total) {
	if (app.keys[keys.left]) this.rotation.y += speed;
	if (app.keys[keys.right]) this.rotation.y -= speed;

    if (app.keys[keys.up] || app.keys[keys.down]) {
		this.getWorldQuaternion(quaternion);
		direction.copy(up).applyQuaternion(quaternion);
		direction.multiplyScalar(speed);
		if (app.keys[keys.up]) target.sub(direction);
		if (app.keys[keys.down]) target.add(direction);
	}

	this.position.lerp(target, delta * 10);
}
`;

    }

}

export { DrivingControls3D };
