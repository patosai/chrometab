var React = require('react');
var moment = require('moment');

var Util = require('./util');
var secrets = require('./secrets.json');

var Weather = React.createClass({
  getInitialState() {
    return {
      weatherData: {
        main: {
          temp: 273
        },
        name: "New York"
      }
    }
  },

  _getWeather() {
    chrome.storage.local.get('current_weather', (storedObj) => {
      var weatherData = storedObj.current_weather;
      var unixTime = moment().unix();
      var maxAge = unixTime - (1 * 60 * 60);

      if (weatherData && weatherData.timestamp && weatherData.timestamp > maxAge) {
        Util.log('Using cached weather data');
        this.setState({weatherData: weatherData.weather});
      } else {
        var apiKey = secrets.openweathermap_api_key;
        var cityId = "4984247"; // Ann Arbor
        var url = `http://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}`;
        Util.log('Getting weather from API');
        Util.getJson(url, (data) => {
          var storedObj = {
            timestamp: unixTime,
            weather: data
          };

          chrome.storage.local.set({'current_weather': storedObj}, () => {
            //Notify that we saved.
            Util.log('Cached current weather data');
            this.setState({weatherData: data});
          });
        });
      }
    });

  },

  componentDidMount() {
    this._getWeather();
  },

  render() {
    return (
      <div className='weather center-children'>
        <div className='current'>
          {`${(this.state.weatherData.main.temp - 273).toFixed(1)}°C in ${this.state.weatherData.name}`}
        </div>
      </div>
    );
  }
});

module.exports = Weather;
