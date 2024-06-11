import { Box } from './Box.js';
import { Box2 } from '../../math/Box2.js';

const SIMPLIFY = 2;

let _pattern;

class Sprite extends Box {

    #box = new Box2();

    constructor(src) {
        super();
        this.type = 'Sprite';

	    this.image = document.createElement('img');
        this.contours = [];

	    if (src) this.setImage(src);
    }

    setImage(src) {
        const self = this;
        this.image.onload = function() {
            const width = self.image.naturalWidth;
            const height = self.image.naturalWidth;
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            self.box.min.set(-halfWidth, -halfHeight);
            self.box.max.set(+halfWidth, +halfHeight);
            self.computeBoundingBox();

            // Alpha Mask
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskContext = maskCanvas.getContext('2d');
            maskContext.drawImage(self.image, 0, 0, width, height, 0, 0, width, height);

            // Get the alpha channel data from the mask canvas
            const imageData = maskContext.getImageData(0, 0, width, height);
            const alphaData = imageData.data;
            const maskData = maskContext.createImageData(width, height);
            const maskPixels = maskData.data;

            // Set the mask pixels based on the alpha channel
            for (let i = 3; i < alphaData.length; i += 4) {
                const alpha = alphaData[i];
                maskPixels[i - 3] = alpha;
                maskPixels[i - 2] = alpha;
                maskPixels[i - 1] = alpha;
                maskPixels[i] = alpha;
            }
            maskContext.putImageData(maskData, 0, 0);

            // Find objects using flood fill
            const objects = findObjects(maskData, width, height);

            // Trace the contours of each object
            objects.forEach((object) => {
                const contour = traceContour(object, maskData, width, height);
                self.contours.push(contour);
            });

            // Simplify the contours using polyline simplification
            self.contours = self.contours.map((contour) =>
                simplifyContour(contour, SIMPLIFY)
            );
        };
        this.image.src = src;
    }

    draw(renderer) {
        const context = renderer.context;

        // Pattern?
        if (!_pattern) _pattern = context.createPattern(createCrossHatchPattern('#ffffff', 1, 10), 'repeat');

        // Check Bounds
        if (this.box.equals(this.#box) === false) this.computeBoundingBox();

        // Image Complete?
        if (this.image.src.length === 0 || !this.image.complete) return;

        // Image Data
        const width = this.image.naturalWidth;
        const height = this.image.naturalHeight;
        const sx = 0;
        const sy = 0;
        const sw = width;
        const sh = height;
        const dx = width / -2;
        const dy = height / -2;
        const dw = width;
        const dh = height;

        // Transparent Draw
        if (context.globalAlpha < 0.05) {
            context.save();
            context.globalAlpha = 1;
            for (const contour of this.contours) {
                context.beginPath();
                context.moveTo(contour[0][0] + dx, contour[0][1] + dy);
                for (let i = 1; i < contour.length - 1; i++) {
                    context.lineTo(contour[i][0] + dx, contour[i][1] + dy);
                }
                context.closePath();

                context.fillStyle = _pattern;
                context.fill();

                context.strokeStyle = 'red';
                context.lineWidth = 2;
                context.stroke();
            }
            context.restore();

        // Normal Draw
        } else {
            context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }

}

export { Sprite };

/******************** INTERNAL */

function createCrossHatchPattern(color, lineWidth, spacing) {
    const patternCanvas = document.createElement('canvas');
    const size = spacing * 2;
    patternCanvas.width = size;
    patternCanvas.height = size;

    const patternContext = patternCanvas.getContext('2d');
    patternContext.strokeStyle = color;
    patternContext.lineWidth = lineWidth;

    // Draw diagonal lines (top-left to bottom-right)
    patternContext.beginPath();
    patternContext.moveTo(0, 0);
    patternContext.lineTo(size, size);
    patternContext.stroke();

    // Draw diagonal lines (bottom-left to top-right)
    patternContext.beginPath();
    patternContext.moveTo(0, size);
    patternContext.lineTo(size, 0);
    patternContext.stroke();

    return patternCanvas;
}

function findObjects(maskData, width, height) {
    const objects = [];
    const visited = new Array(width * height).fill(false);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!visited[y * width + x] && maskData.data[(y * width + x) * 4 + 3] > 0) {
                const object = [];
                floodFill(x, y, object, maskData, visited, width, height);
                objects.push(object);
            }
        }
    }

    return objects;
}

function floodFill(x, y, object, maskData, visited, width, height) {
    const queue = [ [ x, y ] ];
    const directions = [
        [  0,  1 ],
        [  1,  0 ],
        [  0, -1 ],
        [ -1,  0 ],
    ];

    while (queue.length > 0) {
        const [ cx, cy ] = queue.shift();
        const index = cy * width + cx;

        if (cx < 0 || cx >= width ||
            cy < 0 || cy >= height ||
            visited[index] ||
            maskData.data[index * 4 + 3] === 0
        ) continue;

        visited[index] = true;
        object.push([cx, cy]);

        for (let i = 0; i < 4; i++) {
            const nx = cx + directions[i][0];
            const ny = cy + directions[i][1];
            queue.push([nx, ny]);
        }
    }
}

function traceContour(object, maskData, width, height) {
    const contour = [];
    const directions = [
        [  1,  0 ],
        [  0,  1 ],
        [ -1,  0 ],
        [  0, -1 ],
    ];

    let startX = object[0][0];
    let startY = object[0][1];
    let currentX = startX;
    let currentY = startY;
    let dir = 0;
    do {
        contour.push([currentX, currentY]);
        for (let i = 0; i < 4; i++) {
            const newDir = (dir + i) % 4;
            const newX = currentX + directions[newDir][0];
            const newY = currentY + directions[newDir][1];
            if (isOpaque(newX, newY, maskData, width, height)) {
                currentX = newX;
                currentY = newY;
                dir = (newDir + 3) % 4;
                break;
            }
        }
    } while (currentX !== startX || currentY !== startY);

    return contour;
}

function isOpaque(x, y, maskData, width, height) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const index = (y * width + x) * 4;
    return maskData.data[index + 3] > 0;
}

function simplifyContour(contour, epsilon) {
    const simplified = [ contour[0] ];
    simplifySegment(contour, 0, contour.length - 1, epsilon, simplified);
    simplified.push(contour[contour.length - 1]);
    return simplified;
}

function simplifySegment(contour, start, end, epsilon, simplified) {
    let maxDist = 0;
    let maxIndex = 0;
    for (let i = start + 1; i < end; i++) {
        const dist = perpendicularDistance(contour[i], contour[start], contour[end]);
        if (dist > maxDist) {
            maxDist = dist;
            maxIndex = i;
        }
    }
    if (maxDist > epsilon) {
        simplifySegment(contour, start, maxIndex, epsilon, simplified);
        simplified.push(contour[maxIndex]);
        simplifySegment(contour, maxIndex, end, epsilon, simplified);
    }
}

function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    const norm = Math.sqrt(dx * dx + dy * dy);
    const nx = dy / norm;
    const ny = -dx / norm;
    const vx = point[0] - lineStart[0];
    const vy = point[1] - lineStart[1];
    return Math.abs(nx * vx + ny * vy);
}
