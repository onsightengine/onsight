/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/mrdoob/three.js/blob/master/examples/webgl_depth_texture.html
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { FullScreenQuad, Pass } from 'three/addons/postprocessing/Pass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { DepthShader } from '../shaders/DepthShader.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Depth Pass
/////////////////////////////////////////////////////////////////////////////////////

/** Depth texture visualization render pass */
class DepthPass extends Pass {

    constructor(camera) {
        super();
        this.camera = camera;
        this.needsSwap = false;

        this.copyPass = new ShaderPass(CopyShader);
        this.copyPass.clear = true;
        this.copyPass.clearDepth = false;
        this.copyPass.renderToScreen = false;
        this.copyPass.material.depthWrite = false;

        this.depthMaterial = new THREE.ShaderMaterial(DepthShader);

        this.fsQuad = new FullScreenQuad(this.depthMaterial);
    }

    dispose() {
        this.depthMaterial.dispose();
    }

    render(renderer, writeBuffer, readBuffer, deltaTime,/* maskActive*/) {
        // Save renderer values
        const oldAutoClear = renderer.autoClear;
        const oldAutoClearColor = renderer.autoClearColor;
        const oldAutoClearDepth = renderer.autoClearDepth;
        const oldAutoClearStencil = renderer.autoClearStencil;
        renderer.autoClear = false;
        renderer.autoClearColor = true;
        renderer.autoClearDepth = false; // don't clear depth buffer!
        renderer.autoClearStencil = false;

        // Use current renderTarget info to draw with (we have been drawing on the readBuffer)
        const uniforms = this.fsQuad.material.uniforms;
        uniforms.tDiffuse.value = readBuffer.texture;
        uniforms.tDepth.value = readBuffer.depthTexture;
        uniforms.cameraNear.value = this.camera.near;
        uniforms.cameraFar.value = this.camera.far;
        uniforms.weight.value = (this.camera.isPerspectiveCamera) ? 1.0 : 7.0;

        // Render to writeBuffer
        renderer.setRenderTarget((this.renderToScreen) ? null : writeBuffer);
        this.fsQuad.render(renderer);

        // Copy writeBuffer back to readBuffer (keep original depth buffer)
        this.copyPass.render(renderer, readBuffer, writeBuffer, deltaTime);

        // Restore renderer values
        renderer.autoClear = oldAutoClear;
        renderer.autoClearColor = oldAutoClearColor;
        renderer.autoClearDepth = oldAutoClearDepth;
        renderer.autoClearStencil = oldAutoClearStencil;
    }
}

export { DepthPass };
