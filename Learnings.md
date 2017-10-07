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
All we're really doing is console logging the compiler, but it's still a plugin. The thing to take away from this is that this is a workbench and a place for your to experiment with different types of features without really having a lot of friction for your other configurations. So we can add a build script: `"build:prod:firstplugin: "npm run build:prod -- --env.addons=firstplugin`. And when you run the command you will see the compiler being console logged! We're essentiallyable to conditionally for any reason add these different types of plugins or composable features and this is not only good for deploy targets, but it's also good for testing and composing, trying things out and really getting your feet wet with how flexible you can make your configuration@
