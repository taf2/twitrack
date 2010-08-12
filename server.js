var sys = require('sys');
var http = require('http');
var fs = require('fs');

var TweetTrack = require(__dirname + '/lib/tweet_track');
var Sentiment = require(__dirname + "/lib/sentiment");

// keep an in memory array of incoming tweets
var TWEETS = [];
var MAX_TWEETS = 200; // limit how many tweets we keep
//var TWITTER_TRACK = "basketball,football,baseball,footy,soccer";
var TWITTER_TRACK = "#inception";

(function() {
  // start watching a specific query in twitter
  TweetTrack.watch(TWITTER_TRACK, function(tweet_string) {
    var tweet = JSON.parse(tweet_string);
    tweet.score = Sentiment.score(tweet.text);
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
        response.write("{\"track\":" + JSON.stringify(TWITTER_TRACK) + ",");
        response.write("\"tweets\":[");
        if (TWEETS.length > 0) {
          for (var i = 0, len = TWEETS.length-1; i < len; ++i) {
            response.write(JSON.stringify(TWEETS[i]));
            response.write(",\n");
          }
          response.write(JSON.stringify(TWEETS[TWEETS.length-1]));
        }
        response.end("]}");
      }
      else {
        response.end("try /tweets");
      }
    }
    else {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end("Unsupported method");
    }
  }).listen("server.sock");
  console.log('Server running at server.sock');
})();
