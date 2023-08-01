import * as THREE from 'three';
import { LAYERS } from '../../../constants.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const MixShader = {
    uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: null },
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
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);
        }
    `,
};

class SelectiveBloomPass extends Pass {

    constructor(strength, radius, threshold) {
        super();
        const self = this;

        this.copyPass = new ShaderPass(CopyShader);
        this.copyPass.material.blending = THREE.NoBlending;

        this.renderPass = new RenderPass(null, null);
        this.renderPass.clear = false;

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(), strength, radius, threshold);

        this.mixPass = new ShaderPass(new THREE.ShaderMaterial({
            name: 'MixShader',
            uniforms: THREE.UniformsUtils.clone(MixShader.uniforms),
            vertexShader: MixShader.vertexShader,
            fragmentShader: MixShader.fragmentShader,
        }));

        Object.defineProperties(self, {
            'scene': {
                get: function() { return self.renderPass.scene; },
                set: function(scene) { self.renderPass.scene = scene; }
            },
            'camera': {
                get: function() { return self.renderPass.camera; },
                set: function(camera) { self.renderPass.camera = camera; }
            }
        });

        this.needsSwap = true;
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {

        // Copy Target
        if (!this.bufferTarget) {
            this._pixelRatio = renderer.getPixelRatio();
            const size = renderer.getSize(new THREE.Vector2());
			const effectiveWidth = size.width * this._pixelRatio;
		    const effectiveHeight = size.height * this._pixelRatio;
			this.bufferTarget = new THREE.WebGLRenderTarget(effectiveWidth, effectiveHeight, { type: THREE.HalfFloatType });
			this.bufferTarget.texture.name = 'BufferTarget';
        }

        // Camera?
        const camera = this.renderPass.camera;
        if (!camera) return;

        // Copy existing render
        this.copyPass.render(renderer, this.bufferTarget, readBuffer, deltaTime);

        // Render scene ('bloom' layer), using existing depth buffer
        renderer.setRenderTarget(readBuffer);
        renderer.clearColor();
        camera.layers.disable(LAYERS.BASE);
        camera.layers.enable(LAYERS.BLOOM);
        this.renderPass.render(renderer, writeBuffer, readBuffer);
        camera.layers.disable(LAYERS.BLOOM);
        camera.layers.enable(LAYERS.BASE);

        // Bloom
        this.bloomPass.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);

        // Mix back to readbuffer
        this.mixPass.material.uniforms['baseTexture'].value = this.bufferTarget.texture;
        this.mixPass.material.uniforms['bloomTexture'].value = readBuffer.texture;
        this.mixPass.render(renderer, writeBuffer, readBuffer);
    }

    setSize(width, height) {
        const effectiveWidth = width * (this._pixelRatio ?? window.devicePixelRatio);
		const effectiveHeight = height * (this._pixelRatio ?? window.devicePixelRatio);
		if (this.bufferTarget) this.bufferTarget.setSize(effectiveWidth, effectiveHeight);
        if (this.copyPass) this.copyPass.setSize(width, height);
        if (this.renderPass) this.renderPass.setSize(width, height);
        if (this.bloomPass) this.bloomPass.setSize(width, height);
        if (this.mixPass) this.mixPass.setSize(width, height);
    }

    dispose() {
        if (this.bufferTarget) this.bufferTarget.dispose();
        if (this.copyPass) this.copyPass.dispose();
        if (this.renderPass) this.renderPass.dispose();
        if (this.bloomPass) this.bloomPass.dispose();
        if (this.mixPass) this.mixPass.dispose();
    }

}

export { SelectiveBloomPass };
