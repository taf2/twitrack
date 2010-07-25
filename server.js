var sys = require('sys');
var http = require('http');
var fs = require('fs');

var tweet_track = require(__dirname + '/lib/tweet_track');

// keep an in memory array of incoming tweets
var TWEETS = [];
var MAX_TWEETS = 20; // limit how many tweets we keep

(function() {
  // start watching a specific query in twitter
  tweet_track.watch("basketball,football,baseball,footy,soccer", function(tweet_string) {
    var tweet = JSON.parse(tweet_string);
    TWEETS.push(tweet);
    sys.puts("received: " + TWEETS.length);
    if (TWEETS.length > MAX_TWEETS) {
      TWEETS.shift();// prune old tweets
    }
  });
})();

// proxy buffered tweets to /tweets
(function() {
  http.createServer(function (request, response) {
    if (request.method == 'GET' || request.method == 'HEAD') {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      if (request.method == 'HEAD') { response.end(); return; }
      if (request.url == '/tweets') {
        response.write("[");
        if (TWEETS.length > 0) {
          for (var i = 0, len = TWEETS.length-1; i < len; ++i) {
            response.write(JSON.stringify(TWEETS[i]));
            response.write(",\n");
          }
          response.write(JSON.stringify(TWEETS[TWEETS.length-1]));
        }
        response.end("]");
      }
      else {
        response.end("try /tweets");
      }
    }
    else {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end("Unsupported method");
    }
  }).listen(1234);
  console.log('Server running at http://127.0.0.1:1234/');
})();
