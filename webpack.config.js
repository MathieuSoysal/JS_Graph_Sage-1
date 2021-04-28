const path = require('path');

var config = {
    entry: './src/ts/main/scripts.ts',
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

module.exports = (_, argv) => {
    if (argv.mode === 'development') {
        config.mode = 'development';
        config.devtool = 'source-map';
        config.watch = true;
        config.output.path = path.resolve(__dirname, "dist");
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