module.exports = {
  mode: 'production',
  entry: './src/systemjs-babel.js',
  output: {
    filename: 'systemjs-babel.js'
  },
  resolve: {
    aliasFields: ['browser']
  },
  node: {
    console: false,
    global: true,
    process: true,
    __filename: 'mock',
    __dirname: 'mock',
    Buffer: true,
    setImmediate: true,
    fs: 'empty'
  }
};