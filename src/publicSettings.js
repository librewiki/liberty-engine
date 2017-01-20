'use strict';
const path = require('path');
const fs = require('fs');
const settingsPath = path.resolve(__dirname, '../config/public-settings.json');
let settings = require(settingsPath);

module.exports = {
  get(key) {
    return settings[key] || null;
  },
  set(key, value) {
    settings[key] = value;
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
    delete require.cache[require.resolve(settingsPath)];
    settings = require(settingsPath);
  }
};
