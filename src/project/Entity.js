// https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js

import { Maths } from '../utils/Maths.js';

class Entity { // extends Object3D

    constructor(name = '') {
        // Prototype
        this.isEntity = true;
        this.type = 'Entity';

        // Basic
        this.name = name;
        this.uuid = Maths.uuid();

        // Hierarchy
        this.parent = null;
        this.children = [];

        // Custom
        this.userData = {};
    }

}

export { Entity };
