/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Convexhull-js
// @about       Tiny high-performance JavaScript 2D convex hull library
// @author      Andrey Naumenko
// @license     MIT - Copyright (c) 2015 Andrey Naumenko
// @source      https://github.com/indy256/convexhull-js
// @version     Jun 11, 2015
//
///////////////////////////////////////////////////////////////////////////////////*/

function convexHull2D(points) {
    points.sort(function(a, b) {
        return a.x != b.x ? a.x - b.x : a.y - b.y;
    });

    const n = points.length;
    const hull = [];

    for (let i = 0; i < 2 * n; i++) {
        const j = (i < n) ? (i) : (2 * n - 1 - i);
        while (hull.length >= 2 && removeMiddle(hull[hull.length - 2], hull[hull.length - 1], points[j]))
            hull.pop();
        hull.push(points[j]);
    }

    hull.pop();
    return hull;
}

function removeMiddle(a, b, c) {
    const cross = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
    const dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
    return cross < 0 || cross == 0 && dot <= 0;
}

export { convexHull2D };