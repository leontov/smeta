module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['standard-with-typescript'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
};
