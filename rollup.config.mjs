import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import preprocess from 'rollup-plugin-preprocess';
import clean from '@rollup-extras/plugin-clean';
import binify from '@rollup-extras/plugin-binify';
import externals from '@rollup-extras/plugin-externals';
import replace from '@rollup/plugin-replace';
import path from 'path';
import kleur from 'kleur';

const input = 'src/index.ts';

const dest = 'dist';

const plugins = [
    clean(),
    replace({
        delimiters: ['', ''],
        '#!/usr/bin/env node': ''
    }),
    externals({
        external: (id, external) => {
            const internals = ['pkgbld', '@rollup-extras', '@niceties', '@slimlib'];
            if (internals.includes(id)) {
                console.log('inlining', kleur.cyan(id));
                return false;
            }
            if (id.includes('node_modules')) {
                const relative = path.relative('.', id);
                for (const internal of internals) {
                    if (relative.startsWith(`node_modules/${internal}/`) && relative.indexOf('node_modules', 13) === -1) {
                        console.log('inlining', kleur.cyan(relative));
                        return false;
                    }
                }
            }
            return external;
        }
    }),
    resolve(),
    commonjs(),
    typescript(),
    binify()
];

export default {
    input,

    output: {
        format: 'cjs',
        dir: dest,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        interop: 'compat'
    },

    plugins: [preprocess.default({ include: [ 'src/index.ts' ], context: { esm: false } }), ...plugins]
};