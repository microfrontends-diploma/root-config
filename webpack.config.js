const path = require("path");
const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-ts");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require('dotenv');


module.exports = (webpackConfigEnv, argv) => {
  dotenv.config();
  const importMapUrl = process.env.IMPORT_MAP_URL;
  const isLocal = webpackConfigEnv && webpackConfigEnv.isLocal;
  const env = isLocal ? 'dev' : 'prod';

  const orgName = "andy-inc";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
    orgPackagesAsExternal: false
  });

  return merge(defaultConfig, {
    entry: {
      index: path.resolve(__dirname, 'src', 'index.ts'),
    },
    output: {
      publicPath: '/',
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: 'body',
        template: path.resolve(__dirname, 'public', 'index.ejs'),
        publicPath: './',
        scriptLoading: 'blocking',
        templateParameters: {
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
          importMapUrl: `${importMapUrl}${env}`,
          orgName,
        },
      }),
    ],
    devServer: {
      historyApiFallback: true
    }
  });
};
