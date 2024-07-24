import cleanup from 'rollup-plugin-cleanup';                    // Remove comments, supports sourcemap
import json from '@rollup/plugin-json';                         // Import JSON
import terser from '@rollup/plugin-terser';                     // Remove comments, minify
import { visualizer } from 'rollup-plugin-visualizer';          // Visualize

import pkg from './package.json' with { type: "json" };

function header() {
    return {
        renderChunk(code) {
            return `/**
 * @description Onsight Engine
 * @about       Interactive, easy to use JavaScript game framework.
 * @author      Stephens Nunnally <@stevinz>
 * @version     v${pkg.version}
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/onsightengine/onsight
 */
${code}`;
        }
    };
}

const builds = [

    { // Standard Build
        input: [ './src/Onsight.js' ],
        treeshake: false,

        plugins: [
            json(),
            cleanup({
                comments: "none",
                extensions: [ "js", "ts" ],
                sourcemap: false,
            }),
        ],

        output: [{
            format: 'esm',
            file: './dist/onsight.module.js',
            sourcemap: false,
            plugins: [
                header(),
            ],
        }],
    },

    { // Minified
        input: [ './src/Onsight.js' ],
        treeshake: false,

        plugins: [
            json(),
            visualizer(),
        ],

        output: [{
            format: 'esm',
            file: './dist/onsight.min.js',
            sourcemap: false,
            plugins: [
                terser({ format: { comments: false } }),
                header(),
            ],
        }],
    },

    { // Light (No Extras) Build
        input: './src/Core.js',
        treeshake: false,

        plugins: [
            json(),
            cleanup({
                comments: "none",
                extensions: [ "js", "ts" ],
                sourcemap: false,
            }),
        ],

        output: [{
            format: 'esm',
            file: './dist/onsight.light.js',
            sourcemap: false,
            plugins: [
                header(),
            ],
        }],
    },

];

export default builds;
