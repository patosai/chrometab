var CacheObject = require('./cache-object');

exports.assert = function(assertion, message) {
  if (!assertion) {
    throw new Error(message || "Assertion failed");
  }
}

exports.log = function(message) {
  console.log(message);
}

exports.error = function(message) {
  console.error(message);
}

exports.isString = function(obj) {
  return obj && (typeof obj  === "string");
}

exports.isObject = function(obj) {
  return obj && (typeof obj  === "object") && !Array.isArray(obj);
}

exports.isFunction = function(obj) {
  return obj && (typeof obj  === "function");
}

exports.isInt = function(obj) {
  return Number.isInteger(obj);
}

exports.isCacheObject = function(obj) {
  return obj && (obj.constructor.name == "CacheObject");
}

exports.getJson = function(url, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);
}
