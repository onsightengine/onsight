/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/

import { VERSION } from './src/constants.js';              // Pull in version

///// Plugins

import { terser } from 'rollup-plugin-terser';              // Remove comments, minify
import { visualizer } from 'rollup-plugin-visualizer';      // Visualize
import cleanup from 'rollup-plugin-cleanup';                // Remove comments, supports sourcemap
// import obfuscator from 'rollup-plugin-obfuscator';       // Obfuscate

///// Post Build Header

function header() {
	return {
		renderChunk(code) {
			return `/**
 * @description Onsight Engine
 * @about       Easy to use 2D / 3D JavaScript game engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v${VERSION}
 * @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
 * @source      https://github.com/onsightengine
 */
${code}`;
        }
    };
}

///// Builds

const builds = [

    { // Standard Build
        input: './src/Onsight.js',
        treeshake: false,
        external: p => /^three/.test(p),

        plugins: [
            cleanup({
                comments: "none",
                extensions: [ "js", "ts" ],
                sourcemap: false,
            }),
            header(),
        ],

        output: [{
            format: 'esm',
            file: './build/onsight.module.js',
            sourcemap: false,
        }],
    },

    { // Minified
        input: './src/Onsight.js',
        treeshake: false,
        external: p => /^three/.test(p),

        plugins: [
            header(),
            visualizer(),
        ],

        output: [{
            format: 'esm',
            file: './build/onsight.min.js',
            sourcemap: false,
            plugins: [
                terser({ format: { comments: false } }),
            ],
        }],
    },

    /**
    { // Obfuscated
        input: './src/Onsight.js',
        treeshake: false,
        external: p => /^three/.test(p),

        plugins: [
            obfuscator({ fileOptions: {}, globalOptions: {} }),
            header(),
        ],

        output: [{
            format: 'esm',
            file: './build/onsight.compile.js',
            sourcemap: false,
            plugins: [
                terser({ format: { comments: false } }),
            ],
        }],
    },
    **/

];

export default builds;
