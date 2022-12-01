/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Camera Utility Functions
//      Creation
//          createOrthographic          Create an orthographic camera
//          createPerspective           Create a perspective camera
//      Update
//          updateCamera                Calls appropriate update function for camera
//          updatePerspective           Updates a perspective camera's frustum
//          updateOrthographic          Updates an orthographic camera's frustum
//      Space
//          screenPoint                 Projects a point from 3D world space coordinates to 2D screen coordinates
//          worldPoint                  Unprojects a point from 2D screen coordinates to 3D world space coordinates
//      Utils
//          fitCameraToObject           Fits camera to object
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

///// Constants

export const CAMERA_SCALE = 0.01;
export const CAMERA_START_DISTANCE = 5;
export const CAMERA_START_HEIGHT = 0;

///// Local Variables

const _raycaster = new THREE.Raycaster();

///// Class

class CameraUtils {

    //////////////////// Creation

    /**
     * Create an orthographic camera
     * @param {Number} camWidth DOM element width camera is rendering into
     * @param {Number} camHeight DOM element height camera is rendering into
     * @param {*} fitType Camera should fit pixels to 'none' (no scaling) or 'width' or 'height'
     * @param {*} desiredSize If fitting to width or height, camera will zoom to fit this number of pizels
     * @returns Three.js camera object
     */
    static createOrthographic(camWidth, camHeight, fitType = 'none', desiredSize = 0) {
        // Create camera
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);

        // Add custom properties
        camera.desiredSize = desiredSize;
        camera.fitType = fitType;

        // Set starting location
        camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
        camera.lookAt(0, CAMERA_START_HEIGHT, 0);

        CameraUtils.updateOrthographic(camera, camWidth, camHeight);
        return camera;
    }

    /**
     * Create a perspective camera
     * @param {Number} camWidth DOM element width camera is rendering into
     * @param {Number} camHeight DOM element height camera is rendering into
     * @param {Boolean} fixedSize Should camera maintain size no matter the height of the DOM element?
     * @returns Three.js camera object
     */
    static createPerspective(camWidth, camHeight, fixedSize = true) {
        // Create camera
        const camera = new THREE.PerspectiveCamera(
            58.10,      // fov = Field Of View
            1,          // aspect ratio (dummy value)
            0.01,       // near clipping plane
            1000,       // far clipping plane
        );

        // Remember these initial values
        camera.tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
        camera.windowHeight = (fixedSize) ? 1000 /* i.e. 1000 pixels tall, nice round number */ : 0;
        camera.fixedSize = fixedSize;

        // Move the camera back so we can view the scene
        camera.position.set(0, CAMERA_START_HEIGHT, CAMERA_START_DISTANCE);
        camera.lookAt(0, CAMERA_START_HEIGHT, 0);

        CameraUtils.updatePerspective(camera, camWidth, camHeight);
        return camera;
    }

    //////////////////// Update

    static updateCamera(camera, camWidth, camHeight) {
        if (camera.isPerspectiveCamera) CameraUtils.updatePerspective(camera, camWidth, camHeight);
        if (camera.isOrthographicCamera) CameraUtils.updateOrthographic(camera, camWidth, camHeight);
    }

    /** Updates a perspective camera's frustum */
    static updatePerspective(camera, camWidth, camHeight) {
        if (camera.fixedSize) {
            camera.fov = (360 / Math.PI) * Math.atan(camera.tanFOV * (camHeight / camera.windowHeight));
        }

        camera.aspect = camWidth / camHeight;                               // Set the camera's aspect ratio
        camera.updateProjectionMatrix();                                    // Update the camera's frustum
    }

    /** Updates an orthographic camera's frustum */
    static updateOrthographic(camera, camWidth, camHeight) {
        // Check for added camera properties
        let fit = camera.fitType;
        let size = 0;
        if (camera.desiredSize) {
            size = camera.desiredSize;
        } else {
            fit = 'none';
        }

        // Figure out target camera width / height
        let aspectWidth = 1.0;
        let aspectHeight = 1.0;
        let width = size;
        let height = size;
        if (fit === 'none') {
            width = camWidth * CAMERA_SCALE * 0.5;
            height = camHeight * CAMERA_SCALE * 0.5;
        } else if (fit === 'width') {
            aspectHeight = camHeight / camWidth;
        } else if (fit === 'height') {
            aspectWidth = camWidth / camHeight;
        }

        // Calculate new frustum, update camera
        camera.left =    - width / aspectWidth / 2;
        camera.right =     width / aspectWidth / 2;
        camera.top =       height * aspectHeight / 2;
        camera.bottom =  - height * aspectHeight / 2;
        camera.updateProjectionMatrix();
    }

    //////////////////// Space

    /** Projects a point from 3D world space coordinates to 2D screen coordinates */
    static screenPoint(pointInWorld, camera) {
        if (! camera || ! camera.isCamera) {
            console.warn(`CameraUtils.screenPoint: No camera provided!`);
            return new THREE.Vector3();
        }
        return new THREE.Vector3.copy(pointInWorld).project(camera);
    }

    /** Unprojects a point from 2D screen coordinates to 3D world space coordinates */
    static worldPoint(pointOnScreen, camera, lookTarget = new THREE.Vector3(), facingPlane = 'xy') {
        if (! camera || ! camera.isCamera) {
            console.warn(`CameraUtils.worldPoint: No camera provided!`);
            return new THREE.Vector3();
        }

        ///// Distance to Z (as a percentage, interpolate between the near and far plane points)

        // let z = pointOnScreen.z ?? 0;
        // const nearVector = new THREE.Vector3(pointOnScreen.x, pointOnScreen.y, 0).unproject(camera);
        // const farVector = new THREE.Vector3(pointOnScreen.x, pointOnScreen.y, 1.0).unproject(camera);
        // const zTotal = Math.abs(nearVector.z) + Math.abs(farVector.z);
        // const zPercent = Math.abs(nearVector.z / zTotal);
        // const nx = nearVector.x + (zPercent * (farVector.x - nearVector.x));
        // const ny = nearVector.y + (zPercent * (farVector.y - nearVector.y));
        // const nz = nearVector.z + (zPercent * (farVector.z - nearVector.z));
        // return new THREE.Vector3(nx, ny, 0);//nz);

        ///// Raycaster Method

        // Rotate to 'facingPlane'
        const planeGeometry = new THREE.PlaneGeometry(100000000, 100000000, 2, 2);
        switch (facingPlane.toLowerCase()) {
            case 'yz': planeGeometry.rotateY(Math.PI / 2); break;
            case 'xz': planeGeometry.rotateX(Math.PI / 2); break;
            default: /* 'xy' */ ;
        }
        planeGeometry.translate(lookTarget.x, lookTarget.y, lookTarget.z);

        // Mesh
        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // Cast ray from camera
        _raycaster.setFromCamera(pointOnScreen, camera);
        if (camera.isOrthographicCamera) {
            _raycaster.ray.origin.set(pointOnScreen.x, pointOnScreen.y, - camera.far).unproject(camera);
        }
        const planeIntersects = _raycaster.intersectObject(plane, true);

        // Clean up
        planeGeometry.dispose();
        planeMaterial.dispose();

        return (planeIntersects.length > 0) ? planeIntersects[0].point : false;
    }

    //////////////////// Utils

    static distanceToFitObject(camera, object, offset = 1.25) {

    }

    /* Fits camera to object */
    static fitCameraToObject(camera, object, controls = null, offset = 1.25) {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(object);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // // #OPTION 0
        const fitDepthDistance = size.z / (2.0 * Math.atan(Math.PI * camera.fov / 360));
        const fitHeightDistance = Math.max(fitDepthDistance, size.y / (2.0 * Math.atan(Math.PI * camera.fov / 360)));
        const fitWidthDistance = (size.x / (2.5 * Math.atan(Math.PI * camera.fov / 360))) / camera.aspect;
        const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

        // // #OPTION 1
        // const maxSize = Math.max(size.x, size.y, size.z);
        // const fitHeightDistance = maxSize / (2.0 * Math.atan(Math.PI * camera.fov / 360));
        // const fitWidthDistance = fitHeightDistance / camera.aspect;
        // const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

        // // #OPTION 2
        // const fov = camera.fov * (Math.PI / 180);
        // const distance = offset * Math.abs(maxSize / 4 * Math.tan(fov * 2));

        camera.near = distance / 100;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();

        camera.position.copy(center);
        // camera.position.x += distance / 3;
        // camera.position.y += distance / 3;
        camera.position.z += distance;
        camera.lookAt(center);

        if (controls) {
            controls.maxDistance = distance * 10;
            controls.target.copy(center);
            controls.update();
        }
    }

}

export { CameraUtils };