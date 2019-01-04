var createBundleRendererCreator = require("./bundle-renderer/create-bundle-renderer");
var createRenderer = require("./create-renderer");
exports.createRenderer = createRenderer;
process.env.REACT_ENV = 'server';
exports.createBundleRenderer = createBundleRendererCreator(createRenderer);