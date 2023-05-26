class Script {

    constructor() {

        // Prototype
        this.isScript = true;
        this.type = 'Script';

        // Properties
        this.name ='New Script';
        this.errors = false;
        this.source = `// Code outside of events is immediately executed when the script is loaded
//
// Lifecycle:	init, update, destroy
// Events:		keydown, keyup, pointerdown, pointerup, pointermove
// Globals:		this (entity), app, renderer, scene, camera

// Executed when the entity is loaded
function init() {

}

// Executed before frame is rendered
//	event.time: total elapsed time (in ms)
//	event.delta: time since last frame (in ms)
function update(event) {

}

// Example pointer event
function pointermove(event) {

}
`;

    }

}

export { Script };
