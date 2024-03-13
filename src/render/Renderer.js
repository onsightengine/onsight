
// NOTE: Not automatic, must use these methods manually
// gl.clearColor( r, g, b, a );
// gl.colorMask( colorMask, colorMask, colorMask, colorMask );
// gl.stencilMask( stencilMask );
// gl.stencilFunc( stencilFunc, stencilRef, stencilMask );
// gl.stencilOp( stencilFail, stencilZFail, stencilZPass );
// gl.clearStencil( stencil );

// TODO: Handle context loss https://www.khronos.org/webgl/wiki/HandlingContextLost

import { Color } from '../math/Color.js';
import { Maths } from '../utils/Maths.js';
import { Vec3 } from '../math/Vec3.js';

const _tempVec3 = new Vec3();
let _idGenerator = 1;

class Renderer {

    #contextLost = false;

    constructor({
        depth = true,                               // drawing buffer has depth buffer (at least 16 bits)?
        stencil = false,                            // drawing buffer has stencil buffer (at least 8 bits)?
        antialias = false,                          // perform anti-aliasing if possible?
        powerPreference = 'default',                // 'default', 'low-power', 'high-performance'
        preserveDrawingBuffer = false,              // true is slower, mostly not needed
        canvas = document.createElement('canvas'),  // canvas to use
        dpr = 1,                                    // window.devicePixelRatio
    } = {}) {

        // Properties
        this.uuid = Maths.uuid();
        this.id = _idGenerator++;
        this.dpr = dpr;

        this.color = true;
        this.depth = depth;
        this.stencil = stencil;

        // Draw info
        this.currentGeometry = null;                // active geometry
        this.drawCallCount = 0;                     // count draw calls in frame
        this.lastScene = null;                      // last rendered scene

        this.info = {
            programs: 0,
            geometries: 0,
            textures: 0,
        };

        // WebGL attributes
        const attributes = {
            // NOTE: About 'alpha', here we force canvas to have alpha buffer for performance reasons
            // If using destination blending (such as with weighted, blended order independent transparency),
            // will need to set alpha channel to 1.0 to avoid color errors.
            // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#avoid_alphafalse_which_can_be_expensive
            alpha: true,
            depth,
            stencil,
            antialias,
            failIfMajorPerformanceCaveat: true,
            powerPreference,
            preserveDrawingBuffer,
        };

        /** @type {WebGL2RenderingContext} */
        let gl;

        // WebGL2 Context
        gl = canvas.getContext('webgl2', attributes);
        if (!gl) console.error('Renderer: Unable to create WebGL 2 context');
        this.gl = gl;

        // GLOBAL: So all classes have access to internal state functions
        window.renderer = this;

        // WebGL state stores to avoid redundant calls on methods used internally
        this.state = {};
        this.state.blendFunc = { src: gl.ONE, dst: gl.ZERO };
        this.state.blendEquation = { modeRGB: gl.FUNC_ADD };
        this.state.cullFace = null;
        this.state.frontFace = gl.CCW;
        this.state.depthMask = true;
        this.state.depthFunc = gl.LESS;
        this.state.premultiplyAlpha = false;
        this.state.flipY = false;
        this.state.unpackAlignment = 4;
        this.state.framebuffer = null;
        this.state.viewport = { x: 0, y: 0, width: null, height: null };
        this.state.textureUnits = [];
        this.state.activeTextureUnit = 0;
        this.state.boundBuffer = null;
        this.state.uniformLocations = new Map();
        this.state.currentProgram = null;

        // Programs
        this.programs = {};
        this.extensions = {};

        // Context
        function initContext(self) {
            self.extensions = {};
            self.getExtension('EXT_color_buffer_float');
            self.getExtension('EXT_color_buffer_half_float');
            self.getExtension('EXT_texture_compression_bptc');
            self.getExtension('OES_texture_float_linear');
            self.getExtension('WEBGL_compressed_texture_astc');
            self.getExtension('WEBGL_compressed_texture_etc1');
            self.getExtension('WEBGL_compressed_texture_s3tc');
            self.getExtension('WEBGL_compressed_texture_pvrtc');
            self.getExtension('WEBGL_multisampled_render_to_texture');

            self.maxAnisotropy = 0;
            if (self.extensions['EXT_texture_filter_anisotropic']) {
                const extension = self.extensions['EXT_texture_filter_anisotropic'];
                this.maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            }
        };
        initContext(this);

        // Context lost
        self.loseContext = this.getExtension('WEBGL_lose_context');
        gl.canvas.addEventListener('webglcontextlost', function(event) {
            event.preventDefault();
            console.log('Renderer: Context lost');
            this.#contextLost = true;
        }.bind(this));

        gl.canvas.addEventListener('webglcontextrestored', function(event) {
            console.log('Renderer: Context restored');
            initContext(this);
            this.#contextLost = false;
        }.bind(this));
    }

    getExtension(name, logWarning = false) {
        if (!this.extensions[name]) this.extensions[name] = this.gl.getExtension(name);
        if (!this.extensions[name] && logWarning) {
            console.warn(`Renderer.getExtension: ${name} extension not supported.`);
        }
        return this.extensions[name];
    }

    /** Typically (window.innerWidth, window.innerHeight) */
    setSize(width, height, updateStyle = true) {
        this.width = width;
        this.height = height;

        if (this.gl.canvas.width !== width || this.gl.canvas.height !== height) {
            this.gl.canvas.width = width * this.dpr;
            this.gl.canvas.height = height * this.dpr;

            if (updateStyle && this.gl.canvas.style) {
                this.gl.canvas.style.width = width + 'px';
                this.gl.canvas.style.height = height + 'px';
            }
        }
    }

    setViewport(width, height, x = 0, y = 0) {
        if (this.state.viewport.width === width && this.state.viewport.height === height) return;
        this.state.viewport.width = width;
        this.state.viewport.height = height;
        this.state.viewport.x = x;
        this.state.viewport.y = y;
        this.gl.viewport(x, y, width, height);
    }

    setScissor(width, height, x = 0, y = 0) {
        this.gl.scissor(x, y, width, height);
    }

    enable(id) {
        if (this.state[id] === true) return;
        this.gl.enable(id);
        this.state[id] = true;
    }

    disable(id) {
        if (this.state[id] === false) return;
        this.gl.disable(id);
        this.state[id] = false;
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        if (
            this.state.blendFunc.src === src &&
            this.state.blendFunc.dst === dst &&
            this.state.blendFunc.srcAlpha === srcAlpha &&
            this.state.blendFunc.dstAlpha === dstAlpha
        ) return;
        this.state.blendFunc.src = src;
        this.state.blendFunc.dst = dst;
        this.state.blendFunc.srcAlpha = srcAlpha;
        this.state.blendFunc.dstAlpha = dstAlpha;
        if (srcAlpha !== undefined) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
        else this.gl.blendFunc(src, dst);
    }

    setBlendEquation(modeRGB, modeAlpha) {
        modeRGB = modeRGB || this.gl.FUNC_ADD;
        if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
        this.state.blendEquation.modeRGB = modeRGB;
        this.state.blendEquation.modeAlpha = modeAlpha;
        if (modeAlpha !== undefined) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        else this.gl.blendEquation(modeRGB);
    }

    setCullFace(value) {
        if (this.state.cullFace === value) return;
        this.state.cullFace = value;
        this.gl.cullFace(value);
    }

    setFrontFace(value) {
        if (this.state.frontFace === value) return;
        this.state.frontFace = value;
        this.gl.frontFace(value);
    }

    setDepthMask(value) {
        if (this.state.depthMask === value) return;
        this.state.depthMask = value;
        this.gl.depthMask(value);
    }

    setDepthFunc(value) {
        if (this.state.depthFunc === value) return;
        this.state.depthFunc = value;
        this.gl.depthFunc(value);
    }

    activeTexture(value) {
        if (this.state.activeTextureUnit === value) return;
        this.state.activeTextureUnit = value;
        this.gl.activeTexture(this.gl.TEXTURE0 + value);
    }

    bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
        if (this.state.framebuffer === buffer) return;
        this.state.framebuffer = buffer;
        this.gl.bindFramebuffer(target, buffer);
    }

    clearActiveGeometry() {
        this.gl.bindVertexArray(null);
        this.currentGeometry = null;
    }

    sortOpaque(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else if (a.zDepth !== b.zDepth) {
            return a.zDepth - b.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortTransparent(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth) {
            return b.zDepth - a.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortUI(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else {
            return b.id - a.id;
        }
    }

    getRenderList({
        scene,
        camera,
        frustumCull,
        sort
    } = {}) {
        if (camera && frustumCull) camera.updateFrustum();

        // Get visible objects
        let renderList = [];
        scene.traverse((node) => {
            if (!node.visible) return true; /* stop traversing children (all children become invisible) */
            if (!node.draw) return;
            if (frustumCull && node.frustumCulled && camera && !camera.frustumIntersectsMesh(node)) return;
            renderList.push(node);
        });

        // Sort? (sorting opaque objects is still desired to stop overdraw)
        if (sort) {
            const opaque = [];
            const transparent = [];     // depthTest true
            const ui = [];              // depthTest false

            renderList.forEach((node) => {
                // Split into the 3 render groups
                if (!node.program.transparent) {
                    opaque.push(node);
                } else if (node.program.depthTest) {
                    transparent.push(node);
                } else {
                    ui.push(node);
                }

                node.zDepth = 0;

                // Only calculate z-depth if renderOrder unset and depthTest is true
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;

                // Update z-depth
                node.worldMatrix.getTranslation(_tempVec3);
                _tempVec3.applyMatrix4(camera.projectionViewMatrix);
                node.zDepth = _tempVec3.z;
            });

            opaque.sort(this.sortOpaque);
            transparent.sort(this.sortTransparent);
            ui.sort(this.sortUI);

            renderList = [...opaque, ...transparent, ...ui];
        }

        return renderList;
    }

    prepRender({
        scene,
        camera,
        target = null,
        update = true,
        clear = true,
    } = {}) {
        if (!target) {
            this.bindFramebuffer();         // to screen
            this.setViewport(this.width * this.dpr, this.height * this.dpr);
        } else {
            this.bindFramebuffer(target);   // to framebuffer
            this.setViewport(target.width, target.height);
        }

        if (clear) {
            // Ensure depth buffer writing is enabled so it can be cleared
            if (this.depth && (!target || target.depth)) {
                this.enable(this.gl.DEPTH_TEST);
                this.setDepthMask(true);
            }
            const clearColor = (this.color) ? this.gl.COLOR_BUFFER_BIT : 0;
            const clearDepth = (this.depth) ? this.gl.DEPTH_BUFFER_BIT : 0;
            const clearStencil = (this.stencil) ? this.gl.STENCIL_BUFFER_BIT : 0;
            this.gl.clear(clearColor | clearDepth | clearStencil);
        }

        // Update all scene graph matrices
        if (update) scene.updateMatrixWorld();

        // Update camera separately (in case not in scene graph)
        if (camera) camera.updateMatrixWorld();
    };

    render({
        scene,
        camera,
        target = null,
        update = true,
        sort = true,
        frustumCull = true,
        clear = true,
        draw = true,
    } = {}) {
        if (this.#contextLost) return;

        // Clear / update
        this.prepRender({ scene, camera, target, update, clear });

        // Get render list (entails culling and sorting)
        const renderList = this.getRenderList({ scene, camera, frustumCull, sort });

        // Render objects
        if (draw) renderList.forEach(node => node.draw({ camera }));

        // Return list
        this.lastScene = scene;
        return renderList;
    }

}

export { Renderer };
