var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;
var expect = chai.expect;

GLOBAL.chrome = require('./chrome.stub');

var Cache = require('./cache');
var Util = require('./util');

describe('Cache', () => {
  before(() => {
    sinon.stub(Util, "log");
  });

  beforeEach(() => {
    chrome.storage.local.clear();
  });

  it('saves new cache objects when asked to', () => {
    Cache.createCache('testname', 'http://testapi.com/foo');
    assert.equal(Cache.getApiUrl('testname'), 'http://testapi.com/foo');
  });

  it('throws error if name is not given', () => {
    var fxn = () => {
      Cache.createCache();
    };
    expect(fxn).to.throw(Error);
  });

  it('throws error if api url is not given', () => {
    var fxn = () => {
      Cache.createCache('testname');
    };
    expect(fxn).to.throw(Error);
  });

  it('throws error if name is not a string', () => {
    var fxn = () => {
      Cache.createCache([]);
    };
    expect(fxn).to.throw(Error);
  });

  it('throws error if API URL is not a string', () => {
    var fxn = () => {
      Cache.createCache('foo', []);
    };
    expect(fxn).to.throw(Error);
  });

  it('saves new cache objects if needed', () => {
    Cache.createCache('testname', 'http://testapi.com/foo');
    Cache.createCacheIfNeeded('testname', 'http://anothertestapi.com/foo');
    assert.equal(Cache.getApiUrl('testname'), 'http://testapi.com/foo');
  });

  it('throws error if createCacheIfNeeded is given non-string name', () => {
    var fxn = () => {
      Cache.createCacheIfNeeded([], 'http://anothertestapi.com/foo');
    };
    expect(fxn).to.throw(Error);
  });

  it('throws error if createCacheIfNeeded is given non-string API URL', () => {
    var fxn = () => {
      Cache.createCacheIfNeeded('foo', []);
    };
    expect(fxn).to.throw(Error);
  });

  it('has a default max age', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    assert.isDefined(Cache.getMaxAge('foo'));
  });

  it('can set data max age', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    Cache.setMaxAge('foo', 104);
    assert.equal(Cache.getMaxAge('foo'), 104);
  });

  it('can set data max age to zero', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    Cache.setMaxAge('foo', 0);
    assert.equal(Cache.getMaxAge('foo'), 0);
  });

  it('cannot set data max age to non-integers', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    var badVariables = [null, undefined, 'lolcat', "0", () => {}, [], {}];
    for (var badVariable of badVariables) {
      var fxn = () => {
        Cache.setMaxAge('foo', badVariable);
      };
      expect(fxn).to.throw(Error);
    }
  });

  it('can set API URL', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    assert.equal(Cache.getApiUrl('foo'), 'http://apiurl.com/foo');
    Cache.setApiUrl('foo', 'http://hello/world');
    assert.equal(Cache.getApiUrl('foo'), 'http://hello/world');
  });

  it('cannot set API URL to non-strings', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    Cache.setApiUrl('foo', 'http://hello/world');
    var badVariables = [null, undefined, 42, 163.9, () => {}, [], {}];
    for (var badVariable of badVariables) {
      var fxn = () => {
        Cache.setApiUrl('foo', badVariable);
      };
      expect(fxn).to.throw(Error);
    }
  });

  it('can set timestamp', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    assert.notEqual(Cache.getTimestamp('foo'), 1234567);
    Cache.setTimestamp('foo', 1234567);
    assert.equal(Cache.getTimestamp('foo'), 1234567);
  });

  it('cannot set timestamp to non-integers', () => {
    Cache.createCache('foo', 'http://apiurl.com/foo');
    var badVariables = [null, undefined, 'lolcat', '0', () => {}, [], {}];
    for (var badVariable of badVariables) {
      var fxn = () => {
        Cache.setTimestamp('foo', badVariable);
      };
      expect(fxn).to.throw(Error);
    }
  });

  it('can get data from API', (done) => {
    Cache.createCache('foo', 'http://apiurl.com/foo');

    var stubData = {
      'data': 'bar'
    };

    var stub = sinon.stub(Util, 'getJson', (url, callback) => {
      assert.equal('http://apiurl.com/foo', url);
      assert(Util.isFunction(callback));
      callback(stubData);
    });

    Cache.getData('foo', (data) => {
      assert(Util.isObject(data));
      assert.equal(data['data'], 'bar');

      stub.restore();
      done();
    });
  });

  it('uses cached data if data is not too old', (done) => {
    Cache.createCache('foo', 'http://apiurl.com/foo');

    // 400 second max age
    Cache.setMaxAge('foo', 400);

    var stubData = {
      'data': 'bar'
    };

    var stub = sinon.stub(Util, 'getJson', (url, callback) => {
      assert.equal('http://apiurl.com/foo', url);
      assert(Util.isFunction(callback));
      callback(stubData);
    });

    assert.notOk(stub.called);

    Cache.getData('foo', (data) => {
      assert(Util.isObject(data));
      assert.equal(data['data'], 'bar');
      assert(stub.calledOnce);

      Cache.getData('foo', (data) => {
        assert(Util.isObject(data));
        assert.equal(data['data'], 'bar');
        // still called only once
        assert(stub.calledOnce);

        stub.restore();
        done();
      });
    });
  });

  it('refreshes cached data if data is past max age', (done) => {
    Cache.createCache('foo', 'http://apiurl.com/foo');

    // 1 second max age
    Cache.setMaxAge('foo', 0);

    var stubData = {
      'data': 'bar'
    };

    var stub = sinon.stub(Util, 'getJson', (url, callback) => {
      assert.equal('http://apiurl.com/foo', url);
      assert(Util.isFunction(callback));
      callback(stubData);
    });

    assert.notOk(stub.called);

    Cache.getData('foo', (data) => {
      assert(Util.isObject(data));
      assert(stub.calledOnce);
      assert.equal(data['data'], 'bar');

      // change the data on fake API
      stubData = {
        'data': 'foobar'
      };

      Cache.getData('foo', (data) => {
        assert(Util.isObject(data));
        assert(stub.calledTwice);
        assert.equal(data['data'], 'foobar');

        stub.restore();
        done();
      });
    });
  });

  it('saves items to chrome local storage', (done) => {
    assert.equal(Object.keys(chrome.storage.local.getAll()).length, 0);

    Cache.createCache('testname', 'http://testapi.com/foo');

    var stubData = {
      'data': 'bar'
    };

    sinon.stub(Util, 'getJson', (url, callback) => {
      callback(stubData);
    });

    Cache.getData('testname', (data) => {
      assert.equal(Object.keys(chrome.storage.local.getAll()).length, 1);
      done();
    });
  });
});
