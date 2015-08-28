var Twitter = require('twitter');

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

module.exports.get = function( tweetId, moduleCallback){
	var result = {
		success: true,
		data: null,
		error: null
	};
	
	client.get('statuses/show',{ id: tweetId },function( err, tweet, response){
		if( err ){
			console.log("(Twitter) Error loading a tweet...");
			result.success = false;
			result.error = err;
			moduleCallback( result );
			return;
		}
		
		console.log("(Twitter) Returning the tweets: " + JSON.stringify(tweet));
		result.success = true;
		result.data = tweet;
		moduleCallback( result );
	});
};

module.exports.post = function( twitterStatus, moduleCallback){
	var result = {
		success: true,
		data: null,
		error: null
	};
	
	client.post('statuses/update', { status: twitterStatus }, function( err, tweet, response){
		if( err ){
			console.log("(Twitter) Error posting a tweet...");
			result.success = false;
			result.error = err;
			moduleCallback( result );
			return;
		}
		console.log("(Twitter) Returning the tweet", JSON.stringify(tweet));
		
		result.success = true;
		result.data = [tweet.id_str,tweet.id,tweet.data];
		moduleCallback( result );
	});
};

