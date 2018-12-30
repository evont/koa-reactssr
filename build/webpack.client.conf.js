const path = require('path');
const webpack = require('webpack');
// 判断当前环境 根据环境不同采取不同的webpack配置 在命令行中设置当前环境 要通过cross-env这个包来保证linux mac win三个平台配置一致
const isDev = process.env.NODE_ENV === 'development';
const config = {
  mode: 'none',
  entry: {
    app: path.join(__dirname, '../src/entry-client.js')
  },
  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [path.join(__dirname, '../node_modules')],
      }
    ]
  },
  plugins: [],
}

// if (isDev) {
//   config.entry = {
//     app: [
//       'react-hot-loader/patch', path.join(__dirname, '../client/index.js')
//     ]
//   }
//   config.devServer = {
//     // '0,0,0,0'表示我们可以用任何方式进行访问 如localhost 127.0.0.1 以及外网ip 若配置为'localhost'
//     // 或'127.0.0.1'别人无法从外网进行调试
//     host: '0.0.0.0',
//     // 起服务的端口
//     port: '8888',
//     // 起服务的目录，此处与output一致，此处有坑(要考虑publicPath，还要知晓webpack-dev-server生成的文件在内存中，若项目中已经有
//     // 了dist则以项目中的dist为准，所以删掉dist吧)
//     contentBase: path.join(__dirname, '../dist'),
//     // 热更新 如果不配置webpack-dev-server会在文件修改后全局刷新而非局部替换
//     hot: true,
//     overlay: {
//       // 如果打包过程中出现错误在浏览器中渲染一层overlay进行展示
//       errors: true
//     },
//     // 在此处设置与output相同的publicPath,把静态资源文件放在public文件夹下
//     // 使得output.publicPath得以正常运行，其实这里的publicPath更像是output.path
//     publicPath: '/public/',
//     // 解决刷新404问题（服务端没有前端路由指向的文件） 全都返回index.html
//     historyApiFallback: {
//       index: '/public/index.html'
//     }
//   }
//   config
//     .plugins
//     .push(new webpack.HotModuleReplacementPlugin());
// }

module.exports = config;