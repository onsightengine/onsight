import { AssetManager } from '../../app/AssetManager.js';
import { Asset } from './Asset.js';

class Palette extends Asset {

    constructor() {
        super('New Palette');

        // Prototype
        this.isPalette = true;
        this.type = 'Palette';

        // Properties, Asset
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

    purpleGold() {
        this.colors = [
            0x000000,   // black
            0xffffff,   // white
            0xd400ff,   // purple
            0xffc800,   // gold
        ];
        return this;
    }

    /******************** JSON */

    toJSON() {
        const data = super.toJSON();
        data.colors = JSON.stringify(this.colors);
        return data;
    }

    fromJSON(data) {
        super.fromJSON(data);
        if (data.colors !== undefined) this.colors = JSON.parse(data.colors);
        return this;
    }

}

AssetManager.register('Palette', Palette);

export { Palette };
