import { ComponentManager } from '../../ComponentManager.js';

import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

const LevelsShader = {
	uniforms: {
		'tDiffuse': { value: null },
        'grayscale': { value: 0.0 }
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,

	fragmentShader: /* glsl */`
		#include <common>
		uniform sampler2D tDiffuse;
        uniform float grayscale;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D(tDiffuse, vUv);

            // Grayscale
            float l = luminance(texel.rgb);
            texel = mix(texel, vec4(l, l, l, texel.w), grayscale);

            // Final
			gl_FragColor = texel;
		}`
};

class Post {

    init(data) {
        // Generate Backend
        let pass = undefined;

        switch (data.style) {

            case 'bloom':
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
                pass.uniforms['grayscale'].value = data.grayscale;
                break;

            case 'pixel':
                const options = {
                    pixelSize: data.pixelSize || 6,
                    normalEdgeStrength: data.normalEdge || 0.1,
                    depthEdgeStrength: data.depthEdge || 0.1,
                };
                pass = new RenderPixelatedPass(options.pixelSize, null /* scene */, null /* camera */, options);
                pass.setFixedSize = function(width, height) {
                    pass.setSize(width, height);
                }
                break;

            default:
                console.error(`Post Component: Invalid style '${data.style}'`);

        }

        // Modify Camera
        if (pass) {

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
            { type: 'select', default: 'pixel', select: [ 'bloom', 'edge', 'levels', 'pixel', 'tint' ] },
        ],

        // Levels
        grayscale: { type: 'slider', default: 1.0, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },

        // Pixel
        pixelSize: { type: 'slider', default: 4, min: 1, max: 16, step: 1, precision: 0, if: { style: [ 'pixel' ] } },
        normalEdge: { type: 'slider', promode: true, default: 0.1, min: 0, max: 2, step: 0.1, precision: 2, if: { style: [ 'pixel' ] } },
        depthEdge: { type: 'slider', promode: true, default: 0.1, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'pixel' ] } },

    },
    icon: ``,
    color: 'rgb(64, 64, 64)',
    multiple: true,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('post', Post);