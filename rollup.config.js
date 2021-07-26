import eslint from '@rollup/plugin-eslint';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/vue-gl-troika-text.ts',
  output: {
    format: 'es',
    file: 'dist/vue-gl-troika-text.mjs'
  },
  plugins: [
    eslint(),
    nodeResolve({
      resolveOnly: [ './src/**/*' ]
    }),
    typescript()
  ]
};