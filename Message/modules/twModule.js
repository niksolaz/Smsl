
var express = require('express');
var Twitter = require('twitter');
var dbModule = require('./dbModule');
var fbModule = require('./fbModule');

var client = new Twitter({
	consumer_key:process.env.TWITTER_CONSUMER_KEY,
	consumer_secret:process.env.TWITTER_CONSUMER_SECRET,
	access_token_key:process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret:process.env.TWITTER_ACCESS_TOKEN_SECRET
});

module.exports.userTweet = function(){
	var userTweet = process.env.USER_TW_ID;
	
	console.log('(Twitter) Twitter id: ', userTweet);
	return userTweet;
};

module.exports.get = function(msg, callback){
	client.get('statuses/show',{ id:msg.tweet_id },function( err, tweet, response){
		if(err) return callback(err);
		
		console.log('(Twitter) Returning the tweets: ' + JSON.stringify(tweet));
		callback( null, msg, tweet);
		
	});
};

module.exports.post = function(msg, callback){
	client.post('statuses/update', { status:msg }, function( err, tweet, response){
		if(err) {
			callback(true,'Error posting Twitter');
			return;
		}
		console.log("(Twitter) Returning the tweet", JSON.stringify(tweet));
		callback(null,tweet);
	});
};

