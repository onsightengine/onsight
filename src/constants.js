import pkg from '../package.json' assert { type: "json" };
export const VERSION = pkg.version;

export const APP_SIZE = 1000;

export const APP_EVENTS = [
    'init',
    'update',
    'destroy',
    'keydown',
    'keyup',
    'pointerdown',
    'pointerup',
    'pointermove',
];

export const APP_ORIENTATION = {
    PORTRAIT:       'portrait',
    LANDSCAPE:      'landscape',
};

export const WORLD_TYPES = {
    World2D:        'World2D',
    World3D:        'World3D',
    WorldUI:        'WorldUI',
};

export const SCRIPT_FORMAT = {
    JAVASCRIPT:     'js',
    PYTHON:         'python',
};
