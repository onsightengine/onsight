import * as THREE from 'three';

// http://alex-charlton.com/posts/Dithering_on_the_GPU/

export const DitherShader = {
    name: 'Dither Shader',

    uniforms: {
        'resolution': { value: new THREE.Vector2() },
        'tDiffuse': { value: null },
        'uBias': { value: 2 },
        'uSteps': { value: 4 },
        'uPaletteSize': { value: 16 },
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
        uniform int uPaletteSize;

        varying vec2 vUv;

        const vec3[16] palette = vec3[](
            vec3(.9222, .8824, .0667), vec3(.6034, .3222, .3529), vec3(.1354, .5455, .3451), vec3(.5444, .0980, .6000),
            vec3(.0432, .1888, .5608), vec3(.1489, .4682, .8627), vec3(.1875, .1633, .9608), vec3(.1667, .0329, .9529),
            vec3(.0148, .6818, .2588), vec3(.0169, .5298, .6588), vec3(.0762, .5222, .7059), vec3(.1117, .4975, .7882),
            vec3(.0556, .6000, .2353), vec3(.0792, .5479, .2863), vec3(.0970, .5140, .4196), vec3(.1078, .5397, .4941)
        );

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

        vec3 hsvToRgb(vec3 c) {
            vec4  K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3  p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        float hueDistance(float h1, float h2) {
            float diff = abs(h1 - h2);
            return min(abs(1.0 - diff), diff);
        }

        vec3 stepColor(vec3 v) {
            return floor(0.5 + (v * uSteps)) / uSteps;
        }

        vec3[2] closestColors(float hue) {
            vec3 closest = vec3(-2.0, 0.0, 0.0);
            vec3 secondClosest = vec3(-2.0, 0.0, 0.0);
            for (int i = 0; i < uPaletteSize; i++) {
                vec3 clr = palette[i];
                float distance = hueDistance(clr.x, hue);
                if (distance < hueDistance(closest.x, hue)) {
                    secondClosest = closest;
                    closest = clr;
                } else if (distance < hueDistance(secondClosest.x, hue)) {
                    secondClosest = clr;
                }
            }
            return vec3[](closest, secondClosest);
        }

        vec3 dither(vec2 pos, vec3 color) {
            int x = int(mod(pos.x, 8.0));
            int y = int(mod(pos.y, 8.0));
            float d = (float(ditherTable[x + y * 8]) / 64.0) + uBias;

            vec3 hsv = rgbToHsv(color);
            vec3 cs[2] = closestColors(hsv.x);
            float hueDiff = hueDistance(hsv.x, cs[0].x) / hueDistance(cs[1].x, cs[0].x);

            vec3 s1 = stepColor(max((hsv - 0.125), 0.0));
            vec3 s2 = stepColor(min((hsv + 0.124), 1.0));
            vec3 colorDiff = (hsv - s1) / (s2 - s1);

            vec3 resultColor = (hueDiff < d) ? cs[0] : cs[1];
            // resultColor.x = (colorDiff.x < d) ? s1.x : s2.x;    // hue
            // resultColor.y = (colorDiff.y < d) ? s1.y : s2.y;    // saturation
            // resultColor.z = (colorDiff.z < d) ? s1.z : s2.z;        // vibrance
            return hsvToRgb(resultColor);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            texel.rgb = dither(gl_FragCoord.xy, texel.rgb);
            gl_FragColor = texel;
        }
        `
};
