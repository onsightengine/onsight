import * as THREE from 'three';
import { Entity3D } from './Entity3D.js';

class World3D extends Entity3D {

    constructor(name = 'World 1') {
        super();

        // Prototype
        this.isWorld = true;
        this.isWorld3D = true;

        // Properties, Basic
        this.name = name;
        this.type = 'World3D';
    }

    /******************** CHILDREN (SCENES) */

    addEntity(entity, index = -1) {
        return this.addScene(entity, index);
    }

    addScene(scene, index = -1) {
        if (!scene || !scene.isScene3D) return this;
        if (index === undefined || index === null) index = -1;

        // Check if already a child
        if (this.children.indexOf(scene) !== -1) return this;

        // Add Scene
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

    getSceneByUuid(uuid) {
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

    /******************** JSON */

    fromJSON(json) {
        const data = json.object;

        // World Properties

        // TODO

        // Entity3D Properties
        super.fromJSON(json);

        return this;
    }

    toJSON() {
        // Start with Entity3D JSON
        const json = super.toJSON();

        // World properties

        // TODO

        return json;
    }

}

export { World3D };
