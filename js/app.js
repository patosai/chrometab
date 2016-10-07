var React = require('react');
var ReactDOM = require('react-dom');

var LeftColumn = require('./left-column');
var RightColumn = require('./right-column');

var App = React.createClass({
  render() {
    return (
      <div id='app-root'>
        <LeftColumn />
        <RightColumn />
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('react')
);
