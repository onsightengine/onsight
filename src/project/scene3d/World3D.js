import { Maths } from '../../utils/Maths.js';
import { Scene3D } from './Scene3D.js';

/** Holds a collection of scenes */
class World3D {

    constructor(name = 'World 1') {

        // Prototype
        this.isWorld = true;
        this.isWorld3D = true;

        // Properties, Basic
        this.name = name;
        this.type = 'World3D';
        this.uuid = Maths.uuid();

        // Properties, More
        this.order = [];

        // Collections
        this.scenes = {};

    }

    /******************** SCENE */

    addScene(scene, index = -1) {
        if (scene && scene.type === 'Scene3D') {
            if (this.scenes[scene.uuid]) {
                console.warn(`World3D.addScene: Scene ('${scene.name}') already added`, scene);
            } else {
                scene.world = this;
                this.scenes[scene.uuid] = scene;
                if (index < 0) {
                    this.order.push(scene.uuid);
                } else {
                    if (index > this.order.length) index = this.order.length;
                    this.order.splice(index, 0, scene.uuid);
                }
            }
        } else {
            console.error(`'World3D.addScene: Scene not of type 'Scene3D'`, scene);
        }

        return this;
    }

    getFirstScene() {
        const sceneList = Object.keys(this.scenes);
        return (sceneList.length > 0) ? this.scenes[sceneList[0]] : null;
    }

    getScenes() {
        return this.scenes;
    }

    getSceneByName(name) {
        return this.getSceneByProperty('name', name);
    }

    getSceneByUuid(uuid) {
        return this.scenes[uuid];
    }

    getSceneByProperty(property, value) {
        for (const uuid in this.scenes) {
            const scene = this.scenes[uuid];
            if (scene[property] === value) return scene;
        }
    }

    orderScene(sceneUuid, newIndex = -1) {
        if (sceneUuid.isScene) sceneUuid = sceneUuid.uuid;
        const fromIndex = this.order.indexOf(sceneUuid);
        if (fromIndex < 0) return;
        if (newIndex < 0) newIndex = 0;
        if (newIndex > this.order.length - 1) newIndex = this.order.length - 1;
        this.order.splice(fromIndex, 1);
        this.order.splice(newIndex, 0, sceneUuid);
    }

    removeScene(scene) {
        if (!scene.isScene) return;

        // Clear Entities
        const entities = scene.getEntities();
        for (let i = entities.length - 1; i >= 0; i--) {
            scene.removeEntity(entities[i], true);
            entities[i].dispose();
        }

        // Remove from 'scenes'
        scene.dispose();
        this.order.splice(this.order.indexOf(scene.uuid), 1);
        delete this.scenes[scene.uuid];
    }

    traverseScenes(callback, recursive = true) {
        for (let uuid in this.scenes) {
            const scene = this.scenes[uuid];
            if (typeof callback === 'function') callback(scene);
            if (recursive) scene.traverseEntities(callback);
        }
    }

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        this.name = data.name;
        this.uuid = data.uuid;
        this.order = JSON.parse(data.order);

        // Scenes
        for (let i = 0; i < json.scenes.length; i++) {
            switch (json.scenes[i].object.type) {
                case 'Scene3D': this.addScene(new Scene3D().fromJSON(json.scenes[i])); break;
            }
        }

        return this;
    }

    toJSON() {
        const json = {
            object: {
                name: this.name,
                type: this.type,
                uuid: this.uuid,
                order: JSON.stringify(this.order),
            }
        };

        // Scenes
        for (const uuid in this.scenes) {
            const scene = this.scenes[uuid];
            json.scenes.push(scene.toJSON());
        }

        return json;
    }

}

export { World3D };
