import { Script } from '../Script.js';

class KeyControls extends Script {

    constructor() {
		super();

		this.name = 'Key Controls';

        this.source =
`
let speed = 0.1;

function keydown(event) {

	if (event.key === 'ArrowLeft') this.position.x -= speed;
	if (event.key === 'ArrowRight') this.position.x += speed;

    if (event.key === 'ArrowUp') this.position.y += speed;
	if (event.key === 'ArrowDown') this.position.y -= speed;

}
`;

    }

}

export { KeyControls };
