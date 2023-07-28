import { Iris } from '../utils/Iris.js';
import { Maths } from '../utils/Maths.js';

class Palette {

    constructor() {
        // Prototype
        this.isPalette = true;
        this.type = 'Palette';

        // Properties
        this.name = 'New Palette';
        this.uuid = Maths.uuid();
        this.colors = [];
    }

    default16() {
        this.colors = [
            0x000000,   // black
            0x808080,   // gray
            0xc0c0c0,   // silver
            0xffffff,   // white
            0x00ffff,   // aqua
            0x0000ff,   // blue
            0x000080,   // navy
            0x800080,   // purple
            0xff00ff,   // fuchsia
            0xff0000,   // red
            0x800000,   // maroon
            0x808000,   // olive
            0xffff00,   // yellow
            0x00ff00,   // lime
            0x008000,   // green
            0x008080,   // teal
        ];
        return this;
    }

    fromJSON(json) {
        const data = json.object;

        if (data.name !== undefined) this.name = data.name;
        if (data.uuid !== undefined) this.uuid = data.uuid;
        if (data.colors !== undefined) this.colors = JSON.parse(data.colors);

        return this;
    }

    toJSON() {
        const json = {
            object: {
                type: this.type,
                name: this.name,
                uuid: this.uuid,
            }
        };

        json.object.colors = JSON.stringify(this.colors);

        return json;
    }

}

export { Palette };
