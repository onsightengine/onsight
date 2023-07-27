import * as THREE from 'three';

export const CartoonShader = {
    name: 'Cartoon Shader',

    uniforms: {
        'resolution': { value: new THREE.Vector2() },
        'tDiffuse': { value: null },
        'uEdgeColor': { value: new THREE.Color(0x000000) },
        'uEdgeStrength': { value: 2.0 },
        'uGradient': { value: 8.0 },
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
        uniform vec3 uEdgeColor;
        uniform float uEdgeStrength;
        uniform float uGradient;

        varying vec2 vUv;

        //***** Fast Rgb / Hsv Conversion Functions *****/

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

        //***** Cartoon Filter Functions *****/

        // Averaged pixel intensity from 3 color channels
        float avgIntensity(vec4 pix) {
            return (pix.r + pix.g + pix.b) / 3.0;
        }

        // Returns pixel color
        float isEdge(in vec2 coords) {
            float dxtex = 1.0 / float(resolution.x); // textureSize(tDiffuse, 0));
            float dytex = 1.0 / float(resolution.y); // textureSize(tDiffuse, 0));
            float pix[9];
            int   k = -1;
            float delta;

            // Read neighboring pixel intensities
            for (int i = -1; i < 2; i++) {
                for (int j = -1; j < 2; j++) {
                    k++;
                    pix[k] = avgIntensity(texture2D(tDiffuse, coords + vec2(float(i) * dxtex, float(j) * dytex)));
                }
            }

            // Average color differences around neighboring pixels
            delta = (abs(pix[1] - pix[7]) + abs(pix[5] - pix[3]) + abs(pix[0] - pix[8]) + abs(pix[2] - pix[6]) ) / 4.0;
            return clamp((uEdgeStrength * 10.0) * delta, 0.0, 1.0);
        }

        void main() {
            // Start
            vec4 texel = texture2D(tDiffuse, vUv);

            // Color Gradient
            float clrs = 1.0 / uGradient;

            // Toon
            vec3 hsv = rgbToHsv(texel.rgb);
            hsv.x = clamp(0.01 * (floor(hsv.x / 0.01)), 0.0, 1.0);
            hsv.y = clamp(0.01 * (floor(hsv.y / 0.01)), 0.0, 1.0);
            hsv.z = clamp(clrs * (floor(hsv.z / clrs) + (1.0 * texel.a)), 0.0, 1.0);
            vec3 rgb = hsvToRgb(hsv.xyz);

            // Edge
            float edge = (uEdgeStrength > 0.0) ? isEdge(vUv) : 0.0;
            if (edge >= 0.1) { // edge threshold
                rgb = mix(rgb, uEdgeColor, clamp(edge * 3.0, 0.0, 1.0));
            }

            // Final
            texel.rgb = vec3(rgb.x, rgb.y, rgb.z);
            gl_FragColor = texel;
        }`
};
