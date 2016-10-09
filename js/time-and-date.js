var React = require('react');
var moment = require('moment');

var TimeAndDate = React.createClass({
  getInitialState() {
    return {
      timeobj: moment(),
      interval: null
    }
  },

  tick() {
    this.setState({timeobj: moment()});
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
        <div className='time'>{this.state.timeobj.format("h:mm:ssa")}</div>
        <div className='date'>{this.state.timeobj.format("dddd MMMM D, YYYY")}</div>
      </div>
    );
  }
});

module.exports = TimeAndDate;
