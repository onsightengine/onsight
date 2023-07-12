import * as THREE from 'three';
import { CAMERA_TYPES } from '../../constants.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';

class Camera3D extends THREE.Camera {

    constructor({
        type = CAMERA_TYPES.PERSPECTIVE,
        near,
        far,
        fov,
    } = {}) {
        super(type);

        // Prototype
        this.isCamera3D = true;
        this.type = 'Camera3D';

        // Properties
        this.zoom = 1;


        // View Offset
        this.view = null;

        // Flags
        this.isOrthographicCamera = false;
        this.isPerspectiveCamera = false;
        this.rotateLock = false;

        // Init Type
        this.updateProjectionMatrix();
    }

    changeType(type) {
        switch (type) {
            case CAMERA_TYPES.PERSPECTIVE:

                break;
            case CAMERA_TYPES.ORTHOGRAPHIC:
            default:


        }

        this.updateProjectionMatrix();
    }

    /******************** Copy */

    copy(source, recursive = true) {
        // THREE.Object3D.copy()
        super.copy(source, recursive);

        // // Camera3D Properties
        // this.property1 = source.property1;

        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Object3D Properties
        ObjectUtils.fromJSON(json, this);

        // Camera3D Properties
        if (data.zoom !== undefined) this.zoom = data.zoom;
        // ...

        // Projection Matrix
        this.updateProjectionMatrix();

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON(null /* !isRootObject */);

        // // Camera3D Properties
        // json.object.property1 = this.property1;

        return json;
    }

}

export { Camera3D };
