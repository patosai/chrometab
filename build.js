var fs = require("fs");
var browserify = require("browserify");
browserify("./js/app.js")
  .transform("babelify", {presets: ["es2015", "react"]})
  .bundle()
  .pipe(fs.createWriteStream("extension/js/bundle.js"));

var sass = require('node-sass');
sass.render({
  file: "sass/style.scss",
  outputStyle: "compressed"
}, function(err, result) {
  if (err) {
    throw err;
  }
  fs.writeFile("extension/css/style.css", result.css, function(err) {
    if (err) {
      throw err;
    }
  });
});
