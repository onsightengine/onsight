// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/shaders/CopyShader.js

export const CopyShader = {
	name: 'CopyShader',

	uniforms: {
		'tDiffuse': { value: null },
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,

	fragmentShader: /* glsl */`
		uniform sampler2D tDiffuse;
        varying vec2 vUv;
		void main() {
			gl_FragColor = texture2D(tDiffuse, vUv);
		}`
};
