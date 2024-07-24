import { Box2 } from '../../math/Box2.js';
import { ColorStyle } from '../../core/objects/style/ColorStyle.js';
import { MathUtils } from '../../utils/MathUtils.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

const NEAREST_ANGLE = 5;
const SIZE_OF_CROSS = 15;

const _bounds = new Box2();
const _corner1 = new Vector2();
const _corner2 = new Vector2();
const _corner3 = new Vector2();
const _corner4 = new Vector2();
const _start = new Vector2();

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

        this.gridColor = new ColorStyle('rgb(128, 128, 128)', 'rgb(128, 128, 128)');

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
            renderer.resetTransform();
            _translate.identity().translate(worldPosition.x, worldPosition.y).transformContext(context);
            _scale.identity().scale(self.scale.x, self.scale.y).transformContext(context);
            _rotate.identity().rotate(self.rotation).transformContext(context);
            // Swap X/Y Scale due to Rotation
            function degreesToYAxisAlignment(degrees) {
                let normalizedDegrees = ((degrees + 180) % 360 + 360) % 360 - 180;
                while (normalizedDegrees > +90) normalizedDegrees -= 180;
                while (normalizedDegrees < -90) normalizedDegrees += 180;
                return Math.abs(normalizedDegrees) / 90;
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
        const parent = object.ghostParent ?? object.parent;
        const worldPosition = object.getWorldPosition();

        // Offset to Origin Point
        const originOffset = new Vector2();
        if (object.origin) {
            const worldOrigin = object.globalMatrix.transformPoint(object.origin);
            const parentOrigin = parent.inverseGlobalMatrix.transformPoint(worldOrigin);
            originOffset.copy(parentOrigin).sub(object.position);
            worldPosition.copy(worldOrigin);
        }

        // Transform the object's position to grid space
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
        const parentPosition = parent.inverseGlobalMatrix.transformPoint(closestWorldPosition);
        parentPosition.sub(originOffset);
        object.setPosition(parentPosition.x, parentPosition.y);
    }

    alignToRotation(object) {
        const angle = this.rotation;
        const scaleX = this.scale.x;
        const scaleY = this.scale.y;
        const horizontalAngle = MathUtils.radiansToDegrees(Math.atan((scaleY * Math.tan(angle)) / scaleX));
        const verticalAngle = MathUtils.radiansToDegrees((Math.PI / 2) - Math.atan((scaleY / scaleX) * (1 / Math.tan(angle))));
        const alignedAngle = roundToNearestWithTwoRotations(MathUtils.radiansToDegrees(object.rotation), NEAREST_ANGLE, horizontalAngle, verticalAngle);
        const alignedRadians = MathUtils.degreesToRadians(alignedAngle);
        object.setRotation(alignedRadians);
    }

    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;
        context.save();

        // Camera Matrix + Scale + Rotation
        _matrix.copy(renderer.resetTransform(false));
        _matrix.multiply(_scale.identity().scale(this.scale.x, this.scale.y));
        _matrix.multiply(_rotate.identity().rotate(this.rotation));
        _matrix.setContextTransform(context);
        _matrix.getInverse(_inverse);

        // Viewport Coordinates
        const halfWidth = renderer.width / 2;
        const halfHeight = renderer.height / 2;
        _inverse.applyToVector(_corner1.set(-halfWidth, +halfHeight));
        _inverse.applyToVector(_corner2.set(+halfWidth, +halfHeight));
        _inverse.applyToVector(_corner3.set(-halfWidth, -halfHeight));
        _inverse.applyToVector(_corner4.set(+halfWidth, -halfHeight));
        _bounds.setFromPoints(_corner1, _corner2, _corner3, _corner4);
        const visibleWidth = _bounds.getSize().x;
        const visibleHeight = _bounds.getSize().y;

        // Calculate the number of grid cells needed to cover the visible area
        const gridCountX = Math.ceil(visibleWidth / this.gridX) + 2;
        const gridCountY = Math.ceil(visibleHeight / this.gridY) + 2;

        // Calculate the starting position of the grid in world coordinates
        _start.set(
            (camera.position.x / this.scale.x) * -1,
            (camera.position.y / this.scale.y),
        );
        _rotate.identity().rotate(this.rotation);
        _rotate.applyToVector(_start);
        const startX = Math.ceil((_start.x + (visibleWidth / 2)) / this.gridX) * this.gridX * -1;
        const startY = Math.ceil((_start.y + (visibleHeight / 2)) / this.gridY) * this.gridY * -1;

        // Update Pattern / Color
        if (this.gridScale !== camera.scale || !this.cache) {
            this.gridColor.color = '--button-dark';
            this.gridColor.needsUpdate = true;
            this.drawPattern(camera.scale);
        }

        // Draw Pattern
        if (camera.scale <= 1.5) {
            if (!this.cache) this.cache = context.createPattern(this.patternCanvas, 'repeat');
            context.fillStyle = this.cache;
            context.fillRect(startX, startY, gridCountX * this.gridX, gridCountY * this.gridY);
        // Draw Lines
        } else {
            context.strokeStyle = this.gridColor.get(context);
            context.globalAlpha = 1;
            context.lineWidth = 1;
            context.beginPath();
            for (let i = 0; i <= gridCountX; i++) {
                const x = startX + (i * this.gridX);
                context.moveTo(x, startY);
                context.lineTo(x, startY + gridCountY * this.gridY);
            }
            for (let j = 0; j <= gridCountY; j++) {
                const y = startY + (j * this.gridY);
                context.moveTo(startX, y);
                context.lineTo(startX + gridCountX * this.gridX, y);
            }
            context.setTransform(1, 0, 0, 1, 0, 0);
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
        context.strokeStyle = this.gridColor.get(context);
        context.globalAlpha = Math.min(1, scale);
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
        this.cross.visible = false;
        if (object && object.isDragging) {
            // Align Rotation
            if (object.type === 'Rotater') {
                if (renderer.keyboard.modifierPressed() !== this.snap) {
                    this.alignToRotation(object);
                }
            // Align Position
            } else {
                if (this.snap && !renderer.keyboard.metaPressed()) {
                    this.alignToGrid(object);
                    if (object.origin) {
                        const originPosition = object.globalMatrix.transformPoint(object.origin);
                        this.cross.position.copy(originPosition);
                        this.inverseGlobalMatrix.applyToVector(this.cross.position);
                        this.cross.updateMatrix(true);
                        this.cross.level = -1;
                        this.cross.visible = true;
                    }
                }
            }
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
