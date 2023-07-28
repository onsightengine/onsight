import * as THREE from 'three';

// http://devlog-martinsh.blogspot.com/2011/03/glsl-8x8-bayer-matrix-dithering.html
// http://alex-charlton.com/posts/Dithering_on_the_GPU/
// https://www.chilliant.com/rgb2hsv.html

const empty256 = [];
for (let i = 0; i < 256; i++) empty256.push(new THREE.Vector3());

export const DitherShader = {
    name: 'Dither Shader',

    uniforms: {
        'resolution': { value: new THREE.Vector2() },
        'tDiffuse': { value: null },
        'uBias': { value: 2 },
        'uSteps': { value: 4 },
        'uPalette': { type: 'v3v', value: [
            new THREE.Vector3(0, 0, 0),         // rgb black
            new THREE.Vector3(1, 1, 1),         // rgb white
            new THREE.Vector3(1, 0, 0),         // rgb red
            new THREE.Vector3(0, 1, 0),         // rgb green
            new THREE.Vector3(0, 0, 1),         // rgb blue
            ...empty256,
        ]},
        'uPaletteSize': { value: 5 },
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
        uniform sampler2D tDiffuse;
        uniform float uBias;
        uniform float uSteps;
        uniform vec3[255] uPalette;
        uniform int uPaletteSize;

        varying vec2 vUv;

        const int[64] ditherTable = int[](
            0,  32, 8,  40, 2,  34, 10, 42,
            48, 16, 56, 24, 50, 18, 58, 26,
            12, 44, 4,  36, 14, 46, 6,  38,
            60, 28, 52, 20, 62, 30, 54, 22,
            3,  35, 11, 43, 1,  33, 9,  41,
            51, 19, 59, 27, 49, 17, 57, 25,
            15, 47, 7,  39, 13, 45, 5,  37,
            63, 31, 55, 23, 61, 29, 53, 21
        );

        // RGB to HSV
        vec3 rgbToHsv(vec3 c) {
            vec4  K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4  p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4  q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
        vec3 hsvToRgb(vec3 c) {
            vec4  K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3  p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        // RGB to HSL
        vec3 hueToRgb(float h) {
            float r = abs(h * 6.0 - 3.0) - 1.0;
            float g = 2.0 - abs(h * 6.0 - 2.0);
            float b = 2.0 - abs(h * 6.0 - 4.0);
            return clamp(vec3(r, g, b), 0.0, 1.0);
        }
        vec3 hslToRgb(vec3 hsl) {
            vec3 rgb = hueToRgb(hsl.x);
            float c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
            return (rgb - 0.5) * c + hsl.z;
        }
        vec3 rgbToHsl(vec3 rgb) {
            float e = 1.0e-10;
            vec3 hvc = rgbToHsv(rgb);
            float l = hvc.z - hvc.y * 0.5;
            float s = hvc.y / (1.0 - abs(l * 2.0 - 1.0) + e);
            return vec3(hvc.x, s, l);
        }

        // CLOSEST
        float colorDistance(vec3 clr1, vec3 clr2) {
            vec3 diff = abs(clr1 - clr2);
            vec3 sqrd = diff * diff;
            return sqrt(diff.x + diff.y + diff.z);
        }

        vec3[2] closestColors(vec3 color) {
            vec3 closest = vec3(-10.0, -10.0, -10.0);
            vec3 secondClosest = vec3(-10.0, -10.0, -10.0);
            vec3 temp;
            for (int i = 0; i < uPaletteSize; i++) {
                temp = uPalette[i];
                float distance = colorDistance(temp, color);
                if (distance < colorDistance(closest, color)) {
                    secondClosest = closest;
                    closest = temp;
                } else if (distance < colorDistance(secondClosest, color)) {
                    secondClosest = temp;
                }
            }
            return vec3[](closest, secondClosest);
        }

        // DITHER
        vec3 stepColor(vec3 v) {
            return floor(0.5 + (v * uSteps)) / uSteps;
        }

        vec3 dither(vec2 pos, vec3 color) {
            int x = int(mod(pos.x, 8.0));
            int y = int(mod(pos.y, 8.0));
            float limit = (float(ditherTable[x + y * 8] + 1) / 64.0) + uBias;

            // vec3 hsv = rgbToHsv(color);
            vec3 hsv = color;

            vec3 cs[2] = closestColors(hsv);
            float diff = colorDistance(hsv, cs[0]) / colorDistance(hsv, cs[1]);
            vec3 resultColor = (diff < limit) ? cs[0] : cs[1];

            // vec3 s1 = stepColor(max((hsv - 0.125), 0.0));
            // vec3 s2 = stepColor(min((hsv + 0.124), 1.0));
            // vec3 colorDiff = (hsv - s1) / (s2 - s1);
            // resultColor.x = (colorDiff.x < limit) ? s1.x : s2.x; // hue
            // resultColor.y = (colorDiff.y < limit) ? s1.y : s2.y; // saturation
            // resultColor.z = (colorDiff.z < limit) ? s1.z : s2.z; // lightness / vibrance
            // return hsvToRgb(resultColor);

            return resultColor;
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            texel.rgb = dither(gl_FragCoord.xy, texel.rgb);
            gl_FragColor = texel;
        }
        `
};
