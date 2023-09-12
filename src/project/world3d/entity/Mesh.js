import * as THREE from 'three';
import { ComponentManager } from '../../../app/ComponentManager.js';

class Mesh {

    //
    //          NEEDS WORK!!!!
    //

    init(data = {}) {
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

}

Mesh.config = {
    icon: ``,
    color: '#F7DB63',
    multiple: true,
    group: [ 'Entity3D' ],
};

ComponentManager.register('mesh', Mesh);
