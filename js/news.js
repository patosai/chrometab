var React = require('react');
var moment = require('moment');

var NewsArticle = require('./news-article');

var Util = require('./util');
var secrets = require('./secrets.json');

var News = React.createClass({
  getInitialState() {
    return {
      source: {name: ""},
      articles: []
    }
  },

  _getNews() {
    chrome.storage.local.get('news_sources', (storedObj) => {
      var sourcesData = storedObj.news_sources;
      var unixTime = moment().unix();
      var maxAge = unixTime - (60 * 60 * 24 * 7); // 7 days

      if (sourcesData && sourcesData.timestamp && sourcesData.timestamp > maxAge) {
        var sources = sourcesData.sources;
        var index = Math.floor(Math.random() * sources.length);
        var source = sources[index];
        var filteredSource = {
          id: source.id,
          name: source.name,
          logoUrl: source.urlsToLogos.medium
        };
        this._getNewsFromSource(filteredSource);
      } else {
        var apiUrl = `https://newsapi.org/v1/sources?language=en&country=us`;
        Util.log("Getting new news sources");
        Util.getJson(apiUrl, (data) => {
          if (data.status != "ok") {
            Util.error("Failed to get new news sources - response not ok");
          } else {
            var storedObj = {
              timestamp: unixTime,
              sources: data.sources
            };
            chrome.storage.local.set({'news_sources': storedObj}, () => {
              Util.log("Saved new news sources");
            });
          }
        });
      }
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
