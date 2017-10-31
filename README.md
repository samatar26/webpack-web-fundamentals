# webpack-web-fundamentals

Notes on following this amazing webpack course: https://webpack.academy/

### Leveraging npm scripts
There are lot of use cases for build scripts that make compose ability or flexibility in your build process possible. If you had to refactor multiple scripts by ie adding multiple commands you can leverage an npm feature which has the ability to add and chain multile commands. You can use the dashed operator to pipe in commands:

```js
"debug": "npm run build -- --env.debug=1"
"watch": "npm run build -- --watch",
"build": "webpack --verbose"

```

You can see that any time we change the original command (build), the other ones follow, which makes it a lot easier for us to compose commands.

### Using the webpack configuration function
Webpack's configuration file is just a JavaScript module that exports an object that contains the properties needed for the compiler to compile your application into a bundle.
In addition to a webpack configuration file accepting an object that is exported, webpack can also take a function, that returns an object.

```js
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
```

The reason why this is so valuable, is that webpack will look from the command line for an environment flag and pass this as a parameter into your function. You can use this to compose/add and remove different parts of your configuration for different envs.

Example of passing in an env in your build script:
```js
"build:log": "npm run build -- --env=1"
```

In addition to passing in a single value, you can also pass in a object by calling `--env.foo=1 --env.bar=2`


The function syntax gives you all these additional features to a single command and you have a wealth of information that you receive from the command line that you can use to conditionally add or remove different features or configs or values that may be relevant to a specific environment you're building.

### Environments and Composition
Common boilerplate webpack configuration such as entry and output can be modularised and put into a webpack.common.js file if you'd like.

```js
const commonPaths = require('./common-paths')

const config = {
  entry: './src/',
  output: {
    filename: 'bundle.js',
    path: commonPaths.outputPath,
  },
}

module.exports = config


// webpack.config.js

const commonConfig = require('./build-utils/webpack.common')

module.exports = env => {
  return commonConfig
}



```

One of the nice ways of composing your webpack config is using webpack-merge. It's similar to Object.assign, but also gives you very order specific and webpack specific features that lets you merge configurations and arrays in the correct order together. Usage: `yarn add webpack-merge --dev`. We can leverage nodejs's ability to pass in an expression to a require statement:
```js
const envConfig = require(`./build-utils/webpack.${env.env}.js`)
```

So now we have the environment config and we want to compose it with the common config, the way we can do this is like so:

```js
//Dev config looks like so: we've added source maps:
const config = {
  devtool: "source-map"
}

module.exports = config

//webpack.config.js

const commonConfig = require('./build-utils/webpack.common')
const webpackMerge = require('webpack-merge')

module.exports = env => {
  console.log(env)

  const envConfig = require(`./build-utils/webpack.${env.env}.js`)
  return webpackMerge(commonConfig, envConfig)
}
```

So we created our `commonconfig` and required it, then we created our `webpack.dev.js` which has dev specific features that we are also exporting. In our `package.json` we have a script `build:watch:dev` which is going to run the normal webpack-build command but it's also composing in an environment flag, which is an object and it's value for .env is dev. So in our `webpack.config.js` we can take this .env property and add it in our require statement. So now it's explicitly requiring `./build-utils/webpack.dev.js` Then we leverage `webpack-merge` for an easy way to merge those properties together. The base configuration is the first argument and whatever you want to decorate on top of it is the second.


### Source maps
As the name suggests, a source map consists of a whole bunch of information that can be used to map the code within a compressed file back to it’s original source. You can specify a different source map for each of your compressed files. The source map file contains a JSON object with information about the map itself and the original JavaScript files. Here is a simple example:

```js
{
    version: 3,
    file: "bundle.js.map",
    sources: [
        "app.js",
        "content.js",
        "widget.js"
    ],
    sourceRoot: "/",
    names: ["slideUp", "slideDown", "save"],
    mappings: "AAA0B,kBAAhBA,QAAOC,SACjBD,OAAOC,OAAO..."
}

```

Lets take a closer look at each of these properties.

- version – This property indicates which version of the source map spec the file adheres to.
- file – The name of the source map file.
- sources – An array of URLs for the original source files.
- sourceRoot – (optional) The URL which all of the files in the sources array will be resolved from.
- names – An array containing all of the variable and function names from your source files.
- mappings – A string of Base64 VLQs containing the actual code mappings. (This is where the magic happens.)

### Piecing together with "addons"
So we now using a paths variable understand how to take and compose environmental based configurations. We're now going to take it a step further and talk about ways we can add one-off features and have them compose on top of each other independently. These differ from a prod. vs dev. environment and rather allow you to experiment with adding different features for different scenarios. I've created a function called `addons`, it takes an argument which is a string or an array. Then we're going to go ahead and flatten it and remove any undefined values. It's going to return a map and it's an array, it's going to pull the webpack configuration that is listed under the addons folder. This will allow us to tag on an array or a single value of addon configs into our webpackMerge config.

```js
const commonConfig = require('./build-utils/webpack.common')
const webpackMerge = require('webpack-merge')

const addons = addonsArg => {
  let addons = [].concat.apply([], [addonsArg]).filter(Boolean)
  return addons.map(addomName =>
    require(`./build-utils/addons/webpack.${addonName}.js`)
  )
}

module.exports = env => {
  console.log(env)

  const envConfig = require(`./build-utils/webpack.${env.env}.js`)
  const mergedConfig = webpackMerge(
    commonConfig,
    envConfig,
    ...addons(env.addons)
  )
  console.log(mergedConfig)
  return mergedConfig
}

```
In our package.json we currently have this (this is just to showcase how we can use the composition features to our benefits. Normally  your one off configuration may only be to a specific environment or specific feature):
`
{
  "name": "webpack-web-fundamentals",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build:dev:bundlebuddy": "npm run build:dev -- --env.addons=bundlebuddy",
    "build:dev:bundleanalyze": "npm run build:dev -- --env.addons=bundleanalyze",
    "build:dev": "npm run build -- --env.env=dev",

    "build:prod:bundlebuddy": "npm run build:prod -- --env.addons=bundlebuddy",
    "build:prod:bundleanalyze": "npm run build:prod -- --env.addons=bundleanalyze",
    "build:prod": "npm run build -- --env.env=prod",

    "build:watch:dev": "npm run build:watch -- --env.env=dev",
    "build:watch:prod": "npm run build:watch -- --env.env=prod",
    "build:watch": "npm run build -- --watch",
    "build": "webpack"
  },
`

Using the `env.addons` property we've set the name of one of our addon configurations. So as you can see when we run ie `build:dev:bundlebuddy` in our webpack configuration the addons property will be passed in to env and the property value will be passed into our addons value and return the configuration. We can also pass in an array of different addons like so: `"npm run build:dev -- --env.addons=bundlebuddy --env.addons=bundleanalyze"`. Bundleanalyze is just using the webpack bundle analyzer and we're just using one plugin that we're leveraging. This is exactly the point of an addon configuration, they're `ad-hoc` and not only allow you to test and experiment with different configuration features without affecting your normal environment configs, but also allows you to compose on top of them!

Let's say you're developing your first plugin. In webpack there's a shorthand syntax that says that you can pass in a function in as a plugin and it will evaluate as one:

```js
module.exports = {
  plugin: [
    function apply() {
      const compiler = this

      console.log(compiler)
    },
  ],
}
```
All we're really doing is console logging the compiler, but it's still a plugin. The thing to take away from this is that this is a workbench and a place for your to experiment with different types of features without really having a lot of friction for your other configurations. So we can add a build script: `"build:prod:firstplugin: "npm run build:prod -- --env.addons=firstplugin`. And when you run the command you will see the compiler being console logged! We're essentiallyable to conditionally for any reason add these different types of plugins or composable features and this is not only good for deploy targets, but it's also good for testing and composing, trying things out and really getting your feet wet with how flexible you can make your configuration.

### Escape Hatches
So what if something goes wrong or there's a bug in our scripts, custom plugin or even a bug in webpack. Is there any way we can have an escape hatch so we can debug our way through in it. What's really cool is that Node has a native [feature](https://nodejs.org/en/docs/inspector/) that let's you use the inspector tool in chrome so that you can step through and set breakpoints for any of your node scripts. So the first thing we want to do is to run webpack not from the cli alias, but directly with node: `"build": "node ./node_modules/webpack/bin/webpack.js"`.


What we then want to do is create a script we can call some additional node arguments to, it's going to be running the same webpack command with some flags:
`"debug": "node --inspect-brk ./node_modules/webpack/bin/webpack.js",
 "debug:prod": npm run debug -- --env.env=prod`

 What this feature does is that it passes us a url that we can open in chrome.

 `Inspect-brk` stops at the first line of the executable and that's just so that we if we wanted to can profile or debug or observe any local instances or variables. If we wanted to set breakpoints in our code or custom plugins we can also do so. It will also output anything we console log into the console. So this gives us a nice way to set ourselves up to experiment and if anything goes wrong, we can just use our debug script and add the same environment composables and debug our way into any situation we end up in!


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

 # Dev Config
 ### Sourcemaps

 One of the first things we would like to have in our development environment would be source-maps. So in webpack you can set source maps by setting the `devtool` property. There are about 4 or 5 different values you can choose for the `devtool` property. See [here](webpack.js.org/configuration/devtool). See learnings1 for more information about sourcemaps!


 ### Webpack-dev-server

 This is something that's very specific to a SPA, but usually most people who use webpack are building SPAs and are using some sort of development server to serve static content. Webpack has a node-module called `webpack-dev-server` which uses express behind the scenes and directly integrates with webpack so that it automatically emits bundles in memory and fires websocket requests to this webserver to have these changes updated automatically in the browser for us.

 So what we're going to do is replace our dev script which contains webpack with `webpack-dev-server`: `    "dev": "npm run webpack-dev-server -- --env.env=dev",
 `. This is going to allow us to call webpack-dev-server instead of webpack itself. If we go to localhost:8080 you can see the 3 files that were emitted to build loading in the browser for us automatically. So our index.html, the bundle file which not only contains the base64 image but the scripts and the card we created. Webpack-dev-server is super awesome as it not only allows us to independently work on our client-side code seperate from our server code, but also has all sorts of incredible features like auto-refreshing when you change files. So the concept of the dependency graph also applies to the webpack-dev-server.

 Not only is it providing incremental builds for us, but it's emitting these changes via websockets and automatically causing the browser to refresh for us. In addition to that we can also specify a whole bunch of different options for webpack-dev-server.

 Because of sourcemaps we can see our original `card.js` file and original JavaScript that's being in run in the devtools in the browser!!!! It's a great place to inspect different variables and really understand the kind of information that's being applied and makes for a super rich developer environment.


 ### Style-loader & CSS-loader
 These are two seperate loaders, but are almost always paired together. The reason for this is that although loaders are single operation functions, or single purpose transforms, they're built to work together. When we come across a file that's about to be added to our dependency graph and ends in `.css` let's run it through `css-loader` and then `style-loader`. We should now be able to import a css file into our JavaScript.


 ```js
 const config = {
   devtool: 'source-map',
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

 ```
 When we're changing out styles you might be able to see that this happens without the browser refreshing, this is called `hot module replacement`.


 ##### Hot Module Replacement
 It's the idea that if you can take different modules and swap or patch them out based upon their changes incrementally, you can do so in a live environment without the browser refreshing. Using it is as easy as using the `--hot` flag in the webpack-dev-server. Now using HMR for more than just styles may vary in terms of configuring it, but with style-loader it automatically uses the hot module api so you can have this feature out of the box.


 # Prod config

 ### Source maps, again!
 It may seem a little redundant but we're going to go ahead and use the `devtool` property again. You'll find out pretty quickly that when you're using webpack and the source-maps feature through devtool that `source-map` takes a little bit longer than most of the source map options you can choose from and this is why we'll  move `source-map` into our `prod` config and actually use something like `eval-source-map` in our dev config. See https://webpack.js.org/configuration/devtool/


 ### Extract-text-webpack-plugin

 If we were to run `npm run build` you'll see that we get an error, because we only told webpack how to handle our styles in our dev environment, but not our production environment. So we're going to use a webpack plugin from the `webpack-contrib` organization called the `extract-text-webpack-plugin`. So what this plugin does is it is actually both a plugin and a loader. So the first thing we're going to do is use the plugin, we can do this by requiring it. Then we'll pass a new instance of that plugin and the argument it takes is the name of the `bundle of css that will be created`.

 The point of this is that style- and css-loader in our dev environment is only going to add a JS module that slaps a script tag in the head of your document. This can actually become a performance bottleneck, so we use this plugin to replace that functionality. `The next step` is to copy the existing rules we had for our css in the dev config, but we're going to wrap it in `extract-text-webpack-plugin`.

 ```js
 const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')

 module.exports = {
   devtool: 'source-map',
   module: {
     rules: [
       {
         test: /\.css/,
         use: ExtractTextWebpackPlugin.extract({
           loader: 'css-loader',
           fallback: 'style-loader',
         }),
       },
     ],
   },
   plugins: [new ExtractTextWebpackPlugin('style.css')],
 }

 ```

 We're then going to use the loader api for ExtractTextWebpackPlugin by replacing use with a method called `extract`. We're still going to use the 2 loaders we had in the array. The `fallback` is there for in the scenario where chunks of code, like let's say lazy loaded JS cannot be translated into lazy css. So this fallback will say that when you have a lazy loaded bundle through webpack use the style-loaders base functionality instead. When we run `npm run build` we can see that we have a bundle of css created and even the sourcemap for it, because of the `devtool` property.
