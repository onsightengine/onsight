import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';
import { Box } from '../../objects/Box.js';

class BoxComponent {

    #material = undefined;

    init(data = {}) {
        // Make sure texture is in AssetManager
        let map = null, color = 0xffffff;
        if (data) {
            if (color in data) color = data['color'];
            if (map in data) map = data['map'];
            if (map && map.isTexture) {
                AssetManager.add(map);
            } else {
                const textureCheck = AssetManager.get(map);
                map = (textureCheck && textureCheck.isTexture) ? textureCheck : null;
            }
        }

        // Generate Backend
        const box = new Box();
        box.pointerEvents = false;
        box.draggable = false;
        box.focusable = false;
        box.selectable = false;

        // Save Backend / Data
        this.backend = box;
        this.data = data;
    }

    dispose() {
        if (this.#material && typeof this.#material.dispose === 'function') this.#material.dispose();
        this.#material = undefined;
    }

    attach() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    detach() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

}

BoxComponent.config = {
    schema: {
        color: { type: 'color' },
        map: { type: 'asset', class: 'texture' },
    },
    icon: ``,
    color: '#222222',
    multiple: true,
    group: [ 'Entity' ],
};

ComponentManager.register('box', BoxComponent);
