const config = {
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}

module.exports = config
