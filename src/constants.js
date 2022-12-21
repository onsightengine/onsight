/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/

export const VERSION = '0.0.3';

///// Backends

export const BACKENDS = {
    RENDERER_3D: {
        ONSIGHT:    'ONE',
        THREE:      'THREE',
    },
    PHYSICS_3D: {
        CANNON:     'CANNON',
        RAPIER:     'RAPIER',
    }
}

///// Types

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
    IGNORE:         'flagIgnore',
    LOCKED:         'flagLocked',
}

///// States

export const APP_STATES = {
    PLAYING:        'playing',
    PAUSED:         'paused',
    STOPPED:        'stopped',
}
