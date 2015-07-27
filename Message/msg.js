var express = require('express');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var FB = require('fb');
var async = require('async');

//Database Mongodb connect with Mongoose
var mongoose = require('mongoose');

var mongoAddress = process.env.MONGO_ADDRESS; // e.g. 127.0.0.1
var mongoAddressPort = process.env.MONGO_ADDRESS_PORT || 27017; // e.g. 27017
var mongoColletion = process.env.MONGO_COLLECTION; // e.g. msgGlobal/msgs
var mongoAddressScheme = "mongodb://"
var mongoURI = mongoAddressScheme + mongoAddress + ":" + mongoAddressPort + "/" + mongoColletion;

console.log("Connecting to MongoDB at the uri: ", mongoURI);
mongoose.connect(mongoURI);

var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error: '));
db.once('connected',function(){
	console.log('Connected to the database');
});

// Example Schema 
var msgSchema = mongoose.Schema({
	user_id: String,
	user_fb_id: String,
	message: String,
	tweet_id: String,
	fb_id: String
});

var MSG = mongoose.model('MSG',msgSchema);
//NOTE: with process.env.USER_ID register my id 
var userTweet = process.env.USER_TW_ID;
console.log('USER_TW_ID',userTweet);
var userfb =process.env.USER_FB_ID;
console.log('USER_FB_ID',userfb);

var app = express();

//Twitter
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

	console.log('PROGRAM STARøT');

	async.waterfall([
		function(callback){
			client.post('statuses/update',{status:msg},function(err,tweet,response){
				if(err) {
					callback(true,'Error posting Twitter');
					return;
				}
				console.log(tweet);
				callback(null,tweet);
			});
		},
		function(tweet,callback){
			
			FB.setAccessToken(process.env.ACCESS_TOKEN);
			FB.api('/me/feed', 'post',{message:msg}, function (res) {
				if(!res || res.error) {
					console.log(!res ? 'error occurred' : res.error);
    				console.log('Error posting Facebook');
    				callback(true,res.error);
    				return;
  				}  					
  			console.log('Post Id: ' + res.id);
  			callback(null,res,tweet)
			});
		},
		function(tweet,callback){
			var msgSocial = new MSG({
				user_tw_id: userTweet,
				user_fb_id: userfb,
				message: msg, 
				tweet_id: id_str, 
				fb_id: id
			});
			console.log(msgSocial.user_tw_id, msgSocial.user_fb_id, msgSocial.message, msgSocial.tweet_id, msgSocial.fb_id);
			msgTweet.save(function(err,file){  
				if(err) {
					callback(true,'Error saving the user in MongoDB');
					return;
				}
				console.log('User saved successfully!')
				callback(null,file);	
			});
			
		}
	], function(err,result){
			 if(err){
			 	res.json({'error':result});
			 }else{
			 	console.log('Main callback: '+ result);
			 	res.json(result);
			 }
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
