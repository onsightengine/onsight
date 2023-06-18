import * as THREE from 'three';
import { ComponentManager } from '../../ComponentManager.js';

// https://github.com/Cloud9c/taro/blob/main/src/components/Renderable.js

class Mesh {

    //
    //          NEEDS WORK!!!!
    //

    init(data) {

        // Save Data / Backend
        this.backend = (data.isObject3D) ? data : new THREE.Object3D();
        this.backend.traverse((child) => { child.castShadow = this.entity.castShadow; });
        this.backend.traverse((child) => { child.receiveShadow = this.entity.receiveShadow; });
        this.data = data;
    }

    dispose() {

    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

}

Mesh.config = {
    multiple: true,
    icon: ``,
    color: '#F7DB63',
};

ComponentManager.register('mesh', Mesh);
