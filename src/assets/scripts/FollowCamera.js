import { Script } from '../Script.js';

class FollowCamera extends Script {

    constructor() {
        super();

        this.name = 'Follow Camera';
        this.category = 'entity';
        this.source =
`
// Properties
let variables = {
    offsetX: { type: 'number', default: 0 },
	offsetY: { type: 'number', default: 0 },
    offsetZ: { type: 'number', default: 0 },
};

let offset;

function init() {
    offset = new THREE.Vector3();
    if (this.target) {
    	offset.copy(this.position).sub(this.target.position);
    }
}

function update(event) {
    if (app.camera && app.camera.target) {
    	this.position.x = app.camera.target.x + offsetX;
    	this.position.y = app.camera.target.y + offsetY;
        this.position.z = app.camera.target.z + offsetZ;

        if (this.target) {
        	this.target.position.copy(this.position).sub(offset);
        }
    }
}
`;

    }

}

export { FollowCamera };
