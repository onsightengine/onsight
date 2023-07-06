import { Script } from '../Script.js';

class ColorChange extends Script {

    constructor() {
		super();

		this.name = 'Color Change';
        this.category = 'entity';

        this.source =
`
let color = '0xff0000';

function init() {
	this.updateComponent('material', { color: Number(color) });
}

function pointerdown() {
	const clr = new THREE.Color(Math.random(), Math.random(), Math.random());
    this.replaceComponent('material', { color: clr });
}
`;

    }

}

export { ColorChange };
