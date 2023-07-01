export const VERSION = '0.0.5';

export const ENTITY_TYPES = {
    Entity2D:       'Entity2D',
    Entity3D:       'Entity3D',
};

export const SCENE_TYPES = {
    Scene2D:        'Scene2D',
    Scene3D:        'Scene3D',
    SceneUI:        'SceneUI',
};

export const WORLD_TYPES = {
    World2D:        'World2D',
    World3D:        'World3D',
};

export const APP_STATES = {
    PLAYING:        'playing',
    PAUSED:         'paused',
    STOPPED:        'stopped',
}

export const APP_EVENTS = {
    init:           'init',
    update:         'update',
    destroy:        'destroy',
    keydown:        'keydown',
    keyup:          'keyup',
    pointerdown:    'pointerdown',
    pointerup:      'pointerup',
    pointermove:    'pointermove',
}

export const SCRIPT_FORMAT = {
    JAVASCRIPT:     'js',
    PYTHON:         'python',
}

export const REBUILD_TYPES = [
    'geometry',
    'material',
    'shape',
    'texture',
]
