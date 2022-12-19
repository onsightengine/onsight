/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/

import * as THREE from 'three';

import { VERSION, SCENE_TYPES, WORLD_TYPES } from '../constants.js';

import { Scene3D } from './scene3d/Scene3D.js';
import { World3D } from './scene3d/World3D.js';

import { AssetManager } from './AssetManager.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Onsight Project
/////////////////////////////////////////////////////////////////////////////////////

class Project {

    constructor(name = 'My Project') {

        // Prototype
        this.isProject = true;

        // Members
        this.name = name;
        this.uuid = crypto.randomUUID();
        this.type = 'Project';

        // Collections
        this.scripts = {};
        this.scenes = {};
        this.worlds = {};

    } // end ctor

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Worlds
    ////////////////////

    addWorld(world) {
        if (world && WORLD_TYPES[world.type]) {
            this.worlds[world.uuid] = world;
            if (this.activeWorldUuid == null) this.activeWorldUuid = world.uuid;
        } else {
            console.error(`Project.addWorld: World type (${world.type}) not a valid world type`, world);
        }

        return this;
    }

    getWorldByName(name) {
        return this.getWorldByProperty('name', name);
    }

    getWorldByUuid(uuid) {
        return this.worlds[uuid];
    }

    getWorldByProperty(property, value) {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (world[property] === value) return world;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Scenes
    ////////////////////

    addScene(scene) {
        if (scene && SCENE_TYPES[scene.type]) {
            if (this.scenes[scene.uuid]) {
                console.warn(`Project.addScene: Scene ('${scene.name}') already added`, scene);
            } else {
                this.scenes[scene.uuid] = scene;
            }
        } else {
            console.error(`Project.addScene: Scene type (${scene.type}) not a valid scene type`, scene);
        }

        return this;
    }

    getFirstScene() {
        const sceneList = Object.keys(this.scenes);
        return (sceneList.length > 0) ? this.scenes[sceneList[0]] : null;
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

    removeScene(scene) {
        if (scene.isScene !== true) return;

        // Clear Entities
        const entities = scene.getEntities();
        for (let i = entities.length - 1; i >= 0; i--) {
            scene.removeEntity(entities[i], true);
            entities[i].dispose();
        }

        // Remove from 'scenes'
        delete this.scenes[scene.uuid];
    }

    traverseScenes(callback) {
        for (let uuid in this.scenes) {
            const scene = this.scenes[uuid];
            scene.traverseEntities(callback);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Entities
    ////////////////////

    findEntityByUuid(uuid, searchAllScenes = false) {
        let sceneList = [];
        let activeScene = null;
        if (window.editor) activeScene = window.editor.viewport.scene;

        if (searchAllScenes) {
            sceneList = Array.from(this.scenes);

            // Put activeScene at front of sceneList
            const fromIndex = sceneList.indexOf(activeScene);
            const toIndex = 0;
            if (activeScene && fromIndex !== -1) {
                arr.splice(fromIndex, 1);						// Remove activeScene from sceneList
                arr.splice(toIndex, 0, activeScene);			// Place at front
            }
        } else if (activeScene) {
            sceneList.push(activeScene);
        }

        for (let i = 0; i < sceneList.length; i++) {
            const entity = sceneList[i].getEntityByProperty('uuid', uuid);
            if (entity) return entity;
        }

        return undefined;
    }

    //////////////////// Scripts

    addScript(entity, script) {
        const key = entity.uuid;
        if (! this.scripts[key]) this.scripts[key] = [];
        this.scripts[key].push(script);
        return this;
    }

    removeScript(entity, script) {
        const key = entity.uuid;
        if (! this.scripts[key]) return;
        const index = this.scripts[key].indexOf(script);
        if (index !== -1) this.scripts[key].splice(index, 1);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Clear
    ////////////////////

    clear() {

        // Remove Scenes
        const sceneIds = Object.keys(this.scenes);
        for (let i = 0; i < sceneIds.length; i++) {
            let scene = this.scenes[sceneIds[i]]
            this.removeScene(scene);
        }

        // Reset Properties
        this.name = 'My Project';
        this.uuid = crypto.randomUUID();

    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   JSON
    ////////////////////

    fromJSON(json, loadAssets = true) {

        // Check proper JSON type
        const metaType = (json.metadata) ? json.metadata.type : 'Undefined';
        if (metaType !== 'Onsight') {
            console.error(`Project.fromJSON: Unknown project type ('${metaType}'), expected 'Onsight'`);
            return;
        }

        // Check project saved with version
        const metaVersion = json.metadata.version;
        if (metaVersion !== VERSION) {
            console.warn(`Project.fromJSON: Project saved in 'v${metaVersion}', attempting to load with 'v${VERSION}'`);
        }

        // Check object type
        if (! json.object || json.object.type !== this.type) {
            console.error(`Project.fromJSON: Save file corrupt, no 'Project' object found!`);
            return;
        }

        // Clear Project
        this.clear();

        // Load Assets into AssetManager
        if (loadAssets) AssetManager.fromJSON(json);

        // Properties
        this.name = json.object.name;
        this.uuid = json.object.uuid;

        // Scripts
        this.scripts = json.scripts;

        // Worlds
        for (let i = 0; i < json.worlds.length; i++) {
            switch (json.worlds[i].object.type) {
                case 'World3D': this.addWorld(new World3D().fromJSON(json.worlds[i])); break;
            }
        }

        // Scenes
        for (let i = 0; i < json.scenes.length; i++) {
            switch (json.scenes[i].object.type) {
                case 'Scene3D': this.addScene(new Scene3D().fromJSON(json.scenes[i])); break;
            }
        }

        return this;
    }

    toJSON() {

        ///// Assets

        const meta = {};

        const json = AssetManager.toJSON(meta);

        ///// Project Properties

        json.metadata = {
            type: 'Onsight',
            version: VERSION,
            generator: 'Onsight.Project.toJSON',
        };
        json.object = {
            name: this.name,
            type: this.type,
            uuid: this.uuid,
        };
        json.scripts = this.scripts;
        json.scenes = [];
        json.worlds = [];

        // Add Worlds
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            json.worlds.push(world.toJSON());
        }

        // Add Scenes
        for (const uuid in this.scenes) {
            const scene = this.scenes[uuid];
            json.scenes.push(scene.toJSON());
        }

        return json;
    }

}

/////////////////////////////////////////////////////////////////////////////////////
/////   Exports
/////////////////////////////////////////////////////////////////////////////////////

export { Project };