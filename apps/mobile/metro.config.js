const path = require('path');
const Module = require('module');

// Pastikan package hoisted di root monorepo (nativewind / react-native-css-interop)
// dapat me-resolve react-native dari apps/mobile/node_modules di Node & Metro workers
const mobileNodeModules = path.resolve(__dirname, 'node_modules');
const existingNodePath = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
if (!existingNodePath.includes(mobileNodeModules)) {
  process.env.NODE_PATH = [mobileNodeModules, ...existingNodePath].join(path.delimiter);
  Module._initPaths();
}

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Temukan root monorepo
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Pantau semua folder di root monorepo (termasuk packages/shared)
config.watchFolders = [monorepoRoot];

// 2. Izinkan Metro me-resolve node_modules dari apps/mobile dan root monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = withNativeWind(config, {
  input: path.resolve(projectRoot, 'global.css'),
  configPath: path.resolve(projectRoot, 'tailwind.config.js'),
});
