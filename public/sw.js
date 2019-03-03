// yikes sorry y'all plz help
//https://serviceworke.rs/strategy-cache-only_service-worker_doc.html
//https://gist.github.com/ngokevin/7eb03d90987c0ed03b873530c3b4c53c
//var CACHE = 'cache-only';
//https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/custom-offline-page/service-worker.js
self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');

  //evt.waitUntil(precache());
});
var VERSION = 'v2';

var cacheFirstFiles = [
  // ADDME: Add paths and URLs to pull from cache first if it has been loaded before. Else fetch from network.
  // If loading from cache, fetch from network in the background to update the resource. Examples:
  // 'assets/img/logo.png',
  // 'assets/models/controller.gltf',
  '/',
  'client.js',
  'style.css',
  'favicon.png',
  'icon-192x192.png',
  'icon-512x512.png'
];

var networkFirstFiles = ['feed.json', 'sw.js'];

// Below is the service worker code.

var cacheFiles = cacheFirstFiles.concat(networkFirstFiles);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => {
      return cache.addAll(cacheFiles);
    }),
  );
});

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') {
    console.log('GET');

    return;
  }
  
  
  if (networkFirstFiles.indexOf(event.request.url) !== -1) {
    event.respondWith(networkElseCache(event));

  } else if (cacheFirstFiles.indexOf(event.request.url) !== -1) {

    event.respondWith(cacheElseNetwork(event));
  }
  

  event.respondWith(
    fetch(event.request).catch((error) => {
      // The catch is only triggered if fetch() throws an exception, which will most likely
      // happen due to the server being unreachable.
      // If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
      // range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
      // errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response
      console.log('Fetch failed; returning offline page instead.', error);
      return caches.match(event.request);
    }),
  );
});

// If cache else network.
// For images and assets that are not critical to be fully up-to-date.
// developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
// #cache-falling-back-to-network
function cacheElseNetwork(event) {
  return caches.match(event.request).then((response) => {
    function fetchAndCache() {
      return fetch(event.request).then((response) => {
        // Update cache.
        caches.open(VERSION).then((cache) => cache.put(event.request, response.clone()));
        return response;
      });
    }

    // If not exist in cache, fetch.
    if (!response) {
      return fetchAndCache();
    }

    // If exists in cache, return from cache while updating cache in background.
    fetchAndCache();
    return response;
  });
}

// If network else cache.
// For assets we prefer to be up-to-date (i.e., JavaScript file).
function networkElseCache(event) {
  return caches.match(event.request).then((match) => {
    if (!match) {
      return fetch(event.request);
    }
    return (
      fetch(event.request).then((response) => {
        // Update cache.
        caches.open(VERSION).then((cache) => cache.put(event.request, response.clone()));
        return response;
      }) || response
    );
  });
}

/*self.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.');
  evt.respondWith(fromCache(evt.request));
});*/

/*self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      '/',
      'feed.json',
      'client.js',
      'style.css'
    ]);
  });
}


function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    console.log(cache);
    return cache.match(request).then(function (matching) {
      console.log("this ran FML")
      return matching || Promise.reject('no-match');
    });
  });
}*/
