import {
    OUTLINE_THICKNESS,
} from '../../constants.js';
import { Box } from '../../core/objects/Box.js';
import { Box2 } from '../../math/Box2.js';
import { Circle } from '../../core/objects/Circle.js';
import { ColorStyle } from '../../core/objects/style/ColorStyle.js';
import { Line } from '../../core/objects/Line.js';
import { LinearGradientStyle } from '../../core/objects/style/LinearGradientStyle.js';
import { MathUtils } from '../../utils/MathUtils.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

// svg to base64, 'cursors/rotate.svg'
const CURSOR_ROTATE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij48cGF0aCBkPSJNMjEuMjQ3LDUuODY3YzAuNDE3LC0wLjQ1MiAxLjAzNiwtMC42NjYgMS42NDcsLTAuNTYzYzAuNjQ0LDAuMTA5IDEuMTgsMC41NTMgMS40MDcsMS4xNjRsMS44MjQsNC45MDFjMC4yMjcsMC42MTEgMC4xMTEsMS4yOTggLTAuMzA1LDEuODAxYy0wLjQxNiwwLjUwMyAtMS4wNjksMC43NDUgLTEuNzEzLDAuNjM2bC01LjE1NCwtMC44NzRjLTAuNjQ0LC0wLjEwOSAtMS4xOCwtMC41NTMgLTEuNDA3LC0xLjE2NWMtMC4xNzksLTAuNDgxIC0wLjE0NSwtMS4wMDggMC4wOCwtMS40NTVjLTAuNTIxLC0wLjE0OCAtMS4wNjQsLTAuMjI1IC0xLjYxNSwtMC4yMjVjLTMuMjY0LDAgLTUuOTEzLDIuNjUgLTUuOTEzLDUuOTEzYy0wLDMuMjYzIDIuNjQ5LDUuOTEzIDUuOTEzLDUuOTEzYzEuNjQsMCAzLjIwNiwtMC42ODEgNC4zMjQsLTEuODhjMC42ODgsLTAuNzM4IDEuODQ0LC0wLjc3OCAyLjU4MiwtMC4wOWwxLjM0NiwxLjI1NWMwLjczNywwLjY4OCAwLjc3OCwxLjg0MyAwLjA5LDIuNTgxYy0yLjE1OCwyLjMxNCAtNS4xNzksMy42MjcgLTguMzQyLDMuNjI3Yy02LjI5NSwwIC0xMS40MDYsLTUuMTExIC0xMS40MDYsLTExLjQwNmMtMCwtNi4yOTUgNS4xMTEsLTExLjQwNiAxMS40MDYsLTExLjQwNmMxLjgzOCwtMCAzLjYzMSwwLjQ0MyA1LjIzNiwxLjI3M1oiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHBhdGggZD0iTTE5LjgzNSw5Ljc2N2wtMC45MDUsMS4wOTNjLTAuMDk3LDAuMTE3IC0wLjEyNCwwLjI3NyAtMC4wNzEsMC40MTljMC4wNTMsMC4xNDMgMC4xNzgsMC4yNDYgMC4zMjgsMC4yNzJsNS4xNTQsMC44NzRjMC4xNTEsMC4wMjYgMC4zMDMsLTAuMDMxIDAuNCwtMC4xNDhjMC4wOTcsLTAuMTE3IDAuMTI0LC0wLjI3NyAwLjA3MSwtMC40MmwtMS44MjMsLTQuOWMtMC4wNTMsLTAuMTQzIC0wLjE3OCwtMC4yNDYgLTAuMzI4LC0wLjI3MWMtMC4xNSwtMC4wMjYgLTAuMzAyLDAuMDMxIC0wLjM5OSwwLjE0OGwtMC42OTksMC44NDRjLTEuNjMyLC0xLjA5MSAtMy41NjIsLTEuNjgzIC01LjU1MiwtMS42ODNjLTUuNTIyLC0wIC0xMC4wMDYsNC40ODMgLTEwLjAwNiwxMC4wMDVjMCw1LjUyMiA0LjQ4NCwxMC4wMDUgMTAuMDA2LDEwLjAwNWMyLjc3NSwwIDUuNDI1LC0xLjE1MiA3LjMxNywtMy4xODFjMC4xNjEsLTAuMTcyIDAuMTUxLC0wLjQ0MiAtMC4wMjEsLTAuNjAybC0xLjM0NSwtMS4yNTVjLTAuMTcyLC0wLjE2IC0wLjQ0MiwtMC4xNTEgLTAuNjAyLDAuMDIxYy0xLjM4MywxLjQ4MyAtMy4zMjEsMi4zMjYgLTUuMzQ5LDIuMzI2Yy00LjAzNywtMCAtNy4zMTQsLTMuMjc3IC03LjMxNCwtNy4zMTRjMCwtNC4wMzcgMy4yNzcsLTcuMzE0IDcuMzE0LC03LjMxNGMxLjM2LDAgMi42ODIsMC4zNzkgMy44MjQsMS4wODFaIi8+PC9zdmc+';

let _lastRenderer = null;
const _position = new Vector2();
const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();
const _objectMatrix = new Matrix2();
const _rotateMatrix = new Matrix2();
const dragger = Object.assign(new Circle(10), { type: 'Resizer', selectable: false, focusable: false });

class ResizeHelper extends Box {

    static ALL = 0;
    static RESIZE = 1;
    static ROTATE = 2;

    constructor(objects, radius = 5, tools = ResizeHelper.ALL) {
        if (!objects) return console.error(`ResizeHelper(): Missing 'objects' argument`);
        objects = Array.isArray(objects) ? objects : [ objects ];
        if (objects.length === 0) return console.error(`ResizeHelper(): Objects array is empty`);

        super();
        this.isHelper = true;
        this.type = 'ResizeHelper';

        this.pointerEvents = true;
        this.draggable = true;
        this.focusable = true;
        this.selectable = false;
        this.lateUpdate = true;

        this.fillStyle = null;
        this.strokeStyle = null;

        // Layer
        let topLayer = 0;
        let bottomLayer = 0;
        for (const object of objects) {
            topLayer = Math.max(topLayer, object.layer + 1);
            bottomLayer = Math.max(bottomLayer, object.layer - 1);
        }
        this.layer = topLayer;

        // Background
        const background = Object.assign(new Box(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        background.isHelper = true;
        background.layer = bottomLayer;
        background.fillStyle.color = 'rgba(--icon-dark, 0.35)';
        background.fillStyle.fallback = 'rgba(0, 85, 102, 0.35)';
        background.strokeStyle.color = 'rgba(--icon-dark, 0.35)';
        background.strokeStyle.fallback = 'rgba(0, 85, 102, 0.35)';
        background.lineWidth = 2;
        background.constantWidth = true;
        background.visible = false;
        this.add(background);
        this.background = background;

        // Self
        const self = this;
        this.objects = objects;

        // Common Parent
        const commonAncestor = findCommonMostAncestor(objects);
        this.ghostParent = commonAncestor;

        // Initial Object Transforms
        const initialTransforms = {};
        for (const object of objects) {
            initialTransforms[object.uuid] = {
                position: object.position.clone(),
                scale: object.scale.clone(),
                rotation: object.rotation,
            }
        }

        // Check for Same Rotation
        let firstRotation = MathUtils.equalizeAngle0to360(objects[0].rotation, false /* degrees? */);
        let sameRotation = true;
        for (const object of objects) {
            let nextRotation = MathUtils.equalizeAngle0to360(object.rotation, false /* degrees? */);
            sameRotation = sameRotation && MathUtils.fuzzyFloat(firstRotation, nextRotation, MathUtils.degreesToRadians(1));
        }

        // World Box / Center
        const worldBox = new Box2();
        let center;

        // Shared Rotation?
        if (sameRotation || objects.length === 1) {
            this.rotation = objects[0].rotation;
            worldBox.clear();
            const rotationMatrix = new Matrix2().rotate(+this.rotation);
            const unRotateMatrix = new Matrix2().rotate(-this.rotation);
            // Unrotated World Boxes
            for (const object of objects) {
                const unRotatedPosition = unRotateMatrix.transformPoint(object.position);
                _objectMatrix.compose(unRotatedPosition.x, unRotatedPosition.y, object.scale.x, object.scale.y, 0, 0, 0);
                const box = object.boundingBox;
                _objectMatrix.applyToVector(_topLeft.copy(box.min));
                _objectMatrix.applyToVector(_topRight.copy(box.max.x, box.min.y));
                _objectMatrix.applyToVector(_botLeft.copy(box.min.x, box.max.y));
                _objectMatrix.applyToVector(_botRight.copy(box.max));
                const unrotatedBox = new Box2().setFromPoints(_topLeft, _topRight, _botLeft, _botRight);
                worldBox.union(unrotatedBox);
            }
            // True Center
            const rotatedCenter = worldBox.getCenter();
            center = rotationMatrix.transformPoint(rotatedCenter);
            // Find Initial Positions
            for (const object of objects) {
                const position = object.position.clone().sub(center);
                const initialPosition = unRotateMatrix.transformPoint(position).add(center);
                initialTransforms[object.uuid].position.copy(initialPosition);
            }
        // No Rotation
        } else {
            for (const object of objects) {
                worldBox.union(object.getWorldBoundingBox());
            }
            center = worldBox.getCenter();
        }

        // Starting Transform
        const halfSize = worldBox.getSize().multiplyScalar(0.5);
        this.position.copy(center);
        this.box.set(new Vector2(-halfSize.x, -halfSize.y), new Vector2(+halfSize.x, +halfSize.y));
        this.computeBoundingBox();
        this.updateMatrix(true);

        const startPosition = this.position.clone();
        const startRotation = this.rotation;
        const startScale = this.scale.clone();

        // Origin
        this.origin = new Vector2();
        if (objects.length === 1) {
            objects[0].globalMatrix.applyToVector(this.origin);
            this.inverseGlobalMatrix.applyToVector(this.origin);
        }

        // Resizers
        let topLeft, topRight, bottomLeft, bottomRight;
        let topResizer, rightResizer, bottomResizer, leftResizer;
        let rotater, topLine, zeroLine, rotateLine;

        // Corners / Sides
        if (tools === ResizeHelper.ALL || tools === ResizeHelper.RESIZE) {
            function createResizer(name, x, y, type = 'box', addRotation, alpha, color) {
                let resizer;
                switch (type) {
                    case 'circle':
                        resizer = new Circle();
                        resizer.radius = radius;
                        break;
                    case 'line':
                        resizer = new Line();
                        resizer.mouseBuffer = radius;
                        break;
                    case 'box':
                    default:
                        resizer = new Box();
                        resizer.box.set(new Vector2(-radius, -radius), new Vector2(radius, radius));
                }
                resizer.name = name;
                resizer.type = 'Resizer';
                resizer.draggable = true;
                resizer.focusable = false;
                resizer.selectable = false;
                resizer.mouseBuffer = 5;
                resizer.layer = topLayer + 1;
                resizer.opacity = alpha;
                resizer.constantWidth = true;
                switch (type) {
                    case 'box':
                    case 'circle':
                        if (color) {
                            resizer.fillStyle = new ColorStyle(color);
                        } else {
                            resizer.fillStyle = new LinearGradientStyle();
                            resizer.fillStyle.start.set(-radius, -radius);
                            resizer.fillStyle.end.set(radius, radius);
                            resizer.fillStyle.addColorStop(0, '--icon-light');
                            resizer.fillStyle.addColorStop(1, '--icon-dark');
                        }
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = OUTLINE_THICKNESS;
                        break;
                    case 'line':
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = OUTLINE_THICKNESS;
                        break;
                }
                resizer.cursor = function(camera) {
                    const cursorStyles = [
                        { angle:   0, cursor: 'ew-resize' },
                        { angle:  45, cursor: 'nwse-resize' },
                        { angle:  90, cursor: 'ns-resize' },
                        { angle: 135, cursor: 'nesw-resize' },
                        { angle: 180, cursor: 'ew-resize' },
                        { angle: 225, cursor: 'nwse-resize' },
                        { angle: 270, cursor: 'ns-resize' },
                        { angle: 315, cursor: 'nesw-resize' },
                        { angle: 360, cursor: 'ew-resize' },
                    ];
                    let rotation = self.rotation;
                    if (self.scale.x < 0 && self.scale.y > 0 || self.scale.x > 0 && self.scale.y < 0) {
                        rotation -= (addRotation * (Math.PI / 180));
                    } else {
                        rotation += (addRotation * (Math.PI / 180));
                    }
                    rotation = (rotation + camera.rotation) * 180 / Math.PI;
                    rotation = 360 - rotation;
                    const normalizedRotation = MathUtils.equalizeAngle0to360(rotation, true /* degrees? */);
                    let closestCursor = 'default';
                    let minAngleDiff = Infinity;
                    for (const { angle, cursor } of cursorStyles) {
                        const angleDiff = Math.abs(normalizedRotation - angle);
                        if (angleDiff < minAngleDiff) {
                            minAngleDiff = angleDiff;
                            closestCursor = cursor;
                        }
                    }
                    return closestCursor;
                };
                let startDragPosition, startDragRotation, startDragScale;
                let startBox, worldPositionStart;
                resizer['onPointerDragStart'] = function(renderer) {
                    // Starting Transform
                    startBox = self.boundingBox.clone();
                    startDragPosition = self.position.clone();
                    startDragRotation = self.rotation;
                    startDragScale = self.scale.clone();
                    // Setup Dragger
                    self.ghostParent.add(dragger);
                    dragger.type = 'Resizer';
                    dragger.resizeHelper = self;
                    dragger['onPointerDragEnd'] = function(renderer) {
                        dragger.destroy();
                    };
                    dragger['onPointerDrag'] = function(renderer) {
                        Object2D.prototype.onPointerDrag.call(this, renderer);
                        updateResizer(renderer);
                    }
                    dragger.setPosition = function(x, y) {
                        Object2D.prototype.setPosition.call(this, x, y);
                        updateResizer();
                        return dragger;
                    }
                    // Convert resizer world position to local position
                    const worldPosition = resizer.getWorldPosition();
                    const parentPosition = self.ghostParent.inverseGlobalMatrix.transformPoint(worldPosition);
                    dragger.position.copy(parentPosition);
                    // Prepare Drag
                    dragger.cursor = resizer.cursor;
                    dragger.fillStyle = null;
                    dragger.strokeStyle = null;
                    dragger.pointerStartPosition = renderer.pointer.position.clone();
                    dragger.dragStartPosition = dragger.position.clone();
                    worldPositionStart = worldPosition.clone();
                    renderer.setDragObject(dragger);
                };
                function updateResizer(renderer = _lastRenderer) {
                    if (renderer) _lastRenderer = renderer;

                    // Transform Delta
                    const localPositionStart = self.inverseGlobalMatrix.transformPoint(worldPositionStart);
                    const worldPositionEnd = dragger.getWorldPosition();
                    const localPositionEnd = self.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                    const delta = localPositionStart.clone().sub(localPositionEnd).multiply(self.scale);

                    // Calculate Scale
                    if (x === 0) delta.x = 0;
                    if (y === 0) delta.y = 0;
                    delta.multiplyScalar(0.5);
                    const size = startBox.getSize();
                    const scaleX = MathUtils.sanity((x === 0) ? 0 : 2 / size.x);
                    const scaleY = MathUtils.sanity((y === 0) ? 0 : 2 / size.y);

                    // Maintain aspect ratio when Shift key is pressed
                    if (renderer?.keyboard?.shiftPressed() && x !== 0 && y !== 0) {
                        const aspectRatio = (size.x * startDragScale.x) / (size.y * startDragScale.y);
                        if (Math.abs(aspectRatio) < Math.abs(delta.x / delta.y)) {
                            delta.y = delta.x / aspectRatio;
                            if (x !== y) delta.y *= -1;
                        } else {
                            delta.x = delta.y * aspectRatio;
                            if (x !== y) delta.x *= -1;
                        }
                    }
                    const scale = new Vector2(scaleX, scaleY);

                    // Calculate offset between center of the bounding box and origin
                    const positionOffset = new Vector2();
                    if (renderer?.keyboard?.ctrlPressed()) {
                        positionOffset.x = ((self.origin.x - startBox.min.x) / size.x) * -2;
                        positionOffset.y = ((self.origin.y - startBox.min.y) / size.y) * -2;
                        if (x > 0) positionOffset.x = -2 - positionOffset.x;
                        if (y > 0) positionOffset.y = -2 - positionOffset.y;
                        positionOffset.multiply(delta);
                    } else {
                        positionOffset.copy(startBox.getCenter());
                        positionOffset.multiply(delta).multiply(scale).multiply(x, y);
                    }

                    // Apply the rotation to the delta & position offset
                    const rotationMatrix = new Matrix2().rotate(startDragRotation);
                    const rotatedDelta = rotationMatrix.transformPoint(delta);
                    const rotatedPositionOffset = rotationMatrix.transformPoint(positionOffset);

                    // Update the tool's position
                    self.position.copy(startDragPosition).sub(rotatedDelta).sub(rotatedPositionOffset);

                    // Update the tool's scale
                    delta.multiply(x, y).multiply(scale);
                    self.scale.copy(startDragScale).add(delta);
                    self.scale.x = MathUtils.noZero(MathUtils.sanity(self.scale.x));
                    self.scale.y = MathUtils.noZero(MathUtils.sanity(self.scale.y));
                    self.updateMatrix(true);

                    // Update individual objects
                    for (const object of objects) {
                        const initialTransform = initialTransforms[object.uuid];
                        const rotatedScale = self.scale.clone();
                        let initialRotation = initialTransform.rotation - startRotation;
                        initialRotation = MathUtils.equalizeAngle0to360(initialRotation, false);

                        // Rotate Scale?
                        const fortyFive = Math.PI / 4;
                        let flip = false;
                        if      (initialRotation < fortyFive * 1) flip = false;
                        else if (initialRotation < fortyFive * 3) flip = true;
                        else if (initialRotation < fortyFive * 5) flip = false;
                        else if (initialRotation < fortyFive * 7) flip = true;
                        else flip = false;
                        if (flip) {
                            const sx = Math.sign(rotatedScale.x);
                            const sy = Math.sign(rotatedScale.y);
                            rotatedScale.x = Math.abs(self.scale.y) * sx;
                            rotatedScale.y = Math.abs(self.scale.x) * sy;
                        }
                        object.scale.copy(initialTransform.scale).multiply(rotatedScale);
                        object.scale.x = MathUtils.noZero(MathUtils.sanity(object.scale.x));
                        object.scale.y = MathUtils.noZero(MathUtils.sanity(object.scale.y));
                    }
                    updateObjects(renderer, false /* lerp */);
                }
                return resizer;
            }
            topRight = createResizer('Top Right', -1, -1, 'box', 45, 1);//, 'yellow');
            topLeft = createResizer('Top Left', 1, -1, 'box', 135, 1);//, 'blue');
            bottomLeft = createResizer('Bottom Left', 1, 1, 'box', 225, 1);//, 'green');
            bottomRight = createResizer('Bottom Right', -1, 1, 'box', 315, 1);//, 'red');
            rightResizer = createResizer('Right', -1, 0, 'line', 0, 1);
            topResizer = createResizer('Top', 0, -1, 'line', 90, 1);
            leftResizer = createResizer('Left', 1, 0, 'line', 180, 1);
            bottomResizer = createResizer('Bottom', 0, 1, 'line', 270, 1);
            this.add(bottomRight, bottomLeft, topLeft, topRight);
            this.add(rightResizer, bottomResizer, leftResizer, topResizer);
        }

        // Rotate Tool
        if (tools === ResizeHelper.ALL || tools === ResizeHelper.ROTATE) {
            // Circle
            rotater = Object.assign(new Circle(), { draggable: true, focusable: false, selectable: false });
            rotater.type = 'Rotater';
            rotater.resizeHelper = self;
            rotater.radius = radius + 1;
            rotater.mouseBuffer = 5;
            rotater.layer = topLayer + 2;
            rotater.lineWidth = OUTLINE_THICKNESS;
            rotater.constantWidth = true;
            rotater.fillStyle = new LinearGradientStyle();
            rotater.fillStyle.start.set(-radius, -radius);
            rotater.fillStyle.end.set(radius, radius);
            rotater.fillStyle.addColorStop(0, '--icon-light');
            rotater.fillStyle.addColorStop(1, '--icon-dark');
            rotater.strokeStyle.color = '--highlight';
            rotater.cursor = `url('${CURSOR_ROTATE}') 16 16, auto`;
            let rotating = false, rotaterAngle = 0, rotaterStart = 0;
            let rotationStart = new Vector2();
            let rotationOrigin = new Vector2();
            rotater['onPointerDragStart'] = function(renderer) {
                rotaterAngle = self.rotation;
                rotaterStart = self.rotation;
                rotationStart = self.globalMatrix.transformPoint(new Vector2(0, 0));
                rotationOrigin = self.globalMatrix.transformPoint(self.origin);
                rotating = true;
            };
            rotater['onPointerDragEnd'] = function(renderer) {
                rotating = false;
            };
            rotater.onPointerDrag = function(renderer) {
                Object2D.prototype.onPointerDrag.call(this, renderer);
                if (renderer) _lastRenderer = renderer;
                if (rotater.isDragging) {
                    const pointer = renderer.pointer;
                    const camera = renderer.camera;
                    const pointerStart = pointer.position.clone();
                    const pointerEnd = pointer.position.clone().sub(pointer.delta.x, pointer.delta.y * -1);
                    const worldPositionStart = renderer.screenToWorld(pointerStart);
                    const localPositionStart = self.inverseGlobalMatrix.transformPoint(worldPositionStart);
                    const worldPositionEnd = renderer.screenToWorld(pointerEnd);
                    const localPositionEnd = self.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                    localPositionStart.sub(self.origin).multiply(self.scale);
                    localPositionEnd.sub(self.origin).multiply(self.scale);
                    const angle = localPositionEnd.angleBetween(localPositionStart);
                    const cross = localPositionEnd.cross(localPositionStart);
                    const sign = Math.sign(cross);
                    rotaterAngle += (angle * sign);
                    while (rotaterAngle < Math.PI * -2) { rotaterAngle += Math.PI * 2; }
                    while (rotaterAngle > Math.PI * +2) { rotaterAngle -= Math.PI * 2; }
                    rotater.setRotation(rotaterAngle);
                }
            };
            // Override set position to update objects during snap to grid
            rotater.setRotation = function(rad) {
                Object2D.prototype.setRotation.call(this, rad);
                // Set Rotation
                self.rotation = rad;
                // Rotate Around Origin
                if (rotating) {
                    const rotateMatrix = new Matrix2().rotate(rad - rotaterStart);
                    const worldPosition = rotationStart.clone();
                    worldPosition.sub(rotationOrigin);
                    rotateMatrix.applyToVector(worldPosition);
                    worldPosition.add(rotationOrigin);
                    const parentPosition = self.ghostParent.inverseGlobalMatrix.transformPoint(worldPosition);
                    self.position.copy(parentPosition);
                }
                // Update Objects
                updateObjects(null, false /* lerp */);
                return self;
            }
            // Top Line
            topLine = Object.assign(new Line(), { draggable: false, focusable: false, selectable: false });
            topLine.layer = topLayer + 1;
            topLine.lineWidth = OUTLINE_THICKNESS;
            topLine.constantWidth = true;
            topLine.strokeStyle.color = '--highlight';
            // Zero ° Line
            zeroLine = Object.assign(new Line(), { draggable: false, focusable: false, selectable: false });
            zeroLine.layer = topLayer + 1;
            zeroLine.lineWidth = OUTLINE_THICKNESS;
            zeroLine.constantWidth = true;
            zeroLine.strokeStyle.color = '--highlight';
            // Rotate ° Line
            rotateLine = Object.assign(new Line(), { draggable: false, focusable: false, selectable: false });
            rotateLine.layer = topLayer + 1;
            rotateLine.lineWidth = OUTLINE_THICKNESS;
            rotateLine.constantWidth = true;
            rotateLine.strokeStyle.color = '--highlight';
            // Add to Rotater
            this.add(rotater, topLine, zeroLine, rotateLine);
        }

        // Overrides to update positions on Drag
        this.onPointerDrag = function(renderer) {
            Object2D.prototype.onPointerDrag.call(this, renderer);
            updateObjects(renderer, true /* lerp */);
        };
        this.onPointerDragEnd = function(renderer) {
            updateObjects(renderer, false /* lerp */);
        };

        // Override set position to update objects during snap to grid
        this.setPosition = function(x, y) {
            Object2D.prototype.setPosition.call(this, x, y);
            updateObjects(null, false /* lerp */);
            return self;
        }

        // Update object's position based on the scaled relative position
        function updateObjects(renderer = _lastRenderer, lerp = true) {
            if (!renderer && !_lastRenderer) return;
            if (renderer) _lastRenderer = renderer;
            for (const object of objects) {
                const initialPosition = initialTransforms[object.uuid].position;
                const initialRotation = initialTransforms[object.uuid].rotation;
                const initialScale = initialTransforms[object.uuid].scale;

                // Rotation
                object.rotation = initialRotation + (self.rotation - startRotation);

                // Position
                const relativePosition = initialPosition.clone().sub(startPosition);
                const scaledPosition = relativePosition.clone().multiply(self.scale);
                const rotateAngle = (object.rotation - initialRotation) + startRotation;
                const rotationMatrix = new Matrix2().rotate(rotateAngle);
                const rotatedPosition = rotationMatrix.transformPoint(scaledPosition);
                _position.copy(rotatedPosition).add(self.position);

                // Lerp?
                if (lerp && self.isDragging) {
                    object.position.smoothstep(_position, renderer.deltaTime * 30); // delta time ~ 0.0167 (1 / 60)
                } else {
                    object.position.copy(_position);
                }

                // Flipped?
                const wasSame = Math.sign(object.scale.x) === Math.sign(object.scale.y);
                const isSame =  Math.sign(initialScale.x) === Math.sign(initialScale.y);
                if (wasSame !== isSame) {
                    object.rotation -= self.rotation;
                    object.rotation *= -1;
                    object.rotation += self.rotation;
                }

                // Update Matrix
                object.traverse((child) => { child.updateMatrix(true); });
            }
            self.onUpdate(renderer);
        }

        // Update
        this.onUpdate = function(renderer) {
            if (!renderer) return;
            const camera = renderer.camera;
            const showResizers = !self.isDragging;
            const worldPosition = self.globalMatrix.getPosition();
            const worldRotation = self.globalMatrix.getRotation();
            const worldScale = self.globalMatrix.getScale();

            // Background
            if (self.background) {
                self.background.box.set(new Vector2(-halfSize.x, -halfSize.y), new Vector2(+halfSize.x, +halfSize.y));
                self.background.updateMatrix(true);
                self.background.visible = true;
            }

            // Rotate Tool
            const handleOffset = ((radius * 4) / Math.abs(worldScale.y)) / camera.scale;
            const topCenterWorld = new Vector2(0, halfSize.y);
            const topCenterWorldOffset = new Vector2(0, halfSize.y + handleOffset);
            if (rotater) {
                rotater.position.copy(topCenterWorldOffset);
                rotater.rotation = 0;
                rotater.scale.set(1 / worldScale.x, 1 / worldScale.y).divideScalar(camera.scale);
                rotater.updateMatrix(true);
                rotater.visible = showResizers;

            }
            if (topLine) {
                topLine.from.copy(topCenterWorldOffset);
                topLine.to.copy(topCenterWorld);
                topLine.updateMatrix(true);
                topLine.visible = showResizers;
            }
            if (zeroLine) {
                zeroLine.from.set(self.origin.x, self.origin.y);
                zeroLine.to.set(self.origin.x, self.origin.y + (handleOffset * 1.5));
                zeroLine.updateMatrix(true);
                zeroLine.visible = rotater.isDragging;
            }
            if (rotateLine) {
                rotateLine.from.set(self.origin.x, self.origin.y);
                rotateLine.to.set(0, radius * 4 * 1.5).add(worldPosition);
                self.inverseGlobalMatrix.applyToVector(rotateLine.to);
                rotateLine.to.divideScalar(camera.scale);
                rotateLine.to.add(self.origin);
                rotateLine.updateMatrix(true);
                rotateLine.visible = rotater.isDragging;
            }

            // Corner Resizers
            function updateResizer(resizer, x, y, type) {
                if (!resizer) return;
                resizer.position.set(x, y);
                if      (type === 'v') { resizer.from.set(0, -halfSize.y); resizer.to.set(0, +halfSize.y); }
                else if (type === 'h') { resizer.from.set(-halfSize.x, 0); resizer.to.set(+halfSize.x, 0); }
                else { resizer.scale.set((1 / worldScale.x) / camera.scale, (1 / worldScale.y) / camera.scale); }
                resizer.updateMatrix(true);
                resizer.visible = showResizers;
            }
            updateResizer(topLeft, -halfSize.x, +halfSize.y);
            updateResizer(topRight, +halfSize.x, +halfSize.y);
            updateResizer(bottomLeft, -halfSize.x, -halfSize.y);
            updateResizer(bottomRight, +halfSize.x, -halfSize.y);
            updateResizer(leftResizer, -halfSize.x, 0, 'v');
            updateResizer(rightResizer, +halfSize.x, 0, 'v');
            updateResizer(topResizer, 0, +halfSize.y, 'h');
            updateResizer(bottomResizer, 0, -halfSize.y, 'h');
        };
    }

}

export { ResizeHelper };

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
