import * as THREE from 'three';

class Renderer3D extends THREE.WebGLRenderer {

    constructor(parameters = {}) {
        super(parameters);

        // Override THREE.WebGLRenderer.render() to save render camera
        const threeRender = this.render.bind(this);
        this.render = function(scene, camera) {
            // Set 'activeCamera' for Entity3D.updateMatrix() calculations
            window.activeCamera = camera;

            // THREE.WebGLRenderer.render()
            threeRender(scene, camera);
        }

    } // end ctor

}

export { Renderer3D };
