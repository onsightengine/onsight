import * as THREE from 'three';
import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';

class Sprite {

    init(data) {

        // Copy / Clear Backend
        this.dispose();

        ///// Generate Backend

        let sprite = undefined;

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

        sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: map, color: color }));

        ///// Save Data / Backend

        this.backend = sprite;
        this.data = data;
    }

    dispose() {
        const sprite = this.backend;
        if (sprite && sprite.material) sprite.material.dispose();
        this.backend = undefined;
    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    toJSON() {

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
