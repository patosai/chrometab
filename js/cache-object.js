var Moment = require('moment');

var Util = require('./util');

function CacheObject(metadata, data) {
  if (metadata) {
    Util.assert(Util.isObject(metadata));
  }

  this.data = data || null;
  this.metadata = metadata || {};
}

CacheObject.prototype.getData = function() {
  return this.data;
}

CacheObject.prototype.setData = function(data) {
  this.data = data;
}

CacheObject.prototype.getMetadata = function(metadataKey) {
  Util.assert(Util.isString(metadataKey));
  return this.metadata[metadataKey];
}

CacheObject.prototype.setMetadata = function(metadataKey, metadataData) {
  Util.assert(Util.isString(metadataKey));
  this.metadata[metadataKey] = metadataData;
}

CacheObject.prototype.toObject = function() {
  return {
    metadata: this.metadata,
    data: this.data
  };
}

CacheObject.fromObject = function(obj) {
  Util.assert(Util.isObject(obj));
  var cacheObject = new CacheObject(
    obj.metadata,
    obj.data
  );
  return cacheObject;
}

module.exports = CacheObject;
