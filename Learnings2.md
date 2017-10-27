### Essentials

This is the second half of the web fundamentals course. Now that we've understood how to start out right and how to create a setup that lets you compose and configure, use environment flags and have really flexible build scripts. It's now time to add some plugins and features to our configuration.

The first one we are going to start off with is the `common config`. The whole point of this section is to give you the basic necessities in almost every webpack configuration. What those plugins and values and loaders are, what they do and why they're beneficial to us.

### Progress Plugin
The first one we're going to start off with in the common config is called the `progress plugin`. When you use webpack or webpack-dev-server you may have noticed that the cli outputs different types of feedback, but we want to normalize this. So we're going to add webpack to our configuration and use an out of the box plugin called `webpack.ProgressPlugin`. You can pass in some options, but don't really have to, but if you want to configure how the progress is displayed you could do so.

```js
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
```

What this actually does for us is get a little feedback as the build is running. For longer builds it's really valuable as it helps the builds feel less long and you get an idea of what the slowest parts of your configuration is when those builds start to slow down.
