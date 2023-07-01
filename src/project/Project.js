import { VERSION, WORLD_TYPES } from '../constants.js';

import { AssetManager } from './AssetManager.js';
import { Maths } from '../utils/Maths.js';
import { World3D } from './scene3d/World3D.js';

class Project {

    constructor(name = 'My Project') {

        // Prototype
        this.isProject = true;
        this.type = 'Project';

        // Members
        this.name = name;
        this.uuid = Maths.uuid();

        // Collections
        this.worlds = {};
    }

    /******************** WORLD */

    addWorld(world) {
        if (world && WORLD_TYPES[world.type]) {
            this.worlds[world.uuid] = world;
            if (this.activeWorldUUID == null) this.activeWorldUUID = world.uuid;
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

    getWorldByUUID(uuid) {
        return this.worlds[uuid];
    }

    getWorldByProperty(property, value) {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (world[property] === value) return world;
        }
    }

    /** Removes world, does not call 'dispose()' on World!! */
    removeWorld(world) {
        if (!world.isWorld) return;
        delete this.worlds[world.uuid];
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

    findEntityByUUID(uuid, searchAllWorlds = false) {
        const activeScene = (editor && editor.viewport) ? editor.viewport.scene : null;
        const sceneList = [];

        if (searchAllWorlds) {
            for (let uuid in this.worlds) {
                const world = this.worlds[uuid];
                sceneList.concat(Array.from(world.getScenes()));
            }

            // Put activeScene at front of sceneList
            if (activeScene) {
                const fromIndex = sceneList.indexOf(activeScene);
                if (fromIndex !== -1) {
                    sceneList.splice(fromIndex, 1);         // Remove activeScene from sceneList
                    sceneList.splice(0, 0, activeScene);    // Place at front
                }
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
        if (loadAssets) {
            AssetManager.fromJSON(json);
        }

        // Properties
        this.name = json.object.name;
        this.uuid = json.object.uuid;

        // Worlds
        for (let i = 0; i < json.worlds.length; i++) {
            switch (json.worlds[i].object.type) {
                case 'World3D':
                    const world = new World3D().fromJSON(json.worlds[i])
                    this.addWorld(world);
                    break;
            }
        }

        return this;
    }

    toJSON() {

        // Assets
        const meta = {};
        const json = AssetManager.toJSON(meta);

        // Meta Data
        json.metadata = {
            type: 'Onsight',
            version: VERSION,
            generator: 'Onsight.Project.toJSON',
        };

        // Project Properties
        json.object = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
        };

        // Worlds
        json.worlds = [];
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            json.worlds.push(world.toJSON());
        }

        return json;
    }

}

export { Project };
