import * as THREE from 'three';
import { APP_STATES } from '../constants.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';
import { Project } from '../project/Project.js';
import { Scene3D } from '../project/scene3d/Scene3D.js';
import { SceneManager } from './SceneManager.js';
import { System } from '../utils/System.js';

// https://github.com/mrdoob/three.js/blob/dev/editor/js/libs/app.js
// https://github.com/Cloud9c/taro/blob/main/src/core/App.js

// Scripts
const scriptGlobals = 'app,renderer,scene,camera';
const events = {
    init: [],
    update: [],
    keydown: [],
    keyup: [],
    pointerdown: [],
    pointerup: [],
    pointermove: [],
};

// Properties
const project = new Project();
let app = null;
let scene = null;
let camera = null;

// Internal
let requestId = null;
let time, startTime, prevTime;
let renderer;
let state = APP_STATES.STOPPED;

// Game
let distance = 0;

class App {

    constructor() {
        // Properties
        this.wantsScreenshot = false;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(1); //window.devicePixelRatio;
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // NOTE: three 151->152

        // DOM
        this.dom = document.createElement('div');
        this.dom.appendChild(renderer.domElement);

        // Globals
        app = this;
    }

    /******************** LOAD */

    load(json, loadAssets = true) {
        // Load Project
        project.fromJSON(json, loadAssets);

        // Active World/Scene/Camera
        scene = new Scene3D();
        SceneManager.cloneEntities(scene, project.getFirstWorld().activeScene());
        camera = SceneManager.cameraFromScene(scene);

        // Scripts
        let scriptFunctions = '';
        let scriptReturnObject = {};
        for (let eventKey in events) {
            scriptFunctions += eventKey + ',';
            scriptReturnObject[eventKey] = eventKey;
        }
        scriptFunctions = scriptFunctions.replace(/.$/, '');                                // remove last comma
        const scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');   // remove all qoutes

        function loadScripts(object) {
            const scripts = project.scripts[object.uuid];
            if (!scripts) return;
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                if (script.errors) {
                    console.warn(`Entity '${object.name}' has errors in script '${script.name}'. Script will not be loaded!`);

                } else {
                    // Returns object that has script functions with proper 'this' bound, and access to globals
                    const body = `${script.source} \n return ${scriptReturnString};`;
                    const functions = (new Function(scriptGlobals, scriptFunctions, body).bind(object))(app, renderer, scene, camera);

                    // Add functions to event dispatch handler
                    for (let name in functions) {
                        if (!functions[name]) continue;
                        if (events[name] === undefined) {
                            console.warn(`App: Event type not supported ('${name}')`);
                            continue;
                        }
                        events[name].push(functions[name].bind(object));
                    }
                }
            }
        }
        scene.traverse(loadScripts);

        // Call 'init()' functions
        dispatch(events.init, arguments);
    }

    /******************** ANIMATE / RENDER */

    animate() {
        time = performance.now();

        try {
            const timePassed = time - startTime;
            const delta = time - prevTime;

            // Calls 'update()' functions
            if (state === APP_STATES.PLAYING) {
                dispatch(events.update, { time: timePassed, delta: delta });
            }
        } catch (e) {
            console.error((e.message || e), (e.stack || ''));
        }

        window.activeCamera = camera;
        renderer.render(scene, camera);

        // Screenshot
        if (app.wantsScreenshot) {
            const filename = project.name + ' ' + new Date().toLocaleString() + '.png';
            const strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
            const imgData = renderer.domElement.toDataURL(strMime);
            System.saveImage(imgData, filename);
            app.wantsScreenshot = false;
        }

        prevTime = time;
        requestId = window.requestAnimationFrame(app.animate);
    }

    /******************** GAME STATE */

    play() {
        startTime = prevTime = performance.now();
        state = APP_STATES.PLAYING;
        requestId = window.requestAnimationFrame(app.animate);

        // Add Event Listeners
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointermove', onPointerMove);
    }

    pause() {
        if (state === APP_STATES.PLAYING) {
            state = APP_STATES.PAUSED;
        } else if (state === APP_STATES.PAUSED) {
            state = APP_STATES.PLAYING;
        }
    }

    stop() {
        state = APP_STATES.STOPPED;

        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointermove', onPointerMove);

        ObjectUtils.clearObject(camera);
        ObjectUtils.clearObject(scene);

        for (let key in events) {
            events[key].length = 0;
        }

        if (requestId) {
            window.cancelAnimationFrame(requestId);
            requestId = null;
        }
    }

    /******************** GETTERS */

    appState() { return state; }
    getRenderer() { return renderer; }

    /******************** SETTERS */

    setPixelRatio(pixelRatio) {
        renderer.setPixelRatio(pixelRatio);
    }

    setSize(width, height) {
        if (camera) CameraUtils.updateCamera(camera, width, height);
        if (renderer) renderer.setSize(width, height);
    }

    /******************** GAME HELPERS */

    gameCoordinates(fromEvent) {
        // Get mouse coords
        const rect = this.dom.getBoundingClientRect();
        const eventX = fromEvent.clientX - rect.left;
        const eventY = fromEvent.clientY - rect.top;

        // Relative screen position (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
        const x =  ((eventX / rect.width ) * (rect.width * 2)) - rect.width;
        const y = -((eventY / rect.height) * (rect.height * 2)) + rect.height;

        const vec = new THREE.Vector3(x, y, 0);
        vec.unproject(camera);
        return vec;
    }

}

export { App };

/******************** INTERNAL ********************/

function onKeyDown(event) { dispatch(events.keydown, event); }
function onKeyUp(event) { dispatch(events.keyup, event); }
function onPointerDown(event) { dispatch(events.pointerdown, event); }
function onPointerUp(event) { dispatch(events.pointerup, event); }
function onPointerMove(event) { dispatch(events.pointermove, event); }

function dispatch(array, event) {
    for (let i = 0, l = array.length; i < l; i++) {
        array[i](event);
    }
}
