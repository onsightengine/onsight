import * as THREE from 'three';

//  fitCameraToObject()     Fits camera to object
//  screenPoint()           Projects a point from 3D world space coordinates to 2D screen coordinates
//  worldPoint()            Unprojects a point from 2D screen coordinates to 3D world space coordinates

const _raycaster = new THREE.Raycaster();

class CameraUtils {

    /* Fits camera to object */
    static fitCameraToObject(camera, object, controls = null, offset = 1.25, tilt = false) {

        //
        // TODO: Work with Orthographic camera!
        //

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
        if (tilt) {
            camera.position.x += distance / 6;
            camera.position.y += distance / 6;
        }
        camera.position.z += distance;
        camera.lookAt(center);

        if (controls) {
            controls.maxDistance = distance * 10;
            controls.target.copy(center);
            controls.update();
        }
    }

    /** Projects a point from 3D world space coordinates to 2D screen coordinates */
    static screenPoint(pointInWorld, camera) {
        if (!camera || !camera.isCamera) {
            console.warn(`CameraUtils.screenPoint: No camera provided!`);
            return new THREE.Vector3();
        }
        return new THREE.Vector3.copy(pointInWorld).project(camera);
    }

    /** Unprojects a point from 2D screen coordinates to 3D world space coordinates */
    static worldPoint(pointOnScreen, camera, lookTarget = new THREE.Vector3(), facingPlane = 'xy') {
        if (!camera || !camera.isCamera) {
            console.warn(`CameraUtils.worldPoint: No camera provided!`);
            return new THREE.Vector3();
        }

        // Distance to Z Method (as a percentage, interpolated between the near and far plane)

        // let z = pointOnScreen.z ?? 0;
        // const nearVector = new THREE.Vector3(pointOnScreen.x, pointOnScreen.y, 0).unproject(camera);
        // const farVector = new THREE.Vector3(pointOnScreen.x, pointOnScreen.y, 1.0).unproject(camera);
        // const zTotal = Math.abs(nearVector.z) + Math.abs(farVector.z);
        // const zPercent = Math.abs(nearVector.z / zTotal);
        // const nx = nearVector.x + (zPercent * (farVector.x - nearVector.x));
        // const ny = nearVector.y + (zPercent * (farVector.y - nearVector.y));
        // const nz = nearVector.z + (zPercent * (farVector.z - nearVector.z));
        // return new THREE.Vector3(nx, ny, 0);//nz);

        // Raycaster Method

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

        // Cast ray from Camera
        _raycaster.setFromCamera(pointOnScreen, camera);
        if (camera.isOrthographicCamera) {
            _raycaster.ray.origin.set(pointOnScreen.x, pointOnScreen.y, - camera.far).unproject(camera);
        }
        const planeIntersects = _raycaster.intersectObject(plane, true);

        // Clean up
        planeGeometry.dispose();
        planeMaterial.dispose();

        return (planeIntersects.length > 0) ? planeIntersects[0].point.clone() : false;
    }

}

export { CameraUtils };