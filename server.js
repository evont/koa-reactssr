// 服务端入口
const serve = require('koa-static');
const koaRouter = require('koa-router');
const ssr = require('./index');
const koa = require('koa');
const app = new koa();
const router = new koaRouter();
app.use(serve(__dirname + '/dist'));
app.use(serve(__dirname + '/public'));
router.get('*', ssr(app, {
  useLoadable: true,
}));
app.use(router.routes());
app.listen(8888)