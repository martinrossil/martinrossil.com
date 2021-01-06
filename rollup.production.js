import { version } from './package.json';
import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import filesize from 'rollup-plugin-filesize';
import typescript from 'rollup-plugin-typescript2';
// import strip from '@rollup/plugin-strip';
export default {
        input: './src/MartinRossil.ts',
        // eslint-disable-next-line
        onwarn: function(warning, warn) {
            if (warning.code === 'INPUT_HOOK_IN_OUTPUT_PLUGIN') {
                return;
            }
            if (warning.code === 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') {
                return;
            }
            warn(warning);
        },
        plugins: [
            clear({ targets: ['public'] }),
            resolve(),
            copy({
                targets: [
                    { src: 'assets/fonts/**.*', dest: 'public' },
                    { src: 'assets/production/icons/**.*', dest: 'public' },
                    {
                        src: 'assets/production/**.*',
                        dest: 'public',
                        transform: (contents) => contents.toString().replace('{{version}}', version).replace('{{version}}', version)
                    }
                ]
            }),
            typescript({ tsconfig: 'tsconfig.production.json' })// ,
            // strip({ include: '**/*.ts' })
        ],
        output: [
            {
                entryFileNames: '[name].' + version + '.es2019.js',
                chunkFileNames: '[name].' + version + '.es2019.js',
                dir: './public/',
                format: 'esm',
                plugins: [
                    compiler({
                        language_in: 'ECMASCRIPT_NEXT',
                        compilation_level: 'ADVANCED',
                        language_out: 'ECMASCRIPT_2019'
                    }),
                    filesize({ showBrotliSize: true })
                ]
            },
            {
                entryFileNames: '[name].' + version + '.es2018.js',
                chunkFileNames: '[name].' + version + '.es2018.js',
                dir: './public/',
                format: 'esm',
                plugins: [
                    compiler({
                        language_in: 'ECMASCRIPT_NEXT',
                        compilation_level: 'ADVANCED',
                        language_out: 'ECMASCRIPT_2018'
                    }),
                    filesize({ showBrotliSize: true })
                ]
            },
            {
                entryFileNames: '[name].' + version + '.es2017.js',
                chunkFileNames: '[name].' + version + '.es2017.js',
                dir: './public/',
                format: 'esm',
                plugins: [
                    compiler({
                        language_in: 'ECMASCRIPT_NEXT',
                        compilation_level: 'ADVANCED',
                        language_out: 'ECMASCRIPT_2017'
                    }),
                    filesize({ showBrotliSize: true })
                ]
            },
            {
                entryFileNames: '[name].' + version + '.es2016.js',
                chunkFileNames: '[name].' + version + '.es2016.js',
                dir: './public/',
                format: 'esm',
                plugins: [
                    compiler({
                        language_in: 'ECMASCRIPT_NEXT',
                        compilation_level: 'ADVANCED',
                        language_out: 'ECMASCRIPT_2016'
                    }),
                    filesize({ showBrotliSize: true })
                ]
            },
            {
                entryFileNames: '[name].' + version + '.es2015.js',
                chunkFileNames: '[name].' + version + '.es2015.js',
                dir: './public/',
                format: 'esm',
                plugins: [
                    compiler({
                        language_in: 'ECMASCRIPT_NEXT',
                        compilation_level: 'ADVANCED',
                        language_out: 'ECMASCRIPT_2015'
                    }),
                    filesize({ showBrotliSize: true })
                ]
            },
            {
                entryFileNames: '[name].' + version + '.es5.js',
                dir: './public/',
                inlineDynamicImports: true, // this has to be last, otherwise we get split chunk errors
                format: 'iife',
                plugins: [
                    compiler({
                        language_in: 'ECMASCRIPT_NEXT',
                        compilation_level: 'ADVANCED',
                        language_out: 'ECMASCRIPT5'
                    }),
                    filesize({ showBrotliSize: true })
                ]
            }
        ]
    };
