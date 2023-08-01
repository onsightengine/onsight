import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

class MixPass extends ShaderPass {

    constructor(mixTexture = null) {

        const material = new THREE.ShaderMaterial({
            name: 'MixShader',
            uniforms: {
                baseTexture: { value: null },
                mixTexture: { value: mixTexture },
            },
            vertexShader: `
                varying vec2 vUv;
			    void main() {
				    vUv = uv;
				    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			    }
            `,
            fragmentShader: `
                uniform sampler2D baseTexture;
			    uniform sampler2D mixTexture;
			    varying vec2 vUv;
			    void main() {
				    gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(mixTexture, vUv);
			    }
            `,
        });

        super(material, 'baseTexture');

        this.needsSwap = true;

    }

}

export { MixPass };
