// https://github.com/mrdoob/three.js/blob/dev/editor/js/libs/app.js
// https://github.com/Cloud9c/taro/blob/main/src/core/App.js

import * as THREE from 'three';

import { APP_EVENTS } from '../constants.js';
import { APP_ORIENTATION } from '../constants.js';

import { AssetManager } from './AssetManager.js';
import { Camera3D } from '../project/world3d/Camera3D.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';
import { Clock } from '../utils/Clock.js';
import { EntityUtils } from '../utils/three/EntityUtils.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';
import { Project } from '../project/Project.js';
import { Renderer3D } from './Renderer3D.js';
import { SceneManager } from './SceneManager.js';
import { Stage3D } from '../project/world3d/Stage3D.js';
import { World3D } from '../project/world3d/World3D.js';

const _position = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();

let _animationID = null;

class App {

    constructor() {
        // Project
        this.project = new Project();

        // Renderer
        this.renderer = new Renderer3D({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;

        // DOM
        this.dom = document.createElement('div');
        this.dom.appendChild(this.renderer.domElement);

        // Scripts
        this.events = {};

        // Scene
        this.world = null;                  // Active Project World
        this.scene = null;                  // Active Render Scene
        this.camera = new Camera3D();       // Active Render Camera

        // Game Clock
        this.gameClock = new Clock(false /* autostart */);

        // Keys / Mouse
        this.keys = {};
        this.pointer = new THREE.Vector2();

        // Flags
        this.isPlaying = false;
    }

    /******************** EVENT DISPATCHER */

    addEvent(name, owner, callback) {
        if (APP_EVENTS.indexOf(name) === -1) return; // unknown event name
        if (!owner || !owner.uuid) return;
        if (typeof callback !== 'function') return;
        if (!this.events[name]) this.events[name] = {};
        if (!this.events[name][owner.uuid]) this.events[name][owner.uuid] = [];
        this.events[name][owner.uuid].push(callback);
    }

    clearEvents(names = [], uuids = []) {
        if (names.length === 0) names = [...APP_EVENTS];
        const original = [...uuids];
        for (const name of names) {
            const events = this.events[name];
            if (typeof events !== 'object') return;
            uuids = (original.length === 0) ? Object.keys(events) : [...original];
            for (const uuid of uuids) {
                delete events[uuid];
            }
        }
    }

    dispatch(name, event = {}, uuids = [] /* leaving empty dispatches for all */) {
        const events = this.events[name];
        if (typeof events !== 'object') return;
        if (uuids.length === 0) uuids = Object.keys(events);
        for (const uuid of uuids) {
            const callbacks = events[uuid];
            if (!Array.isArray(callbacks)) continue;
            for (const callback of callbacks) {
                if (typeof callback === 'function') {
                    try { callback(event); }
                    catch (error) { console.error((error.message || error), (error.stack || '')); }
                }
            }
        }
        if (name === 'init') {
            this.clearEvents([ name ], uuids);
        } else if (name === 'destroy') {
            this.clearEvents([], uuids);
        }
    }

    /******************** LOAD */

    load(json, loadAssets = true) {
        // Scene Manager
        SceneManager.app = this;

        // Load Project
        this.project.fromJSON(json, loadAssets);

        // Active World
        this.world = this.project.activeWorld();

        // Create Scene
        const preload = this.project.setting('preload');
        this.scene = new World3D();
        SceneManager.loadWorld(this.scene, this.world);

        // Find Camera
        this.camera = SceneManager.findCamera(this.scene);
        this.camera.changeFit(this.project.setting('orientation'));

        // Preload Stages
        SceneManager.loadStages(this.scene, this.world, preload);
    }

    /******************** FRAME */

    animate() {
        if (this.gameClock.isRunning()) {
            // Delta / Time Elapsed
            const delta = this.gameClock.getDeltaTime();
            const total = this.gameClock.getElapsedTime();

            // // Debug
            // if (total > time++) {
            //     console.log(`Time: ${time}, FPS: ${this.gameClock.fps()}, Framerate: ${this.gameClock.averageDelta()}`);
            // }

            // Script 'update()' functions
            this.dispatch('update', { delta, total });

            // Physics?
            if (this.scene.physics) {
                this.scene.physics.onUpdate(delta);
                for (const child of this.scene.getEntities()) {
                    for (const component of child.components) {
                        if (typeof component.onUpdate === 'function') component.onUpdate(delta);
                    }
                }
            }

            // Add / Remove Entities
            if (this.camera && this.camera.target && this.camera.target.isVector3) {
                if (this.scene && this.scene.isWorld3D) {
                    const preload = this.project.setting('preload');
                    const unload = this.project.setting('unload');
                    _position.set(0, 0, 0).applyMatrix4(this.scene.loadPosition);
                    const distanceFromEnd = this.camera.target.distanceTo(_position);
                    const playerDistance = this.scene.loadDistance - distanceFromEnd;
                    // Load Stage(s)?
                    if (preload >= 0 && distanceFromEnd < preload) {
                        SceneManager.loadStages(this.scene, this.world, Math.max(preload - distanceFromEnd, 0.01));
                    // Check for Removal
                    } else if (unload >= 0) {
                        for (const child of this.scene.children) {
                            if (isNaN(child.userData.loadedDistance)) continue;
                            if (playerDistance < child.userData.loadedDistance) continue;
                            if (this.camera.target.distanceTo(child.position) < unload) continue;
                            SceneManager.removeEntity(this.scene, child);
                        }
                    }
                }
            }
        }

        // Render
        SceneManager.renderWorld(this.world);

        // New Frame
        if (this.isPlaying) _animationID = requestAnimationFrame(function() { this.animate(); }.bind(this));
    }

    /******************** GAME STATE */

    start() {
        if (this.isPlaying) return;

        // Flag
        this.isPlaying = true;

        // Events
        this._onKeyDown = onKeyDown.bind(this);
        this._onKeyUp = onKeyUp.bind(this);
        this._onPointerDown = onPointerDown.bind(this);
        this._onPointerUp = onPointerUp.bind(this);
        this._onPointerMove = onPointerMove.bind(this);
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('pointerdown', this._onPointerDown);
        document.addEventListener('pointerup', this._onPointerUp);
        document.addEventListener('pointermove', this._onPointerMove);

        // Clock
        this.gameClock.start(true /* reset */);

        // Initial Render (to build EffectComposer)
        SceneManager.renderWorld(this.world);

        // Animate
        cancelAnimationFrame(_animationID);
        _animationID = requestAnimationFrame(function() { this.animate(); }.bind(this));
    }

    pause() {
        if (!this.isPlaying) return;
        this.gameClock.toggle();
    }

    stop() {
        if (!this.isPlaying) return;

        // Flag
        this.isPlaying = false;

        // Events
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('pointerdown', this._onPointerDown);
        document.removeEventListener('pointerup', this._onPointerUp);
        document.removeEventListener('pointermove', this._onPointerMove);

        // Cancel Animate
        cancelAnimationFrame(_animationID);
        _animationID = null;
        if (this.renderer) this.renderer.clear();

        // Clock
        this.gameClock.stop();

        // Clear Renderer
        SceneManager.dispose();

        // Clear Objects
        ObjectUtils.clearObject(this.camera);
        ObjectUtils.clearObject(this.scene);
        this.project.clear();
        this.clearEvents();
    }

    /******************** GAME HELPERS */

    setSize(width, height) {
        width = Math.ceil(Math.max(1, width));
        height = Math.ceil(Math.max(1, height));
        if (this.camera) this.camera.setSize(width, height);
        if (this.renderer) this.renderer.setSize(width, height); /* internal three <canvas> */
        SceneManager.setSize(width, height);
    }

    gameCoordinates(event) {
        this.updatePointer(event);
        const worldPoint = CameraUtils.worldPoint(
            { x: this.pointer.x, y: this.pointer.y }, this.camera, this.camera.target, 'none');
        return worldPoint;
    }

    updatePointer(event) {
        // Mouse coords
        const rect = this.dom.getBoundingClientRect();
        const eventX = event.clientX - rect.left;
        const eventY = event.clientY - rect.top;

        // Relative screen position (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
        this.pointer.x =  ((eventX / rect.width ) * 2) - 1;
        this.pointer.y = -((eventY / rect.height) * 2) + 1;
    }

}

export { App };

/******************** INTERNAL ********************/

function onKeyDown(event) {
    if (this.isPlaying) {
        this.keys[event.key] = true;
        this.dispatch('keydown', event);
    }
}

function onKeyUp(event) {
    if (this.isPlaying) {
        this.keys[event.key] = false;
        this.dispatch('keyup', event);
    }
}

function onPointerDown(event) {
    if (this.isPlaying) {
        // Down on Entity?
        this.updatePointer(event);
        _raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = _raycaster.intersectObjects(this.scene.children, true);
        event.entity = undefined;
        for (let i = 0; i < intersects.length; i++) {
            event.entity = EntityUtils.parentEntity(intersects[i].object);
            if (event.entity && event.entity.isEntity) break;
        }

        // // DEBUG: Mouse position in game coordinates
        // const coords = this.gameCoordinates(event);
        // console.log(coords? `Coords X:${coords.x}, Y: ${coords.y}, Z: ${coords.z}` : 'Unknown');

        // Dispatch Events
        this.dispatch('pointerdown', event);
    }
}

function onPointerUp(event) {
    if (this.isPlaying) {
        this.dispatch('pointerup', event);
    }
}

function onPointerMove(event) {
    if (this.isPlaying) {
        this.dispatch('pointermove', event);
    }
}
