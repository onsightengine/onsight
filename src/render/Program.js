// TODO: upload empty texture if null ? maybe not
// TODO: upload identity matrix if null ?
// TODO: sampler Cube

import { uuid } from '../math/MathUtils.js';

const _arrayCacheF32 = {};   // cache of typed arrays used to flatten uniform arrays
let _idGenerator = 1;

class Program {

    constructor({
        vertex,
        fragment,
        uniforms = {},
        defines = {},

        transparent = false,
        cullFace = renderer.gl.BACK, // FRONT, BACK, FRONT_AND_BACK
        frontFace = renderer.gl.CCW,
        depthTest = true,
        depthWrite = true,
        depthFunc = renderer.gl.LESS,
    } = {}) {
        if (!renderer) console.error(`Program: Renderer not found`);
        if (!vertex) console.warn('Program: Vertex shader not supplied');
        if (!fragment) console.warn('Program: Fragment shader not supplied');
        const gl = renderer.gl;

        this.uuid = uuid();
        this.id = _idGenerator++;
        this.uniforms = uniforms;

        // Store program state
        this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};

        // Default blendFunc
        this.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        // this.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Incerase program count
        renderer.info.programs++;

        // Compile shaders, build program
        this.buildProgram({ vertex, fragment, defines });
    }

    buildProgram({ vertex, fragment, defines } = {}) {
        const gl = renderer.gl;

        // Add defines to shaders
        const customDefines = generateDefines(defines);

        let prefixVertex = [
            customDefines
        ].filter(filterEmptyLine).join('\n');
        if (prefixVertex.length > 0) prefixVertex += '\n';

        let prefixFragment = [
            customDefines
        ].filter(filterEmptyLine).join('\n');
        if (prefixFragment.length > 0) prefixFragment += '\n';

        let vertexGlsl, fragmentGlsl;
        if (vertex.includes('#version 300 es')) {
            vertexGlsl = '#version 300 es\n' + prefixVertex + vertex.replace('#version 300 es', '');
        } else vertexGlsl = prefixVertex + vertex;
        if (fragment.includes('#version 300 es')) {
            fragmentGlsl = '#version 300 es\n' + prefixFragment + fragment.replace('#version 300 es', '');
        } else fragmentGlsl = prefixFragment + fragment;

        // Compile vertex shader and log errors
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexGlsl);
        gl.compileShader(vertexShader);
        if (gl.getShaderInfoLog(vertexShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
        }

        // Compile fragment shader and log errors
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentGlsl);
        gl.compileShader(fragmentShader);
        if (gl.getShaderInfoLog(fragmentShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
        }

        // Check if was built before, if so delete
        if (this.program) {
            gl.deleteProgram(this.program);
            renderer.state.currentProgram = -1; // force gl program update 'this.use()'
        }

        // Compile program and log errors
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            return console.warn(gl.getProgramInfoLog(this.program));
        }

        renderer.programs[this.id] = this.program;

        // Remove shader once linked
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        // Get active uniform locations
        this.uniformLocations = new Map();
        const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
            const uniform = gl.getActiveUniform(this.program, uIndex);
            this.uniformLocations.set(uniform, gl.getUniformLocation(this.program, uniform.name));

            // split uniforms' names to separate array and struct declarations
            const split = uniform.name.match(/(\w+)/g);

            uniform.uniformName = split[0];

            if (split.length === 3) {
                uniform.isStructArray = true;
                uniform.structIndex = Number(split[1]);
                uniform.structProperty = split[2];
            } else if (split.length === 2 && isNaN(Number(split[1]))) {
                uniform.isStruct = true;
                uniform.structProperty = split[1];
            }
        }

        // Get active attribute locations
        this.attributeLocations = new Map();
        const locations = [];
        const numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
            const attribute = gl.getActiveAttrib(this.program, aIndex);
            const location = gl.getAttribLocation(this.program, attribute.name);
            if (location === -1) continue; // Ignore special built-in inputs. eg gl_VertexID, gl_InstanceID
            locations[location] = attribute.name;
            this.attributeLocations.set(attribute, location);
        }
        this.attributeOrder = locations.join('');

        // // DEBUG
        // console.log(this.attributeOrder);
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        this.blendFunc.src = src;
        this.blendFunc.dst = dst;
        this.blendFunc.srcAlpha = srcAlpha;
        this.blendFunc.dstAlpha = dstAlpha;
        if (src) this.transparent = true;
    }

    setBlendEquation(modeRGB, modeAlpha) {
        this.blendEquation.modeRGB = modeRGB;
        this.blendEquation.modeAlpha = modeAlpha;
    }

    applyState() {
        const gl = renderer.gl;

        if (this.depthTest) renderer.enable(gl.DEPTH_TEST);
        else renderer.disable(gl.DEPTH_TEST);

        if (this.cullFace) renderer.enable(gl.CULL_FACE);
        else renderer.disable(gl.CULL_FACE);

        if (this.blendFunc.src) renderer.enable(gl.BLEND);
        else renderer.disable(gl.BLEND);

        if (this.cullFace) renderer.setCullFace(this.cullFace);
        renderer.setFrontFace(this.frontFace);
        renderer.setDepthMask(this.depthWrite);
        renderer.setDepthFunc(this.depthFunc);
        if (this.blendFunc.src) renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
        renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
    }

    use({ flipFaces = false } = {}) {
        const gl = renderer.gl;
        let textureUnit = -1;

        // Avoid gl call if program already in use
        const programActive = (renderer.state.currentProgram === this.id);
        if (!programActive) {
            gl.useProgram(this.program);
            renderer.state.currentProgram = this.id;
        }

        // Set only the active uniforms found in the shader
        this.uniformLocations.forEach((location, activeUniform) => {
            let name = activeUniform.uniformName;

            // Get supplied uniform
            let uniform = this.uniforms[name];

            // For structs, get the specific property instead of the entire object
            if (activeUniform.isStruct) {
                uniform = uniform[activeUniform.structProperty];
                name += `.${activeUniform.structProperty}`;
            }
            if (activeUniform.isStructArray) {
                uniform = uniform[activeUniform.structIndex][activeUniform.structProperty];
                name += `[${activeUniform.structIndex}].${activeUniform.structProperty}`;
            }

            if (!uniform) {
                return warn(`Active uniform ${name} has not been supplied`);
            }

            if (uniform && uniform.value === undefined) {
                return warn(`${name} uniform is missing a value parameter`);
            }

            if (uniform.value.texture) {
                textureUnit = textureUnit + 1;

                // Check if texture needs to be updated
                uniform.value.update(textureUnit);
                return setUniform(gl, activeUniform.type, location, textureUnit);
            }

            // For texture arrays, set uniform as an array of texture units instead of just one
            if (uniform.value.length && uniform.value[0].texture) {
                const textureUnits = [];
                uniform.value.forEach((value) => {
                    textureUnit = textureUnit + 1;
                    value.update(textureUnit);
                    textureUnits.push(textureUnit);
                });

                return setUniform(gl, activeUniform.type, location, textureUnits);
            }

            setUniform(gl, activeUniform.type, location, uniform.value);
        });

        this.applyState();
        if (flipFaces) renderer.setFrontFace(this.frontFace === gl.CCW ? gl.CW : gl.CCW);
    }

    flush() {
        renderer.gl.deleteProgram(this.program);
        this.program = undefined;
        renderer.info.programs--;
    }

}

export { Program };

/******************** INTERNAL ********************/

function setUniform(gl, type, location, value) {
    value = value.length ? flatten(value) : value;
    const setValue = renderer.state.uniformLocations.get(location);

    // Avoid redundant uniform commands
    if (value.length) {
        if (setValue === undefined || setValue.length !== value.length) {
            // Clone array to store as cache
            renderer.state.uniformLocations.set(location, value.slice(0));
        } else {
            if (arraysEqual(setValue, value)) return;

            // Update cached array values
            setValue.set ? setValue.set(value) : setArray(setValue, value);
            renderer.state.uniformLocations.set(location, setValue);
        }
    } else {
        if (setValue === value) return;
        renderer.state.uniformLocations.set(location, value);
    }

    // TYPES, https://registry.khronos.org/webgl/specs/latest/1.0/#DOM-WebGLActiveInfo-type
    switch (type) {
        case 5126: // FLOAT
            if (value.length) return gl.uniform1fv(location, value);
            return gl.uniform1f(location, value);
        case 35664: // FLOAT_VEC2       0x8B50
            return gl.uniform2fv(location, value);
        case 35665: // FLOAT_VEC3       0x8B51
            return gl.uniform3fv(location, value);
        case 35666: // FLOAT_VEC4       0x8B52
            return gl.uniform4fv(location, value);
        case 35667: // INT_VEC2         0x8B53
        case 35671: // BOOL_VEC2        0x8B57
            return gl.uniform2iv(location, value);
        case 35668: // INT_VEC3         0x8B54
        case 35672: // BOOL_VEC3        0x8B58
            return gl.uniform3iv(location, value);
        case 35669: // INT_VEC4         0x8B55
        case 35673: // BOOL_VEC4        0x8B59
            return gl.uniform4iv(location, value);
        case 35674: // FLOAT_MAT2       0x8B5A
            return gl.uniformMatrix2fv(location, false, value);
        case 35675: // FLOAT_MAT3       0x8B5B
            return gl.uniformMatrix3fv(location, false, value);
        case 35676: // FLOAT_MAT4       0x8B5C
            return gl.uniformMatrix4fv(location, false, value);
        case 5124:  // INT
        case 35670: // BOOL             0x8B56
        case 35678: // SAMPLER_2D       0x8B5E
        case 35680: // SAMPLER_CUBE     0x8B60
            if (value.length) return gl.uniform1iv(location, value); /* is array */
            return gl.uniform1i(location, value); /* not array */
    }
}

function addLineNumbers(string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
}

function flatten(a) {
    const arrayLen = a.length;
    const valueLen = a[0].length;
    if (valueLen === undefined) return a;
    const length = arrayLen * valueLen;
    let value = _arrayCacheF32[length];
    if (!value) _arrayCacheF32[length] = value = new Float32Array(length);
    for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
    return value;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0, l = a.length; i < l; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function setArray(a, b) {
    for (let i = 0, l = a.length; i < l; i++) {
        a[i] = b[i];
    }
}

let warnCount = 0;
function warn(message) {
    if (warnCount > 100) return;
    console.warn(message);
    warnCount++;
    if (warnCount > 100) console.warn('Program: More than 100 program warnings - stopping logs');
}

/**
 * Generates a string list of defines from an object ({ FLAT_SHADING: true, etc. });
 * @param {Object} defines
 * @returns {String}
 */
function generateDefines(defines) {
    const chunks = [];
    for (const name in defines) {
        const value = defines[name];
        if (value === false) continue;
        chunks.push('#define ' + name + ' ' + value);
    }
    return chunks.join('\n');
}

function filterEmptyLine(string) {
    return string !== '';
}
