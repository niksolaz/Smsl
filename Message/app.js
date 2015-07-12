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
/*
client.get('statuses/show',{id:103},function(error,tweets,response){
	if(error) throw error;
	console.log(tweets);
});*/
client.post('/statuses/update',{status:'I am Nicola'},function(error,tweet,response){
	if(error) throw error;
	console.log(tweet);
});
//client.stream(path, params, callback);


var Mex = {
	'account':{
		'id':Number,
		'username':String
	},
	'show':{
		'message':{
			'message_id':{
				'social':['Twitter','Facebook','Google+']
			}
		}
	}
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.post('/message/social',function(req,res){
	console.log(req.body.social);
	res.json({social:req.body.social});
});

app.put('/message/:message_id',function(req,res){
});

app.post('/account',function(req,res){
	console.log(req.body.account);
	res.json({id:req.body.id, username:req.body.username});
});

app.get('/account/:username',function(req,res){
	res.send(Mex[req.param.username]);
	console.log(Mex.account.username);
});

app.put('/account/:id',function(req,res){
});

app.get('/show/message/:message_id',function(req,res){
	res.send(Mex[req.param.message_id]);
	console.log(Mex.show.message.message_id);
});

app.get('/show/message/message_id/:social',function(req,res){
	res.send(Mex[req.param.social]);
	console.log(Mex.show.message.message_id.social);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});