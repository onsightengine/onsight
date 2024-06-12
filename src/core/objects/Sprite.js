import { Box } from './Box.js';
import { Box2 } from '../../math/Box2.js';

const PATTERN_SPACING = 6;
const SIMPLIFY_AMOUNT = 2;

let _pattern;

class Sprite extends Box {

    #box = new Box2();

    constructor(src) {
        super();
        this.type = 'Sprite';

	    this.image = document.createElement('img');
        this.contours = [];
        this.path = new Path2D();

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

            // Draw contour for each object
            const contours = [];
            objects.forEach((object) => {
                if (object.outerContour.length > 0) {
                    const simplifiedOuterContour = SIMPLIFY_AMOUNTContour(object.outerContour, SIMPLIFY_AMOUNT);
                    contours.push({ outerContour: simplifiedOuterContour, holes: [] });
                    // Process each hole
                    object.holes.forEach((hole) => {
                        if (hole.length > 0) {
                            const simplifiedHole = SIMPLIFY_AMOUNTContour(hole, SIMPLIFY_AMOUNT);
                            contours[contours.length - 1].holes.push(simplifiedHole);
                        }
                    });
                }
            });
            self.contours = contours;

            // Create path from contours
            const path = new Path2D();
            for (const contour of contours) {
                const outerContour = contour.outerContour;
                path.moveTo(outerContour[0][0] - halfWidth, outerContour[0][1] - halfHeight);
                for (let i = 1; i < outerContour.length - 1; i++) {
                    path.lineTo(outerContour[i][0] - halfWidth, outerContour[i][1] - halfHeight);
                }
                path.closePath();
                for (const hole of contour.holes) {
                    const hl = hole.length - 1;
                    path.moveTo(hole[hl][0] - halfWidth, hole[hl][1] - halfHeight);
                    for (let i = hl - 1; i > 0; i--) {
                        path.lineTo(hole[i][0] - halfWidth, hole[i][1] - halfHeight);
                    }
                    path.closePath();
                }
            }
            self.path = path;
        };
        this.image.src = src;
    }

    draw(renderer) {
        const context = renderer.context;
        const camera = renderer.camera;

        // Pattern?
        if (!_pattern) _pattern = context.createPattern(createCrossHatchPattern('#ffffff', 1, PATTERN_SPACING), 'repeat');

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

            // Create a new path that is scaled based on the camera scale
            const scaledPath = new Path2D();
            scaledPath.addPath(this.path, new DOMMatrix([camera.scale, 0, 0, camera.scale, 0, 0]));

            // Clip using the scaled path
            context.scale(1 / camera.scale, 1 / camera.scale);
            context.clip(scaledPath);

            // Fill the pattern
            context.fillStyle = _pattern;
            context.fillRect(dx * camera.scale, dy * camera.scale, dw * camera.scale, dh * camera.scale);

            // Stroke the scaled path
            context.strokeStyle = '#ffffff';
            context.lineWidth = 2;
            context.stroke(scaledPath);
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
    const patternContext = patternCanvas.getContext('2d');
    const size = spacing * 2;
    patternCanvas.width = size;
    patternCanvas.height = size;
    patternContext.strokeStyle = color;
    patternContext.lineWidth = lineWidth;
    patternContext.beginPath();
    patternContext.moveTo(0, 0); patternContext.lineTo(size, size);
    patternContext.moveTo(size, 0); patternContext.lineTo(0, size);
    patternContext.stroke();
    return patternCanvas;
}

function findObjects(maskData, width, height) {
    // Track pixels visited, start by flood filling outer perimeter
    const visited = new Array(width * height).fill(false);
    for (let x = 0; x < width; x++) floodFill(x, 0, [], maskData, visited, width, height, 'border');
    for (let x = 0; x < width; x++) floodFill(x, height - 1, [], maskData, visited, width, height, 'border');
    for (let y = 0; y < height; y++) floodFill(0, y, [], maskData, visited, width, height, 'border');
    for (let y = 0; y < height; y++) floodFill(width - 1, y, [], maskData, visited, width, height, 'border');

    // Find Objects
    const objects = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!visited[y * width + x] && maskData.data[(y * width + x) * 4 + 3] > 0) {
                const pixels = [];
                floodFill(x, y, pixels, maskData, visited, width, height, 'object');
                if (pixels.length > 0) {
                    const holes = findHoles(pixels, maskData, visited, width, height);
                    const outerContour = traceContour(pixels, maskData, width, height);
                    objects.push({ outerContour, holes });
                }
            }
        }
    }
    return objects;
}

function findHoles(pixels, maskData, visited, width, height) {
    const minX = Math.min(...pixels.map(point => point[0]));
    const maxX = Math.max(...pixels.map(point => point[0]));
    const minY = Math.min(...pixels.map(point => point[1]));
    const maxY = Math.max(...pixels.map(point => point[1]));

    // Create a copy of the visited array, mark pixels as visited
    const objectVisited = [ ...visited ];
    for (const [ x, y ] of pixels) {
        objectVisited[y * width + x] = true;
    }
    for (let x = minX; x <= maxX; x++) floodFill(x, minY, [], maskData, objectVisited, width, height, 'border');
    for (let x = minX; x <= maxX; x++) floodFill(x, maxY, [], maskData, objectVisited, width, height, 'border');
    for (let y = minY; y <= maxY; y++) floodFill(minX, y, [], maskData, objectVisited, width, height, 'border');
    for (let y = minY; y <= maxY; y++) floodFill(maxX, y, [], maskData, objectVisited, width, height, 'border');

    // Find Holes
    let holes = [];
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (!objectVisited[y * width + x] && maskData.data[(y * width + x) * 4 + 3] === 0) {
                const hole = [];
                floodFill(x, y, hole, maskData, objectVisited, width, height, 'hole');
                if (hole.length > 0) {
                    holes.push(traceContour(hole, maskData, width, height, true /* isHole */));
                }
            }
        }
    }
    return holes;
}

function floodFill(x, y, pixels, maskData, visited, width, height, type) {
    const queue = [ [ x, y ] ];
    const directions = [ [  0,  1 ], [  1,  0 ], [  0, -1 ], [ -1,  0 ], ];

    while (queue.length > 0) {
        const [ cx, cy ] = queue.shift();
        const index = cy * width + cx;

        if (cx < 0 || cx >= width) continue;
        if (cy < 0 || cy >= height) continue;
        if (visited[index]) continue;
        if (type === 'border' && maskData.data[index * 4 + 3] !== 0) continue;
        if (type === 'object' && maskData.data[index * 4 + 3] === 0) continue;
        if (type === 'hole') { /* EMPTY */ }

        visited[index] = true;
        pixels.push([ cx, cy ]);
        for (let i = 0; i < 4; i++) {
            const nx = cx + directions[i][0];
            const ny = cy + directions[i][1];
            queue.push([ nx, ny ]);
        }
    }
}

function traceContour(pixels, maskData, width, height, isHole = false) {
    if (!pixels || pixels.length === 0) return [];
    const contour = [];
    const directions = [
        [  1,  0 ],
        [  0,  1 ],
        [ -1,  0 ],
        [  0, -1 ],
    ];

    let startX = pixels[0][0];
    let startY = pixels[0][1];
    let currentX = startX;
    let currentY = startY;
    let dir = isHole ? 2 : 0;
    do {
        contour.push([ currentX, currentY ]);
        for (let i = 0; i < 4; i++) {
            const newDir = (dir + i) % 4;
            const newX = currentX + directions[newDir][0];
            const newY = currentY + directions[newDir][1];
            if (isHole ? !isOpaque(newX, newY, maskData, width, height) : isOpaque(newX, newY, maskData, width, height)) {
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

function SIMPLIFY_AMOUNTContour(contour, epsilon) {
    const simplified = [ contour[0] ];
    SIMPLIFY_AMOUNTSegment(contour, 0, contour.length - 1, epsilon, simplified);
    simplified.push(contour[contour.length - 1]);
    return simplified;
}

function SIMPLIFY_AMOUNTSegment(contour, start, end, epsilon, simplified) {
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
        SIMPLIFY_AMOUNTSegment(contour, start, maxIndex, epsilon, simplified);
        simplified.push(contour[maxIndex]);
        SIMPLIFY_AMOUNTSegment(contour, maxIndex, end, epsilon, simplified);
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
