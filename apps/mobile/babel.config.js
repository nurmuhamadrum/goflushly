const path = require('path');
const Module = require('module');

const mobileNodeModules = path.resolve(__dirname, 'node_modules');
const existingNodePath = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
if (!existingNodePath.includes(mobileNodeModules)) {
  process.env.NODE_PATH = [mobileNodeModules, ...existingNodePath].join(path.delimiter);
  Module._initPaths();
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
