import { Script } from '../Script.js';

class ZigZagControls extends Script {

    constructor() {
        super();

        this.name = 'Zig Zag Controls';
        this.category = 'controls';
        this.source =
`
// Properties
let variables = {
    forward: { type: 'number', default: 2 },
    sideways: { type: 'number', default: 4 },
    keySwitch: { type: 'key', default: ' ' },
};

function update(event) {
    this.position.x += sideways * event.delta;
    this.position.y += forward * event.delta;
}

function keydown(event) {
    if (event.key === keySwitch) sideways *= -1;
}
`;

    }

}

export { ZigZagControls };
