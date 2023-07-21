
import * as THREE from 'three';
import { CopyShader } from '../shaders/CopyShader.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { PixelShader } from '../shaders/PixelShader.js';

class PixelatedPass extends Pass {

	constructor(pixelSize = 1) {
		super();
        let shader;

        // Copy Shader
        shader = CopyShader;
        this.copyUniforms = THREE.UniformsUtils.clone(shader.uniforms);
        this.copyMaterial = new THREE.ShaderMaterial({
            name: shader.name ?? 'unspecified',
            defines: Object.assign({}, shader.defines),
            uniforms: this.copyUniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        });
        this.copyQuad = new FullScreenQuad(this.copyMaterial);

        // Pixel Shader
        shader = PixelShader;
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		this.material = new THREE.ShaderMaterial({
            name: shader.name ?? 'unspecified',
            defines: Object.assign({}, shader.defines),
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
		});
		this.pixelQuad = new FullScreenQuad(this.material);

        // Beautify Render Target
        this.beautyRenderTarget = new THREE.WebGLRenderTarget();
		this.beautyRenderTarget.texture.minFilter = THREE.NearestFilter;
		this.beautyRenderTarget.texture.magFilter = THREE.NearestFilter;
		this.beautyRenderTarget.texture.type = THREE.HalfFloatType;
		this.beautyRenderTarget.depthTexture = new THREE.DepthTexture();

        // Init
        this.setPixelSize(pixelSize);
	}

	render(renderer, writeBuffer, readBuffer, /* deltaTime, maskActive */) {

        // Copy to Beauty and Back Again
        this.copyUniforms['tDiffuse'].value = readBuffer.texture;
        renderer.setRenderTarget(this.beautyRenderTarget);
        renderer.clear(true, true, true);
        this.copyQuad.render(renderer);

        this.copyUniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        renderer.setRenderTarget(readBuffer);
        renderer.clear(true, true, true);
        this.copyQuad.render(renderer);

        // Render from Beauty
        this.uniforms['tDiffuse'].value = readBuffer.texture;
		this.pixelQuad.material = this.material;
		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.pixelQuad.render(renderer);
		} else {
			renderer.setRenderTarget(writeBuffer);
			if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
			this.pixelQuad.render(renderer);
		}
	}

	dispose() {
        this.copyMaterial.dispose();
        this.copyQuad.dispose();

		this.material.dispose();
		this.pixelQuad.dispose();

        this.beautyRenderTarget.dispose();
	}

    setPixelSize(pixelSize = 1) {
        this.pixelSize = Math.min(1024, Math.max(1, parseInt(pixelSize)));
        this.uniforms['uCellSize'].value = this.pixelSize;
    }

    setSize(width, height) {
        const beautyW = Math.max(1, parseInt(width / this.pixelSize));
        const beautyH = Math.max(1, parseInt(height / this.pixelSize));
        this.beautyRenderTarget.setSize(beautyW, beautyH);
    }

}

export { PixelatedPass };
