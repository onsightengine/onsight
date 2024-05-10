import { Keyboard } from '../../input/Keyboard.js';
import { Pointer } from '../../input/Pointer.js';

class SelectControls {

    constructor() {
        this.selection = [];
    }

    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;

        // Pointer in Camera Coordinates
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);

        // Selection
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            // Clear previous selection
            for (const object of this.selection) object.isSelected = false;
            this.selection = [];

            // New selected objects
            const selectedObjects = scene.getWorldPointIntersections(cameraPoint);
            if (selectedObjects.length > 0) {
                for (const object of selectedObjects) {
                    if (object.selectable) {
                        object.isSelected = true;
                        this.selection.push(object);
                    }
                }
            }
        }


    }

}

export { SelectControls };
