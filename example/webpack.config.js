const path = require('path')
const appRootPath = require('app-root-path')
const { WebpackPluginServe: Serve } = require('webpack-plugin-serve')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const ROOT_DIR = appRootPath.toString()
const APP_DIR = path.resolve(ROOT_DIR, 'src')
const DIST_DIR = path.resolve(ROOT_DIR, 'dist')

const config = {
  entry: [path.resolve(APP_DIR, 'index.tsx'), 'webpack-plugin-serve/client'],
  mode: 'development',
  output: {
    path: DIST_DIR,
    filename: '[name].js',
    publicPath: '/',
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [APP_DIR],
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new Serve({
      port: 8000,
      host: 'localhost',
      static: [DIST_DIR],
    }),
  ],
  watch: true,
}

module.exports = config
