const path = require('path');

const chalk = require('chalk');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ip = require('ip');

const common = require('./webpack.common.js');

console.log('local ip address', chalk.yellow(chalk.bold(ip.address())));

module.exports = merge(common, {
  devtool: 'cheap-module-eval-source-map',

  mode: 'development',
  devServer: {
    host: ip.address(),
    port: 9000,
    hot: true,
    https: true,
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
  },

  output: {
    publicPath: "/",
  },

  plugins: [
    new webpack.DefinePlugin({
      // SERVER: "'http://0.0.0.0:4000'",
      NODE_ENV: "'development'",
    }),
    new webpack.HotModuleReplacementPlugin({}),
    // This plugin will cause the relative path of the module to be displayed when HMR is enabled.
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: './index.dev.ejs',
      title: 'Dev-Fourth Person',
    }),
  ],
});
