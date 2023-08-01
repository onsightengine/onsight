// https://github.com/emilwidlund/ASCII

import * as THREE from 'three';

const CHARACTERS_PER_ROW = 16;

export const AsciiShader = {
    name: 'AsciiShader',

    uniforms: {
        'resolution': { value: new THREE.Vector2() },
        'fixedsize': { value: new THREE.Vector2() },
        'uCamera': { value: new THREE.Vector2() },
        'uCellSize': { value: 16 },
        'tDiffuse': { value: null },
        'tCharacters': { value: null },
        'uCharacterCount': { value: 0 },
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

        uniform vec2 resolution;
        uniform vec2 fixedsize;
        uniform vec2 uCamera;
        uniform vec2 uCellSize;
        uniform sampler2D tDiffuse;
        uniform sampler2D tCharacters;
        uniform float uCharacterCount;
        uniform vec3 uColor;

        varying vec2 vUv;

        const vec2 SIZE = vec2(${CHARACTERS_PER_ROW});

        void main() {
            vec2 cell = fixedsize / uCellSize;
            vec2 grid = 1.0 / cell;
            vec2 pixel = 1.0 / fixedsize;
            vec2 actual = 1.0 / resolution;

            // Camera Offset
            vec2 fract = pixel * mod(uCamera, uCellSize);

            // Image Color
            vec2 pixelUV = grid * (0.5 + floor((vUv + fract) / grid));
            pixelUV -= fract;
            vec4 pixelized = texture2D(tDiffuse, pixelUV);

            // Character
            float greyscale = luminance(pixelized.rgb);
            float characterIndex = floor((uCharacterCount - 1.0) * greyscale);
            vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
            vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
            vec2 charUV = mod((vUv + fract) * (cell / SIZE), 1.0 / SIZE) - vec2(0.0, 1.0 / SIZE) + offset;
            vec4 asciiCharacter = texture2D(tCharacters, charUV);

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
                canvas, undefined,
                THREE.RepeatWrapping,
                THREE.RepeatWrapping,
                THREE.LinearFilter,
                THREE.LinearFilter,
            );

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, SIZE, SIZE);
            ctx.font = `${FONT_SIZE}px arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                const x = i % CHARACTERS_PER_ROW;
                const y = Math.floor(i / CHARACTERS_PER_ROW);

                // // DEBUG
                // ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
                // ctx.fillRect(x * CELL, y * CELL, CELL, CELL);

                ctx.fillStyle = '#fff';
                ctx.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
            }

            texture.needsUpdate = true;
            return texture;
        }

};
