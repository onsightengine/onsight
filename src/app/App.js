import * as THREE from 'three';
import { APP_STATES } from '../constants.js';
import { AssetManager } from '../project/AssetManager.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';
import { Project } from '../project/Project.js';
import { Scene3D } from '../project/scene3d/Scene3D.js';
import { SceneManager } from './SceneManager.js';
import { System } from '../utils/System.js';

// https://github.com/mrdoob/three.js/blob/dev/editor/js/libs/app.js
// https://github.com/Cloud9c/taro/blob/main/src/core/App.js

// Properties
const project = new Project();
let app = null;
let renderer = null;
let scene = null;
let camera = null;

// Internal
let requestId = null;
let time, startTime, prevTime;
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

        // Scripts
        this.events = {
            init: [],
            update: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
        };
    }

    /******************** LOAD */

    load(json, loadAssets = true) {
        // Load Project
        project.fromJSON(json, loadAssets);

        // Active World/Scene/Camera
        scene = new Scene3D();
        SceneManager.cloneEntities(app, renderer, camera, scene, project.getFirstWorld().activeScene());
        camera = SceneManager.cameraFromScene(scene);

        // Call 'init()' functions
        dispatch(app.events.init, arguments);
    }

    /******************** ANIMATE / RENDER */

    animate() {
        time = performance.now();

        try {
            const timePassed = time - startTime;
            const delta = time - prevTime;

            // Calls 'update()' functions
            if (state === APP_STATES.PLAYING) {
                dispatch(app.events.update, { time: timePassed, delta: delta });
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

        for (let key in app.events) {
            app.events[key].length = 0;
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

function onKeyDown(event) {
    console.log(event);

    dispatch(app.events.keydown, event);
}

function onKeyUp(event) { dispatch(app.events.keyup, event); }
function onPointerDown(event) { dispatch(app.events.pointerdown, event); }
function onPointerUp(event) { dispatch(app.events.pointerup, event); }
function onPointerMove(event) { dispatch(app.events.pointermove, event); }

function dispatch(array, event) {
    for (let i = 0; i < array.length; i++) {
        array[i](event);
    }
}
