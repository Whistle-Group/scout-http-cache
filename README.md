# Scout HTTP Cache

Scout HTTP Cache is a Node.js HTTP client caching module, providing
out-of-the-box caching layer for outgoing HTTP calls to external APIs.

It leverages [Catbox](https://github.com/hapijs/catbox) module from hapi
ecosystem with [Catbox-Redis](https://github.com/hapijs/catbox-redis)
caching strategy adapter for Redis, and is HTTP client agnostic, supporting
[Request](https://github.com/request/request) and [Wreck](https://github.com/hapijs/wreck)
clients, but also any other which is using the same request and response
signatures.


### Releases

See [History](HISTORY.md).
