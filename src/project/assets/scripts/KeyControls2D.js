import { Script } from '../Script.js';

class KeyControls2D extends Script {

    constructor() {
		super();

		this.name = 'Key Controls (2D)';
		this.category = 'controls';
		this.source =
`
let variables = {
	speed: { type: 'number', default: 5 },
};

let keys = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }
let target;

function init() {
	speed /= 100;
	target = new THREE.Vector3();
	target.copy(this.position);
}

function update(delta, total) {
	if (app.keys[keys.left]) target.x -= speed;
	if (app.keys[keys.right]) target.x += speed;
    if (app.keys[keys.up]) target.y += speed;
	if (app.keys[keys.down]) target.y -= speed;

	this.position.lerp(target, delta * 10);
}
`;

    }

}

export { KeyControls2D };
