import path from 'path'
import replace from '@rollup/plugin-replace'
import resolveNode from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import babelEnvConfig from './babel.env.config'
import { terser } from 'rollup-plugin-terser'
import webWorkerLoader from 'rollup-plugin-web-worker-loader';


const pkg = require(`./package.json`)
const version = pkg.version

const isProd = process.env.NODE_ENV === 'production'
const dist = file => path.resolve('dist/js/' + file)

function createReplacePlugin() {
    const replacements = {
        __COMMIT__: `"${process.env.COMMIT}"`,
        __VERSION__: `"${version}"`,
        __ENV__: `"${process.env.NODE_ENV}"`,
        __PROD__: isProd,
        __DEV__: !isProd,
    }
    Object.keys(replacements).forEach(key => {
        if (key in process.env) {
            replacements[key] = process.env[key]
        }
    })
    return replace({
        values: replacements,
        preventAssignment: true,
    })
}

const sdk_plugins = [
    resolveNode({
        mainFields: ['jsnext', 'main'],
        preferBuiltins: true,
        browser: true,
    }),
    babel(babelEnvConfig()),
    commonjs(),
    createReplacePlugin(),
    webWorkerLoader(/* configuration */),
]

if (isProd) {
    sdk_plugins.push(terser())
}

export default [
    {
        input: 'src/h264Decoder/index.js',
        //external: ['three'],
        output: [
            {
                globals: {
                   // three: 'THREE',
                },
                file: dist('video.js'),
                format: 'umd',
                name: 'Metaverse',
                sourcemap: !isProd,
                banner: pkg.banner.replace('${date}', new Date().toLocaleDateString()).replace('${author}', pkg.author).replace('${year}', new Date().getFullYear()),
            },
        ],
        plugins: sdk_plugins,
    },
]
