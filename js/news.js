var React = require('react');

var Cache = require('./cache');
var NewsArticle = require('./news-article');

var Util = require('./util');
var secrets = require('./json/secrets.json');

const CACHE_KEY = 'news_sources';
const API_URL = 'https://newsapi.org/v1/sources?language=en&country=us';

var News = React.createClass({
  getInitialState() {
    return {
      source: {name: ""},
      articles: []
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.source.name !== nextState.source.name);
  },

  componentDidMount() {
    Cache.initialize(() => {
      Cache.createCacheIfNeeded(CACHE_KEY, API_URL);
      Cache.setMaxAge(CACHE_KEY, 60 * 60 * 24 * 4);
      this._getNews();
    });
  },

  _getNews() {
    this.setState(this.getInitialState());

    Cache.getData(CACHE_KEY, (data) => {
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
    var sourceId = 'newsapi-source-' + source.id;
    var apiKey = secrets.newsapi_api_key;
    var apiUrl = `https://newsapi.org/v1/articles?source=${source.id}&apiKey=${apiKey}`;
    Cache.createCacheIfNeeded(sourceId, apiUrl);
    Cache.setMaxAge(sourceId, 60 * 60); // 1 hour
    Util.log(`Getting news from ${source.id}`);
    Cache.getData(sourceId, (data) => {
      this.setState({
        source: source,
        articles: data.articles
      });
    });
  },

  render() {
    return (
      <div className='news'>
        <button className='refresh' onClick={this._getNews}>
          <img src='svg/refresh.svg'/>
        </button>
        <div className='source'>
          {this.state.source.name || this.state.source.id || 'Loading'}
        </div>
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
