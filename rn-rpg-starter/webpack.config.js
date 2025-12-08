const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Silence a known harmless warning coming from react-native-worklets
  // caused by dynamic `require` usage that webpack can't statically analyze.
  // We add RegExp filters so other warnings still appear.
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    // ignore message text
    /require function is used in a way in which dependencies cannot be statically extracted/,
    // ignore module path (react-native-worklets)
    /react-native-worklets/
  ];

  return config;
};
