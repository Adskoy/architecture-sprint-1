const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');
const Dotenv = require('dotenv-webpack');

const deps = require("./package.json").dependencies;

const printCompilationMessage = require('./compilation.config.js');

module.exports = (_, argv) => ({
    output: {
        publicPath: "http://localhost:8000/",
    },

    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
        alias: {
            'shared': path.resolve(__dirname, './microfrontend/shared')
        }
    },

    devServer: {
        port: 8000,
        historyApiFallback: true,
        watchFiles: [path.resolve(__dirname, 'src')],
        onListening: function (devServer) {
            const port = devServer.server.address().port

            printCompilationMessage('compiling', port)

            devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
                setImmediate(() => {
                    if (stats.hasErrors()) {
                        printCompilationMessage('failure', port)
                    } else {
                        printCompilationMessage('success', port)
                    }
                })
            })
        }
    },

    module: {
        rules: [{
            test: /\.m?js/, type: "javascript/auto", resolve: {
                fullySpecified: false,
            },
        }, {
            test: /\.(css|s[ac]ss)$/i, use: ["style-loader", "css-loader", "postcss-loader"],
        }, {
            test: /\.(ts|tsx|js|jsx)$/, exclude: /node_modules/, use: {
                loader: "babel-loader",
            },
        },  {
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack', 'url-loader'],
        }],
    },

    plugins: [new ModuleFederationPlugin({
        name: "host",
        filename: "remoteEntry.js",
        remotes: {
            'auth': 'auth@http://localhost:8001/remoteEntry.js',
            'cards': 'cards@http://localhost:8003/remoteEntry.js',
            'profile': 'profile@http://localhost:8002/remoteEntry.js',
        },
        exposes: {},
        shared: {
            ...deps,
            react: {
                singleton: true,
                eager: true,
                requiredVersion: deps.react,
            },
            "react-dom": {
                singleton: true,
                eager: true,
                requiredVersion: deps["react-dom"],
            },
            "react-router-dom": {
                singleton: true,
                eager: true,
                requiredVersion: deps["react-router-dom"],
            },
            "shared": {
                import: "shared",
                eager: true,
                requiredVersion: require("./microfrontend/shared/package.json").version
            }
        },
    }), new HtmlWebPackPlugin({
        template: "./src/index.html",
    }), new Dotenv()],
});