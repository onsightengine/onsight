import * as THREE from 'three';
import { OrbitControls as ThreeOrbit } from 'three/addons/controls/OrbitControls.js';

class OrbitControls extends ThreeOrbit {

    constructor() {
        super(...arguments);
    }

}

export { OrbitControls };
