const commonPaths = require('./common-paths')
const webpack = require('webpack')

const config = {
  entry: './src/',
  output: {
    filename: 'bundle.js',
    path: commonPaths.outputPath,
  },
  plugins: [new webpack.ProgressPlugin()],
}

module.exports = config
