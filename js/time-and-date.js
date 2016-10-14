var React = require('react');
var Moment = require('moment');

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
        <div className='time'>{this.state.timeobj.format("h:mm:ssa")}</div>
        <div className='date'>{this.state.timeobj.format("dddd MMMM D, YYYY")}</div>
      </div>
    );
  }
});

module.exports = TimeAndDate;
