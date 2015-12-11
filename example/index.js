var Promise   = require('bluebird')
  , httpCache = require('../lib')
  , wreck     = require('wreck')
  , request   = require('request')
  , cacheReady;

cacheReady = httpCache.init({ partition: 'examplehttpcache' });

cacheReady.then(function () {
  var getUrl       = 'http://jsonplaceholder.typicode.com/posts/1'
    , postUrl      = 'http://jsonplaceholder.typicode.com/posts'
    , httpOptions  = { json: true, /*timeout: 1000, maxRetries: 3,*/ body: { title: 'test' } }
    , cacheOptions = { refreshAfter: 15 * 1000, ttl: 24 * 60 * 60 * 1000 }
    , getPromise
    , postPromise;


  Promise.all([
    new Promise(function (resolve, reject) {
      var options = {
        method      : 'POST',
        url         : postUrl,
        httpClient  : wreck,
        httpOptions : httpOptions,
        cacheOptions: cacheOptions,
        skipCache   : false,
      };

      httpCache.request(options, function (err, body) {
        if (err) { console.log('POST ERROR:', err.message); }
        console.log(body);
        resolve();
      });
    }),
    new Promise(function (resolve, reject) {
      var options = {
        method      : 'GET',
        url         : getUrl,
        httpClient  : wreck,
        httpOptions : httpOptions,
        cacheOptions: cacheOptions,
        skipCache   : true,
      };

      httpCache.request(options, function (err, body) {
        if (err) { console.log('GET ERROR:', err.message); }
        console.log(body);
        resolve();
      });
    }),
  ]).then(httpCache.stopCache);
});
