// https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Sky.js
// https://github.com/tentone/nunuStudio/blob/master/source/core/objects/misc/Sky.js

import * as THREE from 'three';

const SCALE = 500;

const SkyShader = {

    uniforms: {
        //'uSky':   { value: new THREE.Color(0.32, 0.51, 0.74) },   // sky blue
        'uSky':     { value: new THREE.Color(0.00, 0.85, 0.80) },   // icon
        //'uHorizon': { value: new THREE.Color(1.00, 1.00, 1.00) }, // white
        'uHorizon': { value: new THREE.Color(1.00, 0.75, 0.50) },   // bright yellow
        'uGround':  { value: new THREE.Color(0.90, 0.70, 0.50) },   // tan 230, 179, 128
        'uScale':   { value: SCALE },
    },

    vertexShader: /* glsl */`
        varying vec3 vWorldPosition;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

    fragmentShader: /* glsl */`
        uniform vec3    uSky;
        uniform vec3    uHorizon;
        uniform vec3    uGround;
        uniform float   uScale;
        varying vec3    vWorldPosition;

        void main() {
            float lowerGround =         0.0;
            float h = normalize(vWorldPosition + lowerGround).y;

            // Sky fade (brighten at horizon)
            float skyFade = pow(vWorldPosition.y / (uScale * 0.25), 0.4);
            skyFade = clamp(skyFade, 0.0, 1.0);
            vec3 sky = mix(uHorizon, uSky, skyFade);

            // Seperates ground and sky, solid horizon: clamp(h * uScale, 0.0, 1.0)
            float blurHorizon =         0.05;
            float compressHorizon =     5.0;
            float skyMix = max(pow(max(h, 0.0), blurHorizon) * compressHorizon, 0.0);
            skyMix = clamp(skyMix, 0.0, 1.0);
            vec3 outColor = mix(uGround, sky, skyMix);

            // Output Color
            gl_FragColor = vec4(outColor, 1.0);
        }`,
};

class SkyObject extends THREE.Mesh {

    constructor() {
        super(new THREE.SphereGeometry(1), new THREE.ShaderMaterial({
            name:           'SkyShader',
            fragmentShader: SkyShader.fragmentShader,
            vertexShader:   SkyShader.vertexShader,
            uniforms:       THREE.UniformsUtils.clone(SkyShader.uniforms),
            side:           THREE.BackSide,
            depthTest:      false,
            depthWrite:     false,
        }));

        this.isSky = true;

        this.baseScale = SCALE;
        this.scale.setScalar(this.baseScale);
    }

    copy(source, recursive) {
        super.copy(source, recursive);

        this.baseScale = source.baseScale;
        this.scale.setScalar(this.baseScale);

        return this;
    }

}

export { SkyObject };
