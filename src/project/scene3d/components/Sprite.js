import * as THREE from 'three';
import { Object3D } from '../Object3D.js';
import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';

class Sprite {

    #material = undefined;

    init(data) {
        // Make sure texture is in AssetManager
        let map = null, color = 0xffffff;
        if (data) {
            color = data['color'];
            map = data['map'];
            if (map && map.isTexture) {
                AssetManager.addAsset(map);
            } else {
                const textureCheck = AssetManager.getAsset(map);
                map = (textureCheck && textureCheck.isTexture) ? textureCheck : null;
            }
        }

        // Generate Backend
        const lookAtCamera = new Object3D();
        lookAtCamera.lookAtCamera = true;
        this.#material = new THREE.SpriteMaterial({ map: map, color: color });
        lookAtCamera.add(new THREE.Sprite(this.#material));

        // Save Data / Backend
        this.backend = lookAtCamera;
        this.data = data;
    }

    dispose() {
        if (this.#material && typeof this.#material.dispose === 'function') this.#material.dispose();
        this.#material = undefined;
    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

}

Sprite.config = {
    schema: {
        color: { type: 'color' },
        map: { type: 'asset', class: 'texture' },
    },
    multiple: true,
    icon: ``,
    color: '#222222',
};

ComponentManager.register('sprite', Sprite);
