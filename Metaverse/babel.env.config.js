export default function (env) {
    return {
        babelrc: false,
        exclude: ['node_modules/**', /core-js/],
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false,
                },
            ],
        ],
        plugins: [
            ['@babel/plugin-transform-runtime'],
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            ['@babel/plugin-proposal-private-methods', { loose: true }],
            ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
        ],
        babelHelpers: 'runtime',
    }
}
