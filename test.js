var imgText = require('./');
var request = require('request');

var text = 'Bill Murray';
var imgUrl = 'http://i.imgur.com/74om6Zo.jpg';
var options = { file: 'test.png' };

request.get({encoding: 'binary', url: imgUrl}, function(error, response, body){
  if (!error) {
    var img = new Buffer(body, 'binary');

    imgText(img, text, options, function(err, res) {
      if (!err) {
        console.log(res);
      } else { console.log(new Error(err)); }
    });

  } else { console.log(new Error(error)); }
});
