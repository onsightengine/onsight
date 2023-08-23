import { APP_ORIENTATION } from '../constants.js';
import { VERSION, WORLD_TYPES } from '../constants.js';

import { AssetManager } from '../app/AssetManager.js';
import { Maths } from '../utils/Maths.js';
import { World3D } from './world3d/World3D.js';

class Project {

    constructor(name = 'My Project') {

        // Prototype
        this.isProject = true;
        this.type = 'Project';

        // Properties
        this.name = name;
        this.uuid = Maths.uuid();

        // Properties, World
        this.activeWorldUUID = null;

        // Settings
        this.settings = {
            orientation: APP_ORIENTATION.PORTRAIT,
            preload: 10,
            unload: 10,
        };

        // Worlds
        this.worlds = {};
    }

    /******************** SETTINGS */

    setting(key) {
        if (typeof this.settings === 'object') this.settings = {};
        switch (key) {
            case 'orientation': case 'orient': return this.settings.orientation ?? APP_ORIENTATION.PORTRAIT;
            case 'preload': case 'add': return this.settings.preload ?? 10;
            case 'unload': case 'remove': return this.settings.unload ?? 10;
        }
        return undefined;
    }

    /******************** WORLD */

    activeWorld() {
        // Active World?
        let world = this.getWorldByUUID(this.activeWorldUUID);

        // First World?
        if (!world || !world.isWorld) {
            const worldUUIDs = Object.keys(this.worlds);
            if (worldUUIDs.length > 0) world = this.worlds[worldUUIDs[0]];
        }
        return world;
    }

    setActiveWorld(world) {
        if (!world || !world.isWorld) return this;
        if (this.worlds[world.uuid]) this.activeWorldUUID = world.uuid;
        return this;
    }

    addWorld(world) {
        if (!world || !world.isWorld) return this;
        if (WORLD_TYPES[world.type]) {
            this.worlds[world.uuid] = world;
            if (this.activeWorldUUID == null) this.activeWorldUUID = world.uuid;
        } else {
            console.error(`Project.addWorld: World type (${world.type}) not a valid world type`, world);
        }
        return this;
    }

    getWorldByName(name) {
        return this.getWorldByProperty('name', name);
    }

    getWorldByUUID(uuid) {
        if (!uuid) return undefined;
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
        if (!world || !world.isWorld) return;
        delete this.worlds[world.uuid];
    }

    traverseWorlds(callback, recursive = true) {
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            if (typeof callback === 'function') callback(world);
            if (recursive) world.traverseStages(callback, recursive);
        }
    }

    worldCount() {
        return Object.keys(this.worlds).length;
    }

    /******************** ENTITY */

    findEntityByUUID(uuid, searchAllWorlds = false) {
        const activeWorld = editor.viewport.world;

        let worldList = [];
        if (searchAllWorlds) worldList = [...this.worlds];
        else if (activeWorld) worldList = [ activeWorld ];

        for (const world of worldList) {
            if (uuid && world.uuid && uuid === world.uuid) return world;
            const entity = world.getEntityByProperty('uuid', uuid);
            if (entity) return entity;
        }

        return undefined;
    }

    /******************** CLEAR */

    clear() {
        // Remove Worlds
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            this.removeWorld(world);
            if (typeof world.dispose === 'function') world.dispose();
        }

        // Reset Properties
        this.name = 'My Project';
        this.uuid = Maths.uuid();
        this.activeWorldUUID = null;
    }

    /******************** JSON */

    fromJSON(json, loadAssets = true, onLoad = () => {}) {
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
            AssetManager.fromJSON(json, onLoad);
        }

        // Properties
        this.name = json.object.name;
        this.uuid = json.object.uuid;
        this.activeWorldUUID = json.object.activeWorldUUID;

        // Settings
        this.settings = structuredClone(json.settings);

        // Worlds
        for (const worldData of json.worlds) {
            let world = undefined;
            switch (worldData.object.type) {
                case 'World3D': world = new World3D().fromJSON(worldData); break;
            }
            if (world && world.isWorld) this.addWorld(world);
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
            activeWorldUUID: this.activeWorldUUID,
        };

        // Settings
        json.settings = structuredClone(this.settings);

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
