

var path = require('path')
var TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
    entry: "./browser/synbiohub.ts",
    mode: 'development',
    output: {
        filename: "bundle.js",
        path: __dirname + "/public",
        publicPath: '/'
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {

        plugins: [
            // Using this plugin means that you should no longer need to add alias entries in your webpack.config.js which correspond to the paths entries in your tsconfig.json. This plugin creates those alias entries for you, so you don't have to!
            new TsconfigPathsPlugin({
                extensions: [ '.ts', '.tsx', '.js' ]
            })
        ], 

        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.ts$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        //"react": "React",
        //"react-dom": "ReactDOM"
    }
}
