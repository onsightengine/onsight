import { VERSION, WORLD_TYPES } from '../constants.js';

import { AssetManager } from './AssetManager.js';
import { Maths } from '../utils/Maths.js';
import { World3D } from './scene3d/World3D.js';

class Project {

    constructor(name = 'My Project') {

        // Prototype
        this.isProject = true;

        // Members
        this.name = name;
        this.uuid = Maths.uuid();
        this.type = 'Project';

        // Collections
        this.scripts = {};
        this.worlds = {};

    }

    /******************** WORLD */

    addWorld(world) {
        if (world && WORLD_TYPES[world.type]) {
            this.worlds[world.uuid] = world;
            if (this.activeWorldUuid == null) this.activeWorldUuid = world.uuid;
        } else {
            console.error(`Project.addWorld: World type (${world.type}) not a valid world type`, world);
        }

        return this;
    }

    getFirstWorld() {
        const worldList = Object.keys(this.worlds);
        return (worldList.length > 0) ? this.worlds[worldList[0]] : null;
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

    removeWorld(world) {
        if (!world.isWorld) return;

        // Clear Scenes
        const scenes = world.getScenes();
        for (let i = scenes.length - 1; i >= 0; i--) {
            world.removeScene(scenes[i]);
        }
    }

    traverseWorlds(callback, recursive = true) {
        for (let uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (typeof callback === 'function') callback(world);
            if (recursive) world.traverseScenes(callback, recursive);
        }
    }

    worldCount() {
        return Object.keys(this.worlds).length;
    }

    /******************** ENTITY */

    findEntityByUuid(uuid, searchAllScenes = false) {
        let sceneList = [];
        let activeScene = null;
        if (window.editor) activeScene = window.editor.viewport.scene;

        if (searchAllScenes) {
            for (let uuid in this.worlds) {
                const world = this.worlds[uuid];
                sceneList.concat(Array.from(world.getScenes()));
            }

            // Put activeScene at front of sceneList
            const fromIndex = sceneList.indexOf(activeScene);
            const toIndex = 0;
            if (activeScene && fromIndex !== -1) {
                sceneList.splice(fromIndex, 1);                 // Remove activeScene from sceneList
                sceneList.splice(toIndex, 0, activeScene);      // Place at front
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

    /******************** SCRIPT */

    addScript(entity, script) {
        const key = entity.uuid;
        if (!this.scripts[key]) this.scripts[key] = [];
        this.scripts[key].push(script);
        return this;
    }

    removeScript(entity, script) {
        const key = entity.uuid;
        if (!this.scripts[key]) return;
        const index = this.scripts[key].indexOf(script);
        if (index !== -1) this.scripts[key].splice(index, 1);
    }

    /******************** CLEAR */

    clear() {

        // Remove Worlds
        const worldIds = Object.keys(this.worlds);
        for (let i = 0; i < worldIds.length; i++) {
            const world = this.worlds[worldIds[i]]
            this.removeWorld(world);
        }

        // Reset Properties
        this.name = 'My Project';
        this.uuid = Maths.uuid();

    }

    /******************** JSON */

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
        if (!json.object || json.object.type !== this.type) {
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

        return this;
    }

    toJSON() {

        // Assets
        const meta = {};
        const json = AssetManager.toJSON(meta);

        // Project Properties
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
        json.worlds = [];

        // Add Worlds
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            json.worlds.push(world.toJSON());
        }

        return json;
    }

}

export { Project };
