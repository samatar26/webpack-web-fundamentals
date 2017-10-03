### Leveraging npm scripts
There are lot of use cases for build scripts that make compose ability or flexibility in your build process possible. If you had to refactor multiple scripts by ie adding multiple commands you can leverage an npm feature which has the ability to add and chain multile commands. You can use the dashed operator to pipe in commands:

```js
"debug": "npm run build -- --env.debug=1"
"watch": "npm run build -- --watch",
"build": "webpack --verbose"

```

You can see that any time we change the original command (build), the other ones follow, which makes it a lot easier for us to compose commands.