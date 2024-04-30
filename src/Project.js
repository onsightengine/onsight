import { APP_ORIENTATION } from './constants.js';
import { WORLD_TYPES } from './constants.js';
import { VERSION } from './constants.js';

import { AssetManager } from './app/AssetManager.js';
import { Entity } from './worlds/Entity.js';
import { Uuid } from './utils/Uuid.js';

class Project {

    constructor(name = 'My Project') {

        // Prototype
        this.isProject = true;
        this.type = 'Project';

        // Properties
        this.name = name;
        this.uuid = Uuid.generate();

        // Properties, World
        this.activeWorldUUID = null;
        this.startWorldUUID = null;

        // Notes
        this.notes = '';

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
        if (typeof this.settings !== 'object') this.settings = {};
        switch (key) {
            case 'orientation': case 'orient': return this.settings.orientation ?? APP_ORIENTATION.PORTRAIT;
            case 'preload': case 'add': return this.settings.preload ?? 10;
            case 'unload': case 'remove': return this.settings.unload ?? 10;
        }
        return undefined;
    }

    /******************** WORLD */

    activeWorld() {
        // Try to return Active World
        let world = this.getWorldByUUID(this.activeWorldUUID);
        // Else try to return First World
        if (!world || !world.isWorld ) {
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
            console.error(`Project.addWorld(): Invalid world type '${world.type}'`, world);
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

    worldCount(type) {
        if (!type) return Object.keys(this.worlds).length;
        let count = 0;
        for (const key in this.worlds) {
            if (this.worlds[key].type === type) count++;
        }
        return count;
    }

    /******************** ENTITY */

    findEntityByUUID(uuid, searchAllWorlds = false) {
        const activeWorld = null; // OLD: get from editor, NEED store in project

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
        this.uuid = Uuid.generate();
        this.activeWorldUUID = null;
    }

    /******************** JSON */

    serialize() {
        const data = {};

        // Meta Data
        data.meta = {
            type: 'Salinity',
            version: VERSION,
            generator: 'Salinity.Project.serialize()',
        };

        // Assets
        data.assets = AssetManager.serialize();

        // Project Properties
        data.object = {
            type: this.type,
            name: this.name,
            uuid: this.uuid,
            activeWorldUUID: this.activeWorldUUID,
            startWorldUUID: this.startWorldUUID,
        };

        // Notes
        data.notes = this.notes;

        // Settings
        data.settings = structuredClone(this.settings);

        // Worlds
        data.worlds = [];
        for (const uuid in this.worlds) {
            const world = this.worlds[uuid];
            data.worlds.push(world.serialize());
        }

        return data;
    }

    parse(data, loadAssets = true) {
        // Check proper JSON type
        const type = data.meta?.type ?? 'undefined';
        if (type !== 'Salinity') {
            console.error(`Project.parse(): Unknown project type '${type}', expected 'Salinity'`);
            return;
        }

        // Check project saved with version
        const version = data.meta?.version ?? 'unknown';
        if (version !== VERSION) {
            console.warn(`Project.parse(): Project saved in 'v${metaVersion}', attempting to load with 'v${VERSION}'`);
        }

        // Check object type
        if (!data.object || data.object.type !== this.type) {
            console.error(`Project.parse(): Save file corrupt, no 'Project' object found!`);
            return;
        }

        // Clear Project
        this.clear();

        // Load Assets into AssetManager
        if (loadAssets) {
            AssetManager.parse(data.assets);
        }

        // Properties
        this.name = data.object.name;
        this.uuid = data.object.uuid;
        this.activeWorldUUID = data.object.activeWorldUUID;
        this.startWorldUUID = data.object.startWorldUUID;

        // Notes
        this.notes = data.notes;

        // Settings
        this.settings = structuredClone(data.settings);

        // Worlds
        for (const worldData of data.worlds) {
            const Constructor = Entity.type(worldData.type);
            if (Constructor) {
                const world = new Constructor().parse(worldData);
                this.addWorld(world);
            } else {
                console.warn(`Project.parse: Unknown world type '${worldData.type}'`);
            }
        }

        return this;
    }

}

export { Project };
