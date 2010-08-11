var sys = require('sys');
var http = require('http');

// connect to twitter and start listening for new tweets
function track_tweets(keywords,tweetReady) {

  var tweet_buffer = "";

  function parseTweets(chunk) {
    tweet_buffer += chunk;
    var parts = tweet_buffer.split("\n"); // tweets are streamed with a newline delimiter
    //sys.puts(parts.length);
    while (parts.length > 1) {
      try {
        var part = parts.shift();
        tweetReady(part);
      } catch(e) {
        sys.puts(e.message);
        sys.puts(sys.inspect(e));
        sys.puts(e.stack);
      }
    }
    tweet_buffer = parts.join("\n");
    if (tweet_buffer.length > 0) { sys.puts("buffer size: " + tweet_buffer.length); }
  }

  function trackKeywords(terms) {
    var search = "track=" + terms;
    sys.puts("searching for: " + search);
    var twitter_basic_auth = process.env['TWITTER_BASIC'];
    var twitter = http.createClient(80, 'stream.twitter.com');
    // http://stream.twitter.com/1/statuses/filter.json
    var request = twitter.request('POST', '/1/statuses/filter.json',
                                  {'Host': 'stream.twitter.com',
                                   'Authorization': 'Basic ' + twitter_basic_auth,
                                   'Content-Length': search.length,
                                   'Content-Type': 'application/x-www-form-urlencoded'});

    request.on('response', function (response) {
      //response.setEncoding('utf8');
      response.on('data', parseTweets);
      response.on('end', function() {
        sys.puts("connection dropped restart in 3 seconds...");
        setTimeout(trackKeywords,3000); // restart the connection to twitter after 3 seconds?
      });
    });

    request.write(search);
    request.end();
  }

  trackKeywords(keywords);

}
exports.watch=track_tweets;
