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

	console.log('PROGRAM START');
	
	async.waterfall([
		function(callback){
			client.post('statuses/update',{status:msg},function(err,tweet,response){
				if(err) callback(err);
				console.log(tweet);
				callback(null,tweet);
		},
		function(msg1,callback){
			var msgTweet = new MSG({user_id: userTweet.user_id, message: msg1.msg, tweet_id: tweet.id_str});
			console.log(msgTweet.user_id,msgTweet.message,msgTweet.tweet_id);
			msgTweet.save(function(err,file){  
				if(!err) return ('User saved successfully!');
				callback(null,file);	
			});
		}
	], function(err,result){
			 if(err) return err;
			 console.log('Main callback: '+ result);
			 res.json(result);
			}
	);
	console.log('END PROGRAM');
});



app.get('/message/:message_id',

	function(req,res){

		var msg_id = mongoose.Types.ObjectId(req.params.message_id);
		console.log('PROGRAM START');

		async.waterfall([
			function(callback){
				db.collection('msgs').findOne({'_id':msg_id},function(err,file){
					if(err) return callback(err);
					console.log(file.message);
					callback(null,file);
				});
			},
			function(msg1,callback){
				client.get('statuses/show',{id:msg1.tweet_id},function(err,tweets,response){
					if(err) return callback(err);
					console.log(tweets.text);
					callback(null,tweets);
					
				});
			}
		], function(err,result){
			if(err) return err;
			console.log('Main callback: '+ result);
			res.json(result);
			}
		);
		console.log('END PROGRAM');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});






