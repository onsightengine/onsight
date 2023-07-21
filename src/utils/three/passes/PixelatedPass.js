import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { PixelatedShader } from '../shaders/PixelatedShader.js';

class PixelatedPass extends Pass {

    constructor(pixelSize = 1) {
        super();

        // Pixel Shader
        let shader = PixelatedShader;
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
        // Camera Position
        if (window.activeCamera) this.uniforms['uCamera'].value.copy(window.activeCamera.position);

        // Render
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
        this.material.dispose();
        this.pixelQuad.dispose();
    }

    setPixelSize(pixelSize = 1) {
        this.pixelSize = Math.min(1024, Math.max(1, parseInt(pixelSize)));
        this.uniforms['uCellSize'].value = this.pixelSize;
    }

}

export { PixelatedPass };
