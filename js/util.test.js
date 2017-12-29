var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var CacheObject = require('./cache-object');
var Util = require('./util');

describe('Util', () => {
  it('should not throw an error when assertion passes', () => {
    var fn = () => {
      Util.assert(true);
    };
    expect(fn).to.not.throw(Error);
  });

  it('should throw an error when assertion passes', () => {
    var fn = () => {
      Util.assert(false);
    };
    expect(fn).to.throw(Error);
  });

  it('should have error message when given to assertion', () => {
    var fn = () => {
      Util.assert(false, "really bad error f00bar");
    };
    expect(fn).to.throw(Error, "really bad error f00bar");
  });

  it('should check if is string', () => {
    var badStuff = [null, undefined, 42, () => {}, {}, [], new CacheObject()];

    assert.ok(Util.isString('foo'));
    for (var badItem of badStuff) {
      assert.notOk(Util.isString(badItem));
    }
  });

  it('should check if is object', () => {
    var badStuff = [null, undefined, 'foo', 42, () => {}, []];

    assert.ok(Util.isObject({}));
    for (var badItem of badStuff) {
      assert.notOk(Util.isObject(badItem));
    }
  });

  it('should check if is function', () => {
    var badStuff = [null, undefined, 'foo', 42, [], new CacheObject()];

    assert.ok(Util.isFunction(() => {}));
    for (var badItem of badStuff) {
      assert.notOk(Util.isFunction(badItem));
    }
  });

  it('should check if is integer', () => {
    var badStuff = [null, undefined, 'foo', () => {}, [], new CacheObject()];

    assert.ok(Util.isInt(42));
    assert.ok(Util.isInt(-1));
    assert.ok(Util.isInt(0));
    for (var badItem of badStuff) {
      assert.notOk(Util.isInt(badItem));
    }
  });

  it('should check if is cache object', () => {
    var badStuff = [{}, null, undefined, 'foo', 42, () => {}];

    assert.ok(Util.isCacheObject(new CacheObject()));
    for (var badItem of badStuff) {
      assert.notOk(Util.isCacheObject(badItem));
    }
  });
});
