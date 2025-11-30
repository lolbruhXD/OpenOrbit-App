module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This plugin is required for Reanimated to work and MUST be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};