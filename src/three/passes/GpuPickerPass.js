/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      CC0     https://github.com/bzztbomb/three_js_gpu_picking - Dec 29, 2021
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { Pass } from 'three/addons/postprocessing/Pass.js';

import { ObjectUtils } from '../utils/ObjectUtils.js';

///// Local Variables

const _clearColor = new THREE.Color(0xffffff);
const _materialCache = [];
const _currClearColor = new THREE.Color();

let _emptyScene;
let _renderer;

/////////////////////////////////////////////////////////////////////////////////////
/////   Gpu Picker Pass
/////////////////////////////////////////////////////////////////////////////////////

/** For performing gpu picking */
class GpuPickerPass extends Pass {

    constructor(scene, camera) {
        super();
        const self = this;

        this.scene = scene;
        this.camera = camera;

        this.overrideMaterial = undefined;
        this.clearColor = undefined;
        this.clearAlpha = 0;
        this.clear = false;
        this.clearDepth = false;
        this.needsSwap = false;

        this.renderDebugView = false;               // Set to true to render gpu picker scene for debugging
        this.needPick = false;                      // Set this to true when we need to perform a gpu mouse pick
        this.x = 0;                                 // Mouse x location to perform pick
        this.y = 0;                                 // Mouse y location to perform pick
        this.pickedId = -1;                         // Returns object id

        // We need to be inside of .render in order to call renderBufferDirect in renderList() so,
        // create empty scene and use the onAfterRender callback to actually render geometry for picking
        _emptyScene = new THREE.Scene();
        _emptyScene.onAfterRender = renderList;

        // This is the 1x1 pixel render target we use to do the picking
        this.pickingTarget = new THREE.WebGLRenderTarget(1, 1, {
            minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat, encoding: THREE.LinearEncoding
        });
        this.pixelBuffer = new Uint8Array(4 * this.pickingTarget.width * this.pickingTarget.height); // RGBA is 4 channels

        // This is the magic, these render lists are still filled with valid data. Because of this
        // we can submit them again for picking and save lots of work!
        function renderList() {
            const renderList = _renderer.renderLists.get(self.scene, 0);
            renderList.opaque.forEach(processItem);
            renderList.transmissive.forEach(processItem);
            renderList.transparent.forEach(processItem);
        }

        function processItem(renderItem) {
            let object = renderItem.object;

            if (! object || ! object.isObject3D) return;
            if (! object.visible) return;
            if (! ObjectUtils.allowSelection(object)) return;

            let objId = object.id;
            let material = object.material; // renderItem.material;
            let geometry = object.geometry; // renderItem.geometry;

            let useMorphing = 0;
            if (material.morphTargets === true) {
                if (geometry.isBufferGeometry === true) {
                    useMorphing = (geometry.morphAttributes?.position?.length > 0) ? 1 : 0;
                } else if (geometry.isGeometry === true) {
                    useMorphing = (geometry.morphTargets?.length > 0) ? 1 : 0;
                }
            }

            let useSkinning = object.isSkinnedMesh ? 1 : 0;
            let useInstancing = object.isInstancedMesh === true ? 1 : 0;
            let frontSide = material.side === THREE.FrontSide ? 1 : 0;
            let backSide = material.side === THREE.BackSide ? 1 : 0;
            let doubleSide = material.side === THREE.DoubleSide ? 1 : 0;
            let index = (useMorphing << 0) |
                (useSkinning << 1) |
                (useInstancing << 2) |
                (frontSide << 3) |
                (backSide << 4) |
                (doubleSide << 5);
            let renderMaterial = _materialCache[index];
            if (! renderMaterial) {
                renderMaterial = new THREE.ShaderMaterial({
                    defines: { USE_MAP: '', USE_UV: '', USE_LOGDEPTHBUF: '', },

                    // For common Three.js shader uniforms, see:
                    //      https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js

                    vertexShader: THREE.ShaderChunk.meshbasic_vert,

                    //
                    // ----- Alternative: Basic Vertex Shader -----
                    //
                    // vertexShader: `
                    //  varying vec2 vUv;
                    //  void main() {
                    //      vUv = uv;
                    //      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    //      gl_Position = projectionMatrix * mvPosition;
                    //  }
                    // `,

                    // shader reference
                    // 		https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshbasic.glsl.js

                    fragmentShader: `
                        #include <common>

                        varying vec2 vUv;

                        uniform float opacity;
                        uniform sampler2D map;
                        uniform vec4 objectId;
                        uniform float useMap;

                        #include <logdepthbuf_pars_fragment>

                        void main() {
                            #include <logdepthbuf_fragment>

                            gl_FragColor = objectId;

                            if (opacity < 0.05) discard;

                            if (useMap > 0.0) {
                                vec4 texelColor = texture2D(map, vUv);
                                if (texelColor.a < 0.05) discard;

                                ///// To just render normal texture color:
                                // gl_FragColor = texelColor;
                            }
                        }
                    `,

                    fog: false,
                    lights: false,
                });

                // Material Settings
                renderMaterial.side = material.side;
                renderMaterial.skinning = useSkinning > 0;
                renderMaterial.morphTargets = useMorphing > 0;

                renderMaterial.uniforms = {
                    opacity: { value: 1.0 },
                    map: { value: undefined },
                    uvTransform: { value: new THREE.Matrix3() },
                    objectId: { value: [1.0, 1.0, 1.0, 1.0] },
                    useMap: { value: 0.0 },
                };
                _materialCache[index] = renderMaterial;
            }

            // Uniforms
            renderMaterial.uniforms.objectId.value = [
                (objId >> 24 & 255) / 255,
                (objId >> 16 & 255) / 255,
                (objId >> 8 & 255) / 255,
                (objId & 255) / 255,
            ];
            // // Render fully transparent objects to gpu picker
            // renderMaterial.uniforms.opacity.value = (material.opacity) ? material.opacity : 1.0;
            renderMaterial.uniforms.useMap.value = 0.0;
            if (material.map) {
                renderMaterial.uniforms.useMap.value = 1.0;
                renderMaterial.uniforms.map.value = material.map;
            }
            renderMaterial.uniformsNeedUpdate = true;

            // Render Object
            _renderer.renderBufferDirect(self.camera, null, geometry, renderMaterial, object, null);
        }

    } // end ctor

    dispose() {
        this.pickingTarget.dispose();
    }

    render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
        if (this.needPick === false && this.renderDebugView === false) return;

        _renderer = renderer;

        const camWidth = renderer.domElement.width;
        const camHeight = renderer.domElement.height;

        // Set the projection matrix to only look at the pixel we are interested in.
        this.camera.setViewOffset(camWidth, camHeight, this.x, this.y, 1, 1);

        // Store current renderer state info
        const currRenderTarget = renderer.getRenderTarget();
        const currAlpha = renderer.getClearAlpha();
        renderer.getClearColor(_currClearColor);

        // Render, get pixel from target
        renderer.setRenderTarget(this.pickingTarget);
        renderer.setClearColor(_clearColor);
        renderer.clear();
        renderer.render(_emptyScene, this.camera);
        renderer.readRenderTargetPixels(this.pickingTarget, 0, 0, this.pickingTarget.width, this.pickingTarget.height, this.pixelBuffer);

        // Restore renderer state info
        renderer.setRenderTarget(currRenderTarget);
        this.camera.clearViewOffset();
        if (this.renderDebugView) renderer.render(_emptyScene, this.camera);
        renderer.setClearColor(_currClearColor, currAlpha);

        // Store picked ID
        if (this.needPick) {
            this.pickedId = (this.pixelBuffer[0] << 24) + (this.pixelBuffer[1] << 16) + (this.pixelBuffer[2] << 8) + this.pixelBuffer[3];
            this.needPick = false;
        }
    }

    // !!!!! DEBUG: For debugging, render picker scene
    renderPickScene(renderer, camera) {
        _renderer = renderer;

        // Store current renderer state info
        const currAlpha = renderer.getClearAlpha();
        renderer.getClearColor(_currClearColor);

        // Render, get pixel from target
        renderer.setClearColor(_clearColor);
        renderer.clear();
        renderer.render(_emptyScene, camera);

        // Restore renderer state info
        renderer.setClearColor(_currClearColor, currAlpha);
    }

}

export { GpuPickerPass };
