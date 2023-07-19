import { ComponentManager } from '../../ComponentManager.js';

import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { AsciiShader } from '../../../utils/three/shaders/AsciiShader.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { LevelsShader } from '../../../utils/three/shaders/LevelsShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

let _texture;

class Post {

    init(data) {
        // Generate Backend
        let pass = undefined;

        switch (data.style) {
            case 'ascii':
                pass = new ShaderPass(AsciiShader);
                if (_texture && typeof _texture.dispose === 'function') _texture.dispose();
                _texture = AsciiShader.createCharactersTexture(data.characters);
                pass.uniforms['uCharacters'].value = _texture;
                pass.uniforms['uCharacterCount'].value = data.characters.length;
                pass.uniforms['uCellSize'].value = data.cellSize;
                pass.uniforms['uColor'].value.set(data.cellColor);
                break;

            case 'bloom':

                // TODO

                break;

            case 'edge':
                pass = new ShaderPass(SobelOperatorShader);
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
                const options = {
                    pixelSize: data.pixelSize || 6,
                    normalEdgeStrength: data.normalEdge || 0.1,
                    depthEdgeStrength: data.depthEdge || 0.1,
                };
                pass = new RenderPixelatedPass(options.pixelSize, null /* scene */, null /* camera */, options);
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
            pass.setFixedSize = function(width, height) {
                if (pass.uniforms && pass.uniforms['resolution']) {
                    pass.uniforms['resolution'].value.x = width;
                    pass.uniforms['resolution'].value.y = height;
                }

                if (typeof pass.setSize === 'function') {
                    pass.setSize(width, height);
                }
            };

        } else {
            // console.log('Error with post pass!');
        }

        // Save Backend / Data
        this.backend = pass;
        this.data = data;
    }

    dispose() {

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

        // Ascii
        cellSize: { type: 'slider', default: 16, min: 4, max: 64, step: 1, precision: 0, if: { style: [ 'ascii' ] } },
        cellColor: { type: 'color', default: 0xffffff, if: { style: [ 'ascii' ] } },
        characters: { type: 'string', default: ` .,•'^:-+=*!|?%X0#@`, if: { style: [ 'ascii' ] } },

        // Levels
        hue: { type: 'angle', default: 0.0, min: -180, max: 180, if: { style: [ 'levels' ] } },
        saturation: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        brightness: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        contrast: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        grayscale: { type: 'slider', default: 0.0, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        negative: { type: 'boolean', default: false, if: { style: [ 'levels' ] } },

        // Pixel
        pixelSize: { type: 'slider', default: 4, min: 1, max: 16, step: 1, precision: 0, if: { style: [ 'pixel' ] } },
        normalEdge: { type: 'slider', promode: true, default: 0.1, min: 0, max: 2, step: 0.1, precision: 2, if: { style: [ 'pixel' ] } },
        depthEdge: { type: 'slider', promode: true, default: 0.1, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'pixel' ] } },

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