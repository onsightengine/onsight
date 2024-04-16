class Entity {

    constructor(name = 'Entity') {
        // Prototype
        this.name = name;
        this.isEntity = true;
        this.type = 'Entity';

        // Properties, Basic
        this.locked = false;                    // locked in Editor (do not allow selection, deletion, duplication, etc.)

        // Properties, Prefab
        this.category = null;                   // used for organizing

        // Collections
        this.components = [];                   // geometry, material, audio, light, etc.
    }

}

export { Entity };
