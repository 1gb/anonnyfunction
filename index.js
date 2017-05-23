var Twit = require('twit');
var fs = require('fs');
var request= require('request');
var rita = require('rita');

var filename = 'combined.txt';
var textData = fs.readFileSync(filename, 'utf8');
var lexicon = new rita.RiLexicon();
generateFirstPartOfTweet();


function generateFirstPartOfTweet() {
  var markov = new rita.RiMarkov(4);
  markov.loadText(textData);
  var sentences = markov.generateSentences(2);
  var sen1 = sentences[0].split(' ');
  var sen2 = sentences[1].split(' ');
  var sen1lastWord = sen1[sen1.length - 1];
  var sen2lastWord = sen2[sen2.length - 1];
  var matchFound = false;
  sen1.pop();
  sen2.pop();
  sen1lastWord = rita.trimPunctuation(sen1lastWord);
  sen2lastWord = rita.trimPunctuation(sen2lastWord);
  sen1.push(sen1lastWord);
  console.log(sen1lastWord, sen2lastWord);

  var completions = markov.getCompletions(sen2);
  for (i = 0; i < completions.length; i++) {
    if (lexicon.isRhyme(sen1lastWord, completions[i])) {
      sen2.push(completions[i]);
      console.log('Match found!', sen1lastWord, completions[i]);
      matchFound = true;

      sen1 = sen1.join(' ');
      sen2 = sen2.join(' ');
      var tweet = sen1 + '\n' + sen2;
      sendTheDangTweet(tweet);
    }
  }

  if (matchFound === false) {
    console.log('No match found. Trying again.');
    generateFirstPartOfTweet();
  }
}

function sendTheDangTweet(tweet) {
  var bot = new Twit({
    consumer_key: process.env.NONNYFUNC_CONSUMER_KEY,
    consumer_secret: process.env.NONNYFUNC_CONSUMER_SECRET,
    access_token: process.env.NONNYFUNC_ACCESS_TOKEN,
    access_token_secret: process.env.NONNYFUNC_ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
  });

  bot.post('statuses/update', {
    status: tweet
  },
  function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(tweet + ' was tweeted');
    }
  });
}
