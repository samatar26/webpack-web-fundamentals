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

### html-webpack-plugin
So the next essential plugin that almost every configuration should include is the `html-webpack-plugin`. It's a community driven plugin and we cann add it to our package.json like so: `npm i --save-dev html-webpack-plugin`. We can then add it to our common config.

When we add it to our configuration, `html-webpack-plugin` will generate a boilerplate html file that will also live in our build folder! What's beneficial about this is that the html file that's generated will include the scripts that webpack actually builds! This is really important especially when we're leveraging long term vendor hashing. So if we were to hash our bundle names by using the chunkhash template helper you could believe that it'd be really painful to inject a script every time into an index.html file especially since this hash may change muliple times.

This is only scratching the surface on how many different options and features we can add to this.

### url-loader
Now we're going to go ahead and add a loader. `url-loader` allows you to convert any asset url, whether it be a path you require from JavaScript or even if you're using other loaders such as `css-loader` it will convert an image or a font into a base64 string and inline it in your bundle. This isn't always appropriate for all cases, but it's extremely useful in certain scenarios such as having very small icons or other assets where it would be more expensive to have another request versus having it inlined in a bundle.

In order to add this we have to first define the `module` property and add a `rule` and we need to decide what are the test extensions we're going to add this rule to. You can always come back and change this. Remember in order to specify some options we need to use the options syntax, so:
```js
use: [
  "url-loader"
]

//vs

use: [
  {
    loader: 'url-loader',
    options: ////etc.....
  }
]
```



```js
const commonPaths = require('./common-paths')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  entry: './src/',
  output: {
    filename: 'bundle.js',
    path: commonPaths.outputPath,
  },
  module: {
    rules: [
      {
        test: /`.png`/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  plugins: [new webpack.ProgressPlugin(), new HtmlWebpackPlugin()],
}

module.exports = config

```

When this runs and if `file-loader` is also added it will just emit the file which is larger than the limit we specified into our output directory instead.

For the sake of example we'll import an image directly into our JavaScript. There are many different scenarios that you decide to import images and it may be framework specific or not.

```js
import createCard from './card'
import './test.png'

createCard(
  'Im learning webpack: Web Essentials',
  'This course is made by Sean Larkin, one of the members of the webpack core team.'
)
```

It does increase the size of our bundle considerably, so you have to be careful and measure and understand the balances between importing an image itself or using the limit property and high or low you want to adjust it.



Now that we've got our common config pretty much filled out, it's time to jump to our development config and start to set up some specific features for our dev environment.


### Sourcemaps

One of the first things we would like to have in our development environment would be source-maps. So in webpack you can set source maps by setting the `devtool` property. There are about 4 or 5 different values you can choose for the `devtool` property. See [here](webpack.js.org/configuration/devtool). See learnings1 for more information about sourcemaps!


### Webpack-dev-server

This is something that's very specific to a SPA, but usually most people who use webpack are building SPAs and are using some sort of development server to serve static content. Webpack has a node-module called `webpack-dev-server` which uses express behind the scenes and directly integrates with webpack so that it automatically emits bundles in memory and fires websocket requests to this webserver to have these changes updated automatically in the browser for us.

So what we're going to do is replace our dev script which contains webpack with `webpack-dev-server`: `    "dev": "npm run webpack-dev-server -- --env.env=dev",
`. This is going to allow us to call webpack-dev-server instead of webpack itself. If we go to localhost:8080 you can see the 3 files that were emitted to build loading in the browser for us automatically. So our index.html, the bundle file which not only contains the base64 image but the scripts and the card we created. Webpack-dev-server is super awesome as it not only allows us to independently work on our client-side code seperate from our server code, but also has all sorts of incredible features like auto-refreshing when you change files. So the concept of the dependency graph also applies to the webpack-dev-server.

Not only is it providing incremental builds for us, but it's emitting these changes via websockets and automatically causing the browser to refresh for us. In addition to that we can also specify a whole bunch of different options for webpack-dev-server.

Because of sourcemaps we can see our original `card.js` file and original JavaScript that's being in run in the devtools in the browser!!!! It's a great place to inspect different variables and really understand the kind of information that's being applied and makes for a super rich developer environment.
