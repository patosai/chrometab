var React = require('react');
var moment = require('moment');

var Util = require('./util');
var secrets = require('./json/secrets.json');

var Weather = React.createClass({
  getInitialState() {
    return {
      weatherData: {
        forecast: {
          simpleforecast: {
            forecastday: []
          }
        }
      }
    }
  },

  _getWeather() {
    chrome.storage.local.get('current_weather', (storedObj) => {
      var weatherData = storedObj.current_weather;
      var unixTime = moment().unix();
      var maxAge = unixTime - (60 * 60 * 4); // 4 hours

      if (weatherData && weatherData.timestamp && weatherData.timestamp > maxAge) {
        Util.log('Using cached weather data');
        this.setState({weatherData: weatherData.weather});
      } else {
        var apiKey = secrets.wunderground_api_key;
        var url = `http://api.wunderground.com/api/${apiKey}/forecast/q/MI/Ann_Arbor.json`;
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
    var forecastData = this.state.weatherData.forecast.simpleforecast.forecastday;

    return (
      <div className='weather center-children'>
        <div className='title'>
          Forecast
        </div>
        <table className='forecast'>
          <tbody>
            <tr>
              {forecastData.map((data, idx) => {
                var momentTime = moment.unix(parseInt(data.date.epoch));
                return (
                  <td key={idx}>
                    <div className='time'>
                      {momentTime.format("ddd")}
                    </div>
                    <img className='icon' src={`weather-svg/${data.icon}.svg`} />
                    <div className='temp'>
                      H {data.high.celsius}°C, L {data.low.celsius}°C
                    </div>
                    <div className='humidity'>
                      {data.avehumidity}%
                    </div>
                    <div className='wind'>
                      {data.avewind.mph}mph
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = Weather;
