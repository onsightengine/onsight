export const VERSION = '0.0.6';

export const APP_SIZE = 1000;

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

export const APP_ORIENTATION = {
    PORTRAIT:       'portrait',
    LANDSCAPE:      'landscape',
};

export const CAMERA_TYPES = {
    PERSPECTIVE:    'perspective',
    ORTHOGRAPHIC:   'orthographic',
};

export const WORLD_TYPES = {
    World2D:        'World2D',
    World3D:        'World3D',
    WorldUI:        'WorldUI',
};

export const SCRIPT_FORMAT = {
    JAVASCRIPT:     'js',
    PYTHON:         'python',
}

export const MESH_REBUILD_TYPES = [
    'geometry',
    'material',
    'shape',
    'texture',
]
