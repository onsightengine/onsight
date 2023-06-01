import { Maths } from '../../utils/Maths.js';

class Script {

    constructor() {

        // Prototype
        this.isScript = true;
        this.type = 'Script';
        this.uuid = Maths.uuid();

        // Properties
        this.name ='New Script';
        this.errors = false;
        this.source =
            '// Code outside of events is immediately executed when the script is loaded\n' +
            '//\n' +
            '// Lifecycle:	init, update, destroy\n' +
            '// Events:		keydown, keyup, pointerdown, pointerup, pointermove\n' +
            '// Globals:		this (entity), app, renderer, scene, camera\n' +
            '// Executed when the entity is loaded\n' +
            'function init() {\n\n}\n' +
            '// Executed before frame is rendered\n' +
            '//	event.time: total elapsed time (in ms)\n' +
            '//	event.delta: time since last frame (in ms)\n' +
            'function update(event) {\n\n}\n' +
            '// Example pointer event\n' +
            'function pointermove(event) {\n\n}\n';

    }

}

export { Script };
