/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/

/////////////////////////////////////////////////////////////////////////////////////
/////   HelperObject
/////////////////////////////////////////////////////////////////////////////////////

/** Returns proper helper object for given Object3D */
class HelperObject {

    fromObject(object) {
        let geometry = new THREE.SphereGeometry(2, 4, 2);
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

        let helper;
        if (object.isCamera) {
            helper = new THREE.CameraHelper(object);
        } else if (object.isPointLight) {
            helper = new THREE.PointLightHelper(object, 1);
        } else if (object.isDirectionalLight) {
            helper = new THREE.DirectionalLightHelper(object, 1);
        } else if (object.isSpotLight) {
            helper = new THREE.SpotLightHelper(object);
        } else if (object.isHemisphereLight) {
            helper = new THREE.HemisphereLightHelper(object, 1);
        } else if (object.isSkinnedMesh) {
            helper = new THREE.SkeletonHelper(object.skeleton.bones[0]);
        } else {
            // no helper for this object type
            return undefined;
        }

        const picker = new THREE.Mesh(geometry, material);
        picker.name = 'picker';
        picker.userData.object = object;
        helper.add(picker);

        return helper;
    }

}

export { HelperObject };
