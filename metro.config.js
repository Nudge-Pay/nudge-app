const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
};

if (process.env.NODE_ENV === 'production') {
  const existingBlockList = Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : [];
  config.resolver.blockList = [...existingBlockList, /src[/\\]app[/\\]c05\.tsx$/];
}

module.exports = config;
