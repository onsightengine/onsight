import { Box } from '../../core/objects/Box.js';
import { Box2 } from '../../math/Box2.js';
import { Circle } from '../../core/objects/Circle.js';
import { Line } from '../../core/objects/Line.js';
import { LinearGradientStyle } from '../../core/objects/style/LinearGradientStyle.js';
import { MathUtils } from '../../utils/MathUtils.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

// svg to base64, 'cursors/rotate.svg'
const CURSOR_ROTATE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij48cGF0aCBkPSJNMjEuMjQ3LDUuODY3YzAuNDE3LC0wLjQ1MiAxLjAzNiwtMC42NjYgMS42NDcsLTAuNTYzYzAuNjQ0LDAuMTA5IDEuMTgsMC41NTMgMS40MDcsMS4xNjRsMS44MjQsNC45MDFjMC4yMjcsMC42MTEgMC4xMTEsMS4yOTggLTAuMzA1LDEuODAxYy0wLjQxNiwwLjUwMyAtMS4wNjksMC43NDUgLTEuNzEzLDAuNjM2bC01LjE1NCwtMC44NzRjLTAuNjQ0LC0wLjEwOSAtMS4xOCwtMC41NTMgLTEuNDA3LC0xLjE2NWMtMC4xNzksLTAuNDgxIC0wLjE0NSwtMS4wMDggMC4wOCwtMS40NTVjLTAuNTIxLC0wLjE0OCAtMS4wNjQsLTAuMjI1IC0xLjYxNSwtMC4yMjVjLTMuMjY0LDAgLTUuOTEzLDIuNjUgLTUuOTEzLDUuOTEzYy0wLDMuMjYzIDIuNjQ5LDUuOTEzIDUuOTEzLDUuOTEzYzEuNjQsMCAzLjIwNiwtMC42ODEgNC4zMjQsLTEuODhjMC42ODgsLTAuNzM4IDEuODQ0LC0wLjc3OCAyLjU4MiwtMC4wOWwxLjM0NiwxLjI1NWMwLjczNywwLjY4OCAwLjc3OCwxLjg0MyAwLjA5LDIuNTgxYy0yLjE1OCwyLjMxNCAtNS4xNzksMy42MjcgLTguMzQyLDMuNjI3Yy02LjI5NSwwIC0xMS40MDYsLTUuMTExIC0xMS40MDYsLTExLjQwNmMtMCwtNi4yOTUgNS4xMTEsLTExLjQwNiAxMS40MDYsLTExLjQwNmMxLjgzOCwtMCAzLjYzMSwwLjQ0MyA1LjIzNiwxLjI3M1oiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHBhdGggZD0iTTE5LjgzNSw5Ljc2N2wtMC45MDUsMS4wOTNjLTAuMDk3LDAuMTE3IC0wLjEyNCwwLjI3NyAtMC4wNzEsMC40MTljMC4wNTMsMC4xNDMgMC4xNzgsMC4yNDYgMC4zMjgsMC4yNzJsNS4xNTQsMC44NzRjMC4xNTEsMC4wMjYgMC4zMDMsLTAuMDMxIDAuNCwtMC4xNDhjMC4wOTcsLTAuMTE3IDAuMTI0LC0wLjI3NyAwLjA3MSwtMC40MmwtMS44MjMsLTQuOWMtMC4wNTMsLTAuMTQzIC0wLjE3OCwtMC4yNDYgLTAuMzI4LC0wLjI3MWMtMC4xNSwtMC4wMjYgLTAuMzAyLDAuMDMxIC0wLjM5OSwwLjE0OGwtMC42OTksMC44NDRjLTEuNjMyLC0xLjA5MSAtMy41NjIsLTEuNjgzIC01LjU1MiwtMS42ODNjLTUuNTIyLC0wIC0xMC4wMDYsNC40ODMgLTEwLjAwNiwxMC4wMDVjMCw1LjUyMiA0LjQ4NCwxMC4wMDUgMTAuMDA2LDEwLjAwNWMyLjc3NSwwIDUuNDI1LC0xLjE1MiA3LjMxNywtMy4xODFjMC4xNjEsLTAuMTcyIDAuMTUxLC0wLjQ0MiAtMC4wMjEsLTAuNjAybC0xLjM0NSwtMS4yNTVjLTAuMTcyLC0wLjE2IC0wLjQ0MiwtMC4xNTEgLTAuNjAyLDAuMDIxYy0xLjM4MywxLjQ4MyAtMy4zMjEsMi4zMjYgLTUuMzQ5LDIuMzI2Yy00LjAzNywtMCAtNy4zMTQsLTMuMjc3IC03LjMxNCwtNy4zMTRjMCwtNC4wMzcgMy4yNzcsLTcuMzE0IDcuMzE0LC03LjMxNGMxLjM2LDAgMi42ODIsMC4zNzkgMy44MjQsMS4wODFaIi8+PC9zdmc+';

class ResizeTool extends Box {

    static ALL = 0;
    static RESIZE = 1;
    static ROTATE = 2;

    constructor(objects, radius = 5, tools = ResizeTool.ALL) {
        if (!objects) return console.error(`ResizeTool(): Missing 'objects' argument`);
        objects = Array.isArray(objects) ? objects : [ objects ];
        if (objects.length === 0) return console.error(`ResizeTool(): Objects array is empty`);

        super();
        this.isHelper = true;

        this.name = 'Resize Tool';
        this.fillStyle = null;
        this.strokeStyle = null;

        this.pointerEvents = true;
        this.draggable = true;
        this.focusable = true;
        this.selectable = false;

        // Layer
        let topLayer = 0;
        let bottomLayer = 0;
        for (const object of objects) {
            topLayer = Math.max(topLayer, object.layer + 1);
            bottomLayer = Math.max(bottomLayer, object.layer - 1);
        }
        this.layer = topLayer;

        // // Background
        // const bgBox = new Box();
        // bgBox.isHelper = true;
        // bgBox.pointerEvents = false;
        // bgBox.draggable = false;
        // bgBox.focusable = false;
        // bgBox.selectable = false;
        // bgBox.layer = bottomLayer;
        // bgBox.fillStyle.color = 'rgba(--icon-dark, 0.35)';
        // bgBox.fillStyle.fallback = 'rgba(0, 85, 102, 0.35)';
        // this.add(bgBox);
        // this.bgBox = bgBox;

        // Initial Object Transforms
        const self = this;
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
            const rotationMatrix = new Matrix2().rotate(this.rotation);
            const unRotateMatrix = new Matrix2().rotate(-this.rotation);
            for (const object of objects) {
                const box = object.boundingBox.clone();
                box.multiply(object.scale.clone().abs());
                box.translate(object.origin.clone().multiplyScalar(-1));
                box.translate(unRotateMatrix.transformPoint(object.position));
                worldBox.union(box);
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

        const startPosition = this.position.clone();
        const startRotation = this.rotation;
        const startScale = this.scale.clone();

        // Resizers
        let topLeft, topRight, bottomLeft, bottomRight;
        let topResizer, rightResizer, bottomResizer, leftResizer;
        let rotater, rotateLine;

        // Corners / Sides
        if (tools === ResizeTool.ALL || tools === ResizeTool.RESIZE) {
            function createResizer(name, x, y, type = 'box', addRotation, alpha) {
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
                resizer.draggable = true;
                resizer.focusable = false;
                resizer.selectable = false;
                resizer.layer = topLayer + 1;
                resizer.opacity = alpha;
                resizer.constantWidth = true;
                switch (type) {
                    case 'box':
                    case 'circle':
                        resizer.fillStyle = new LinearGradientStyle();
                        resizer.fillStyle.start.set(-radius, -radius);
                        resizer.fillStyle.end.set(radius, radius);
                        resizer.fillStyle.addColorStop(0, '--icon-light');
                        resizer.fillStyle.addColorStop(1, '--icon-dark');
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = 1;
                        break;
                    case 'line':
                        resizer.strokeStyle.color = '--highlight';
                        resizer.lineWidth = 1;
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
                resizer.onPointerDrag = function(pointer, camera) {
                    Object2D.prototype.onPointerDrag.call(this, pointer, camera);
                    // Transform Delta
                    const pointerStart = pointer.position.clone();
                    const pointerEnd = pointer.position.clone().sub(pointer.delta);
                    const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
                    const localPositionStart = self.inverseGlobalMatrix.transformPoint(worldPositionStart);
                    const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
                    const localPositionEnd = self.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                    const delta = localPositionStart.clone().sub(localPositionEnd).multiply(self.scale);

                    // Scale by Delta
                    if (x === 0) delta.x = 0;
                    if (y === 0) delta.y = 0;
                    delta.multiplyScalar(0.5);
                    const size = self.boundingBox.getSize();
                    const scaleX = MathUtils.sanity((x === 0) ? 0 : 2 / size.x);
                    const scaleY = MathUtils.sanity((y === 0) ? 0 : 2 / size.y);
                    const scale = new Vector2(scaleX, scaleY);

                    // Calculate offset between tool's true center and the center of the bounding box
                    const boundingBoxCenter = self.boundingBox.getCenter();
                    const positionOffset = boundingBoxCenter.clone();
                    positionOffset.multiply(delta).multiply(scale).multiply(x, y);

                    // Apply the rotation to the delta & position offset
                    const rotationMatrix = new Matrix2().rotate(self.rotation);
                    const rotatedDelta = rotationMatrix.transformPoint(delta);
                    const rotatedPositionOffset = rotationMatrix.transformPoint(positionOffset);

                    // Update the tool's position
                    self.position.add(rotatedDelta).add(rotatedPositionOffset);

                    // Update the tool's scale
                    delta.multiply(x, y).multiply(scale);
                    self.scale.sub(delta);
                    self.scale.x = MathUtils.noZero(MathUtils.sanity(self.scale.x));
                    self.scale.y = MathUtils.noZero(MathUtils.sanity(self.scale.y));
                    self.matrixNeedsUpdate = true;

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
                            rotatedScale.x = self.scale.y;
                            rotatedScale.y = self.scale.x;
                        }
                        object.scale.copy(initialTransform.scale).multiply(rotatedScale);
                        object.scale.x = MathUtils.noZero(MathUtils.sanity(object.scale.x));
                        object.scale.y = MathUtils.noZero(MathUtils.sanity(object.scale.y));
                    }
                    updateObjects();
                };
                return resizer;
            }
            bottomRight = createResizer('Bottom Right', -1, -1, 'box', 45, 1);
            bottomLeft = createResizer('Bottom Left', 1, -1, 'box', 135, 1);
            topLeft = createResizer('Top Left', 1, 1, 'box', 225, 1);
            topRight = createResizer('Top Right', -1, 1, 'box', 315, 1);
            rightResizer = createResizer('Right', -1, 0, 'line', 0, 1);
            bottomResizer = createResizer('Bottom', 0, -1, 'line', 90, 1);
            leftResizer = createResizer('Left', 1, 0, 'line', 180, 1);
            topResizer = createResizer('Top', 0, 1, 'line', 270, 1);
            this.add(bottomRight, bottomLeft, topLeft, topRight);
            this.add(rightResizer, bottomResizer, leftResizer, topResizer);
        }

        // Rotate Tool
        if (tools === ResizeTool.ALL || tools === ResizeTool.ROTATE) {
            // Circle
            rotater = new Circle();
            rotater.draggable = true;
            rotater.focusable = false;
            rotater.selectable = false;
            rotater.radius = radius + 1;
            rotater.buffer = 3;
            rotater.layer = topLayer + 2;
            rotater.constantWidth = true;
            rotater.fillStyle = new LinearGradientStyle();
            rotater.fillStyle.start.set(-radius, -radius);
            rotater.fillStyle.end.set(radius, radius);
            rotater.fillStyle.addColorStop(0, '--icon-light');
            rotater.fillStyle.addColorStop(1, '--icon-dark');
            rotater.strokeStyle.color = '--highlight';
            rotater.cursor = `url('${CURSOR_ROTATE}') 16 16, auto`;
            rotater.onPointerDrag = function(pointer, camera) {
                const pointerStart = pointer.position.clone();
                const pointerEnd = pointer.position.clone().sub(pointer.delta);
                const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
                const localPositionStart = self.inverseGlobalMatrix.transformPoint(worldPositionStart);
                const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
                const localPositionEnd = self.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                localPositionStart.sub(self.origin).multiply(self.scale);
                localPositionEnd.sub(self.origin).multiply(self.scale);
                const angle = localPositionEnd.angleBetween(localPositionStart);
                const cross = localPositionEnd.cross(localPositionStart);
                const sign = Math.sign(cross);
                self.rotation += (angle * sign);
                self.updateMatrix(true);
                updateObjects();
            };
            // Line
            rotateLine = new Line();
            rotateLine.lineWidth = 1;
            rotateLine.draggable = false;
            rotateLine.focusable = false;
            rotateLine.selectable = false;
            rotateLine.layer = topLayer + 1;
            rotateLine.constantWidth = true;
            rotateLine.strokeStyle.color = '--highlight';
            this.add(rotater, rotateLine);
        }

        // Update positions on Drag
        this.onPointerDrag = function(pointer, camera) {
            Object2D.prototype.onPointerDrag.call(this, pointer, camera);
            updateObjects();
        };

        // Update object's position based on the scaled relative position
        function updateObjects() {
            for (const object of objects) {
                const initialPosition = initialTransforms[object.uuid].position;
                const initialRotation = initialTransforms[object.uuid].rotation;
                const initialScale = initialTransforms[object.uuid].scale;
                const initialOrigin = object.origin;

                // Rotation
                object.rotation = initialRotation + (self.rotation - startRotation);

                // Position
                const relativePosition = initialPosition.clone().sub(startPosition);
                const scaledPosition = relativePosition.clone().multiply(self.scale).add(initialOrigin);
                const rotateAngle = (object.rotation - initialRotation) + startRotation;
                const rotationMatrix = new Matrix2().rotate(rotateAngle);
                const rotatedPosition = rotationMatrix.transformPoint(scaledPosition);
                object.position.copy(rotatedPosition).add(self.position);

                // Origin
                const scaledOrigin = initialOrigin.clone().multiply(object.scale);
                const rotatedOrigin = rotationMatrix.transformPoint(scaledOrigin);
                object.position.sub(rotatedOrigin);

                // Flipped?
                const wasSame = Math.sign(object.scale.x) === Math.sign(object.scale.y);
                const isSame =  Math.sign(initialScale.x) === Math.sign(initialScale.y);
                if (wasSame !== isSame) {
                    object.rotation -= self.rotation;
                    object.rotation *= -1;
                    object.rotation += self.rotation;
                }

                // Needs Update
                object.matrixNeedsUpdate = true;
            }
        }

        // Update
        this.onUpdate = function(renderer) {
            const camera = renderer.camera;

            // Background
            if (self.bgBox) {
                self.bgBox.box.set(new Vector2(-halfSize.x, -halfSize.y), new Vector2(+halfSize.x, +halfSize.y));
            }

            // Rotate Tool
            const handleOffset = ((radius * 4) / Math.abs(self.scale.y)) / camera.scale;
            const topCenterWorld = new Vector2(0, -halfSize.y);
            const topCenterWorldOffset = new Vector2(0, -halfSize.y - handleOffset);
            if (rotater) {
                rotater.position.copy(topCenterWorldOffset);
                rotater.scale.set((1 / self.scale.x) / camera.scale, (1 / self.scale.y) / camera.scale);
                rotater.updateMatrix();
            }
            if (rotateLine) {
                rotateLine.from.copy(topCenterWorldOffset);
                rotateLine.to.copy(topCenterWorld);
                rotateLine.updateMatrix();
            }

            // Corner Resizers
            const topLeftWorld = new Vector2(-halfSize.x, -halfSize.y);
            const topRightWorld = new Vector2(+halfSize.x, -halfSize.y);
            const bottomLeftWorld = new Vector2(-halfSize.x, +halfSize.y);
            const bottomRightWorld = new Vector2(+halfSize.x, +halfSize.y);
            function updateCornerResizer(resizer, point) {
                if (!resizer) return;
                resizer.position.copy(point);
                resizer.scale.set((1 / self.scale.x) / camera.scale, (1 / self.scale.y) / camera.scale);
                resizer.updateMatrix();
            }
            updateCornerResizer(topLeft, topLeftWorld);
            updateCornerResizer(topRight, topRightWorld);
            updateCornerResizer(bottomLeft, bottomLeftWorld);
            updateCornerResizer(bottomRight, bottomRightWorld);

            // Side Resizers
            const leftMiddleWorld = new Vector2(-halfSize.x, 0);
            const rightMiddleWorld = new Vector2(+halfSize.x, 0);
            const topMiddleWorld = new Vector2(0, -halfSize.y);
            const bottomMiddleWorld = new Vector2(0, +halfSize.y);
            function updateSideResizer(resizer, point, type = 'v') {
                if (!resizer) return;
                resizer.position.copy(point);
                if (resizer.type === 'Box') {
                    if (type === 'v') {
                        resizer.scale.set((1 / self.scale.x) / camera.scale, 1);
                        resizer.box.set(new Vector2(-radius, -halfSize.y), new Vector2(radius, +halfSize.y));
                    } else {
                        resizer.scale.set(1, (1 / self.scale.y) / camera.scale);
                        resizer.box.set(new Vector2(-halfSize.x, -radius), new Vector2(+halfSize.x, radius));
                    }
                }
                if (resizer.type === 'Line') {
                    if (type === 'v') {
                        resizer.from.set(0, -halfSize.y);
                        resizer.to.set(0, +halfSize.y);
                    } else {
                        resizer.from.set(-halfSize.x, 0);
                        resizer.to.set(+halfSize.x, 0);
                    }
                }
                resizer.updateMatrix();
            }
            updateSideResizer(leftResizer, leftMiddleWorld, 'v');
            updateSideResizer(rightResizer, rightMiddleWorld, 'v');
            updateSideResizer(topResizer, topMiddleWorld, 'h');
            updateSideResizer(bottomResizer, bottomMiddleWorld, 'h');
        };
    }

}

export { ResizeTool };
