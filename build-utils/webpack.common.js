const commonPaths = require('./common-paths')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  entry: './src/',
  output: {
    filename: 'bundle.js',
    path: commonPaths.outputPath,
  },
  plugins: [new webpack.ProgressPlugin(), new HtmlWebpackPlugin()],
}

module.exports = config
