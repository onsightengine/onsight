// https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/CopyShader.js

export const OpaqueShader = {
	name: 'OpaqueShader',

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }
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
			vec4 texel = texture2D(tDiffuse, vUv);
			gl_FragColor = vec4(texel.rgb, 1.0);
		}`

};
