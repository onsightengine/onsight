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
    // Rotation in degress per second
    rotateX: { type: 'number', default: 0 },
    rotateY: { type: 'number', default: 0 },
    rotateZ: { type: 'number', default: 180 },
};

function update(event) {
    this.rotation.x += (rotateX * (Math.PI / 180) * event.delta);
    this.rotation.y += (rotateY * (Math.PI / 180) * event.delta);
    this.rotation.z += (rotateZ * (Math.PI / 180) * event.delta);
}
`;

    }

}

export { RotateEntity };
