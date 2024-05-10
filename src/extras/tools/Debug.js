import { Clock } from '../../core/Clock.js';

let _singleton = null;

class Debug {

    #startInternal;
    #stopInternal;

    constructor(openFrame = false, openScene = false, openBuffers = false, openSystem = false) {
        if (_singleton) return _singleton;

        function checkState(key) {
            const value = localStorage.getItem(key);
            if (typeof value === 'string') {
                if (value === 'undefined' || value === 'null' || value === 'false') return false;
                return true;
            }
            return !!value;
        }

        openFrame = openFrame || checkState('DebugFrame');
        openScene = openScene || checkState('DebugScene');
        openBuffers = openBuffers || checkState('DebugBuffers');
        openSystem = openSystem || checkState('DebugSystem');

        const buttonColor = getVariable('button-light') ?? '60, 60, 60';
        const backgroundColor = getVariable('background-light') ?? '32, 32, 32';
        const backgroundAlpha = getVariable('panel-transparency') ?? '1.0';
        const textColor = getVariable('text') ?? '170, 170, 170';
        const textLight = getVariable('text-light') ?? '225, 225, 225';

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            #EyeDebug {
                position: absolute;
                display: flex;
                flex-direction: column;
                justify-content: left;
                text-align: left;
                left: 0;
                bottom: 0;
                margin: 0.25em;
                padding: 0;
                z-index: 1000; /* Debug Info */
                background: transparent;
            }

            .EyeDiv {
                user-select: none;
                pointer-events: none;
                margin: 0.35em;
                margin-bottom: 0;
                padding: 0.25em;
                border-radius: 0.71429em;
                background-color: rgba(${backgroundColor}, ${backgroundAlpha});
            }

            .EyeButtonRow {
                display: flex;
                background: transparent;
                margin: 0.35em;
            }

            .EyeDebugButton {
                filter: grayscale(100%);
                flex: 1 1 auto;
                border-radius: 1000px;
                background-color: rgba(${backgroundColor}, ${backgroundAlpha});
                height: 2.5em;
                width: 2.5em;
                margin-left: 0.2em;
                margin-right: 0.2em;
                padding-bottom: 0.05em;
            }

            .EyeDebugButton:hover {
                filter: brightness(125%) grayscale(100%);
                box-shadow:
                    inset -1px 1px 1px -1px rgba(255, 255, 255, 0.2),
                    inset 2px -2px 2px -1px rgba(0, 0, 0, 0.75);
            }

            .EyeDebugButton.suey-selected {
                filter: brightness(100%);
                box-shadow: none;
            }

            #ButtonFrame { border: solid 2px rgba(${buttonColor}, 0.7); }
            #ButtonScene { border: solid 2px rgba(${buttonColor}, 0.7); }
            #ButtonBuffers { border: solid 2px rgba(${buttonColor}, 0.7); }
            #ButtonSystem { border: solid 2px rgba(${buttonColor}, 0.7); }

            #FrameFrame, #ButtonFrame.suey-selected { border: solid 2px rgba(0, 180, 175, 0.75); }
            #SceneFrame, #ButtonScene.suey-selected { border: solid 2px rgba(255, 113, 0, 0.75); }
            #BuffersFrame, #ButtonBuffers.suey-selected { border: solid 2px rgba(255, 93, 0, 0.75); }
            #SystemFrame, #ButtonSystem.suey-selected { border: solid 2px rgba(145, 223, 0, 0.75); }

            .EyeDebugButton.suey-selected:hover {
                filter: brightness(125%);
            }

            .EyeDebugButton:active {
                filter: brightness(100%);
                box-shadow:
                    inset -1px 1px 3px 1px rgba(0, 0, 0, 0.75),
                    inset  1px 1px 3px 1px rgba(0, 0, 0, 0.75),
                    inset -1px -1px 3px 1px rgba(0, 0, 0, 0.75),
                    inset  1px -1px 3px 1px rgba(0, 0, 0, 0.75);
            }

            .EyeDetails { /* closed */
                filter: brightness(0.75);
                padding: 0;
                margin: 0;
                left: 0;
                right: 0;
                width: 100%;
            }

            .EyeDetails[open] {
                filter: none;
                padding-top: 0.1em;
                min-width: 9em;
            }

            .EyeHeader {
                padding: 0.1em 0.3em;
                padding-top: 0;
                left: 0;
                width: 100%;
                margin: 0;
                font-size: 0.9em;
            }

            #FrameHeader { color: #00b4af; }
            #SceneHeader { color: #ff7100; }
            #BuffersHeader { color: #d8007f; }
            #SystemHeader { color: #75b300; }

            .EyeRow {
                display: flex;
                justify-content: space-between;
                padding: 0.1em;
                padding-left: 0.3em;
                padding-right: 0.3em;
                width: 100%;
                font-size: 0.8em;
                color: rgba(${textColor}, 0.8);
            }

            .EyeInfo, .EyeInfo > * {
                font-size: inherit;
                color: rgb(${textLight});
            }

            .Light {
                font-size: 12px;
                color: #a5f300;
            }

            .EyeImageHolder {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin: 0.4em;
                /* max-width: 1.35em; */
                /* max-height: 1.35em; */
            }

            .ColorIcon {
                filter: brightness(50%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 160deg));
            }

            .ColorComplement {
                filter: brightness(50%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 0deg));
            }

            .suey-rotate-colorize1 {
                filter: brightness(50%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 270deg));
            }

            .suey-rotate-colorize2 {
                filter: brightness(65%) sepia(1000%) saturate(350%) hue-rotate(calc(var(--rotate-hue) + 35deg));
            }
        `;
        document.head.appendChild(styleSheet)

        const dom = document.createElement('div');
        dom.id = 'EyeDebug';
        dom.innerHTML = `
            <div class="EyeDiv" id="FrameFrame">
                <div class="EyeHeader" id="FrameHeader">Frame</div>
                <div class="EyeRow">FPS<span class="EyeInfo" id="EyeFps">?</span></div>
                <div class="EyeRow">Render<span class="EyeInfo" id="EyeRender">?</span></div>
                <div class="EyeRow">Max<span class="EyeInfo" id="EyeMax">?</span></div>
                <div class="EyeRow">Draws <span class="EyeInfo" id="EyeDraws">?</span></div>
                </div>
            </div>

            <div class="EyeDiv" id="SceneFrame">
                <div class="EyeHeader" id="SceneHeader">Scene</div>
                <div class="EyeRow">Objects <span class="EyeInfo" id="EyeObjects">?</span></div>
                <div class="EyeRow">Lights <span class="EyeInfo" id="EyeLights">?</span></div>
                <div class="EyeRow">Vertices <span class="EyeInfo" id="EyeVertices">?</span></div>
                <div class="EyeRow">Triangles <span class="EyeInfo" id="EyeTriangles">?</span></div>
                </details>
            </div>

            <div class="EyeDiv" id="BuffersFrame">
                <div class="EyeHeader" id="BuffersHeader">Buffers</div>
                <div class="EyeRow">Programs <span class="EyeInfo" id="EyePrograms">?</span></div>
                <div class="EyeRow">Geometries <span class="EyeInfo" id="EyeGeometries">?</span></div>
                <div class="EyeRow">Textures <span class="EyeInfo" id="EyeTextures">?</span></div>
                </details>
            </div>

            <div class="EyeDiv" id="SystemFrame">
                <div class="EyeHeader" id="SystemHeader">System</div>
                <div class="EyeRow">Memory <span class="EyeInfo" id="EyeMemory">?</span></div>
                </details>
            </div>

            <div class="EyeButtonRow">
                <button class="EyeDebugButton" id="ButtonFrame">
                    <div class="EyeImageHolder ColorIcon">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M253.007,34c123.372,0.146 224.847,101.621 224.993,224.993l0,0.007c0,123.431 -101.569,225 -225,225c-123.431,0 -225,-101.569 -225,-225c0,-123.431 101.569,-225 225,-225l0.007,0Zm-0.011,398.23c94.989,-0.118 173.116,-78.245 173.234,-173.234c-0.002,-95.029 -78.2,-173.226 -173.23,-173.226c-95.031,-0 -173.23,78.199 -173.23,173.23c-0,95.03 78.197,173.228 173.226,173.23Z" style="fill:#c0c0c0;"/><path d="M279.881,249.916l51.859,51.858c0.028,0.029 0.057,0.058 0.085,0.087c4.838,5.009 7.546,11.709 7.546,18.674c-0,14.746 -12.135,26.881 -26.881,26.881c-6.966,-0 -13.665,-2.707 -18.675,-7.546c-0.029,-0.028 -0.058,-0.056 -0.086,-0.085l-59.733,-59.733c-5.039,-5.037 -7.874,-11.879 -7.877,-19.004l0,-119.471c0,-14.746 12.135,-26.881 26.881,-26.881c14.746,-0 26.881,12.135 26.881,26.881l-0,108.339Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
                <button class="EyeDebugButton" id="ButtonScene">
                    <div class="EyeImageHolder ColorComplement">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M336.33,61.901c0.054,0.046 87.151,87.14 87.223,87.223c0.015,0.017 0.028,0.032 0.039,0.044c1.231,1.375 2.251,2.87 3.086,4.423c1.775,3.293 2.772,7.051 2.772,11.035l0,258.458c0,8.282 -3.289,16.224 -9.145,22.08l-1.192,1.191c-6.176,6.175 -14.551,9.645 -23.286,9.645l-260.361,0c-8.282,0 -16.225,-3.29 -22.08,-9.146l-1.191,-1.191c-6.176,-6.176 -9.645,-14.551 -9.645,-23.286l0,-333.461c0,-8.282 3.289,-16.224 9.145,-22.08l1.192,-1.191c6.176,-6.175 14.551,-9.645 23.286,-9.645l184.652,0c3.983,0 7.741,0.997 11.034,2.773c1.572,0.843 3.084,1.878 4.471,3.128Zm-51.29,107.446l-0,-69.22l-138.363,0l-0,311.746l238.646,0l-0,-211.463l-69.925,0c-7.603,0 -14.894,-3.02 -20.271,-8.396l-1.19,-1.191c-5.697,-5.696 -8.897,-13.422 -8.897,-21.476Zm42.579,-9.526l44,-0l-44,-44l-0,44Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
                <button class="EyeDebugButton" id="ButtonBuffers">
                    <div class="EyeImageHolder suey-rotate-colorize1">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M449.119,359.79c9.175,15.892 9.175,34.87 -0,50.764c-9.175,15.891 -25.611,25.382 -43.964,25.382l-298.311,0c-18.35,0 -34.783,-9.486 -43.961,-25.38c-9.177,-15.896 -9.177,-34.874 0,-50.766l149.154,-258.344c9.175,-15.893 25.611,-25.382 43.964,-25.382c18.353,-0 34.786,9.486 43.964,25.38l149.154,258.346Zm-338.984,23.483l291.732,-0l-145.866,-252.645l-145.866,252.645Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
                <button class="EyeDebugButton" id="ButtonSystem">
                    <div class="EyeImageHolder suey-rotate-colorize2">
                    <svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M410.964,152.852c24.705,0 45.036,20.331 45.036,45.037l0,116.222c0,24.706 -20.331,45.037 -45.036,45.037l-13.075,-0l-0,32.445c-0,14.081 -11.586,25.666 -25.666,25.666c-14.081,0 -25.666,-11.585 -25.666,-25.666l-0,-32.445l-64.891,-0l-0,32.445c-0,14.081 -11.586,25.666 -25.666,25.666c-14.08,0 -25.666,-11.585 -25.666,-25.666l0,-32.445l-64.891,-0l0,32.445c0,14.081 -11.585,25.666 -25.666,25.666c-14.08,0 -25.666,-11.585 -25.666,-25.666l0,-32.445l-13.075,-0c-24.705,-0 -45.036,-20.331 -45.036,-45.037l0,-116.222c0,-24.706 20.331,-45.037 45.036,-45.037l13.075,0l0,-32.445c0,-14.081 11.586,-25.666 25.666,-25.666c14.081,-0 25.666,11.585 25.666,25.666l0,32.445l64.891,0l0,-32.445c0,-14.081 11.586,-25.666 25.666,-25.666c14.08,-0 25.666,11.585 25.666,25.666l-0,32.445l64.891,0l-0,-32.445c-0,-14.081 11.585,-25.666 25.666,-25.666c14.08,-0 25.666,11.585 25.666,25.666l-0,32.445l13.075,0Zm-303.632,154.964l297.336,-0l0,-103.632l-297.336,0l-0,103.632Z" style="fill:#c0c0c0;"/></svg>
                    </div>
                </button>
            </div>
        `;
        document.body.appendChild(dom);

        const frameFrame = document.getElementById('FrameFrame');
        const sceneFrame = document.getElementById('SceneFrame');
        const buffersFrame = document.getElementById('BuffersFrame');
        const systemFrame = document.getElementById('SystemFrame');

        const buttonFrame = document.getElementById('ButtonFrame');
        const buttonScene = document.getElementById('ButtonScene');
        const buttonBuffers = document.getElementById('ButtonBuffers');
        const buttonSystem = document.getElementById('ButtonSystem');

        buttonFrame.setAttribute('tooltip', 'Frame');
        buttonScene.setAttribute('tooltip', 'Scene');
        buttonBuffers.setAttribute('tooltip', 'Buffers');
        buttonSystem.setAttribute('tooltip', 'System');

        function toggleFrame(frame, button, open, storageKey) {
            if (open) {
                frame.style.display = '';
                button.classList.add('suey-selected');
            } else {
                frame.style.display = 'none';
                button.classList.remove('suey-selected');
            }
            localStorage.setItem(storageKey, open);
        }

        buttonFrame.addEventListener('click', () => {
            openFrame = !openFrame;
            toggleFrame(frameFrame, buttonFrame, openFrame, 'DebugFrame');
        });

        buttonScene.addEventListener('click', () => {
            openScene = !openScene;
            toggleFrame(sceneFrame, buttonScene, openScene, 'DebugScene');
        });

        buttonBuffers.addEventListener('click', () => {
            openBuffers = !openBuffers;
            toggleFrame(buffersFrame, buttonBuffers, openBuffers, 'DebugBuffers');
        });

        buttonSystem.addEventListener('click', () => {
            openSystem = !openSystem;
            toggleFrame(systemFrame, buttonSystem, openSystem, 'DebugSystem');
        });

        toggleFrame(frameFrame, buttonFrame, openFrame, 'DebugFrame');
        toggleFrame(sceneFrame, buttonScene, openScene, 'DebugScene');
        toggleFrame(buffersFrame, buttonBuffers, openBuffers, 'DebugBuffers');
        toggleFrame(systemFrame, buttonSystem, openSystem, 'DebugSystem');

        const domFps = document.getElementById('EyeFps');
        const domRender = document.getElementById('EyeRender');
        const domMax = document.getElementById('EyeMax');
        const domDraws = document.getElementById('EyeDraws');

        const domObjects = document.getElementById('EyeObjects');
        const domLights = document.getElementById('EyeLights');
        const domVertices = document.getElementById('EyeVertices');
        const domTriangles = document.getElementById('EyeTriangles');

        const domPrograms = document.getElementById('EyePrograms');
        const domGeometries = document.getElementById('EyeGeometries');
        const domTextures = document.getElementById('EyeTextures');

        const domMem = document.getElementById('EyeMemory');

        const frameClock = new Clock();
        const elapsedClock = new Clock();

        /***** START / STOP ******/

        this.#startInternal = function(renderer) {
            frameClock.start();
            renderer.drawCallCount = 0;
        };

        this.#stopInternal = function(renderer) {
            frameClock.stop();

            elapsedClock.getDeltaTime();
            const elapsed = elapsedClock.getElapsedTime();
            if (elapsed > 1) { // update once per second
                // NOTE: Setting 'firstChild' sets actual 'Text' node itself and does not increase DOM Node count
                // https://stackoverflow.com/questions/73253005/where-are-these-dom-nodes-coming-from-when-only-changing-innertext

                // Actual fps
                const fps = elapsedClock.count() / elapsed;
                if (domFps) domFps.firstChild.textContent = `${fps.toFixed(1)} fps`;
                elapsedClock.reset();

                // Average time of actual rendering frames
                const frameAvg = frameClock.averageDelta();
                if (domRender) domRender.firstChild.textContent = `${frameAvg.toFixed(3) * 1000} ms`;
                if (domMax) domMax.firstChild.textContent = `~ ${Math.floor(1 / frameAvg)} fps`;
                frameClock.reset();

                // Draw call count
                if (domDraws) domDraws.firstChild.textContent = `${renderer.drawCallCount}`;

                // Memory usage
                if (domMem && performance.memory) {
                    const memory = performance.memory.usedJSHeapSize / 1048576;
                    domMem.firstChild.textContent = `${memory.toFixed(2)} mb`;
                }

                // Scene Info
                let objects = 0, vertices = 0, triangles = 0, lights = 0;
                const scene = renderer.scene;
                if (scene && scene.isTransform) {
                    scene.traverseVisible((object) => {
                        objects++;
                        if (object.isLight) lights++;
                        if (object.isMesh && object.geometry) {
                            const geometry = object.geometry;
                            vertices += geometry.attributes.position.count;
                            const instance = (geometry.isInstanced) ? geometry.instancedCount : 1;
                            if (geometry.attributes.index) triangles += (geometry.attributes.index.count / 3) * instance;
                            else triangles += (geometry.attributes.position.count / 3) * instance;
                        }
                    });
                }

                domObjects.firstChild.textContent = `${objects}`;
                domLights.firstChild.textContent = `${lights}`;
                domVertices.firstChild.textContent = `${vertices}`;
                domTriangles.firstChild.textContent = `${triangles.toFixed(0)}`;

                domPrograms.firstChild.textContent = `${renderer.info?.programs}`;
                domGeometries.firstChild.textContent = `${renderer.info?.geometries}`;
                domTextures.firstChild.textContent = `${renderer.info?.textures}`;
            }
        };

        _singleton = this;
    }

    startFrame(renderer) {
        this.#startInternal(renderer);
    }

    endFrame(renderer) {
        this.#stopInternal(renderer);
    }

}

export { Debug };

/******************** INTERNAL ********************/

/** Gets a CSS variable, hyphens optional, ex: getVariable('--tooltip-delay') or getVariable('tooltip-delay') */
function getVariable(variable) {
    variable = String(variable);
    if (!variable.startsWith('--')) variable = '--' + variable;
    const rootElement = document.querySelector(':root');
    const value = getComputedStyle(rootElement).getPropertyValue(variable);
    return ((value === '') ? undefined : value);
}
