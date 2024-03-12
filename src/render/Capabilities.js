// https://www.khronos.org/registry/webgl/extensions/
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

class Capabilities {

    constructor(renderer) {
        const gl = renderer.gl;

        // Extensions
        const anisotropicExt = renderer.getExtension('EXT_texture_filter_anisotropic');
        const debugExt = renderer.getExtension('WEBGL_debug_renderer_info');

        // Shaders
        this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        this.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
        this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

        this.maxPrecision = 'lowp';
        if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
            gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0
        ) this.maxPrecision = 'highp';
        else if (
            gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
            gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0
        ) this.maxPrecision = 'mediump';

        // Textures
        this.maxFragmentTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this.maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        this.maxArrayTextureLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
        this.maxAnisotropy = (anisotropicExt) ? gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;

        // Renderer
        this.maxSamples = gl.getParameter(gl.MAX_SAMPLES);

        // Framebuffers
        this.drawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);

        // Render Target Types
        this.byteTargets = checkRenderTargetSupport(gl, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE);
        this.floatTargets = checkRenderTargetSupport(gl, gl.RGBA32F, gl.RGBA, gl.FLOAT);
        this.halfFloatTargets = checkRenderTargetSupport(gl, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);

        // Console Logger
        this.toHtml = function() {
            const debugRenderer = (debugExt) ? `Unmasked Renderer: <span class="Light">${gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL)}</span> <br />` : ``;
            const debugVendor = (debugExt) ? `Unmasked Vendor: <span class="Light">${gl.getParameter(debugExt.UNMASKED_VENDOR_WEBGL)}</span> <br />` : ``;
            return `
                <details open="true">
                <summary>Browser</summary>
                Platform: <span class="Light">${(navigator.userAgentData) ? navigator.userAgentData.platform : navigator.platform}</span> <br />
                User Agent: <span class="Light">${navigator.userAgent}</span> <br />
                </details>
                <details open="true">
                <summary>WebGL</summary>
                WebGL Version: <span class="Light">${gl.getParameter(gl.VERSION)}</span> <br />
                WebGL Vendor: <span class="Light">${gl.getParameter(gl.VENDOR)}</span> <br />
                WebGL Renderer: <span class="Light">${gl.getParameter(gl.RENDERER)}</span> <br />
                Shading Language: <span class="Light">${gl.getParameter(gl.SHADING_LANGUAGE_VERSION)}</span> <br />
                ${debugRenderer}
                ${debugVendor}
                </details>
                <details open="true">
                <summary>Shaders</summary>
                Max Shader Precision: <span class="Light">${this.maxPrecision}</span> <br />
                Max Vertex Attributes: <span class="Light">${this.maxAttributes}</span> <br />
                Max Varying Vectors: <span class="Light">${this.maxVaryings}</span> <br />
                Max Vertex Uniform Vectors: <span class="Light">${this.maxVertexUniforms}</span> <br />
                Max Fragment Uniform Vectors: <span class="Light">${this.maxFragmentUniforms}</span> <br />
                </details>
                <details open="true">
                <summary>Textures</summary>
                Max Fragment Textures: <span class="Light">${this.maxFragmentTextures}</span> <br />
                Max Vertex Textures: <span class="Light">${this.maxVertexTextures}</span> <br />
                Max Combined Textures: <span class="Light">${this.maxTextures}</span> <br />
                Max 2D Texture Size: <span class="Light">${this.maxTextureSize}</span> <br />
                Max Cube Texture Size: <span class="Light">${this.maxCubemapSize}</span> <br />
                Max Array Texture Layers: <span class="Light">${this.maxArrayTextureLayers}</span> <br />
                Max Texture Anisotropy: <span class="Light">${this.maxAnisotropy}</span> <br />
                </details>
                <details open="true">
                <summary>Renderer</summary>
                Point Size Range: <span class="Light">${gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[0]} - ${gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1]}</span> <br />
                Line Width Range: <span class="Light">${gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)[0]} - ${gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)[1]}</span> <br />
                Max Viewport Dimensions: <span class="Light">${gl.getParameter(gl.MAX_VIEWPORT_DIMS)[0]} - ${gl.getParameter(gl.MAX_VIEWPORT_DIMS)[1]}</span> <br />
                Max Renderbuffer Size: <span class="Light">${gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)}</span> <br />
                Max Fragment Shader Multiple Render Targets: <span class="Light">${this.drawBuffers}</span> <br />
                Max MSAA Samples: <span class="Light">${this.maxSamples}</span> <br />
                </details>
                <details open="true">
                <summary>Framebuffer</summary>
                Framebuffer Red Bits: <span class="Light">${gl.getParameter(gl.RED_BITS)}</span> <br />
                Framebuffer Green Bits: <span class="Light">${gl.getParameter(gl.GREEN_BITS)}</span> <br />
                Framebuffer Blue Bits: <span class="Light">${gl.getParameter(gl.BLUE_BITS)}</span> <br />
                Framebuffer Alpha Bits: <span class="Light">${gl.getParameter(gl.ALPHA_BITS)}</span> <br />
                Framebuffer Depth Bits: <span class="Light">${gl.getParameter(gl.DEPTH_BITS)}</span> <br />
                Framebuffer Stencil Bits: <span class="Light">${gl.getParameter(gl.STENCIL_BITS)}</span> <br />
                Framebuffer Subpixel Bits: <span class="Light">${gl.getParameter(gl.SUBPIXEL_BITS)}</span> <br />
                </details>
                <details open="true">
                <summary>Framebuffer Types</summary>
                Support for Unsigned Byte Render Targets: <span class="Light">${this.byteTargets}</span> <br />
                Support for Float Render Targets: <span class="Light">${this.floatTargets}</span> <br />
                Support for Half Float Render Targets: <span class="Light">${this.halfFloatTargets}</span> <br />
                </details>
                <details open="true">
                <summary>Supported Extensions</summary>
                ${gl.getSupportedExtensions().join('<br />')} <br />
                </details>
            `;
        };
    }

}

export { Capabilities };

/******************** INTERNAL ********************/

function checkRenderTargetSupport(gl, internalFormat, format, type) {
    // Create temp framebuffer and texture
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 2, 2, 0, format, type, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // Check framebuffer status
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    // Clean up
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return (status === gl.FRAMEBUFFER_COMPLETE);
};
