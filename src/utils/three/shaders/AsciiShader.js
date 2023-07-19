// https://github.com/emilwidlund/ASCII

import * as THREE from 'three';

const CHARACTERS_PER_ROW = 16;

export const AsciiShader = {
	uniforms: {
		'tDiffuse': { value: null },
        'resolution': { value: new THREE.Vector2() },
        'uCharacters': { value: null },
        'uCharacterCount': { value: 0 },
        'uCellSize': { value: 16 },
        'uColor': { value: new THREE.Color() },
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
        uniform vec2 resolution;

        uniform sampler2D uCharacters;
        uniform float uCharacterCount;
        uniform float uCellSize;
        uniform vec3 uColor;

        varying vec2 vUv;

        const vec2 SIZE = vec2(${CHARACTERS_PER_ROW});

        void main() {
            vec2 cell = resolution / uCellSize;
            vec2 grid = 1.0 / cell;
            vec2 pixelUV = grid * (0.5 + floor(vUv / grid));
            vec4 pixelized = texture2D(tDiffuse, pixelUV);
            float greyscale = luminance(pixelized.rgb);

            float characterIndex = floor((uCharacterCount - 1.0) * greyscale);
            vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
            vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
            vec2 charUV = mod(vUv * (cell / SIZE), 1.0 / SIZE) - vec2(0., 1.0 / SIZE) + offset;
            vec4 asciiCharacter = texture2D(uCharacters, charUV);

			gl_FragColor = vec4(uColor * asciiCharacter.rgb, pixelized.a);
        }`,

    createCharactersTexture: function(characters) {
            const canvas = document.createElement('canvas');
            const FONT_SIZE = 54;
            const SIZE = 1024;
            const CELL = SIZE / CHARACTERS_PER_ROW;
            canvas.width = canvas.height = SIZE;

            // // DEBUG
            // canvas.style['background'] = '#ff0000';
            // canvas.style['position'] = 'absolute';
            // canvas.style['z-index'] = 2000;
            // document.body.appendChild(canvas);

            const texture = new THREE.CanvasTexture(
                canvas, THREE.UVMapping,
                THREE.RepeatWrapping, THREE.RepeatWrapping,
                THREE.NearestFilter, THREE.NearestFilter,
            );

            const context = canvas.getContext('2d');
            context.clearRect(0, 0, SIZE, SIZE);
            context.font = `${FONT_SIZE}px arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                const x = i % CHARACTERS_PER_ROW;
                const y = Math.floor(i / CHARACTERS_PER_ROW);

                // // DEBUG
                // context.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
                // context.fillRect(x * CELL, y * CELL, CELL, CELL);

                context.fillStyle = '#fff';
                context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
            }

            texture.needsUpdate = true;
            return texture;
        }

};
