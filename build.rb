# Build a Javascript Object for looking up words in the ANEN dataset from 1999 and extracted by http://www.manifestdensity.net/2010/06/16/anew/
require 'rubygems'
require 'fastercsv'

# csv file derived from http://www.manifestdensity.net/2010/06/16/anew/
File.open("anew.js","wb") do|f|
  f << "var anew_words = {\n"
  c = 0
  FasterCSV.foreach("anew-1999.csv") do |row|
    c+=1
    next if c == 1
    word           = row[0]
    wordid         = row[1]
    valence_mean   = row[2]
    valence_sd     = row[3]
    arousal_mean   = row[4]
    arousal_sd     = row[5]
    dominance_mean = row[6]
    dominance_sd   = row[7]
    frequency      = row[8]
    next if word == ''
    f << '"' + word + '":{'
    f << "wordid:\"#{wordid}\","
    f << "valence_mean:#{valence_mean},"
    f << "valence_sd:#{valence_sd},"
    f << "arousal_mean:#{arousal_mean},"
    f << "arousal_sd:#{arousal_sd},"
    f << "dominance_mean:#{dominance_mean},"
    f << "dominance_sd:#{dominance_sd},"
    f << "frequency:#{frequency}},\n"
  end
  f << "};"
  f << %%
function anew_lookup(word) {
  return anew_words[word];
}
exports.lookup = anew_lookup;
%
end
