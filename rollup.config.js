import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: [ 'src/index.ts' ],
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      terser({
        keep_classnames: true,
        keep_fnames: true
      }),
    ],
  }
];
