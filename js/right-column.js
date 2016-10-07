var React = require('react');

var News = require('./news');

var RightColumn = React.createClass({
  render() {
    return (
      <div className='col right-col'>
        <News />
      </div>
    );
  }
});

module.exports = RightColumn;
