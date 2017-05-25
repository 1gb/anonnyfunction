var Twit = require('twit');
var fs = require('fs');
var request= require('request');
var rita = require('rita');

var filename = 'combined.txt';
var textData = fs.readFileSync(filename, 'utf8');
var lexicon = new rita.RiLexicon();
generateTweet();

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function generateTweet() {
  var j = 0;

  while (j < 20) {
    var markov = new rita.RiMarkov(4);
    markov.loadText(textData);
    var sentences = markov.generateSentences(2);
    var sen1 = sentences[0].split(' ');
    var sen2 = sentences[1].split(' ');
    var sen1lastWord = sen1[sen1.length - 1];
    var sen2lastWord = sen2[sen2.length - 1];
    sen1.pop();
    sen2.pop();
    sen1lastWord = rita.trimPunctuation(sen1lastWord);
    sen2lastWord = rita.trimPunctuation(sen2lastWord);
    sen1.push(sen1lastWord);
    sen2lastWordPos = rita.getPosTags(sen2lastWord);
    var rhymes = lexicon.rhymes(sen1lastWord);

    rhymes = shuffleArray(rhymes);
    
    if  (rhymes.length > 200) {
      rhymes.length = 200;
    }

    for (i = 0; i < rhymes.length; i++) {
      sen2newPos = rita.getPosTags(rhymes[i]);
      // console.log('sub-try: ' + i + ' out of ' + rhymes.length);
      if (sen2lastWordPos[0] === sen2newPos[0]) {
        sen2.push(rhymes[i]);
        // console.log('Match found!', sen2lastWord, rhymes[i], rita.getPosTags(rhymes[i]));

        sen1 = sen1.join(' ');
        sen2 = sen2.join(' ');
        var tweet = sen1 + '\n' + sen2;
        j = 20;
        console.log(tweet);
        // sendTweet(tweet);
        break;
      }
    }

    j++;
  }
}

function sendTweet(tweet) {
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
