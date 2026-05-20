const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchOptions = {
  poll: 1000,
};

module.exports = config;
