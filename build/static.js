const axios = require('axios');
const webpack = require('webpack');
const path = require('path');
const MemoryFs = require('memory-fs');
const proxy = require('http-proxy-middleware');
const ReactDomServer = require('react-dom/server');

const serverConfig = require('../../build/webpack.config.server');

const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios
      .get('http://localhost:8888/public/index.html')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

const Module = module.constructor;
let serverBundle;

const mfs = new MemoryFs();
// 启动webpack compiler
const serverCompiler = webpack(serverConfig);
// webpack提供给我们的配置项，此处将其配置为 通过mfs进行读写（内存）
serverCompiler.outputFileSystem = mfs;
// 监听entry处的文件是否有变动 若有变动重新打包
serverCompiler.watch({}, (err, stats) => {
  if (err) 
    throw err;
  stats = stats.toJson();
  // 打印错误和警告信息
  stats
    .errors
    .forEach(err => {
      console.error(err);
    });
  stats
    .warnings
    .forEach(warn => {
      console.warn(warn);
    })
  // 打包的文件所在路径
  const bundlePath = path.join(serverConfig.output.path, serverConfig.output.filename);
  // 获取打包完成的js文件（注：文件是在内存中而非硬盘中，类比webpack-dev-server的文件）
  // 此时获得的是字符串，并非可执行的js，我们需要进行转换
  const bundle = mfs.readFileSync(bundlePath, 'utf-8');
  // 创建一个空模块
  const m = new Module();
  // 编译字符串 要指定名字
  m._compile(bundle, 'server-entry.js');
  // 暴露出去 .default : require => es6 module
  serverBundle = m.exports.default;
})
module.exports = function (app) {
  // 将 `/public` 的请求全部代理到webpack-dev-server启动的服务 思考 express.static为啥不能用
  // 我们要借用webpack-dev=server的热更新 热更新就不是服务端渲染了 就第一次是
  app.use('/public', proxy({target: 'http://localhost:8888'}))
  app.get("*", function (req, res) {
    getTemplate().then(template => {
      const content = ReactDomServer.renderToString(serverBundle);
      res.send(template.replace('<!-- app -->', content));
    })
  })
}