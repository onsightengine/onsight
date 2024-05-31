import { Box2 } from '../../math/Box2.js';
import { MathUtils } from '../../utils/MathUtils.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

const NEAREST_ANGLE = 5;
const SIZE_OF_CROSS = 15;

const _bounds = new Box2();
const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();

const _matrix = new Matrix2();
const _inverse = new Matrix2();
const _translate = new Matrix2();
const _rotate = new Matrix2();
const _scale = new Matrix2();

class GridHelper extends Object2D {

    #gridX = 50;
    #gridY = 50;

    constructor(gridSizeX = 50, gridSizeY = gridSizeX) {
        super();
        const self = this;
        this.isHelper = true;
        this.type = 'GridHelper';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.gridX = gridSizeX;
        this.gridY = gridSizeY;
        this.snap = true;
        this.onTop = false;

        // Grid Center Cross
        const cross = Object.assign(new Object2D(), { pointerEvents: false, draggable: false, focusable: false, selectable: false });
        cross.layer = +Infinity;
        cross.visible = false;
        cross.draw = function (renderer) {
            const context = renderer.context;
            // Transform Order: Rotation, Scale, Position to allow Skew
            const worldPosition = cross.getWorldPosition();
            renderer.camera.matrix.setContextTransform(context);
            new Matrix2().translate(worldPosition.x, worldPosition.y).tranformContext(context);
            new Matrix2().scale(self.scale.x, self.scale.y).tranformContext(context);
            new Matrix2().rotate(self.rotation).tranformContext(context);
            // Swap X/Y Scale due to Rotation
            function degreesToYAxisAlignment(degrees) {
                const normalizedDegrees = ((degrees + 180) % 360 + 360) % 360 - 180;
                const absoluteDegrees = Math.abs(normalizedDegrees);
                return absoluteDegrees / 90;
            }
            const lerp = degreesToYAxisAlignment(MathUtils.radiansToDegrees(self.rotation))
            const scale = self.scale.clone();
            scale.x = ((1 - lerp) * self.scale.x) + (lerp * self.scale.y);
            scale.y = ((1 - lerp) * self.scale.y) + (lerp * self.scale.x);
            const sizeX = (SIZE_OF_CROSS / renderer.camera.scale) / scale.x;
            const sizeY = (SIZE_OF_CROSS / renderer.camera.scale) / scale.y;
            // Stroke
            context.beginPath();
            context.moveTo(-sizeX, 0); context.lineTo(+sizeX, 0);
            context.moveTo(0, -sizeY); context.lineTo(0, +sizeY);
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.strokeStyle = '#ffffff'; context.lineWidth = 5; context.lineCap = 'round'; context.stroke();
            context.strokeStyle = '#000000'; context.lineWidth = 2; context.lineCap = 'butt'; context.stroke();
            context.restore();
        };
        this.cross = cross;
        this.add(cross);

        // INTERNAL
        this.cache = null;
        this.gridScale = 1;
        this.patternCanvas = document.createElement('canvas');
        this.patternContext = this.patternCanvas.getContext('2d');
        this.drawPattern();
    }

    get gridX() { return this.#gridX; }
    set gridX(size) {
        if (!isFinite(size) || size < 1) size = 1;
        this.#gridX = size;
        this.cache = null;
    }

    get gridY() { return this.#gridY; }
    set gridY(size) {
        if (!isFinite(size) || size < 1) size = 1;
        this.#gridY = size;
        this.cache = null;
    }

    alignToGrid(object) {
        if (!object.parent) return;

        // Matrix to transform the object's position to the grid space
        const worldPosition = object.getWorldPosition()
        const inverseMatrix = new Matrix2()
            .translate(-this.position.x, -this.position.y)
            .rotate(-this.rotation)
            .scale(1 / this.scale.x, 1 / this.scale.y);
        const gridPosition = inverseMatrix.transformPoint(worldPosition);

        // Calculate the closest grid intersection
        const closestX = Math.round(gridPosition.x / this.gridX) * this.gridX;
        const closestY = Math.round(gridPosition.y / this.gridY) * this.gridY;

        // Transform the closest grid intersection back to world space
        const transformMatrix = new Matrix2()
            .scale(this.scale.x, this.scale.y)
            .rotate(this.rotation)
            .translate(this.position.x, this.position.y);
        const closestWorldPosition = transformMatrix.transformPoint(new Vector2(closestX, closestY));

        // Set the object's position to the closest grid intersection in it's local parent space
        const localPosition = object.parent.inverseGlobalMatrix.transformPoint(closestWorldPosition);
        object.setPosition(localPosition.x, localPosition.y);
    }

    alignToRotation(object) {
        const angle = this.rotation;
        const scaleX = this.scale.x;
        const scaleY = this.scale.y;
        const horizontalAngle = MathUtils.radiansToDegrees(Math.atan((scaleY * Math.tan(angle)) / scaleX));
        const verticalAngle = MathUtils.radiansToDegrees((Math.PI / 2) - Math.atan((scaleY / scaleX) * (1 / Math.tan(angle))));
        const alignedAngle = roundToNearestWithTwoRotations(MathUtils.radiansToDegrees(object.rotation), NEAREST_ANGLE, horizontalAngle, verticalAngle);
        object.setRotation(MathUtils.degreesToRadians(alignedAngle));
    }

    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;
        context.save();

        // Camera Matrix + Scale + Rotation
        _matrix.copy(camera.matrix);
        _matrix.multiply(_scale.identity().scale(this.scale.x, this.scale.y));
        _matrix.multiply(_rotate.identity().rotate(this.rotation));
        _matrix.getInverse(_inverse);
        _matrix.setContextTransform(context);

        // Viewport Coordinates
        _inverse.applyToVector(_topLeft.set(0, 0));
        _inverse.applyToVector(_topRight.set(renderer.width, 0));
        _inverse.applyToVector(_botLeft.set(0, renderer.height));
        _inverse.applyToVector(_botRight.set(renderer.width, renderer.height));
        _bounds.setFromPoints(_topLeft, _topRight, _botLeft, _botRight);
        const visibleWidth = _bounds.getSize().x;
        const visibleHeight = _bounds.getSize().y;

        // Calculate the number of grid cells needed to cover the visible area
        const gridCountX = Math.ceil(visibleWidth / this.gridX) + 1;
        const gridCountY = Math.ceil(visibleHeight / this.gridY) + 1;

        // Calculate the starting position of the grid in world coordinates
        const startX = Math.floor(_bounds.min.x / this.gridX) * this.gridX;
        const startY = Math.floor(_bounds.min.y / this.gridY) * this.gridY;

        // Draw Pattern
        if (camera.scale <= 1.5) {
            if (this.gridScale !== camera.scale || !this.cache) this.drawPattern(camera.scale);
            if (!this.cache) this.cache = context.createPattern(this.patternCanvas, 'repeat');
            context.fillStyle = this.cache;
            context.fillRect(startX, startY, gridCountX * this.gridX, gridCountY * this.gridY);
        // Draw Lines
        } else {
            context.beginPath();
            for (let i = 0; i <= gridCountX; i++) {
                const x = startX + i * this.gridX;
                context.moveTo(x, _bounds.min.y);
                context.lineTo(x, _bounds.max.y);
            }
            for (let j = 0; j <= gridCountY; j++) {
                const y = startY + j * this.gridY;
                context.moveTo(_bounds.min.x, y);
                context.lineTo(_bounds.max.x, y);
            }
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.strokeStyle = `rgba(128, 128, 128, 1)`;
            context.lineWidth = 1;
            context.stroke();
        }
        context.restore();
    }

    drawPattern(scale = 1) {
        this.cache = null;
        this.gridScale = scale;
        const context = this.patternContext;
        this.patternCanvas.width = this.gridX;
        this.patternCanvas.height = this.gridY;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
        context.translate(this.gridX / 2, this.gridY / 2);
        context.strokeStyle = `rgba(128, 128, 128, ${Math.min(1, scale)})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(this.gridX / 2, -this.gridY);
        context.lineTo(this.gridX / 2, +this.gridY);
        context.moveTo(-this.gridX, this.gridY / 2);
        context.lineTo(+this.gridX, this.gridY / 2);
        context.stroke();
    }

    onUpdate(renderer) {
        this.layer = (this.onTop) ? +Infinity : -Infinity;
        this.level = -1;
        const object = renderer.dragObject;
        if (object && object.isDragging) {
            // Align Rotation
            if (object.type === 'Rotater') {
                if (renderer.keyboard.modifierPressed() !== this.snap) {
                    this.alignToRotation(object);
                }
            // Align Position
            } else {
                if (this.snap) {
                    if (object.type === 'ResizeHelper') {
                        this.cross.position.copy(object.globalMatrix.getPosition());
                        this.inverseGlobalMatrix.applyToVector(this.cross.position);
                        this.cross.updateMatrix(true);
                        this.cross.level = -1;
                        this.cross.visible = true;
                    }
                    this.alignToGrid(object);
                }
            }
        } else {
            this.cross.visible = false;
        }
    }

}

export { GridHelper };

/******************** INTERNAL ********************/

function roundToNearestWithTwoRotations(angle, nearest, startRotation1, startRotation2) {
    const relativeAngle1 = angle - startRotation1;
    const roundedRelativeAngle1 = Math.round(relativeAngle1 / nearest) * nearest;
    const roundedAngle1 = startRotation1 + roundedRelativeAngle1;

    const relativeAngle2 = angle - startRotation2;
    const roundedRelativeAngle2 = Math.round(relativeAngle2 / nearest) * nearest;
    const roundedAngle2 = startRotation2 + roundedRelativeAngle2;

    const diff1 = Math.abs(angle - roundedAngle1);
    const diff2 = Math.abs(angle - roundedAngle2);
    return diff1 < diff2 ? roundedAngle1 : roundedAngle2;
}
