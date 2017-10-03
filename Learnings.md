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
