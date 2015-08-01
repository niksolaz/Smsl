
var express = require('express');
var Twitter = require('twitter');
var database = require('./dbModule');

var client = new Twitter({
	consumer_key:process.env.TWITTER_CONSUMER_KEY,
	consumer_secret:process.env.TWITTER_CONSUMER_SECRET,
	access_token_key:process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret:process.env.TWITTER_ACCESS_TOKEN_SECRET
});

module.exports.userTweet = function(){
	var userTweet = process.env.USER_TW_ID;
	console.log('USER_TW_ID',userTweet);
	return userTweet;
};

module.exports.get = function(msg1,callback){
				client.get('statuses/show',{id:msg1.tweet_id},function(err,tweets,response){
					if(err) return callback(err);
					console.log('From Twitter: '+tweets.text);
					callback(null,msg1,tweets);
					
				});
};

module.exports.post = function(callback){
				client.post('statuses/update',{status:msg},function(err,tweet,response){
					if(err) {
						callback(true,'Error posting Twitter');
						return;
					}
					console.log(tweet);
					callback(null,tweet);
				});
};

