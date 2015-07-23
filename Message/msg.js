var express = require('express');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var async = require('async');

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
	user_id: String,
	message: String,
	tweet_id:String
});

var MSG = mongoose.model('MSG',msgSchema);
//NOTE: with process.env.USER_ID register my id 
var userTweet = new MSG({user_id:process.env.USER_ID});
console.log(userTweet.user_id);

var app = express();

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

	var msgTweet = new MSG({user_id:userTweet.user_id,message:msg,tweet_id:tweet.id_str}); //create new model 
	console.log(msgTweet.user_id,msgTweet.message,msgTweet.tweet_id);
	msgTweet.save(function(err){      //save the message in db
		if(!err) return ('User saved successfully!');
	});

	console.log(tweet);
	res.json(tweet);
	});
});


app.get('/message/:message_id',

	function(req,res){

		var msg_id = mongoose.Types.ObjectId(req.params.message_id);
		console.log('PROGRAM START');

		async.waterfall([
			function(callback){
				console.log('First Step');
				callback(null,'one');
			},
			function(msg1,callback){
				db.collection('msgs').findOne({'_id':msg_id});
				console.log('Second Step--> '+msg1.message);
				callback(null,'two');
			},
			function(tweets,callback){
				client.get('statuses/show',{id:msg1.tweet_id});
				console.log('Third Step--> ' + tweets );
				callback(null,'Final Result');
			}
		], function(err,result){
			console.log('Main callback: '+ result);
			}
		);
		console.log('END PROGRAM');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});






