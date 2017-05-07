var Twit = require('twit');
var fs = require('fs');
var request= require('request');
var rita = require('rita');

var filename = 'combined.txt';
var inputText = '';
var builtTweet = '';

fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('OK: ' + filename);
  inputText = data;
});

var bot = new Twit({
  consumer_key: process.env.NONNYFUNC_CONSUMER_KEY,
  consumer_secret: process.env.NONNYFUNC_CONSUMER_SECRET,
  access_token: process.env.NONNYFUNC_ACCESS_TOKEN,
  access_token_secret: process.env.NONNYFUNC_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

function makeWholeTweet() {
  function generateFirstPartOfTweet() {
    var markov = new rita.RiMarkov(3);
    markov.loadText(inputText);
    var sentence = markov.generateSentences(1);
    builtTweet = sentence;
    var lastWord = sentence[0].split(' ');
    lastWord = lastWord[lastWord.length -1];
    lastWord = lastWord.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,'');
    if (lastWord.length <= 2) {
      console.log('word too short:', lastWord);
      return;
    } else {
      getRhyme(lastWord);
    }
  }

  function pickRandomNumber1to3() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function getRhyme(rhymeMe) {
    request({ url:'http://rhymebrain.com/talk?function=getRhymes&word=' + rhymeMe }, function (error, response, body) {
      if (error) {
        console.log('Error: ' + error);
      } else if (JSON.parse(response.body).length === 0){
        console.log('no good rhyme words.');
        return;
      } else {
        var result = JSON.parse(response.body);
        var rhymeWord = result[0].word;
        if (result.length > 2) {
          rhymeWord = result[pickRandomNumber1to3()].word;
        }

        if (rhymeWord.length <= 2) {
          console.log('word too short:', rhymeWord);
          return;
        } else {
          generateSecondPartOfTweet(rhymeWord);
        }
      }
    });
  }

  function generateSecondPartOfTweet(result) {
    word = result + '.';
    var markov = new rita.RiMarkov(3);
    markov.loadText(inputText);
    var sentence2 = markov.generateSentences(1);
    sentence2 = sentence2[0].split(' ');
    sentence2.pop();
    sentence2.push(word);
    sentence2 = sentence2.join(' ');
    builtTweet = builtTweet + '\n' + sentence2;
    bot.post('statuses/update', {
      status: builtTweet
    },
    function(err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(builtTweet + ' was tweeted');
      }
    });
  }
}

setInterval(function() {
  makeWholeTweet();
}, 60*1000*5);
