import { AssetManager } from '../../../app/AssetManager.js';
import { ComponentManager } from '../../../app/ComponentManager.js';

class Post {

    init(data = {}) {
        // Generate Backend
        let pass = undefined;

        switch (data.style) {
            case 'ascii':

                break;

            case 'bloom':

                break;

            case 'cartoon':

                break;

            case 'dither':

                break;

            case 'edge':

                break;

            case 'levels':

                break;

            case 'pixel':

                break;

            case 'tint':

                break;

            default:
                console.error(`Post Component: Invalid style '${data.style}'`);

        }

        // Modify Pass
        if (pass) {

        } else {
            // console.log('Error with pass!');
        }

        // Save Backend / Data
        this.backend = pass;
        this.data = data;
    }

    dispose() {
        const pass = this.backend;
        if (!pass || !pass.uniforms) return;

        for (const property in pass.uniforms) {
            const uniform = pass.uniforms[property];
            if (uniform && uniform.value && uniform.value.isTexture) {
                if (typeof uniform.value.dispose === 'function') {
                    uniform.value.dispose();
                }
            }
        }
    }

}

Post.config = {
    schema: {

        style: [
            { type: 'select', default: 'levels', select: [ 'ascii', 'bloom', 'cartoon', 'dither', 'edge', 'levels', 'pixel', 'tint' ] },
        ],

        // Divider
        divider: { type: 'divider' },

        // Ascii
        textSize: { type: 'slider', default: 16, min: 4, max: 64, step: 1, precision: 0, if: { style: [ 'ascii' ] } },
        textColor: { type: 'color', default: 0xffffff, if: { style: [ 'ascii' ] } },
        characters: { type: 'string', default: ` .,•:-+=*!?%X0#@`, if: { style: [ 'ascii' ] } },

        // Bloom
        threshold: { type: 'slider', default: 0, min: 0, max: 1, step: 0.05, precision: 2, if: { style: [ 'bloom' ] } },
        strength: { type: 'slider', default: 1, min: 0, max: 3, step: 0.1, precision: 2, if: { style: [ 'bloom' ] } },
        radius: { type: 'slider', default: 0, min: 0, max: 1, step: 0.05, precision: 2, if: { style: [ 'bloom' ] } },

        // Cartoon
        edgeColor: { type: 'color', default: 0x000000, if: { style: [ 'cartoon' ] } },
        edgeStrength: { type: 'slider', default: 0, min: 0, max: 1, precision: 2, if: { style: [ 'cartoon' ] } },
        gradient: { type: 'slider', default: 5, min: 2, max: 32, step: 1, precision: 0, if: { style: [ 'cartoon' ] } },

        // Dither
        palette: { type: 'asset', class: 'palette', if: { style: [ 'dither' ] } },
        bias: { type: 'slider', default: 0.25, min: -1, max: 1, precision: 2, step: 0.05, if: { style: [ 'dither' ] } },
        scale: { type: 'slider', default: 1, min: 1, max: 9, precision: 2, step: 1, if: { style: [ 'dither' ] } },

        // Edge

        // Levels
        bitrate: { type: 'slider', promode: true, default: 8, min: 0, max: 8, step: 1, precision: 0, if: { style: [ 'levels' ] } },
        hue: { type: 'angle', default: 0.0, min: -360, max: 360, if: { style: [ 'levels' ] } },
        saturation: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        brightness: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        contrast: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        grayscale: { type: 'slider', default: 0.0, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        negative: { type: 'boolean', default: false, if: { style: [ 'levels' ] } },

        // Pixel
        cellStyle: { type: 'select', default: 'none', select: [ 'none', 'brick', 'cross', 'knit', 'tile', 'woven' ], if: { style: [ 'pixel' ] } },
        cellSize: { type: 'vector', default: [ 8, 8 ], size: 2, tint: true, aspect: true, label: [ 'x', 'y' ], min: [ 1, 1 ], max: [ 1000, 1000 ], precision: [ 2, 2 ], if: { style: [ 'pixel' ] } },
        cutOff: { type: 'slider', promode: true, default: 0, min: 0, max: 1.0, step: 0.05, precision: 2, if: { style: [ 'pixel' ] } },

        // Tint
        color: { type: 'color', default: 0xff0000, if: { style: [ 'tint' ] } },

    },
    icon: ``,
    color: 'rgb(64, 64, 64)',
    multiple: true,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('post', Post);
