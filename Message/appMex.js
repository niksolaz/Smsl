var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async');
var mongoose = require('mongoose');

var DatabaseModule = require('./modules/dbModule');
var TwitterModule = require('./modules/twModule');
var FacebookModule = require('./modules/fbModule');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


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
				var facebookResult = resultData.data;
				var facebookId = resultData.data ? resultData.data.id : null;
				next(null, twitterId, facebookId);
			});
		},
		function (twitterId, facebookId, next){
			if( !twitterId || !facebookId) {
				next( true,"(App Mex) Error retrieving facebook data..");
				return;
			}
			
			var dataToSave = {
				message: msg,
				tweet_id: twitterId,
				fb_id: facebookId
			};
			
			DatabaseModule(dataToSave, function databaseCallback( resultData){
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
	

app.get('/message/:message_id',function(req,res){
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
				};
				
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
				};
				
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
			}
			next(null, finalResult);
		}],
		function(err,result){ //<- Final function. It will return the result to the client
			if(err){
				res.json(err);
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