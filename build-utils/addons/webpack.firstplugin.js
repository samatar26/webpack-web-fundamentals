module.exports = {
  plugins: [
    function apply() {
      const compiler = this

      console.log(compiler)
    },
  ],
}
