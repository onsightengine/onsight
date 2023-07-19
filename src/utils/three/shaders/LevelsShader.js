
export const LevelsShader = {
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
