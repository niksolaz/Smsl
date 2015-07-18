var express = require('express');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
//Database Mongodb connect with Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/msgGlobal/msgs');
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error: '));
db.once('connected',function(){
	console.log('Connected to Database');
});
// Example Schema 
var msgSchema = mongoose.Schema({
	user_id: {},
	message: String
});

var MSG = mongoose.model('MSG',msgSchema);
//NOTE: with process.env.USER_ID register my id 
var userTweet = new MSG({user_id:process.env.USER_ID});
console.log(userTweet.user_id);

var app = express();
// Client Twitter
var client = new Twitter({
	consumer_key:process.env.TWITTER_CONSUMER_KEY,
	consumer_secret:process.env.TWITTER_CONSUMER_SECRET,
	access_token_key:process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret:process.env.TWITTER_ACCESS_TOKEN_SECRET
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

	var msgTweet = new MSG({user_id:userTweet.user_id,message:msg}); //create new model 
	console.log(msgTweet.user_id,msgTweet.message);
	msgTweet.save(function(err){      //save the message in db
		if(!err) return ('User saved successfully!');
	});

	console.log(tweet);
	res.json(tweet);
	});
});

app.get('/message/:message_id',function(req,res){
	var msg_id = req.params.message_id;
	console.log('message_id',msg_id);
	if(msg_id)
	client.get('statuses/show',{id:msg_id},function(error,tweets,response){
	if(error){
		console.log(error);
		throw error;
	}
	var checkIntoDB = function(){
		var url=db.collection('msgs').findOne({_id:tweets.id_str})
		console.log(url._id + url.message);
	}
	
	

	console.log(tweets.text);
	res.json(tweets.text);
	});
});

app.get('/messages',function(req,res){
	//var user = process.env.USER_ID;
	client.get('statuses/user_timeline',{user_id:user},function(error,tweets,response){
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