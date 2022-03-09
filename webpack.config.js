

const config = {
    context: __dirname,
    entry: './src/index.js',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.(png|j?g|svg|gif)?$/,
                use: 'file-loader?name=./images/[name].[ext]'
            }
        ]
    },
};

export default config;