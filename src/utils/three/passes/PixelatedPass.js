import * as THREE from 'three';
import { CopyShader } from '../shaders/CopyShader.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { PixelatedShader } from '../shaders/PixelatedShader.js';

const _camPosition = new THREE.Vector3();
const _camRotation = new THREE.Quaternion();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();

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
            get: function() { return self.pixelUniforms; },
            set: function(uniforms) { self.pixelUniforms = uniforms; },
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

        // // Render CopyShader
        // this.copyUniforms['tDiffuse'].value = readBuffer.texture;
		// renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        // this.copyQuad.render(renderer);

        // Render PixelatedShader
        this.pixelUniforms['tDiffuse'].value = readBuffer.texture;
		renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.pixelQuad.render(renderer);
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
        const beautyW = Math.max(1, width / Math.max(1.0, this.pixelSize));
        const beautyH = Math.max(1, height / Math.max(1.0, this.pixelSize));
        this.beautyRenderTarget.setSize(beautyW, beautyH);
    };

    setSize(width, height) {}

    // Align Camera to Pixel Grid
    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_pixel.html
    onBeforeRender() {
        const camera = this.camera;
        if (!camera) return;

        const width = (camera.right - camera.left);
        const height = (camera.top - camera.bottom);

        // Project camera position along its local rotation bases
        camera.getWorldPosition(_camPosition);
        camera.getWorldQuaternion(_camRotation);
        _camRight.set(1.0, 0.0, 0.0).applyQuaternion(_camRotation);
        _camUp.set(0.0, 1.0, 0.0).applyQuaternion(_camRotation);

        // Find how far along its position is along these bases
        const camPosRight = _camPosition.dot(_camRight);
        const camPosUp = _camPosition.dot(_camUp);

        // Find the fractional pixel units (in world units)
        const fractX = camPosRight % (this.pixelSize * camera.zoom);
		const fractY = camPosUp % (this.pixelSize * camera.zoom);

        // Add fractional world units to align with the pixel grid
        camera.left =   (- width  / 2.0) - (fractX / 2.0);
        camera.right =  (+ width  / 2.0) - (fractX / 2.0);
        camera.top =    (+ height / 2.0) - (fractY / 2.0);
        camera.bottom = (- height / 2.0) - (fractY / 2.0);
        camera.updateProjectionMatrix();
    }

}

export { PixelatedPass };