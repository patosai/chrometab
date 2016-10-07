var React = require('react');

var TimeAndDate = require('./time-and-date');
var Weather = require('./weather');

var LeftColumn = React.createClass({
  render() {
    return (
      <div className='col left-col'>
        <div className='row flex'>
          <TimeAndDate />
        </div>
        <div className='row'>
          <Weather />
        </div>
      </div>
    );
  }
});

module.exports = LeftColumn;
