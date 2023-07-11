import { Script } from '../Script.js';

class RotateEntity extends Script {

    constructor() {
		super();

		this.name = 'Rotate Entity';
        this.category = 'entity';
        this.source =
`
// Properties
let variables = {
    rotateX: { type: 'number', default: 0 },
    rotateY: { type: 'number', default: 0 },
    rotateZ: { type: 'number', default: -1 },
};

function update(delta) {
	this.rotation.x += (rotateX * (Math.PI / 180));
    this.rotation.y += (rotateY * (Math.PI / 180));
    this.rotation.z += (rotateZ * (Math.PI / 180));
}
`;

    }

}

export { RotateEntity };
