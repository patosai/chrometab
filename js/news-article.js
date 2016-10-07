var React = require('react');

var NewsArticle = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    image: React.PropTypes.string,
    url: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <div className='news-article center-children'>
        <a href={this.props.url} target="_blank">
          <img src={this.props.image} alt={this.props.description} />
          <div className='title'>{this.props.title}</div>
        </a>
      </div>
    );
  }
});

module.exports = NewsArticle;
