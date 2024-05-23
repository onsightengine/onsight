import { Box2 } from '../../math/Box2.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

const _bounds = new Box2();
const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();

const _matrix = new Matrix2();
const _inverse = new Matrix2();
const _rotate = new Matrix2();
const _scale = new Matrix2();

class GridHelper extends Object2D {

    #gridX = 50;
    #gridY = 50;

    constructor(gridSizeX = 50, gridSizeY = gridSizeX) {
        super();
        this.isHelper = true;
        this.type = 'GridHelper';
        this.name = 'Grid Helper';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.gridX = gridSizeX;
        this.gridY = gridSizeY;

        // INTERNAL
        this.cache = null;
        this.gridScale = 1;
        this.patternCanvas = document.createElement('canvas');
        this.patternContext = this.patternCanvas.getContext('2d');
        this.drawPattern();
    }

    get gridX() { return this.#gridX; }
    set gridX(size) {
        this.#gridX = size;
        this.cache = null;
    }

    get gridY() { return this.#gridY; }
    set gridY(size) {
        this.#gridY = size;
        this.cache = null;
    }

    alignToGrid(object) {
        const objectPosition = object.getWorldPosition();
        const gridPosition = this.position;
        const gridRotation = this.rotation;
        const gridScale = this.scale;

        // Matrix to transform the object's position to the grid space
        const inverseMatrix = new Matrix2()
            .translate(-gridPosition.x, -gridPosition.y)
            .rotate(-gridRotation)
            .scale(1 / gridScale.x, 1 / gridScale.y);
        const localPosition = inverseMatrix.transformPoint(objectPosition.clone());

        // Calculate the closest grid intersection
        const closestX = Math.round(localPosition.x / this.gridX) * this.gridX;
        const closestY = Math.round(localPosition.y / this.gridY) * this.gridY;

        // Transform the closest grid intersection back to world space
        const transformMatrix = new Matrix2()
            .scale(gridScale.x, gridScale.y)
            .rotate(gridRotation)
            .translate(gridPosition.x, gridPosition.y);
        const closestWorldPosition = transformMatrix.transformPoint(new Vector2(closestX, closestY));

        // Set the object's position to the closest grid intersection
        object.position.copy(closestWorldPosition);
        object.updateMatrix(true);
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
        const object = renderer.dragObject;
        if (object && object.isDragging) {
            this.alignToGrid(object);
        }
    }

}

export { GridHelper };
