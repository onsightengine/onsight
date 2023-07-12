import * as THREE from 'three';
import { Entity3D } from './Entity3D.js';

export const CAMERA_TYPES = {
    PERSPECTIVE:    'perspective',
    ORTHOGRAPHIC:   'orthographic',
};

export const CAMERA_ORIENTATION = {
    PORTRAIT:   'portrait',
    LANDSCAPE:  'landscape',
};

class Camera3D extends Entity3D {

    constructor(type = CAMERA_TYPES.PERSPECTIVE) {
        super(type);

        // Prototype
        this.isCamera3D = true;
        this.type = 'Camera3D';

        // Properties
        this.zoom = 1;

        // Flags
        this.isOrthographicCamera = false;
        this.isOrthographicCamera = false;
        this.rotateLock = false;

    }

    /******************** Copy */

    copyEntity(source, recursive = true) {
        // Entity3D.copy()
        super.copyEntity(source, recursive);

        // // Camera3D Properties
        // this.property1 = source.property1;

        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Entity3D Properties
        super.fromJSON(json);

        // // Camera3D Properties
        // if (data.property1 !== undefined) this.property1 = data.property1;

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // // Camera3D Properties
        // json.object.property1 = this.property1;

        return json;
    }

}

export { Camera3D };
