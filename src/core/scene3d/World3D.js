/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/

class World3D {

    constructor(name = 'World 1') {

        // Prototype
        this.isWorld = true;
        this.isWorld3D = true;

        // Properties, Basic
        this.name = name;
        this.type = 'World3D';
        this.uuid = crypto.randomUUID();

        // Properties, More
        this.order = 0;
        this.startScene = null;
        this.lastEditorScene = null;

        // Collections
        this.sceneNodes = {};

    } // end ctor

    //////////////////// Scenes

    addScene(scene) {
        if (scene && scene.type === 'Scene3D') {
            if (this.sceneNodes[scene.uuid]) {
                console.warn(`World3D.addScene: Scene ('${scene.name}') already added`, scene);
            } else {
                this.sceneNodes[scene.uuid] = {
                    uuid: scene.uuid,
                    order: this.order ++,
                };
                if (! this.startScene) this.startScene = scene.uuid;
                if (! this.lastEditorScene) this.lastEditorScene = scene.uuid;
            }
        } else {
            console.error(`'World3D.addScene: Scene not of type 'Scene3D'`, scene);
        }
        return this;
    }

    //////////////////// JSON

    fromJSON(json) {
        const data = json.object;

        this.name = data.name;
        this.uuid = data.uuid;

        this.order = data.order;
        this.startScene = data.startScene;
        this.lastEditorScene = data.lastEditorScene;

        this.sceneNodes = data.sceneNodes;
        return this;
    }

    toJSON() {
        const json = {
            object: {
                name: this.name,
                type: this.type,
                uuid: this.uuid,

                order: this.order,
                startScene: this.startScene,
                lastEditorScene: this.lastEditorScene,

                sceneNodes: this.sceneNodes,
            }
        };
        return json;
    }

}

export { World3D };
