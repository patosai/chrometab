var React = require('react');
var moment = require('moment');

var Util = require('./util');
var secrets = require('./secrets.json');

var Weather = React.createClass({
  getInitialState() {
    return {
      weatherData: {
        city: {
          name: "New York"
        },
        list: []
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
        var apiKey = secrets.openweathermap_api_key;
        var cityId = "4984247"; // Ann Arbor
        var url = `http://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}`;
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
    var maxTimeForecasted = moment().unix() + (60 * 60 * 24); // 24 hour forecast
    var forecastData = [];
    for (var ii = 0; ii < this.state.weatherData.list.length; ++ii) {
      var data = this.state.weatherData.list[ii];
      if (data.dt < maxTimeForecasted) {
        forecastData.push(data);
      } else {
        break;
      }
    }

    return (
      <div className='weather center-children'>
        <div className='title'>
          {`Forecast for ${this.state.weatherData.city.name}, ${this.state.weatherData.city.country}`}
        </div>
        <table className='forecast'>
          <tbody>
            <tr>
              {forecastData.map((data, idx) => {
                return (
                  <td key={idx}>
                    <div className='time'>
                      {moment.unix(data.dt).format("H:MM")}
                    </div>
                    <div className='temp'>
                      <img className='icon' src={`http://openweathermap.org/img/w/${data.weather[0].icon}.png`} />
                      {`${(data.main.temp - 273).toFixed(1)}C`}
                    </div>
                    <div className='humidity'>
                      {`${data.main.humidity}%`}
                    </div>
                    <div className='wind'>
                      {`${data.wind.speed}m/s`}
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
