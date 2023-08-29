import * as THREE from 'three';
import { Entity3D } from './Entity3D.js';
import { ObjectUtils } from '../../utils/three/ObjectUtils.js';

// LIGHT       SHADOW      DESCRIPTION
// Ambient     -           Globally illuminates all objects in the scene equally
// Directional YES         Light whose rays are parallel and emitted in a specific direction (Sun)
// Hemisphere  -           Light above the scene, with color fading from sky color to ground color
// Point       YES, SLOW   Light emitted from a single point in all directions (Lightbulb)
// Rectangle   -           Emits light uniformly across the face a rectangular plane (Window, Strip Light)
// Spot        YES         Light gets emitted from a single point in one direction, along a cone

// TYPES
// 'AmbientLight'
// 'DirectionalLight'
// 'HemisphereLight'
// 'PointLight'
// 'SpotLight'
// FUTURE: 'RectAreaLight'

// USAGE
// 'Sky' - Hemisphere light
// 'Sun' - Directional light

const _directional = new THREE.DirectionalLight();
const _point = new THREE.PointLight();
const _spot = new THREE.SpotLight();

const _loader = new THREE.ObjectLoader();
const _matrix = new THREE.Matrix4();

class Light3D extends Entity3D {

    constructor({
        name,
        type = 'AmbientLight',
        color = 0xffffff,
        intensity,
        // hemi
        skyColor = 0x80ffff,
        groundColor = 0x806040,
        // point
        distance = 0,
        decay = 2,
        // spot
        angle = Math.PI / 3, /* 60 degrees */
        penumbra = 0,
    } = {}) {
        super(name ?? 'Light');
        this.castShadow = false;                // disable shadows by default, inherited from THREE.Object3D
        this.receiveShadow = false;             // disable shadows by default, inherited from THREE.Object3D

        // Validate Type
        type = Light3D.validateType(type);

        // Prototype
        this.isLight = true;
        this.isLight3D = true;
        this.type = 'Light3D';

        // THREE.Light Properties
        this.color = new THREE.Color((type === 'HemisphereLight') ? skyColor : color);

        this.position.copy(THREE.Object3D.DEFAULT_UP);
        this.shadow = undefined;
        this.target = new THREE.Object3D();

        // THREE.HemisphereLight Properties
        this.groundColor = new THREE.Color(groundColor);
        this.intensity = isNaN(intensity) ? Light3D.defaultIntensity(type) : intensity;

        // THREE.PointLight Properties
        this.distance = distance;
		this.decay = decay;

        // THREE.SpotLight Properties
        this.angle = angle;
		this.penumbra = penumbra;
        this.map = null;

        // Init Type
        this.changeType(type, false /* returnNewLight */); /* initial set of 'this.type' */
        this.updateMatrix();
    }

    /******************** TYPE */

    changeType(type, returnsNewLight = true) {
        const oldType = this.type;

        // Validate Type
        type = Light3D.validateType(type);
        this.type = type;

        // Prototype
        this.isAmbientLight = (this.type === 'AmbientLight');
        this.isDirectionalLight = (this.type === 'DirectionalLight');
        this.isHemisphereLight = (this.type === 'HemisphereLight');
        this.isPointLight = (this.type === 'PointLight');
        this.isSpotLight = (this.type === 'SpotLight');

        // Old Shadow
        let oldShadow = undefined;
        switch (this.type) {
            case 'DirectionalLight':
            case 'PointLight':
            case 'SpotLight':
                oldShadow = this.shadow;
                this.castShadow = true;
                break;
            default:
                this.castShadow = false;
        }
        this.shadow = undefined;

        // Return New Light (for new Object3D.id)?
        let light = this;
        if (returnsNewLight) {
            light = new this.constructor().copyEntity(this, true /* recursive */);
            light.uuid = this.uuid;
        }
        light.intensity = Light3D.mapIntensity(light.intensity, oldType, light.type);

        // New Shadow
        switch (this.type) {
            case 'DirectionalLight': light.shadow = new _directional.shadow.constructor(); break;
            case 'PointLight': light.shadow = new _point.shadow.constructor(); break;
            case 'SpotLight': light.shadow = new _spot.shadow.constructor(); break;
        }

        // SHADOW CAMERA
        // DirectionalLight     new OrthographicCamera(-5, 5, 5, -5, 0.5, 500)
        // PointLight           new PerspectiveCamera(90, 1, 0.5, 500)
        // SpotLight            new PerspectiveCamera(50, 1, 0.5, 500)
        if (light.shadow) {
            light.shadow.mapSize.width = 2048;      // default: 512
            light.shadow.mapSize.height = 2048;     // default: 512
            if (light.shadow.camera.isOthographicCamera) {
                light.shadow.camera.left = -10;
                light.shadow.camera.right = 10;
                light.shadow.camera.top = 10;
                light.shadow.camera.bottom = -10;
                light.shadow.camera.near = -500;
                light.shadow.camera.far = 500;
            }
            light.shadow.camera.updateProjectionMatrix();
        }

        // Copy Old Shadow Data
        if (oldShadow) {
            light.shadow.copy(oldShadow);
            ObjectUtils.clearObject(oldShadow);
        }

        // Return
        return light;
    }

    static defaultIntensity(type) {
        type = Light3D.validateType(type);
        switch (type) {
            case 'AmbientLight': return 1.5;
            case 'DirectionalLight': return 1.5;
            case 'HemisphereLight': return 3.0;
            case 'PointLight': return 10;
            case 'SpotLight': return 10;
        }
    }

    static mapIntensity(intensity, oldType, newType) {
        if (isNaN(intensity)) return intensity;
        switch (oldType) {
            case 'AmbientLight':
            case 'HemisphereLight':
                if (newType === 'DirectionalLight') return intensity * 2;
                if (newType === 'PointLight' || newType === 'SpotLight') return intensity * 6.6666666;
                break;
            case 'HemisphereLight':
                if (newType === 'AmbientLight' || newType === 'HemisphereLight') return intensity / 2;
                if (newType === 'PointLight' || newType === 'SpotLight') return intensity * 3.3333333;
                break;
            case 'PointLight':
            case 'SpotLight':
                if (newType === 'AmbientLight' || newType === 'HemisphereLight') return intensity / 6.6666666;
                if (newType === 'DirectionalLight') return intensity / 3.3333333;
        }
        return intensity;
    }

    static validateType(type) {
        switch (type) {
            case 'AmbientLight':
            case 'DirectionalLight':
            case 'HemisphereLight':
            case 'PointLight':
            case 'SpotLight': return type;
            default: return 'AmbientLight';
        }
    }

    /******************** POINT / SPOT POWER */

    // https://github.com/mrdoob/three.js/blob/master/src/lights/PointLight.js
    // https://github.com/mrdoob/three.js/blob/master/src/lights/SpotLight.js

    get power() {
		switch (this.type) {
            case 'PointLight': return this.intensity * 4 * Math.PI;
            case 'SpotLight': return this.intensity * Math.PI;
        }
		return this.intensity;
	}

	set power(power) {
		switch (this.type) {
            case 'PointLight': this.intensity = power / ( 4 * Math.PI ); return;
            case 'SpotLight': this.intensity = power / Math.PI; return;
        }
        this.intensity = power;
        return;
	}

    /******************** COPY / CLONE */

    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {
        // Entity3D.copy()
        super.copy(source, recursive);

        // Light3D Type
        this.changeType(source.type, false /* returnNewLight */);

        // THREE.Light Properties
        this.color.copy(source.color);
        this.intensity = source.intensity;

        // THREE.AmbientLight Properties
        // ... EMPTY

        // THREE.DirectionalLight Properties
        if (source.target !== undefined) {
            if (this.target) ObjectUtils.clearObject(this.target);
            this.target = source.target.clone();
        }

        // THREE.HemisphereLight Properties
        if (source.groundColor !== undefined) this.groundColor.copy(source.groundColor);

        // THREE.PointLight Properties
        if (source.distance !== undefined) this.distance = source.distance;
        if (source.decay !== undefined) this.decay = source.decay;

        // THREE.SpotLight Properties
        if (source.angle !== undefined) this.angle = source.angle;
        if (source.penumbra !== undefined) this.penumbra = source.penumbra;

        // THREE.LightShadow
        if (source.shadow !== undefined) {
            if (this.shadow) ObjectUtils.clearObject(this.shadow);
            this.shadow = source.shadow.clone();
        }

        return this;
    }

    cloneEntity(recursive = true) {
        return new this.constructor().copyEntity(this, recursive);
    }

    copyEntity(source, recursive = true) {
        // Entity3D.copyEntity()
        super.copyEntity(source, recursive);

        return this;
    }

    /******************** DISPOSE */

    dispose() {
        // THREE.DirectionalLight Dispose
        if (this.shadow) ObjectUtils.clearObject(this.shadow);
        if (this.target) ObjectUtils.clearObject(this.target);

        // Entity3D.dispose()
        super.dispose();
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Entity3D Properties
        super.fromJSON(json, this);

        // Light3D Type
        if (data.lightType !== undefined) {
            this.type = data.lightType;
            this.changeType(this.type, false /* returnNewLight */);
        }

        // THREE.Light Properties
        if (data.color !== undefined) this.color.set(data.color);
        if (data.intensity !== undefined) this.intensity = data.intensity;

        // THREE.AmbientLight Properties
        // ... EMPTY

        // THREE.DirectionalLight Properties
        if (data.target !== undefined) this.target.applyMatrix4(_matrix.fromArray(data.target));

        // THREE.HemisphereLight Properties
        if (data.groundColor !== undefined) this.groundColor.set(data.groundColor);

        // THREE.PointLight Properties
        if (data.distance !== undefined) this.distance = data.distance;
        if (data.decay !== undefined) this.decay = data.decay;

        // THREE.SpotLight Properties
        if (data.angle !== undefined) this.angle = data.angle;
        if (data.penumbra !== undefined) this.penumbra = data.penumbra;

        // THREE.LightShadow
        if (data.shadow !== undefined && this.shadow !== undefined) {
            if (data.shadow.bias !== undefined) this.shadow.bias = data.shadow.bias;
            if (data.shadow.normalBias !== undefined) this.shadow.normalBias = data.shadow.normalBias;
            if (data.shadow.radius !== undefined) this.shadow.radius = data.shadow.radius;
            if (data.shadow.mapSize !== undefined) this.shadow.mapSize.fromArray(data.shadow.mapSize);
            if (data.shadow.camera !== undefined) this.shadow.camera = _loader.parseObject(data.shadow.camera);
        }

        return this;
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // Light3D Type
        json.object.lightType = this.type;
        json.object.type = 'Light3D';

        // THREE.Light Properties
        json.object.color = this.color.getHex();
        json.object.intensity = this.intensity;

        // THREE.AmbientLight Properties
        // ... EMPTY

        // THREE.DirectionalLight Properties
        if (this.target !== undefined) json.object.target = this.target.matrix.toArray();

        // THREE.HemisphereLight Properties
        if (this.groundColor !== undefined) json.object.groundColor = this.groundColor.getHex();

        // THREE.PointLight Properties
        if (this.distance !== undefined) json.object.distance = this.distance;
        if (this.decay !== undefined) json.object.decay = this.decay;

        // THREE.SpotLight Properties
        if (this.angle !== undefined) json.object.angle = this.angle;
        if (this.penumbra !== undefined) json.object.penumbra = this.penumbra;

        // THREE.LightShadow
        if (this.shadow !== undefined) json.object.shadow = this.shadow.toJSON();

        return json;
    }

}

export { Light3D };
