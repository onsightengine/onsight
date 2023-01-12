/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/mrdoob/three.js/blob/dev/editor/js/libs/app.js
//      MIT     https://github.com/Cloud9c/taro/blob/main/src/core/App.js
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { APP_STATES, BACKENDS } from '../constants.js';

import { CameraUtils } from '../three/CameraUtils.js';
import { ObjectUtils } from '../three/ObjectUtils.js';
import { Project } from '../core/Project.js';
import { System } from '../sys/System.js';

class App {

    constructor() {
        const self = this;

        // Backend
        this.backend = {};
        this.backend.renderer = BACKENDS.RENDERER_3D.THREE;
        this.backend.physics = BACKENDS.PHYSICS_3D.RAPIER;

        // Private Members
        let player = this;
        let project = new Project();
        let renderer;
        let camera;
        let scene;
        let state = APP_STATES.STOPPED;

        // Accessors
        Object.defineProperty(self, 'scene', {
            get: function() { return scene; },
            set: function(value) { scene = value; }
        });

        // Public Memebrs
        this.width = 1;
        this.height = 1;

        this.wantsScreenshot = false;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(1); //window.devicePixelRatio;
        renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // renderer.toneMapping = THREE.ReinhardToneMapping;
        // renderer.physicallyCorrectLights = false;

        // DOM
        this.dom = document.createElement('div');
        this.dom.appendChild(renderer.domElement);

        // Local Variables
        let scriptGlobals = 'player,renderer,scene,camera';
        let events = {
            init: [],
            update: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
        };

        //////////////////// Load Project

        this.load = function(json, loadAssets = true) {

            // Load Project
            project.fromJSON(json, loadAssets);

            // Set Scene
            this.scene = project.getFirstScene();

            // // TEMP: Set Camera
            // this.setCamera(loader.parse(json.camera));
            this.setCamera(CameraUtils.createPerspective(500, 500, true));
            camera.position.x = 0;
            camera.position.y = 0;

            // Add Event Listeners
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            document.addEventListener('pointerdown', onPointerDown);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointermove', onPointerMove);

            // Scripts
            let scriptFunctions = '';
            let scriptReturnObject = {};
            for (let eventKey in events) {
                scriptFunctions += eventKey + ',';
                scriptReturnObject[eventKey] = eventKey;
            }
            scriptFunctions = scriptFunctions.replace(/.$/, '');								// remove last comma
            let scriptReturnString = JSON.stringify(scriptReturnObject).replace(/\"/g, '');		// remove all qoutes

            function loadScripts(object) {
                const scripts = project.scripts[object.uuid];
                if (scripts !== undefined && scripts.length > 0) {
                    for (let i = 0, l = scripts.length; i < l; i++) {
                        let script = scripts[i];

                        if (script.errors) {
                            console.warn(`Entity '${object.name}' has errors in script '${script.name}'. Script will not be loaded!`);

                        } else {
                            // Returns object that has script functions with proper 'this' bound, and access to globals
                            let body = `${script.source} \n return ${scriptReturnString};`;
                            let functions = (new Function(scriptGlobals, scriptFunctions, body).bind(object))(player, renderer, scene, camera);

                            // Add functions to event dispatch handler
                            for (let name in functions) {
                                if (! functions[name]) continue;
                                if (events[name] === undefined) {
                                    console.warn(`App: Event type not supported ('${name}')`);
                                    continue;
                                }
                                events[name].push(functions[name].bind(object));
                            }
                        }
                    }
                }
            }
            scene.traverse(loadScripts);

            // Call 'init()' functions
            dispatch(events.init, arguments);
        };

        //////////////////// Event Dispatcher

        function dispatch(array, event) {
            for (let i = 0, l = array.length; i < l; i++) {
                array[i](event);
            }
        }

        //////////////////// Animate / Render

        let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        let requestId = null;
        let time, startTime, prevTime;

        function animate() {
            time = performance.now();

            try {
                let timePassed = time - startTime;
                let delta = time - prevTime;

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
            if (self.wantsScreenshot === true) {
                let filename = project.name + ' ' + new Date().toLocaleString() + '.png';
                let strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
                let imgData = renderer.domElement.toDataURL(strMime);
                System.saveImage(imgData, filename);
                self.wantsScreenshot = false;
            }

            prevTime = time;

            requestId = requestAnimationFrame(animate);
        }

        //////////////////// Game State (Play, Stop, etc.)

        /** Start game loop */
        this.play = function() {
            startTime = prevTime = performance.now();
            state = APP_STATES.PLAYING;
            requestId = requestAnimationFrame(animate);
        };

        this.pause = function() {
            if (state === APP_STATES.PLAYING) {
                state = APP_STATES.PAUSED;
            } else if (state === APP_STATES.PAUSED) {
                state = APP_STATES.PLAYING;
            }
        }

        /** Stop game loop */
        this.stop = function() {
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
                cancelAnimationFrame(requestId);
                requestId = null;
            }
        };

        //////////////////// Events

        function onKeyDown(event) { dispatch(events.keydown, event); }
        function onKeyUp(event) { dispatch(events.keyup, event); }
        function onPointerDown(event) { dispatch(events.pointerdown, event); }
        function onPointerUp(event) { dispatch(events.pointerup, event); }
        function onPointerMove(event) { dispatch(events.pointermove, event); }

        //////////////////// Getters

        this.getRenderer = function() {
            return renderer;
        };

        this.appState = function() {
            return state;
        };

        //////////////////// Setters

        this.setCamera = function(value) {
            camera = value;
        };

        this.setPixelRatio = function(pixelRatio) {
            renderer.setPixelRatio(pixelRatio);
        };

        this.setSize = function(width, height) {
            this.width = width;
            this.height = height;
            if (camera) CameraUtils.updateCamera(camera, width, height);
            if (renderer) renderer.setSize(width, height);
        };

        //////////////////// Game Helper Functions

        this.gameCoordinates = function(fromEvent) {
            // Get mouse coords
            const rect = this.dom.getBoundingClientRect();
            let eventX = fromEvent.clientX - rect.left;
            let eventY = fromEvent.clientY - rect.top;

            // Relative screen position (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
            let x =  ((eventX / rect.width ) * (rect.width * 2)) - rect.width;
            let y = -((eventY / rect.height) * (rect.height * 2)) + rect.height;

            let vec = new THREE.Vector3(x, y, 0);
            vec.unproject(camera);
            return vec;
        }

    } // end ctor

}

export { App };
