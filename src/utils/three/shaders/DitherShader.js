// http://alex-charlton.com/posts/Dithering_on_the_GPU/

export const DitherShader = {
    name: 'Dither Shader',

    uniforms: {
        'tDiffuse': { value: null },
        'colors': { value: 2 },
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
        uniform float colors;

        varying vec2 vUv;

        const float indexMatrix4x4[16] = float[](
             0.0,  8.0,  2.0, 10.0,
            12.0,  4.0, 14.0,  6.0,
             3.0, 11.0,  1.0,  9.0,
            15.0,  7.0, 13.0,  5.0);

        float indexValue(vec2 uv) {
            int x = int(mod(uv.x, 4.0));
            int y = int(mod(uv.y, 4.0));
            return indexMatrix4x4[(x + y * 4)] / 16.0;
        }

        float dither(vec2 uv, float color) {
            float closestColor = (color < 0.5) ? 0.0 : 1.0;
            float secondClosestColor = 1.0 - closestColor;
            float d = indexValue(uv);
            float distance = abs(closestColor - color);
            return (distance < d) ? closestColor : secondClosestColor;
        }

        void main() {
            // Start
            vec4 texel = texture2D(tDiffuse, vUv);

            // Dither
            float l = luminance(texel.rgb);
            texel = vec4(vec3(dither(vUv, l)), texel.a);

            // Final
            gl_FragColor = texel;
        }`
};
