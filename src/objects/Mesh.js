import { Transform } from './Transform.js';
import { Mat3 } from '../math/Mat3.js';
import { Mat4 } from '../math/Mat4.js';

class Mesh extends Transform {

    constructor({
        geometry,
        program,
        mode = renderer.gl.TRIANGLES,
        frustumCulled = true,
        renderOrder = 0
    } = {}) {
        if (!renderer) console.error(`Mesh: Renderer not found`);

        super();
        this.isMesh = true;

        this.geometry = geometry;
        this.program = program;
        this.mode = mode;

        // Used to skip frustum culling
        this.frustumCulled = frustumCulled;

        // Override sorting to force an order
        this.renderOrder = renderOrder;
        this.modelViewMatrix = new Mat4();
        this.normalMatrix = new Mat3();
        this.beforeRenderCallbacks = [];
        this.afterRenderCallbacks = [];
    }

    onBeforeRender(f) {
        this.beforeRenderCallbacks.push(f);
        return this;
    }

    onAfterRender(f) {
        this.afterRenderCallbacks.push(f);
        return this;
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

        // Determine if faces need to be flipped (when mesh scaled negatively)
        const flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;

        // Set program and render
        this.program.use({ flipFaces });
        this.geometry.draw({ mode: this.mode, program: this.program });

        // After render
        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }
}

export { Mesh };
