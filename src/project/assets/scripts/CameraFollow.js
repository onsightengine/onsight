import { Script } from '../Script.js';

class CameraFollow extends Script {

    constructor() {
		super();

		this.name = 'Camera Follow';

        this.source =
`
function update(event) {

	camera.position.x = this.position.x;
    camera.position.y = this.position.y;
    camera.position.z = this.position.z + 6;

}
`;

    }

}

export { CameraFollow };
