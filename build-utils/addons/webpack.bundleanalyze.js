const webpackBundleAnalyzer = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = {
  plugins: [new webpackBundleAnalyzer()],
}
