import * as THREE from 'three';
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

        // Pixel Shader
        const shader = PixelatedShader;
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		this.material = new THREE.ShaderMaterial({
            name: shader.name ?? 'unspecified',
            defines: Object.assign({}, shader.defines),
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
		});
		this.pixelQuad = new FullScreenQuad(this.material);

        // Init
        this.setPixelSize(pixelSize);
	}

	render(renderer, writeBuffer, readBuffer, /* deltaTime, maskActive */) {
        this.uniforms['tDiffuse'].value = readBuffer.texture;
		renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.pixelQuad.render(renderer);
	}

	dispose() {
		this.material.dispose();
		this.pixelQuad.dispose();
	}

    setPixelSize(pixelSize = 1) {
        this.pixelSize = Math.min(1024, Math.max(1, parseInt(pixelSize)));
        this.uniforms['uCellSize'].value = this.pixelSize;
    }

    setFixedSize(width, height) {
        this.uniforms['resolution'].value.x = width;
        this.uniforms['resolution'].value.y = height;
    };

    setSize(width, height) {}

    // Align Camera to Pixel Grid
    onBeforeRender() {
        const camera = this.camera;
        if (!camera) return;

        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_pixel.html
        const width = (camera.right - camera.left);
        const height = (camera.top - camera.bottom);
        const pixelWidth = width / Math.floor(width / this.pixelSize);
        const pixelHeight = height / Math.floor(height / this.pixelSize);

        // Project camera position along its local rotation bases
        camera.getWorldPosition(_camPosition);
        camera.getWorldQuaternion(_camRotation);
        _camRight.set(1.0, 0.0, 0.0).applyQuaternion(_camRotation);
        _camUp.set(0.0, 1.0, 0.0).applyQuaternion(_camRotation);

        // Find how far along its position is along these bases
        const camPosRight = _camPosition.dot(_camRight);
        const camPosUp = _camPosition.dot(_camUp);

        // Find the fractional pixel units (in world units)
        let fractX = (camPosRight * camera.relativeZoom) % pixelWidth;
		let fractY = (camPosUp * camera.relativeZoom) % pixelHeight;
        fractX /= camera.relativeZoom;
        fractY /= camera.relativeZoom;

        // Add fractional world units to align with the pixel grid
        camera.left =   (- width  / 2.0) - fractX;
        camera.right =  (+ width  / 2.0) - fractX;
        camera.top =    (+ height / 2.0) - fractY;
        camera.bottom = (- height / 2.0) - fractY;
        camera.updateProjectionMatrix();
    }

}

export { PixelatedPass };
