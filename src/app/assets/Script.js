import {
    SCRIPT_FORMAT,
} from '../../constants.js';
import { AssetManager } from '../../app/AssetManager.js';
import { Asset } from './Asset.js';

class Script extends Asset {

    constructor(format = SCRIPT_FORMAT.JAVASCRIPT, variables = false) {
        super('New Script');

        // Prototype
        this.isScript = true;
        this.type = 'Script';

        // Properties, Script
        this.format = format;
        this.position = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;
        this.selectFrom = 0;
        this.selectTo = 0;

        // JavaScript
        if (format === SCRIPT_FORMAT.JAVASCRIPT) {
            this.source = `//
// Lifecycle Events:    init, update, destroy
// Input Events:        keydown, keyup, pointerdown, pointerup, pointermove
// Within Events:
//      'this'          represents entity this script is attached to
//      'app'           access .renderer, .project, .scene, .camera, .keys
// Pointer Events:
//      'event.entity'  entity under pointer (if there is one)
// Update Event:
//      'event.delta'   time since last frame (in seconds)
//      'event.total'   total elapsed time (in seconds)
//
${variableTemplate(variables)}
// ...script scope variable declarations allowed here...

// "init()" is executed when an entity is loaded
function init() {

}

// "update()" is executed once each frame
function update(event) {

}

// "destroy()" is executed right before an entity is removed
function destroy() {

}

// Example Input Event
function keydown(event) {

}
`;
        } else if (format === SCRIPT_FORMAT.PYTHON) {
            this.source = `# This program adds two numbers

num1 = 1.5
num2 = 6.3

# Add two numbers
sum = num1 + num2

# Display the sum
print('The sum of {0} and {1} is {2}'.format(num1, num2, sum))
`;
        }


    }

    /******************** JSON */

    toJSON() {
        const data = super.toJSON();
        data.format = this.format;
        data.position = this.position;
        data.scrollLeft = this.scrollLeft;
        data.scrollTop = this.scrollTop;
        data.selectFrom = this.selectFrom;
        data.selectTo = this.selectTo;
        data.source = this.source;
        return data;
    }

    fromJSON(data) {
        super.fromJSON(data);
        if (data.format !== undefined) this.format = data.format;
        if (data.position !== undefined) this.position = data.position;
        if (data.scrollLeft !== undefined) this.scrollLeft = data.scrollLeft;
        if (data.scrollTop !== undefined) this.scrollTop = data.scrollTop;
        if (data.selectFrom !== undefined) this.selectFrom = data.selectFrom;
        if (data.selectTo !== undefined) this.selectTo = data.selectTo;
        if (data.source !== undefined) this.source = data.source;
        return this;
    }

}

AssetManager.register('Script', Script);

export { Script };

/******************** INTERNAL ********************/

function variableTemplate(includeVariables = false) {
    if (!includeVariables) {
return (`
// Script Properties:
let variables = {
//  myNumber: { type: 'number', default: 10 },
//  myString: { type: 'string', default: '' },
//  myColor: { type: 'color', default: 0x0000ff },
};
`);
    } else {
return (
`
//
// Example Script Properties
//      - 'info' property text will appear in Advisor
//      - see 'ComponentManager.js' for more information
//
let variables = {

    // The following 'asset' types are saved as asset UUID values
    geometry: { type: 'asset', class: 'geometry', info: 'Geometry Asset' },
    material: { type: 'asset', class: 'material', info: 'Material Asset' },
    script: { type: 'asset', class: 'script', info: 'Script Asset' },
    shape: { type: 'asset', class: 'shape', info: 'Shape Asset' },
    texture: { type: 'asset', class: 'texture', info: 'Texture Asset' },
    divider1: { type: 'divider' },
    prefab: { type: 'asset', class: 'prefab', info: 'Prefab Asset' },
    divider2: { type: 'divider' },

    // Dropdown selection box, saved as 'string' value
    select: { type: 'select', default: 'Banana', select: [ 'Apple', 'Banana', 'Cherry' ], info: 'Selection Box' },

    // Numeric values, saved as 'number' values
    number: { type: 'number', default: 0.05, min: 0, max: 1, step: 0.05, label: 'test', info: 'Floating Point' },
    int: { type: 'int', default: 5, min: 3, max: 10, info: 'Integer' },

    // Angle, saved as 'number' value in radians
    angle: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, info: 'Angle' },

    // Numeric value +/- a range value, saved as Array
    variable: { type: 'variable', default: [ 0, 0 ], min: 0, max: 100, info: 'Ranged Value' },
    slider: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, info: 'Numeric Slider' },

    // Boolean
    boolean: { type: 'boolean', default: true, info: 'true || false' },

    // Color returns integer value at runtime
    color: { type: 'color', default: 0xff0000, info: 'Color Value' },

    // Strings
    string: { type: 'string', info: 'String Value' },
    multiline: { type: 'string', rows: 4, info: 'Multiline String' },
    keyboard: { type: 'key', default: 'Escape' },

    // Vectors returned as Array types at runtime
    numberArray: { type: 'vector', size: 1, info: 'Numeric Array' },
    vector2: { type: 'vector', size: 2, tint: true, label: [ 'x', 'y' ], info: 'Vector 2' },
    vector3: { type: 'vector', size: 3, tint: true, min: [ 1, 1, 1 ], max: [ 2, 2, 2 ], step: 0.1, precision: 2, info: 'Vector 3' },
    vector4: { type: 'vector', size: 4, tint: true, info: 'Vector 4' },
};
`);
    }
}
