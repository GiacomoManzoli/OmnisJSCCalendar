const { merge } = require("webpack-merge")
const dev = require("./webpack.dev.js")
const TerserPlugin = require("terser-webpack-plugin")

const webpack = require("webpack")
const packageJson = require("./package.json")

module.exports = merge(dev, {
    mode: "production",
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: {
                        pure_funcs: ["console.debug"], // oppure drop_console: true
                    },
                },
            }),
        ],
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `Version: ${packageJson.version} - Build date: ${new Date().toISOString()}`,
            raw: false,
            entryOnly: true,
        }),
    ],
})
