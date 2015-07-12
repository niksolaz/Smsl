var express = require('express');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var app = express();

var client = new Twitter({
	consumer_key:process.env.Twitter_consumer_key,
	consumer_secret:process.env.Twitter_consumer_secret,
	access_token_key:process.env.Twitter_access_token_key,
	access_token_secret:process.env.Twitter_access_token_secret
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.post('/message',function(req,res){

	var msg = req.body.message;
	console.log('message',msg);
	client.post('statuses/update',{status:msg},function(error,tweet,response){
	if(error){
		console.log(error);
		throw error;
	}
	console.log(tweet);
	res.json(tweet);
	});
});

app.get('/message/:message_id',function(req,res){
	var msg_id = 620280555452678100;
	console.log('message_id',msg_id);
	console.log(req.params.message_id);
	client.get('statuses/show',{id:msg_id},function(error,tweets,response){
	if(error){
		console.log(error);
		throw error;
	}
	console.log(tweets);
	res.json(tweets);
	});
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});