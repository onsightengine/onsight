import * as THREE from 'three';
import { CAMERA_TYPES } from '../../constants.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';

const PRIMARY_SIZE = 1000;          // app orientation (in pixels)

class Camera3D extends THREE.Camera {

    constructor({
        type = CAMERA_TYPES.PERSPECTIVE,
        width = PRIMARY_SIZE,       // initial dom element width
        height = PRIMARY_SIZE,      // initial dom element height
        fit,                        // 'none', 'width', 'height'
        near,
        far,
        // perspective
        fieldOfView,
        // orthographic
        // ... EMPTY
    } = {}) {
        super(type);

        // Prototype
        this.isCamera3D = true;
        this.type = 'Camera3D';

        // Properties
        this.zoom = 1;
        this.fit = fit ?? 'none';
        this.near = near ?? ((type === CAMERA_TYPES.PERSPECTIVE) ? 0.01 : - 1000);
        this.far = far ?? ((type === CAMERA_TYPES.PERSPECTIVE) ? 1000 : 1000);

        // Properties, Perspective
        this.fieldOfView = fieldOfView ?? 58.10;

        // Properties, Orthographic
        // ... EMPTY

        // Flags
        this.isPerspectiveCamera = false;
        this.isOrthographicCamera = false;
        this.rotateLock = false;
        this.view = null; /* view offset */

        // Flags, Perspective
        this.fov = 58.10;
        this.aspect = 1;

        // Init Type
        this.setSize(width, height);
    }

    setSize(width = PRIMARY_SIZE, height = PRIMARY_SIZE) {
        /* Perspective */ {
            if (this.fit === 'none') {
                const tanFOV = Math.tan(((Math.PI / 180) * this.fieldOfView / 2));
                this.fov = (360 / Math.PI) * Math.atan(tanFOV * (height / PRIMARY_SIZE));
            } else {
                this.fov = this.fieldOfView;
            }
            this.aspect = width / height;
        }

        /* Orthographic */ {
            let orthoWidth = (this.fit === 'none') ? width : PRIMARY_SIZE;
            let orthoHeight = (this.fit === 'none') ? height: PRIMARY_SIZE;

            // Aspect Ratio (if fit)
            let aspectWidth = 1.0;
            let aspectHeight = 1.0;
            if (this.fit === 'width') {
                aspectHeight = height / width;
            } else if (fit === 'height') {
                aspectWidth = width / height;
            }

            // Scale to 1 world unit === 1000 pixels
            orthoWidth *= 0.005;
            orthoHeight *= 0.005;

            // Frustum
            this.left =    - orthoWidth / aspectWidth / 2;
            this.right =     orthoWidth / aspectWidth / 2;
            this.top =       orthoHeight * aspectHeight / 2;
            this.bottom =  - orthoHeight * aspectHeight / 2;
        }

        // Update
        this.updateProjectionMatrix();
    }

    changeType(type) {
        this.isPerspectiveCamera = (type === CAMERA_TYPES.PERSPECTIVE);
        this.isOrthographicCamera = (type === CAMERA_TYPES.ORTHOGRAPHIC);

        if (type === CAMERA_TYPES.PERSPECTIVE) {

        }

        if (type === CAMERA_TYPES.ORTHOGRAPHIC) {

        }
        this.updateProjectionMatrix();
    }

    /******************** PROJECTION MATRIX (FRUSTUM) */

    updateProjectionMatrix() {
        // https://github.com/mrdoob/three.js/blob/dev/src/cameras/PerspectiveCamera.js
        if (type === CAMERA_TYPES.PERSPECTIVE) {
            const near = this.near;
		    let top = near * Math.tan((Math.PI / 180) * 0.5 * this.fov) / this.zoom;
		    let height = 2 * top;
		    let width = this.aspect * height;
		    let left = - 0.5 * width;

		    const view = this.view;
		    if (view && view.enabled) {
			    const fullWidth = view.fullWidth;
				const fullHeight = view.fullHeight;
			    left += view.offsetX * width / fullWidth;
			    top -= view.offsetY * height / fullHeight;
			    width *= view.width / fullWidth;
			    height *= view.height / fullHeight;
		    }

		    this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far, this.coordinateSystem);
		    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
        }

        // https://github.com/mrdoob/three.js/blob/dev/src/cameras/OrthographicCamera.js
        if (type === CAMERA_TYPES.ORTHOGRAPHIC) {
            const dx = (this.right - this.left) / (2 * this.zoom);
            const dy = (this.top - this.bottom) / (2 * this.zoom);
            const cx = (this.right + this.left) / 2;
            const cy = (this.top + this.bottom) / 2;
            let left = cx - dx;
            let right = cx + dx;
            let top = cy + dy;
            let bottom = cy - dy;

            const view = this.view;
            if (view && view.enabled) {
                const scaleW = (this.right - this.left) / view.fullWidth / this.zoom;
                const scaleH = (this.top - this.bottom) / view.fullHeight / this.zoom;
                left += scaleW * view.offsetX;
                right = left + scaleW * view.width;
                top -= scaleH * view.offsetY;
                bottom = top - scaleH * view.height;
            }

            this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far, this.coordinateSystem);
            this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
        }
    }

    /******************** VIEW OFFSET */

    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
        if (!this.view) this.view = {};
        this.view.enabled = true;
        this.view.fullWidth = fullWidth;
        this.view.fullHeight = fullHeight;
        this.view.offsetX = x;
        this.view.offsetY = y;
        this.view.width = width;
        this.view.height = height;

        this.setSize(fullWidth, fullHeight);
	}

	clearViewOffset() {
		if (this.view && this.view.enabled) {
			this.view.enabled = false;
            this.setSize(this.view.fullWidth, this.view.fullHeight);
		}
	}

    /******************** COPY */

    copy(source, recursive = true) {
        // THREE.Object3D.copy()
        super.copy(source, recursive);

        // Camera3D Properties
        this.zoom = source.zoom;
        this.fit = source.fit;
        this.near = source.near;
        this.far = source.far;

        // Perspective Properties
        this.fieldOfView = source.fieldOfView;

        // Orthographic Properties
        // ... EMPTY

        // Flags
        this.isPerspectiveCamera = source.isPerspectiveCamera;
        this.isOrthographicCamera = source.isOrthographicCamera;

        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Object3D Properties
        ObjectUtils.fromJSON(json, this);

        // Camera3D Properties
        if (data.zoom !== undefined) this.zoom = data.zoom;
        if (data.fit !== undefined) this.fit = data.fit;
        if (data.near !== undefined) this.near = data.near;
        if (data.far !== undefined) this.far = data.far;

        // Perspective Properties
        if (data.fieldOfView !== undefined) this.fieldOfView = data.fieldOfView;

        // Orthographic Properties
        // ... EMPTY

        // Projection Matrix
        this.updateProjectionMatrix();

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON(null /* !isRootObject */);

        // Camera3D Properties
        json.object.zoom = this.zoom;
        json.object.fit = this.fit;
        json.object.near = this.near;
        json.object.far = this.far;

        // Perspective Properties
        json.object.fieldOfView = this.fieldOfView;

        // Orthographic Properties
        // ... EMPTY

        return json;
    }

}

export { Camera3D };
