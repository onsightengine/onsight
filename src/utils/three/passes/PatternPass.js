import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { PixelatedShader } from '../shaders/PixelatedShader.js';

class PatternPass extends Pass {

    constructor(pixelSize = 1) {
        super();

        // Pixelated Shader
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

}

export { PatternPass };
