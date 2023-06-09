const path = require("path");
const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-ts");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");
const webpack = require("webpack");

module.exports = (webpackConfigEnv, argv) => {
  dotenv.config();
  const importMapUrl = process.env.IMPORT_MAP_URL;
  const isLocal = webpackConfigEnv && webpackConfigEnv.isLocal;
  const env = isLocal ? "dev" : "prod";

  const orgName = "andy-inc";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
    orgPackagesAsExternal: false,
  });

  return merge(defaultConfig, {
    entry: {
      index: path.resolve(__dirname, "src", "index.ts"),
    },
    output: {
      publicPath: "/",
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: "body",
        template: path.resolve(__dirname, "public", "index.ejs"),
        publicPath: "./",
        scriptLoading: "blocking",
        templateParameters: {
          title: "Микрофронтенды",
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
          // Три нижеидущих массива предназначены для регулировки Content Security Policy - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
          scriptTrustedDomains: ["https:", "localhost:*", "http://94.250.250.29:*"],
          styleSheetTrustedDomains: ["https:", "localhost:*", "http://94.250.250.29:*"],
          connectionTrustedDomains: ["https:", "localhost:*", "http://94.250.250.29:*", "ws://localhost:*"],
          importMapUrl: `${importMapUrl}${env}`,
          orgName,
        },
      }),
      new webpack.DefinePlugin({
        API_URL: isLocal ? JSON.stringify("http://localhost") : JSON.stringify("http://94.250.250.29"),
      }),
    ],
    devServer: {
      historyApiFallback: true,
    },
    externals: ["axios"],
  });
};
