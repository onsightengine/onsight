export const VERSION = '0.0.4';

export const BACKENDS = {
    RENDERER_3D: {
        PIXI:       'PIXI',
    },
    PHYSICS_2D: {
        MATTER:     'MATTER',
    },
    RENDERER_3D: {
        THREE:      'THREE',
    },
    PHYSICS_3D: {
        CANNON:     'CANNON',
        RAPIER:     'RAPIER',
    },
}

export const ENTITY_TYPES = {
    Entity2D:       'Entity2D',
    Entity3D:       'Entity3D',
};

export const SCENE_TYPES = {
    Scene2D:        'Scene2D',
    Scene3D:        'Scene3D',
};

export const WORLD_TYPES = {
    World2D:        'World2D',
    World3D:        'World3D',
};

export const ENTITY_FLAGS = {
    IGNORE:         'flagIgnore',
    LOCKED:         'flagLocked',
}

export const APP_STATES = {
    PLAYING:        'playing',
    PAUSED:         'paused',
    STOPPED:        'stopped',
}
