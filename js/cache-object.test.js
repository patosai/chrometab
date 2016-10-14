var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var CacheObject = require('./cache-object');
var Util = require('./util');

describe('Cache Object', () => {
  var cacheObject;

  beforeEach(() => {
    cacheObject = new CacheObject();
  });

  it('should save string data', () => {
    assert.isNull(cacheObject.getData());
    cacheObject.setData('hello');
    assert.equal(cacheObject.getData(), 'hello');
  });

  it('should save object data', () => {
    assert.isNull(cacheObject.getData());
    cacheObject.setData({'foo': 'bar'});
    assert.isObject(cacheObject.getData());
    assert.equal(
        JSON.stringify(cacheObject.getData()),
        JSON.stringify({'foo': 'bar'})
    );
  });

  it('should save metadata', () => {
    assert.isUndefined(cacheObject.getMetadata('star'));
    cacheObject.setMetadata('star', 'wars');
    assert.equal(cacheObject.getMetadata('star'), 'wars');
  });

  it('should export as an object', () => {
    cacheObject.setData({'foo': 'bar'});
    cacheObject.setMetadata('star', 'wars');
    var output = cacheObject.toObject();
    assert.isNotOk(Util.isCacheObject(output));
    assert.isOk(Util.isObject(output));
  });

  it('should import from export data', () => {
    cacheObject.setData({'foo': 'bar'});
    cacheObject.setMetadata('star', 'wars');
    var output = cacheObject.toObject();

    var newCacheObject = CacheObject.fromObject(output);
    assert.equal(newCacheObject.getMetadata('star'), 'wars');
    assert.equal(
        JSON.stringify(newCacheObject.getData()),
        JSON.stringify({'foo': 'bar'})
    );
  });
});
