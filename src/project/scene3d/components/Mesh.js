import * as THREE from 'three';
import { ComponentManager } from '../../ComponentManager.js';

// https://github.com/Cloud9c/taro/blob/main/src/components/Renderable.js

class Mesh {

    //
    //          NEEDS WORK!!!!
    //

    init(data) {
        // Generate Backend
        const mesh = (data.isObject3D) ? data : new THREE.Object3D();
        mesh.traverse((child) => { child.castShadow = this.entity.castShadow; });
        mesh.traverse((child) => { child.receiveShadow = this.entity.receiveShadow; });

        // Save Data / Backend
        this.backed = mesh;
        this.data = data;
    }

    dispose() {

    }

    attach() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    detach() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    three() {
        return this.backend;
    }

}

Mesh.config = {
    multiple: true,
    icon: ``,
    color: '#F7DB63',
};

ComponentManager.register('mesh', Mesh);
