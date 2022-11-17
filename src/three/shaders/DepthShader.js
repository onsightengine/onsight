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
//  DepthShader
//      Depth texture visualization shader
//
//  Additional Source(s)
//      MIT     https://github.com/mrdoob/three.js/blob/master/examples/webgl_depth_texture.html
//
/////////////////////////////////////////////////////////////////////////////////////

const DepthShader = {

    defines: {},

    transparent: true,
    depthTest: false,
    depthWrite: false,

    uniforms: {
        'tDiffuse': { value: null },
        'tDepth': { value: null },
        'cameraNear': { value: 0.01 },
        'cameraFar': { value: 1000 },
        'weight': { value: 2.0 },
    },

    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

    //
    // Alternatively, look into depth packing functions:
    //      https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/packing.glsl.js
    //
    // Starting Camera Properties
    //      Perspective:    Near:  0.01, Far: 1000
    //      Orthographic:   Near: -1000, Far: 1000
    //
    fragmentShader: /* glsl */`
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float weight;

        void main() {
            vec4  diffuse   = texture2D(tDiffuse, vUv);
            float depth     = texture2D(tDepth, vUv).x;

            if (depth >= 0.999) {
                gl_FragColor = texture2D(tDiffuse, vUv);        // discard unwritten depth
            } else {
                depth = ((depth - 0.5) * weight) + 0.5;         // add weight to objects in middle of camera range
                gl_FragColor = vec4(vec3(1.0 - depth), 1.0);
            }
        }
    `
};

export { DepthShader };
