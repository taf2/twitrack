var paper;
var face;
var smilie;
var lastScore = 5;

if (!window.console) { window.console = {error:function(){},log:function(){}}; }

// given a tweet object convert it into nice markup with links and graphics from twitter
function twitterify(tweet) {
  var text = tweet.text;
  if (!text) { return ""; }
  text += " ";
  // convert normal links
  text = text.replace(/http:(.*?)\s/g,"<a href=\"http:$1\">http:$1</a> ");

  // convert hash marks
  text = text.replace(/#(.*?)(\s)/g, "<a href=\"http://twitter.com/search?q=%23$1\">#$1</a>$2");

  // convert users
  text = text.replace(/@(.*?)([:\s])/g, "<a href=\"http://twitter.com/$1\">@$1</a>$2");

  return text.replace(/\s*$/,'');
}

function twitter_image(tweet) {
  if (tweet.user && tweet.user.profile_image_url) {
    image = "<img width=\"48\" height=\"48\" class=\"profile\" src=\"" + tweet.user.profile_image_url + "\"/>";
  }
  else {
    // default image?
    image = "";
  }
  return image;
}

function twitter_profile(tweet) {
  if (tweet.user && tweet.user.screen_name) {
    //console.log(tweet.user.screen_name);
    return "<a class=\"user\" href=\"http://twitter.com/" + tweet.user.screen_name + "\">" + tweet.user.screen_name + "</a>  ";
  }
  else {
    //console.log(tweet);
  }
}

function updateTweets(tracker) {

  var search = tracker.track;
  var tweets = tracker.tweets;
  var out = [];
  var avg = 0;
  var c = 0;
  var ypoints = [lastScore];
  var xpoints = [];

  var positives = [];
  var negatives = [];
  var unsure = [];

  for (var i = 0, len = tweets.length; i < len; ++i) {
    var tweet = tweets[i];
    if (tweet.score > 0) {
      avg += parseFloat(tweet.score);
      c++;
      if (tweet.score >= 5) { 
        positives.push("<li><span class='profile'><strong>" + tweet.score + "</strong>" + twitter_image(tweet) + "</span>" + twitter_profile(tweet) + twitterify(tweet) + "</li>");
      }
      else {
        negatives.push("<li><span class='profile'><strong>" + tweet.score + "</strong>" + twitter_image(tweet) + "</span>" + twitter_profile(tweet) + twitterify(tweet) + "</li>");
      }
      ypoints.push(parseFloat(tweet.score));
      xpoints.push(i);
    }
    else {
      unsure.push("<li><span class='profile'><strong>n/a</strong>" + twitter_image(tweet) + "</span>" + twitter_profile(tweet) + twitterify(tweet) + "</li>");
    }
  }
  positives = positives.reverse().join('');
  negatives = negatives.reverse().join('');
  unsure = unsure.reverse().join('');

  lastScore = ypoints[ypoints.length-1];
  ypoints.push(9);
  ypoints.push(1);

  avg /= c;

  $("#tweets .positives .target").html("<ul>" + positives + "</ul>");
  $("#tweets .negatives .target").html("<ul>" + negatives + "</ul>");
  $("#tweet-avg").html("Average score: " + avg.toFixed(2) + ", for '<strong>On tweeter now</strong>'"); //+ search + "</strong>'");

  paper.clear();
  var lines = paper.g.linechart(20, 10, 850, 220, xpoints, ypoints, {axis: "0 0 1 1",symbol: "o", smooth: true, nostroke:false});
  lines.symbols.attr({r: 3});

  drawFace(lastScore);

  setTimeout(function() { $.get("/tweets", updateTweets,'json'); },1000);

}

function drawFace(score) {
  try {
  var emotions = ["M223.244,176.636c-15.822-47.305-59.312-72.277-100.944-71.962 c-55.272,0.417-80.74,39.665-88.74,73.398",
                  "M224.802,166.329c-66.448-11.632-52.081,2.514-93.713,2.829 c-55.272,0.417,15.2,10.425-91.81,10.425",
                  "M31.935,150.044c15.464,47.424,58.762,72.725,100.396,72.725 c55.273,0.002,81.038-39.052,89.294-72.725"];

  if (!score) { // draw the first face
    // head
    face.circle(125.758,125.758,125.258);

    // eyes
    face.circle(84.512,82.781,6.186);
    face.circle(161.832,82.781,6.186);

    // smilie
    smilie = face.path(emotions[1]);

  }
  else {
    // animate to a new face as the score changes
    var change = 0;
    if (score < 4) {
      change = 0;
    }
    else if (score > 3 && score < 6) {
      change = 1;
    }
    else if (score > 5) {
      change = 2;
    }

    smilie.animate({path:emotions[change]},500,"<>");
  }
  } catch(e) {
    console.error(e);
  }
}

$(document).ready(function() {
  paper = Raphael("mood-graph");
  paper.g.txtattr.font = "12px 'Fontin Sans', Fontin-Sans, sans-serif";
  face  = Raphael("tweet-face");
  drawFace();
  $.get("/tweets", updateTweets,'json');

});

