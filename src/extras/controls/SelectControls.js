
import {
    MOUSE_CLICK_TIME,
    MOUSE_SLOP,
} from '../../constants.js';
import { ArrayUtils } from '../../utils/ArrayUtils.js';
import { Keyboard } from '../../core/input/Keyboard.js';
import { Pointer } from '../../core/input/Pointer.js';
import { ResizeHelper } from '../helpers/ResizeHelper.js';
import { RubberBandBox } from '../helpers/RubberBandBox.js';
import { Vector2 } from '../../math/Vector2.js';

const _cameraPoint = new Vector2();
const _center = new Vector2();
const _size = new Vector2();

class SelectControls {

    constructor() {
        this.selection = [];
        this.resizeTool = null;
        this.rubberBandBox = null;
        this.downTimer = 0;

        // INTERNAL
        this._existingSelection = [];
        this._mouseStart = new Vector2();
        this._mouseNow = new Vector2();
        this._wantsRubberBand = false;
    }

    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        let newSelection = [ ...this.selection ];

        // Pointer in Camera (World) Coordinates
        camera.inverseMatrix.applyToVector(_cameraPoint.copy(pointer.position));

        // Button Press
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            this._mouseStart.copy(_cameraPoint);
            const underMouse = scene.getWorldPointIntersections(_cameraPoint);

            // Holding Ctrl/Meta/Shift (Toggle Selection)
            if (keyboard.ctrlPressed() || keyboard.metaPressed() || keyboard.shiftPressed()) {
                const selectableOnly = ArrayUtils.filterThings(underMouse, { selectable: true });
                if (selectableOnly.length > 0) {
                    const object = selectableOnly[0];
                    if (object.isSelected) {
                        newSelection = ArrayUtils.removeThingFromArray(object, newSelection);
                    } else {
                        newSelection = ArrayUtils.combineThingArrays(newSelection, [ object ]);
                    }
                } else {
                    this._existingSelection = [ ...this.selection ];
                    this._wantsRubberBand = true;
                }

            // Single Click / Click Timer
            } else {
                this.downTimer = performance.now();
                // Clear Previous Selection
                if (underMouse.length === 0) {
                    newSelection = [];
                    this._existingSelection = [];
                    this._wantsRubberBand = true;
                // New Selected Object
                } else if (underMouse.length > 0) {
                    const object = underMouse[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        newSelection = [ object ];
                        this.downTimer = 0;
                    }
                }
            }
        }

        // Mouse Distance
        this._mouseNow.copy(_cameraPoint);

        // Rubber Band Box
        if (pointer.buttonPressed(Pointer.LEFT)) {
            const mouseTravel = this._mouseStart.manhattanDistanceTo(this._mouseNow);
            if (this._wantsRubberBand) {
                // Create Rubber Band Box?
                if (this.rubberBandBox == null) {
                    if (mouseTravel >= MOUSE_SLOP) {
                        renderer.dragObject = this.rubberBandBox;
                        const rubberBandBox = new RubberBandBox();
                        scene.traverse((child) => { rubberBandBox.layer = Math.max(rubberBandBox.layer, child.layer + 1); });
                        scene.add(rubberBandBox);
                        this.rubberBandBox = rubberBandBox;
                    }
                }
                // Update Rubber Band Box
                if (this.rubberBandBox) {
                    _center.addVectors(this._mouseStart, this._mouseNow).divideScalar(2);
                    this.rubberBandBox.position.copy(_center);
                    _size.subVectors(this._mouseStart, this._mouseNow).abs().divideScalar(2);
                    this.rubberBandBox.box.set(new Vector2(-_size.x, -_size.y), new Vector2(+_size.x, +_size.y));
                    newSelection = ArrayUtils.combineThingArrays(this.rubberBandBox.intersected(scene), this._existingSelection);
                }
            }
        }

        // Pointer Released
        if (pointer.buttonJustReleased(Pointer.LEFT)) {
            const mouseTravel = this._mouseStart.manhattanDistanceTo(this._mouseNow);
            const shortClick = performance.now() - this.downTimer < MOUSE_CLICK_TIME;
            // Stop Rubber Band
            this._wantsRubberBand = false;
            if (this.rubberBandBox) {
                this.rubberBandBox.destroy();
                this.rubberBandBox = null;
            // Select Object
            } else if (shortClick && mouseTravel <= MOUSE_SLOP) {
                const underMouse = scene.getWorldPointIntersections(_cameraPoint);
                const withoutResizeHelper = ArrayUtils.filterThings(underMouse, { isHelper: undefined });
                // Clear Previous Selection
                if (withoutResizeHelper.length === 0) {
                    newSelection = [];
                // New Selected Object
                } else if (withoutResizeHelper.length > 0) {
                    const object = withoutResizeHelper[0];
                    if (object.selectable && ArrayUtils.compareThingArrays(object, this.selection) === false) {
                        newSelection = [ object ];
                    }
                }
            }
        }

        // Selection Changed? Update Resize Tool
        if (ArrayUtils.compareThingArrays(this.selection, newSelection) === false) {
            // Mark New Selection
            scene.traverse((child) => { child.isSelected = false; });
            newSelection.forEach((object) => { object.isSelected = true; });
            // Clear Old Tool
            if (this.resizeTool) {
                this.resizeTool.objects = [];
                this.resizeTool.destroy();
                this.resizeTool = null;
            }
            // Create New Tool?
            if (newSelection.length > 0) {
                this.resizeTool = new ResizeHelper(newSelection);

                const commonAncestor = findCommonMostAncestor(newSelection);
                commonAncestor.add(this.resizeTool);

                this.resizeTool.onUpdate(renderer);
                if (this.rubberBandBox == null) {
                    renderer.dragObject = this.resizeTool;
                }
            }
            // Save Selection
            this.selection = [ ...newSelection ];
        }
    }

}

export { SelectControls };

/******************** INTERNAL ********************/

function findCommonMostAncestor(objects) {
    if (objects.length === 0) return null;
    if (objects.length === 1) return objects[0].parent;

    function getAncestors(object) {
        const ancestors = [];
        let currentObject = object;
        while (currentObject.parent) {
            ancestors.unshift(currentObject.parent);
            currentObject = currentObject.parent;
        }
        return ancestors;
    }

    const ancestors = objects.map(getAncestors);
    const minLength = Math.min(...ancestors.map(arr => arr.length));
    for (let i = 0; i < minLength; i++) {
        const ancestor = ancestors[0][i];
        for (let j = 1; j < ancestors.length; j++) {
            if (ancestors[j][i] !== ancestor) {
                return ancestor.parent;
            }
        }
    }
    return ancestors[0][minLength - 1];
}
