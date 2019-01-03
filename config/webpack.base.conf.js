const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
// const vueLoaderConfig = require('./vue-loader.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const ssrconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8'));

function assetsPath(_path) {
  return path.posix.join(ssrconfig.output.path, _path)
}

module.exports = (isProd = true) => {
  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd
      ? false
      : '#cheap-module-source-map',
    output: {
      path: path.resolve(process.cwd(), ssrconfig.output.path),
      publicPath: ssrconfig.output.publicPath,
      filename: '[name].[chunkhash].js'
    },
    resolve: {
      alias: {
        'public': path.resolve(process.cwd(), './public'),
        '@': path.resolve('src'),
      } 
    },
    optimization: isProd ? {
      concatenateModules: true,
      minimize: true,
    } : {},
    module: {
      noParse: /es6-promise\.js$/, // avoid webpack shimming process
      rules: [
        {
          test: /(\.jsx|\.js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',         
          }
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: assetsPath('img/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: assetsPath('media/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      ]
    },
    performance: {
      maxEntrypointSize: 300000,
      hints: isProd ? 'warning' : false
    },
    plugins: isProd
      ? [
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
          }),
        ]
      : [
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
          }),
          new FriendlyErrorsPlugin()
        ]
  }
}