import { Mesh } from '../../core/Mesh.js';
import { Plane } from '../geometries/Plane.js';
import { Program } from '../../core/Program.js';

class Sprite extends Mesh {

    static #geometry;
    static #program;

    constructor({
        texture,
    } = {}) {
        if (!Sprite.#geometry) Sprite.#geometry = new Plane();
        if (!Sprite.#program) {
            Sprite.#program = new Program({
                cullFace: null,
                transparent: true,
                vertex: defaultVertex,
                fragment: defaultFragment,
                uniforms: {
                    tDiffuse: { value: texture },
                },
            });
        }

        super({
            geometry: Sprite.#geometry,
            program: Sprite.#program,
        });
        this.isSprite = true;

        this.texture = texture;
    }

    draw({ camera } = {}) {
        // Set camera uniforms
        if (camera) {
            // Add empty matrix uniforms to program if unset
            if (!this.program.uniforms.modelMatrix) {
                Object.assign(this.program.uniforms, {
                    modelMatrix: { value: null },
                    viewMatrix: { value: null },
                    modelViewMatrix: { value: null },
                    normalMatrix: { value: null },
                    projectionMatrix: { value: null },
                    cameraPosition: { value: null },
                });
            }

            // Set the matrix uniforms
            this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
            this.program.uniforms.cameraPosition.value = camera.worldPosition;
            this.program.uniforms.viewMatrix.value = camera.viewMatrix;
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
            this.program.uniforms.modelMatrix.value = this.worldMatrix;
            this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
            this.program.uniforms.normalMatrix.value = this.normalMatrix;
        }

        // Before render
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));

        this.program.uniforms.tDiffuse.value = this.texture;
        this.program.use();
        this.geometry.draw({ mode: this.mode, program: this.program });

        // After render
        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }

}

export { Sprite };

/******************** INTERNAL ********************/

const defaultVertex = /* glsl */ `#version 300 es
    in vec2 uv;
    in vec3 position;
    in vec3 normal;

    uniform mat3 normalMatrix;
    uniform mat4 modelMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    out vec3 vNormal;
    out vec2 vUv;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        mvPosition.xy += position.xy;
        gl_Position = projectionMatrix * mvPosition;

        // vec3 pos = position;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const defaultFragment = /* glsl */ `#version 300 es
    precision highp float;

    uniform sampler2D tDiffuse;

    in vec2 vUv;

    layout(location = 0) out highp vec4 pc_fragColor;

    void main() {

        // ----- Diffuse -----
        vec4 tex = texture(tDiffuse, vUv);

        vec3 diffuse = tex.rgb;
        float alpha = tex.a;

        // ----- Output -----
        if (alpha < 0.01) discard;
        diffuse *= alpha;

        pc_fragColor = vec4(diffuse, alpha);
    }
`;
