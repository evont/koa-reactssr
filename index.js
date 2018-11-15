require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
});
const ssr = require('./ssr').default;

module.exports = (app, options) => {
  return async (ctx, next) => {
    await ssr(ctx)
  }
}