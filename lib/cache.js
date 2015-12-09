var Promise     = require('bluebird')
  , hoek        = require('hoek')
  , Catbox      = require('catbox')
  , CatboxRedis = require('catbox-redis')
  , AN_HOUR     = 60 * 60 * 1000
  , A_DAY       = 24 * AN_HOUR
  , CACHE_CLIENT_DEFAULT_OPTIONS = { host: '127.0.0.1', port: 6379, password: null }
  , cacheClientStarted
  , cacheClient
  , defaultCache;


function setDefaultCachePolicy(policy) {
  defaultCache = policy;
}

function registerPolicy(options, cacheClient) {
  return Promise.resolve(new Catbox.Policy(options, cacheClient, options.segment));
}

exports.getCachedValue = function getCachedValue(key, cacheOptions) {
  var cache;
  cacheOptions = cacheOptions || {};
  cache        = cacheOptions.cache || defaultCache;

  return new Promise(function (resolve, reject) {
    cache.get(key, function (err, value, cached, report) {
      if (err) { return reject(err); }
      return resolve({ value: value, cached: cached, report: report });
    });
  });
};


exports.setCachedValue = function setCachedValue(key, value, cacheOptions) {
  var cache;
  cacheOptions = cacheOptions || {};
  cache        = cacheOptions.cache || defaultCache;

  return new Promise(function (resolve, reject) {
    cache.set(key, value, cacheOptions.ttl, function (err) {
      // ### TODO: if (err) { /* log error */ }
      resolve(value);
    });
  });
};


exports.stop = function () {
  cacheClient.stop();
};


exports.start = function (options) {
  options = options || {};

  cacheClientStarted = new Promise(function (resolve, reject) {
    var cacheClientOptions;

    cacheClientOptions = hoek.applyToDefaults(CACHE_CLIENT_DEFAULT_OPTIONS, options);
    cacheClient        = new Catbox.Client(CatboxRedis, cacheClientOptions);
    cacheClient.start(function (err) {
      if (err) { return reject(err); }

      return registerPolicy({ segment: 'external', expiresIn: A_DAY }, cacheClient)
        .then(setDefaultCachePolicy)
        .then(resolve);
    });
  });

  return cacheClientStarted;
};


exports.registerPolicy = function (options) {
  return cacheClientStarted
    .then(function () {
      return registerPolicy(options, cacheClient, options.segment);
    });
};
