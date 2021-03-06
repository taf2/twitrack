//var sys = require('sys');
var sprintf = require(__dirname + '/sprintf').sprintf;
exports.score = sentiment;

var anew = require(__dirname + '/anew');
//sys.puts(sys.inspect(anew));

// given a body of text return a score between 1 and 10
// 10 being more positive or happy and 1 being less positive or more hateful
function sentiment(text) {
  var words = text.split(/\s/);
  var scored = {};
  var count = 0;

  for (var i = 0, len = words.length; i < len; ++i) {
    var word = words[i].replace(/[^\w]/,' ').replace(/^\s*/,'').replace(/\s*$/,'').toLowerCase();
    //sys.puts("check: " + word);
    var found = anew.lookup(word);
    if (found) {
      //sys.puts("found: " + word);
      //scored.push(found);
      if (!scored[word]) {
        scored[word] = {anew:found,frequency:0};
      }
      scored[word].frequency++;
      count += 1;
    }
  }

  // compute the score
  var sum = 0;
  for (var word in scored) {
    sum += (scored[word].frequency * scored[word].anew.valence_mean)
  }

  if (count > 0) {

    var score = (1 / count) * sum;

    return sprintf('%.2f', score);
  }
  else {
    return null; // neutral we can't determine
  }
}

/*
var result = sentiment("The quick brown fox jumps over the lazy dog.");
sys.puts(sys.inspect(result));
// should return ~= 6.27
*/
