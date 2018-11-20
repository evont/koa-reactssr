const fs = require('fs');
const path = require('path');
const ReactSSR = require('react-dom/server');
// const LRU = require('lru-cache');
// const log = require('./colorLog');
/**
 * deep extend object
 * @param {object} obj original object
 * @param {object} obj2 extend object
 * @returns {object} combine object
 */
function extend(obj, obj2) {
  const newObj = Object.assign({}, obj);
  for (const key in obj2) {
    if ('object' != typeof obj[key] || null === obj[key] || Array.isArray(obj[key])) {
      if (void 0 !== obj2[key]) {
        newObj[key] = obj2[key];
      }
    } else {
      newObj[key] = extend(obj[key], obj2[key]);
    }
  }
  return newObj;
}

function render(content, ctx) {
  ctx.set('Content-Type', 'text/html')
  // const handleError = err => {
  //   if (err.url) {
  //     ctx.redirect(err.url)
  //   } else if(err.code === 404) {
  //     // ctx.throw(404, '404 | Page Not Found')
  //     ctx.body = 'Page Not Found';
  //   } else {
  //     // Render Error Page or Redirect
  //    //  ctx.throw(500, '500 | Internal Server Error')
  //     console.error(err);
  //     ctx.body = 'Internal Server Error';
  //   }
  // }
  return new Promise((resolve, reject) => {
    // const context = {
    //   title,
    //   url: ctx.url
    // }
    ctx.body = content;
    resolve();
  }).catch((error) => {
    handleError(error);
  })
}

// let ssrconfig;
// try {
//   ssrconfig = fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8');
// } catch(e) {
//   log.error('You need to have a .ssrconfig file in your root directory');
//   throw new Error('no ssrconfig file')
// }

// ssrconfig = JSON.parse(ssrconfig);

const templatePath = path.resolve(__dirname, 'index.template.html');

const distPath = path.resolve(process.cwd(), './dist');

module.exports = (app, options) => {
  const defaultSetting = {
    useLoadable: true, // use react-loadable by default
    isProd: false, // is Production Mode
  };

  const settings = extend(defaultSetting, options);
  let content;
  let readyPromise;
  if (!settings.isProd) {
    readyPromise = require('./build/setup-dev-server')(
      app,
      templatePath,
      (bundle, template) => {
        content = template.replace(/<!-- react app -->/, ReactSSR.renderToString(bundle));
      }
    )
  }
  
  return async function ssr (ctx) {
    if (settings.isProd) {
      ReactSSR.renderToString(bundle);
      await render(settings.title, ctx);                                                                        
    } else {
      await readyPromise.then(() => render(content, ctx));
    }
  }
}