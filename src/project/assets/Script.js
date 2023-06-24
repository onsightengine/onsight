import { SCRIPT_FORMAT } from '../../constants.js';
import { Maths } from '../../utils/Maths.js';

class Script {

    constructor(format = SCRIPT_FORMAT.JAVASCRIPT) {
        // Prototype
        this.isScript = true;
        this.type = 'Script';
        this.uuid = Maths.uuid();
        this.format = format;
        this.category = null;

        // Properties
        this.name ='New Script';
        this.line = 0;
        this.char = 0;
        this.errors = false;
        if (format === SCRIPT_FORMAT.JAVASCRIPT) {
            this.source =
                '//\n' +
                '// Globals:            this (entity), app, renderer, scene, camera\n' +
                '// Lifecycle Events:   init, update, destroy\n' +
                '// Input Events:       keydown, keyup, pointerdown, pointerup, pointermove\n' +
                '//\n' +
                '\n' +
                '// ... Code outside of events is executed when entity is loaded ... \n' +
                '\n' +
                '// "init()" is executed when the entity is loaded\n' +
                'function init() {\n\n}\n' +
                '\n' +
                '// "update()" is executed before each frame is rendered\n' +
                '//     event.time: total elapsed time (in ms)\n' +
                '//     event.delta: time since last frame (in ms)\n' +
                'function update(event) {\n\n}\n' +
                '\n' +
                '// "destroy()" is executed right before the entity is removed\n' +
                'function destroy() {\n\n}\n' +
                '\n' +
                '// Example Input Event\n' +
                'function keydown(event) {\n\n}\n';
        }
    }

    fromJSON(json) {
        this.uuid = json.uuid;
        this.format = json.format;
        this.category = json.category;
        this.name = json.name;
        this.line = json.line;
        this.char = json.char;
        this.errors = json.errors;
        this.source = json.source;
        return this;
    }

    toJSON() {
        return structuredClone(this);
    }

}

export { Script };
