import { SCRIPT_FORMAT } from '../../constants.js';
import { Maths } from '../../utils/Maths.js';

class Script {

    constructor(format = SCRIPT_FORMAT.JAVASCRIPT) {

        // Prototype
        this.isScript = true;
        this.type = 'Script';
        this.uuid = Maths.uuid();
        this.format = format;

        // Properties
        this.name ='New Script';
        this.errors = false;
        if (format === SCRIPT_FORMAT.JAVASCRIPT) {
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

    fromJSON(json) {
        this.uuid = json.uuid;
        this.name = json.name;
        this.errors = json.errors;
        this.source = json.source;
    }

    toJSON() {
        return structuredClone(this);
    }

}

export { Script };
