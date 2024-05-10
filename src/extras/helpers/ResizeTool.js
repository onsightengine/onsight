import { Box } from '../../core/objects/Box.js';
import { Circle } from '../../core/objects/Circle.js';
import { Line } from '../../core/objects/Line.js';
import { LinearGradientStyle } from '../../core/objects/style/LinearGradientStyle.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

// svg to base64, 'cursors/rotate.svg'
const CURSOR_ROTATE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij48cGF0aCBkPSJNMjEuMjQ3LDUuODY3YzAuNDE3LC0wLjQ1MiAxLjAzNiwtMC42NjYgMS42NDcsLTAuNTYzYzAuNjQ0LDAuMTA5IDEuMTgsMC41NTMgMS40MDcsMS4xNjRsMS44MjQsNC45MDFjMC4yMjcsMC42MTEgMC4xMTEsMS4yOTggLTAuMzA1LDEuODAxYy0wLjQxNiwwLjUwMyAtMS4wNjksMC43NDUgLTEuNzEzLDAuNjM2bC01LjE1NCwtMC44NzRjLTAuNjQ0LC0wLjEwOSAtMS4xOCwtMC41NTMgLTEuNDA3LC0xLjE2NWMtMC4xNzksLTAuNDgxIC0wLjE0NSwtMS4wMDggMC4wOCwtMS40NTVjLTAuNTIxLC0wLjE0OCAtMS4wNjQsLTAuMjI1IC0xLjYxNSwtMC4yMjVjLTMuMjY0LDAgLTUuOTEzLDIuNjUgLTUuOTEzLDUuOTEzYy0wLDMuMjYzIDIuNjQ5LDUuOTEzIDUuOTEzLDUuOTEzYzEuNjQsMCAzLjIwNiwtMC42ODEgNC4zMjQsLTEuODhjMC42ODgsLTAuNzM4IDEuODQ0LC0wLjc3OCAyLjU4MiwtMC4wOWwxLjM0NiwxLjI1NWMwLjczNywwLjY4OCAwLjc3OCwxLjg0MyAwLjA5LDIuNTgxYy0yLjE1OCwyLjMxNCAtNS4xNzksMy42MjcgLTguMzQyLDMuNjI3Yy02LjI5NSwwIC0xMS40MDYsLTUuMTExIC0xMS40MDYsLTExLjQwNmMtMCwtNi4yOTUgNS4xMTEsLTExLjQwNiAxMS40MDYsLTExLjQwNmMxLjgzOCwtMCAzLjYzMSwwLjQ0MyA1LjIzNiwxLjI3M1oiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHBhdGggZD0iTTE5LjgzNSw5Ljc2N2wtMC45MDUsMS4wOTNjLTAuMDk3LDAuMTE3IC0wLjEyNCwwLjI3NyAtMC4wNzEsMC40MTljMC4wNTMsMC4xNDMgMC4xNzgsMC4yNDYgMC4zMjgsMC4yNzJsNS4xNTQsMC44NzRjMC4xNTEsMC4wMjYgMC4zMDMsLTAuMDMxIDAuNCwtMC4xNDhjMC4wOTcsLTAuMTE3IDAuMTI0LC0wLjI3NyAwLjA3MSwtMC40MmwtMS44MjMsLTQuOWMtMC4wNTMsLTAuMTQzIC0wLjE3OCwtMC4yNDYgLTAuMzI4LC0wLjI3MWMtMC4xNSwtMC4wMjYgLTAuMzAyLDAuMDMxIC0wLjM5OSwwLjE0OGwtMC42OTksMC44NDRjLTEuNjMyLC0xLjA5MSAtMy41NjIsLTEuNjgzIC01LjU1MiwtMS42ODNjLTUuNTIyLC0wIC0xMC4wMDYsNC40ODMgLTEwLjAwNiwxMC4wMDVjMCw1LjUyMiA0LjQ4NCwxMC4wMDUgMTAuMDA2LDEwLjAwNWMyLjc3NSwwIDUuNDI1LC0xLjE1MiA3LjMxNywtMy4xODFjMC4xNjEsLTAuMTcyIDAuMTUxLC0wLjQ0MiAtMC4wMjEsLTAuNjAybC0xLjM0NSwtMS4yNTVjLTAuMTcyLC0wLjE2IC0wLjQ0MiwtMC4xNTEgLTAuNjAyLDAuMDIxYy0xLjM4MywxLjQ4MyAtMy4zMjEsMi4zMjYgLTUuMzQ5LDIuMzI2Yy00LjAzNywtMCAtNy4zMTQsLTMuMjc3IC03LjMxNCwtNy4zMTRjMCwtNC4wMzcgMy4yNzcsLTcuMzE0IDcuMzE0LC03LjMxNGMxLjM2LDAgMi42ODIsMC4zNzkgMy44MjQsMS4wODFaIi8+PC9zdmc+';

class ResizeTool extends Object2D {

    static ALL = 0;
    static RESIZE = 1;
    static ROTATE = 2;

    constructor(object, radius = 5, tools = ResizeTool.ALL) {
        if (!object) return console.error(`ResizeTool(): Missing 'object' argument`);
        if (!object.boundingBox) return console.error(`ResizeTool(): Object missing 'boundingBox' property`);

        super();
        this.isHelper = true;

        this.draggable = false;
        this.focusable = false;
        this.selectable = false;
        this.pointerEvents = false;
        this.layer = object.layer + 1;

        // Transform Delta
        function localDelta(pointer, camera) {
            const pointerStart = pointer.position.clone();
            const pointerEnd = pointer.position.clone().sub(pointer.delta);
            const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
            const localPositionStart = object.inverseGlobalMatrix.transformPoint(worldPositionStart);
            const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
            const localPositionEnd = object.inverseGlobalMatrix.transformPoint(worldPositionEnd);
            const delta = localPositionStart.clone().sub(localPositionEnd).multiply(object.scale);
            return delta;
        }

        // Resizers
        let topLeft, topRight, bottomLeft, bottomRight;
        let topResizer, rightResizer, bottomResizer, leftResizer;
        let rotater, rotateLine;

        // Corners / Sides
        if (tools === ResizeTool.ALL || tools === ResizeTool.RESIZE) {
            function createResizer(x, y, type = 'box', addRotation, alpha) {
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
                resizer.draggable = true;
                resizer.focusable = false;
                resizer.selectable = false;
                resizer.layer = object.layer + 1;
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
                    let localScale =  object.globalMatrix.getScale();
                    let localRotation = object.globalMatrix.getRotation();
                    if (localScale.x < 0 && localScale.y > 0 || localScale.x > 0 && localScale.y < 0) {
                        localRotation -= (addRotation * (Math.PI / 180));
                    } else {
                        localRotation += (addRotation * (Math.PI / 180));
                    }
                    const rotation = (localRotation + camera.rotation) * 180 / Math.PI;
                    const normalizedRotation = (rotation + 720) % 360;
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
                    const delta = localDelta(pointer, camera)
                    if (x === 0) delta.x = 0;
                    if (y === 0) delta.y = 0;
                    delta.multiplyScalar(0.5);
                    const size = object.boundingBox.getSize();
                    const scaleX = MathUtils.sanity((x === 0) ? 0 : 2 / size.x);
                    const scaleY = MathUtils.sanity((y === 0) ? 0 : 2 / size.y);
                    const scale = new Vector2(scaleX, scaleY);
                    const rotationMatrix = new Matrix2().rotate(object.rotation);
                    const rotatedDelta = rotationMatrix.transformPoint(delta);
                    object.position.add(rotatedDelta);
                    object.scale.sub(delta.multiply(x, y).multiply(scale));
                    object.matrixNeedsUpdate = true;
                };
                return resizer;
            }
            bottomRight = createResizer(-1, -1, 'box', 45, 1);
            bottomLeft = createResizer(1, -1, 'box', 135, 1);
            topLeft = createResizer(1, 1, 'box', 225, 1);
            topRight = createResizer(-1, 1, 'box', 315, 1);
            rightResizer = createResizer(-1, 0, 'line', 0, 1);
            bottomResizer = createResizer(0, -1, 'line', 90, 1);
            leftResizer = createResizer(1, 0, 'line', 180, 1);
            topResizer = createResizer(0, 1, 'line', 270, 1);
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
            rotater.layer = object.layer + 1;
            rotater.constantWidth = true;
            rotater.fillStyle = new LinearGradientStyle();
            rotater.fillStyle.start.set(-radius, -radius);
            rotater.fillStyle.end.set(radius, radius);
            rotater.fillStyle.addColorStop(0, '--icon-light');
            rotater.fillStyle.addColorStop(1, '--icon-dark');
            rotater.strokeStyle.color = '--highlight';
            rotater.cursor = `url('${CURSOR_ROTATE}') 16 16, auto`;
            rotater.onPointerDrag = function(pointer, camera) {
                const objectCenter = object.boundingBox.getCenter();
                const pointerStart = pointer.position.clone();
                const pointerEnd = pointer.position.clone().sub(pointer.delta);
                const worldPositionStart = camera.inverseMatrix.transformPoint(pointerStart);
                const localPositionStart = object.inverseGlobalMatrix.transformPoint(worldPositionStart);
                const worldPositionEnd = camera.inverseMatrix.transformPoint(pointerEnd);
                const localPositionEnd = object.inverseGlobalMatrix.transformPoint(worldPositionEnd);
                localPositionStart.sub(objectCenter).multiply(object.scale);
                localPositionEnd.sub(objectCenter).multiply(object.scale);
                const angle = localPositionEnd.angleBetween(localPositionStart);
                const cross = localPositionEnd.cross(localPositionStart);
                const sign = Math.sign(cross);
                object.rotation += (angle * sign);
                object.updateMatrix(true);
            };
            // Line
            rotateLine = new Line();
            rotateLine.lineWidth = 1;
            rotateLine.draggable = false;
            rotateLine.focusable = false;
            rotateLine.selectable = false;
            rotateLine.layer = object.layer + 1;
            rotateLine.constantWidth = true;
            rotateLine.strokeStyle.color = '--highlight';
            this.add(rotater, rotateLine);
        }

        // Update
        this.onUpdate = function(context, camera) {
            const box = object.boundingBox;
            const center = box.getCenter();

            // Rotate Tool
            const handleOffset = ((radius * 4) / Math.abs(object.scale.y)) / camera.scale;
            const topCenterWorld = object.globalMatrix.transformPoint(center.x, box.min.y);
            const topCenterWorldOffset = object.globalMatrix.transformPoint(center.x, box.min.y - handleOffset);
            if (rotater) {
                rotater.position.copy(topCenterWorldOffset);
                rotater.scale.set(1 / camera.scale, 1 / camera.scale);
                rotater.updateMatrix();
            }
            if (rotateLine) {
                rotateLine.from.copy(topCenterWorldOffset);
                rotateLine.to.copy(topCenterWorld);
                rotateLine.updateMatrix();
            }

            // Corner Resizers
            const topLeftWorld = object.globalMatrix.transformPoint(box.min);
            const topRightWorld = object.globalMatrix.transformPoint(new Vector2(box.max.x, box.min.y));
            const bottomLeftWorld = object.globalMatrix.transformPoint(new Vector2(box.min.x, box.max.y));
            const bottomRightWorld = object.globalMatrix.transformPoint(box.max);
            function updateCornerResizer(resizer, point) {
                if (!resizer) return;
                resizer.position.copy(point);
                resizer.scale.set(1 / camera.scale, 1 / camera.scale);
                resizer.rotation = object.rotation;
                resizer.updateMatrix();
            }
            updateCornerResizer(topLeft, topLeftWorld);
            updateCornerResizer(topRight, topRightWorld);
            updateCornerResizer(bottomLeft, bottomLeftWorld);
            updateCornerResizer(bottomRight, bottomRightWorld);

            // Side Resizers
            const leftMiddleWorld = object.globalMatrix.transformPoint(new Vector2(box.min.x, center.y));
            const rightMiddleWorld = object.globalMatrix.transformPoint(new Vector2(box.max.x, center.y));
            const topMiddleWorld = object.globalMatrix.transformPoint(new Vector2(center.x, box.min.y));
            const bottomMiddleWorld = object.globalMatrix.transformPoint(new Vector2(center.x, box.max.y));
            const halfWidth = (object.boundingBox.getSize().x / 2) * Math.abs(object.scale.x);
            const halfHeight = (object.boundingBox.getSize().y / 2) * Math.abs(object.scale.y);
            function updateSideResizer(resizer, point, type = 'v') {
                if (!resizer) return;
                resizer.position.copy(point);
                resizer.rotation = object.rotation;
                if (resizer.type === 'Box') {
                    if (type === 'v') {
                        resizer.scale.set(1 / camera.scale, 1);
                        resizer.box.set(new Vector2(-radius, -halfHeight), new Vector2(radius, halfHeight));
                    } else {
                        resizer.scale.set(1, 1 / camera.scale);
                        resizer.box.set(new Vector2(-halfWidth, -radius), new Vector2(halfWidth, radius));
                    }
                }
                if (resizer.type === 'Line') {
                    resizer.mouseBuffer = radius / camera.scale;
                    if (type === 'v') {
                        resizer.from.set(0, -halfHeight);
                        resizer.to.set(0, +halfHeight);
                    } else {
                        resizer.from.set(-halfWidth, 0);
                        resizer.to.set(+halfWidth, 0);
                    }
                }
                resizer.updateMatrix();
            }
            updateSideResizer(leftResizer, leftMiddleWorld, 'v');
            updateSideResizer(rightResizer, rightMiddleWorld, 'v');
            updateSideResizer(topResizer, topMiddleWorld, 'h');
            updateSideResizer(bottomResizer, bottomMiddleWorld, 'h');
        }
    }

}

export { ResizeTool };
