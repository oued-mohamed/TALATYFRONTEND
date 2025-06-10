const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add additional watch folders if needed
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
  // Add any other folders you need to watch
];

// Ensure we're watching the right directories
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Reset cache on restart
config.resetCache = true;

// Workaround for Windows path issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

// Handle potential file watching issues
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;