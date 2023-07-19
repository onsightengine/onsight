import { ComponentManager } from '../../ComponentManager.js';

import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

const LevelsShader = {
	uniforms: {
		'tDiffuse': { value: null },
        'hue': { value: 0 },
        'saturation': { value: 0 },
        'brightness': { value: 0 },
		'contrast': { value: 0 },
        'grayscale': { value: 0.0 },
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

        uniform float hue;
        uniform float saturation;
        uniform float brightness;
		uniform float contrast;
        uniform float grayscale;

		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D(tDiffuse, vUv);

            // Hue
			float angle = hue * 3.14159265;
			float s = sin(angle), c = cos(angle);
			vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
			float len = length(texel.rgb);
			texel.rgb = vec3(
				dot(texel.rgb, weights.xyz),
				dot(texel.rgb, weights.zxy),
				dot(texel.rgb, weights.yzx)
			);

            // Saturation
			float average = (texel.r + texel.g + texel.b) / 3.0;
			if (saturation > 0.0) {
				texel.rgb += (average - texel.rgb) * (1.0 - 1.0 / (1.001 - saturation));
			} else {
				texel.rgb += (average - texel.rgb) * (- saturation);
			}

            // Brightness
            float bright = brightness * texel.a;
            texel.rgb += bright;

            // Contrast
            float clarity = min(contrast * texel.a, 0.9999);
			if (clarity > 0.0) {
				texel.rgb = (texel.rgb - 0.5) / (1.0 - clarity) + 0.5;
			} else {
				texel.rgb = (texel.rgb - 0.5) * (1.0 + clarity) + 0.5;
			}

            // Grayscale
            float l = luminance(texel.rgb);
            texel = mix(texel, vec4(l, l, l, texel.a), grayscale);

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
                pass.uniforms['brightness'].value = data.brightness;
                pass.uniforms['contrast'].value = data.contrast;
                pass.uniforms['saturation'].value = data.saturation;
                pass.uniforms['hue'].value = data.hue;
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

            case 'tint':
                pass = new ShaderPass(ColorifyShader);
                pass.uniforms['color'].value.set(data.color);
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

        // ADD: 'bloom', 'toon'
        style: [
            { type: 'select', default: 'pixel', select: [ 'edge', 'levels', 'pixel', 'tint' ] },
        ],

        // Levels
        hue: { type: 'angle', default: 0.0, min: -180, max: 180, if: { style: [ 'levels' ] } },
        saturation: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        brightness: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        contrast: { type: 'slider', default: 0.0, min: -1, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },
        grayscale: { type: 'slider', default: 0.0, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'levels' ] } },

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