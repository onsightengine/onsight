/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/

///// General

export const NAME = 'Onsight';
export const REVISION = '0.0.3';
export const BACKEND3D = 'THREE';

///// Project Types

export const ENTITY_TYPES = {
    Entity3D:       'Entity3D',
};

export const SCENE_TYPES = {
    Scene3D:        'Scene3D',
};

export const WORLD_TYPES = {
    World3D:        'World3D',
};

///// Flags

export const ENTITY_FLAGS = {
    LOCKED:         'flagLocked',
    TEMP:           'flagTemp',
}

///// App States

export const APP_STATES = {
    PLAYING:        'playing',
    PAUSED:         'paused',
    STOPPED:        'stopped',
}
