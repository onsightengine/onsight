import { Box2 } from '../../math/Box2.js';
import { Object2D } from '../../core/Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

const _bounds = new Box2();
const _topLeft = new Vector2();
const _topRight = new Vector2();
const _botLeft = new Vector2();
const _botRight = new Vector2();

class GridHelper extends Object2D {

    constructor(gridSize = 50) {
        super();
        this.isHelper = true;

        this.name = 'Grid Helper';

        this.pointerEvents = false;
        this.draggable = false;
        this.focusable = false;
        this.selectable = false;

        this.gridSize = gridSize;
        this.patternCanvas = document.createElement('canvas');
        this.patternContext = this.patternCanvas.getContext('2d');
        this.drawPattern();

        // INTERNAL
        this.cache = null;
        this.gridScale = 1;
    }

    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;
        const gridSize = this.gridSize;
        context.save();
        camera.matrix.setContextTransform(context);

        // Viewport Coordinates
        camera.inverseMatrix.applyToVector(_topLeft.set(0, 0));
        camera.inverseMatrix.applyToVector(_topRight.set(renderer.width, 0));
        camera.inverseMatrix.applyToVector(_botLeft.set(0, renderer.height));
        camera.inverseMatrix.applyToVector(_botRight.set(renderer.width, renderer.height));
        _bounds.setFromPoints(_topLeft, _topRight, _botLeft, _botRight);
        const visibleWidth = _bounds.getSize().x;
        const visibleHeight = _bounds.getSize().y;

        // Calculate the number of grid cells needed to cover the visible area
        const gridCountX = Math.ceil(visibleWidth / gridSize) + 1;
        const gridCountY = Math.ceil(visibleHeight / gridSize) + 1;

        // Calculate the starting position of the grid in world coordinates
        const startX = Math.floor(_bounds.min.x / gridSize) * gridSize;
        const startY = Math.floor(_bounds.min.y / gridSize) * gridSize;

        // Draw Pattern
        if (camera.scale <= 1) {
            if (this.gridScale !== camera.scale) this.drawPattern(camera.scale);
            if (!this.cache) this.cache = context.createPattern(this.patternCanvas, 'repeat');
            context.fillStyle = this.cache;
            context.fillRect(startX, startY, gridCountX * gridSize, gridCountY * gridSize);
        // Draw Lines
        } else {
            context.beginPath();
            for (let i = 0; i <= gridCountX; i++) {
                const x = startX + i * gridSize;
                context.moveTo(x, _bounds.min.y);
                context.lineTo(x, _bounds.max.y);
            }
            for (let j = 0; j <= gridCountY; j++) {
                const y = startY + j * gridSize;
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
        const gridSize = this.gridSize;
        this.patternCanvas.width = gridSize;
        this.patternCanvas.height = gridSize;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
        context.strokeStyle = `rgba(128, 128, 128, ${Math.min(1, scale)})`;
        context.lineWidth = 1;
        context.translate(gridSize / 2, gridSize / 2);
        context.beginPath();
        context.moveTo(gridSize / 2, -gridSize);
        context.lineTo(gridSize / 2, +gridSize);
        context.moveTo(-gridSize, gridSize / 2);
        context.lineTo(+gridSize, gridSize / 2);
        context.stroke();
    }

}

export { GridHelper };
