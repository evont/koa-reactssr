const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MFS = require('memory-fs');

function koaDevMiddleware(expressDevMiddleware) {
  return function middleware(ctx, next) {
      return new Promise((resolve, reject) => {
          expressDevMiddleware(ctx.req, {
              end: (content) => {
                  ctx.body = content;
                  resolve();
              },
              setHeader: (name, value) => {
                  ctx.set(name, value);
              },
          }, reject);
      }).catch(next);
  };
}

function koaHotMiddleware(expressHotMiddleware) {
  return function middleware(ctx, next) {
      return new Promise((resolve) => {
          expressHotMiddleware(ctx.req, ctx.res, resolve);
      }).then(next);
  };
}
const ssrconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8'));
const { webpackConfig = {} } = ssrconfig;

module.exports = function setupDevServer(app, templatePath, cb) {
  const { client, server } = webpackConfig;
  let clientConfig = require(client ? path.resolve(process.cwd(), client) : './webpack.client.conf');
  let serverConfig = require(server ? path.resolve(process.cwd(), server) : './webpack.server.conf');
  
  // 设置环境变量为开发模式
  if (!client && typeof clientConfig === 'function') {
    clientConfig = clientConfig(false);
  }
  if (!server && typeof serverConfig === 'function') {
    serverConfig = serverConfig(false);
  }
  let bundle;
  let template;
  let ready;

  const readyPromise = new Promise(r => { ready = r });
  const update = () => {
    if (bundle) {
      ready()
      cb(bundle, {
        template,
      })
    }
  }

  template = fs.readFileSync(templatePath, 'utf-8');
  
  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )

  // 热更新客户端
  const clientCompiler = webpack(clientConfig);
  const dmw = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    noInfo: true,
    quiet: true,
    stats: {
      colors: true,
      chunks: false,
      modules: false,
      assets: false
    }
  });
  app.use(koaDevMiddleware(dmw));
  clientCompiler.plugin('done', stats => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return
    update()
  })

  const hmw = require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 });
  app.use(koaHotMiddleware(hmw));

  // 热更新服务端
  const serverCompiler = webpack(serverConfig);
  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    if (stats.errors.length) return
    const bundlePath = path.join(serverConfig.output.path, serverConfig.output.filename);
    // 获取打包完成的js文件（注：文件是在内存中而非硬盘中，类比webpack-dev-server的文件）
    // 此时获得的是字符串，并非可执行的js，我们需要进行转换
    bundle = mfs.readFileSync(bundlePath, 'utf-8');

    update()
  })
  return readyPromise;
}