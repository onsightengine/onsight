

export default [

	{
		input: './src/Onsight.js',
		treeshake: true,

		output: {

			name: 'onsight',
			extend: true,
			format: 'umd',
			file: './build/onsight.umd.cjs',
			sourcemap: true,

		},

	},

	{
		input: './src/Onsight.js',
		treeshake: false,

		output: {

			format: 'esm',
			file: './build/onsight.module.js',
			sourcemap: true,

		},

	}

];