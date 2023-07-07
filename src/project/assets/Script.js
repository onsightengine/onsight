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
`//
// Lifecycle Events:    init, update, destroy
// Input Events:        keydown, keyup, pointerdown, pointerup, pointermove
// Within Events:
//      'this'  (represents entity this script is attached to)
//      'app'   (app.renderer, app.project, app.scene, app.camera, app.keys)
//

// To add script properties, use the following template:
// let variables = {
//      myProperty: { type: 'number/boolean/color', default: ? },
// };

// ...also, script scope variable declarations allowed here

// "init()" is executed when the entity is loaded
function init() {

}

// "update()" is executed before each frame is rendered
//     delta: time since last frame (in ms)
//     total: total elapsed time (in ms)
function update(delta, total) {

}

// "destroy()" is executed right before the entity is removed
function destroy() {

}

// Example Input Event
function keydown(event) {

}
`;
        }
    }

    fromJSON(json) {
        const data = json.object;

        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;

        if (data.format !== undefined) this.format = data.format;
        if (data.category !== undefined) this.category = data.category;

        if (data.line !== undefined) this.line = data.line;
        if (data.char !== undefined) this.char = data.char;
        if (data.errors !== undefined) this.errors = data.errors;
        if (data.source !== undefined) this.source = data.source;

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
