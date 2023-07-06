import * as THREE from 'three';
import { APP_EVENTS } from '../constants.js';
import { AssetManager } from '../project/AssetManager.js';
import { CameraUtils } from '../utils/three/CameraUtils.js';
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
const gameClock = new Clock(false /* autostart */);
let physics;
let time = 0;

///// TODO: Game Variables
let distance = 0;
let framerate = 60;
/////

// Globals
const _position = new THREE.Vector3();
let boxes, balls;

class App {

    constructor() {
        // Project
        this.project = new Project();

        // Renderer
        this.renderer = new Renderer3D({ antialias: true });
        this.renderer.setPixelRatio(1); //window.devicePixelRatio;
        this.renderer.useLegacyLights = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // NOTE: three 151->152

        // DOM
        this.dom = document.createElement('div');
        this.dom.appendChild(this.renderer.domElement);

        // Scripts
        this.events = {};
        for (let key in APP_EVENTS) {
            const event = APP_EVENTS[key];
            this.events[event] = [];
        }

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
        ObjectUtils.clearObject(SceneManager.camera);
        ObjectUtils.clearObject(SceneManager.scene);

        for (let key in SceneManager.app.events) {
            SceneManager.app.events[key].length = 0;
        }

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
        SceneManager.camera = SceneManager.cameraFromScene(fromScene);
        SceneManager.project = this.project;
        SceneManager.renderer = this.renderer;
        SceneManager.scene = new Scene3D();

        // Load Scene
        SceneManager.loadScene(SceneManager.scene, fromScene);
        SceneManager.app.dispatch(SceneManager.app.events.init);
    }

    /******************** ANIMATE / RENDER */

    animate() {
        if (gameClock.isRunning()) {
            // Delta / Time Elapsed
            const delta = gameClock.getDeltaTime();
            const total = gameClock.getElapsedTime();

            // // Debug
            // if (total > time) {
            //     console.log(`Time: ${time}, FPS: ${gameClock.fps()}, Framerate: ${gameClock.averageDelta()}`);
            //     time++;
            // }

            // Call 'update()' functions, catch errors
            try { SceneManager.app.dispatch(SceneManager.app.events.update, delta, total); }
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
        SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);

        // Screenshot
        if (SceneManager.app.wantsScreenshot) {
            const filename = SceneManager.project.name + ' ' + new Date().toLocaleString() + '.png';
            const strMime = 'image/png'; /* or 'image/jpeg' or 'image/webp' */
            const imgData = SceneManager.renderer.domElement.toDataURL(strMime);
            System.saveImage(imgData, filename);
            SceneManager.app.wantsScreenshot = false;
        }

        // New Frame
        if (SceneManager.app.isPlaying) {
            animationID = requestAnimationFrame(SceneManager.app.animate);
        }
    }

    /******************** GAME STATE */

    async init() {
        physics = await RapierPhysics();
        const scene = SceneManager.scene;

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
        scene.add(floor);
        physics.addMesh(floor);

        // BOXES
        const geometryBox = new THREE.BoxGeometry(0.075, 0.075, 0.075);
        boxes = new THREE.InstancedMesh(geometryBox, material, 400);
        boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        boxes.castShadow = true;
        boxes.receiveShadow = true;
        scene.add(boxes);

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
        scene.add(balls);

        for (let i = 0; i < balls.count; i++) {
            matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
            balls.setMatrixAt(i, matrix);
            balls.setColorAt(i, color.setHex( 0xffffff * Math.random()));

        }
        physics.addMesh(balls, 1);
    }

    async play() {
        if (SceneManager.app.isPlaying) return;

        // Flag
        SceneManager.app.isPlaying = true;

        // Init
        await this.init();

        // Events
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointermove', onPointerMove);

        // Clock
        gameClock.reset();
        gameClock.start();

        // Animate
        if (animationID) cancelAnimationFrame(animationID);
        animationID = requestAnimationFrame(SceneManager.app.animate);
    }

    pause() {
        if (SceneManager.app.isPlaying) {
            if (gameClock.isRunning()) {
                gameClock.stop();
            } else {
                gameClock.start();
            }
        }
    }

    stop(dispose = false) {
        if (!SceneManager.app.isPlaying) return;

        // Flag
        SceneManager.app.isPlaying = false;

        // Events
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointermove', onPointerMove);

        // Cancel Animate
        if (animationID) {
            cancelAnimationFrame(animationID);
            animationID = null;
        }
        if (SceneManager.renderer) SceneManager.renderer.clear();

        // Clock
        gameClock.stop();

        // Clean Up
        if (dispose === true) this.dispose();
    }

    /******************** GAME HELPERS */

    isClockRunning() {
        return gameClock.isRunning();
    }

    setSize(width, height) {
        if (SceneManager.camera) CameraUtils.updateCamera(SceneManager.camera, width, height);
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
        vec.unproject(SceneManager.camera);
        return vec;
    }

}

export { App };

/******************** INTERNAL ********************/

function onKeyDown(event) {
    if (SceneManager.app.isPlaying) {
        SceneManager.app.dispatch(SceneManager.app.events.keydown, event);
    }
}

function onKeyUp(event) {
    if (SceneManager.app.isPlaying) {
        SceneManager.app.dispatch(SceneManager.app.events.keyup, event);
    }
}

function onPointerDown(event) {
    if (SceneManager.app.isPlaying) {
        SceneManager.app.dispatch(SceneManager.app.events.pointerdown, event);
    }
}

function onPointerUp(event) {
    if (SceneManager.app.isPlaying) {
        SceneManager.app.dispatch(SceneManager.app.events.pointerup, event);
    }
}

function onPointerMove(event) {
    if (SceneManager.app.isPlaying) {
        SceneManager.app.dispatch(SceneManager.app.events.pointermove, event);
    }
}
