/*
 * @Author: Rindy
 * @Date: 2021-04-01 09:34:54
 * @LastEditors: Rindy
 * @LastEditTime: 2021-04-30 14:20:31
 * @Description: 注释
 */
const execa = require('execa')
const args = require('minimist')(process.argv.slice(2))
const formats = args.formats || args.f
const sourceMap = args.sourcemap || args.s
const env = args.env || 'development'
let startup = '-wc'

if (env != 'development') {
    startup = '-c'
}

execa('rollup', [startup, '--environment', [`NODE_ENV:${env}`, `FORMATS:${formats || 'esm-browser'}`, sourceMap ? `SOURCE_MAP:true` : ``].filter(Boolean).join(',')], {
    stdio: 'inherit',
})
