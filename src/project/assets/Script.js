import { SCRIPT_FORMAT } from '../../constants.js';
import { Maths } from '../../utils/Maths.js';

class Script {

    constructor(format = SCRIPT_FORMAT.JAVASCRIPT) {
        // Prototype
        this.isScript = true;
        this.type = 'Script';

        // Properties
        this.name ='New Script';
        this.uuid = Maths.uuid();
        this.format = format;
        this.category = null;
        this.line = 0;
        this.char = 0;
        this.errors = false;
        if (format === SCRIPT_FORMAT.JAVASCRIPT) {
            this.source =
                '//\n' +
                '// Globals:            entity ("this" in events), app, renderer, scene, camera\n' +
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
        const data = json.object;

        if (data.name !== undefined) this.name = json.name;
        if (data.uuid !== undefined) this.uuid = json.uuid;

        if (data.format !== undefined) this.format = json.format;
        if (data.category !== undefined) this.category = json.category;

        if (data.line !== undefined) this.line = json.line;
        if (data.char !== undefined) this.char = json.char;
        if (data.errors !== undefined) this.errors = json.errors;
        if (data.source !== undefined) this.source = json.source;

        return this;
    }

    toJSON() {
        const json = {
            object: {
                type: this.type,
                name: this.name,
                uuid: this.uuid,

                format: this.format,
                category: this.category,
            }
        };

        json.object.line = this.line;
        json.object.char = this.char;
        json.object.errors = structuredClone(this.errors);
        json.object.source = this.source;

        return json;
    }

}

export { Script };
