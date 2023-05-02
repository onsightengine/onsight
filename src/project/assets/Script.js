class Script {

    constructor() {

        // Prototype
        this.isScript = true;
        this.type = 'Script';

        // Properties
        this.name ='New Script';
        this.errors = false;
        this.source =
            '// Code outside of lifecycle and event listeners is immediately executed when the script is loaded\n\n' +
            '// Events - The following events are supported:\n' +
            '//\t\tkeydown, keyup, pointerdown, pointerup, pointermove\n\n' +
            '// Variables - The following globals are accessible to scripts:\n' +
            '//\t\tthis (entity which owns the script), player, renderer, scene, camera'+
            '\n\n\n' +
            '// Executed when the entity is loaded\n' +
            'function init() {\n\t\n}' +
            '\n\n\n' +
            '// Executed right before a frame is going to be rendered\n' +
            '// - event.time: total elapsed time, in milliseconds\n' +
            '// - event.delta: time since last frame, in milliseconds\n' +
            'function update(event) {\n\t\n}' +
            '\n\n\n' +
            '// Example pointer event\n' +
            'function pointermove(event) {\n\t\n}';

    }

}

export { Script };
