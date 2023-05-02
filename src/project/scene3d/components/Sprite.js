import * as THREE from 'three';
import { Object3D } from '../Object3D.js';
import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';

class Sprite {

    #material = undefined;

    init(data) {

        // Copy / Clear Backend
        this.dispose();

        // Generate Backend

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

        const lookAtCamera = new Object3D();
        lookAtCamera.lookAtCamera = true;
        this.#material = new THREE.SpriteMaterial({ map: map, color: color });
        lookAtCamera.add(new THREE.Sprite(this.#material));

        // Save Data / Backend

        this.backend = lookAtCamera;
        this.data = data;
    }

    dispose() {
        if (this.#material) {
            this.#material.dispose();
            this.#material = undefined;
        }
        this.backend = undefined;
    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    toJSON() {
        const data = this.defaultData();

        // Copy Existing 'data' Properties
        for (let key in data) {
            if (this.data[key] !== undefined) {

                // Save 'map' types (textures) as uuid only
                if (this.data[key] && this.data[key].isTexture) {
                    data[key] = this.data[key].uuid;

                // All other data
                } else {
                    data[key] = this.data[key];
                }

            }
        }

        return data;
    }

}

Sprite.config = {
    schema: {
        color: { type: 'color' },
        map: { type: 'map' },
    },
    multiple: true,
    icon: ``,
    color: '#222222',
};

ComponentManager.register('sprite', Sprite);
