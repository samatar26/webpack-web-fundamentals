const path = require('path')

module.exports = env => {
  return {
    entry: './src/',
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'build'),
    },
  }
}
