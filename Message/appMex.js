var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async');
var mongoose = require('mongoose');

var DatabaseModule = require('./modules/dbModule');
var TwitterModule = require('./modules/twModule');
var FacebookModule = require('./modules/fbModule');

var app = express();

console.log(bodyParser); // check body parser 

var headers = getUrlHeaders("http://localhost");
var options = {method:"HEAD", host:"localhost", port:3000, path:"/"};
var req = http.request(options, function(res){
	console.log(JSON.stringify(res.headers));
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

console.log('Start check problem');

app.post('/message',function(req,res){
	var msg = req.body.message;
	console.log('message',msg);

	console.log('PROGRAM START');


	async.waterfall([
		// Create Twitter message
		function ( next ){
			console.log( "(App Mex) message by Twitter" );
			TwitterModule.post( msg, function twitterCallback( resultData ){
				if ( resultData.success === false ){
					next( true, resultData.error );
					return;
				}
				var twitterId = resultData.data ? resultData.data.id_str : null;
				console.log('Twitter..........'+twitterId);
				next( null, resultData.data );
			});
		},
		// Create Facebook message
		function ( twitterId, next){
			if( !twitterId ){
				next( true,"(App Mex) Error retrieving twitter data...");
				return;
			}
			
			FacebookModule.post( msg, function facebookCallback( resultData ){
				if(resultData.success === false){
					next( true, resultData.error);
					return;
				}
			
				var facebookId = resultData.data ? resultData.data.id : null;
				console.log('Facebook........'+facebookId);
				next(null, twitterId, facebookId);
			});
		},
		function (twitterId, facebookId, next){
			if( !facebookId ) {
				next( true,"(App Mex) Error retrieving facebook data..");
				return;
			}
			
			var dataToSave = {
				user_tw_id: process.env.USER_TW_ID,
				user_fb_id: process.env.USER_FB_ID,
				message: msg,
				tweet_id: twitterId,
				fb_id: facebookId
			};
			
			DatabaseModule.post(dataToSave, function databaseCallback( resultData,next){
				if(resultData.success === false){
					next( true, resultData.error);
					return;
				}
				var databaseResult = resultData.data;
				next( null, databaseResult);
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
	

app.get('/message/:message_id',function(req,res,next){
	var messageId = req.params.message_id;
	console.log('PROGRAM START');

	async.waterfall([
		function(next){
			// Database call
			console.log("(AppMex) Fetching a database record by ID");
			DatabaseModule.get(messageId, function databaseCallback( resultData ){
				if ( resultData.success === false){
					// Error calling the database
					next( true, resultData.error );
					return;
				}
				
				next(null, resultData.data); // <- Result from the database "resultData.data"
			});
		},
		function(databaseResult, next){
			// Twitter call
			if ( !databaseResult || !databaseResult.tweet_id ){
				next(true, "(App Mex) Error retrieving the tweet_id from the database...");
				return;
			} 
			
			var tweet_id = databaseResult.tweet_id;
			TwitterModule.get(tweet_id, function twitterCallback( resultData ){ 
				if ( resultData.success === false){ // Error retrieving the tweet from Twitter
					// Error calling the database
					next( true, resultData.error );
					return;
				}
				
				var twitterResult = resultData.data;
				next(null, databaseResult, twitterResult);
			});
		},
		function(databaseResult, twitterResult, next){
			/// TODO: Facebook call
			if ( !databaseResult || !databaseResult.fb_id ){
				next( true, "(App Mex) Error retrieving the fb_id from the database...");
				return;
			}
			
			var fb_id = databaseResult.fb_id;
			console.log("The facebook id is ", fb_id);
			console.log(JSON.stringify(databaseResult));
			FacebookModule.get(fb_id, function facebookCallback( resultData ){
				if( resultData.success === false){ //Error retrieving the tweet from Facebook
					// Error calling the database
					next( true, resultData.error);
					return;
				}
				
				var facebookResult = resultData.data;
				next(null,databaseResult, twitterResult, facebookResult);
			});
		},
		function(databaseResult, twitterResult, facebookResult, next){
			var finalResult = {
				db: databaseResult, 
				twitter: twitterResult,
				facebook: facebookResult
			};
			next(null, finalResult);
		}],
		function(err,result){ //<- Final function. It will return the result to the client
			if(err){
				res.json({ is_error: err, error: result});
				return;
			}
				
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