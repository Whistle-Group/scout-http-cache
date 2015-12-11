var Promise = require('bluebird')
  , crypto  = require('crypto')
  , hoek    = require('hoek')
  , cache   = require('./cache')
  , AN_HOUR = 60 * 60 * 1000
  , A_DAY   = 24 * AN_HOUR
  , DEFAULT_CACHE_OPTIONS = { refreshAfter: AN_HOUR, ttl: A_DAY };


exports.request = function get(options, callback) {
  var url, method, cacheKey, httpClient, httpOptions, cacheOptions, cachedValue, skipCache, getCachedValue;

  options      = options || {};
  url          = options.url;
  method       = options.method;
  httpClient   = options.httpClient;
  httpOptions  = options.httpOptions || {};
  cacheOptions = hoek.applyToDefaults(DEFAULT_CACHE_OPTIONS, options.cacheOptions || {});
  cacheKey     = options.cacheKey || crypto.createHash('sha1').update(['get', url, httpOptions.body].join('_')).digest('hex');
  skipCache    = true === options.skipCache;

  getCachedValue = skipCache ? Promise.reject(new Error()) : cache.getCachedValue(cacheKey, cacheOptions);

  return getCachedValue
    .then(function (result) {
      var valueAgeMillis, needsRefresh;

      if (!result.value) { return Promise.reject(new Error()); }  // fallback to HTTP request on no data found

      cachedValue    = result.value;
      valueAgeMillis = Number(new Date()) - result.cached.stored;
      needsRefresh   = cacheOptions.refreshAfter && valueAgeMillis > cacheOptions.refreshAfter;

      if (needsRefresh) { return Promise.reject(new Error()); }  // fallback to HTTP request when data needs refreshing

      callback(null, result.value);
    })
    .catch(function (err) {
      var apiRequest = httpClient[method.toLowerCase()];

      apiRequest.call(httpClient, url, httpOptions, function (err, res, payload) {
        var isError = !!err || !(200 <= res.statusCode && res.statusCode < 300);
        if (isError) {
          // ### TODO: handle retries
          err = err || new Error(['Error', res.statusCode, method, url].join(' '));
          return cachedValue ? callback(null, cachedValue) : callback(err, payload);
        }

        cache.setCachedValue(cacheKey, payload, cacheOptions)
          .then(function () {
            callback(null, payload);
          });
      });
    });
};


exports.stopCache = function () {
  cache.stop();
};

exports.init = function (options) {
  return cache.start(options);
};
