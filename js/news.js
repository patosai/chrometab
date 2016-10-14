var React = require('react');
var Moment = require('moment');

var Cache = require('./cache');
var NewsArticle = require('./news-article');

var Util = require('./util');
var secrets = require('./json/secrets.json');

var News = React.createClass({
  getInitialState() {
    return {
      source: {name: ""},
      articles: []
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.source !== nextState.source) ||
        (this.state.articles !== nextState.articles);
  },

  _getNews() {
    var apiUrl = `https://newsapi.org/v1/sources?language=en&country=us`;
    Cache.createCacheIfNeeded('news_sources', apiUrl);
    Cache.setMaxAge('news_sources', 60 * 60 * 24 * 4);
    Cache.getData('news_sources', (data) => {
      var sources = data.sources;
      var index = Math.floor(Math.random() * sources.length);
      var source = sources[index];
      var filteredSource = {
        id: source.id,
        name: source.name,
        logoUrl: source.urlsToLogos.medium
      };
      this._getNewsFromSource(filteredSource);
    });
  },

  _getNewsFromSource(source) {
    if (!source || !source.id) {
      Util.error("No source provided to `getNewsFromSource`");
      return;
    }
    Util.log(`Getting news from ${source.id}`);
    var apiKey = secrets.newsapi_api_key;
    var apiUrl = `https://newsapi.org/v1/articles?source=${source.id}&apiKey=${apiKey}`;
    Util.getJson(apiUrl, (data) => {
      this.setState({
        source: source,
        articles: data.articles
      });
    });
  },

  componentDidMount() {
    this._getNews();
  },

  render() {
    return (
      <div className='news'>
        <div className='source'>{`From ${this.state.source.name || this.state.source.id}`}</div>
        {this.state.articles.map((article, idx) => {
          return <NewsArticle key={idx}
              title={article.title}
              description={article.description}
              image={article.urlToImage}
              url={article.url} />
        })}
      </div>
    );
  }
});

module.exports = News;
