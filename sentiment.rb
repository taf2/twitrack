require 'anew'

module Sentiment
  class Analyser
    # given a body of text return a score between 1 and 10
    # 10 being positive or happy and 1 being less positive or more hateful
    def self.sentiment(text)
      words = text.split(/\s/).map {|word| word.strip.downcase }
      scored = {}
      count = 0

      # build a frequency scoring
      words.each do|word|
        found = Sentiment::ANEW.lookup(word)
        if found
          scored[word] = {:anew => found, :frequency => 0} unless scored.key?(word)
          scored[word][:frequency] += 1
          count += 1
        end
      end

      # compute the sentiment score based on the valence_mean in ANEW
      sum = 0.0
      scored.keys.each do|word|
        sum += (scored[word][:frequency].to_f * scored[word][:anew][:valence_mean].to_f)
      end

      if count > 0
        score = (1.0 / count) * sum
        return sprintf("%.2f", score).to_f
      else
        # neutral we can't determine a sentiment
        return 5.0
      end

    end
  end
end

if $0 == __FILE__
  require 'test/unit'

  class SentimentTest < Test::Unit::TestCase
    def test_neutral
      score = Sentiment::Analyser.sentiment("The quick brown fox jumps over the lazy dog.")
      assert_equal 5.56, score
    end

    def test_negative
      score = Sentiment::Analyser.sentiment("The slow super angry brown fox jumps over the horrible flowers.")
      assert_equal 3.91, score
    end

    def test_positive
      score = Sentiment::Analyser.sentiment("The quick super happy brown fox jumps over the beautiful flowers.")
      assert_equal 7.39, score
    end

  end
end
