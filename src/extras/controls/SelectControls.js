import { ArrayUtils } from '../../utils/ArrayUtils.js';
import { Keyboard } from '../../input/Keyboard.js';
import { Pointer } from '../../input/Pointer.js';
import { ResizeTool } from '../helpers/ResizeTool.js';

class SelectControls {

    constructor() {
        this.selection = [];
        this.resizeTool = null;
    }

    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        const startSelection = [ ...this.selection ];

        // Pointer in Camera Coordinates
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);

        // Selection
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            const underMouse = scene.getWorldPointIntersections(cameraPoint);
            // Clear previous selection
            if (underMouse.length === 0) {
                scene.traverse((child) => { child.isSelected = false; });
                this.selection = [];
            // New selected objects
            } else if (underMouse.length > 0) {
                const object = underMouse[0];
                if (object.selectable) {
                    scene.traverse((child) => { child.isSelected = false; });
                    object.isSelected = true;
                    this.selection = [ object ];
                }
            }
        }

        if (ArrayUtils.compareThingArrays(startSelection, this.selection) === false) {
            if (this.resizeTool) this.resizeTool.destroy();
            if (this.selection.length > 0) {
                this.resizeTool = new ResizeTool(this.selection[0]);
                scene.add(this.resizeTool);

                console.log(this.resizeTool);

            }
        }

    }

}

export { SelectControls };
