import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';

const _camPosition = new THREE.Vector3();
const _camRotation = new THREE.Quaternion();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();

// PixelPerfectPass shaders require the following uniforms:
// uniform vec2 resolution;     Actual writebuffer width/height (auto)
// uniform vec2 fixedsize;      Theoretical desired width/height (auto)
// uniform vec2 uCamera;        Camera position (auto)
// uniform vec2 uCellSize;      Pixel cell width/height (used defined)

class PixelPerfectPass extends Pass {

    constructor(shader, pixelX = 1, pixelY = 1) {
        super();

        // Pixel Shader
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        this.material = new THREE.ShaderMaterial({
            name: shader.name ?? 'NamelessShader',
            defines: Object.assign({}, shader.defines),
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        });
        this.pixelQuad = new FullScreenQuad(this.material);

        // Properties
        this.pixelSize = new THREE.Vector2();

        // Init
        this.setPixelSize(pixelX, pixelY);
    }

    render(renderer, writeBuffer, readBuffer, /* deltaTime, maskActive */) {
        const camera = this.camera;
        if (!camera) return;

        // Camera Alignment
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_pixel.html

        // Project camera position along its local rotation bases
        camera.getWorldPosition(_camPosition);
        camera.getWorldQuaternion(_camRotation);
        _camRight.set(1.0, 0.0, 0.0).applyQuaternion(_camRotation);
        _camUp.set(0.0, 1.0, 0.0).applyQuaternion(_camRotation);

        // Find how far along its position is along these bases
        const camPosX = _camPosition.dot(_camRight) * camera.zoom;
        const camPosY = _camPosition.dot(_camUp) * camera.zoom;

        // Camera Position (in Pixels)
        this.uniforms['uCamera'].value.x = camPosX;
        this.uniforms['uCamera'].value.y = camPosY;

        // Fullscreen Quad using PixelatedShader
        this.uniforms['tDiffuse'].value = readBuffer.texture;
        renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.pixelQuad.render(renderer);
    }

    dispose() {
        this.material.dispose();
        this.pixelQuad.dispose();
    }

    setPixelSize(x = 1, y = 1) {
        if (y == undefined) y = x;
        x = Math.min(1024, Math.max(1, parseInt(x)));
        y = Math.min(1024, Math.max(1, parseInt(y)));
        this.pixelSize.set(x, y);
        this.uniforms['uCellSize'].value = this.pixelSize;
    }

    setFixedSize(width, height) {
        this.uniforms['fixedsize'].value.x = width;
        this.uniforms['fixedsize'].value.y = height;
    }

    setSize(width, height) {
        this.uniforms['resolution'].value.x = width;
        this.uniforms['resolution'].value.y = height;
    };

}

export { PixelPerfectPass };
