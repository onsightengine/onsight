import * as THREE from 'three';
import { Entity3D } from './Entity3D.js';
import { Scene3D } from './Scene3D.js';

class World3D extends Entity3D {

    constructor(name = 'World 1') {
        super(name);

        // Prototype
        this.isWorld = true;
        this.isWorld3D = true;
        this.type = 'World3D';

        // Properties, THREE.Scene
        this.background = null;
        this.environment = null;
        this.fog = null;
        this.backgroundBlurriness = 0;
		this.backgroundIntensity = 1;
        this.overrideMaterial = null;

        // Properties, Nodes
        this.xPos = 0;
        this.yPos = 0;

        // Properties, Scene
        this.activeSceneUUID = undefined;
    }

    /******************** CHILDREN (SCENES) */

    activeScene() {
        return this.getSceneByUUID(this.activeSceneUUID);
    }

    setActiveScene(scene) {
        if (scene && scene.uuid) {
            this.activeSceneUUID = scene.uuid;
        }
    }

    addEntity(entity, index = -1) {
        return this.addScene(entity, index);
    }

    addScene(scene, index = -1) {
        if (!scene || !scene.isScene3D) return this;
        if (index === undefined || index === null) index = -1;

        // Check if already a child
        if (this.children.indexOf(scene) !== -1) return this;

        // Add Scene
        if (this.getScenes().length === 0) this.setActiveScene(scene);
        this.add(scene);

        // Preserve desired index
        if (index !== -1) {
            this.children.splice(index, 0, scene);
            this.children.pop();
        }

        return this;
    }

    getFirstScene() {
        if (this.children.length > 0) return this.children[0];
    }

    getScenes() {
        const filteredChildren = [];
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].isScene) filteredChildren.push(children[i]);
        }
        return filteredChildren;
    }

    getSceneById(id) {
        const scene = this.getEntityByProperty('id', id);
        if (scene && scene.isScene) return scene;
    }

    getSceneByName(name) {
        const scene = this.getEntityByProperty('name', name);
        if (scene && scene.isScene) return scene;
    }

    getSceneByUUID(uuid) {
        const scene = this.getEntityByProperty('uuid', uuid);
        if (scene && scene.isScene) return scene;
    }

    getSceneByProperty(property, value) {
        const scenes = this.getScenes();
        for (let i = 0, l = scenes.length; i < l; i++) {
            const scene = scenes[i];
            if (scene[property] === value) return scene;
        }
    }

    removeEntity(entity) {
        return this.removeScene(entity);
    }

    /** Removes scene, does not call 'dispose()' on Scene!! */
    removeScene(scene) {
        if (!scene || !scene.isScene) return;

        // Remove scene (out of World, and Project)
        this.remove(scene);
    }

    traverseScenes(callback, recursive = true) {
        if (typeof callback === 'function') callback(this);

        if (recursive) {
            const scenes = this.getScenes();
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                scene.traverseEntities(callback, recursive);
            }
        }
    }

    /******************** COPY */

    copyEntity(source, recursive = true) {
        // Entity3D.copy()
        super.copyEntity(source, recursive);

        // THREE.Scene Properties
        if (source.background !== null) this.background = source.background.clone();
		if (source.environment !== null) this.environment = source.environment.clone();
		if (source.fog !== null) this.fog = source.fog.clone();
		this.backgroundBlurriness = source.backgroundBlurriness;
		this.backgroundIntensity = source.backgroundIntensity;
		if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();

        // World3D Properties
        this.xPos = source.xPos;
        this.yPos = source.yPos;
        // this.activeSceneUUID???

        return this;
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // Entity3D Properties
        super.fromJSON(json);

        // THREE.Scene Properties
        if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
                this.background = new THREE.Color(data.background);
            } else {
                const backgroundTexture = AssetManager.getAsset(data.background);
                if (backgroundTexture && backgroundTexture.isTexture) this.background = backgroundTexture;
            }
        }
        if (data.environment !== undefined) {
            const environmentTexture = AssetManager.getAsset(data.background);
            if (environmentTexture && environmentTexture.isTexture) this.environment = environmentTexture;
        }
        if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
                this.fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
                this.fog = new THREE.FogExp2(data.fog.color, data.fog.density);
            }
        }

        // World3D Properties
        if (data.xPos !== undefined) this.xPos = data.xPos;
        if (data.yPos !== undefined) this.yPos = data.yPos;
        if (data.activeSceneUUID !== undefined) this.activeSceneUUID = data.activeSceneUUID;

        return this;
    }

    loadChildren(json) {
        if (!json || !json.object || !json.object.entities) return;
        for (let i = 0; i < json.object.entities.length; i++) {
            const entityJSON = json.object.entities[i];
            let entity = undefined;
            if (entityJSON.object.type === 'Scene3D') {
                entity = new Scene3D().fromJSON(entityJSON);
            } else if (entityJSON.object.type === 'Entity3D') {
                entity = new Entity3D().fromJSON(entityJSON);
            }
            if (entity) this.add(entity);
        }
    }

    toJSON() {
        // Entity3D Properties
        const json = super.toJSON();

        // THREE.Scene Properties
        if (this.fog) json.object.fog = this.fog.toJSON();
        if (this.backgroundBlurriness > 0) json.object.backgroundBlurriness = this.backgroundBlurriness;
		if (this.backgroundIntensity !== 1) json.object.backgroundIntensity = this.backgroundIntensity;

        // World3D Properties
        json.object.xPos = this.xPos;
        json.object.yPos = this.yPos;
        json.object.activeSceneUUID = this.activeSceneUUID;

        return json;
    }

}

export { World3D };
