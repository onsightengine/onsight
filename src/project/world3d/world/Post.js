import { ComponentManager } from '../../ComponentManager.js';

import { PixelatedPass } from '../../../utils/three/passes/PixelatedPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { AsciiShader } from '../../../utils/three/shaders/AsciiShader.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { LevelsShader } from '../../../utils/three/shaders/LevelsShader.js';
import { PixelatedShader } from '../../../utils/three/shaders/PixelatedShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

class Post {

    init(data) {
        // Generate Backend
        let pass = undefined;

        switch (data.style) {
            case 'ascii':
                pass = new ShaderPass(AsciiShader);
                pass.uniforms['tCharacters'].value = AsciiShader.createCharactersTexture(data.characters);
                pass.uniforms['uCharacterCount'].value = data.characters.length;
                pass.uniforms['uCellSize'].value = data.textSize;
                pass.uniforms['uColor'].value.set(data.textColor);
                pass.setFixedSize = function(width, height) {
                    pass.uniforms['resolution'].value.x = width;
                    pass.uniforms['resolution'].value.y = height;
                };
                break;

            case 'bloom':

                // TODO

                break;

            case 'edge':
                pass = new ShaderPass(SobelOperatorShader);
                pass.setFixedSize = function(width, height) {
                    pass.uniforms['resolution'].value.x = width;
                    pass.uniforms['resolution'].value.y = height;
                };
                break;

            case 'levels':
                pass = new ShaderPass(LevelsShader);
                pass.uniforms['brightness'].value = data.brightness;
                pass.uniforms['contrast'].value = data.contrast;
                pass.uniforms['saturation'].value = data.saturation;
                pass.uniforms['hue'].value = data.hue;
                pass.uniforms['grayscale'].value = data.grayscale;
                pass.uniforms['negative'].value = data.negative;
                break;

            case 'pixel':
                pass = new PixelatedPass();
                pass.uniforms['tPixel'].value = PixelatedShader.createStyleTexture(data.cellStyle);
                pass.uniforms['uDiscard'].value = data.cuttOff;
                pass.setPixelSize(data.cellSize);
                break;

            case 'tint':
                pass = new ShaderPass(ColorifyShader);
                pass.uniforms['color'].value.set(data.color);
                break;

            default:
                console.error(`Post Component: Invalid style '${data.style}'`);

        }

        // Modify Pass
        if (pass) {

        } else {
            // console.log('Error with post pass!');
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

    three() {
        return this.backend;
    }

}

Post.config = {
    schema: {

        style: [
            { type: 'select', default: 'pixel', select: [ 'ascii', 'edge', 'levels', 'pixel', 'tint' ] },
        ],

        // Divider
        divider: { type: 'divider' },

        // Ascii
        textSize: { type: 'slider', default: 16, min: 4, max: 64, step: 1, precision: 0, if: { style: [ 'ascii' ] } },
        textColor: { type: 'color', default: 0xffffff, if: { style: [ 'ascii' ] } },
        characters: { type: 'string', default: ` .,•'^:-+=*!|?%X0#@`, if: { style: [ 'ascii' ] } },

        // Levels
        hue: { type: 'angle', default: 0.0, min: -180, max: 180, if: { style: [ 'levels' ] } },
        saturation: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        brightness: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        contrast: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        grayscale: { type: 'slider', default: 0.0, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        negative: { type: 'boolean', default: false, if: { style: [ 'levels' ] } },

        // Pixel
        cellStyle: { type: 'select', default: 'none', select: [ 'none', 'brick', 'cross', 'knit', 'tile', 'woven' ], if: { style: [ 'pixel' ] } },
        cellSize: { type: 'slider', default: 10, min: 1, max: 64, step: 1, precision: 0, if: { style: [ 'pixel' ] } },
        cuttOff: { type: 'slider', default: 0, min: 0, max: 1.0, step: 0.05, precision: 2, if: { style: [ 'pixel' ] } },

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