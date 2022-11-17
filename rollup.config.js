

export default [

	{
		input: './src/Onsight.js',
		treeshake: true,
		external: p => /^three/.test( p ),

		output: {

			name: 'onsight',
			extend: true,
			format: 'umd',
			file: './build/onsight.umd.cjs',
			sourcemap: true,

			globals: p => /^three/.test( p ) ? 'THREE' : null,

		},

	},

	{
		input: './src/Onsight.js',
		treeshake: false,
		external: p => /^three/.test( p ),

		output: {

			format: 'esm',
			file: './build/onsight.module.js',
			sourcemap: true,

		},

	}

];