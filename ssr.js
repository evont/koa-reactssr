
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App';
const mark = '<!-- react app -->';
let template = fs.readFileSync('./index.template.html', 'utf-8');

export default (ctx) => {
  template = template.replace(mark, renderToString(<App />));
  ctx.body = template;
}