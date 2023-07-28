import * as THREE from 'three';

// http://devlog-martinsh.blogspot.com/2011/03/glsl-8x8-bayer-matrix-dithering.html
// http://alex-charlton.com/posts/Dithering_on_the_GPU/

const empty256 = [];
for (let i = 0; i < 256; i++) empty256.push(new THREE.Vector3());

export const DitherShader = {
    name: 'Dither Shader',

    uniforms: {
        'resolution': { value: new THREE.Vector2() },
        'tDiffuse': { value: null },
        'uPaletteRgb': { value: [
            // Five
            // new THREE.Vector3(0.00, 0.00, 0.00),    // rgb black
            // new THREE.Vector3(1.00, 1.00, 1.00),    // rgb white
            // new THREE.Vector3(1.00, 0.00, 0.00),    // rgb red
            // new THREE.Vector3(0.00, 1.00, 0.00),    // rgb green
            // new THREE.Vector3(0.00, 0.00, 1.00),    // rgb blue
            // Sixteen
            new THREE.Vector3(0.00, 0.00, 0.00),    // rgb black
            new THREE.Vector3(0.33, 0.33, 0.33),    // rgb gray
            new THREE.Vector3(0.66, 0.66, 0.66),    // rgb silver
            new THREE.Vector3(1.00, 1.00, 1.00),    // rgb white
            new THREE.Vector3(0.00, 1.00, 1.00),    // rgb aqua
            new THREE.Vector3(0.00, 0.00, 1.00),    // rgb blue
            new THREE.Vector3(0.00, 0.00, 0.50),    // rgb navy
            new THREE.Vector3(0.50, 0.00, 0.50),    // rgb purple
            new THREE.Vector3(1.00, 0.00, 1.00),    // rgb fuchsia
            new THREE.Vector3(1.00, 0.00, 0.00),    // rgb red
            new THREE.Vector3(0.50, 0.00, 0.00),    // rgb maroon
            new THREE.Vector3(0.50, 0.50, 0.00),    // rgb olive
            new THREE.Vector3(1.00, 1.00, 0.00),    // rgb yellow
            new THREE.Vector3(0.00, 1.00, 0.00),    // rgb lime
            new THREE.Vector3(0.00, 0.50, 0.00),    // rgb green
            new THREE.Vector3(0.00, 0.50, 0.50),    // rgb teal
            ...empty256,
        ]},
        'uPaletteSize': { value: 16 },
        'uBias': { value: 0 },
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
        uniform vec3[256] uPaletteRgb;
        uniform int uPaletteSize;
        uniform float uBias;

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

        vec3 rgbToHsv(vec3 c) {
            vec4  K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4  p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4  q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        float euclideanDistance(vec3 clr1, vec3 clr2) {
            vec3 diff = abs(clr1 - clr2);
            vec3 sqrd = diff * diff;
            return sqrt(diff.x + diff.y + diff.z);
        }

        float hueDistance(vec3 hsv1, vec3 hsv2) {
            return abs(hsv1.x - hsv2.x);
        }

        float colorDistance(vec3 clr1, vec3 clr2) {
            vec3 hsv1 = rgbToHsv(clr1);
            vec3 hsv2 = rgbToHsv(clr2);
            float hd = hueDistance(hsv1, hsv2);
            float ed = euclideanDistance(clr1, clr2);
            return ((hd * 1.0) + (ed * 3.0)) / 4.0;
        }

        vec3[2] closestColors(vec3 color) {
            vec3 closest = vec3(-10.0, -10.0, -10.0);
            vec3 second = vec3(-10.0, -10.0, -10.0);
            vec3 temp;
            for (int i = 0; i < uPaletteSize; i++) {
                temp = uPaletteRgb[i];
                float distance = colorDistance(uPaletteRgb[i], color);
                if (distance < colorDistance(closest, color)) {
                    second = closest;
                    closest = temp;
                } else if (distance < colorDistance(second, color)) {
                    second = temp;
                }
            }
            return vec3[](closest, second);
        }

        vec3 stepColor(vec3 v) {
            return floor(0.5 + (v * 4.0)) / 4.0;
        }

        vec3 dither(vec2 pos, vec3 color) {
            int x = int(mod(pos.x, 8.0));
            int y = int(mod(pos.y, 8.0));
            float limit = (float(ditherTable[x + y * 8] + 1) / 64.0) + uBias;

            vec3 cs[2] = closestColors(color);
            float diff = colorDistance(color, cs[0]) / colorDistance(color, cs[1]);
            vec3 resultColor = (diff < limit) ? cs[0] : cs[1];
            return resultColor;
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            texel.rgb = dither(gl_FragCoord.xy, texel.rgb);
            gl_FragColor = texel;
        }
        `
};
