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
//  Reference(s)
//      https://stackoverflow.com/questions/26336585/three-js-webgl-x-ray-effect
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

const XRayShader = {

    defines: { USE_LOGDEPTHBUF: '' },

    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away

    uniforms: {
        'xrayColor': { value: new THREE.Color(0x88ccff) },
    },

    vertexShader: /* glsl */`
        #include <common>
        #include <logdepthbuf_pars_vertex>

        varying float intensity;

        void main() {
            // Normal calculation
            vec3  norm      = normalize(normalMatrix * normal);
            vec3  cam       = normalize(normalMatrix * cameraPosition);     // vec3(0.0, 0.0, 1.0);
            float angle     = dot(norm, cam);                               // brighter from the front
            float inverse   = 1.0 - abs(angle);                             // brighter from the sides

            float scaled    = 0.5 + (inverse * 0.5);                        // scaled from 0.5 to 1.0

            intensity       = mix(inverse, scaled, 1.0 - inverse);
            intensity       = clamp(intensity, 0.5, 1.0);

            // Shader chunk: #include <project_vertex>
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            #include <logdepthbuf_vertex>
        }`,

    fragmentShader: /* glsl */`
        #include <common>

        uniform vec3 xrayColor;
        varying float intensity;

        #include <logdepthbuf_pars_fragment>

        void main() {
            #include <logdepthbuf_fragment>

            float inverse   = 1.0 - intensity;
            float opacity   = intensity * sqrt(intensity);

            gl_FragColor = vec4(opacity * xrayColor, opacity);
        }`

};

export { XRayShader };
