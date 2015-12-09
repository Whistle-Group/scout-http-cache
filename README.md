# Scout HTTP Cache

Scout HTTP Cache is an HTTP client caching module, providing out-of-the-box
caching layer for outgoing HTTP calls to external APIs.

It's HTTP client agnostic, for clients following the common request and
response signatures, like [Request](https://github.com/request/request)
or [Wreck](https://github.com/hapijs/wreck).

It leverages [Catbox](https://github.com/hapijs/catbox) module from hapi
ecosystem and [Catbox-Redis](https://github.com/hapijs/catbox-redis) caching
strategy Redis adapter.
