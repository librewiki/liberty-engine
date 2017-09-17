'use strict';

const redis = require('promise-redis')();

const env = process.env.NODE_ENV || 'development';
const redisConfig = require('../../../config/config.json')[env].redis;

if (!redisConfig) {
  module.exports = null;
}

if (!redisConfig.password) {
  delete redisConfig.password;
}

const client = redis.createClient(redisConfig);

module.exports = {
  client,
  set: (...args) => client.set(...args),
  get: (...args) => client.get(...args),
  expire: (...args) => client.expire(...args),
  ttl: (...args) => client.ttl(...args),
};
