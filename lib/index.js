var Promise = require('bluebird')
  , hoek    = require('hoek')
  , cache   = require('./cache');

exports.get = function get(httpClient, url, httpOptions, cacheOptions, callback) {
  var key, resCached;

  if ('function' === typeof httpOptions) {
    callback     = httpOptions;
    cacheOptions = undefined;
    httpOptions  = undefined;
  }
  if ('function' === typeof cacheOptions) {
    callback     = cacheOptions;
    cacheOptions = undefined;
  }

  key       = ['post', url].join('_');
  resCached = { statusCode: 200 };

  return cache.getCachedValue(key, cacheOptions)
    .bind({})
    .then(function (value) {
      callback(null, resCached, value)
    })
    .catch(function (err) {
      httpClient.get(url, httpOptions, function (err, res, payload) {
        var isError = err || res.statusCode < 200 || res.statusCode >= 300;
        if (isError) {
          // ### TODO: handle retries
          return this.cachedValue ? callback(null, resCached, this.cachedValue) : callback(err || payload, res, payload);
        }

        cache.setCachedValue(key, payload, cacheOptions)
          .then(function () {
            callback(null, res, payload);
          });
      });
    });
}


exports.post = function (httpClient, url, httpOptions, cacheOptions, callback) {
  var key, resCached;

  if ('function' === typeof httpOptions) {
    callback     = httpOptions;
    cacheOptions = undefined;
    httpOptions  = undefined;
  }
  if ('function' === typeof cacheOptions) {
    callback     = cacheOptions;
    cacheOptions = undefined;
  }

  key       = ['post', url].join('_');
  resCached = { statusCode: 200 };

  return cache.getCachedValue(key, cacheOptions)
    .bind({})
    .then(function (value) {
      callback(null, resCached, value)
    })
    .catch(function (err) {
      httpClient.post(url, httpOptions, function (err, res, payload) {
        var isError = err || res.statusCode < 200 || res.statusCode >= 300;
        if (isError) {
          // ### TODO: handle retries
          return this.cachedValue ? callback(null, resCached, this.cachedValue) : callback(err || payload, res, payload);
        }

        cache.setCachedValue(key, payload, cacheOptions)
          .then(function () {
            callback(null, res, payload);
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
