var React = require('react');
var Moment = require('moment');

var Cache = require('./cache');
var secrets = require('./json/secrets.json');

const CACHE_KEY = 'current_weather';
const API_URL = `http://api.wunderground.com/api/${secrets.wunderground_api_key}/forecast/q/NY/New_York.json`;

const CACHE_KEY_HOURLY = CACHE_KEY + 'hourly';
const API_URL_HOURLY = `http://api.wunderground.com/api/${secrets.wunderground_api_key}/hourly/q/NY/New_York.json`;

var Weather = React.createClass({
  getInitialState() {
    return {
      weatherData: null,
      hourlyWeatherData: null
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.weatherData !== nextState.weatherData) ||
        (this.state.hourlyWeatherData !== nextState.hourlyWeatherData);
  },

  componentDidMount() {
    Cache.initialize(() => {
      Cache.createCacheIfNeeded(CACHE_KEY, API_URL);
      Cache.setMaxAge(CACHE_KEY, 60 * 60 * 4);
      this._getWeather();

      Cache.createCacheIfNeeded(CACHE_KEY_HOURLY, API_URL_HOURLY);
      Cache.setMaxAge(CACHE_KEY_HOURLY, 60 * 15);
      this._getHourlyWeather();
    });
  },

  _getWeather() {
    Cache.getData(CACHE_KEY, (data) => {
      this.setState({weatherData: data});
    });
  },

  _getHourlyWeather() {
    Cache.getData(CACHE_KEY_HOURLY, (data) => {
      this.setState({hourlyWeatherData: data});
    });
  },

  render() {
    var forecastData = [];
    var hourlyForecastData = [];

    if (this.state.weatherData) {
      forecastData = this.state.weatherData.forecast.simpleforecast.forecastday;
    }

    if (this.state.hourlyWeatherData) {
      console.log(this.state.hourlyWeatherData);
      hourlyForecastData = this.state.hourlyWeatherData.hourly_forecast;
    }

    return (
      <div className='weather center-children'>
        <table className='forecast'>
          <tbody>
            <tr>
              {forecastData.map((data, idx) => {
                var momentTime = Moment.unix(parseInt(data.date.epoch));
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

        <div id='hourly-forecast-popup'>
          <table className='hourly-forecast'>
            <tbody>
              <tr>
                {hourlyForecastData.map((data, idx) => {
                  var momentTime = Moment.unix(parseInt(data.FCTTIME.epoch));
                  return (
                    <td key={idx}>
                      <div className='date'>
                        {(idx === 0 || momentTime.hour() === 0) ? momentTime.format("M/D") : ""}
                      </div>
                      <div className='time'>
                        {momentTime.format("ha")}
                      </div>
                      <img className='icon' src={`weather-svg/${data.icon}.svg`} />
                      <div className='temp'>
                        {data.temp.metric}°C
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = Weather;
