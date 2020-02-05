module.exports = function config(api) {
  api.cache(true)
  return {
    presets: [
      ['@babel/preset-modules'],
      ['@babel/preset-react', { development: true }],
      ['@babel/preset-typescript'],
    ],
    plugins: [
      ['classy-ui/plugin'],
      ['propy-ui/plugin', { components: ['Box'] }],
    ],
  }
}
