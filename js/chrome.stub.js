var chromeStorage = {};

module.exports = {
  storage: {
    local: {
      get(key, callback) {
        var obj = {};
        obj[key] = chromeStorage[key];
        callback(obj);
      },

      set(object, callback) {
        for (var key in object) {
          if (!object.hasOwnProperty(key)) {
            continue;
          }
          chromeStorage[key] = object[key];
        }
        callback();
      },
    }
  }
}
