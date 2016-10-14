var Moment = require('moment');

var CacheObject = require('./cache-object');
var Util = require('./util');

const CHROME_STORAGE_KEY = 'chrometab';
const MAX_AGE_DEFAULT_SECONDS = 400;

var cache = {};
var cacheLoaded = false;
var cacheLoading = false;
var cacheLoadCallbacks = [];

/*
 * Chrome storage save/load
 */

function loadStorageData(callback) {
  if (callback) {
    Util.assert(Util.isFunction(callback));
    addCacheLoadCallback(callback);
  }

  if (cacheLoading) {
    return;
  }

  cacheLoading = true;

  chrome.storage.local.get(CHROME_STORAGE_KEY, (storageObj) => {
    Util.assert(Util.isObject(storageObj));
    var loadedObj = storageObj[CHROME_STORAGE_KEY] || {};
    for (var key in loadedObj) {
      if (!loadedObj.hasOwnProperty(key)) {
        continue;
      }

      var data = loadedObj[key];
      var cacheObject = CacheObject.fromObject(data);
      cache[key] = cacheObject;
    }

    cacheLoaded = true;
    cacheLoading = false;

    for (var idx in cacheLoadCallbacks) {
      var fxn = cacheLoadCallbacks[idx];
      Util.assert(Util.isFunction(fxn));
      fxn();
    }
    cacheLoadCallbacks = [];
  });
}

function saveStorageData(callback) {
  if (callback) {
    Util.assert(Util.isFunction(callback));
  }

  var storageObj = {};
  var savedObj = {};
  for (var key in cache) {
    if (!cache.hasOwnProperty(key)) {
      continue;
    }

    var cacheObject = cache[key];
    savedObj[key] = cacheObject.toObject();
  }

  storageObj[CHROME_STORAGE_KEY] = savedObj;

  chrome.storage.local.set(storageObj, () => {
    if (callback) {
      callback();
    }
  });
}

function addCacheLoadCallback(fxn) {
  Util.assert(Util.isFunction(fxn));
  cacheLoadCallbacks.push(fxn);
}

/*
* Create caches
 */

function createCache(name, apiUrl) {
  Util.assert(Util.isString(name));
  Util.assert(Util.isString(apiUrl));
  var cacheObject = new CacheObject({apiUrl: apiUrl});
  cache[name] = cacheObject;

  saveStorageData();
}

function createCacheIfNeeded(name, apiUrl) {
  if (!Util.isCacheObject(cache[name])) {
    createCache(name, apiUrl);
  }
}

/*
* Get/set data from cache
 */

function getData(key, callback) {
  Util.assert(Util.isString(key));
  Util.assert(Util.isFunction(callback));

  if (!cacheLoaded) {
    loadStorageData(() => {
      getData(key, callback);
    });
    return;
  } else if (cacheLoading) {
    addCacheLoadCallback(() => {
      getData(key, callback);
    });
    return;
  }

  var cacheObject = cache[key];
  if (!Util.isCacheObject(cacheObject)) {
    callback(null);
    return;
  }

  var dataAge = getTimestamp(key);
  var maxAgeSeconds = getMaxAge(key);

  var dataIsOld = Moment().unix() >= dataAge + maxAgeSeconds;
  var noData = !cacheObject.getData();
  if (dataIsOld || noData) {
    Util.log("Getting new data for " + key);
    // fetch new data
    var apiUrl = getApiUrl(key);
    Util.getJson(apiUrl, (data) => {
      setData(key, data);
      callback(data);
    });
  } else {
    Util.log("Using cached data for " + key);
    callback(cacheObject.getData());
  }
}

function setData(key, data, callback) {
  Util.assert(Util.isString(key));
  if (callback) {
    Util.assert(Util.isFunction(callback));
  }

  var cacheObject = cache[key];
  Util.assert(Util.isCacheObject(cacheObject));
  cacheObject.setData(data);
  setTimestamp(key, Moment().unix());

  saveStorageData(() => {
    if (callback) {
      callback();
    }
  });
}

/*
 * Set cache data and metadata
 */

function getMetadata(key, metadataKey) {
  Util.assert(Util.isString(key));
  Util.assert(Util.isString(metadataKey));

  var cacheObject = cache[key];
  Util.assert(Util.isCacheObject(cacheObject));
  return cacheObject.getMetadata(metadataKey);
}

function setMetadata(key, metadataKey, metadataData) {
  Util.assert(Util.isString(key));
  Util.assert(Util.isString(metadataKey));

  var cacheObject = cache[key];
  Util.assert(Util.isCacheObject(cacheObject));
  cacheObject.setMetadata(metadataKey, metadataData);

  saveStorageData();
}

function getMaxAge(key) {
  // DEFAULT: 400s
  var maxAge = getMetadata(key, 'maxAgeSeconds');
  return (maxAge || maxAge === 0) ? maxAge : MAX_AGE_DEFAULT_SECONDS;
}

function setMaxAge(key, maxAgeSeconds) {
  Util.assert(Util.isInt(maxAgeSeconds));
  setMetadata(key, 'maxAgeSeconds', maxAgeSeconds);
}

function getApiUrl(key) {
  return getMetadata(key, 'apiUrl');
}

function setApiUrl(key, url) {
  Util.assert(Util.isString(url));
  setMetadata(key, 'apiUrl', url);
}

function getTimestamp(key) {
  return getMetadata(key, 'timestamp');
}

function setTimestamp(key, timestamp) {
  Util.assert(Util.isInt(timestamp));
  setMetadata(key, 'timestamp', timestamp);
}

/*
 * Exported functions
 */

module.exports = {
  createCache: createCache,

  createCacheIfNeeded: createCacheIfNeeded,

  getData: getData,

  getMaxAge: getMaxAge,

  setMaxAge: setMaxAge,

  getApiUrl: getApiUrl,

  setApiUrl: setApiUrl,

  getTimestamp: getTimestamp,

  setTimestamp: setTimestamp
};
