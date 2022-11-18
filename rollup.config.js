import { REVISION } from './src/constants.js';
import { terser } from 'rollup-plugin-terser';
import cleanup from "rollup-plugin-cleanup";
// import obfuscator from 'rollup-plugin-obfuscator';

function header() {
	return {
		renderChunk(code) {
			return `/**
 * @description Onsight Engine
 * @about       Powerful, easy-to-use JavaScript video game and application creation engine.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v${REVISION}
 * @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
 * @source      https://github.com/onsightengine/onsight
 */
${code}`;
        }
    };
}

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
