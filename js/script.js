(function() {
  var timeUpdaterTimeout = null;

  function log(message) {
    console.log(message);
  }

  function error(message) {
    console.error(message);
  }

  function updateTime() {
    var momentObj = moment();
    var time = document.getElementById('time');
    time.innerText = momentObj.format("h:mm:ssa");

    var date = document.getElementById('date');
    date.innerText = momentObj.format("MMMM D, YYYY");
  }

  function perpetuallyUpdateTime() {
    if (timeUpdaterTimeout) {
      clearTimeout(timeUpdaterTimeout);
    }

    updateTime();
    timeUpdaterTimeout = setTimeout(function() {
      perpetuallyUpdateTime();
    }, 1000);
  }

  function getJson(url, callback) {
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

// WEATHER
  function getWeatherApiKey(callback) {
    getJson('secrets.json', function(secrets) {
      callback(secrets.openweathermap_api_key);
    });
  }

  function getWeatherFromApi(callback) {
    log('Getting weather from API');
    var unixTime = moment().unix();

    getWeatherApiKey(function(key) {
      // 4984247 = Ann Arbor
      var url = "http://api.openweathermap.org/data/2.5/weather?id=4984247&appid=" + key;
      getJson(url, function(data) {
        var storedObj = {
          timestamp: unixTime,
          weather: data
        };

        chrome.storage.sync.set({'current_weather': storedObj}, function() {
          //Notify that we saved.
          log('Cached current weather');
          callback(data);
        });
      });
    });
  }

  function getWeatherData(callback) {
    var unixTime = moment().unix();
    var maxAgeSeconds = 60 * 60 * 1; // 1 hour
    var time = unixTime - maxAgeSeconds;

    var savedCurrentWeather = chrome.storage.sync.get('current_weather', function(cached_data) {
      cached_data = cached_data.current_weather;
      if (!cached_data || !cached_data.timestamp || cached_data.timestamp < time) {
        getWeatherFromApi(function(new_data) {
          callback(new_data);
        });
      } else {
        log('Using cached weather data');
        callback(cached_data.weather);
      }
    });
  }

  function loadWeather() {
    var weather = document.getElementById('weather');
    getWeatherData(function(data) {
      var weatherNode = document.getElementById('weather');
      var degreesCelsius = (data.main.temp - 273).toFixed(1);
      weatherNode.innerText = degreesCelsius + '°C in ' + data.name;
      // TODO do more with the data
    });
  }

// NEWS
  function getNewsApiKey(callback) {
    getJson('secrets.json', function(secrets) {
      callback(secrets.newsapi_api_key);
    });
  }

  function loadNews() {
    getNewsApiKey(function(key) {
      getJson('https://newsapi.org/v1/articles?apiKey=' + key + '&source=bloomberg', function(data) {
        // TODO do stuff
      });
    });
  }

  window.onload = function() {
    perpetuallyUpdateTime();
    loadWeather();
    loadNews();
  };
})();
