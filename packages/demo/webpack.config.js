const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const portfinder = require("portfinder");

module.exports = new Promise((resolve, reject) => {
  portfinder.getPort(
    {
      port: 3001,
      stopPort: 4000,
    },
    (err, port) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`🚀 开发服务器将在端口 ${port} 启动...`);

      resolve({
        mode: "development",
        entry: "./src/main.js",
        output: {
          path: path.resolve(__dirname, "dist"),
          filename: "bundle.js",
          clean: true,
        },
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: "vue-loader",
            },
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
            {
              test: /\.css$/,
              use: ["style-loader", "css-loader"],
            },
            {
              test: /\.less$/,
              use: ["style-loader", "css-loader", "less-loader"],
            },
            {
              test: /\.(png|jpg|gif|svg)$/,
              use: {
                loader: "file-loader",
                options: {
                  name: "[name].[ext]",
                  outputPath: "assets/",
                },
              },
            },
          ],
        },
        plugins: [
          new VueLoaderPlugin(),
          new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "index.html",
          }),
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify("development"),
            },
          }),
        ],
        resolve: {
          extensions: [".js", ".vue", ".json"],
          alias: {
            vue$: "vue/dist/vue.esm.js",
          },
        },
        devServer: {
          port: port,
          hot: true,
          open: true,
          static: {
            directory: path.join(__dirname, "dist"),
          },
        },
      });
    },
  );
});
