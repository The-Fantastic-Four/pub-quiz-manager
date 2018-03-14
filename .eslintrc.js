module.exports = {
  parser: 'babel-eslint',
  extends: 'eslint:recommended',
  env: {
    browser: true,
  },
  rules: {
    'class-methods-use-this': 0,
    'linebreak-style': 0,
    indent: ['error', 2],
    curly: ['error', 'multi-line'],
    'brace-style': ['error']
  },
  globals: {
    module: true,
    require: true
  }
};
