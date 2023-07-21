import * as THREE from 'three';
import { CopyShader } from '../shaders/CopyShader.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { PixelatedShader } from '../shaders/PixelatedShader.js';

class PixelatedPass extends Pass {

	constructor(pixelSize = 1) {
		super();
        const self = this;
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
        shader = PixelatedShader;
        this.pixelUniforms = THREE.UniformsUtils.clone(shader.uniforms);
		this.pixelMaterial = new THREE.ShaderMaterial({
            name: shader.name ?? 'unspecified',
            defines: Object.assign({}, shader.defines),
            uniforms: this.pixelUniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
		});
		this.pixelQuad = new FullScreenQuad(this.pixelMaterial);

        // Pixel Shader uniforms accessible as 'uniforms'
        Object.defineProperty(this, 'uniforms', {
            get: function() { return this.pixelUniforms; },
            set: function(uniforms) { this.pixelUniforms = uniforms; },
        });

        // Beautify Render Target
        this.beautyRenderTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
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
        this.copyQuad.render(renderer);

        this.copyUniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        renderer.setRenderTarget(readBuffer);
        this.copyQuad.render(renderer);

        // // Camera Position
        // if (window.activeCamera) this.uniforms['uCamera'].value.copy(window.activeCamera.position);

        // const rendererSize = renderer.getSize(new THREE.Vector2());
		// const aspectRatio = rendererSize.x / rendererSize.y;
        // pixelAlignFrustum(
        //     camera,
        //     aspectRatio,
        //     Math.floor(rendererSize.x / this.pixelSize),
        //     Math.floor(rendererSize.y / this.pixelSize)
        // );



        // Render PixelatedShader
        this.pixelUniforms['tDiffuse'].value = readBuffer.texture;
		renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.pixelQuad.render(renderer);

        // // Render CopyShader
        // this.copyUniforms['tDiffuse'].value = readBuffer.texture;
		// renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        // this.copyQuad.render(renderer);
	}

	dispose() {
        this.copyMaterial.dispose();
        this.copyQuad.dispose();
		this.pixelMaterial.dispose();
		this.pixelQuad.dispose();
        this.beautyRenderTarget.dispose();
	}

    setPixelSize(pixelSize = 1) {
        this.pixelSize = Math.min(1024, Math.max(1, parseInt(pixelSize)));
        this.pixelUniforms['uCellSize'].value = this.pixelSize;
    }

    setFixedSize(width, height) {
        this.pixelUniforms['resolution'].value.x = width;
        this.pixelUniforms['resolution'].value.y = height;
        this.setSize(width, height);
    };

    setSize(width, height) {
        const beautyW = Math.max(1, parseInt(width / this.pixelSize));
        const beautyH = Math.max(1, parseInt(height / this.pixelSize));
        this.beautyRenderTarget.setSize(beautyW, beautyH);
    }

}

export { PixelatedPass };
