const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
// const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

module.exports = {
    // entry: "./src/index.ts",

    mode: "development", // o "production"

    entry: {
        ctl_com_888sp_calendar: "./src/index.ts",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.html?$/,
                use: "raw-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    devtool: "source-map",
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        // alias: {
        //     "@src": path.resolve(__dirname, "./src/"),
        //     "@app": path.resolve(__dirname, "./src/app/"),
        //     "@utils": path.resolve(__dirname, "./src/utils/"),
        //     "@settings": path.resolve(__dirname, "./src/APP_CONFIG.ts"),
        //     "@errors": path.resolve(__dirname, "./src/errors.ts")
        // }
        // fallback: {
        //     crypto: false,
        //     path: require.resolve("path-browserify"),
        //     stream: require.resolve("stream-browserify"),
        // },
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        // library: "qrcode_dev",
        libraryTarget: "window", // https://webpack.js.org/configuration/output/#outputlibrarytarget
    },
    // optimization: {
    //     minimizer: [new TerserPlugin({ terserOptions: { safari10: true } })],
    // },
}
