module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@components': './src/components',
            '@services': './src/services',
            '@types': './src/types',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
