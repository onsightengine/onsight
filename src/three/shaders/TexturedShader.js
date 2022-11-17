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
//  TexturedShader
//      Super basic texture map material shader
//
/////////////////////////////////////////////////////////////////////////////////////

const TexturedShader = {

    defines: { USE_LOGDEPTHBUF: '' },

    transparent: true,

    uniforms: {
        'map': { value: null },
        'opacity': { value: 1.0 },
    },

    vertexShader: /* glsl */`
        #include <common>
        #include <logdepthbuf_pars_vertex>

        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            #include <logdepthbuf_vertex>
        }`,

    fragmentShader: /* glsl */`
        #include <common>

        uniform sampler2D map;
        uniform float opacity;
        varying vec2 vUv;

        #include <logdepthbuf_pars_fragment>

        void main() {
            #include <logdepthbuf_fragment>

            vec4 texel = texture2D(map, vUv);
            if (texel.a < 0.01) discard;

            gl_FragColor = opacity * texel;
        }`

};

export { TexturedShader };
