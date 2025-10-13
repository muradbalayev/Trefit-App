module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
            '@assets': './assets'   // <-- add this
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      // NOTE: Reanimated plugin must be listed last
      // 'react-native-reanimated/plugin',
    ],
  };
};
