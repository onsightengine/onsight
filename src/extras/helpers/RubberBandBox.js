import { Box } from '../../core/objects/Box.js';

class RubberBandBox extends Box {

    constructor() {
        super();
        this.isHelper = true;

        this.name = 'Rubber Band Box';
        this.fillStyle.color = 'rgba(--icon, 0.5)';
        this.fillStyle.fallback = 'rgba(0, 170, 204, 0.5)';
        this.strokeStyle.color = 'rgb(--icon-light)';
        this.strokeStyle.fallback = 'rgba(101, 229, 255)';
        this.lineWidth = 1;
        this.constantWidth = true;

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;
    }

    intersected(scene) {
        const objects = [];
        const worldBox = this.getWorldBoundingBox();
        for (const object of scene.children) {
            if (object.visible && object.selectable) {
                const objectBox = object.getWorldBoundingBox();
                if (worldBox.intersectsBox(objectBox)) {
                    objects.push(object);
                }
            }
        }
        return objects;
    }

}

export { RubberBandBox };
