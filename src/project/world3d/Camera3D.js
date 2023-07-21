import * as THREE from 'three';
import { APP_SIZE } from '../../constants.js';
import { CAMERA_TYPES } from '../../constants.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';

class Camera3D extends THREE.Camera {

    constructor({
        type = CAMERA_TYPES.PERSPECTIVE,
        width = APP_SIZE,           // initial dom element width
        height = APP_SIZE,          // initial dom element height
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
        if (fit !== 'width' && fit !== 'height') fit = 'none';
        this.fit = fit;
        this.near = near ?? ((type === CAMERA_TYPES.PERSPECTIVE) ? 0.01 : - 1000);
        this.far = far ?? ((type === CAMERA_TYPES.PERSPECTIVE) ? 1000 : 1000);

        // Properties, Perspective
        this.fieldOfView = fieldOfView ?? 58.10;

        // Properties, Orthographic
        // ... EMPTY

        // Flags
        this.isPerspectiveCamera = (type === CAMERA_TYPES.PERSPECTIVE);
        this.isOrthographicCamera = (type === CAMERA_TYPES.ORTHOGRAPHIC);
        this.aspect = 1;
        this.rotateLock = false;
        this.view = null; /* view offset */
        this.zoom = 1;

        // Flags, Perspective
        this.fov = 58.10;

        // Flags, Orthographic
        this.target = new THREE.Vector3();

        // Init Size
        this.setSize(width, height);
    }

    setSize(width = APP_SIZE, height = APP_SIZE) {
        this.lastWidth = width;
        this.lastHeight = height;

        this.aspect = width / height;

        /* Perspective */ {
            if (this.fit === 'height') {
                this.fov = this.fieldOfView;
            } else {
                const tanFOV = Math.tan(((Math.PI / 180) * this.fieldOfView) / 2);
                if (this.fit === 'width') {
                    this.fov = (360 / Math.PI) * Math.atan(tanFOV / this.aspect);
                } else { // (this.fit === 'none') {
                    this.fov = (360 / Math.PI) * Math.atan(tanFOV * (height / APP_SIZE));
                }
            }
        }

        /* Orthographic */ {
            if (this.fit === 'width') {
                width = APP_SIZE;
                height = width / this.aspect;
            } else if (this.fit === 'height') {
                height = APP_SIZE;
                width = height * this.aspect;
            }

            this.left =    - width / 2;
            this.right =     width / 2;
            this.top =       height / 2;
            this.bottom =  - height / 2;
        }

        // Update
        this.updateProjectionMatrix();
    }

    changeFit(fit) {
        if (fit === 'landscape') fit = 'width';
        if (fit === 'portrait') fit = 'height';
        if (fit !== 'width' && fit !== 'height') fit = 'none';
        this.fit = fit;
    }

    changeType(newType) {
        this.isPerspectiveCamera = (newType === CAMERA_TYPES.PERSPECTIVE);
        this.isOrthographicCamera = (newType === CAMERA_TYPES.ORTHOGRAPHIC);

        if (this.isPerspectiveCamera) this.near = (10 / this.far);
        if (this.isOrthographicCamera) this.near = (this.far * -1);

        this.updateProjectionMatrix();
    }

    /******************** PROJECTION MATRIX (FRUSTUM) */

    updateProjectionMatrix(target /* Vector3 */) {

        // Update Target
        if (target) {
            if (target.isObject3D) target = target.position;
            this.target.copy(target);
        }

        // https://github.com/mrdoob/three.js/blob/dev/src/cameras/PerspectiveCamera.js
        if (this.isPerspectiveCamera) {
            let top = this.near * Math.tan((Math.PI / 180) * 0.5 * this.fov);
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

            this.projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far, this.coordinateSystem);
            this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
        }

        // https://github.com/mrdoob/three.js/blob/dev/src/cameras/OrthographicCamera.js
        if (this.isOrthographicCamera) {

            // Scale to Postion --> Target Distance
            const distance = this.position.distanceTo(this.target);

            // NOTE: Starting Camera distance is '10'
            //  1 world unit === 1000 pixels at distance 1
            //  1 world unit === 100 pixels at distance 10
            //  1 world unit === 10 pixels at distance 100
            //  1 world unit === 1 pixels at distance 1000 (careful near / far)
            let zoom = distance / 1000;
            if (!isFinite(zoom) || isNaN(zoom)) zoom = 0.00001;
            if (zoom < 0.00001 && zoom > - 0.00001) zoom = 0.00001;

            // Frustum
            const dx = ((this.right - this.left) * zoom) / 2;
            const dy = ((this.top - this.bottom) * zoom) / 2;
            const cx = (this.right + this.left);
            const cy = (this.top + this.bottom);

            let left = cx - dx;
            let right = cx + dx;
            let top = cy + dy;
            let bottom = cy - dy;

            const view = this.view;
            if (view && view.enabled) {
                const scaleW = ((this.right - this.left) / view.fullWidth) * zoom;
                const scaleH = ((this.top - this.bottom) / view.fullHeight) * zoom;
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

        // Attempt to Copy Size
        this.setSize(source.lastWidth, source.lastHeight);
        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Object3D Properties
        ObjectUtils.fromJSON(json, this);

        // Camera3D Properties
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
