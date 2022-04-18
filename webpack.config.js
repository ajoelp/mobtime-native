module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /native_modules\/.+\.node$/,
                use: 'node-loader',
            },
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|\.webpack)/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                },
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
}