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
