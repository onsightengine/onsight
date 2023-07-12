import * as THREE from 'three';
import { CAMERA_TYPES } from '../../constants.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';

const PRIMARY_SIZE = 1000;      // app orientation (in pixels)

class Camera3D extends THREE.Camera {

    constructor({
        type = CAMERA_TYPES.PERSPECTIVE,
        near,
        far,
        // perspective
        fov,

        // orthographic

    } = {}) {
        super(type);

        // Prototype
        this.isCamera3D = true;
        this.type = 'Camera3D';

        // Properties
        this.zoom = 1;

        switch (type) {
            case CAMERA_TYPES.PERSPECTIVE:
                this.near = near ?? 0.01;
                this.far = far ?? 1000;

                this.fov = fov ?? 58.10;
                break;
            case CAMERA_TYPES.ORTHOGRAPHIC:
            default:


        }

        // Flags
        this.isOrthographicCamera = false;
        this.isPerspectiveCamera = false;

        this.aspect = 1;
        this.rotateLock = false;
        this.view = null; /* view offset */

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

    setSize(width, height) {
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
