var React = require('react');
var Moment = require('moment');

require('moment/locale/ja');

Moment.locale();

var TimeAndDate = React.createClass({
  getInitialState() {
    return {
      timeobj: Moment(),
      interval: null
    }
  },

  tick() {
    this.setState({timeobj: Moment()});
  },

  componentDidMount() {
    this.setState({interval: setInterval(() => this.tick(), 1000)});
  },

  componentWillUnmount() {
    clearInterval(this.state.interval);
  },

  render() {
    return (
      <div className='time-and-date'>
        <div className='time'>{this.state.timeobj.format("h:mm:ss")}</div>
        <div className='noon'>{this.state.timeobj.format("a")}</div>
        <div className='day-of-week'>{this.state.timeobj.format("dddd")}</div>
        <div className='date'>{this.state.timeobj.format("MMMM D, YYYY")}</div>
      </div>
    );
  }
});

module.exports = TimeAndDate;
