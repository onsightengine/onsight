
import {
    MOUSE_CLICK_TIME,
    MOUSE_SLOP,
} from '../../constants.js';
import { ArrayUtils } from '../../utils/ArrayUtils.js';
import { Keyboard } from '../../core/input/Keyboard.js';
import { Pointer } from '../../core/input/Pointer.js';
import { ResizeTool } from '../helpers/ResizeTool.js';
import { RubberBandBox } from '../helpers/RubberBandBox.js';
import { Vector2 } from '../../math/Vector2.js';

const _center = new Vector2();
const _size = new Vector2();

class SelectControls {

    constructor() {
        this.selection = [];
        this.resizeTool = null;
        this.rubberBandBox = null;
        this.downTimer = 0;

        // INTERNAL
        this._wantsRubberBand = false;
        this._rubberStart = new Vector2();
        this._rubberEnd = new Vector2();
        this._existingSelection = [];
    }

    update(renderer) {
        const camera = renderer.camera;
        const scene = renderer.scene;
        const pointer = renderer.pointer;
        const keyboard = renderer.keyboard;
        if (!camera || !scene || !pointer || !keyboard) return;
        let newSelection = [ ...this.selection ];

        // Pointer in Camera (World) Coordinates
        const cameraPoint = camera.inverseMatrix.transformPoint(pointer.position);

        // Button Press
        if (pointer.buttonJustPressed(Pointer.LEFT)) {
            const underMouse = scene.getWorldPointIntersections(cameraPoint);

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
                    this._rubberStart.copy(cameraPoint);
                }

            // Single Click / Click Timer
            } else {
                this.downTimer = performance.now();
                // Clear Previous Selection
                if (underMouse.length === 0) {
                    newSelection = [];
                    this._existingSelection = [];
                    this._wantsRubberBand = true;
                    this._rubberStart.copy(cameraPoint);
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

        // Rubber Band Box
        if (pointer.buttonPressed(Pointer.LEFT)) {
            this._rubberEnd.copy(cameraPoint);
            if (this._wantsRubberBand) {
                // Create Rubber Band Box?
                if (this.rubberBandBox == null) {
                    const manhattanDistance = this._rubberStart.manhattanDistanceTo(this._rubberEnd);
                    if (manhattanDistance >= MOUSE_SLOP) {
                        renderer.beingDragged = this.rubberBandBox;
                        const rubberBandBox = new RubberBandBox();
                        scene.traverse((child) => { rubberBandBox.layer = Math.max(rubberBandBox.layer, child.layer + 1); });
                        scene.add(rubberBandBox);
                        this.rubberBandBox = rubberBandBox;
                    }
                }
                // Update Rubber Band Box
                if (this.rubberBandBox) {
                    _center.addVectors(this._rubberStart, this._rubberEnd).divideScalar(2);
                    this.rubberBandBox.position.copy(_center);
                    _size.subVectors(this._rubberStart, this._rubberEnd).abs().divideScalar(2);
                    this.rubberBandBox.box.set(new Vector2(-_size.x, -_size.y), new Vector2(+_size.x, +_size.y));
                    newSelection = ArrayUtils.combineThingArrays(this.rubberBandBox.intersected(scene), this._existingSelection);
                }
            }
        }

        // Pointer Released
        if (pointer.buttonJustReleased(Pointer.LEFT)) {
            // Stop Rubber Band
            this._wantsRubberBand = false;
            if (this.rubberBandBox) {
                this.rubberBandBox.destroy();
                this.rubberBandBox = null;
            // Select Object
            } else if (!pointer.dragging && performance.now() - this.downTimer < MOUSE_CLICK_TIME) {
                const underMouse = scene.getWorldPointIntersections(cameraPoint);
                const withoutResizeTool = ArrayUtils.filterThings(underMouse, { isHelper: undefined });
                // Clear Previous Selection
                if (withoutResizeTool.length === 0) {
                    newSelection = [];
                // New Selected Object
                } else if (withoutResizeTool.length > 0) {
                    const object = withoutResizeTool[0];
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
                this.resizeTool = new ResizeTool(newSelection);
                scene.add(this.resizeTool);
                this.resizeTool.onUpdate(renderer);
                if (this.rubberBandBox == null) {
                    renderer.beingDragged = this.resizeTool;
                }
            }
            // Save Selection
            this.selection = [ ...newSelection ];
        }
    }

}

export { SelectControls };
