const path = require('path');

var config = {
    entry: './src/ts/main/script.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    }
}

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.mode = 'development';
        config.devtool = 'eval-source-map';
        config.plugins = [
            new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") }),
        ]
    }
    if (argv.mode === 'production') {
        config.mode = 'production';
        config.performance = {
            hints: 'warning'
        };
        config.optimization = {
            mangleExports: 'deterministic',
            chunkIds: 'deterministic',
            moduleIds: 'deterministic',
            nodeEnv: 'production',
            flagIncludedChunks: true,
            concatenateModules: true,
            emitOnErrors: false,
            checkWasmTypes: true,
            minimize: true,
        }
    }
    return config;
}