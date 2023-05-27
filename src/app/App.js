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

// Internal
let requestId = null;
let time, startTime, prevTime;
let state = APP_STATES.STOPPED;

///// TODO: Game
let distance = 0;
/////

class App {

    constructor() {
        // Project
        this.project = new Project();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(1); //window.devicePixelRatio;
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // NOTE: three 151->152

        // DOM
        this.dom = document.createElement('div');
        this.dom.appendChild(this.renderer.domElement);

        // Scripts
        this.events = {
            init: [],
            update: [],
            destroy: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
        };

        // Flags
        this.wantsScreenshot = false;
    }

    /******************** LOAD */

    dispatch(array, event) {
        for (let i = 0; i < array.length; i++) {
            const callback = array[i];
            if (callback && typeof callback === 'function') callback(event);
        }
    }

    load(json, loadAssets = true) {
        // Load Project
        this.project.fromJSON(json, loadAssets);

        // Active World/Scene/Camera
        SceneManager.app = this;
        SceneManager.scene = new Scene3D();
        const source = this.project.getFirstWorld().activeScene();
        SceneManager.copyEntity(SceneManager.scene, source, /* offset */);
        SceneManager.camera = SceneManager.cameraFromScene();

        // Call 'init()' functions
        SceneManager.app.dispatch(this.events.init, arguments);
    }

    /******************** ANIMATE / RENDER */

    animate() {
        time = performance.now();

        try {
            const timePassed = time - startTime;
            const delta = time - prevTime;

            // Calls 'update()' functions
            if (state === APP_STATES.PLAYING) {
                SceneManager.app.dispatch(SceneManager.app.events.update, { time: timePassed, delta: delta });
            }
        } catch (e) {
            console.error((e.message || e), (e.stack || ''));
        }

        window.activeCamera = SceneManager.camera;
        SceneManager.app.renderer.render(SceneManager.scene, SceneManager.camera);

        // Screenshot
        if (SceneManager.app.wantsScreenshot) {
            const filename = this.project.name + ' ' + new Date().toLocaleString() + '.png';
            const strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
            const imgData = this.renderer.domElement.toDataURL(strMime);
            System.saveImage(imgData, filename);
            SceneManager.app.wantsScreenshot = false;
        }

        prevTime = time;
        requestId = window.requestAnimationFrame(SceneManager.app.animate);
    }

    /******************** GAME STATE */

    play() {
        startTime = prevTime = performance.now();
        state = APP_STATES.PLAYING;
        requestId = window.requestAnimationFrame(SceneManager.app.animate);

        // Add Event Listeners
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointermove', onPointerMove);
    }

    pause() {
        if (state === APP_STATES.PLAYING) state = APP_STATES.PAUSED;
        else if (state === APP_STATES.PAUSED) state = APP_STATES.PLAYING;
    }

    stop() {
        if (state === APP_STATES.STOPPED) return;
        state = APP_STATES.STOPPED;

        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointermove', onPointerMove);

        ObjectUtils.clearObject(SceneManager.camera);
        ObjectUtils.clearObject(SceneManager.scene);

        for (let key in SceneManager.app.events) {
            SceneManager.app.events[key].length = 0;
        }

        if (requestId) {
            window.cancelAnimationFrame(requestId);
            requestId = null;
        }
    }

    /******************** GETTERS */

    appState() { return state; }
    getRenderer() { return this.renderer; }

    /******************** SETTERS */

    setPixelRatio(pixelRatio) {
        this.renderer.setPixelRatio(pixelRatio);
    }

    setSize(width, height) {
        if (SceneManager.camera) CameraUtils.updateCamera(SceneManager.camera, width, height);
        if (this.renderer) this.renderer.setSize(width, height);
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
        vec.unproject(SceneManager.camera);
        return vec;
    }

}

export { App };

/******************** INTERNAL ********************/

function onKeyDown(event) { SceneManager.app.dispatch(SceneManager.app.events.keydown, event); }
function onKeyUp(event) { SceneManager.app.dispatch(SceneManager.app.events.keyup, event); }
function onPointerDown(event) { SceneManager.app.dispatch(SceneManager.app.events.pointerdown, event); }
function onPointerUp(event) { SceneManager.app.dispatch(SceneManager.app.events.pointerup, event); }
function onPointerMove(event) { SceneManager.app.dispatch(SceneManager.app.events.pointermove, event); }
