import * as THREE from 'three';
import { APP_EVENTS } from '../constants.js';
import { AssetManager } from '../project/AssetManager.js';
import { Clock } from '../utils/Clock.js';
import { ObjectUtils } from '../utils/three/ObjectUtils.js';
import { Project } from '../project/Project.js';
import { RapierPhysics } from './RapierPhysics.js';
import { Renderer3D } from './Renderer3D.js';
import { Scene3D } from '../project/scene3d/Scene3D.js';
import { SceneManager } from './SceneManager.js';
import { System } from '../utils/System.js';

// https://github.com/mrdoob/three.js/blob/dev/editor/js/libs/app.js
// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js

// https://github.com/Cloud9c/taro/blob/main/src/core/App.js
// https://github.com/Cloud9c/taro/blob/main/src/core/Physics.js

// Game Loop
let animationID = null;

///// TODO: Game Variables
let distance = 0;
let framerate = 60;
/////

// Globals
const _position = new THREE.Vector3();

// TEMP
let physics;
let boxes, balls;

class App {

    constructor() {
        // Project
        this.project = new Project();

        // Renderer
        this.renderer = new Renderer3D({ antialias: true });
        this.renderer.setPixelRatio(1); // window.devicePixelRatio;
        this.renderer.shadowMap.enabled = true;

        // // NOTE: 151->152
        // see: https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
        //      https://github.com/mrdoob/three.js/wiki/Migration-Guide
        // Don't need if using EffectComposer?
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        // DOM
        this.dom = document.createElement('div');
        this.dom.appendChild(this.renderer.domElement);

        // Scripts
        this.events = {};
        for (let key in APP_EVENTS) {
            const event = APP_EVENTS[key];
            this.events[event] = [];
        }

        // Active Scene
        this.scene = null;
        this.camera = null;

        // Game Clock
        this.gameClock = new Clock(false /* autostart */);

        // Keys
        this.keys = {};

        // Flags
        this.isPlaying = false;
        this.wantsScreenshot = false;
    }

    /******************** LOAD */

    dispatch(array, ...args) {
        for (let i = 0; i < array.length; i++) {
            const callback = array[i];
            if (typeof callback === 'function') callback(...args);
        }
    }

    dispose() {
        // Clear Objects
        ObjectUtils.clearObject(this.camera);
        ObjectUtils.clearObject(this.scene);

        // Clear Project
        this.project.clear();

        // Clear Events
        for (let key in this.events) {
            this.events[key].length = 0;
        }

        // Clear Physics
        if (physics) {
            physics.world.free();
        }
    }

    load(json, loadAssets = true) {
        // Load Project
        this.project.fromJSON(json, loadAssets);

        // Active World/Scene/Camera
        const fromScene = this.project.getFirstWorld().activeScene();

        // Scene Manager
        SceneManager.app = this;
        this.camera = SceneManager.cameraFromScene(fromScene);
        this.camera.changeFit(this.project.settings?.orientation);
        this.scene = new Scene3D();

        // Load Scene
        SceneManager.loadScene(this.scene, fromScene);
        this.dispatch(this.events.init);
    }

    /******************** ANIMATE / RENDER */

    animate() {
        const self = this;

        if (this.gameClock.isRunning()) {
            // Delta / Time Elapsed
            const delta = this.gameClock.getDeltaTime();
            const total = this.gameClock.getElapsedTime();

            // // Debug
            // if (total > time) {
            //     console.log(`Time: ${time}, FPS: ${this.gameClock.fps()}, Framerate: ${this.gameClock.averageDelta()}`);
            //     time++;
            // }

            // Call 'update()' functions, catch errors
            try { this.dispatch(this.events.update, delta, total); }
            catch (error) { console.error((error.message || error), (error.stack || '')); }

            // Physics Update
            let boxIndex = Math.floor(Math.random() * boxes.count);
            let ballIndex = Math.floor(Math.random() * balls.count);
            physics.setMeshPosition(boxes, _position.set(0, Math.random() + 1, 0), boxIndex);
            physics.setMeshPosition(balls, _position.set(0, Math.random() + 1, 0), ballIndex);

            // Step
            if (delta > 0.01) {
                physics.step(delta);
            }
        }

        // Render
        this.renderer.render(this.scene, this.camera);

        // Screenshot
        if (this.wantsScreenshot) {
            const filename = this.project.name + ' ' + new Date().toLocaleString() + '.png';
            const strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
            const imgData = this.renderer.domElement.toDataURL(strMime);
            System.saveImage(imgData, filename);
            this.wantsScreenshot = false;
        }

        // New Frame
        if (this.isPlaying) {
            animationID = requestAnimationFrame(() => { self.animate(); });
        }
    }

    /******************** GAME STATE */

    async init() {
        physics = await RapierPhysics();

        const material = new THREE.MeshLambertMaterial();
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();

        // FLOOR
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, 5, 10),
            new THREE.ShadowMaterial({ color: 0, transparent: true, opacity: 0.2, depthWrite: false }),
        );
        floor.position.y = - 2.5;
        floor.receiveShadow = true;
        this.scene.add(floor);
        physics.addMesh(floor);

        // BOXES
        const geometryBox = new THREE.BoxGeometry(0.075, 0.075, 0.075);
        boxes = new THREE.InstancedMesh(geometryBox, material, 400);
        boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        boxes.castShadow = true;
        boxes.receiveShadow = true;
        this.scene.add(boxes);

        for (let i = 0; i < boxes.count; i++) {
            matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
            boxes.setMatrixAt(i, matrix );
            boxes.setColorAt(i, color.setHex(0xffffff * Math.random()));
        }
        physics.addMesh(boxes, 1);

	    // SPHERES
        const geometrySphere = new THREE.IcosahedronGeometry(0.05, 4);
        balls = new THREE.InstancedMesh(geometrySphere, material, 400);
        balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        balls.castShadow = true;
        balls.receiveShadow = true;
        this.scene.add(balls);

        for (let i = 0; i < balls.count; i++) {
            matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
            balls.setMatrixAt(i, matrix);
            balls.setColorAt(i, color.setHex( 0xffffff * Math.random()));

        }
        physics.addMesh(balls, 1);
    }

    async play() {
        if (this.isPlaying) return;
        const self = this;

        // Flag
        this.isPlaying = true;

        // Init
        await this.init();

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
        this.gameClock.reset();
        this.gameClock.start();

        // Animate
        if (animationID) cancelAnimationFrame(animationID);
        animationID = requestAnimationFrame(() => { self.animate(); });
    }

    pause() {
        if (!this.isPlaying) return;
        this.gameClock.toggle();
    }

    stop(dispose = false) {
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
        if (animationID) {
            cancelAnimationFrame(animationID);
            animationID = null;
        }
        if (this.renderer) this.renderer.clear();

        // Clock
        this.gameClock.stop();

        // Clean Up
        if (dispose === true) this.dispose();
    }

    /******************** GAME HELPERS */

    setSize(width, height) {
        if (this.camera) this.camera.setSize(width, height);
        if (this.renderer) this.renderer.setSize(width, height);
    }

    gameCoordinates(fromEvent) {
        //
        // NEEDS FURTHER IMPROVEMENT
        //

        // Get mouse coords
        const rect = this.dom.getBoundingClientRect();
        const eventX = fromEvent.clientX - rect.left;
        const eventY = fromEvent.clientY - rect.top;

        // Relative screen position (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
        const x =  ((eventX / rect.width ) * (rect.width * 2)) - rect.width;
        const y = -((eventY / rect.height) * (rect.height * 2)) + rect.height;

        const vec = new THREE.Vector3(x, y, 0);
        vec.unproject(this.camera);
        return vec;
    }

}

export { App };

/******************** INTERNAL ********************/

function onKeyDown(event) {
    if (this.isPlaying) {
        this.keys[event.key] = true;
        this.dispatch(this.events.keydown, event);
    }
}

function onKeyUp(event) {
    if (this.isPlaying) {
        this.keys[event.key] = false;
        this.dispatch(this.events.keyup, event);
    }
}

function onPointerDown(event) {
    if (this.isPlaying) {
        this.dispatch(this.events.pointerdown, event);
    }
}

function onPointerUp(event) {
    if (this.isPlaying) {
        this.dispatch(this.events.pointerup, event);
    }
}

function onPointerMove(event) {
    if (this.isPlaying) {
        this.dispatch(this.events.pointermove, event);
    }
}
