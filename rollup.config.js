import pkg from './package.json'

import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default [
  // UMD
  {
    input: pkg.entry,
    output: {
      file: pkg.unpkg + ".js",
      name: pkg.name,
      sourcemap: false,
      format: 'umd',
    },
    plugins: [
      nodeResolve({
        preferBuiltins: false
      }),
      commonjs(),
      globals(),
      builtins()
    ]
  },

  // ESMODULE
   {
     input: pkg.entry,
     output: {
       file: pkg.module,
       name: pkg.name,
       sourcemap: true,
       format: 'es'
     },
     external: [
       ...Object.keys(pkg.dependencies || {}),
     ],
     plugins: [
       nodeResolve({
         preferBuiltins: false
       }),
       commonjs(),
       globals(),
       builtins()
     ]
   },



   // CJS
  {
    input: pkg.entry,
    output: {
      file: pkg.main,
      name: pkg.name,
      sourcemap: true,
      format: 'cjs'
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
    ],

    plugins: [
      nodeResolve({
        preferBuiltins: false
      }),
      commonjs(),
      globals(),
      builtins()
    ]
  }

]
